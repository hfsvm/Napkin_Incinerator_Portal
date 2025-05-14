
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import * as maplibregl from 'maplibre-gl';
import { Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';


import * as _ from 'lodash';



interface Machine {
  machineId: string;
  zone?: string;
  zonelatitude?: number;
  zonelongitude?: number;
  ward?: string;
  wardlatitude?: number;
  wardlongitude?: number;
  beat?: string;
  beatlatitude?: number;
  beatlongitude?: number;
  latitude?: number;
  longitude?: number;
  status: string;
  stockStatus?: {
    SpringStatus: string;
    [key: string]: any;
  }[];
  level1?: string;
  level2?: string;
  burningStatus?: string;
  [key: string]: any;
}

interface DashboardData {
  machines: Machine[];
  [key: string]: any;
}



interface Beat {
  beat: string;
  machines: string[];
}
 
interface Ward {
  ward: string;
  beats: Beat[];
}
 
interface Zone {
  zone: string;
  wards: Ward[];
}
 
interface District {
  district: string;
  zones: Zone[];
}
 
interface State {
  state: string;
  districts: District[];
}
 
interface Project {
  projectName: string;
  states: State[];
}



@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss']
})
export class GoogleMapsComponent implements OnInit, AfterViewInit {

  
  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];
  filterPanelOpen = true;
  //dropdownOpen: { [key: string]: boolean } = {};
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


    // New filter FormControls
    zoneFilter = new FormControl<string[]>([]);
    wardFilter = new FormControl<string[]>([]);
    beatFilter = new FormControl<string[]>([]);
  
 

  states: string[] = [];
  districts: string[] = [];
  merchantId: string = '';
  
    
    stateDistrictMap: { [state: string]: string[] } = {};
    districtZoneMap: { [district: string]: string[] } = {};
    zoneWardMap: { [zone: string]: string[] } = {};
    wardBeatMap: { [ward: string]: string[] } = {};
    beatMachineMap: { [beat: string]: string[] } = {};

    userId: number = 0;

    clientId!: number;
    projectId!: number;


    selectedMapView: string = 'machine'; // Default view is machine-level

  
    zones1: string[] = [];
    selectedZone1: string = '';
  
    machines1: any[] = [];


private autoRefreshSubscription!: Subscription;
private refreshInterval = 120; // refresh interval in seconds
private countdownInterval!: any;
refreshCountdown = 0;

// map data start
isLoading = false;
errorMessage = '';
machines: any[] = [];
filteredMachines: any[] = [];
userRole: string = ''; // Stores the role of the logged-in user
isAdmin: boolean = false;
isStateUser: boolean = false;
isDistrictUser: boolean = false;
isEndUser: boolean = false;
currentPage: number = 1;
itemsPerPage: number = 10;
paginatedMachines: any[] = [];
searchQuery: string = '';
searchText: { [key: string]: string } = {
  projects: '',
  machineStatuses: '',
  stockStatuses: '',
  burnStatuses: '',
  zones: '',
  wards: '',
  beats: ''
};
machineStatuses = [
  { key: '1', value: 'Online' },
  { key: '2', value: 'Offline' }
];
stockStatuses = [
  { key: '2', value: 'Full (Ok)' },
  { key: '0', value: 'Empty' },
  { key: '1', value: 'Low' }
];
burnStatuses = [
  { key: '1', value: 'Idle' },
  { key: '2', value: 'Burning' }
];
selectedMachineStatuses: string[] = ['1', '2'];
selectedStockStatuses: string[] = [];
selectedBurnStatuses: string[] = [];
dropdownOpen: any = {};
fullData: any[] = [];
hierarchicalData: any[] = [];
selectedProjects: any[] = [];
selectedZones: any[] = [];
selectedWards: any[] = [];
selectedSubZones: any[] = [];
selectedWardList: any[] = [];
selectedBeatList: any[] = [];
selectedBeats: any[] = [];
projects: any[] = [];
zones: any[] = [];
wards: any[] = [];
subZones: any[] = [];
wardList: any[] = [];
beatList: any[] = [];
beats: any[] = [];
userDatadetails: any[] = [];
hierarchySelection: {
  state: string[];
  district: string[];
  zone: string[];
  ward: string[];
  beat: string[];
  project: string[];
} = {
  state: [],
  district: [],
  zone: [],
  ward: [],
  beat: [],
  project: [],
};
dashboardData: any = {};
columnFilters: any = {
  'Machine ID': '',
  'Location Name': '',
  'Location Address': '',
  "UID": '',
  'Machine Type': '',
  'Status': '',
  'Stock Status': '',
  'Burning Status': ''
};
sortKey: string = '';
sortDirection: 'asc' | 'desc' = 'asc';
initialZones: string[] = [];
initialWards: string[] = [];
initialBeats: string[] = [];
initialProjects: { ProjectId: number, projectname: string }[] = [];
projectsList: any[] = [];
statesList: any[] = [];
districtsList: any[] = [];
machinesList: any[] = [];
  clientFilter: any;

//map data end


 
  constructor(
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}



  
 
  ngOnInit(): void {
    this.merchantId = this.commonDataService.merchantId ?? '';
    this.userId = this.commonDataService.userId ?? 0;

    // this.loadInitialData();


    if (!sessionStorage.getItem('reloaded')) {
      sessionStorage.setItem('reloaded', 'true');
      window.location.reload();
    } else {
      sessionStorage.removeItem('reloaded');
      this.loadHierarchicalData();
      // this.loadMachineData();
    }
    this.loadHierarchicalData();

     this.loadMachineData();

      // Start auto-refresh functionality
  this.startAutoRefresh();
  
  // Start the countdown
  this.startRefreshCountdown();

 
    document.addEventListener('click', this.handleClickOutside.bind(this));

    // Subscribe to state filter changes
    this.stateFilter.valueChanges.subscribe((selectedStates: string[] | null) => {
      if (selectedStates) {
        // Update districts based on selected states
        this.updateDistrictsFromStates(selectedStates);
        
        // Clear dependent filters
        this.districtFilter.setValue([]);
        this.zoneFilter.setValue([]);
        this.wardFilter.setValue([]);
        this.beatFilter.setValue([]);
        this.machineFilter.setValue([]);
      }
    });

    // Subscribe to district filter changes
    this.districtFilter.valueChanges.subscribe((selectedDistricts: string[] | null) => {
      if (selectedDistricts) {
        // Update zones based on selected districts
        this.updateZonesFromDistricts(selectedDistricts);
        
        // Clear dependent filters
        this.zoneFilter.setValue([]);
        this.wardFilter.setValue([]);
        this.beatFilter.setValue([]);
        this.machineFilter.setValue([]);
      }
    });
    
    // Subscribe to zone filter changes
    this.zoneFilter.valueChanges.subscribe((selectedZones: string[] | null) => {
      if (selectedZones) {
        // Update wards based on selected zones
        this.updateWardsFromZones(selectedZones);
        
        // Clear dependent filters
        this.wardFilter.setValue([]);
        this.beatFilter.setValue([]);
        this.machineFilter.setValue([]);
      }
    });
    
    // Subscribe to ward filter changes
    this.wardFilter.valueChanges.subscribe((selectedWards: string[] | null) => {
      if (selectedWards) {
        // Update beats based on selected wards
        this.updateBeatsFromWards(selectedWards);
        
        // Clear dependent filter
        this.beatFilter.setValue([]);
        this.machineFilter.setValue([]);
      }
    });
    
    // Subscribe to beat filter changes
    this.beatFilter.valueChanges.subscribe((selectedBeats: string[] | null) => {
      if (selectedBeats) {
        // Update machines based on selected beats
        this.updateMachinesFromBeats(selectedBeats);
        
        // Don't clear machine filter, just update available options
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



  // navigateTo(destination: string): void {
  //   // Empty logic placeholder
  //   console.log('Navigating to:', destination);
  // }


  
  stateSearchText: string = ''; // Bind this to the input field
 
  ngAfterViewInit(): void {

      this.setupCustomPopupCloseHandler();

      this.initializeMap(); // Call the new initializeMap method
  }



  // Load hierarchical data from API
  loadHierarchicalData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log(`📡 Loading hierarchical data for merchant ${this.merchantId} and user ${this.userId}`);

    
    this.dataService.getUserDetailsByHierarchy(this.merchantId, this.userId).subscribe(
      (response: any) => {
        console.log('✅ Hierarchy API Response:', response);
        
        if (response?.code === 200 && response.data) {

          console.log('✅✅✅✅✅✅Hierarchy API Response:', response);

          this.hierarchicalData = response.data;
          this.fullData = response.data.projects;

          this.projects = this.fullData.map((p: any) => ({
            ProjectId: p.projectId,
            projectname: p.projectName
          }));


          this.clientId = response.data.clientId;
          this.projectId = response.data.projects?.[0]?.projectId;
          console.log('📌 Extracted projectId:', this.projectId);

                  // Extract unique zones from the machines array
                  this.extractUniqueZones();


      // 🛠 Ensure both values are not accidentally set the same unless it's valid
      console.log('📌 Extracted clientId:', this.clientId);


      //this.processHierarchicalData();
          this.loadMachineData(); // Load machine data after hierarchy is processed
        } else {
          console.warn('⚠️ No valid hierarchy data received.');
          this.isLoading = false;
          this.errorMessage = 'Failed to load user hierarchy data.';
        }
      },
      (error) => {
        console.error('❌ Hierarchy API Call Failed:', error);
        this.isLoading = false;
        this.errorMessage = 'Error loading hierarchy data: ' + (error.message || 'Unknown error');
      }
    );
  }
  
  

  isBmcClient = false;
disabledStates = false;
disabledDistricts = false;


checkIfClientIsBMC_Map(): void {
  const selectedProject = this.projects.find(p => this.selectedProjects.includes(p.ProjectId));
  this.isBmcClient = !!(selectedProject?.projectname?.toLowerCase() === 'bmc');

  if (this.isBmcClient) {
    const project = this.fullData.find(p => p.projectName.toLowerCase().includes('bmc'));

    // Auto-select all zones (states) and wards (districts)
    this.selectedZones = project?.states?.map((s: any) => s.state) || [];
    this.selectedWards = project?.states?.reduce((acc: string[], stateObj: any) => {
      stateObj.districts?.forEach((districtObj: any) => {
        if (!acc.includes(districtObj.district)) {
          acc.push(districtObj.district);
        }
      });
      return acc;
    }, []);

    this.disabledStates = true;
    this.disabledDistricts = true;
  } else {
    this.selectedZones = [];
    this.selectedWards = [];
    this.disabledStates = false;
    this.disabledDistricts = false;
  }
}


  
  // Update districts based on selected states
  updateDistrictsFromStates(selectedStates: string[]): void {
    const districtsSet = new Set<string>();
    selectedStates.forEach(state => {
      (this.stateDistrictMap[state] || []).forEach(district => districtsSet.add(district));
    });
    this.districts = Array.from(districtsSet);
    console.log('📊 Updated districts based on states:', this.districts);
  }
  
  // Update zones based on selected districts
  updateZonesFromDistricts(selectedDistricts: string[]): void {
    const zonesSet = new Set<string>();
    selectedDistricts.forEach(district => {
      (this.districtZoneMap[district] || []).forEach(zone => zonesSet.add(zone));
    });
    this.zones = Array.from(zonesSet);
    console.log('📊 Updated zones based on districts:', this.zones);
  }
  
  // Update wards based on selected zones
  updateWardsFromZones(selectedZones: string[]): void {
    const wardsSet = new Set<string>();
    selectedZones.forEach(zone => {
      (this.zoneWardMap[zone] || []).forEach(ward => wardsSet.add(ward));
    });
    this.wards = Array.from(wardsSet);
    console.log('📊 Updated wards based on zones:', this.wards);
  }
  
  // Update beats based on selected wards
  updateBeatsFromWards(selectedWards: string[]): void {
    const beatsSet = new Set<string>();
    selectedWards.forEach(ward => {
      (this.wardBeatMap[ward] || []).forEach(beat => beatsSet.add(beat));
    });
    this.beats = Array.from(beatsSet);
    console.log('📊 Updated beats based on wards:', this.beats);
  }
  
  // Update machines based on selected beats
  updateMachinesFromBeats(selectedBeats: string[]): void {
    const machinesSet = new Set<string>();
    selectedBeats.forEach(beat => {
      (this.beatMachineMap[beat] || []).forEach(machine => machinesSet.add(machine));
    });
    // Update machine options but don't set the filter value
    this.machines = Array.from(machinesSet);
    console.log('📊 Updated available machines based on beats:',this.machines);
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

        // Default coordinates for India
        let centerCoordinates: [number, number] = [78.9629, 20.5937];
        let zoomLevel: number = 4.3;
    
        // Check if user ID is 90, then show Mumbai map
        if (this.userId === 90) {
          centerCoordinates = [72.8777, 19.0760]; // Mumbai coordinates
          zoomLevel = 10;
        }
    
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
      // center: [78.9629, 20.5937],
      // zoom: 4.3
      center: centerCoordinates,
      zoom: zoomLevel

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
 


  



//   loadMachineData() {
//     this.isLoading = true;
//     this.errorMessage = '';
 
//     const merchantId = this.commonDataService.merchantId ?? '';
//     const userDetails = this.commonDataService.userDetails;

//     const userDetail = this.userDatadetails;
// // console.log("123456789000000000==>",      [...this.hierarchySelection.state] )

// //     console.log("123456789000000000==>",[...this.selectedBeatList])
//     const queryParams: any = {
      
    
//       merchantId,
//       // machineId: this.selectedBeats.length > 0 ? [...this.selectedBeats] : [...userDetails.machineId],
//       machineStatus: this.selectedMachineStatuses.length > 0 ? [...this.selectedMachineStatuses] : ['1', '2'],
//       stockStatus: this.selectedStockStatuses.length > 0 ? [...this.selectedStockStatuses] : [],
//       burnStatus: this.selectedBurnStatuses.length > 0 ? [...this.selectedBurnStatuses] : [],
//       // level1: this.selectedZones.length > 0 ? [...this.selectedZones] : [],
//       // level2: this.selectedWards.length > 0 ? [...this.selectedWards] : [],
//       level3: [], // Default to empty array
//       // level4: this.selectedProjects.length > 0 ? [...this.selectedProjects] : [], // Added from second code

//   // Pass only selected filters, not all possible ones

//   state: this.hierarchySelection.state.length > 0 ? [...this.hierarchySelection.state] : [],
//   district: this.hierarchySelection.district.length > 0 ? [...this.hierarchySelection.district] : [],
//   zone: this.hierarchySelection.zone.length > 0 ? [...this.hierarchySelection.zone] : [],
//   ward: this.hierarchySelection.ward.length > 0 ? [...this.hierarchySelection.ward] : [],
//   beat: this.hierarchySelection.beat.length > 0 ? [...this.hierarchySelection.beat] : [],
  

//       client:userDetails.clientId,
//       project:  userDetails.projectId
//     };
//       // Include machine selection if available
//   if (this.selectedBeats.length > 0) {
//     queryParams.machineId = [...this.selectedBeats];
//   }


//     console.log("query ", queryParams)

//     console.log("machinedata dasboard clientid ", userDetails)
 
//   this.dataService.getMachineDashboardSummary(queryParams).subscribe(
//     (response: any) => {
//       console.log('✅ API Response:', response);
 
//       if (response?.code === 200 && response.data) {
//         this.updateMap(); // Refresh map markers

//         // Add debugging to see raw data from API
//         console.log('🔍 Raw Machine Data from API:', response.data.machines.slice(0, 3));
        
//         this.machines = response.data.machines.map((machine: any) => {
//           // CRITICAL FIX: Use the correct field names from API response
//           // The API might be returning level1/level2 in different fields than expected
//           const state = machine.level1 || machine.state || '';
//           const district = machine.level2 || machine.district || '';
          
//           console.log("❌❌❌❌❌❌",`Machine ${machine.machineId} - Raw level1: ${machine.level1}, Raw state: ${machine.state}`);
          
//           const mappedMachine = {
//             ...machine,
//             stockStatus: this.mapStockStatus(machine.stockStatus),
//             burnStatus: this.mapBurnStatus(machine.burningStatus),

//             // Fix: Explicitly assign state and district from API response
//             state: state,
//             district: district,
//             zone: machine.zone || '',
//             ward: machine.ward || '',
//             beat: machine.beat || '',

//             burningCycles: machine.burningCycles ?? 0,
//             totalBurningCycles: machine.totalBurningCycles ?? 0,
//             totalBurningCount: machine.totalburningCount ?? 0,
//             itemsBurnt: machine.itemsBurnt ?? 0,
//             itemsDispensed: machine.itemsDispensed ?? 0,
//             collection: machine.collection ?? 0,
//             imsi: machine.imsi ?? 'N/A',
//             rssi: machine.rssi ?? 'N/A',
//             location: machine.latitude && machine.longitude
//               ? [parseFloat(machine.longitude), parseFloat(machine.latitude)]
//               : null
//           };
          
//           return mappedMachine;
//         });
        
//         // IMPORTANT: Add debugging after mapping to see what values are being used
//         console.log('🔍 First 3 Mapped Machines:', this.machines.slice(0, 3));
//         console.log('🔍 Unique States After Mapping:', [...new Set(this.machines.map(m => m.state))]);
        
//         // this.updateMap();
//       } else {
//         console.warn('⚠️ No valid data received.');
//       }

//       this.isLoading = false;
//     },
//     (error) => {
//       console.error('❌ API Call Failed:', error);
//       this.isLoading = false;
//       this.errorMessage = 'Failed to load machine data: ' + (error.message || 'Unknown error');
//     }
//   );
// }


// 1. Fix for the toggleSelectAll function
toggleSelectAll(selected: any[], options: any[], key: string) {
  // First check if all items are already selected
  const allSelected = selected.length === options.length && options.length > 0;
  
  console.log(`Toggle Select All for ${key} - Current selection: ${selected.length}/${options.length} items`);
  
  if (allSelected) {
    // Clear the selection
    selected.length = 0;  // This modifies the array in-place
    console.log(`Cleared all selections for ${key}`);
    
    // Clear dependent filters when appropriate
    this.clearDependentSelections(key);
  } else {
    // Clear the array first
    selected.length = 0;
    
    // Then add all values from options
    options.forEach(option => {
      // Extract the appropriate ID from the option
      const value = typeof option === 'object' ? 
        (option.ProjectId || option.key || option.id || option.value) : option;
      
      selected.push(value);
    });
    
    console.log(`Selected all ${selected.length} options for ${key}`);
  }
  
  // Update the hierarchy selection with a new array reference
  this.updateHierarchySelection(key, [...selected]);
  
  // Rebuild filter chain
  this.rebuildFilterChain(key);
  
  // Reload data with updated filters
  this.loadMachineData();
}

// 2. Fix for the toggleSelection function
toggleSelection(selectedArray: any[], value: any, key: string) {
  const index = selectedArray.indexOf(value);
  
  if (index >= 0) {
    // Deselecting an item
    selectedArray.splice(index, 1);
    console.log(`Removed ${value} from ${key} selections`);
  } else {
    // Selecting an item
    selectedArray.push(value);
    console.log(`Added ${value} to ${key} selections`);
  }

  // Update the hierarchy selection with a new array reference
  this.updateHierarchySelection(key, [...selectedArray]);
  
  // Rebuild filter chain
  this.rebuildFilterChain(key);
  
  // Reload data with updated filters
  this.loadMachineData();
}

// 3. Fixed updateHierarchySelection function
updateHierarchySelection(key: string, selectedArray: any[]) {
  console.log(`Updating hierarchy for ${key} with ${selectedArray.length} selections`);
  
  // Always assign a NEW array to trigger change detection
  switch (key) {
    case 'projects':
      this.hierarchySelection.project = [...selectedArray];
      break;
    case 'zones':
    case 'state':
      this.hierarchySelection.state = [...selectedArray];
      break;
    case 'wards':
    case 'district':
      this.hierarchySelection.district = [...selectedArray];
      break;
    case 'selectedSubZones':
    case 'zone':
      this.hierarchySelection.zone = [...selectedArray];
      break;
    case 'selectedWardList':
    case 'ward':
      this.hierarchySelection.ward = [...selectedArray];
      break;
    case 'selectedBeatList':
    case 'beat':
      this.hierarchySelection.beat = [...selectedArray];
      break;
  }
  
  // Print the updated hierarchy for debugging
  console.log('Updated hierarchy selection:', JSON.stringify(this.hierarchySelection));
}

/*start radio buttons */


changeMapView(viewType: string): void {
  console.log(`Changing map view to: ${viewType}`);
  this.selectedMapView = viewType;
  this.updateMap();
}






/*start*/

updateMap(): void {
  console.log(`🔄 updateMap() called! Current view: ${this.selectedMapView}`);

  // Clear old markers
  this.markers.forEach(marker => marker.remove());
  this.markers = [];

  // Get selected filters from hierarchy
  const selectedStates = this.hierarchySelection.state || [];
  const selectedDistricts = this.hierarchySelection.district || [];
  const selectedZones = this.hierarchySelection.zone || [];
  const selectedWards = this.hierarchySelection.ward || [];
  const selectedBeats = this.hierarchySelection.beat || [];

  const selectedMachines = this.machineFilter?.value || [];
  const selectedStockStatuses = this.stockStatusFilter?.value || [];
  const selectedMachineStatuses = this.machineStatusFilter?.value || [];
  const selectedBurnStatusesRaw = this.buttonStatusFilter?.value || [];

  // Map burn status labels to numeric values
  const burnStatusMapping: Record<string, number> = {
    "Burning": 2,
    "Idle": 1
  };

  const selectedBurnStatuses = selectedBurnStatusesRaw
    .map((status: string) => burnStatusMapping[status])
    .filter(v => v !== undefined);

  // Filter machines based on ALL selected criteria
  const filteredMachines = this.machines.filter(machine => {
    // For each filter type, if no selections are made, don't filter on that criteria
    // If selections ARE made, machine must match at least one selected value
    
    const stateMatch = selectedStates.length === 0 || 
                      (machine.state && selectedStates.includes(machine.state));
    const districtMatch = selectedDistricts.length === 0 || 
                         (machine.district && selectedDistricts.includes(machine.district));
    const zoneMatch = selectedZones.length === 0 || 
                     (machine.zone && selectedZones.includes(machine.zone));
    const wardMatch = selectedWards.length === 0 || 
                     (machine.ward && selectedWards.includes(machine.ward));
    const beatMatch = selectedBeats.length === 0 || 
                     (machine.beat && selectedBeats.includes(machine.beat));
    const machineMatch = selectedMachines.length === 0 || 
                        selectedMachines.includes(machine.machineId);
    const stockMatch = selectedStockStatuses.length === 0 || 
                      selectedStockStatuses.includes(machine.stockStatus);
    const statusMatch = selectedMachineStatuses.length === 0 || 
                        selectedMachineStatuses.includes(machine.status);
    const burnMatch = selectedBurnStatuses.length === 0 || 
                      selectedBurnStatuses.includes(machine.burnStatus);

    // Machine matches if it passes ALL filter criteria
    return stateMatch && districtMatch && zoneMatch && wardMatch && beatMatch && 
           machineMatch && stockMatch && statusMatch && burnMatch;
  });

  console.log(`🔍 Filtered ${filteredMachines.length} of ${this.machines.length} machines`);

  if (filteredMachines.length === 0) {
    console.warn("⚠️ No matching machines found based on filters.");
    return; // Exit early if no machines match
  }

  // Handle different view types
  switch (this.selectedMapView) {
    case 'zone':
      this.displayAggregatedView(filteredMachines, 'zone', '#4CAF50'); // Green for zones
      break;
    case 'ward':
      this.displayAggregatedView(filteredMachines, 'ward', '#2196F3'); // Blue for wards
      break;
    case 'beat':
      this.displayAggregatedView(filteredMachines, 'beat', '#FF9800'); // Orange for beats
      break;
    default:
      this.displayMachineView(filteredMachines);
      break;
  }
}

//  work for when we click on radio buttons like zone, ward , beat it will show respective markerpoints along withat zoom to mumbai map
displayAggregatedView1(machines: any[], viewType: 'zone' | 'ward' | 'beat', markerColor: string): void {
  console.log(`📊 Displaying ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View`);

  const bounds = new maplibregl.LngLatBounds(); // ✅ STEP 1

  
  // Group machines by the selected view type
  const groups = this.groupMachinesByProperty(machines, viewType);
  
  // Create a marker for each group
  Object.entries(groups).forEach(([groupName, groupMachines]) => {
    if (groupName === 'Unknown' || groupName === 'null' || !groupName) {
      console.warn(`⚠️ Skipping ${viewType} with invalid name: "${groupName}"`);
      return;
    }
    
    // Find coordinates - try specialized lat/long first, then fallback to averaging machine positions
    let groupLocation: [number, number];
    
    const coordPropertyPrefix = {
      'zone': 'zone',
      'ward': 'ward',
      'beat': 'beat'
    }[viewType];
    
    const latProperty = `${coordPropertyPrefix}latitude`;
    const longProperty = `${coordPropertyPrefix}longitude`;
    
    // Try to use specialized coordinates if available
    const firstMachineWithCoords = groupMachines.find(m => 
      m[latProperty] && m[longProperty] && 
      m[latProperty] !== 0 && m[longProperty] !== 0
    );
    
    if (firstMachineWithCoords) {
      groupLocation = [
        Number(firstMachineWithCoords[longProperty]), 
        Number(firstMachineWithCoords[latProperty])
      ];
    } else {
      // Fallback: Calculate average coordinates of all machines in group
      const validMachines = groupMachines.filter(m => 
        m.longitude && m.latitude && 
        m.longitude !== 0 && m.latitude !== 0
      );
      
      if (validMachines.length === 0) {
        console.warn(`⚠️ No valid coordinates for ${viewType}: ${groupName}`);
        return;
      }
      
      const totalLng = validMachines.reduce((sum, m) => sum + Number(m.longitude), 0);
      const totalLat = validMachines.reduce((sum, m) => sum + Number(m.latitude), 0);
      
      groupLocation = [
        totalLng / validMachines.length, 
        totalLat / validMachines.length
      ];
    }
    
    if (!groupLocation || groupLocation[0] === 0 || groupLocation[1] === 0) {
      console.warn(`⚠️ Invalid coordinates for ${viewType}: ${groupName}`);
      return;
    }

    bounds.extend(groupLocation); // ✅ STEP 2

    
    // Create custom marker element - button style with name
    const markerElement = document.createElement('div');
    markerElement.className = `${viewType}-marker`;
    markerElement.style.backgroundColor = markerColor;
    markerElement.style.color = 'white';
    markerElement.style.padding = '8px 12px';
    markerElement.style.borderRadius = '4px';
    markerElement.style.fontWeight = 'bold';
    markerElement.style.textAlign = 'center';
    markerElement.style.minWidth = '80px';
    markerElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    markerElement.style.cursor = 'pointer';
    markerElement.style.display = 'flex';
    markerElement.style.alignItems = 'center';
    markerElement.style.justifyContent = 'center';
    
    // Add text label - capitalize the first letter of viewType
    const viewTypeCapitalized = viewType.charAt(0).toUpperCase() + viewType.slice(1);
    // markerElement.textContent = groupName;
    markerElement.textContent = `${viewTypeCapitalized}: ${groupName}`;

    
    // Calculate statistics for this group
    // const totalMachines = groupMachines.length;
    // const onlineMachines = groupMachines.filter(m => m.status === 'Online').length;
    // const offlineMachines = groupMachines.filter(m => m.status === 'Offline').length;
    // const lowStockMachines = groupMachines.filter(m => 
    //   m.stockStatus === 'Low Stock' || 
    //   (m.stockStatus && m.stockStatus.some && m.stockStatus.some((s: any) => s.SpringStatus === 'Low Stock'))
    // ).length;
    // const emptyStockMachines = groupMachines.filter(m => 
    //   m.stockStatus === 'Empty' || 
    //   (m.stockStatus && m.stockStatus.some && m.stockStatus.some((s: any) => s.SpringStatus === 'Empty'))
    // ).length;


    const installedMachines = groupMachines.length;

const runningMachines = groupMachines.filter(m => m.status === 'Online').length;

const totalCollection = groupMachines.reduce((sum, m) => sum + (m.totalCollection || 0), 0);

const itemsDispensed = groupMachines.reduce((sum, m) => sum + (m.itemsDispensed || 0), 0);

const stockLow = groupMachines.filter(m =>
  m.stockStatus === 'Low Stock' ||
  (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Low Stock'))
).length;

const stockEmpty = groupMachines.filter(m =>
  m.stockStatus === 'Empty' ||
  (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Empty'))
).length;

const stockError = groupMachines.filter(m =>
  m.stockStatus === 'Error' ||
  (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Error'))
).length;

const stockOkay = groupMachines.filter(m =>
  m.stockStatus === 'Okay' ||
  (Array.isArray(m.stockStatus) && m.stockStatus.every((s: any) => s.SpringStatus === 'Okay'))
).length;

const burningIdle = groupMachines.filter(m => m.burnStatus === 1).length;
const burningEnabled = groupMachines.filter(m => m.burnStatus === 2).length;
const burningError = groupMachines.filter(m => m.burnStatus === 3).length;

const totalBurningCycle = groupMachines.reduce((sum, m) => sum + (m.burningCycle || 0), 0);

    
    // Create popup with group info
    // const popupHTML = `
    //   <div class="${viewType}-popup">
    //     <h4>${viewTypeCapitalized}: ${groupName}</h4>
    //     <div class="${viewType}-stats">
    //       <div><strong>Total Machines:</strong> ${totalMachines}</div>
    //       <div><strong>Online:</strong> ${onlineMachines}</div>
    //       <div><strong>Offline:</strong> ${offlineMachines}</div>
    //       <div><strong>Low Stock:</strong> ${lowStockMachines}</div>
    //       <div><strong>Empty Stock:</strong> ${emptyStockMachines}</div>
    //     </div>
    //   </div>
    // `;


    const popupHTML = `
  <div class="${viewType}-popup">
    <h4>${viewTypeCapitalized}: ${groupName}</h4>
    <div class="${viewType}-stats">
      <div><strong>Machines Installed:</strong> ${installedMachines}</div>
      <div><strong>Machines Running:</strong> ${runningMachines}</div>
      <div><strong>Total Collection:</strong> ${totalCollection}</div>
      <div><strong>Items Dispensed:</strong> ${itemsDispensed}</div>
      <div><strong>Stock Empty:</strong> ${stockEmpty}</div>
      <div><strong>Stock Low:</strong> ${stockLow}</div>
      <div><strong>Stock Error:</strong> ${stockError}</div>
      <div><strong>Stock Okay:</strong> ${stockOkay}</div>
      <div><strong>Burning Idle:</strong> ${burningIdle}</div>
      <div><strong>Burning Enabled:</strong> ${burningEnabled}</div>
      <div><strong>Burning Error:</strong> ${burningError}</div>
      <div><strong>Total Burning Cycles:</strong> ${totalBurningCycle}</div>
    </div>
  </div>
`;

    
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
      maxWidth: '300px'
    }).setHTML(popupHTML);
    
    // Create and add marker to map
    const newMarker = new maplibregl.Marker({ element: markerElement })
      .setLngLat([groupLocation[0], groupLocation[1]])
      .setPopup(popup)
      .addTo(this.map);
    
    // Store marker for later removal
    this.markers.push(newMarker);
    
    console.log(`✅ Added ${viewType} marker for: ${groupName} at [${groupLocation}]`);
  });

  if (!bounds.isEmpty()) {
    this.map.fitBounds(bounds, { // ✅ STEP 3
      padding: 50,
      maxZoom: 10
    });
  }
}



// Generic method to display aggregated views (zone, ward, beat)
displayAggregatedView(machines: any[], viewType: 'zone' | 'ward' | 'beat', markerColor: string): void {
  console.log(`📊 Displaying ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View`);

  // Remove the bounds related code
  // const bounds = new maplibregl.LngLatBounds(); // REMOVED
  
  // Group machines by the selected view type
  const groups = this.groupMachinesByProperty(machines, viewType);
  
  // Create a marker for each group
  Object.entries(groups).forEach(([groupName, groupMachines]) => {
    if (groupName === 'Unknown' || groupName === 'null' || !groupName) {
      console.warn(`⚠️ Skipping ${viewType} with invalid name: "${groupName}"`);
      return;
    }
    
    // Find coordinates - try specialized lat/long first, then fallback to averaging machine positions
    let groupLocation: [number, number];
    
    const coordPropertyPrefix = {
      'zone': 'zone',
      'ward': 'ward',
      'beat': 'beat'
    }[viewType];
    
    const latProperty = `${coordPropertyPrefix}latitude`;
    const longProperty = `${coordPropertyPrefix}longitude`;
    
    // Try to use specialized coordinates if available
    const firstMachineWithCoords = groupMachines.find(m => 
      m[latProperty] && m[longProperty] && 
      m[latProperty] !== 0 && m[longProperty] !== 0
    );
    
    if (firstMachineWithCoords) {
      groupLocation = [
        Number(firstMachineWithCoords[longProperty]), 
        Number(firstMachineWithCoords[latProperty])
      ];
    } else {
      // Fallback: Calculate average coordinates of all machines in group
      const validMachines = groupMachines.filter(m => 
        m.longitude && m.latitude && 
        m.longitude !== 0 && m.latitude !== 0
      );
      
      if (validMachines.length === 0) {
        console.warn(`⚠️ No valid coordinates for ${viewType}: ${groupName}`);
        return;
      }
      
      const totalLng = validMachines.reduce((sum, m) => sum + Number(m.longitude), 0);
      const totalLat = validMachines.reduce((sum, m) => sum + Number(m.latitude), 0);
      
      groupLocation = [
        totalLng / validMachines.length, 
        totalLat / validMachines.length
      ];
    }
    
    if (!groupLocation || groupLocation[0] === 0 || groupLocation[1] === 0) {
      console.warn(`⚠️ Invalid coordinates for ${viewType}: ${groupName}`);
      return;
    }

    // Remove the bounds extend call
    // bounds.extend(groupLocation); // REMOVED
    
    // Create custom marker element - button style with name
    const markerElement = document.createElement('div');
    markerElement.className = `${viewType}-marker`;
    markerElement.style.backgroundColor = markerColor;
    markerElement.style.color = 'white';
    markerElement.style.padding = '8px 12px';
    markerElement.style.borderRadius = '4px';
    markerElement.style.fontWeight = 'bold';
    markerElement.style.textAlign = 'center';
    markerElement.style.minWidth = '80px';
    markerElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    markerElement.style.cursor = 'pointer';
    markerElement.style.display = 'flex';
    markerElement.style.alignItems = 'center';
    markerElement.style.justifyContent = 'center';
    
    // Add text label - capitalize the first letter of viewType
    const viewTypeCapitalized = viewType.charAt(0).toUpperCase() + viewType.slice(1);
    markerElement.textContent = `${viewTypeCapitalized}: ${groupName}`;

    const installedMachines = groupMachines.length;
    const runningMachines = groupMachines.filter(m => m.status === 'Online').length;
    const totalCollection = groupMachines.reduce((sum, m) => sum + (m.totalCollection || 0), 0);
    const itemsDispensed = groupMachines.reduce((sum, m) => sum + (m.itemsDispensed || 0), 0);
    const stockLow = groupMachines.filter(m =>
      m.stockStatus === 'Low Stock' ||
      (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Low Stock'))
    ).length;
    const stockEmpty = groupMachines.filter(m =>
      m.stockStatus === 'Empty' ||
      (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Empty'))
    ).length;
    const stockError = groupMachines.filter(m =>
      m.stockStatus === 'Error' ||
      (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Error'))
    ).length;
    const stockOkay = groupMachines.filter(m =>
      m.stockStatus === 'Okay' ||
      (Array.isArray(m.stockStatus) && m.stockStatus.every((s: any) => s.SpringStatus === 'Okay'))
    ).length;
    const burningIdle = groupMachines.filter(m => m.burnStatus === 1).length;
    const burningEnabled = groupMachines.filter(m => m.burnStatus === 2).length;
    const burningError = groupMachines.filter(m => m.burnStatus === 3).length;
    const totalBurningCycle = groupMachines.reduce((sum, m) => sum + (m.burningCycle || 0), 0);
    
    const popupHTML = `
      <div class="${viewType}-popup">
        <h4>${viewTypeCapitalized}: ${groupName}</h4>
        <div class="${viewType}-stats">
          <div><strong>Machines Installed:</strong> ${installedMachines}</div>
          <div><strong>Machines Running:</strong> ${runningMachines}</div>
          <div><strong>Total Collection:</strong> ${totalCollection}</div>
          <div><strong>Items Dispensed:</strong> ${itemsDispensed}</div>
          <div><strong>Stock Empty:</strong> ${stockEmpty}</div>
          <div><strong>Stock Low:</strong> ${stockLow}</div>
          <div><strong>Stock Error:</strong> ${stockError}</div>
          <div><strong>Stock Okay:</strong> ${stockOkay}</div>
          <div><strong>Burning Idle:</strong> ${burningIdle}</div>
          <div><strong>Burning Enabled:</strong> ${burningEnabled}</div>
          <div><strong>Burning Error:</strong> ${burningError}</div>
          <div><strong>Total Burning Cycles:</strong> ${totalBurningCycle}</div>
        </div>
      </div>
    `;
    
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
      maxWidth: '300px'
    }).setHTML(popupHTML);
    
    // Create and add marker to map
    const newMarker = new maplibregl.Marker({ element: markerElement })
      .setLngLat([groupLocation[0], groupLocation[1]])
      .setPopup(popup)
      .addTo(this.map);
    
    // Store marker for later removal
    this.markers.push(newMarker);
    
    console.log(`✅ Added ${viewType} marker for: ${groupName} at [${groupLocation}]`);
  });

  // Remove the bounds check and fitBounds call
  // if (!bounds.isEmpty()) {
  //   this.map.fitBounds(bounds, {
  //     padding: 50,
  //     maxZoom: 10
  //   });
  // }
}




// Helper method to group machines by any property (zone, ward, beat)
groupMachinesByProperty(machines: any[], property: string): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  
  machines.forEach(machine => {
    const propertyMap: Record<string, string> = {
      'zone': 'zone',
      'ward': 'ward',
      'beat': 'beat'
    };
    
    // Get the actual property key from the mapping
    const propertyKey = propertyMap[property];
    const propertyValue = machine[propertyKey] || 'Unknown';
    
    if (!groups[propertyValue]) {
      groups[propertyValue] = [];
    }
    groups[propertyValue].push(machine);
  });
  
  return groups;
}

// Renamed from original updateMap to handle machine-level view
displayMachineView(filteredMachines: any[]): void {
  console.log("🔍 Displaying Machine View");
  
  // Handle overlapping markers
  const locationMap = new Map<string, number>();




  // Create markers for all filtered machines
  filteredMachines.forEach(machine => {
    if (!machine.location && (!machine.longitude || !machine.latitude)) {
      console.warn(`Machine ${machine.machineId} has no location data`);
      return;
    }

    // Use machine.location if available, otherwise use longitude/latitude
    let lng: number, lat: number;
    if (machine.location && Array.isArray(machine.location) && machine.location.length >= 2) {
      lng = Number(machine.location[0]);
      lat = Number(machine.location[1]);
    } else {
      lng = Number(machine.longitude);
      lat = Number(machine.latitude);
    }
    
    // Skip if coordinates are invalid
    if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
      console.warn(`Machine ${machine.machineId} has invalid coordinates`);
      return;
    }

    const key = `${lng},${lat}`;

    // Handle overlapping markers by slightly offsetting them
    if (locationMap.has(key)) {
      const count = locationMap.get(key)! + 1;
      locationMap.set(key, count);

      const angle = (count * 45) * (Math.PI / 180);
      const radius = 0.000001 * count;
      lng += radius * Math.cos(angle);
      lat += radius * Math.sin(angle);
    } else {
      locationMap.set(key, 1);
    }

    // Set marker icon based on machine status
    const iconUrl = this.getStockStatusIcon(machine.stockStatus);

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.backgroundImage = `url(${iconUrl})`;
    markerElement.style.width = '40px';
    markerElement.style.height = '40px';
    markerElement.style.backgroundSize = 'contain';
    markerElement.style.backgroundRepeat = 'no-repeat';

    // Zoom on double-click
    markerElement.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.map.flyTo({
        center: [lng, lat] as [number, number],
        zoom: 15,
        speed: 5,
        curve: 1,
        easing(t) {
          return t;
        }
      });
    });

    // Create popup with machine info
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true
    }).setHTML(this.generatePopupHTML(machine));

    // Create and add marker to map
    const newMarker = new maplibregl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map);

    // Store marker for later removal
    this.markers.push(newMarker);
  });
  
  console.log(`✅ Added ${this.markers.length} markers to map`);
}



/*end*/









// 4. Improved updateMap function that properly handles all selected options and for india map but above one is for mumbai map if client is bmc
updateMap1(): void {
  console.log("🔄 updateMap() called!");

  // Clear old markers
  this.markers.forEach(marker => marker.remove());
  this.markers = [];

  // Get selected filters from hierarchy
  const selectedStates = this.hierarchySelection.state || [];
  const selectedDistricts = this.hierarchySelection.district || [];
  const selectedZones = this.hierarchySelection.zone || [];
  const selectedWards = this.hierarchySelection.ward || [];
  const selectedBeats = this.hierarchySelection.beat || [];

  const selectedMachines = this.machineFilter?.value || [];
  const selectedStockStatuses = this.stockStatusFilter?.value || [];
  const selectedMachineStatuses = this.machineStatusFilter?.value || [];
  const selectedBurnStatusesRaw = this.buttonStatusFilter?.value || [];

  // Log all filter values for debugging
  console.log("🗺️ Current Filter Values:", {
    states: selectedStates,
    districts: selectedDistricts,
    zones: selectedZones,
    wards: selectedWards,
    beats: selectedBeats,
    machines: selectedMachines,
    stockStatuses: selectedStockStatuses,
    machineStatuses: selectedMachineStatuses,
    burnStatuses: selectedBurnStatusesRaw
  });

  // Map burn status labels to numeric values
  const burnStatusMapping: Record<string, number> = {
    "Burning": 2,
    "Idle": 1
  };

  const selectedBurnStatuses = selectedBurnStatusesRaw
    .map((status: string) => burnStatusMapping[status])
    .filter(v => v !== undefined);

  // CRITICAL: Log the unique values in the machines data to help debug
  console.log("Available values in machines data:", {
    states: [...new Set(this.machines.map(m => m.state))],
    districts: [...new Set(this.machines.map(m => m.district))],
    zones: [...new Set(this.machines.map(m => m.zone))],
    wards: [...new Set(this.machines.map(m => m.ward))],
    beats: [...new Set(this.machines.map(m => m.beat))]
  });

  // Filter machines based on ALL selected criteria
  const filteredMachines = this.machines.filter(machine => {
    // For each filter type, if no selections are made, don't filter on that criteria
    // If selections ARE made, machine must match at least one selected value
    
    // STATE filtering - check if no states selected or if machine's state is in selected states
    const stateMatch = selectedStates.length === 0 || 
                      (machine.state && selectedStates.includes(machine.state));
    
    // DISTRICT filtering
    const districtMatch = selectedDistricts.length === 0 || 
                         (machine.district && selectedDistricts.includes(machine.district));
    
    // ZONE filtering 
    const zoneMatch = selectedZones.length === 0 || 
                     (machine.zone && selectedZones.includes(machine.zone));
    
    // WARD filtering
    const wardMatch = selectedWards.length === 0 || 
                     (machine.ward && selectedWards.includes(machine.ward));
    
    // BEAT filtering
    const beatMatch = selectedBeats.length === 0 || 
                     (machine.beat && selectedBeats.includes(machine.beat));
    
    // MACHINE ID filtering
    const machineMatch = selectedMachines.length === 0 || 
                        selectedMachines.includes(machine.machineId);
    
    // STOCK STATUS filtering
    const stockMatch = selectedStockStatuses.length === 0 || 
                      selectedStockStatuses.includes(machine.stockStatus);
    
    // MACHINE STATUS filtering
    const statusMatch = selectedMachineStatuses.length === 0 || 
                        selectedMachineStatuses.includes(machine.status);
    
    // BURN STATUS filtering
    const burnMatch = selectedBurnStatuses.length === 0 || 
                      selectedBurnStatuses.includes(machine.burnStatus);

    // Debug when a machine doesn't match
    if (!stateMatch || !districtMatch || !zoneMatch || !wardMatch || !beatMatch) {
      console.log(`Machine ${machine.machineId} filtered out:`, {
        state: machine.state, stateMatch,
        district: machine.district, districtMatch,
        zone: machine.zone, zoneMatch,
        ward: machine.ward, wardMatch,
        beat: machine.beat, beatMatch
      });
    }

    // Machine matches if it passes ALL filter criteria
    return stateMatch && districtMatch && zoneMatch && wardMatch && beatMatch && 
           machineMatch && stockMatch && statusMatch && burnMatch;
  });

  console.log(`🔍 Filtered ${filteredMachines.length} of ${this.machines.length} machines`);

  if (filteredMachines.length === 0) {
    console.warn("⚠️ No matching machines found based on filters.");
    return; // Exit early if no machines match
  }

  // Handle overlapping markers
  const locationMap = new Map<string, number>();

  // Create markers for all filtered machines
  filteredMachines.forEach(machine => {
    if (!machine.location) {
      console.warn(`Machine ${machine.machineId} has no location data`);
      return;
    }

    const [lng, lat] = machine.location;
    const key = `${lng},${lat}`;

    // Handle overlapping markers by slightly offsetting them
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

    // Set marker icon based on machine status
    const iconUrl = this.getStockStatusIcon(machine.stockStatus);

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.backgroundImage = `url(${iconUrl})`;
    markerElement.style.width = '40px';
    markerElement.style.height = '40px';
    markerElement.style.backgroundSize = 'contain';
    markerElement.style.backgroundRepeat = 'no-repeat';

    // Zoom on double-click
    markerElement.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.map.flyTo({
        center: machine.location,
        zoom: 15,
        speed: 5,
        curve: 1,
        easing(t) {
          return t;
        }
      });
    });

    // Create popup with machine info
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true
    }).setHTML(this.generatePopupHTML(machine));

    // Create and add marker to map
    const newMarker = new maplibregl.Marker({ element: markerElement })
      .setLngLat(machine.location)
      .setPopup(popup)
      .addTo(this.map);

    // Store marker for later removal
    this.markers.push(newMarker);
  });
  
  console.log(`✅ Added ${this.markers.length} markers to map`);
}

// 5. Improved loadMachineData function
loadMachineData() {
  this.isLoading = true;
  this.errorMessage = '';

  const merchantId = this.commonDataService.merchantId ?? '';
  const userDetails = this.commonDataService.userDetails;

  // Build API query parameters
  const queryParams: any = {
    merchantId,
    
    // Include filter parameters based on selections
    machineStatus: this.selectedMachineStatuses?.length > 0 ? [...this.selectedMachineStatuses] : ['1', '2'],
    stockStatus: this.selectedStockStatuses?.length > 0 ? [...this.selectedStockStatuses] : [],
    burnStatus: this.selectedBurnStatuses?.length > 0 ? [...this.selectedBurnStatuses] : [],
    
    // Pass ALL selected filter values (even if multiple are selected)
    state: this.hierarchySelection.state?.length > 0 ? [...this.hierarchySelection.state] : [],
    district: this.hierarchySelection.district?.length > 0 ? [...this.hierarchySelection.district] : [],
    zone: this.hierarchySelection.zone?.length > 0 ? [...this.hierarchySelection.zone] : [],
    ward: this.hierarchySelection.ward?.length > 0 ? [...this.hierarchySelection.ward] : [],
    beat: this.hierarchySelection.beat?.length > 0 ? [...this.hierarchySelection.beat] : [],
    
    client: userDetails.clientId,
    project: userDetails.projectId
  };

  // Include machine selection if available
  if (this.selectedBeats?.length > 0) {
    queryParams.machineId = [...this.selectedBeats];
  }

  console.log("API Query Parameters:", queryParams);

  this.dataService.getMachineDashboardSummary(queryParams).subscribe(
    (response: any) => {
      console.log('✅ API Response:', response);

      if (response?.code === 200 && response.data) {
        // Process machines data
        this.machines = response.data.machines.map((machine: any) => {
          const mappedMachine = {
            ...machine,
            stockStatus: this.mapStockStatus(machine.stockStatus),
            burnStatus: this.mapBurnStatus(machine.burningStatus),
            
            // Ensure we have consistent property naming
            state: machine.level1 || machine.state || '',
            district: machine.level2 || machine.district || '',
            zone: machine.zone || '',
            ward: machine.ward || '',
            beat: machine.beat || '',
            
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
          };
          
          return mappedMachine;
        });


        
        console.log('🔍 Processed Machines:', this.machines.length);
        
        // Update map after processing data
        this.updateMap();
      } else {
        console.warn('⚠️ No valid data received.');
        this.machines = [];
        this.updateMap(); // Still call updateMap to clear markers
      }

      this.isLoading = false;
    },
    (error) => {
      console.error('❌ API Call Failed:', error);
      this.isLoading = false;
      this.errorMessage = 'Failed to load machine data: ' + (error.message || 'Unknown error');
    }
  );
}
  
  

// extractUniqueZones(): void {
//   // Extract unique zone names from the machines data
//   const zoneSet = new Set<string>();
  
//   this.machines.forEach(machine => {
//     if (machine.zone) {
//       zoneSet.add(machine.zone);
//     }
//   });
  
//   // Convert Set to array
//   this.zones1 = Array.from(zoneSet);
//   console.log('Extracted zonesbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:', this.zones1);
// }


extractUniqueZones(): void {
  // Initialize an empty Set to store unique zone names
  const zoneSet = new Set<string>();
  
  // Since you're storing response.data in this.hierarchicalData
  // And response.data.projects in this.fullData
  
  if (this.fullData && Array.isArray(this.fullData)) {
    // Loop through each project
    this.fullData.forEach((project: any) => {
      // Check if project has states
      if (project.states && Array.isArray(project.states)) {
        // Loop through each state
        project.states.forEach((state: any) => {
          // Check if state has districts
          if (state.districts && Array.isArray(state.districts)) {
            // Loop through each district
            state.districts.forEach((district: any) => {
              // Check if district has zones
              if (district.zones && Array.isArray(district.zones)) {
                // Loop through each zone and add its name to our Set
                district.zones.forEach((zone: any) => {
                  if (zone.zone) {
                    zoneSet.add(zone.zone);
                  }
                });
              }
            });
          }
        });
      }
    });
  }
  
  // Convert the Set to an array
  this.zones1 = Array.from(zoneSet);
  console.log('Extracted zones:', this.zones);
}

  getAllSelectedMachines(): string[] {
    const machines: string[] = [];
    
    // If specific machines are selected, use those
    if (this.machineFilter.value?.length) {
      return this.machineFilter.value;
    }
    
    // If beats are selected, get machines for those beats
    if (this.beatFilter.value?.length) {
      this.beatFilter.value.forEach(beat => {
        (this.beatMachineMap[beat] || []).forEach(machine => {
          if (!machines.includes(machine)) {
            machines.push(machine);
          }
        });
      });
      return machines.length ? machines : [];
    }
    
    // If no specific filters are set, get all machines from hierarchy
    if (!this.stateFilter.value?.length && !this.districtFilter.value?.length && 
        !this.zoneFilter.value?.length && !this.wardFilter.value?.length) {
      
      // Collect all machines from all beats
      Object.values(this.beatMachineMap).forEach(beatMachines => {
        beatMachines.forEach(machine => {
          if (!machines.includes(machine)) {
            machines.push(machine);
          }
        });
      });
    }
    
    return machines.length ? machines : [];
  }

  mapBurnStatus(burnStatus: string | null): number {
    return burnStatus?.toLowerCase() === 'burning' ? 2 : 1;
  }
 
  mapStockStatus(stockStatusArray: any[]): number {
    if (!Array.isArray(stockStatusArray) || stockStatusArray.length === 0) return -1;
 
    const stockStatus = stockStatusArray[0]?.SpringStatus; // Extract first element
    // console.log("Extracted Stock Status:", stockStatus);
 
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

     






// Fix for updateMap to correctly filter based on states
// updateMap(): void {
//   console.log("🔄 updateMap() called!");

//   // Clear old markers
//   this.markers.forEach(marker => marker.remove());
//   this.markers = [];

//   // Get selected filters
//   console.log("All available states:", this.states);
// //   const selectedStates = this.stateFilter.setValue([...this.hierarchySelection.state]);
// //   const selectedDistricts=this.districtFilter.setValue([...this.hierarchySelection.district]);
// //   const selectedZones =this.zoneFilter.setValue([...this.hierarchySelection.zone]);
// // const selectedWards =this.wardFilter.setValue([...this.hierarchySelection.ward]);
// // const selectedBeats = this.beatFilter.setValue([...this.hierarchySelection.beat]);

// // const selectedStates = this.stateFilter.value || [];
// //   const selectedDistricts = this.districtFilter.value || [];
// //   const selectedZones = this.zoneFilter.value || [];
// //   const selectedWards = this.wardFilter.value || [];
// //   const selectedBeats = this.beatFilter.value || [];

// const selectedStates = this.hierarchySelection.state || [];
// const selectedDistricts = this.hierarchySelection.district || [];
// const selectedZones = this.hierarchySelection.zone || [];
// const selectedWards = this.hierarchySelection.ward || [];
// const selectedBeats = this.hierarchySelection.beat || [];

//   const selectedMachines = this.machineFilter.value || [];
//   const selectedStockStatuses = this.stockStatusFilter.value || [];

//   const selectedMachineStatuses = this.machineStatusFilter.value || [];
//   const selectedBurnStatusesRaw = this.buttonStatusFilter.value || [];

//   console.log("Selected states from dropdown:", selectedStates);


//   // Log all filter values for debugging
//   console.log("🗺️ Current Filter Values:", {
//     states: selectedStates,
//     districts: selectedDistricts,
//     zones: selectedZones,
//     wards: selectedWards,
//     beats: selectedBeats,
//     machines: selectedMachines,
//     stockStatuses: selectedStockStatuses,
//     machineStatuses: selectedMachineStatuses,
//     burnStatuses: selectedBurnStatusesRaw
//   });

//   // Map burn status labels to numeric values
//   const burnStatusMapping: Record<string, number> = {
//     "Burning": 2,
//     "Idle": 1
//   };

//   const selectedBurnStatuses = selectedBurnStatusesRaw
//     .map((status: string) => burnStatusMapping[status])
//     .filter(v => v !== undefined);

//   // CRITICAL DEBUGGING: Compare selected states to actual states in machines
//   if (selectedStates.length > 0) {
//     console.log("🔍 Selected States from filter:", selectedStates);
//     const availableStates = [...new Set(this.machines.map(m => m.state))];
//     console.log("🔍 Available States in Machines:", availableStates);
    
//     // Check if any selected states exist in the machines
//     const existingStates = selectedStates.filter(state => availableStates.includes(state));
//     console.log("🔍 Matching States:", existingStates);
//   }

//   // Filter machines based on selected filters
//   const filteredMachines = this.machines.filter(machine => {

//     console.log("this selcted machinessss", this.machines)
//     // FIX: Check case-insensitive state matching and log specific information
//     const stateMatches = selectedStates.length === 0 || 
//                   selectedStates.some(state => {
//                     const matches = machine.state.toLowerCase() === state.toLowerCase();
//                     if (selectedStates.includes(state) && !matches) {
//                       console.log(`State mismatch: Machine state "${machine.state}" != selected "${state}"`);
//                     }
//                     return matches;
//                   });
    
//     const districtMatch = selectedDistricts.length === 0 || 
//                          (machine.district && selectedDistricts.includes(machine.district));
    
//     const zoneMatch = selectedZones.length === 0 || 
//                      (machine.zone && selectedZones.includes(machine.zone));
    
//     const wardMatch = selectedWards.length === 0 || 
//                      (machine.ward && selectedWards.includes(machine.ward));
    
//     const beatMatch = selectedBeats.length === 0 || 
//                      (machine.beat && selectedBeats.includes(machine.beat));
    
//     const machineMatch = selectedMachines.length === 0 || 
//                          selectedMachines.includes(machine.machineId);
    
//     const stockMatch = selectedStockStatuses.length === 0 || 
//                        selectedStockStatuses.includes(machine.stockStatus);
    
//     const statusMatch = selectedMachineStatuses.length === 0 || 
//                         selectedMachineStatuses.includes(machine.status);
    
//     const burnMatch = selectedBurnStatuses.length === 0 || 
//                       selectedBurnStatuses.includes(machine.burnStatus);

//     // Track why a machine is being filtered out (if it is)
//     if (selectedStates.length > 0 && !stateMatches) {
//       console.log(`Machine ${machine.machineId} filtered out - state: ${machine.state}`);
//     }

//     return stateMatches && districtMatch && zoneMatch && wardMatch && beatMatch && 
//            machineMatch && stockMatch && statusMatch && burnMatch;
//   });

//   console.log("🔍 Filtered Machines:", filteredMachines.length);

//   if (filteredMachines.length === 0) {
//     console.warn("⚠️ No matching machines found based on filters.");
//   }

//   // Handle overlapping markers
//   const locationMap = new Map<string, number>();

//   filteredMachines.forEach(machine => {
//     if (!machine.location) return;

//     const [lng, lat] = machine.location;
//     const key = `${lng},${lat}`;

//     if (locationMap.has(key)) {
//       const count = locationMap.get(key)! + 1;
//       locationMap.set(key, count);

//       const angle = (count * 45) * (Math.PI / 180);
//       const radius = 0.000001 * count;
//       machine.location = [
//         lng + radius * Math.cos(angle),
//         lat + radius * Math.sin(angle)
//       ];
//     } else {
//       locationMap.set(key, 1);
//     }

//     // Set marker icon dynamically based on stock status
//     const iconUrl = this.getStockStatusIcon(machine.stockStatus);

//     const markerElement = document.createElement('div');
//     markerElement.className = 'custom-marker';
//     markerElement.style.backgroundImage = `url(${iconUrl})`;
//     markerElement.style.width = '40px';
//     markerElement.style.height = '40px';
//     markerElement.style.backgroundSize = 'contain';
//     markerElement.style.backgroundRepeat = 'no-repeat';

//     // Zoom on double-click
//     markerElement.addEventListener('dblclick', (e) => {
//       e.stopPropagation(); 
//       this.map.flyTo({
//         center: machine.location,
//         zoom: 15,
//         speed: 5,
//         curve: 1,
//         easing(t) {
//           return t;
//         }
//       });
//     });

// const popup = new maplibregl.Popup({
//   closeButton: false,  // Disable default close button, we'll use our custom one
//   closeOnClick: true  // Disable closing when clicking map
// }).setHTML(this.generatePopupHTML(machine));

//   // Create marker
//   const newMarker = new maplibregl.Marker({ element: markerElement })
//     .setLngLat(machine.location)
//     // .setPopup(new maplibregl.Popup().setHTML(this.generatePopupHTML(machine)))
//     .setPopup(popup)
//     .addTo(this.map);

//   this.markers.push(newMarker);
// }); 
// }

 
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
          <p><strong>Zone:</strong> ${machine.zone || 'N/A'}</p>
      <p><strong>Ward:</strong> ${machine.ward || 'N/A'}</p>
      <p><strong>Beat:</strong> ${machine.beat || 'N/A'}</p>
    <p><strong>Status:</strong> ${machine.status}</p>
    <p><strong>Stock Status:</strong> ${stockStatusText}</p>
    <p><strong>Burning Status:</strong> ${burningStatusText}</p>
    <p><strong>Total Collection:</strong> ₹${machine.collection}</p>
    <p><strong>Items Dispensed:</strong> ${machine.itemsDispensed}</p>
    <p><strong>Address:</strong> ${machine.address}</p></div>`;



}


  
// toggleSelectAll(selected: any[], options: any[], key: string) {
//   // Check if all items are already selected
//   const allSelected = selected.length === options.length && options.length > 0;
  
//   if (allSelected) {
//     // Clear the selection
//     selected.length = 0;  // This modifies the array in-place
    
//     // Clear dependent filters when needed
//     this.clearDependentSelections(key);
//   } else {
//     // Select all items
//     // First clear the array
//     selected.length = 0;
    
//     // Then add all values from options
//     options.forEach(option => {
//       const value = option.ProjectId || option.key || option;
//       selected.push(value);
//     });
//   }
  
//   // Update the hierarchy selection
//   this.updateHierarchySelection(key, [...selected]);
  
//   // Rebuild filter chain
//   this.rebuildFilterChain(key);
  
//   // Reload data with updated filters
//   this.loadMachineData();
// }


    // toggleSelectAll(filterControl: FormControl, items: any[], key: string): void {
    //   const allSelected = filterControl.value.length === items.length;
    
    //   // Toggle selection
    //   if (allSelected) {
    //     filterControl.setValue([]);
    
    //     // Optionally clear dependent selections
    //     this.clearDependentSelections(key);
    //   } else {
    //     // You can customize how to extract the value from item
    //     const selectedValues = items.map(item => item.ProjectId || item.key || item);
    //     filterControl.setValue(selectedValues);
    //   }
    
    //   console.log(`🔹 Updated ${key} Selection: ${filterControl.value}`);
    
    //   // Update hierarchy and reload
    //   this.updateHierarchySelection(key, filterControl.value);
    //   this.rebuildFilterChain(key);
    //   this.loadMachineData();
    // }
    

    // toggleSelectAll(key: string, items: any[], filterControl: FormControl) {
    //   const currentValues = filterControl.value || [];
    //   const allSelected = currentValues.length === items.length;
    
    //   if (allSelected) {
    //     filterControl.setValue([]);
    //     this.clearDependentSelections(key);
    //   } else {
    //     const selectedValues = items.map(item => {
    //       if (typeof item === 'object') {
    //         return item.ProjectId ?? item.key ?? item.id ?? item.value ?? '';
    //       }
    //       return item;
    //     });
    
    //     filterControl.setValue([...selectedValues]);
    //   }
    
    //   this.updateHierarchySelection(key, filterControl.value);
    //   this.rebuildFilterChain(key);
    //   this.loadMachineData();
    // }
        
         
    toggleDropdown(key: string) {
      // Close all other dropdowns
      for (const dropdownKey in this.dropdownOpen) {
        if (dropdownKey !== key) {
          this.dropdownOpen[dropdownKey] = false;
        }
      }
      // Toggle the selected dropdown
      this.dropdownOpen[key] = !this.dropdownOpen[key];
    }
    
    clearDependentSelections(key: string) {
      switch (key) {
        case 'project':
          if (this.selectedProjects.length === 0) {
            this.selectedZones = [];
            this.selectedWards = [];
            this.selectedSubZones = [];
            this.selectedWardList = [];
            this.selectedBeatList = [];
            this.selectedBeats = [];
            
            // Clear hierarchy selections as well
            this.hierarchySelection.state = [];
            this.hierarchySelection.district = [];
            this.hierarchySelection.zone = [];
            this.hierarchySelection.ward = [];
            this.hierarchySelection.beat = [];
          }
          break;
        case 'zones':
        case 'state':
          if (this.selectedZones.length === 0) {
            this.selectedWards = [];
            this.selectedSubZones = [];
            this.selectedWardList = [];
            this.selectedBeatList = [];
            this.selectedBeats = [];
            
            // Clear hierarchy selections
            this.hierarchySelection.district = [];
            this.hierarchySelection.zone = [];
            this.hierarchySelection.ward = [];
            this.hierarchySelection.beat = [];
          }
          break;
        case 'wards':
        case 'district':
          if (this.selectedWards.length === 0) {
            this.selectedSubZones = [];
            this.selectedWardList = [];
            this.selectedBeatList = [];
            this.selectedBeats = [];
            
            // Clear hierarchy selections
            this.hierarchySelection.zone = [];
            this.hierarchySelection.ward = [];
            this.hierarchySelection.beat = [];
          }
          break;
        case 'selectedSubZones':
        case 'zone':
          if (this.selectedSubZones.length === 0) {
            this.selectedWardList = [];
            this.selectedBeatList = [];
            this.selectedBeats = [];
            
            // Clear hierarchy selections
            this.hierarchySelection.ward = [];
            this.hierarchySelection.beat = [];
          }
          break;
        case 'selectedWardList':
        case 'ward':
          if (this.selectedWardList.length === 0) {
            this.selectedBeatList = [];
            this.selectedBeats = [];
            
            // Clear hierarchy selection
            this.hierarchySelection.beat = [];
          }
          break;
        case 'selectedBeatList':
        case 'beat':
          if (this.selectedBeatList.length === 0) {
            this.selectedBeats = [];
          }
          break;
      }
    }
    
    
    rebuildFilterChain(startKey: string) {
      // Determine where to start rebuilding based on the changed key
      switch(startKey) {
        case 'projects':
          this.filterStates();
          this.filterWards();
          this.filterSubZones();
          this.filterWardList();
          this.filterBeatList();
          this.filterMachines();
          break;
        case 'zones':
        case 'state':
          this.filterWards();
          this.filterSubZones();
          this.filterWardList();
          this.filterBeatList();
          this.filterMachines();
          break;
        case 'wards':
        case 'district':
          this.filterSubZones();
          this.filterWardList();
          this.filterBeatList();
          this.filterMachines();
          break;
        case 'selectedSubZones':
        case 'zone':
          this.filterWardList();
          this.filterBeatList();
          this.filterMachines();
          break;
        case 'selectedWardList':
        case 'ward':
          this.filterBeatList();
          this.filterMachines();
          break;
        case 'selectedBeatList':
        case 'beat':
          this.filterMachines();
          break;
      }
    }
    filterStates() {
      this.zones = [];
      this.selectedZones = [];
     
      this.selectedProjects.forEach(pid => {
        const project = this.fullData.find(p => p.projectId === pid);
        project?.states?.forEach((stateobj: any) => {
          if (!this.zones.includes(stateobj.state)) {
            this.zones.push(stateobj.state);
          }
        });
      });
     
     // this.filterWards();
    }
     
    filterWards() {
      this.wards = [];
      this.selectedWards = [];
     
      this.selectedProjects.forEach(pid => {
        const project = this.fullData.find(p => p.projectId === pid);
        project?.states?.forEach((stateobj: any) => {
          if (this.selectedZones.includes(stateobj.state)) {
            stateobj.districts?.forEach((districtobj: any) => {
              if (!this.wards.find(w => w.district === districtobj.district)) {
                this.wards.push(districtobj.district);
              }
            });
          }
        });
      });
     
     // this.filterSubZones();
    }
     
    filterSubZones() {
      this.subZones = [];
      this.selectedSubZones = [];
     
      this.selectedProjects.forEach(pid => {
        const project = this.fullData.find(p => p.projectId === pid);
        project?.states?.forEach((stateobj: any) => {
          if (this.selectedZones.includes(stateobj.state)) {
            stateobj.districts?.forEach((districtobj: any) => {
              if (this.selectedWards.includes(districtobj.district)) {
                districtobj.zones?.forEach((zoneobj: any) => {
                  if (!this.subZones.includes(zoneobj.zone)) {
                    this.subZones.push(zoneobj.zone); // Push plain string value
                  }
                });
              }
            });
          }
        });
      });
     
     // this.filterWardList();
    }
     
    filterWardList() {
      this.wardList = [];
      this.selectedWardList = [];
     
      this.selectedProjects.forEach(pid => {
        const project = this.fullData.find(p => p.projectId === pid);
        project?.states?.forEach((stateobj: any) => {
          if (this.selectedZones.includes(stateobj.state)) {
            stateobj.districts?.forEach((districtobj: any) => {
              if (this.selectedWards.includes(districtobj.district)) {
                districtobj.zones?.forEach((zoneobj: any) => {
                  if (this.selectedSubZones.includes(zoneobj.zone)) {
                    zoneobj.wards?.forEach((wardobj: any) => {
                      if (!this.wardList.includes(wardobj.ward)) {
                        this.wardList.push(wardobj.ward);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
     
      // this.filterBeatList();
    }
     
    filterBeatList() {
      this.beatList = [];
      this.selectedBeatList = [];
     
      this.selectedProjects.forEach(pid => {
        const project = this.fullData.find(p => p.projectId === pid);
        project?.states?.forEach((stateobj: any) => {
          if (this.selectedZones.includes(stateobj.state)) {
            stateobj.districts?.forEach((districtobj: any) => {
              if (this.selectedWards.includes(districtobj.district)) {
                districtobj.zones?.forEach((zoneobj: any) => {
                  if (this.selectedSubZones.includes(zoneobj.zone)) {
                    zoneobj.wards?.forEach((wardobj: any) => {
                      // ✅ Use selectedWardList here, not wardList
                      if (this.selectedWardList.includes(wardobj.ward)) {
                        wardobj.beats?.forEach((beatobj: any) => {
                          if (!this.beatList.includes(beatobj.beat)) {
                            this.beatList.push(beatobj.beat);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
     
      // this.filterMachines(); // Optional next step
    }
     
    filterMachines() {
      this.beats = [];
      this.selectedBeats = [];
     
      this.selectedProjects.forEach(pid => {
        const project = this.fullData.find(p => p.projectId === pid);
        project?.states?.forEach((stateobj: any) => {
          if (this.selectedZones.includes(stateobj.state)) {
            stateobj.districts?.forEach((districtobj: any) => {
              if (this.selectedWards.includes(districtobj.district)) {
                districtobj.zones?.forEach((zoneobj: any) => {
                  if (this.selectedSubZones.includes(zoneobj.zone)) {
                    zoneobj.wards?.forEach((wardobj: any) => {
                      if (this.selectedWardList.includes(wardobj.ward)) {
                        wardobj.beats?.forEach((beatobj: any) => {
                          if (this.selectedBeatList.includes(beatobj.beat)) {
                            if (beatobj.machines) {
                              this.beats.push(...beatobj.machines);
                            }
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
    }
    refreshFilters1(): void {
      console.log('🔄 Refreshing Filters and clearing selections...');
   
      // Reset all filter FormControls to empty arrays
      this.stateFilter.setValue([]);
      this.districtFilter.setValue([]);
      this.machineFilter.setValue([]);
      this.stockStatusFilter.setValue([]);
      this.buttonStatusFilter.setValue([]);
      this.machineStatusFilter.setValue([]);

          // Reset the new filters
    this.zoneFilter.setValue([]);
    this.wardFilter.setValue([]);
    this.beatFilter.setValue([]);

   
      // Optionally reset dropdown states
      this.dropdownOpen = {};
   
      // Trigger data reload
      this.loadMachineData();
    }


    // refreshFilters(): void {
    //   console.log('🔄 Refreshing Filters and clearing selections...');
    
    //   // Use runOutsideAngular if there's heavy processing (optional)
    //   this.zone.runOutsideAngular(() => {
    //     // Reset all FormControl filters
    //     const filters = [
    //       this.stateFilter,
    //       this.districtFilter,
    //       this.machineFilter,
    //       this.stockStatusFilter,
    //       this.buttonStatusFilter,
    //       this.machineStatusFilter,
    //       this.zoneFilter,
    //       this.wardFilter,
    //       this.beatFilter
    //     ];
    
    //     filters.forEach(f => f.setValue([], { emitEvent: false }));
    
    //     // Reset dropdowns
    //     this.dropdownOpen = {};
    
    //     // Force detection & reload data inside Angular zone
    //     this.zones.run(() => {
    //       this.loadMachineData();
    //     });
    //   });
    // }
    
            
    refreshFilters(): void {
      window.location.reload();
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

    // navigateToZone(zoneId: number) {
    //   this.router.navigate(['/zone-dashboard']); // adjust if 'maps' is a lazy-loaded route
    // }

    navigateTo(route: string): void {
      this.router.navigate([`/${route}`]);
    }
  
    navigateToZone(zoneName: string): void {
      // Navigate to zone dashboard with the zone name as parameter
      this.router.navigate(['/zone-dashboard'], { 
        queryParams: { zone: zoneName } 
      });
    }

    
    navigateToGraph(graphType: string, zones: string[]): void {
      debugger;
      // Navigate to zone dashboard with the zone name as parameter
      this.router.navigate(['/graph-dashboard'], { 
        queryParams: { zone: zones } 
      });
    }
    

    // navigateToZone(zoneName: string): void {
    //   const url = this.router.serializeUrl(
    //     this.router.createUrlTree(['/zone-dashboard'], {
    //       queryParams: { zone: zoneName },
    //     })
    //   );
    //   window.open(url, '_blank');
    // }
    
    
  }









 
// import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { DataService } from '../../../service/data.service';
// import { CommonDataService } from '../../../Common/common-data.service';
// import * as maplibregl from 'maplibre-gl';
// import { Subscription, interval } from 'rxjs';
 
 
// @Component({
//   selector: 'app-google-maps',
//   templateUrl: './google-maps.component.html',
//   styleUrls: ['./google-maps.component.scss']
// })
// export class GoogleMapsComponent implements OnInit, AfterViewInit {
//   private map!: maplibregl.Map;
//   private markers: maplibregl.Marker[] = [];
//   isLoading = false;
//   errorMessage = '';
//   filterPanelOpen = true;
//   dropdownOpen: { [key: string]: boolean } = {};
//   machineSearchTerm: string = '';
//   districtSearchTerm: string = '';
//   stateSearchTerm: string = '';
//   stockOptions = [
//     { label: 'Empty', value: 0 },
//     { label: 'Low', value: 1 },
//     { label: 'Full', value: 2 }
//   ];
 
 
//   // Filters
//   stockStatusFilter = new FormControl<string[]>([]);
//   buttonStatusFilter = new FormControl<string[]>([]);
//   machineStatusFilter = new FormControl<string[]>([]);
//   stateFilter = new FormControl<string[]>([]);
//   districtFilter = new FormControl<string[]>([]);
//   machineFilter = new FormControl<string[]>([]);
 
//   machines: any[] = [];
//   states: string[] = [];
//   districts: string[] = [];
//   merchantId: string = '';
 
//   stateDistrictMap: { [state: string]: string[] } = {};
 
 
//   private autoRefreshSubscription!: Subscription;
// private refreshInterval = 120; // refresh interval in seconds
// private countdownInterval!: any;
// refreshCountdown = 0;
 
 
 
//   constructor(
//     private dataService: DataService,
//     private commonDataService: CommonDataService,
//     private cdr: ChangeDetectorRef
//   ) {}
 
//   ngOnInit(): void {
//     this.merchantId = this.commonDataService.merchantId ?? '';
 
//     // Simulate a page reload
//     if (!sessionStorage.getItem('reloaded')) {
//       sessionStorage.setItem('reloaded', 'true');
//       window.location.reload();
//     } else {
//       sessionStorage.removeItem('reloaded');
//       this.loadMachineData();
//     }
 
//       // Start auto-refresh functionality
//   this.startAutoRefresh();
 
//   // Start the countdown
//   this.startRefreshCountdown();
 
 
//     document.addEventListener('click', this.handleClickOutside.bind(this));
 
//       // Subscribe to state filter changes to dynamically update districts
//   this.stateFilter.valueChanges.subscribe((selectedStates: string[] | null) => {
//     if (selectedStates) {
//       const districtsSet = new Set<string>();
//       selectedStates.forEach(state => {
//         (this.stateDistrictMap[state] || []).forEach(d => districtsSet.add(d));
//       });
//       this.districts = Array.from(districtsSet);
//       this.districtFilter.setValue([]); // Clear district selection when state changes
//     }
//   });
 
//   }
 
 
//   ngOnDestroy() {
//     // Clean up subscriptions and intervals
//     if (this.autoRefreshSubscription) {
//       this.autoRefreshSubscription.unsubscribe();
//     }
   
//     if (this.countdownInterval) {
//       clearInterval(this.countdownInterval);
//     }
   
//   }
 
 
//   stateSearchText: string = ''; // Bind this to the input field
 
//   ngAfterViewInit(): void {
 
//       this.setupCustomPopupCloseHandler();
 
//     setTimeout(() => {
//       this.initializeMap(); // Call the new initializeMap method
//     }, 500);
//   }
 
 
//   // Add these methods to implement the auto-refresh functionality
// startAutoRefresh(): void {
//   // Refresh every 2 minutes (120,000 milliseconds)
//   this.autoRefreshSubscription = interval(120000).subscribe(() => {
//     console.log('🔄 Auto-refreshing data...');
//     this.loadMachineData(); // Replace with your data fetching method name
//     this.resetRefreshCountdown();
//   });
// }
 
// startRefreshCountdown(): void {
//   this.refreshCountdown = this.refreshInterval;
//   this.countdownInterval = setInterval(() => {
//     this.refreshCountdown--;
//     if (this.refreshCountdown <= 0) {
//       this.refreshCountdown = this.refreshInterval;
//     }
//   }, 1000);
// }
 
// get formattedRefreshTime(): string {
//   const minutes = Math.floor(this.refreshCountdown / 60).toString().padStart(1, '0');
//   const seconds = (this.refreshCountdown % 60).toString().padStart(2, '0');
//   return `${minutes}:${seconds}`;
// }
 
// resetRefreshCountdown(): void {
//   this.refreshCountdown = this.refreshInterval;
// }
 
// // Manually trigger refresh (you can call this from a button if needed)
// manualRefresh(): void {
//   this.loadMachineData(); // Replace with your data fetching method name
//   this.resetRefreshCountdown();
// }
 
 
//   // New method to initialize the map
//   initializeMap(): void {
//     this.map = new maplibregl.Map({
//       container: 'map',
//       style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
//       center: [78.9629, 20.5937],
//       zoom: 5
//     });
 
//     this.map.on('load', () => {
//       this.map.resize();
//       this.updateMap();
//       console.log('Map bounds:', this.map.getBounds());
//     });
 
//     this.map.on('moveend', () => this.updateMap());
//     this.map.on('zoomend', () => this.updateMap());
//   }
 
 
//     // 🔧 These are the missing methods
// zoomIn(): void {
//   if (this.map) {
//     this.map.zoomIn();
//   }
// }
 
// zoomOut(): void {
//   if (this.map) {
//     this.map.zoomOut();
//   }
// }
 
 
// searchTexts: { [key: string]: string } = {};
//   toggleFilterPanel(): void {
//     this.filterPanelOpen = !this.filterPanelOpen;
//   }
 
//   loadMachineData(): void {
//     this.isLoading = true;
//     this.errorMessage = '';
 
//     const userDetails = this.commonDataService.userDetails;
//     const machineIds = userDetails?.machineId ?? [];
//     const clientId = userDetails?.clientId ?? '';  // Extract clientId from userDetails
    

//     const queryParams: any = {
//       merchantId: this.merchantId,
//       machineId: this.machineFilter.value?.length ? this.machineFilter.value : machineIds,
//       machineStatus: this.machineStatusFilter.value?.length ? this.machineStatusFilter.value : ['1', '2'],
//       stockStatus: this.stockStatusFilter.value?.length ? this.stockStatusFilter.value : [],
//       burnStatus: this.buttonStatusFilter.value?.length ? this.buttonStatusFilter.value : [],
//       level1: this.stateFilter.value?.length ? this.stateFilter.value : userDetails?.state || [],
//       level2: this.districtFilter.value?.length ? this.districtFilter.value : userDetails?.district || [],
//       level3: clientId ? [clientId] : []  // Pass clientId into level3 if it's available
//     };
 
//     console.log('📡 API Call Params:', queryParams);
 
//     this.dataService.getMachineDashboardSummary(queryParams).subscribe(
//       (response: any) => {
//         console.log('✅ API Response:', response);
 
//         if (response?.code === 200 && response.data) {
//           this.machines = response.data.machines.map((machine: any) => ({
//             ...machine,
//             stockStatus: this.mapStockStatus(machine.stockStatus),
//             burnStatus: this.mapBurnStatus(machine.burningStatus),
//             state: machine.level1 ?? 'Unknown',
//             district: machine.level2 ?? 'Unknown',
//             burningCycles: machine.burningCycles ?? 0,
//             totalBurningCycles: machine.totalBurningCycles ?? 0,
//             totalBurningCount: machine.totalburningCount ?? 0,
//             itemsBurnt: machine.itemsBurnt ?? 0,
//             itemsDispensed: machine.itemsDispensed ?? 0,
//             collection: machine.collection ?? 0,
//             imsi: machine.imsi ?? 'N/A',
//             rssi: machine.rssi ?? 'N/A',
//             location: machine.latitude && machine.longitude
//               ? [parseFloat(machine.longitude), parseFloat(machine.latitude)]
//               : null
//           }));
 
 
//           this.states = [...new Set(this.machines.map(m => m.state).filter(Boolean))];
 
// this.stateDistrictMap = {};
// this.machines.forEach(machine => {
//   const state = machine.state;
//   const district = machine.district;
//   if (state && district) {
//     if (!this.stateDistrictMap[state]) {
//       this.stateDistrictMap[state] = [];
//     }
//     if (!this.stateDistrictMap[state].includes(district)) {
//       this.stateDistrictMap[state].push(district);
//     }
//   }
// });
 
 
//           this.updateMap();
//         } else {
//           console.warn('⚠️ No valid data received.');
//         }
 
//         this.isLoading = false;
//       },
//       (error) => {
//         console.error('❌ API Call Failed:', error);
//         this.isLoading = false;
//       }
//     );
//   }
 
//   mapBurnStatus(burnStatus: string | null): number {
//     return burnStatus?.toLowerCase() === 'burning' ? 2 : 1;
//   }
 
//   mapStockStatus(stockStatusArray: any[]): number {
//     if (!Array.isArray(stockStatusArray) || stockStatusArray.length === 0) return -1;
 
//     const stockStatus = stockStatusArray[0]?.SpringStatus; // Extract first element
//     console.log("Extracted Stock Status:", stockStatus);
 
//     switch (stockStatus) {
//       case 'Ok': return 2;
//       case 'Low Stock': return 1;
//       case 'No Stock': return 0;
//       default: return -1;
//     }
//   }
 
 
//   setupCustomPopupCloseHandler(): void {
//     document.addEventListener('click', (event: Event) => {
//       const target = event.target as HTMLElement;
     
//       if (target && target.classList.contains('custom-close-btn')) {
//         console.log('Custom close button clicked');
       
//         const machineId = target.getAttribute('data-machine-id');
//         const popupElement = target.closest('.maplibregl-popup');
 
//         if (popupElement) {
//           this.closePopup(popupElement, machineId);
//         }
//       }
//     // Only close when clicking outside popup AND not on the map
//     else if (!target.closest('.maplibregl-popup') &&
//              !target.closest('.maplibregl-canvas-container') &&
//              !target.closest('.maplibregl-map')) {
     
//       // User clicked outside any popup and not on the map - close all popups
//       const popups = document.querySelectorAll('.maplibregl-popup');
//       if (popups.length > 0) {
//         popups.forEach(popup => {
//           // Your existing code for closing popups...
//           // [...]
//         });
//       }
//     }
//   });
// }
 
 
 
//   // Add a helper method to close popups
// closePopup(popupElement: Element, machineId: string | null): void {
//   // Try to find the marker associated with this popup
//   if (machineId) {
//     const marker = this.markers.find(m => {
//       const popup = m.getPopup();
//       return popup && popup._content.innerHTML.includes(`data-machine-id="${machineId}"`);
//     });
   
//     // Close the popup through the marker if possible
//     if (marker) {
//       marker.getPopup().remove();
//       console.log(`Closed popup for machine: ${machineId} via marker`);
//       return;
//     }
//   }
 
//   // Fallback: Remove popup from DOM directly
//   popupElement.remove();
//   console.log(`Closed popup via direct DOM removal`);
// }
 
     
// updateMap(): void {
// console.log("🔄 updateMap() called!");
 
// // Clear old markers
// this.markers.forEach(marker => marker.remove());
// this.markers = [];
 
// // Get selected filters
// const selectedStates = this.stateFilter.value || [];
// const selectedDistricts = this.districtFilter.value || [];
// const selectedMachines = this.machineFilter.value || [];
// const selectedStockStatuses = this.stockStatusFilter.value || [];
// const selectedMachineStatuses = this.machineStatusFilter.value || [];
// const selectedBurnStatusesRaw = this.buttonStatusFilter.value || [];  // Convert to string
 
 
// console.log("🔥 Raw Burn Status Filter Value:", selectedBurnStatusesRaw);
//   // 🔹 Map burn status labels (e.g., "Burning", "Idle") to numeric values (1, 0)
//   const burnStatusMapping: Record<string, number> = {
//     "Burning": 2,
//     "Idle": 1
// };
 
// const selectedBurnStatuses = selectedBurnStatusesRaw.map((status: string) => burnStatusMapping[status]).filter(v => v !== undefined);
 
// console.log("🔥 Selected Burn Statuses (Mapped):", selectedBurnStatuses);
// console.log("🔥 Burn Status in Machines:", this.machines.map(m => `${m.machineId}: ${m.burnStatus}`));
 
 
// console.log("🗺️ Selected Filters:", {
//   selectedStates,
//   selectedDistricts,
//   selectedMachines,
//   selectedStockStatuses,
//   selectedMachineStatuses,
//   selectedBurnStatuses
// });
 
 
//     // ✅ Log Burn Status in Machines
//     console.log("🔥 Checking burnStatus values in machines:");
//     this.machines.forEach(machine => console.log(`Machine ID: ${machine.machineId}, Burn Status: ${machine.burnStatus}`));
 
 
// // ✅ Apply filtering with consistent value types
// const filteredMachines = this.machines.filter(machine =>
//   (selectedStates.length === 0 || selectedStates.includes(machine.level1)) &&
//   (selectedDistricts.length === 0 || selectedDistricts.includes(machine.level2)) &&
//   (selectedMachines.length === 0 || selectedMachines.includes(machine.machineId)) &&
//   (selectedStockStatuses.length === 0 || selectedStockStatuses.includes(machine.stockStatus)) &&
//   (selectedMachineStatuses.length === 0 || selectedMachineStatuses.includes(machine.status)) &&
//   (selectedBurnStatuses.length === 0 || selectedBurnStatuses.includes(machine.burnStatus)) // Ensure comparison is consistent
// );
 
// console.log("🔍 Filtered Machines:", filteredMachines);
 
// if (filteredMachines.length === 0) {
//   console.warn("⚠️ No matching machines found based on filters.");
// }
 
// // Handle overlapping markers
// const locationMap = new Map<string, number>();
 
// filteredMachines.forEach(machine => {
//   if (!machine.location) return;
 
//   const [lng, lat] = machine.location;
//   const key = `${lng},${lat}`;
 
//   if (locationMap.has(key)) {
//     const count = locationMap.get(key)! + 1;
//     locationMap.set(key, count);
 
//     const angle = (count * 45) * (Math.PI / 180);
//     const radius = 0.000001 * count;
//     machine.location = [
//       lng + radius * Math.cos(angle),
//       lat + radius * Math.sin(angle)
//     ];
//   } else {
//     locationMap.set(key, 1);
//   }
 
//   // Set marker icon dynamically based on stock status
//   const iconUrl = this.getStockStatusIcon(machine.stockStatus);
 
//   const markerElement = document.createElement('div');
//   markerElement.className = 'custom-marker';
//   markerElement.style.backgroundImage = `url(${iconUrl})`;
//   markerElement.style.width = '40px';
//   markerElement.style.height = '40px';
//   markerElement.style.backgroundSize = 'contain';
//   markerElement.style.backgroundRepeat = 'no-repeat';
 
 
// // In your updateMap method, create the popup with closeButton: false
// const popup = new maplibregl.Popup({
//   closeButton: false,  // Disable default close button, we'll use our custom one
//   closeOnClick: true  // Disable closing when clicking map
// }).setHTML(this.generatePopupHTML(machine));
 
//   // Create marker
//   const newMarker = new maplibregl.Marker({ element: markerElement })
//     .setLngLat(machine.location)
//     // .setPopup(new maplibregl.Popup().setHTML(this.generatePopupHTML(machine)))
//     .setPopup(popup)
//     .addTo(this.map);
 
//   this.markers.push(newMarker);
 
 
 
// });
 
// console.log("✅ Markers updated. Current count:", this.markers.length);
 
 
// }
 
//   getStockStatusIcon(status: number): string {
//     switch (status) {
//       case 2: return './assets/img/icon/green2.png';
//       case 1: return './assets/img/icon/yellow2.png';
//       case 0: return './assets/img/icon/red2.png';
//       default: return './assets/img/icon/pad1.png';
//     }
//   }
 
//   get machineIds(): string[] {
//     return this.machines.map(machine => machine.machineId);
//   }
 
 
//   generatePopupHTML(machine: any): string {
//     // Convert stock status number to text
// let stockStatusText = 'Unknown';
// switch (machine.stockStatus) {
// case 0: stockStatusText = 'Empty'; break;
// case 1: stockStatusText = 'Low'; break;
// case 2: stockStatusText = 'Full'; break;
// }
 
// // Convert burning status number to text
// let burningStatusText = 'Unknown';
// switch (machine.burnStatus) {
// case 1: burningStatusText = 'Idle'; break;
// case 2: burningStatusText = 'Burning'; break;
// }
 
//   return `
 
// <div style="position: relative; padding: 5px; background: white;">
 
//   <!-- Close Button -->
//   <button class="custom-close-btn" data-machine-id="${machine.machineId}"
//           style="position: absolute; top: 0px; right: 0px; background: #fff; border: 1px solid #ccc;
//                  width: 24px; height: 24px; border-radius: 10%; cursor: pointer;
//                  display: flex; align-items: center; justify-content: center; font-size: 16px;">
//     ×
//   </button>
 
//   <!-- Card Content -->
//   <h3 style="margin: 0 0 8px 0;">📍 Vending Machine</h3>
//      <p><strong>Machine ID:</strong> ${machine.machineId}</p>
//     <p><strong>State:</strong> ${machine.state}</p>
//     <p><strong>District:</strong> ${machine.district}</p>
//     <p><strong>Status:</strong> ${machine.status}</p>
//     <p><strong>Stock Status:</strong> ${stockStatusText}</p>
//     <p><strong>Burning Status:</strong> ${burningStatusText}</p>
//     <p><strong>Total Collection:</strong> ₹${machine.collection}</p>
//     <p><strong>Items Dispensed:</strong> ${machine.itemsDispensed}</p>
//     <p><strong>Address:</strong> ${machine.address}</p></div>`;
// }
 
//     // toggleDropdown(filterKey: string): void {
//     //   this.dropdownOpen[filterKey] = !this.dropdownOpen[filterKey];
//     //   this.cdr.detectChanges();
//     // }before adding the dropdwon fix
//     toggleDropdown(filterKey: string): void {
//       const isCurrentlyOpen = this.dropdownOpen[filterKey];
   
 
//       Object.keys(this.dropdownOpen).forEach(key => {
//         this.dropdownOpen[key] = false;
//       });
   
 
//       this.dropdownOpen[filterKey] = !isCurrentlyOpen;
   
//       this.cdr.detectChanges();
//     }
//     toggleSelectAll(filterControl: FormControl, items: string[]): void {
//       const allSelected = filterControl.value.length === items.length;
//       filterControl.setValue(allSelected ? [] : [...items]); // Toggle selection
//       console.log(`🔹 Updated ${filterControl} Selection: ${filterControl.value}`);
 
//       this.updateMap();
//     }
         
//     toggleSelection(filterControl: FormControl, value: number): void {
//       let selectedValues = filterControl.value || [];
   
//       if (selectedValues.includes(value)) {
//         selectedValues = selectedValues.filter((v : string | number) => v !== value);
//         console.log("updated selectedValues", selectedValues);
//       } else {
//         selectedValues.push(value);
//       }
   
//       filterControl.setValue(selectedValues);
//       console.log(`🔹 Updated Filter Selection: ${selectedValues}`);
 
//       this.updateMap();
//     }
         
//     refreshFilters(): void {
//       console.log('🔄 Refreshing Filters and clearing selections...');
   
//       // Reset all filter FormControls to empty arrays
//       this.stateFilter.setValue([]);
//       this.districtFilter.setValue([]);
//       this.machineFilter.setValue([]);
//       this.stockStatusFilter.setValue([]);
//       this.buttonStatusFilter.setValue([]);
//       this.machineStatusFilter.setValue([]);
   
//       // Optionally reset dropdown states
//       this.dropdownOpen = {};
   
//       // Trigger data reload
//       this.loadMachineData();
//     }
             
//     handleClickOutside(event: MouseEvent): void {
//       if (!event.target) return;
//       const target = event.target as HTMLElement;
//       if (target.closest('.dropdown-toggle') || target.closest('.dropdown-menu')) return;
 
//       Object.keys(this.dropdownOpen).forEach(key => {
//         this.dropdownOpen[key] = false;
//       });
 
//       this.cdr.detectChanges();
//     }
//   }
 
 