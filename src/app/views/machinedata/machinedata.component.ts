import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { DashboardRefreshService } from '../../service/dashboard-refresh.service';
import { Subscription, interval } from 'rxjs'; // Import interval and Subscription
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


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
  selector: 'app-machinedata',
  templateUrl: './machinedata.component.html',
  styleUrls: ['./machinedata.component.scss'],
})
export class MachinedataComponent implements OnInit, OnDestroy {
  private refreshSubscription!: Subscription; // Declare with '!' to avoid undefined error
  private autoRefreshSubscription!: Subscription; // Declare auto refresh subscription

  isLoading = false;
  errorMessage = '';
  machines: any[] = [];
  filteredMachines: any[] = [];
  userRole: string = ''; // Stores the role of the logged-in user
  isAdmin: boolean = false;
  isStateUser: boolean = false;
  isDistrictUser: boolean = false;
  isEndUser: boolean = false;
  private refreshInterval = 120; // refresh interval in seconds
  private countdownInterval!: any;
  refreshCountdown = 0;
  totalItems = 0;
  roleName: string = localStorage.getItem('roleName') || '';
  // Projects (from second code)
  // projects: { ProjectId: number, projectname: string }[] = [];

  // Pagination (from second code)
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedMachines: any[] = [];

  // Search functionality (from second code)
  searchQuery: string = '';
  // searchText: { [key: string]: string } = {};
  searchText: { [key: string]: string } = {
    projects: '',
    machineStatuses: '',
    stockStatuses: '',
    burnStatuses: '',
    zones: '',
    wards: '',
    beats: '',
  };

  // Filters
  machineStatuses = [
    { key: '1', value: 'Online' },
    { key: '2', value: 'Offline' },
  ];
  stockStatuses = [
    { key: '2', value: 'Full (Ok)' },
    { key: '0', value: 'Empty' },
    { key: '1', value: 'Low' },
  ];
  burnStatuses = [
    { key: '1', value: 'Idle' },
    { key: '2', value: 'Burning' },
  ];

  selectedMachineStatuses: string[] = ['1', '2'];
  selectedStockStatuses: string[] = [];
  selectedBurnStatuses: string[] = [];

  dropdownOpen: any = {};
  // searchText: any = {};

  // Initialize the variables you'll use for filtering
  fullData: any[] = [];
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
    mcSrNo: '',
    pcbNo: '',
    'Location Name': '',
    'Location Address': '',
    UID: '',
    'Machine Type': '',
    Status: '',
    'Stock Status': '',
    'Burning Status': '',
  };
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Initial arrays to store filter values
  initialZones: string[] = [];
  initialWards: string[] = [];
  initialBeats: string[] = [];
  initialProjects: { ProjectId: number; projectname: string }[] = [];

  projectsList: any[] = [];
  statesList: any[] = [];
  districtsList: any[] = [];
  machinesList: any[] = [];
hasZoneWardBeatStructure: boolean = false;
availableHierarchyLevels: string[] = [];

  constructor(
    private router: Router,
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private dashboardRefreshService: DashboardRefreshService
  ) {}

  // ngOnInit() {
  //   this.searchText = {
  //     projects: '',
  //     machineStatuses: '',
  //     stockStatuses: '',
  //     burnStatuses: '',
  //     zones: '',
  //     wards: '',
  //     beats: '',
  //   };

  //   this.dropdownOpen = {
  //     projects: false,
  //     machineStatuses: false,
  //     stockStatuses: false,
  //     burnStatuses: false,
  //     zones: false,
  //     wards: false,
  //     beats: false,
  //   };

  //   // this.loadMachineData();
  //   this.initialLoadMachineData();

  //   this.hierarchySelection = {
  //     state: [],
  //     district: [],
  //     zone: [],
  //     ward: [],
  //     beat: [],
  //     project: [],
  //   };

  //   // Subscribe to dashboard refresh
  //   this.refreshSubscription = this.dashboardRefreshService.refresh$.subscribe(
  //     () => {
  //       this.refreshDashboard();
  //     }
  //   );

  //   // Start auto-refresh functionality
  //   this.startAutoRefresh();

  //   // Start the countdown
  //   this.startRefreshCountdown(); // <-- Start the countdown here

  //   // Load machine data and user roles
  //   document.addEventListener('click', this.handleClickOutside.bind(this));
  //   this.loadUserRole();

  //   const merchantId = this.commonDataService.merchantId || '';
  //   const userId = this.commonDataService.userId || 0;

  //   this.dataService.getUserDetailsByHierarchy(merchantId, userId).subscribe({
  //     next: (response) => {
  //       if (response?.code === 200 && response?.data) {
  //         this.fullData = response.data.projects;
  //         // this.projects = this.fullData; // Assign projects to options

  //         this.projects = this.fullData.map((p: any) => ({
  //           ProjectId: p.projectId,
  //           projectname: p.projectName,
  //         }));

  //         this.selectedProjects = this.projects.map((p) => p.ProjectId);
  //         this.rebuildFilterChain('projects');
  //         console.log('Hierarchy Data: ', this.fullData);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching hierarchy data: ', error);
  //     },
  //   });
  // }


  ngOnInit() {

    if(this.commonDataService.merchantId === null || this.commonDataService.merchantId === undefined
      && this.commonDataService.userId === null || this.commonDataService.userId === undefined) {
     
      this.router.navigate(['/login']);
    }

  this.searchText = {
    projects: '',
    machineStatuses: '',
    stockStatuses: '',
    burnStatuses: '',
    zones: '',
    wards: '',
    selectedSubZones: '',
    selectedWardList: '',
    selectedBeatList: '',
    beats: '',
  };

  this.dropdownOpen = {
    projects: false,
    machineStatuses: false,
    stockStatuses: false,
    burnStatuses: false,
    zones: false,
    wards: false,
    selectedSubZones: false,
    selectedWardList: false,
    selectedBeatList: false,
    beats: false,
  };

  this.hierarchySelection = {
    state: [],
    district: [],
    zone: [],
    ward: [],
    beat: [],
    project: [],
  };


      this.initialLoadMachineData();

  // Subscribe to dashboard refresh
  this.refreshSubscription = this.dashboardRefreshService.refresh$.subscribe(
    () => {
      this.refreshDashboard();
    }
  );

  this.startAutoRefresh();
  this.startRefreshCountdown();
  document.addEventListener('click', this.handleClickOutside.bind(this));
  this.loadUserRole();

  const merchantId = this.commonDataService.merchantId || '';
  const userId = this.commonDataService.userId || 0;

  this.dataService.getUserDetailsByHierarchy(merchantId, userId).subscribe({
    next: (response) => {
      if (response?.code === 200 && response?.data) {
        this.fullData = response.data.projects;
        
        this.projects = this.fullData.map((p: any) => ({
          ProjectId: p.projectId,
          projectname: p.projectName,
        }));

        this.selectedProjects = this.projects.map((p) => p.ProjectId);
        
        // Analyze the data structure to determine available hierarchy levels
        this.analyzeDataStructure();
        
        this.rebuildFilterChain('projects');
        console.log('Hierarchy Data: ', this.fullData);
        console.log('Available Hierarchy Levels:', this.availableHierarchyLevels);
      }
    },
    error: (error) => {
      console.error('Error fetching hierarchy data: ', error);
    },
  });
}

// New method to analyze data structure and determine available hierarchy levels
analyzeDataStructure() {
  this.availableHierarchyLevels = ['projects', 'zones', 'wards']; // Always have these basic levels
  this.hasZoneWardBeatStructure = false;

  // Check if any project has the zone->ward->beat structure
  for (const project of this.fullData) {
    if (project.states) {
      for (const state of project.states) {
        if (state.districts) {
          for (const district of state.districts) {
            // Check if district has zones array and it's not empty
            if (district.zones && Array.isArray(district.zones) && district.zones.length > 0) {
              // Check if zones have wards
              for (const zone of district.zones) {
                if (zone.wards && Array.isArray(zone.wards) && zone.wards.length > 0) {
                  this.hasZoneWardBeatStructure = true;
                  this.availableHierarchyLevels.push('selectedSubZones', 'selectedWardList');
                  
                  // Check if wards have beats
                  for (const ward of zone.wards) {
                    if (ward.beats && Array.isArray(ward.beats) && ward.beats.length > 0) {
                      this.availableHierarchyLevels.push('selectedBeatList');
                      break;
                    }
                  }
                  break;
                }
              }
              if (this.hasZoneWardBeatStructure) break;
            }
          }
          if (this.hasZoneWardBeatStructure) break;
        }
      }
      if (this.hasZoneWardBeatStructure) break;
    }
  }

  // Always add beats/machines at the end
  this.availableHierarchyLevels.push('beats');
  
  // Remove duplicates
  this.availableHierarchyLevels = [...new Set(this.availableHierarchyLevels)];
}

// Method to check if a filter should be visible
shouldShowFilter(filterKey: string): boolean {
  return this.availableHierarchyLevels.includes(filterKey);
}

// Modified shouldDisableFilter method to handle dynamic structure
shouldDisableFilter(filterName: string): boolean {
  // First check if the filter should be shown at all
  const filterKeyMap: { [key: string]: string } = {
    'Client Name': 'projects',
    'State': 'zones',
    'District': 'wards',
    'Zone': 'selectedSubZones',
    'Ward': 'selectedWardList',
    'Beat': 'selectedBeatList',
    'Machines': 'beats'
  };

  const filterKey = filterKeyMap[filterName];
  if (filterKey && !this.shouldShowFilter(filterKey)) {
    return true; // Hide the filter
  }

  // Original disable logic
  switch (filterName) {
    case 'State':
      return this.selectedProjects.length === 0;
    case 'District':
      return this.selectedZones.length === 0;
    case 'Zone':
      return !this.hasZoneWardBeatStructure || this.selectedWards.length === 0;
    case 'Ward':
      return !this.hasZoneWardBeatStructure || this.selectedSubZones.length === 0;
    case 'Beat':
      return !this.hasZoneWardBeatStructure || this.selectedWardList.length === 0;
    case 'Machines':
      if (this.hasZoneWardBeatStructure) {
        return this.selectedBeatList.length === 0;
      } else {
        // For simple structure (state->district->machines)
        return this.selectedWards.length === 0;
      }
    default:
      return false;
  }
}

// Modified filterMachines method to handle both structures
filterMachines() {
  this.beats = [];
  this.selectedBeats = [];

  if (this.hasZoneWardBeatStructure) {
    // Handle zone->ward->beat->machines structure
    if (this.selectedBeatList.length === 0) {
      return;
    }

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      if (!project || !project.states) return;

      project.states.forEach((stateobj: any) => {
        if (this.selectedZones.includes(stateobj.state)) {
          if (!stateobj.districts) return;

          stateobj.districts.forEach((districtobj: any) => {
            if (this.selectedWards.includes(districtobj.district)) {
              if (!districtobj.zones) return;

              districtobj.zones.forEach((zoneobj: any) => {
                if (this.selectedSubZones.includes(zoneobj.zone)) {
                  if (!zoneobj.wards) return;

                  zoneobj.wards.forEach((wardobj: any) => {
                    if (this.selectedWardList.includes(wardobj.ward)) {
                      if (!wardobj.beats) return;

                      wardobj.beats.forEach((beatobj: any) => {
                        if (this.selectedBeatList.includes(beatobj.beat)) {
                          if (beatobj.machines && Array.isArray(beatobj.machines)) {
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
  } else {
    // Handle simple state->district->machines structure
    if (this.selectedWards.length === 0) {
      return;
    }

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      if (!project || !project.states) return;

      project.states.forEach((stateobj: any) => {
        if (this.selectedZones.includes(stateobj.state)) {
          if (!stateobj.districts) return;

          stateobj.districts.forEach((districtobj: any) => {
            if (this.selectedWards.includes(districtobj.district)) {
              // Directly get machines from district level
              if (districtobj.machines && Array.isArray(districtobj.machines)) {
                this.beats.push(...districtobj.machines);
              }
            }
          });
        }
      });
    });
  }

  this.selectedBeats = [...this.beats];
  console.log('Updated selectedBeats:', this.selectedBeats);
}

// Modified rebuildFilterChain to handle dynamic structure
rebuildFilterChain(startKey: string) {
  switch (startKey) {
    case 'projects':
      this.filterStates();
      this.filterWards();
      if (this.hasZoneWardBeatStructure) {
        this.filterSubZones();
        this.filterWardList();
        this.filterBeatList();
      }
      this.filterMachines();
      break;
    case 'zones':
    case 'state':
      this.filterWards();
      if (this.hasZoneWardBeatStructure) {
        this.filterSubZones();
        this.filterWardList();
        this.filterBeatList();
      }
      this.filterMachines();
      break;
    case 'wards':
    case 'district':
      if (this.hasZoneWardBeatStructure) {
        this.filterSubZones();
        this.filterWardList();
        this.filterBeatList();
      }
      this.filterMachines();
      break;
    case 'selectedSubZones':
    case 'zone':
      if (this.hasZoneWardBeatStructure) {
        this.filterWardList();
        this.filterBeatList();
      }
      this.filterMachines();
      break;
    case 'selectedWardList':
    case 'ward':
      if (this.hasZoneWardBeatStructure) {
        this.filterBeatList();
      }
      this.filterMachines();
      break;
    case 'selectedBeatList':
    case 'beat':
      this.filterMachines();
      break;
  }
}


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

  // Second change: Fix the issue with deselecting and reselecting in dropdowns

  // Updated toggleSelection method to properly handle deselection and reselection
  toggleSelection(selectedArray: any[], value: any, key: string) {
    const index = selectedArray.indexOf(value);
    if (index >= 0) {
      // Deselecting an item
      selectedArray.splice(index, 1);

      // Reset dependent selections when a parent item is deselected
      this.clearDependentSelections(key);
    } else {
      // Selecting an item
      selectedArray.push(value);
    }

    // Update the hierarchy selection
    this.updateHierarchySelection(key, selectedArray);

    // Always rebuild the entire filter chain to ensure consistency
    this.rebuildFilterChain(key);

    // Reload data with updated filters
    this.loadMachineData();
  }

  // Add a new method to handle clearing dependent selections
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

  updateHierarchySelection(key: string, selectedArray: any[]) {
    debugger;
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
  }

  filterStates() {
    this.zones = [];
    this.selectedZones = [];

    if (this.selectedProjects.length === 0) {
      // If no projects selected, clear all dependent filters
      this.clearDependentSelections('project');
      return;
    }

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((stateobj: any) => {
        if (!this.zones.includes(stateobj.state)) {
          this.zones.push(stateobj.state);
        }
      });
    });
    this.selectedZones = [...this.zones];
  }

  filterWards() {
    this.wards = [];
    this.selectedWards = [];

    if (this.selectedZones.length === 0) {
      // If no zones selected, clear all dependent filters
      this.clearDependentSelections('zones');
      return;
    }

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((stateobj: any) => {
        if (this.selectedZones.includes(stateobj.state)) {
          stateobj.districts?.forEach((districtobj: any) => {
            if (!this.wards.includes(districtobj.district)) {
              this.wards.push(districtobj.district);
            }
          });
        }
      });
    });
    this.selectedWards = [...this.wards];
  }

  filterSubZones() {
    this.subZones = [];
    this.selectedSubZones = [];

    if (this.selectedWards.length === 0) {
      // If no wards selected, clear all dependent filters
      this.clearDependentSelections('wards');
      return;
    }

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((stateobj: any) => {
        if (this.selectedZones.includes(stateobj.state)) {
          stateobj.districts?.forEach((districtobj: any) => {
            if (this.selectedWards.includes(districtobj.district)) {
              districtobj.zones?.forEach((zoneobj: any) => {
                if (!this.subZones.includes(zoneobj.zone)) {
                  this.subZones.push(zoneobj.zone);
                }
              });
            }
          });
        }
      });
    });
    this.selectedSubZones = [...this.subZones];
  }

  filterWardList() {
    this.wardList = [];
    this.selectedWardList = [];

    if (this.selectedSubZones.length === 0) {
      // If no subZones selected, clear all dependent filters
      this.clearDependentSelections('selectedSubZones');
      return;
    }

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
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
    this.selectedWardList = [...this.wardList];
  }

  filterBeatList() {
    this.beatList = [];
    this.selectedBeatList = [];

    if (this.selectedWardList.length === 0) {
      // If no wardList selected, clear all dependent filters
      this.clearDependentSelections('selectedWardList');
      return;
    }

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((stateobj: any) => {
        if (this.selectedZones.includes(stateobj.state)) {
          stateobj.districts?.forEach((districtobj: any) => {
            if (this.selectedWards.includes(districtobj.district)) {
              districtobj.zones?.forEach((zoneobj: any) => {
                if (this.selectedSubZones.includes(zoneobj.zone)) {
                  zoneobj.wards?.forEach((wardobj: any) => {
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
    this.selectedBeatList = [...this.beatList];
  }

  // filterMachines() {
  //   this.beats = [];
  //   this.selectedBeats = [];

  //   if (this.selectedBeatList.length === 0) {
  //     // If no beatList selected, clear the machines
  //     return;
  //   }

  //   this.selectedProjects.forEach((pid) => {
  //     const project = this.fullData.find((p) => p.projectId === pid);
  //     if (!project || !project.states) {
  //       console.warn(`Project with ID ${pid} not found or has no states`);
  //       return;
  //     }

  //     project.states.forEach((stateobj: any) => {
  //       if (this.selectedZones.includes(stateobj.state)) {
  //         if (!stateobj.districts) {
  //           console.warn(`State ${stateobj.state} has no districts`);
  //           return;
  //         }

  //         stateobj.districts.forEach((districtobj: any) => {
  //           if (this.selectedWards.includes(districtobj.district)) {
  //             if (!districtobj.zones) {
  //               console.warn(`District ${districtobj.district} has no zones`);
  //               return;
  //             }

  //             districtobj.zones.forEach((zoneobj: any) => {
  //               if (this.selectedSubZones.includes(zoneobj.zone)) {
  //                 if (!zoneobj.wards) {
  //                   console.warn(`Zone ${zoneobj.zone} has no wards`);
  //                   return;
  //                 }

  //                 zoneobj.wards.forEach((wardobj: any) => {
  //                   if (this.selectedWardList.includes(wardobj.ward)) {
  //                     if (!wardobj.beats) {
  //                       console.warn(`Ward ${wardobj.ward} has no beats`);
  //                       return;
  //                     }

  //                     wardobj.beats.forEach((beatobj: any) => {
  //                       if (this.selectedBeatList.includes(beatobj.beat)) {
  //                         if (
  //                           beatobj.machines &&
  //                           Array.isArray(beatobj.machines)
  //                         ) {
  //                           console.log(
  //                             `Adding machines from beat ${beatobj.beat}:`,
  //                             beatobj.machines
  //                           );
  //                           this.beats.push(...beatobj.machines);
  //                         } else {
  //                           console.warn(
  //                             `Beat ${beatobj.beat} has no machines or machines is not an array`
  //                           );
  //                         }
  //                       }
  //                     });
  //                   }
  //                 });
  //               }
  //             });
  //           }
  //         });
  //       }
  //     });
  //   });

  //   // Update selectedBeats with the contents of beats
  //   this.selectedBeats = [...this.beats];
  //   console.log('Updated selectedBeats:', this.selectedBeats);
  // }

  // rebuildFilterChain(startKey: string) {
  //   // Determine where to start rebuilding based on the changed key
  //   switch (startKey) {
  //     case 'projects':
  //       this.filterStates();
  //       this.filterWards();
  //       this.filterSubZones();
  //       this.filterWardList();
  //       this.filterBeatList();
  //       this.filterMachines();
  //       break;
  //     case 'zones':
  //     case 'state':
  //       this.filterWards();
  //       this.filterSubZones();
  //       this.filterWardList();
  //       this.filterBeatList();
  //       this.filterMachines();
  //       break;
  //     case 'wards':
  //     case 'district':
  //       this.filterSubZones();
  //       this.filterWardList();
  //       this.filterBeatList();
  //       this.filterMachines();
  //       break;
  //     case 'selectedSubZones':
  //     case 'zone':
  //       this.filterWardList();
  //       this.filterBeatList();
  //       this.filterMachines();
  //       break;
  //     case 'selectedWardList':
  //     case 'ward':
  //       this.filterBeatList();
  //       this.filterMachines();
  //       break;
  //     case 'selectedBeatList':
  //     case 'beat':
  //       this.filterMachines();
  //       break;
  //   }
  // }

  // Fix the toggleSelectAll method to properly update hierarchy and refresh data
  
  
  toggleSelectAll(selectedArray: any[], options: any[], key: string) {
    debugger;
    // Toggle select all logic
    if (selectedArray.length === options.length) {
      selectedArray.length = 0;

      // Clear dependent selections when deselecting all items
      this.clearDependentSelections(key);
    } else {
      selectedArray.length = 0;
      selectedArray.push(
        ...options.map((opt) => opt.ProjectId || opt.key || opt)
      );
    }

    // Update hierarchy selection
    this.updateHierarchySelection(key, selectedArray);

    // Rebuild the entire filter chain
    this.rebuildFilterChain(key);

    // Reload machine data with updated filters
    this.loadMachineData();
  }

  startAutoRefresh(): void {
    // Refresh every 2 minutes (120,000 milliseconds)
    this.autoRefreshSubscription = interval(120000).subscribe(() => {
      console.log('🔄 Auto-refreshing machine data...');
      this.loadMachineData();
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
    const minutes = Math.floor(this.refreshCountdown / 60)
      .toString()
      .padStart(1, '0');
    const seconds = (this.refreshCountdown % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  resetRefreshCountdown(): void {
    this.refreshCountdown = this.refreshInterval;
  }

  ngOnDestroy() {
    // Unsubscribe from refresh subscription
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    // Unsubscribe from auto-refresh subscription
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  refreshDashboard() {
    console.log('🔄 Dashboard Refresh Triggered...');
    // Logic to refresh dashboard data
    this.loadMachineData(); // Example, you can customize this
  }

  loadUserRole() {
    const userDetails = this.commonDataService.userDetails;
    console.log('❌❌❌ USERDATAdetails');

    if (!userDetails) {
      console.error('❌❌❌ No user details found!');
      return;
    }

    this.userRole = userDetails.roleName || ''; // Get user role from API response
    console.log('🔍 User Role:', this.userRole);

    this.isAdmin = this.userRole === 'Admin';
    this.isStateUser = this.userRole === 'State User';
    this.isDistrictUser = this.userRole === 'District User';
    this.isEndUser = this.userRole === 'End User';

    // Apply role-based restrictions
    this.applyRoleRestrictions();
  }

  applyRoleRestrictions() {
    const userDetails = this.commonDataService.userDetails;

    if (!userDetails) return;

    // For State User, allow selection of state
    if (this.isStateUser) {
      this.selectedZones = [userDetails.state[0]]; // Assign state for State User
    }

    // For District User, fix state and district, and disable state selection
    if (this.isDistrictUser) {
      this.selectedZones = [userDetails.state[0]]; // Fix state for District User
      this.selectedWards = [userDetails.district[0]]; // Assign district for District User
      // Disable the state dropdown for District User
    }

    // For End User, fix state, district, and project name
    if (this.isEndUser) {
      this.selectedZones = [userDetails.state[0]]; // Assign state for End User
      this.selectedWards = [userDetails.district[0]]; // Assign district for End User
      this.selectedBeats = [userDetails.projectName[0]]; // Fix project for End User
    }

    console.log('✅ Role-based filters applied:', {
      zones: this.selectedZones,
      wards: this.selectedWards,
      beats: this.selectedBeats,
      projects: this.selectedProjects,
    });
  }

  get totalPages(): number {
    this.totalItems = this.filteredMachines.length;
    return Math.ceil(this.filteredMachines.length / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  clearFilters() {
    // Reset selected filters
    this.selectedMachineStatuses = []; // Reset machine statuses to default (Online, Offline)
    this.selectedStockStatuses = []; // Clear stock statuses
    this.selectedBurnStatuses = []; // Clear burn statuses
    this.selectedZones = []; // Clear selected zones (states)
    this.selectedWards = []; // Clear selected wards (districts)
    this.selectedBeats = []; // Clear selected beats (machines)
    this.selectedProjects = []; // Clear selected projects
    this.selectedSubZones = []; // Clear selected Zones
    this.selectedWardList = []; // Clear selected wards
    this.selectedBeatList = []; // Clear selected beats

    // ✅ Reset search filters
    this.columnFilters = {
      'Machine ID': '',
      mcSrNo: '',
      pcbNo: '',
      'Location Name': '',
      'Location Address': '',
      Uid: '',
      'Machine Type': '',
      Status: '',
      'Stock Status': '',
      'Burning Status': '',
    };

    // // ✅ Reapply filtering logic if needed
    // this.applyFiltersAndSort();

    this.filteredMachines = [...this.machines]; // Reset the filtered machines list to the original list

    // Reset the pagination to the first page
    this.currentPage = 1;

    // Call the method to load the data with the cleared filters
    this.loadMachineData();

    // Optionally reset the columns in the dashboard data if needed
    this.dashboardData = {};
    console.log('✅ All filters cleared and data reloaded');
  }

  loadMachineData() {
    debugger;
    this.isLoading = true;
    this.errorMessage = '';

    const merchantId = this.commonDataService.merchantId ?? '';
    const userDetails = this.commonDataService.userDetails;

    const userDetail = this.userDatadetails;
    // console.log("123456789000000000==>",      [...this.hierarchySelection.state] )

    //     console.log("123456789000000000==>",[...this.selectedBeatList])
    debugger;
    const queryParams: any = {
      merchantId,
      machineStatus:
        this.selectedMachineStatuses.length > 0
          ? [...this.selectedMachineStatuses]
          : ['1', '2'],
      stockStatus:
        this.selectedStockStatuses.length > 0
          ? [...this.selectedStockStatuses]
          : [],
      burnStatus:
        this.selectedBurnStatuses.length > 0
          ? [...this.selectedBurnStatuses]
          : [],
      level3: [], // Default to empty array

      state:
        this.hierarchySelection.state.length > 0
          ? [...this.hierarchySelection.state]
          : [],
      district:
        this.hierarchySelection.district.length > 0
          ? [...this.hierarchySelection.district]
          : [],
      zone:
        this.hierarchySelection.zone.length > 0
          ? [...this.hierarchySelection.zone]
          : [],
      ward:
        this.hierarchySelection.ward.length > 0
          ? [...this.hierarchySelection.ward]
          : [],
      beat:
        this.hierarchySelection.beat.length > 0
          ? [...this.hierarchySelection.beat]
          : [],

      client: userDetails.clientId,
      project: userDetails.projectId,
    };
    debugger;
    if (this.selectedWardList.length > 0) {
      queryParams.ward = [...this.selectedWardList];
    }

    if (this.selectedSubZones.length > 0) {
      queryParams.zone = [...this.selectedSubZones];
    }
    if (this.selectedBeats.length > 0) {
      queryParams.machineId = [...this.selectedBeats];
    }

    console.log('query ', queryParams);

    console.log('machinedata dasboard clientid ', userDetails);

    console.log('📡 Final API Call Params:', queryParams);
    this.dataService.getMachineDashboardSummary(queryParams).subscribe(
      (response: any) => {
        debugger;
        console.log('✅ API Response:', response);
        if (response?.code === 200 && response.data) {
          this.machines = response.data.machines.map((machine: any) => ({
            ...machine,
            status: machine.status === 'Online' ? '1' : '2',
            stockStatus:
              machine.stockStatus?.length > 0
                ? machine.stockStatus
                    .map((stock: any) =>
                      stock.SpringStatus === 'Ok'
                        ? 'Full'
                        : stock.SpringStatus === 'No Stock'
                        ? 'Empty'
                        : stock.SpringStatus === 'Low Stock'
                        ? 'Low'
                        : 'N/A'
                    )
                    .join(', ')
                : 'N/A',
            burningStatus:
              machine.burningStatus?.toLowerCase() === 'burning' ? '2' : '1',
          }));

          this.filteredMachines = [...this.machines];

          // Reset to first page and paginate (from second code)
          this.currentPage = 1;
          this.paginateMachines();

          this.dashboardData = {
            ...response.data,
            machinesInstalled: response.data.machinesInstalled ?? 0,
            machinesRunning: response.data.machinesRunning ?? 0,
            stockEmpty: response.data.stockEmpty ?? 0,
            stockLow: response.data.stockLow ?? 0,
            stockOk: response.data.stockOk ?? 0,
            totalBurningCycles: response.data.totalBurningCycles ?? 0,
            totalCollection: response.data.totalCollection ?? 0,
            itemsDispensed: response.data.itemsDispensed ?? 0,
          };
        } else {
          console.warn('⚠️ No valid data received.');
          this.filteredMachines = [];
          this.paginatedMachines = []; // Clear paginated machines as well
        }

        this.isLoading = false;
      },
      (error) => {
        this.handleServerError(error);
      }
    );
  }

  initialLoadMachineData() {
    debugger;
    this.isLoading = true;
    this.errorMessage = '';
    const merchantId = this.commonDataService.merchantId;
    if (!merchantId) return;
    const userDetails = this.commonDataService.userDetails;
    if (!userDetails) return;

    // Extract states, districts, zones, wards, and beats from the nested structure
    const states =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.map((state: { state: any }) => state.state)
      ) || [];

    const districts =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.map(
            (district: { district: any }) => district.district
          )
        )
      ) || [];

    const zones =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.flatMap((district: { zones: any[] }) =>
            district.zones?.map((zone: { zone: any }) => zone.zone)
          )
        )
      ) || [];

    const wards =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.flatMap((district: { zones: any[] }) =>
            district.zones?.flatMap((zone: { wards: any[] }) =>
              zone.wards?.map((ward: { ward: any }) => ward.ward)
            )
          )
        )
      ) || [];

    const beats =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.flatMap((district: { zones: any[] }) =>
            district.zones?.flatMap((zone: { wards: any[] }) =>
              zone.wards?.flatMap((ward: { beats: any[] }) =>
                ward.beats?.map((beat: { beat: any }) => beat.beat)
              )
            )
          )
        )
      ) || [];

    const queryParams: any = {
      merchantId: merchantId,
      machineStatus: ['1', '2'],
      stockStatus: ['0', '1', '2'],
      burnStatus: ['1', '2'],
      level1: states.join(','),
      level2: districts.join(','),
      level3: userDetails.companyName?.[0]?.ClientId || '',
      machineId: userDetails.machines?.join(',') || '',
      client: userDetails.clientId,
      project: userDetails.projectId,
      zone: zones.join(','),
      ward: wards.join(','),
      beat: beats.join(','),
    };

    console.log('📡 Final API Call Params:', queryParams);
    this.dataService.getMachineDashboardSummary(queryParams).subscribe(
      (response: any) => {
        debugger;
        console.log('✅ API Response:', response);
        if (response?.code === 200 && response.data) {
          this.machines = response.data.machines.map((machine: any) => ({
            ...machine,
            status: machine.status === 'Online' ? '1' : '2',
            stockStatus:
              machine.stockStatus?.length > 0
                ? machine.stockStatus
                    .map((stock: any) =>
                      stock.SpringStatus === 'Ok'
                        ? 'Full'
                        : stock.SpringStatus === 'No Stock'
                        ? 'Empty'
                        : stock.SpringStatus === 'Low Stock'
                        ? 'Low'
                        : 'N/A'
                    )
                    .join(', ')
                : 'N/A',
            burningStatus:
              machine.burningStatus?.toLowerCase() === 'burning' ? '2' : '1',
          }));

          this.filteredMachines = [...this.machines];

          // Reset to first page and paginate (from second code)
          this.currentPage = 1;
          this.paginateMachines();

          this.dashboardData = {
            ...response.data,
            machinesInstalled: response.data.machinesInstalled ?? 0,
            machinesRunning: response.data.machinesRunning ?? 0,
            stockEmpty: response.data.stockEmpty ?? 0,
            stockLow: response.data.stockLow ?? 0,
            stockOk: response.data.stockOk ?? 0,
            totalBurningCycles: response.data.totalBurningCycles ?? 0,
            totalCollection: response.data.totalCollection ?? 0,
            itemsDispensed: response.data.itemsDispensed ?? 0,
          };
        } else {
          console.warn('⚠️ No valid data received.');
          this.filteredMachines = [];
          this.paginatedMachines = []; // Clear paginated machines as well
        }

        this.isLoading = false;
      },
      (error) => {
        this.handleServerError(error);
      }
    );
  }

  /** ✅ Function to Format Address & Machine Location */
  formatText(text: string | null): string {
    if (!text) return '';

    return text
      .toLowerCase() // Convert entire text to lowercase first
      .split(' ') // Split by spaces
      .map((word) => {
        // Check if word starts with a number (like "03visakhapatnam")
        if (/^\d/.test(word)) {
          return word; // Keep numbers unchanged
        }
        // Capitalize first letter of each word
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' '); // Join words back into a sentence
  }
  getLastTwoParts(address: string | null): string {
    if (!address) return ''; // Handle empty or null case

    // Split by commas and remove extra spaces
    const parts = address.split(',').map((part) => part.trim());

    // Get the last two meaningful parts
    const lastTwoParts = parts.slice(-2).join(', ');

    console.log('Original Address:', address, '| Extracted:', lastTwoParts); // Debugging

    return lastTwoParts;
  }
  getLastPartAfterLastComma(address: string | null): string {
    if (!address) return 'No Address'; // Handle empty or null case

    // Check if the address contains a comma
    const lastCommaIndex = address.lastIndexOf(',');

    if (lastCommaIndex !== -1) {
      // If there's a comma, return the part after the last comma
      const partAfterLastComma = address.substring(lastCommaIndex + 1).trim();
      return partAfterLastComma || 'No Address'; // Handle empty case after the comma
    } else {
      // If there's no comma, return the last two words
      const words = address.trim().split(' '); // Split by spaces
      const lastTwoWords = words.slice(-2).join(' '); // Get the last two words
      return lastTwoWords || 'No Address'; // Handle case where there are less than two words
    }
  }

  paginateMachines() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMachines = this.filteredMachines.slice(start, end);
    console.log('Paginated Machines:', this.paginatedMachines);
  }

  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.filteredMachines = [...this.machines];
    } else {
      this.filteredMachines = this.machines.filter(
        (machine) =>
          machine.machineId.includes(this.searchQuery) ||
          machine.uid?.includes(this.searchQuery) ||
          machine.pcbNo?.includes(this.searchQuery) ||
          machine.mcSrNo?.includes(this.searchQuery) ||
          machine.machineType?.includes(this.searchQuery) ||
          machine.status?.includes(this.searchQuery) ||
          machine.stockStatus?.includes(this.searchQuery) ||
          machine.burningStatus?.includes(this.searchQuery)
      );
    }

    this.currentPage = 1;
    this.paginateMachines();

    console.log('Filtered Machines after search:', this.filteredMachines);

    const totalPages = Math.ceil(
      this.filteredMachines.length / this.itemsPerPage
    );
    console.log('Total Pages:', totalPages);

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages > 0 ? totalPages : 1;
    }

    console.log('Current Page after search:', this.currentPage);
    this.paginateMachines();
  }

  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Prevent closing when clicking the dropdown button
    if (target.closest('.dropdown-toggle')) {
      return;
    }

    // Prevent closing when clicking inside the dropdown menu
    if (target.closest('.dropdown-menu')) {
      return;
    }

    // Close all dropdowns when clicking outside
    Object.keys(this.dropdownOpen).forEach((key) => {
      this.dropdownOpen[key] = false;
      this.searchText[key] = ''; // Clear search text for each closed dropdown
    });

    console.log('❌ Clicked outside, closed all dropdowns.');
  }

  handleServerError(error: any) {
    console.error('❌ Server Error:', error);
    this.errorMessage =
      error.status === 0
        ? '🚨 No internet connection. Please check your network.'
        : error.status === 404
        ? '⚠️ No data found for the selected filters.'
        : error.status >= 500
        ? '🔴 Server error!.'
        : 'An unexpected error occurred. Please try again.';

    this.isLoading = false;
  }

  refreshData() {
    console.log('🔄 Refreshing Data...');
    this.loadMachineData();
  }

  sortData(key: string) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    this.filteredMachines = this.machines.filter((machine) => {
      const mcSrNo = machine.mcSrNo?.toLowerCase() || '';
      const pcbNo = machine.pcbNo?.toLowerCase() || '';
      const locationAddress = machine.address?.toLowerCase() || '';
      // const locationName = this.getLastPartAfterLastComma(
      //   machine.address || ''
      // ).toLowerCase();
      const locationName = this.getLastPartAfterLastComma(
        machine.zone + machine.ward + machine.beat || ''
      ).toLowerCase();
      const uid = machine.uid?.toLowerCase() || '';

      return (
        (!this.columnFilters['Machine ID'] ||
          machine.machineId
            .toLowerCase()
            .includes(this.columnFilters['Machine ID'].toLowerCase())) &&
        (!this.columnFilters['MC SrNo'] ||
          mcSrNo
            .toLowerCase()
            .includes(this.columnFilters['MC SrNo'].toLowerCase())) &&
        (!this.columnFilters['Pcb No'] ||
          pcbNo
            .toLowerCase()
            .includes(this.columnFilters['Pcb No'].toLowerCase())) &&
        (!this.columnFilters['Machine Type'] ||
          machine.machineType
            .toLowerCase()
            .includes(this.columnFilters['Machine Type'].toLowerCase())) &&
        (!this.columnFilters['Status'] ||
          (machine.status === '1' ? 'Online' : 'Offline')
            .toLowerCase()
            .includes(this.columnFilters['Status'].toLowerCase())) &&
        (!this.columnFilters['Stock Status'] ||
          machine.stockStatus
            .toLowerCase()
            .includes(this.columnFilters['Stock Status'].toLowerCase())) &&
        (!this.columnFilters['Burning Status'] ||
          this.getBurningStatusLabel(machine.burningStatus)
            .toLowerCase()
            .includes(this.columnFilters['Burning Status'].toLowerCase())) &&
        (!this.columnFilters['Location Address'] ||
          locationAddress.includes(
            this.columnFilters['Location Address'].toLowerCase()
          )) &&
        (!this.columnFilters['Location Name'] ||
          locationName.includes(
            this.columnFilters['Location Name'].toLowerCase()
          )) &&
        (!this.columnFilters['Uid'] ||
          uid.includes(this.columnFilters['Uid'].toLowerCase()))
      );
    });

    if (this.sortKey) {
      this.filteredMachines.sort((a, b) => {
        const valueA = a[this.sortKey]?.toString().toLowerCase();
        const valueB = b[this.sortKey]?.toString().toLowerCase();
        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  getBurningStatusLabel(status: string): string {
    if (status === '2') return 'Burning';
    if (status === '1') return 'Idle';
    return 'N/A';
  }

  // shouldDisableFilter(filterName: string): boolean {
  //   switch (this.roleName) {
  //     case 'Client':
  //       return filterName === 'Client Name';
  //     case 'State User':
  //       return filterName === 'Client Name' || filterName === 'State';
  //     case 'District User':
  //       return (
  //         filterName === 'Client Name' ||
  //         filterName === 'State' ||
  //         filterName === 'District'
  //       );
  //     case 'Zone User':
  //       return (
  //         filterName === 'Client Name' ||
  //         filterName === 'State' ||
  //         filterName === 'District' ||
  //         filterName === 'Zone'
  //       );
  //     case 'Ward User':
  //       return (
  //         filterName === 'Client Name' ||
  //         filterName === 'State' ||
  //         filterName === 'District' ||
  //         filterName === 'Zone' ||
  //         filterName === 'Ward'
  //       );
  //     case 'Beat User':
  //       return (
  //         filterName === 'Client Name' ||
  //         filterName === 'State' ||
  //         filterName === 'District' ||
  //         filterName === 'Zone' ||
  //         filterName === 'Ward' ||
  //         filterName === 'Beat'
  //       );
  //     default:
  //       return false;
  //   }
  // }

  // initializeDefaultSelections() {
  //   // Set default status filters
  //   this.selectedMachineStatuses = ['1', '2']; // Show both Online (1) and Offline (2) by default
  //   this.selectedStockStatuses = []; // Start with none selected (or set defaults if needed)
  //   this.selectedBurnStatuses = []; // Start with none selected (or set defaults if needed)

  //   // Initialize hierarchy selection object
  //   this.hierarchySelection = {
  //     state: [],
  //     district: [],
  //     zone: [],
  //     ward: [],
  //     beat: [],
  //     project: [],
  //   };

  //   // Set default project selections (select all if available)
  //   if (this.projects && this.projects.length > 0) {
  //     this.selectedProjects = this.projects.map((p) => p.ProjectId);
  //     this.hierarchySelection.project = [...this.selectedProjects];

  //     // After setting projects, initialize dependent filters
  //     this.filterStates();
  //     if (this.zones && this.zones.length > 0) {
  //       this.selectedZones = this.zones.map((z) => z.key);
  //       this.hierarchySelection.state = [...this.selectedZones];

  //       this.filterWards();
  //       if (this.wards && this.wards.length > 0) {
  //         this.selectedWards = this.wards.map((w) => w.key);
  //         this.hierarchySelection.district = [...this.selectedWards];

  //         this.filterSubZones();
  //         if (this.subZones && this.subZones.length > 0) {
  //           this.selectedSubZones = this.subZones.map((sz) => sz.key);
  //           this.hierarchySelection.zone = [...this.selectedSubZones];

  //           this.filterWardList();
  //           if (this.wardList && this.wardList.length > 0) {
  //             this.selectedWardList = this.wardList.map((wl) => wl.key);
  //             this.hierarchySelection.ward = [...this.selectedWardList];

  //             this.filterBeatList();
  //             if (this.beatList && this.beatList.length > 0) {
  //               this.selectedBeatList = this.beatList.map((bl) => bl.key);
  //               this.hierarchySelection.beat = [...this.selectedBeatList];

  //               this.filterMachines();
  //               if (this.beats && this.beats.length > 0) {
  //                 this.selectedBeats = this.beats.map((b) => b.key);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }

  //   // Initialize search text objects for all dropdowns
  //   this.searchText = {
  //     projects: '',
  //     zones: '',
  //     wards: '',
  //     selectedSubZones: '',
  //     selectedWardList: '',
  //     selectedBeatList: '',
  //     beats: '',
  //   };

  //   // Initialize dropdown open state
  //   this.dropdownOpen = {
  //     projects: false,
  //     machineStatuses: false,
  //     stockStatuses: false,
  //     burnStatuses: false,
  //     zones: false,
  //     wards: false,
  //     selectedSubZones: false,
  //     selectedWardList: false,
  //     selectedBeatList: false,
  //     beats: false,
  //   };

  //   // After initializing all selections, load the data
  //   this.loadMachineData();
  // }
}
