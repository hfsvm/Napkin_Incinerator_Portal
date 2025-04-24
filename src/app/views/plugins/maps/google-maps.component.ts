
 
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import * as maplibregl from 'maplibre-gl';
import { Subscription, interval } from 'rxjs';


@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss']
})
export class GoogleMapsComponent implements OnInit, AfterViewInit {
  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];
  isLoading = false;
  errorMessage = '';
  filterPanelOpen = true;
  dropdownOpen: { [key: string]: boolean } = {};
  machineSearchTerm: string = '';
  districtSearchTerm: string = '';
  stateSearchTerm: string = '';
  stockOptions = [
    { label: 'Empty', value: 0 },
    { label: 'Low', value: 1 },
    { label: 'Full', value: 2 }
  ];
 
 
  // Filters
  stockStatusFilter = new FormControl<string[]>([]);
  buttonStatusFilter = new FormControl<string[]>([]);
  machineStatusFilter = new FormControl<string[]>([]);
  stateFilter = new FormControl<string[]>([]);
  districtFilter = new FormControl<string[]>([]);
  machineFilter = new FormControl<string[]>([]);
 
  machines: any[] = [];
  states: string[] = [];
  districts: string[] = [];
  merchantId: string = '';

  stateDistrictMap: { [state: string]: string[] } = {};


  private autoRefreshSubscription!: Subscription;
private refreshInterval = 120; // refresh interval in seconds
private countdownInterval!: any;
refreshCountdown = 0;


 
  constructor(
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.merchantId = this.commonDataService.merchantId ?? '';
 
    // Simulate a page reload
    if (!sessionStorage.getItem('reloaded')) {
      sessionStorage.setItem('reloaded', 'true');
      window.location.reload();
    } else {
      sessionStorage.removeItem('reloaded');
      this.loadMachineData();
    }

      // Start auto-refresh functionality
  this.startAutoRefresh();
  
  // Start the countdown
  this.startRefreshCountdown();

 
    document.addEventListener('click', this.handleClickOutside.bind(this));

      // Subscribe to state filter changes to dynamically update districts
  this.stateFilter.valueChanges.subscribe((selectedStates: string[] | null) => {
    if (selectedStates) {
      const districtsSet = new Set<string>();
      selectedStates.forEach(state => {
        (this.stateDistrictMap[state] || []).forEach(d => districtsSet.add(d));
      });
      this.districts = Array.from(districtsSet);
      this.districtFilter.setValue([]); // Clear district selection when state changes
    }
  });

  }


  ngOnDestroy() {
    // Clean up subscriptions and intervals
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
  }

  
  stateSearchText: string = ''; // Bind this to the input field
 
  ngAfterViewInit(): void {

      this.setupCustomPopupCloseHandler();

    setTimeout(() => {
      this.initializeMap(); // Call the new initializeMap method
    }, 500);
  }


  // Add these methods to implement the auto-refresh functionality
startAutoRefresh(): void {
  // Refresh every 2 minutes (120,000 milliseconds)
  this.autoRefreshSubscription = interval(120000).subscribe(() => {
    console.log('🔄 Auto-refreshing data...');
    this.loadMachineData(); // Replace with your data fetching method name
    this.resetRefreshCountdown();
  });
}

startRefreshCountdown(): void {
  this.refreshCountdown = this.refreshInterval;
  this.countdownInterval = setInterval(() => {
    this.refreshCountdown--;
    if (this.refreshCountdown <= 0) {
      this.refreshCountdown = this.refreshInterval;
    }
  }, 1000);
}

get formattedRefreshTime(): string {
  const minutes = Math.floor(this.refreshCountdown / 60).toString().padStart(1, '0');
  const seconds = (this.refreshCountdown % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

resetRefreshCountdown(): void {
  this.refreshCountdown = this.refreshInterval;
}

// Manually trigger refresh (you can call this from a button if needed)
manualRefresh(): void {
  this.loadMachineData(); // Replace with your data fetching method name
  this.resetRefreshCountdown();
}

 
  // New method to initialize the map
  initializeMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
      center: [78.9629, 20.5937],
      zoom: 5
    });
 
    this.map.on('load', () => {
      this.map.resize();
      this.updateMap();
      console.log('Map bounds:', this.map.getBounds());
    });
 
    this.map.on('moveend', () => this.updateMap());
    this.map.on('zoomend', () => this.updateMap());
  }


    // 🔧 These are the missing methods
zoomIn(): void {
  if (this.map) {
    this.map.zoomIn();
  }
}

zoomOut(): void {
  if (this.map) {
    this.map.zoomOut();
  }
}


searchTexts: { [key: string]: string } = {};
  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }
 
  loadMachineData(): void {
    this.isLoading = true;
    this.errorMessage = '';
 
    const userDetails = this.commonDataService.userDetails;
    const machineIds = userDetails?.machineId ?? [];
    const clientId = userDetails?.clientId ?? '';  // Extract clientId from userDetails
 
    const queryParams: any = {
      merchantId: this.merchantId,
      machineId: this.machineFilter.value?.length ? this.machineFilter.value : machineIds,
      machineStatus: this.machineStatusFilter.value?.length ? this.machineStatusFilter.value : ['1', '2'],
      stockStatus: this.stockStatusFilter.value?.length ? this.stockStatusFilter.value : [],
      burnStatus: this.buttonStatusFilter.value?.length ? this.buttonStatusFilter.value : [],
      level1: this.stateFilter.value?.length ? this.stateFilter.value : userDetails?.state || [],
      level2: this.districtFilter.value?.length ? this.districtFilter.value : userDetails?.district || [],
      level3: clientId ? [clientId] : []  // Pass clientId into level3 if it's available
    };
 
    console.log('📡 API Call Params:', queryParams);
 
    this.dataService.getMachineDashboardSummary(queryParams).subscribe(
      (response: any) => {
        console.log('✅ API Response:', response);
 
        if (response?.code === 200 && response.data) {
          this.machines = response.data.machines.map((machine: any) => ({
            ...machine,
            stockStatus: this.mapStockStatus(machine.stockStatus),
            burnStatus: this.mapBurnStatus(machine.burningStatus),
            state: machine.level1 ?? 'Unknown',
            district: machine.level2 ?? 'Unknown',
            burningCycles: machine.burningCycles ?? 0,
            totalBurningCycles: machine.totalBurningCycles ?? 0,
            totalBurningCount: machine.totalburningCount ?? 0,
            itemsBurnt: machine.itemsBurnt ?? 0,
            itemsDispensed: machine.itemsDispensed ?? 0,
            collection: machine.collection ?? 0,
            imsi: machine.imsi ?? 'N/A',
            rssi: machine.rssi ?? 'N/A',
            location: machine.latitude && machine.longitude
              ? [parseFloat(machine.longitude), parseFloat(machine.latitude)]
              : null
          }));
 

          this.states = [...new Set(this.machines.map(m => m.state).filter(Boolean))];

this.stateDistrictMap = {};
this.machines.forEach(machine => {
  const state = machine.state;
  const district = machine.district;
  if (state && district) {
    if (!this.stateDistrictMap[state]) {
      this.stateDistrictMap[state] = [];
    }
    if (!this.stateDistrictMap[state].includes(district)) {
      this.stateDistrictMap[state].push(district);
    }
  }
});

 
          this.updateMap();
        } else {
          console.warn('⚠️ No valid data received.');
        }
 
        this.isLoading = false;
      },
      (error) => {
        console.error('❌ API Call Failed:', error);
        this.isLoading = false;
      }
    );
  }
 
  mapBurnStatus(burnStatus: string | null): number {
    return burnStatus?.toLowerCase() === 'burning' ? 2 : 1;
  }
 
  mapStockStatus(stockStatusArray: any[]): number {
    if (!Array.isArray(stockStatusArray) || stockStatusArray.length === 0) return -1;
 
    const stockStatus = stockStatusArray[0]?.SpringStatus; // Extract first element
    console.log("Extracted Stock Status:", stockStatus);
 
    switch (stockStatus) {
      case 'Ok': return 2;
      case 'Low Stock': return 1;
      case 'No Stock': return 0;
      default: return -1;
    }
  }
 

  setupCustomPopupCloseHandler(): void {
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target && target.classList.contains('custom-close-btn')) {
        console.log('Custom close button clicked');
        
        const machineId = target.getAttribute('data-machine-id');
        const popupElement = target.closest('.maplibregl-popup');
  
        if (popupElement) {
          this.closePopup(popupElement, machineId);
        }
      }
    // Only close when clicking outside popup AND not on the map
    else if (!target.closest('.maplibregl-popup') && 
             !target.closest('.maplibregl-canvas-container') && 
             !target.closest('.maplibregl-map')) {
      
      // User clicked outside any popup and not on the map - close all popups
      const popups = document.querySelectorAll('.maplibregl-popup');
      if (popups.length > 0) {
        popups.forEach(popup => {
          // Your existing code for closing popups...
          // [...]
        });
      }
    }
  });
}

  

  // Add a helper method to close popups
closePopup(popupElement: Element, machineId: string | null): void {
  // Try to find the marker associated with this popup
  if (machineId) {
    const marker = this.markers.find(m => {
      const popup = m.getPopup();
      return popup && popup._content.innerHTML.includes(`data-machine-id="${machineId}"`);
    });
    
    // Close the popup through the marker if possible
    if (marker) {
      marker.getPopup().remove();
      console.log(`Closed popup for machine: ${machineId} via marker`);
      return;
    }
  }
  
  // Fallback: Remove popup from DOM directly
  popupElement.remove();
  console.log(`Closed popup via direct DOM removal`);
}

     
updateMap(): void {
console.log("🔄 updateMap() called!");

// Clear old markers
this.markers.forEach(marker => marker.remove());
this.markers = [];

// Get selected filters
const selectedStates = this.stateFilter.value || [];
const selectedDistricts = this.districtFilter.value || [];
const selectedMachines = this.machineFilter.value || [];
const selectedStockStatuses = this.stockStatusFilter.value || [];
const selectedMachineStatuses = this.machineStatusFilter.value || [];
const selectedBurnStatusesRaw = this.buttonStatusFilter.value || [];  // Convert to string


console.log("🔥 Raw Burn Status Filter Value:", selectedBurnStatusesRaw);
  // 🔹 Map burn status labels (e.g., "Burning", "Idle") to numeric values (1, 0)
  const burnStatusMapping: Record<string, number> = {
    "Burning": 2,
    "Idle": 1
};

const selectedBurnStatuses = selectedBurnStatusesRaw.map((status: string) => burnStatusMapping[status]).filter(v => v !== undefined);

console.log("🔥 Selected Burn Statuses (Mapped):", selectedBurnStatuses);
console.log("🔥 Burn Status in Machines:", this.machines.map(m => `${m.machineId}: ${m.burnStatus}`));


console.log("🗺️ Selected Filters:", {
  selectedStates,
  selectedDistricts,
  selectedMachines,
  selectedStockStatuses,
  selectedMachineStatuses,
  selectedBurnStatuses
});


    // ✅ Log Burn Status in Machines
    console.log("🔥 Checking burnStatus values in machines:");
    this.machines.forEach(machine => console.log(`Machine ID: ${machine.machineId}, Burn Status: ${machine.burnStatus}`));


// ✅ Apply filtering with consistent value types
const filteredMachines = this.machines.filter(machine =>
  (selectedStates.length === 0 || selectedStates.includes(machine.level1)) &&
  (selectedDistricts.length === 0 || selectedDistricts.includes(machine.level2)) &&
  (selectedMachines.length === 0 || selectedMachines.includes(machine.machineId)) &&
  (selectedStockStatuses.length === 0 || selectedStockStatuses.includes(machine.stockStatus)) &&
  (selectedMachineStatuses.length === 0 || selectedMachineStatuses.includes(machine.status)) &&
  (selectedBurnStatuses.length === 0 || selectedBurnStatuses.includes(machine.burnStatus)) // Ensure comparison is consistent
);

console.log("🔍 Filtered Machines:", filteredMachines);

if (filteredMachines.length === 0) {
  console.warn("⚠️ No matching machines found based on filters.");
}

// Handle overlapping markers
const locationMap = new Map<string, number>();

filteredMachines.forEach(machine => {
  if (!machine.location) return;

  const [lng, lat] = machine.location;
  const key = `${lng},${lat}`;

  if (locationMap.has(key)) {
    const count = locationMap.get(key)! + 1;
    locationMap.set(key, count);

    const angle = (count * 45) * (Math.PI / 180);
    const radius = 0.000001 * count;
    machine.location = [
      lng + radius * Math.cos(angle),
      lat + radius * Math.sin(angle)
    ];
  } else {
    locationMap.set(key, 1);
  }

  // Set marker icon dynamically based on stock status
  const iconUrl = this.getStockStatusIcon(machine.stockStatus);

  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  markerElement.style.backgroundImage = `url(${iconUrl})`;
  markerElement.style.width = '40px';
  markerElement.style.height = '40px';
  markerElement.style.backgroundSize = 'contain';
  markerElement.style.backgroundRepeat = 'no-repeat';


// In your updateMap method, create the popup with closeButton: false
const popup = new maplibregl.Popup({
  closeButton: false,  // Disable default close button, we'll use our custom one
  closeOnClick: true  // Disable closing when clicking map
}).setHTML(this.generatePopupHTML(machine));

  // Create marker
  const newMarker = new maplibregl.Marker({ element: markerElement })
    .setLngLat(machine.location)
    // .setPopup(new maplibregl.Popup().setHTML(this.generatePopupHTML(machine)))
    .setPopup(popup)
    .addTo(this.map);

  this.markers.push(newMarker);


  
}); 

console.log("✅ Markers updated. Current count:", this.markers.length);


}
 
  getStockStatusIcon(status: number): string {
    switch (status) {
      case 2: return './assets/img/icon/green2.png';
      case 1: return './assets/img/icon/yellow2.png';
      case 0: return './assets/img/icon/red2.png';
      default: return './assets/img/icon/pad1.png';
    }
  }
 
  get machineIds(): string[] {
    return this.machines.map(machine => machine.machineId);
  }
 
 
  generatePopupHTML(machine: any): string {
    // Convert stock status number to text
let stockStatusText = 'Unknown';
switch (machine.stockStatus) {
case 0: stockStatusText = 'Empty'; break;
case 1: stockStatusText = 'Low'; break;
case 2: stockStatusText = 'Full'; break;
}

// Convert burning status number to text
let burningStatusText = 'Unknown';
switch (machine.burnStatus) {
case 1: burningStatusText = 'Idle'; break;
case 2: burningStatusText = 'Burning'; break;
}

  return `

<div style="position: relative; padding: 5px; background: white;">
  
  <!-- Close Button -->
  <button class="custom-close-btn" data-machine-id="${machine.machineId}" 
          style="position: absolute; top: 0px; right: 0px; background: #fff; border: 1px solid #ccc; 
                 width: 24px; height: 24px; border-radius: 10%; cursor: pointer; 
                 display: flex; align-items: center; justify-content: center; font-size: 16px;">
    ×
  </button>

  <!-- Card Content -->
  <h3 style="margin: 0 0 8px 0;">📍 Vending Machine</h3>
     <p><strong>Machine ID:</strong> ${machine.machineId}</p>
    <p><strong>State:</strong> ${machine.state}</p>
    <p><strong>District:</strong> ${machine.district}</p>
    <p><strong>Status:</strong> ${machine.status}</p>
    <p><strong>Stock Status:</strong> ${stockStatusText}</p>
    <p><strong>Burning Status:</strong> ${burningStatusText}</p>
    <p><strong>Total Collection:</strong> ₹${machine.collection}</p>
    <p><strong>Items Dispensed:</strong> ${machine.itemsDispensed}</p>
    <p><strong>Address:</strong> ${machine.address}</p></div>`;
}

    // toggleDropdown(filterKey: string): void {
    //   this.dropdownOpen[filterKey] = !this.dropdownOpen[filterKey];
    //   this.cdr.detectChanges();
    // }before adding the dropdwon fix
    toggleDropdown(filterKey: string): void {
      const isCurrentlyOpen = this.dropdownOpen[filterKey];
   
 
      Object.keys(this.dropdownOpen).forEach(key => {
        this.dropdownOpen[key] = false;
      });
   
 
      this.dropdownOpen[filterKey] = !isCurrentlyOpen;
   
      this.cdr.detectChanges();
    }
    toggleSelectAll(filterControl: FormControl, items: string[]): void {
      const allSelected = filterControl.value.length === items.length;
      filterControl.setValue(allSelected ? [] : [...items]); // Toggle selection
      console.log(`🔹 Updated ${filterControl} Selection: ${filterControl.value}`);

      this.updateMap();
    }
         
    toggleSelection(filterControl: FormControl, value: number): void {
      let selectedValues = filterControl.value || [];
   
      if (selectedValues.includes(value)) {
        selectedValues = selectedValues.filter((v : string | number) => v !== value);
        console.log("updated selectedValues", selectedValues);
      } else {
        selectedValues.push(value);
      }
   
      filterControl.setValue(selectedValues);
      console.log(`🔹 Updated Filter Selection: ${selectedValues}`);

      this.updateMap();
    }
         
    refreshFilters(): void {
      console.log('🔄 Refreshing Filters and clearing selections...');
   
      // Reset all filter FormControls to empty arrays
      this.stateFilter.setValue([]);
      this.districtFilter.setValue([]);
      this.machineFilter.setValue([]);
      this.stockStatusFilter.setValue([]);
      this.buttonStatusFilter.setValue([]);
      this.machineStatusFilter.setValue([]);
   
      // Optionally reset dropdown states
      this.dropdownOpen = {};
   
      // Trigger data reload
      this.loadMachineData();
    }
             
    handleClickOutside(event: MouseEvent): void {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      if (target.closest('.dropdown-toggle') || target.closest('.dropdown-menu')) return;
 
      Object.keys(this.dropdownOpen).forEach(key => {
        this.dropdownOpen[key] = false;
      });
 
      this.cdr.detectChanges();
    }
  }
