import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { DashboardRefreshService } from '../../service/dashboard-refresh.service';
import { Subscription, interval } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

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
  private refreshSubscription!: Subscription;
  private autoRefreshSubscription!: Subscription;

  isLoading = false;
  errorMessage = '';
  isDataLoaded = false;
  machines: any[] = [];
  filteredMachines: any[] = [];
  userRole: string = '';
  isAdmin: boolean = false;
  isStateUser: boolean = false;
  isDistrictUser: boolean = false;
  isEndUser: boolean = false;
  private refreshInterval = 120;
  private countdownInterval!: any;
  refreshCountdown = 0;
  totalItems = 0;
  roleName: string = localStorage.getItem('roleName') || '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedMachines: any[] = [];

  // Search functionality
  searchQuery: string = '';
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
    machine: string[];
  } = {
    state: [],
    district: [],
    zone: [],
    ward: [],
    beat: [],
    project: [],
    machine: [],
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
    'Installed Date': '',
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

  constructor(
    private router: Router,
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private dashboardRefreshService: DashboardRefreshService,
  ) {}

  ngOnInit() {
    if (
      this.commonDataService.merchantId === null ||
      (this.commonDataService.merchantId === undefined &&
        this.commonDataService.userId === null) ||
      this.commonDataService.userId === undefined
    ) {
      this.router.navigate(['/login']);
      return;
    }

    this.searchText = {
      projects: '',
      machineStatuses: '',
      stockStatuses: '',
      burnStatuses: '',
      zones: '',
      wards: '',
      beats: '',
    };

    this.dropdownOpen = {
      projects: false,
      machineStatuses: false,
      stockStatuses: false,
      burnStatuses: false,
      zones: false,
      wards: false,
      beats: false,
    };

    this.hierarchySelection = {
      state: [],
      district: [],
      zone: [],
      ward: [],
      beat: [],
      project: [],
      machine: [],
    };

    // Subscribe to dashboard refresh
    this.refreshSubscription = this.dashboardRefreshService.refresh$.subscribe(
      () => {
        this.refreshDashboard();
      },
    );

    // Start auto-refresh functionality
    this.startAutoRefresh();

    // Start the countdown
    this.startRefreshCountdown();

    // Load machine data and user roles
    document.addEventListener('click', this.handleClickOutside.bind(this));
    this.loadUserRole();

    const merchantId = this.commonDataService.merchantId || '';
    const userId = this.commonDataService.userId || 0;

    this.dataService.getUserDetailsByHierarchy(merchantId, userId).subscribe({
      next: (response) => {
        if (response?.code === 200 && response?.data) {
          // Collect all projects from all clients
          const allProjects =
            response.data.clients?.flatMap(
              (client: any) => client.projects || [],
            ) || [];

          this.fullData = allProjects;
          console.log('fullData =', this.fullData);

          this.projects = this.fullData.map((p: any) => ({
            ProjectId: p.projectId,
            projectname: p.projectName,
          }));

          console.log('projects =', this.projects);

          this.selectedProjects = this.projects.map((p) => p.ProjectId);
          this.rebuildFilterChain('projects');
          this.sortDropdownOptions();

          console.log('Hierarchy Data: ', this.fullData);

          this.isDataLoaded = true;
          this.initialLoadMachineData();
        } else {
          this.isDataLoaded = true;
          this.errorMessage = 'Failed to load user data';
        }
      },
      error: (error) => {
        console.error('Error fetching hierarchy data: ', error);
        this.isDataLoaded = true;
        this.errorMessage =
          'Failed to load user data. Please refresh the page.';
      },
    });
  }

  // Helper function for natural sorting (handles numbers and text)
  private naturalSort(a: string, b: string): number {
    const reA = /[^a-zA-Z]/g;
    const reN = /[^0-9]/g;

    const aA = a.replace(reA, '');
    const bA = b.replace(reA, '');

    if (aA === bA) {
      const aN = parseInt(a.replace(reN, ''), 10);
      const bN = parseInt(b.replace(reN, ''), 10);
      return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
      return aA > bA ? 1 : -1;
    }
  }

  // Helper function for pure numerical sorting
  private numericalSort(a: any, b: any): number {
    const numA = parseFloat(String(a.value || a || '0'));
    const numB = parseFloat(String(b.value || b || '0'));
    return numA - numB;
  }

  sortDropdownOptions(): void {
    console.log('Starting to sort dropdown options...');

    if (this.projects && this.projects.length > 0) {
      this.projects.sort((a, b) => {
        const nameA = (a.projectname || '').toLowerCase();
        const nameB = (b.projectname || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    if (this.machineStatuses && this.machineStatuses.length > 0) {
      this.machineStatuses.sort((a, b) => {
        const valueA = String(a.value || a || '').toLowerCase();
        const valueB = String(b.value || b || '').toLowerCase();
        return valueA.localeCompare(valueB);
      });
    }

    if (this.stockStatuses && this.stockStatuses.length > 0) {
      this.stockStatuses.sort((a, b) => {
        const valueA = String(a.value || a || '').toLowerCase();
        const valueB = String(b.value || b || '').toLowerCase();
        return valueA.localeCompare(valueB);
      });
    }

    if (this.burnStatuses && this.burnStatuses.length > 0) {
      this.burnStatuses.sort((a, b) => {
        const valueA = String(a.value || a || '').toLowerCase();
        const valueB = String(b.value || b || '').toLowerCase();
        return valueA.localeCompare(valueB);
      });
    }

    if (this.zones && this.zones.length > 0) {
      this.zones.sort((a, b) => {
        const valueA = String(a.value || a || '').toLowerCase();
        const valueB = String(b.value || b || '').toLowerCase();
        return valueA.localeCompare(valueB);
      });
    }

    if (this.wards && this.wards.length > 0) {
      this.wards.sort((a, b) => {
        const valueA = String(a.value || a || '').toLowerCase();
        const valueB = String(b.value || b || '').toLowerCase();
        return valueA.localeCompare(valueB);
      });
    }

    if (this.subZones && this.subZones.length > 0) {
      this.subZones.sort((a, b) => {
        const valueA = String(a.value || a || '').toLowerCase();
        const valueB = String(b.value || b || '').toLowerCase();
        return valueA.localeCompare(valueB);
      });
    }

    if (this.wardList && this.wardList.length > 0) {
      this.wardList.sort((a, b) => {
        const valueA = String(a.value || a || '').toLowerCase();
        const valueB = String(b.value || b || '').toLowerCase();
        return valueA.localeCompare(valueB);
      });
    }

    if (this.beatList && this.beatList.length > 0) {
      this.beatList.sort((a, b) => this.numericalSort(a, b));
    }

    if (this.beats && this.beats.length > 0) {
      const sampleValue = String(this.beats[0]?.value || this.beats[0] || '');
      const hasAlphaNumeric = /[a-zA-Z]/.test(sampleValue);

      if (hasAlphaNumeric) {
        this.beats.sort((a, b) => {
          const valueA = String(a.value || a || '').toLowerCase();
          const valueB = String(b.value || b || '').toLowerCase();
          return this.naturalSort(valueA, valueB);
        });
      } else {
        this.beats.sort((a, b) => this.numericalSort(a, b));
      }
    }
  }

  toggleDropdown(key: string) {
    for (const dropdownKey in this.dropdownOpen) {
      if (dropdownKey !== key) {
        this.dropdownOpen[dropdownKey] = false;
      }
    }
    this.dropdownOpen[key] = !this.dropdownOpen[key];
  }

  toggleSelection(selectedArray: any[], value: any, key: string) {
    const index = selectedArray.indexOf(value);
    if (index >= 0) {
      selectedArray.splice(index, 1);
      this.clearDependentSelections(key);
    } else {
      selectedArray.push(value);
    }

    this.updateHierarchySelection(key, selectedArray);
    this.rebuildFilterChain(key);
    this.loadMachineData();
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
          this.hierarchySelection.ward = [];
          this.hierarchySelection.beat = [];
        }
        break;
      case 'selectedWardList':
      case 'ward':
        if (this.selectedWardList.length === 0) {
          this.selectedBeatList = [];
          this.selectedBeats = [];
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
    switch (key) {
      case 'projects':
        this.hierarchySelection.project = [...selectedArray];
        break;
      case 'zones':
        this.hierarchySelection.state = [...selectedArray];
        break;
      case 'wards':
        this.hierarchySelection.district = [...selectedArray];
        break;
      case 'selectedSubZones':
        this.hierarchySelection.zone = [...selectedArray];
        break;
      case 'selectedWardList':
        this.hierarchySelection.ward = [...selectedArray];
        break;
      case 'selectedBeatList':
        this.hierarchySelection.beat = [...selectedArray];
        break;
      case 'beats':
        this.hierarchySelection.machine = [...selectedArray];
        break;
    }
  }

  filterStates() {
    this.zones = [];
    this.selectedZones = [];

    if (this.selectedProjects.length === 0) {
      this.clearDependentSelections('projects');
      return;
    }

    const states = new Set<string>();
    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((state: any) => {
        states.add(state.state);
      });
    });

    this.zones = Array.from(states);
    this.selectedZones = [...this.zones];
    this.updateHierarchySelection('zones', this.selectedZones);
  }

  filterWards() {
    this.wards = [];
    this.selectedWards = [];

    if (this.selectedZones.length === 0) {
      this.clearDependentSelections('zones');
      return;
    }

    const districts = new Set<string>();
    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((state: any) => {
        if (this.selectedZones.includes(state.state)) {
          state.districts?.forEach((district: any) => {
            districts.add(district.district);
          });
        }
      });
    });

    this.wards = Array.from(districts);
    this.selectedWards = [...this.wards];
    this.updateHierarchySelection('wards', this.selectedWards);
  }

  filterSubZones() {
    this.subZones = [];
    this.selectedSubZones = [];

    if (this.selectedWards.length === 0) {
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

  filterMachines() {
    this.beats = [];
    this.selectedBeats = [];

    if (this.selectedProjects.length === 0) {
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
              if (!districtobj.zones || districtobj.zones.length === 0) {
                if (
                  districtobj.machines &&
                  Array.isArray(districtobj.machines)
                ) {
                  this.beats.push(...districtobj.machines);
                }
              } else {
                districtobj.zones.forEach((zoneobj: any) => {
                  if (this.selectedSubZones.includes(zoneobj.zone)) {
                    if (!zoneobj.wards) return;

                    zoneobj.wards.forEach((wardobj: any) => {
                      if (this.selectedWardList.includes(wardobj.ward)) {
                        if (!wardobj.beats) return;

                        wardobj.beats.forEach((beatobj: any) => {
                          if (this.selectedBeatList.includes(beatobj.beat)) {
                            if (
                              beatobj.machines &&
                              Array.isArray(beatobj.machines)
                            ) {
                              this.beats.push(...beatobj.machines);
                            }
                          }
                        });
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    });

    this.selectedBeats = [...this.beats];
  }

  rebuildFilterChain(startKey: string) {
    let hasZones = false;

    switch (startKey) {
      case 'projects':
        this.filterStates();
        this.filterWards();
        hasZones = this.checkIfDistrictsHaveZones();
        if (hasZones) {
          this.filterSubZones();
          this.filterWardList();
          this.filterBeatList();
        }
        this.filterMachines();
        break;

      case 'zones':
      case 'state':
        this.filterWards();
        hasZones = this.checkIfDistrictsHaveZones();
        if (hasZones) {
          this.filterSubZones();
          this.filterWardList();
          this.filterBeatList();
        }
        this.filterMachines();
        break;

      case 'wards':
      case 'district':
        hasZones = this.checkIfDistrictsHaveZones();
        if (hasZones) {
          this.filterSubZones();
          this.filterWardList();
          this.filterBeatList();
        }
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
    this.sortDropdownOptions();
  }

  checkIfDistrictsHaveZones(): boolean {
    if (this.selectedProjects.length === 0 || this.selectedWards.length === 0) {
      return false;
    }

    return this.fullData.some((project) => {
      return project.states?.some((state: { districts: any[]; state: any }) => {
        return state.districts?.some(
          (district: { district: any; zones: string | any[] }) => {
            return (
              this.selectedProjects.includes(project.projectId) &&
              this.selectedZones.includes(state.state) &&
              this.selectedWards.includes(district.district) &&
              district.zones?.length > 0
            );
          },
        );
      });
    });
  }

  toggleSelectAll(selectedArray: any[], options: any[], key: string) {
    if (selectedArray.length === options.length) {
      selectedArray.length = 0;
      this.clearDependentSelections(key);
    } else {
      selectedArray.length = 0;
      selectedArray.push(
        ...options.map((opt) => opt.ProjectId || opt.key || opt),
      );
    }

    this.updateHierarchySelection(key, selectedArray);
    this.rebuildFilterChain(key);
    this.loadMachineData();
  }

  startAutoRefresh(): void {
    // Auto-refresh handled by dashboard refresh service
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
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  refreshDashboard() {
    console.log('🔄 Dashboard Refresh Triggered...');
    if (this.isDataLoaded) {
      this.initialLoadMachineData();
    }
  }

  loadUserRole() {
    const userDetails = this.commonDataService.userDetails;
    console.log('USER DETAILS:', userDetails);

    if (!userDetails) {
      console.error('No user details found!');
      return;
    }

    this.userRole = userDetails.roleName || '';
    console.log('User Role:', this.userRole);

    this.isAdmin = this.userRole === 'Admin';
    this.isStateUser = this.userRole === 'State User';
    this.isDistrictUser = this.userRole === 'District User';
    this.isEndUser = this.userRole === 'End User';

    this.applyRoleRestrictions();
  }

  applyRoleRestrictions() {
    const userDetails = this.commonDataService.userDetails;
    if (!userDetails) return;

    if (this.isStateUser) {
      this.selectedZones = [userDetails.state[0]];
    }

    if (this.isDistrictUser) {
      this.selectedZones = [userDetails.state[0]];
      this.selectedWards = [userDetails.district[0]];
    }

    if (this.isEndUser) {
      this.selectedZones = [userDetails.state[0]];
      this.selectedWards = [userDetails.district[0]];
      this.selectedBeats = [userDetails.projectName[0]];
    }
  }

  get totalPages(): number {
    this.totalItems = this.filteredMachines.length;
    return Math.ceil(this.filteredMachines.length / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateMachines();
    }
  }

  clearFilters() {
    this.selectedMachineStatuses = ['1', '2'];
    this.selectedStockStatuses = [];
    this.selectedBurnStatuses = [];

    this.selectedProjects = [];
    this.selectedZones = [];
    this.selectedWards = [];
    this.selectedSubZones = [];
    this.selectedWardList = [];
    this.selectedBeatList = [];
    this.selectedBeats = [];

    this.hierarchySelection = {
      project: [],
      state: [],
      district: [],
      zone: [],
      ward: [],
      beat: [],
      machine: [],
    };

    this.columnFilters = {
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

    this.zones = [];
    this.wards = [];
    this.subZones = [];
    this.wardList = [];
    this.beatList = [];
    this.beats = [];

    this.initialLoadMachineData();
  }

  loadMachineData() {
    this.isLoading = true;
    this.errorMessage = '';

    const merchantId = this.commonDataService.merchantId ?? '';
    const userDetailsList = this.commonDataService.userDetails.clients || [];

    const clientIds = userDetailsList.map((c: any) => c.clientId);

    const queryParams: any = {
      merchantId,
      client: clientIds,
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
    };

    if (this.projects.length > 0) {
      queryParams.project =
        this.selectedProjects.length > 0
          ? this.selectedProjects.join(',')
          : this.projects.map((p) => p.ProjectId).join(',');
    }

    if (this.selectedZones.length > 0) {
      queryParams.state = this.selectedZones.join(',');
    } else if (this.zones.length > 0 && this.isStateUser) {
      queryParams.state = this.zones.join(',');
    }

    if (this.selectedWards.length > 0) {
      queryParams.district = this.selectedWards.join(',');
    } else if (this.wards.length > 0 && this.isDistrictUser) {
      queryParams.district = this.wards.join(',');
    }

    if (this.selectedSubZones.length > 0) {
      queryParams.zone = this.selectedSubZones.join(',');
    } else if (this.subZones.length > 0) {
      queryParams.zone = this.subZones.join(',');
    }

    if (this.selectedWardList.length > 0) {
      queryParams.ward = this.selectedWardList.join(',');
    } else if (this.wardList.length > 0) {
      queryParams.ward = this.wardList.join(',');
    }

    if (this.selectedBeatList.length > 0) {
      queryParams.beat = this.selectedBeatList.join(',');
    }

    if (this.selectedBeats.length > 0) {
      queryParams.machineId = this.selectedBeats.join(',');
    }

    console.log('Final API Call Params:', queryParams);

    this.dataService.getMachineDashboardSummary(queryParams).subscribe(
      (response: any) => {
        console.log('API Response:', response);
        if (response?.code === 200 && response.data) {
         const isSSA = this.isSSALogin();

this.machines = response.data.machines.map((machine: any) => ({
  ...machine,
  status: machine.status === 'Online' ? '1' : '2',
  stockStatus: isSSA ? 'N/A' : (
    machine.stockStatus?.length > 0
      ? machine.stockStatus
          .map((stock: any) =>
            stock.SpringStatus === 'Ok'
              ? 'Full'
              : stock.SpringStatus === 'No Stock'
                ? 'Empty'
                : stock.SpringStatus === 'Low Stock'
                  ? 'Low'
                  : 'N/A',
          )
          .join(', ')
      : 'N/A'
  ),
  burningStatus:
    machine.burningStatus?.toLowerCase() === 'burning' ? '2' : '1',
}));

          this.filteredMachines = [...this.machines];
          this.currentPage = 1;
          this.paginateMachines();

          // or this.commonDataService.isSSALogin()

          this.dashboardData = {
            ...response.data,
            machinesInstalled: response.data.machinesInstalled ?? 0,
            machinesOnline: response.data.machinesRunning ?? 0,
            machinesOffline:
              (response.data.machinesInstalled ?? 0) -
              (response.data.machinesRunning ?? 0),

            // ✅ SSA-specific: Show N/A for these 4 fields
            stockEmpty: isSSA ? 'N/A' : (response.data.stockEmpty ?? 0),
            stockLow: isSSA ? 'N/A' : (response.data.stockLow ?? 0),
            stockOk: isSSA ? 'N/A' : (response.data.stockOk ?? 0),
            totalCollection: isSSA
              ? 'N/A'
              : (response.data.totalCollection ?? 0),
            itemsDispensed: isSSA ? 'N/A' : (response.data.itemsDispensed ?? 0),

            totalBurningCycles: response.data.totalBurningCycles ?? 0,
            burningEnabled: response.data.burningEnabled ?? 0, // Add this if missing
          };
        } else {
          console.warn('No valid data received.');
          this.filteredMachines = [];
          this.paginatedMachines = [];
        }

        this.isLoading = false;
      },
      (error) => {
        this.handleServerError(error);
      },
    );
  }

  initialLoadMachineData() {
    this.isLoading = true;
    this.errorMessage = '';
    const merchantId = this.commonDataService.merchantId;
    if (!merchantId) return;
    const userDetails = this.commonDataService.userDetails;
    if (!userDetails) return;

    const clients =
      userDetails.clients?.map(
        (client: { clientId: any }) => client.clientId,
      ) || [];
    const projects =
      userDetails.clients?.flatMap((client: { projects: any[] }) =>
        client.projects?.map(
          (project: { projectId: any }) => project.projectId,
        ),
      ) || [];
    const states =
      userDetails.clients?.flatMap((client: { projects: any[] }) =>
        client.projects?.flatMap((project: { states: any[] }) =>
          project.states?.map((state: { state: any }) => state.state),
        ),
      ) || [];
    const districts =
      userDetails.clients?.flatMap((client: { projects: any[] }) =>
        client.projects?.flatMap((project: { states: any[] }) =>
          project.states?.flatMap((state: { districts: any[] }) =>
            state.districts?.map(
              (district: { district: any }) => district.district,
            ),
          ),
        ),
      ) || [];
    const zones =
      userDetails.clients?.flatMap((client: { projects: any[] }) =>
        client.projects?.flatMap((project: { states: any[] }) =>
          project.states?.flatMap((state: { districts: any[] }) =>
            state.districts?.flatMap((district: { zones: any[] }) =>
              district.zones?.map((zone: { zone: any }) => zone.zone),
            ),
          ),
        ),
      ) || [];
    const wards =
      userDetails.clients?.flatMap((client: { projects: any[] }) =>
        client.projects?.flatMap((project: { states: any[] }) =>
          project.states?.flatMap((state: { districts: any[] }) =>
            state.districts?.flatMap((district: { zones: any[] }) =>
              district.zones?.flatMap((zone: { wards: any[] }) =>
                zone.wards?.map((ward: { ward: any }) => ward.ward),
              ),
            ),
          ),
        ),
      ) || [];
    const beats =
      userDetails.clients?.flatMap((client: { projects: any[] }) =>
        client.projects?.flatMap((project: { states: any[] }) =>
          project.states?.flatMap((state: { districts: any[] }) =>
            state.districts?.flatMap((district: { zones: any[] }) =>
              district.zones?.flatMap((zone: { wards: any[] }) =>
                zone.wards?.flatMap((ward: { beats: any[] }) =>
                  ward.beats?.map((beat: { beat: any }) => beat.beat),
                ),
              ),
            ),
          ),
        ),
      ) || [];

    const queryParams: any = {
      merchantId: merchantId,
      machineStatus: ['1', '2'],
      stockStatus: ['0', '1', '2'],
      burnStatus: ['1', '2'],
      state: states.join(','),
      district: districts.join(','),
      client: clients.join(','),
      project: projects.join(','),
      zone: zones.join(','),
      ward: wards.join(','),
      beat: beats.join(','),
    };

    console.log('Initial API Call Params:', queryParams);
    this.dataService.getMachineDashboardSummary(queryParams).subscribe(
      (response: any) => {
        console.log('API Response:', response);
        if (response?.code === 200 && response.data) {
         const isSSA = this.isSSALogin();

this.machines = response.data.machines.map((machine: any) => ({
  ...machine,
  status: machine.status === 'Online' ? '1' : '2',
  stockStatus: isSSA ? 'N/A' : (
    machine.stockStatus?.length > 0
      ? machine.stockStatus
          .map((stock: any) =>
            stock.SpringStatus === 'Ok'
              ? 'Full'
              : stock.SpringStatus === 'No Stock'
                ? 'Empty'
                : stock.SpringStatus === 'Low Stock'
                  ? 'Low'
                  : 'N/A',
          )
          .join(', ')
      : 'N/A'
  ),
  burningStatus:
    machine.burningStatus?.toLowerCase() === 'burning' ? '2' : '1',
}));
          this.filteredMachines = [...this.machines];
          this.currentPage = 1;
          this.paginateMachines();

       

this.dashboardData = {
  ...response.data,
  machinesInstalled: response.data.machinesInstalled ?? 0,
  machinesOnline: response.data.machinesRunning ?? 0,
  machinesOffline:
    (response.data.machinesInstalled ?? 0) -
    (response.data.machinesRunning ?? 0),
  
  // ✅ SSA-specific: Show N/A for these fields
  stockEmpty: isSSA ? 'N/A' : (response.data.stockEmpty ?? 0),
  stockLow: isSSA ? 'N/A' : (response.data.stockLow ?? 0),
  stockOk: isSSA ? 'N/A' : (response.data.stockOk ?? 0),
  totalCollection: isSSA ? 'N/A' : (response.data.totalCollection ?? 0),
  itemsDispensed: isSSA ? 'N/A' : (response.data.itemsDispensed ?? 0),
  
  totalBurningCycles: response.data.totalBurningCycles ?? 0,
  burningEnabled: response.data.burningEnabled ?? 0,  // ✅ Add this line
};
        } else {
          console.warn('No valid data received.');
          this.filteredMachines = [];
          this.paginatedMachines = [];
        }

        this.isLoading = false;
      },
      (error) => {
        this.handleServerError(error);
      },
    );
  }

  formatText(text: string | null): string {
    if (!text) return '';

    return text
      .toLowerCase()
      .split(' ')
      .map((word) => {
        if (/^\d/.test(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  getLastTwoParts(address: string | null): string {
    if (!address) return '';
    const parts = address.split(',').map((part) => part.trim());
    const lastTwoParts = parts.slice(-2).join(', ');
    return lastTwoParts;
  }

  getLastPartAfterLastComma(address: string | null): string {
    if (!address) return 'No Address';
    const lastCommaIndex = address.lastIndexOf(',');
    if (lastCommaIndex !== -1) {
      const partAfterLastComma = address.substring(lastCommaIndex + 1).trim();
      return partAfterLastComma || 'No Address';
    } else {
      const words = address.trim().split(' ');
      const lastTwoWords = words.slice(-2).join(' ');
      return lastTwoWords || 'No Address';
    }
  }

  paginateMachines() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMachines = this.filteredMachines.slice(start, end);
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
          machine.burningStatus?.includes(this.searchQuery),
      );
    }

    this.currentPage = 1;
    this.paginateMachines();

    const totalPages = Math.ceil(
      this.filteredMachines.length / this.itemsPerPage,
    );
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages > 0 ? totalPages : 1;
    }
    this.paginateMachines();
  }

  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.closest('.dropdown-toggle')) {
      return;
    }

    if (target.closest('.dropdown-menu')) {
      return;
    }

    Object.keys(this.dropdownOpen).forEach((key) => {
      this.dropdownOpen[key] = false;
      this.searchText[key] = '';
    });
  }

  handleServerError(error: any) {
    console.error('Server Error:', error);
    this.errorMessage =
      error.status === 0
        ? 'No internet connection. Please check your network.'
        : error.status === 404
          ? 'No data found for the selected filters.'
          : error.status >= 500
            ? 'Server error. Please try again later.'
            : 'An unexpected error occurred. Please try again.';
    this.isLoading = false;
  }

  refreshData() {
    console.log('Refreshing Data...');
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
      const locationName = this.getLastPartAfterLastComma(
        (machine.zone || '') + (machine.ward || '') + (machine.beat || ''),
      ).toLowerCase();
      const uid = machine.uid?.toLowerCase() || '';

      return (
        (!this.columnFilters['Machine ID'] ||
          machine.machineId
            .toLowerCase()
            .includes(this.columnFilters['Machine ID'].toLowerCase())) &&
        (!this.columnFilters['MC SrNo'] ||
          mcSrNo.includes(this.columnFilters['MC SrNo'].toLowerCase())) &&
        (!this.columnFilters['Pcb No'] ||
          pcbNo.includes(this.columnFilters['Pcb No'].toLowerCase())) &&
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
            this.columnFilters['Location Address'].toLowerCase(),
          )) &&
        (!this.columnFilters['Location Name'] ||
          locationName.includes(
            this.columnFilters['Location Name'].toLowerCase(),
          )) &&
        (!this.columnFilters['Uid'] ||
          uid.includes(this.columnFilters['Uid'].toLowerCase()))
      );
    });

    if (this.sortKey) {
      this.filteredMachines.sort((a, b) => {
        const valueA = a[this.sortKey]?.toString().toLowerCase() || '';
        const valueB = b[this.sortKey]?.toString().toLowerCase() || '';
        if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.paginateMachines();
  }

  getBurningStatusLabel(status: string): string {
    if (status === '2') return 'Burning';
    if (status === '1') return 'Idle';
    return 'N/A';
  }

  shouldDisableFilter(filterName: string): boolean {
    switch (this.roleName) {
      case 'Client':
        return filterName === 'Client Name';
      case 'State User':
        return filterName === 'Client Name' || filterName === 'State';
      case 'District User':
        return (
          filterName === 'Client Name' ||
          filterName === 'State' ||
          filterName === 'District'
        );
      case 'Zone User':
        return (
          filterName === 'Client Name' ||
          filterName === 'State' ||
          filterName === 'District' ||
          filterName === 'Zone'
        );
      case 'Ward User':
        return (
          filterName === 'Client Name' ||
          filterName === 'State' ||
          filterName === 'District' ||
          filterName === 'Zone' ||
          filterName === 'Ward'
        );
      case 'Beat User':
        return (
          filterName === 'Client Name' ||
          filterName === 'State' ||
          filterName === 'District' ||
          filterName === 'Zone' ||
          filterName === 'Ward' ||
          filterName === 'Beat'
        );
      default:
        return false;
    }
  }

  exportToExcel(): void {
    this.isLoading = true;

    try {
      const exportData = this.filteredMachines.map((machine, index) => ({
        'S.No': index + 1,
        'Machine ID': machine.machineId,
        'MC SrNo': machine.mcSrNo || 'N/A',
        'Pcb No': machine.pcbNo || 'N/A',
        Zone: machine.zone || 'N/A',
        Ward: machine.ward || 'N/A',
        Beat: machine.beat || 'N/A',
        'Location Address': machine.address || 'N/A',
        UID: machine.uid || 'N/A',
        'Machine Type': machine.machineType || 'N/A',
        Status: machine.status === '1' ? 'Online' : 'Offline',
        'Stock Status': machine.stockStatus || 'N/A',
        'Burning Status': this.getBurningStatusLabel(machine.burningStatus),
        'Items Dispensed': machine.itemsDispensed || 0,
        Collection: machine.collection ? '₹ ' + machine.collection : '₹ 0',
        'Items Burnt': machine.itemsBurnt || 0,
        'Burning Cycles': machine.burningCycles || 0,
        'Installed Date': machine.machineInstalledDate || 'N/A',
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:O1');
      ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
      ws['!cols'] = [
        { width: 8 },
        { width: 15 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 25 },
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 20 },
        { width: 20 },
      ];

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Machine Report');

      const date = new Date();
      const fileName = `MachineReport_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.errorMessage = 'Failed to export data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  isSSALogin(): boolean {
    // Check from CommonDataService
    if (this.commonDataService.userDetails?.projectId === 8) {
      return true;
    }
    // Fallback to localStorage
    const projectId = localStorage.getItem('projectId');
    return projectId === '8';
  }

  getZoneName(): string {
    return this.isSSALogin() ? 'Segment' : 'Zone';
  }

  getWardName(): string {
    return this.isSSALogin() ? 'District' : 'Ward';
  }

  getBeatName(): string {
    return this.isSSALogin() ? 'Mandal' : 'Beat';
  }

  // dashboard.component.ts

// Add this method to get the formatted location name for SSA users
getFormattedLocationName(machine: any): string {
  if (this.isSSALogin()) {
    // For SSA users: Show Segment, District (level2), Mandal (beat)
    return `${this.getZoneName()}: ${machine.zone || 'SSA'}<br>
            ${this.getWardName()}: ${machine.level2 || machine.ward || 'N/A'}<br>
            ${this.getBeatName()}: ${machine.beat || 'N/A'}`;
  } else {
    // For non-SSA users: Show Zone, Ward, Beat
    return `${this.getZoneName()}: ${machine.zone || 'N/A'}<br>
            ${this.getWardName()}: ${machine.ward || 'N/A'}<br>
            ${this.getBeatName()}: ${machine.beat || 'N/A'}`;
  }
}
}
