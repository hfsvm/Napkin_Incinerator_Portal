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


//     // New filter FormControls
//     zoneFilter = new FormControl<string[]>([]);
//     wardFilter = new FormControl<string[]>([]);
//     beatFilter = new FormControl<string[]>([]);
    
//     // Arrays to hold filter options
//     zones: string[] = [];
//     wards: string[] = [];
//     beats: string[] = [];
    
//     // Maps to maintain relationships between hierarchical data
//     districtZoneMap: { [district: string]: string[] } = {};
//     zoneWardMap: { [zone: string]: string[] } = {};
//     wardBeatMap: { [ward: string]: string[] } = {};
    
//     // Your existing code remains the same
  


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


//               // Clear dependent filters
//               this.zoneFilter.setValue([]);
//               this.wardFilter.setValue([]);
//               this.beatFilter.setValue([]);
      
//     }
//   });

//       // Add these new subscriptions
//       this.districtFilter.valueChanges.subscribe((selectedDistricts: string[] | null) => {
//         if (selectedDistricts) {
//           const zonesSet = new Set<string>();
//           selectedDistricts.forEach(district => {
//             (this.districtZoneMap[district] || []).forEach(z => zonesSet.add(z));
//           });
//           this.zones = Array.from(zonesSet);
          
//           // Clear dependent filters
//           this.zoneFilter.setValue([]);
//           this.wardFilter.setValue([]);
//           this.beatFilter.setValue([]);
//         }
//       });
      
//       this.zoneFilter.valueChanges.subscribe((selectedZones: string[] | null) => {
//         if (selectedZones) {
//           const wardsSet = new Set<string>();
//           selectedZones.forEach(zone => {
//             (this.zoneWardMap[zone] || []).forEach(w => wardsSet.add(w));
//           });
//           this.wards = Array.from(wardsSet);
          
//           // Clear dependent filters
//           this.wardFilter.setValue([]);
//           this.beatFilter.setValue([]);
//         }
//       });
      
//       this.wardFilter.valueChanges.subscribe((selectedWards: string[] | null) => {
//         if (selectedWards) {
//           const beatsSet = new Set<string>();
//           selectedWards.forEach(ward => {
//             (this.wardBeatMap[ward] || []).forEach(b => beatsSet.add(b));
//           });
//           this.beats = Array.from(beatsSet);
          
//           // Clear dependent filter
//           this.beatFilter.setValue([]);
//         }
//       });
  

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
//       level3: clientId ? [clientId] : [],

//     // Replace these with the direct parameter names
//     zone: this.zoneFilter.value?.length ? this.zoneFilter.value : [],
//     ward: this.wardFilter.value?.length ? this.wardFilter.value : [],
//     beat: this.beatFilter.value?.length ? this.beatFilter.value : [],
    

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

//           // Ensure state and district are mapped correctly
//           state: machine.level1 || 'Unknown',
//           district: machine.level2 || 'Unknown',
//           // Use the direct properties for zone, ward, beat
//           zone: machine.zone || 'Unknown',
//           ward: machine.ward || 'Unknown',
//           beat: machine.beat || 'Unknown',

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



// // this.machines.forEach(machine => {
// //   const state = machine.state;
// //   const district = machine.district;
// //   if (state && district) {
// //     if (!this.stateDistrictMap[state]) {
// //       this.stateDistrictMap[state] = [];
// //     }
// //     if (!this.stateDistrictMap[state].includes(district)) {
// //       this.stateDistrictMap[state].push(district);
// //     }
// //   }
// // });

 
// //           this.updateMap();
// //         } else {
// //           console.warn('⚠️ No valid data received.');
// //         }
 
// //         this.isLoading = false;
// //       },
// //       (error) => {
// //         console.error('❌ API Call Failed:', error);
// //         this.isLoading = false;
// //       }
// //     );
// //   }
 
//         // Extract unique values for each filter
//         this.states = [...new Set(this.machines.map(m => m.state).filter(Boolean))];
//         this.districts = [...new Set(this.machines.map(m => m.district).filter(Boolean))];
//         this.zones = [...new Set(this.machines.map(m => m.zone).filter(Boolean))];
//         this.wards = [...new Set(this.machines.map(m => m.ward).filter(Boolean))];
//         this.beats = [...new Set(this.machines.map(m => m.beat).filter(Boolean))];

//         // Now build relationship maps
//         this.buildHierarchicalMaps();
        
//         // Force debug logging
//         console.log('📊 Processed states:', this.states);
//         console.log('📊 Processed districts:', this.districts);
//         console.log('📊 Processed zones:', this.zones);
//         console.log('📊 Processed wards:', this.wards);
//         console.log('📊 Processed beats:', this.beats);

//         // Sample machine data for debugging
//         if (this.machines.length > 0) {
//           console.log('📋 Sample machine data:', this.machines[0]);
//         }

//         this.updateMap();
//       } else {
//         console.warn('⚠️ No valid data received.');
//       }

//       this.isLoading = false;
//     },
//     (error) => {
//       console.error('❌ API Call Failed:', error);
//       this.isLoading = false;
//     }
//   );
// }  
// buildHierarchicalMaps(): void {
//   // Clear existing maps
//   this.stateDistrictMap = {};
//   this.districtZoneMap = {};
//   this.zoneWardMap = {};
//   this.wardBeatMap = {};

//   console.log('🔄 Building hierarchical maps from', this.machines.length, 'machines');

//   // Process each machine
//   this.machines.forEach(machine => {
//     const state = machine.state;
//     const district = machine.district;
//     const zone = machine.zone;
//     const ward = machine.ward;
//     const beat = machine.beat;
    
//     // State-District mapping
//     if (state && district && state !== 'Unknown' && district !== 'Unknown') {
//       if (!this.stateDistrictMap[state]) {
//         this.stateDistrictMap[state] = [];
//       }
//       if (!this.stateDistrictMap[state].includes(district)) {
//         this.stateDistrictMap[state].push(district);
//       }
//     }
    
//     // District-Zone mapping
//     if (district && zone && district !== 'Unknown' && zone !== 'Unknown') {
//       if (!this.districtZoneMap[district]) {
//         this.districtZoneMap[district] = [];
//       }
//       if (!this.districtZoneMap[district].includes(zone)) {
//         this.districtZoneMap[district].push(zone);
//       }
//     }
    
//     // Zone-Ward mapping
//     if (zone && ward && zone !== 'Unknown' && ward !== 'Unknown') {
//       if (!this.zoneWardMap[zone]) {
//         this.zoneWardMap[zone] = [];
//       }
//       if (!this.zoneWardMap[zone].includes(ward)) {
//         this.zoneWardMap[zone].push(ward);
//       }
//     }
    
//     // Ward-Beat mapping
//     if (ward && beat && ward !== 'Unknown' && beat !== 'Unknown') {
//       if (!this.wardBeatMap[ward]) {
//         this.wardBeatMap[ward] = [];
//       }
//       if (!this.wardBeatMap[ward].includes(beat)) {
//         this.wardBeatMap[ward].push(beat);
//       }
//     }
//   });

//   // Log the built maps for debugging
//   console.log('📊 State-District Map:', this.stateDistrictMap);
//   console.log('📊 District-Zone Map:', this.districtZoneMap);
//   console.log('📊 Zone-Ward Map:', this.zoneWardMap);
//   console.log('📊 Ward-Beat Map:', this.wardBeatMap);
// }
  
//   // Helper methods for updating options
//   updateZonesOptions(): void {
//     const selectedDistricts = this.districtFilter.value || [];
//     if (selectedDistricts.length > 0) {
//       const zonesSet = new Set<string>();
//       selectedDistricts.forEach(district => {
//         (this.districtZoneMap[district] || []).forEach(z => zonesSet.add(z));
//       });
//       this.zones = Array.from(zonesSet);
//     } else {
//       // If no districts selected, gather all zones
//       this.zones = [];
//       Object.values(this.districtZoneMap).forEach(zoneArray => {
//         zoneArray.forEach(zone => {
//           if (!this.zones.includes(zone)) {
//             this.zones.push(zone);
//           }
//         });
//       });
//     }
//   }
  
//   updateWardsOptions(): void {
//     const selectedZones = this.zoneFilter.value || [];
//     if (selectedZones.length > 0) {
//       const wardsSet = new Set<string>();
//       selectedZones.forEach(zone => {
//         (this.zoneWardMap[zone] || []).forEach(w => wardsSet.add(w));
//       });
//       this.wards = Array.from(wardsSet);
//     } else {
//       // If no zones selected, gather all wards
//       this.wards = [];
//       Object.values(this.zoneWardMap).forEach(wardArray => {
//         wardArray.forEach(ward => {
//           if (!this.wards.includes(ward)) {
//             this.wards.push(ward);
//           }
//         });
//       });
//     }
//   }
  
//   updateBeatsOptions(): void {
//     const selectedWards = this.wardFilter.value || [];
//     if (selectedWards.length > 0) {
//       const beatsSet = new Set<string>();
//       selectedWards.forEach(ward => {
//         (this.wardBeatMap[ward] || []).forEach(b => beatsSet.add(b));
//       });
//       this.beats = Array.from(beatsSet);
//     } else {
//       // If no wards selected, gather all beats
//       this.beats = [];
//       Object.values(this.wardBeatMap).forEach(beatArray => {
//         beatArray.forEach(beat => {
//           if (!this.beats.includes(beat)) {
//             this.beats.push(beat);
//           }
//         });
//       });
//     }
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
//     // Add these new filter values
//     const selectedZones = this.zoneFilter.value || [];
//     const selectedWards = this.wardFilter.value || [];
//     const selectedBeats = this.beatFilter.value || [];

// const selectedMachines = this.machineFilter.value || [];
// const selectedStockStatuses = this.stockStatusFilter.value || [];
// const selectedMachineStatuses = this.machineStatusFilter.value || [];
// const selectedBurnStatusesRaw = this.buttonStatusFilter.value || [];  // Convert to string



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
//   selectedZones,
//   selectedWards,
//   selectedBeats,

//   selectedMachines,
//   selectedStockStatuses,
//   selectedMachineStatuses,
//   selectedBurnStatuses
// });


//     // ✅ Log Burn Status in Machines
//     console.log("🔥 Checking burnStatus values in machines:");
//     this.machines.forEach(machine => console.log(`Machine ID: ${machine.machineId}, Burn Status: ${machine.burnStatus}`));


//     const filteredMachines = this.machines.filter(machine => {
//       const stateMatch = selectedStates.length === 0 || selectedStates.includes(machine.state);
//       const districtMatch = selectedDistricts.length === 0 || selectedDistricts.includes(machine.district);
//       const zoneMatch = selectedZones.length === 0 || selectedZones.includes(machine.zone);
//       const wardMatch = selectedWards.length === 0 || selectedWards.includes(machine.ward);
//       const beatMatch = selectedBeats.length === 0 || selectedBeats.includes(machine.beat);
//       const machineMatch = selectedMachines.length === 0 || selectedMachines.includes(machine.machineId);
//       const stockMatch = selectedStockStatuses.length === 0 || selectedStockStatuses.includes(machine.stockStatus);
//       const statusMatch = selectedMachineStatuses.length === 0 || selectedMachineStatuses.includes(machine.status);
//       const burnMatch = selectedBurnStatuses.length === 0 || selectedBurnStatuses.includes(machine.burnStatus);
  
//       // Detailed debugging for the first machine
//       if (machine === this.machines[0]) {
//         console.log('First machine filter details:', {
//           machine: machine.machineId,
//           stateMatch,
//           districtMatch,
//           zoneMatch,
//           wardMatch,
//           beatMatch,
//           machineMatch,
//           stockMatch,
//           statusMatch,
//           burnMatch
//         });
//       }
  
//       return stateMatch && districtMatch && zoneMatch && wardMatch && beatMatch && 
//              machineMatch && stockMatch && statusMatch && burnMatch;
//     });
  
// console.log("🔍 Filtered Machines:", filteredMachines.length);

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


//   // ✅ Zoom on double-click
// markerElement.addEventListener('dblclick', (e) => {
//   e.stopPropagation(); // Prevent map's default double-click zoom
//   this.map.flyTo({
//     center: machine.location,
//     zoom: 15,  // 🔍 Adjust zoom level as needed
//     speed: 5,
//     curve: 1,
//     easing(t) {
//       return t;
//     }
//   });
// });




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
//           <p><strong>Zone:</strong> ${machine.zone || 'N/A'}</p>
//       <p><strong>Ward:</strong> ${machine.ward || 'N/A'}</p>
//       <p><strong>Beat:</strong> ${machine.beat || 'N/A'}</p>
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

//           // Reset the new filters
//     this.zoneFilter.setValue([]);
//     this.wardFilter.setValue([]);
//     this.beatFilter.setValue([]);

   
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
 
  // New filter FormControls
  zoneFilter = new FormControl<string[]>([]);
  wardFilter = new FormControl<string[]>([]);
  beatFilter = new FormControl<string[]>([]);
  
  machines: any[] = [];
  states: string[] = [];
  districts: string[] = [];
  zones: string[] = [];
  wards: string[] = [];
  beats: string[] = [];
  
  merchantId: string = '';
  
  // Maps to maintain relationships between hierarchical data
  stateDistrictMap: { [state: string]: string[] } = {};
  districtZoneMap: { [district: string]: string[] } = {};
  zoneWardMap: { [zone: string]: string[] } = {};
  wardBeatMap: { [ward: string]: string[] } = {};
  
  private autoRefreshSubscription!: Subscription;
  private refreshInterval = 120; // refresh interval in seconds
  private countdownInterval!: any;
  refreshCountdown = 0;
  searchTexts: { [key: string]: string } = {};
  
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
      this.loadUserDetails();
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
        this.districtFilter.setValue([]);
        
        // Clear dependent filters
        this.zoneFilter.setValue([]);
        this.wardFilter.setValue([]);
        this.beatFilter.setValue([]);
      }
    });

    // Add these new subscriptions
    this.districtFilter.valueChanges.subscribe((selectedDistricts: string[] | null) => {
      if (selectedDistricts) {
        const zonesSet = new Set<string>();
        selectedDistricts.forEach(district => {
          (this.districtZoneMap[district] || []).forEach(z => zonesSet.add(z));
        });
        this.zones = Array.from(zonesSet);
        
        // Clear dependent filters
        this.zoneFilter.setValue([]);
        this.wardFilter.setValue([]);
        this.beatFilter.setValue([]);
      }
    });
      
    this.zoneFilter.valueChanges.subscribe((selectedZones: string[] | null) => {
      if (selectedZones) {
        const wardsSet = new Set<string>();
        selectedZones.forEach(zone => {
          (this.zoneWardMap[zone] || []).forEach(w => wardsSet.add(w));
        });
        this.wards = Array.from(wardsSet);
        
        // Clear dependent filters
        this.wardFilter.setValue([]);
        this.beatFilter.setValue([]);
      }
    });
      
    this.wardFilter.valueChanges.subscribe((selectedWards: string[] | null) => {
      if (selectedWards) {
        const beatsSet = new Set<string>();
        selectedWards.forEach(ward => {
          (this.wardBeatMap[ward] || []).forEach(b => beatsSet.add(b));
        });
        this.beats = Array.from(beatsSet);
        
        // Clear dependent filter
        this.beatFilter.setValue([]);
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
  
  stateSearchText: string = '';
 
  ngAfterViewInit(): void {
    this.setupCustomPopupCloseHandler();

    setTimeout(() => {
      this.initializeMap();
    }, 500);
  }

  // Load user details first to get hierarchical data
  loadUserDetails(): void {
    this.isLoading = true;
    const userDetails = this.commonDataService.userDetails;
    const userId = userDetails?.userId ?? '';
    
    console.log('📡 Loading User Details...');
    
    this.dataService.getUserDetails(this.merchantId, userId).subscribe(
      (response: any) => {
        console.log('✅ User Details Response:', response);
        
        if (response?.code === 200 && response.data) {
          // Update userDetails in commonDataService first
          this.commonDataService.userDetails = {
            ...userDetails,
            ...response.data
          };
          debugger;
          // Extract and store hierarchical data
          if (response.data.state) {
            this.states = response.data.state;
          }
          
          if (response.data.district) {
            this.districts = response.data.district;
          }
          
          // Extract zone, ward, beat data if available
          if (response.data.zone) {
            this.zones = response.data.zone;
          }
          
          if (response.data.ward) {
            this.wards = response.data.ward;
          }
          
          if (response.data.beat) {
            this.beats = response.data.beat;
          }
          
          // Build initial hierarchical maps if data is available
          this.buildInitialHierarchicalMaps(response.data);
          
          // Now load machine data
          this.loadMachineData();
        } else {
          console.warn('⚠️ No valid user data received.');
          this.loadMachineData(); // Still try to load machine data
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('❌ User Details API Call Failed:', error);
        this.loadMachineData(); // Still try to load machine data
        this.isLoading = false;
      }
    );
  }
  
  // Add method to build initial hierarchical maps from user details
  buildInitialHierarchicalMaps(userData: any): void {
    console.log('🔄 Building initial hierarchical maps from user data');
    
    // If we have state-district relationships in user data
    if (userData.stateDistrictMap) {
      this.stateDistrictMap = userData.stateDistrictMap;
    }
    // Otherwise try to build from separate arrays
    else if (userData.state && userData.district) {
      // This is a simplified approach - in real data, you'd need a proper mapping
      userData.state.forEach((state: string) => {
        this.stateDistrictMap[state] = userData.district;
      });
    }
    
    // Similar logic for other hierarchical relationships
    if (userData.districtZoneMap) {
      this.districtZoneMap = userData.districtZoneMap;
    }
    
    if (userData.zoneWardMap) {
      this.zoneWardMap = userData.zoneWardMap;
    }
    
    if (userData.wardBeatMap) {
      this.wardBeatMap = userData.wardBeatMap;
    }
    
    console.log('📊 Initial Hierarchical Maps:', {
      stateDistrict: this.stateDistrictMap,
      districtZone: this.districtZoneMap,
      zoneWard: this.zoneWardMap,
      wardBeat: this.wardBeatMap
    });
  }

  // Auto-refresh functionality
  startAutoRefresh(): void {
    // Refresh every 2 minutes (120,000 milliseconds)
    this.autoRefreshSubscription = interval(120000).subscribe(() => {
      console.log('🔄 Auto-refreshing data...');
      this.loadMachineData();
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

  manualRefresh(): void {
    this.loadMachineData();
    this.resetRefreshCountdown();
  }
 
  // Initialize the map
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
  
  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }
 
  loadMachineData(): void {
    this.isLoading = true;
    this.errorMessage = '';
 
    const userDetails = this.commonDataService.userDetails;
    const machineIds = userDetails?.machineId ?? [];
    const clientId = userDetails?.clientId ?? '';
 
    // IMPORTANT: Here's the fix - map the filter values to correct API parameters
    const queryParams: any = {
      merchantId: this.merchantId,
      machineId: this.machineFilter.value?.length ? this.machineFilter.value : machineIds,
      machineStatus: this.machineStatusFilter.value?.length ? this.machineStatusFilter.value : ['1', '2'],
      stockStatus: this.stockStatusFilter.value?.length ? this.stockStatusFilter.value : [],
      burnStatus: this.buttonStatusFilter.value?.length ? this.buttonStatusFilter.value : [],
      
      // Use level1-level4 parameters for hierarchical data
      level1: this.stateFilter.value?.length ? this.stateFilter.value : userDetails?.state || [],
      level2: this.districtFilter.value?.length ? this.districtFilter.value : userDetails?.district || [],
      level3: this.zoneFilter.value?.length ? this.zoneFilter.value : [], // Map zone to level3
      level4: this.wardFilter.value?.length ? this.wardFilter.value : [], // Map ward to level4
      
      // For beat, we need to check if API supports level5 or has a special parameter
      beat: this.beatFilter.value?.length ? this.beatFilter.value : [],
      
      // Keep clientId as level3 if no zones are selected
      ...(this.zoneFilter.value?.length === 0 && clientId ? { level3: [clientId] } : {})
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

            // Map data fields correctly - use property names from API response
            state: machine.level1 || 'Unknown',
            district: machine.level2 || 'Unknown',
            zone: machine.level3 || machine.zone || 'Unknown',  // Try both formats
            ward: machine.level4 || machine.ward || 'Unknown',  // Try both formats
            beat: machine.level5 || machine.beat || 'Unknown',  // Try both formats

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
 
          // Extract unique values for each filter and build hierarchical maps
          this.buildHierarchicalMaps();
          
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

  // Build relationships between hierarchical data from machine data
  buildHierarchicalMaps(): void {
    // Clear existing maps to rebuild with fresh data
    this.stateDistrictMap = {};
    this.districtZoneMap = {};
    this.zoneWardMap = {};
    this.wardBeatMap = {};

    console.log('🔄 Building hierarchical maps from', this.machines.length, 'machines');

    // Process each machine
    this.machines.forEach(machine => {
      const state = machine.state;
      const district = machine.district;
      const zone = machine.zone;
      const ward = machine.ward;
      const beat = machine.beat;
      
      // State-District mapping
      if (state && district && state !== 'Unknown' && district !== 'Unknown') {
        if (!this.stateDistrictMap[state]) {
          this.stateDistrictMap[state] = [];
        }
        if (!this.stateDistrictMap[state].includes(district)) {
          this.stateDistrictMap[state].push(district);
        }
      }
      
      // District-Zone mapping
      if (district && zone && district !== 'Unknown' && zone !== 'Unknown') {
        if (!this.districtZoneMap[district]) {
          this.districtZoneMap[district] = [];
        }
        if (!this.districtZoneMap[district].includes(zone)) {
          this.districtZoneMap[district].push(zone);
        }
      }
      
      // Zone-Ward mapping
      if (zone && ward && zone !== 'Unknown' && ward !== 'Unknown') {
        if (!this.zoneWardMap[zone]) {
          this.zoneWardMap[zone] = [];
        }
        if (!this.zoneWardMap[zone].includes(ward)) {
          this.zoneWardMap[zone].push(ward);
        }
      }
      
      // Ward-Beat mapping
      if (ward && beat && ward !== 'Unknown' && beat !== 'Unknown') {
        if (!this.wardBeatMap[ward]) {
          this.wardBeatMap[ward] = [];
        }
        if (!this.wardBeatMap[ward].includes(beat)) {
          this.wardBeatMap[ward].push(beat);
        }
      }
    });

    // Update filter option arrays
    this.states = [...new Set(this.machines.map(m => m.state).filter(Boolean))];
    this.districts = [...new Set(this.machines.map(m => m.district).filter(Boolean))];
    this.zones = [...new Set(this.machines.map(m => m.zone).filter(Boolean))];
    this.wards = [...new Set(this.machines.map(m => m.ward).filter(Boolean))];
    this.beats = [...new Set(this.machines.map(m => m.beat).filter(Boolean))];

    console.log('📊 Built Hierarchical Maps:', {
      stateDistrict: this.stateDistrictMap,
      districtZone: this.districtZoneMap,
      zoneWard: this.zoneWardMap,
      wardBeat: this.wardBeatMap
    });
  }
  
  // Helper methods for dynamic filter options
  updateZonesOptions(): void {
    const selectedDistricts = this.districtFilter.value || [];
    if (selectedDistricts.length > 0) {
      const zonesSet = new Set<string>();
      selectedDistricts.forEach(district => {
        (this.districtZoneMap[district] || []).forEach(z => zonesSet.add(z));
      });
      this.zones = Array.from(zonesSet);
    } else {
      // If no districts selected, gather all zones
      this.zones = [...new Set(this.machines.map(m => m.zone).filter(Boolean))];
    }
  }
  
  updateWardsOptions(): void {
    const selectedZones = this.zoneFilter.value || [];
    if (selectedZones.length > 0) {
      const wardsSet = new Set<string>();
      selectedZones.forEach(zone => {
        (this.zoneWardMap[zone] || []).forEach(w => wardsSet.add(w));
      });
      this.wards = Array.from(wardsSet);
    } else {
      // If no zones selected, gather all wards
      this.wards = [...new Set(this.machines.map(m => m.ward).filter(Boolean))];
    }
  }
  
  updateBeatsOptions(): void {
    const selectedWards = this.wardFilter.value || [];
    if (selectedWards.length > 0) {
      const beatsSet = new Set<string>();
      selectedWards.forEach(ward => {
        (this.wardBeatMap[ward] || []).forEach(b => beatsSet.add(b));
      });
      this.beats = Array.from(beatsSet);
    } else {
      // If no wards selected, gather all beats
      this.beats = [...new Set(this.machines.map(m => m.beat).filter(Boolean))];
    }
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
            this.closePopup(popup, null);
          });
        }
      }
    });
  }
  
  // Helper method to close popups
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
    const selectedZones = this.zoneFilter.value || [];
    const selectedWards = this.wardFilter.value || [];
    const selectedBeats = this.beatFilter.value || [];
    const selectedMachines = this.machineFilter.value || [];
    const selectedStockStatuses = this.stockStatusFilter.value || [];
    const selectedMachineStatuses = this.machineStatusFilter.value || [];
    const selectedBurnStatusesRaw = this.buttonStatusFilter.value || [];

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

    const selectedBurnStatuses = selectedBurnStatusesRaw.map((status: string) => burnStatusMapping[status]).filter(v => v !== undefined);

    // Filter machines based on selected filters
    const filteredMachines = this.machines.filter(machine => {
      const stateMatch = selectedStates.length === 0 || selectedStates.includes(machine.state);
      const districtMatch = selectedDistricts.length === 0 || selectedDistricts.includes(machine.district);
      const zoneMatch = selectedZones.length === 0 || selectedZones.includes(machine.zone);
      const wardMatch = selectedWards.length === 0 || selectedWards.includes(machine.ward);
      const beatMatch = selectedBeats.length === 0 || selectedBeats.includes(machine.beat);
      const machineMatch = selectedMachines.length === 0 || selectedMachines.includes(machine.machineId);
      const stockMatch = selectedStockStatuses.length === 0 || selectedStockStatuses.includes(machine.stockStatus);
      const statusMatch = selectedMachineStatuses.length === 0 || selectedMachineStatuses.includes(machine.status);
      const burnMatch = selectedBurnStatuses.length === 0 || selectedBurnStatuses.includes(machine.burnStatus);
  
      // Debug the first machine
      if (machine === this.machines[0]) {
        console.log('First machine filter details:', {
          machine: machine.machineId,
          stateMatch,
          districtMatch,
          zoneMatch,
          wardMatch,
          beatMatch,
          machineMatch,
          stockMatch,
          statusMatch,
          burnMatch
        });
      }
  
      return stateMatch && districtMatch && zoneMatch && wardMatch && beatMatch && 
             machineMatch && stockMatch && statusMatch && burnMatch;
    });
  
    console.log("🔍 Filtered Machines:", filteredMachines.length);

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

      // Zoom on double-click
      markerElement.addEventListener('dblclick', (e) => {
        e.stopPropagation(); // Prevent map's default double-click zoom
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

      // Create popup with custom close button
      const popup = new maplibregl.Popup({
        closeButton: false,  // Disable default close button
        closeOnClick: true   // Close when clicking elsewhere on map
      }).setHTML(this.generatePopupHTML(machine));

      // Create marker
      const newMarker = new maplibregl.Marker({ element: markerElement })
        .setLngLat(machine.location)
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

          // Reset the new filters
    this.zoneFilter.setValue([]);
    this.wardFilter.setValue([]);
    this.beatFilter.setValue([]);

   
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
