
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import * as maplibregl from 'maplibre-gl';
import { Subscription, interval } from 'rxjs';



// Define interfaces for hierarchical data
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
  machines: string[] | null;
}

interface State {
  state: string;
  districts: District[];
}

interface Project {
  projectId: number;
  projectName: string;
  states: State[];
}

interface HierarchyResponse {
  clientId: number;
  companyName: string;
  projects: Project[];
}




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
  merchantId: string = '';
    zones: string[] = [];
    wards: string[] = [];
    beats: string[] = [];
    
    stateDistrictMap: { [state: string]: string[] } = {};
    districtZoneMap: { [district: string]: string[] } = {};
    zoneWardMap: { [zone: string]: string[] } = {};
    wardBeatMap: { [ward: string]: string[] } = {};
    beatMachineMap: { [beat: string]: string[] } = {};

  
    hierarchicalData: HierarchyResponse | null = null;
    userId: number = 0;


  


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
    this.userId = this.commonDataService.userId ?? 0;

    // console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",this.userId)
    // console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",this.merchantId)

 
    // Simulate a page reload
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

  
  stateSearchText: string = ''; // Bind this to the input field
 
  ngAfterViewInit(): void {

      this.setupCustomPopupCloseHandler();

    setTimeout(() => {
      this.initializeMap(); // Call the new initializeMap method
    }, 500);
  }



  // Load hierarchical data from API
  loadHierarchicalData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log(`📡 Loading hierarchical data for merchant ${this.merchantId} and user ${this.userId}`);
    debugger;

    
    this.dataService.getUserDetailsByHierarchy(this.merchantId, this.userId).subscribe(
      (response: any) => {
        debugger;
        console.log('✅ Hierarchy API Response:', response);
        
        if (response?.code === 200 && response.data) {

          console.log('✅✅✅✅✅✅Hierarchy API Response:', response);

          this.hierarchicalData = response.data;
          this.processHierarchicalData();
          this.loadMachineData(); // Load machine data after hierarchy is processed
          debugger;
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
    debugger;
  }
  
  processHierarchicalData(): void {
    if (!this.hierarchicalData) return;


    console.log('🔄🔄🔄🔄🔄🔄🔄 Processing hierarchical data...',this.hierarchicalData);

      
    console.log('🔄 Processing hierarchical data...');
      
    // Reset all maps
    this.stateDistrictMap = {};
    this.districtZoneMap = {};
    this.zoneWardMap = {};
    this.wardBeatMap = {};
    this.beatMachineMap = {};
      
    // Reset all arrays
    this.states = [];
    this.districts = [];
    this.zones = [];
    this.wards = [];
    this.beats = [];
      
    // Process projects
    if (this.hierarchicalData.projects && Array.isArray(this.hierarchicalData.projects)) {
      this.hierarchicalData.projects.forEach(project => {
        // Process states from each project
        if (project.states && Array.isArray(project.states)) {
          project.states.forEach(state => {
            const stateName = state.state;
            if (!this.states.includes(stateName)) {
              this.states.push(stateName);

            }
              
            if (!this.stateDistrictMap[stateName]) {
              this.stateDistrictMap[stateName] = [];
            }
              
            // Process districts
            if (state.districts && Array.isArray(state.districts)) {
              state.districts.forEach(district => {
                const districtName = district.district;
                if (!this.stateDistrictMap[stateName].includes(districtName)) {
                  this.stateDistrictMap[stateName].push(districtName);
                }
                  
                if (!this.districtZoneMap[districtName]) {
                  this.districtZoneMap[districtName] = [];
                }
                  
                // Process zones
                if (district.zones && Array.isArray(district.zones)) {
                  district.zones.forEach(zone => {
                    const zoneName = zone.zone;
                    if (!this.districtZoneMap[districtName].includes(zoneName)) {
                      this.districtZoneMap[districtName].push(zoneName);
                    }
                      
                    if (!this.zoneWardMap[zoneName]) {
                      this.zoneWardMap[zoneName] = [];
                    }
                      
                    // Process wards
                    if (zone.wards && Array.isArray(zone.wards)) {
                      zone.wards.forEach(ward => {
                        const wardName = ward.ward;
                        if (!this.zoneWardMap[zoneName].includes(wardName)) {
                          this.zoneWardMap[zoneName].push(wardName);
                        }
                          
                        if (!this.wardBeatMap[wardName]) {
                          this.wardBeatMap[wardName] = [];
                        }
                          
                        // Process beats
                        if (ward.beats && Array.isArray(ward.beats)) {
                          ward.beats.forEach(beat => {
                            const beatName = beat.beat;
                            if (!this.wardBeatMap[wardName].includes(beatName)) {
                              this.wardBeatMap[wardName].push(beatName);
                            }
                              
                            // Store machines for this beat
                            this.beatMachineMap[beatName] = beat.machines || [];
                          });
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


    }
      
    // Log the processed data
    console.log('📊📊📊📊 Processed hierarchical data:');
    console.log('States:', this.states);
    console.log('State-District Map:', this.stateDistrictMap);
    console.log('District-Zone Map:', this.districtZoneMap);
    console.log('Zone-Ward Map:', this.zoneWardMap);
    console.log('Ward-Beat Map:', this.wardBeatMap);
    console.log('Beat-Machine Map:', this.beatMachineMap);
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
    console.log('📊 Updated available machines based on beats:', Array.from(machinesSet));
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
 
  // loadMachineData(): void {
  //   this.isLoading = true;
  //   this.errorMessage = '';
 
  //   // Build queryParams based on selected filters and hierarchical data
  //   const queryParams: any = {
  //     merchantId: this.merchantId,
  //     machineId: this.machineFilter.value?.length ? this.machineFilter.value : this.getAllSelectedMachines(),
  //     machineStatus: this.machineStatusFilter.value?.length ? this.machineStatusFilter.value : ['1', '2'],
  //     stockStatus: this.stockStatusFilter.value?.length ? this.stockStatusFilter.value : [],
  //     burnStatus: this.buttonStatusFilter.value?.length ? this.buttonStatusFilter.value : [],
  //     level1: this.stateFilter.value?.length ? this.stateFilter.value : this.states,
  //     level2: this.districtFilter.value?.length ? this.districtFilter.value : [],
  //     // Use direct parameter names for new filters
  //     zone: this.zoneFilter.value?.length ? this.zoneFilter.value : [],
  //     ward: this.wardFilter.value?.length ? this.wardFilter.value : [],
  //     beat: this.beatFilter.value?.length ? this.beatFilter.value : [],
  //   };
 
  //   console.log('📡 API Call Params:', queryParams);
 
  //   this.dataService.getMachineDashboardSummary(queryParams).subscribe(
  //     (response: any) => {
  //       console.log('✅ API Response:', response);
 
  //       if (response?.code === 200 && response.data) {
  //         this.machines = response.data.machines.map((machine: any) => ({
  //           ...machine,
  //           stockStatus: this.mapStockStatus(machine.stockStatus),
  //           burnStatus: this.mapBurnStatus(machine.burningStatus),

  //         // Ensure state and district are mapped correctly
  //         state: machine.level1 || 'Unknown',
  //         district: machine.level2 || 'Unknown',
  //         // Use the direct properties for zone, ward, beat
  //         zone: machine.zone || 'Unknown',
  //         ward: machine.ward || 'Unknown',
  //         beat: machine.beat || 'Unknown',

  //           burningCycles: machine.burningCycles ?? 0,
  //           totalBurningCycles: machine.totalBurningCycles ?? 0,
  //           totalBurningCount: machine.totalburningCount ?? 0,
  //           itemsBurnt: machine.itemsBurnt ?? 0,
  //           itemsDispensed: machine.itemsDispensed ?? 0,
  //           collection: machine.collection ?? 0,
  //           imsi: machine.imsi ?? 'N/A',
  //           rssi: machine.rssi ?? 'N/A',
  //           location: machine.latitude && machine.longitude
  //             ? [parseFloat(machine.longitude), parseFloat(machine.latitude)]
  //             : null
  //         }));
          

  //         this.updateMap();
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




// Fix for the loadMachineData function to properly map state data
loadMachineData(): void {
  this.isLoading = true;
  this.errorMessage = '';
 
  // Build queryParams based on selected filters and hierarchical data
  const queryParams: any = {
    merchantId: this.merchantId,
    machineId: this.machineFilter.value?.length ? this.machineFilter.value : this.getAllSelectedMachines(),
    machineStatus: this.machineStatusFilter.value?.length ? this.machineStatusFilter.value : ['1', '2'],
    stockStatus: this.stockStatusFilter.value?.length ? this.stockStatusFilter.value : [],
    burnStatus: this.buttonStatusFilter.value?.length ? this.buttonStatusFilter.value : [],
    // Fix: Only send specific state selections when chosen
    level1: this.stateFilter.value?.length ? this.stateFilter.value : [],
    level2: this.districtFilter.value?.length ? this.districtFilter.value : [],
    // Use direct parameter names for new filters
    zone: this.zoneFilter.value?.length ? this.zoneFilter.value : [],
    ward: this.wardFilter.value?.length ? this.wardFilter.value : [],
    beat: this.beatFilter.value?.length ? this.beatFilter.value : [],
  };
 
  console.log('📡 API Call Params:', queryParams);
 
  this.dataService.getMachineDashboardSummary(queryParams).subscribe(
    (response: any) => {
      console.log('✅ API Response:', response);
 
      if (response?.code === 200 && response.data) {
        // Add debugging to see raw data from API
        console.log('🔍 Raw Machine Data from API:', response.data.machines.slice(0, 3));
        
        this.machines = response.data.machines.map((machine: any) => {
          // CRITICAL FIX: Use the correct field names from API response
          // The API might be returning level1/level2 in different fields than expected
          const state = machine.level1 || machine.state || '';
          const district = machine.level2 || machine.district || '';
          
          console.log("❌❌❌❌❌❌",`Machine ${machine.machineId} - Raw level1: ${machine.level1}, Raw state: ${machine.state}`);
          
          const mappedMachine = {
            ...machine,
            stockStatus: this.mapStockStatus(machine.stockStatus),
            burnStatus: this.mapBurnStatus(machine.burningStatus),

            // Fix: Explicitly assign state and district from API response
            state: state,
            district: district,
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
        
        // IMPORTANT: Add debugging after mapping to see what values are being used
        console.log('🔍 First 3 Mapped Machines:', this.machines.slice(0, 3));
        console.log('🔍 Unique States After Mapping:', [...new Set(this.machines.map(m => m.state))]);
        
        this.updateMap();
      } else {
        console.warn('⚠️ No valid data received.');
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



  // loadMachineData(): void {
  //   this.isLoading = true;
  //   this.errorMessage = '';
   
  //   // Build queryParams based on selected filters and hierarchical data
  //   const queryParams: any = {
  //     merchantId: this.merchantId,
  //     machineId: this.machineFilter.value?.length ? this.machineFilter.value : this.getAllSelectedMachines(),
  //     machineStatus: this.machineStatusFilter.value?.length ? this.machineStatusFilter.value : ['1', '2'],
  //     stockStatus: this.stockStatusFilter.value?.length ? this.stockStatusFilter.value : [],
  //     burnStatus: this.buttonStatusFilter.value?.length ? this.buttonStatusFilter.value : [],
  //     // Fix: Only send specific state selections, not all states when none are selected
  //     level1: this.stateFilter.value?.length ? this.stateFilter.value : [],
  //     level2: this.districtFilter.value?.length ? this.districtFilter.value : [],
  //     // Use direct parameter names for new filters
  //     zone: this.zoneFilter.value?.length ? this.zoneFilter.value : [],
  //     ward: this.wardFilter.value?.length ? this.wardFilter.value : [],
  //     beat: this.beatFilter.value?.length ? this.beatFilter.value : [],
  //   };
   
  //   console.log('📡 API Call Params:', queryParams);
   
  //   this.dataService.getMachineDashboardSummary(queryParams).subscribe(
  //     (response: any) => {
  //       console.log('✅ API Response:', response);
   
  //       if (response?.code === 200 && response.data) {
  //         this.machines = response.data.machines.map((machine: any) => {
  //           // Fix: Ensure proper mapping of hierarchical data
  //           const mappedMachine = {
  //             ...machine,
  //             stockStatus: this.mapStockStatus(machine.stockStatus),
  //             burnStatus: this.mapBurnStatus(machine.burningStatus),
  
  //             // Fix: Properly map hierarchical data, ensuring values aren't 'Unknown' by default
  //             state: machine.level1 || '',
  //             district: machine.level2 || '',
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
  
  //           // Debug log to see what state value is coming from API
  //           console.log("⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️",`Machine ${machine.machineId} state: ${mappedMachine.state}, district: ${mappedMachine.district}`);
            
  //           return mappedMachine;
  //         });
          
  //         this.updateMap();
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
//   console.log("🗺️ 🗺️🗺️🗺️Current Filter Values:", {
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

// // console.log("🔥 Raw Burn Status Filter Value:", selectedBurnStatusesRaw);
//   // 🔹 Map burn status labels (e.g., "Burning", "Idle") to numeric values (1, 0)
//   const burnStatusMapping: Record<string, number> = {
//     "Burning": 2,
//     "Idle": 1
// };

// const selectedBurnStatuses = selectedBurnStatusesRaw.map((status: string) => burnStatusMapping[status]).filter(v => v !== undefined);

// // console.log("🔥 Selected Burn Statuses (Mapped):", selectedBurnStatuses);
// // console.log("🔥 Burn Status in Machines:", this.machines.map(m => `${m.machineId}: ${m.burnStatus}`));


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


//     // // ✅ Log Burn Status in Machines
//     // console.log("🔥 Checking burnStatus values in machines:");
//     // this.machines.forEach(machine => console.log(`Machine ID: ${machine.machineId}, Burn Status: ${machine.burnStatus}`));


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







// Fix for updateMap to correctly filter based on states
updateMap(): void {
  console.log("🔄 updateMap() called!");

  // Clear old markers
  this.markers.forEach(marker => marker.remove());
  this.markers = [];

  // Get selected filters
  console.log("All available states:", this.states);
  const selectedStates = this.stateFilter.value || [];
  console.log("Selected states from dropdown:", selectedStates);
  
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

  const selectedBurnStatuses = selectedBurnStatusesRaw
    .map((status: string) => burnStatusMapping[status])
    .filter(v => v !== undefined);

  // CRITICAL DEBUGGING: Compare selected states to actual states in machines
  if (selectedStates.length > 0) {
    console.log("🔍 Selected States from filter:", selectedStates);
    const availableStates = [...new Set(this.machines.map(m => m.state))];
    console.log("🔍 Available States in Machines:", availableStates);
    
    // Check if any selected states exist in the machines
    const existingStates = selectedStates.filter(state => availableStates.includes(state));
    console.log("🔍 Matching States:", existingStates);
  }

  // Filter machines based on selected filters
  const filteredMachines = this.machines.filter(machine => {

    console.log("this selcted machinessss", this.machines)
    // FIX: Check case-insensitive state matching and log specific information
    const stateMatches = selectedStates.length === 0 || 
                  selectedStates.some(state => {
                    const matches = machine.state.toLowerCase() === state.toLowerCase();
                    if (selectedStates.includes(state) && !matches) {
                      console.log(`State mismatch: Machine state "${machine.state}" != selected "${state}"`);
                    }
                    return matches;
                  });
    
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

    // Track why a machine is being filtered out (if it is)
    if (selectedStates.length > 0 && !stateMatches) {
      console.log(`Machine ${machine.machineId} filtered out - state: ${machine.state}`);
    }

    return stateMatches && districtMatch && zoneMatch && wardMatch && beatMatch && 
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


// // Fix 2: Updated updateMap method to properly filter machines
// updateMap(): void {
//   console.log("🔄 updateMap() called!");

//   // Clear old markers
//   this.markers.forEach(marker => marker.remove());
//   this.markers = [];

//   // Get selected filters

//   console.log("stsnb cxab cbnx cnbx cbn xcnbtstst", this.states)

//   const selectedStates = this.stateFilter.value || [];

//   console.log(" SELCTED STATE stsnb cxab cbnx cnbx cbn xcnbtstst", selectedStates)

//   const selectedDistricts = this.districtFilter.value || [];
//   const selectedZones = this.zoneFilter.value || [];
//   const selectedWards = this.wardFilter.value || [];
//   const selectedBeats = this.beatFilter.value || [];
//   const selectedMachines = this.machineFilter.value || [];
//   const selectedStockStatuses = this.stockStatusFilter.value || [];
//   const selectedMachineStatuses = this.machineStatusFilter.value || [];
//   const selectedBurnStatusesRaw = this.buttonStatusFilter.value || [];

//   // Log all filter values for debugging
//   console.log("🗺️ 🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️Current Filter Values:", {
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

//   const selectedBurnStatuses = selectedBurnStatusesRaw.map((status: string) => burnStatusMapping[status]).filter(v => v !== undefined);

//   // Fix: Additional debugging to help identify state matching issues
//   if (selectedStates.length > 0) {
//     console.log("🔍 Selected States:", selectedStates);
//     console.log("🔍 Available States in Machines:", [...new Set(this.machines.map(m => m.state))]);
//   }

//   const filteredMachines = this.machines.filter(machine => {
//     // Fix: Improved state matching logic to handle empty strings
//     const stateMatch = selectedStates.length === 0 || 
//                        (machine.state && selectedStates.includes(machine.state));
    
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

//     // Detailed debugging for matching
//     if (selectedStates.length > 0 && !stateMatch) {
//       console.log(`Machine ${machine.machineId} state ${machine.state} not in selected states ${selectedStates}`);
//     }

//     return stateMatch && districtMatch && zoneMatch && wardMatch && beatMatch && 
//            machineMatch && stockMatch && statusMatch && burnMatch;
//   });

//   console.log("🔍 Filtered Machines:", filteredMachines.length);

//   if (filteredMachines.length === 0) {
//     console.warn("⚠️ No matching machines found based on filters.");
//   }

//   // Rest of the updateMap function remains the same
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
 
 