import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import * as XLSX from 'xlsx';
import { Subscription, interval } from 'rxjs';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

interface Transaction {
  date: string;
  qty: number;
  cash: string;
  onTime: string;
  onTimeAvgPerDay: string;
  burnCycles: number;
  sanNapkinsBurnt: number;
}

interface ReportItem {
  reportFromPeriod: any;
  reportType: string;
  machineType: string;
  toiletType: string;
  srNo: number;
  Zone: string;
  Ward: string;
  Beat: string;
  machineId: string;
  machineLocation: string;
  address: string;
  transactions: Transaction[];
  vending?: { date: string; quantity: number; cashCollected: number }[];
  incinerator?: {
    onTime: string;
    burnCycles: number;
    sanitaryNapkinsBurnt: number;
  }[];
}

@Component({
  selector: 'app-smart-tables-basic-example',
  templateUrl: './smart-tables-basic-example.component.html',
  styleUrls: ['./smart-tables-basic-example.component.scss'],
})
export class SmartTablesBasicExampleComponent implements OnInit {
  private refreshSubscription!: Subscription;
  private autoRefreshSubscription!: Subscription;
  private refreshInterval = 120;
  private countdownInterval!: any;
  refreshCountdown = 0;
  searchQuery: string = '';

  isLoading: boolean = false;
  showInitialMessage: boolean = true;
  hasInitialLoad: boolean = false;
  summaryType: 'Daily' | 'Totals' = 'Daily';
  errorMessage = '';

  zones: string[] = [];
  wards: string[] = [];
  beats: string[] = [];

  projectList: any[] = [];
  selectedProjectId: number | null = null;

  projectNames: string[] = [];
  selectedProjectNames: string[] = [];

  merchantId = '';
  machineIds: string[] = [];
  selectedMachineIds: string[] = [];

  selectedZones: string[] = [];
  selectedWards: string[] = [];
  selectedBeats: string[] = [];

  startDate = '';
  endDate = '';
  totalItems = 0;

  dropdownOpen: Record<string, boolean> = {
    zone: false,
    ward: false,
    beat: false,
    machine: false,
  };
  reportsData: ReportItem[] = [];
  filteredData: ReportItem[] = [];

  reportGenerated = '';
  reportFromPeriod = '';
  reportToPeriod = '';

  grandTotal = {
    quantity: 0,
    cash: '₹ 0',
    burnCycles: 0,
    sanNapkinsBurnt: 0,
  };

  averages: {
    quantity: string;
    cash: string;
    burnCycles: string;
    sanNapkinsBurnt: string;
  } = {
    quantity: '0.00',
    cash: '₹ 0.00',
    burnCycles: '0.00',
    sanNapkinsBurnt: '0.00',
  };

  calculationMetadata: {
    numberOfMachines: number;
    numberOfDays: number;
    uniqueDates: string[];
  } = {
    numberOfMachines: 0,
    numberOfDays: 0,
    uniqueDates: [],
  };

  paginatedData: ReportItem[] = [];
  currentPage = 1;
  itemsPerPage = 20;
  reportType: any;

  machines: any[] = [];
  filteredMachines: any[] = [];
  userRole: string = '';
  isAdmin: boolean = false;
  isStateUser: boolean = false;
  isDistrictUser: boolean = false;
  isEndUser: boolean = false;
  paginatedMachines: any[] = [];
  searchText: { [key: string]: string } = {
    projects: '',
    machineStatuses: '',
    stockStatuses: '',
    burnStatuses: '',
    zones: '',
    wards: '',
    beats: '',
    Zone: '',
    Ward: '',
    Beat: '',
  };
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
  fullData: any[] = [];
  hierarchicalData: any[] = [];
  selectedProjects: any[] = [];
  selectedSubZones: any[] = [];
  selectedWardList: any[] = [];
  selectedBeatList: any[] = [];
  projects: any[] = [];
  subZones: any[] = [];
  wardList: any[] = [];
  beatList: any[] = [];
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
    UID: '',
    'Machine Type': '',
    Status: '',
    'Stock Status': '',
    'Burning Status': '',
  };
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  initialZones: string[] = [];
  initialWards: string[] = [];
  initialBeats: string[] = [];
  initialProjects: { ProjectId: number; projectname: string }[] = [];
  projectsList: any[] = [];
  statesList: any[] = [];
  districtsList: any[] = [];
  machinesList: any[] = [];
  userId: number = 0;
  isBmcClient: boolean = false;

  allDates: string[] = [];

  constructor(
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.merchantId = this.commonDataService.merchantId ?? '';
    this.userId = this.commonDataService.userId ?? 0;

    this.loadHierarchicalData();

    if (!this.merchantId) {
      this.errorMessage = 'User details not found. Please log in again.';
      return;
    }

    this.setDefaultDates();
    this.selectedProjects = this.projects.map((p) => p.ProjectId);

    document.addEventListener(
      'click',
      this.closeDropdownOnClickOutside.bind(this)
    );
    this.cdr.detectChanges();

    this.updatePagination();
  }

  // ✅ SSA Detection Method - Fixed
  isSSALogin(): boolean {
    // Check from CommonDataService
    if (this.commonDataService.userDetails?.projectId === 8) {
      return true;
    }
    // Fallback to localStorage
    const projectId = localStorage.getItem('projectId');
    return projectId === '8';
  }

  // ✅ Dynamic label getters
  getZoneLabel(): string {
    return this.isSSALogin() ? 'Segment' : 'Zone';
  }

  getWardLabel(): string {
    return this.isSSALogin() ? 'District' : 'Ward';
  }

  getBeatLabel(): string {
    return this.isSSALogin() ? 'Mandal' : 'Beat';
  }

  getTotalCash(machine: any): number {
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction = machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      const cashString = lastTransaction.cash || '₹ 0.00';
      return cashString;
    }

    return 0;
  }

  getTotalQty(machine: any): number {
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction = machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      const qtyString = lastTransaction.qty || '0';
      return qtyString;
    }

    return 0;
  }

  getTotalBurnCycles(machine: any): number {
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction = machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      const burnCyclesString = lastTransaction.burnCycles || '0';
      return burnCyclesString;
    }

    return 0;
  }

  getTotalSanNapkinsBurnt(machine: any): number {
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction = machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      const sanNapkinsBurntString = lastTransaction.sanNapkinsBurnt || '0';
      return sanNapkinsBurntString;
    }

    return 0;
  }

  toggleDropdown(key: string) {
    for (const dropdownKey in this.dropdownOpen) {
      if (dropdownKey !== key) {
        this.dropdownOpen[dropdownKey] = false;
      }
    }
    this.dropdownOpen[key] = !this.dropdownOpen[key];
  }

  toggleSelectAll(selected: any[], options: any[], key: string) {
    const allSelected = selected.length === options.length && options.length > 0;

    if (allSelected) {
      selected.length = 0;
      this.clearDependentSelections(key);
    } else {
      selected.length = 0;
      options.forEach((option) => {
        const value = typeof option === 'object'
          ? option.ProjectId || option.key || option.id || option.value
          : option;
        selected.push(value);
      });
    }

    this.updateHierarchySelection(key, [...selected]);
    this.rebuildFilterChain(key);
  }

  toggleSelection(selectedArray: any[], value: any, key: string) {
    const index = selectedArray.indexOf(value);

    if (index >= 0) {
      selectedArray.splice(index, 1);
    } else {
      selectedArray.push(value);
    }

    this.updateHierarchySelection(key, [...selectedArray]);
    this.rebuildFilterChain(key);
  }

  loadHierarchicalData(): void {
    this.errorMessage = '';

    console.log(`📡 Loading hierarchical data for merchant ${this.merchantId} and user ${this.userId}`);

    this.dataService
      .getUserDetailsByHierarchy(this.merchantId, this.userId)
      .subscribe(
        (response: any) => {
          if (response?.code === 200 && response.data) {
            const allProjects = response.data.clients?.flatMap(
              (client: any) => client.projects || []
            ) || [];

            this.fullData = allProjects;
            this.projects = this.fullData.map((p: any) => ({
              ProjectId: p.projectId,
              projectname: p.projectName,
            }));

            this.selectedProjects = this.projects.map((p) => p.ProjectId);
            this.rebuildFilterChain('projects');
          } else {
            this.errorMessage = 'Failed to load user hierarchy data.';
          }
        },
        (error) => {
          console.error('❌ Hierarchy API Call Failed:', error);
          this.errorMessage = 'Error loading hierarchy data: ' + (error.message || 'Unknown error');
        }
      );
  }

  filterStates() {
    this.zones = [];
    this.selectedZones = [];

    if (this.selectedProjects.length === 0) {
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
    this.updateHierarchySelection('zones', this.selectedZones);
  }

  filterWards() {
    this.wards = [];
    this.selectedWards = [];

    if (this.selectedZones.length === 0) {
      this.clearDependentSelections('zone');
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
              if (districtobj.zones && districtobj.zones.length > 0) {
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
              } else if (districtobj.machines && Array.isArray(districtobj.machines)) {
                this.beats.push(...districtobj.machines);
              }
            }
          });
        }
      });
    });

    this.selectedBeats = [...this.beats];
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
          this.zones = [];
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

  rebuildFilterChain(startKey: string) {
    this.clearDependentSelections(startKey);

    switch (startKey) {
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

  startAutoRefresh(): void {
    if (this.autoRefreshSubscription) {
      return;
    }
    this.autoRefreshSubscription = interval(120000).subscribe(() => {
      console.log('🔄 Auto-refreshing data...');
      this.loadReport();
    });
    this.startRefreshCountdown();
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

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  get totalPages(): number {
    this.totalItems = this.filteredData.length;
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  updatePagination(): void {
    const query = this.searchQuery.trim().toLowerCase();

    let filteredResults: ReportItem[] = this.reportsData;

    if (query) {
      filteredResults = this.reportsData
        .map((machine) => {
          const machineMatches = [
            machine.machineId?.toString().toLowerCase() ?? '',
            machine.machineLocation?.toString().toLowerCase() ?? '',
            machine.address?.toString().toLowerCase() ?? '',
            machine.machineType?.toString().toLowerCase() ?? '',
            machine.toiletType?.toString().toLowerCase() ?? '',
          ].some((value) => value.includes(query));

          const filteredTransactions = machine.transactions?.filter((txn) =>
            Object.values(txn || {}).some(
              (value) =>
                value !== null &&
                value !== undefined &&
                value.toString().toLowerCase().includes(query)
            )
          ) || [];

          if (machineMatches || filteredTransactions.length > 0) {
            return {
              ...machine,
              transactions: filteredTransactions.length > 0 ? filteredTransactions : machine.transactions,
            };
          }
          return undefined;
        })
        .filter((machine): machine is ReportItem => machine !== undefined);
    }

    this.filteredData = filteredResults;

    const totalPages = this.totalPages;
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + Number(this.itemsPerPage);

    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  onProjectChange() {
    console.log('Selected ProjectId:', this.selectedProjectId);
    this.loadReport();
  }

  ngOnDestroy() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    document.removeEventListener('click', this.closeDropdownOnClickOutside.bind(this));
  }

  closeDropdownOnClickOutside(event: Event) {
    const clickedInsideDropdown = Object.keys(this.dropdownOpen).some(
      (key) =>
        this.dropdownOpen[key] &&
        event.target instanceof HTMLElement &&
        event.target.closest('.dropdown')
    );

    if (!clickedInsideDropdown) {
      this.dropdownOpen = {
        zone: false,
        ward: false,
        beat: false,
        machine: false,
      };
      this.cdr.detectChanges();
    }
  }

  setDefaultDates() {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);
    this.startDate = this.formatDate(lastWeek);
    this.endDate = this.formatDate(today);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  handleError(error: any) {
    let errorMessage = 'An unknown error occurred.';

    if (error.status === 400) {
      errorMessage = 'Bad Request (400). Please check the request data.';
    } else if (error.status === 404) {
      errorMessage = 'Not Found (404). The requested resource could not be found.';
    } else if (error.status === 500) {
      errorMessage = 'Internal Server Error (500). Something went wrong on the server.';
    } else if (error.status === 0) {
      errorMessage = 'Network Error. Please check your internet connection.';
    }

    this.errorMessage = errorMessage;

    setTimeout(() => {
      this.errorMessage = '';
    }, 8000);
  }

  getSerialNumber(machine: ReportItem): number {
    return this.paginatedData.findIndex((m) => m.machineId === machine.machineId) +
      1 +
      (this.currentPage - 1) * this.itemsPerPage;
  }

  loadReport() {
    if (!this.selectedProjects || this.selectedProjects.length === 0) {
      this.errorMessage = 'Please select at least one Client Name';
      this.isLoading = false;
      this.showInitialMessage = false;
      return;
    }

    this.showInitialMessage = false;
    this.isLoading = true;
    this.errorMessage = '';
    this.hasInitialLoad = true;
    this.searchQuery = '';

    const merchantId = this.commonDataService.merchantId ?? '';
    const userDetailsList = this.commonDataService.userDetails.clients || [];

    const clientIds = userDetailsList.map((c: any) => c.clientId);

    const queryParams: any = {
      merchantId,
      startDate: this.startDate,
      endDate: this.endDate,
      state: this.hierarchySelection.state?.length > 0 ? [...this.hierarchySelection.state] : [],
      district: this.hierarchySelection.district?.length > 0 ? [...this.hierarchySelection.district] : [],
      zone: this.hierarchySelection.zone?.length > 0 ? [...this.hierarchySelection.zone] : [],
      ward: this.hierarchySelection.ward?.length > 0 ? [...this.hierarchySelection.ward] : [],
      beat: this.hierarchySelection.beat?.length > 0 ? [...this.hierarchySelection.beat] : [],
      client: clientIds,
      project: this.hierarchySelection.project?.length > 0 ? [...this.hierarchySelection.project] : [],
    };

    if (this.selectedBeats.length > 0) {
      queryParams.machineId = [...this.selectedBeats];
    }

    this.dataService.getMachineAndIncineratorTransaction(queryParams).subscribe(
      (response: any) => {
        if (response.code === 200 && response.data?.machineDetails) {
          this.reportGenerated = new Date().toISOString();
          this.reportFromPeriod = response.data.reportFromPeriod || '-';
          this.reportToPeriod = response.data.reportToPeriod || '-';
          this.reportType = response.data.reportType || '-';

          this.isLoading = false;
          this.processResponseData(response.data.machineDetails);
          if (!this.autoRefreshSubscription) {
            this.startAutoRefresh();
          }
        } else {
          this.filteredData = [];
          this.isLoading = false;
          this.errorMessage = 'No data available for the selected filters.';
        }
      },
      (error) => {
        this.handleError(error);
      }
    );
  }

  onStartDateChange() {
    if (this.startDate > this.endDate) {
      this.endDate = this.startDate;
    }
  }

  onEndDateChange() {
    if (this.endDate < this.startDate) {
      this.startDate = this.endDate;
    }
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

  setSearchQuery(value: string) {
    this.searchQuery = value;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch() {
    this.searchQuery = '';
  }

  getLastTwoParts(address: string | null): string {
    if (!address) return '';
    const parts = address.split(',').map((part) => part.trim());
    const lastTwoParts = parts.slice(-2).join(', ');
    return lastTwoParts;
  }

  exportToExcel(): void {
    if (!this.reportsData || this.reportsData.length === 0) {
      console.warn('No data to export.');
      return;
    }

    const isSSA = this.isSSALogin();
    const exportData: any[] = [];

    this.reportsData.forEach((report) => {
      if (this.summaryType === 'Daily') {
        report.transactions.forEach((txn) => {
          exportData.push({
            'MACHINE ID': report.machineId,
            LOCATION: report.machineLocation,
            ADDRESS: report.address,
            'MACHINE TYPE': report.machineType,
            [this.getZoneLabel()]: report.Zone,
            [this.getWardLabel()]: report.Ward,
            [this.getBeatLabel()]: report.Beat,
            'TOILET TYPE': report.toiletType,
            'REPORT TYPE': report.reportType,
            DATE: txn.date,
            QUANTITY: isSSA ? 'N/A' : txn.qty,
            CASH: isSSA ? 'N/A' : txn.cash,
            'ON TIME': txn.onTime,
            'AVG ON TIME/DAY': txn.onTimeAvgPerDay,
            'BURN CYCLES': txn.burnCycles,
            'SANITARY NAPKINS BURNT': txn.sanNapkinsBurnt,
          });
        });
      } else {
        const totalTxn = report.transactions.find((txn) => txn.date === 'Total');
        if (totalTxn) {
          exportData.push({
            'MACHINE ID': report.machineId,
            LOCATION: report.machineLocation,
            ADDRESS: report.address,
            'MACHINE TYPE': report.machineType,
            [this.getZoneLabel()]: report.Zone,
            [this.getWardLabel()]: report.Ward,
            [this.getBeatLabel()]: report.Beat,
            'TOILET TYPE': report.toiletType,
            'REPORT TYPE': report.reportType,
            DATE: 'Total',
            QUANTITY: isSSA ? 'N/A' : totalTxn.qty,
            CASH: isSSA ? 'N/A' : totalTxn.cash,
            'ON TIME': totalTxn.onTime,
            'AVG ON TIME/DAY': totalTxn.onTimeAvgPerDay,
            'BURN CYCLES': totalTxn.burnCycles,
            'SANITARY NAPKINS BURNT': totalTxn.sanNapkinsBurnt,
          });
        }
      }
    });

    const now = new Date();
    const summaryRows = [
      ['NO. OF MACHINES', this.reportsData.length, 'REPORT TYPE', this.reportType || 'N/A'],
      ['STATE', 'MAHARASHTRA', 'DISTRICT', 'MUMBAI'],
      ['REPORT GENERATED', now.toLocaleDateString(), 'TIME', now.toLocaleTimeString()],
      [],
      [],
      [],
    ];

    const summaryRowCount = summaryRows.length;
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.sheet_add_json(ws, exportData, { origin: summaryRowCount });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Machine Report');
    XLSX.writeFile(wb, 'Machine_Report_With_Summary.xlsx');
  }

  parseOnTimeString(onTimeStr: string): { totalTime: string; avgPerDay: string } {
    if (!onTimeStr || onTimeStr === '-') {
      return { totalTime: '-', avgPerDay: '-' };
    }
    const parts = onTimeStr.split('\n');
    const totalTime = parts[0]?.trim() || '-';
    const avgPerDay = parts[1]?.trim() || '-';
    return { totalTime, avgPerDay };
  }

  processResponseData(machineDetails: any[], startDate?: string, endDate?: string): void {
    let grandTotalQty = 0;
    let grandTotalCash = 0;
    let grandTotalBurnCycles = 0;
    let grandTotalSanNapkins = 0;

    const numberOfMachines = machineDetails.length;

    const dateConversionCache = new Map<string, string>();
    dateConversionCache.clear();

    const convertServiceDateToStandard = (serviceDate: string): string => {
      if (dateConversionCache.has(serviceDate)) {
        return dateConversionCache.get(serviceDate)!;
      }
      try {
        const parts = serviceDate.split('-');
        if (parts.length !== 3) {
          dateConversionCache.set(serviceDate, serviceDate);
          return serviceDate;
        }
        const day = parts[0].padStart(2, '0');
        const monthStr = parts[1];
        const year = parts[2];
        const monthMap: { [key: string]: string } = {
          Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
          Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
        };
        const month = monthMap[monthStr];
        if (!month) {
          dateConversionCache.set(serviceDate, serviceDate);
          return serviceDate;
        }
        const standardDate = `${year}-${month}-${day}`;
        dateConversionCache.set(serviceDate, standardDate);
        return standardDate;
      } catch (error) {
        dateConversionCache.set(serviceDate, serviceDate);
        return serviceDate;
      }
    };

    const convertStandardToServiceDate = (standardDate: string): string => {
      const cacheKey = `reverse_${standardDate}`;
      if (dateConversionCache.has(cacheKey)) {
        return dateConversionCache.get(cacheKey)!;
      }
      try {
        const parts = standardDate.split('-');
        if (parts.length !== 3) {
          dateConversionCache.set(cacheKey, standardDate);
          return standardDate;
        }
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(month, 10) - 1;
        if (monthIndex < 0 || monthIndex > 11) {
          dateConversionCache.set(cacheKey, standardDate);
          return standardDate;
        }
        const monthName = monthNames[monthIndex];
        const serviceDate = `${parseInt(day, 10)}-${monthName}-${year}`;
        dateConversionCache.set(cacheKey, serviceDate);
        return serviceDate;
      } catch (error) {
        dateConversionCache.set(cacheKey, standardDate);
        return standardDate;
      }
    };

    const generateDateRange = (start: string, end: string): string[] => {
      const dates: string[] = [];
      try {
        const startParts = start.split(/[-\s]/);
        const endParts = end.split(/[-\s]/);
        const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]), 12, 0, 0);
        const endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]), 12, 0, 0);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return [];
        }
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear();
          const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
          const day = currentDate.getDate().toString().padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          dates.push(formattedDate);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
      } catch (error) {
        return [];
      }
    };

    let allDatesList: string[] = [];

    if (this.reportFromPeriod && this.reportToPeriod && this.reportFromPeriod !== '-' && this.reportToPeriod !== '-') {
      const fromDate = this.reportFromPeriod.split(' ')[0];
      const toDate = this.reportToPeriod.split(' ')[0];
      allDatesList = generateDateRange(fromDate, toDate);
    } else if (startDate && endDate) {
      allDatesList = generateDateRange(startDate, endDate);
    }

    this.reportsData = machineDetails.map((machine, index): ReportItem => {
      let transactionsMap = new Map<string, Transaction>();

      let machineTotalQty = 0;
      let machineTotalCash = 0;
      let machineTotalBurnCycles = 0;
      let machineTotalSanNapkins = 0;
      let machineTotalOnTimeFormatted = '-';
      let machineTotalOnTimeAvgPerDay = '-';

      const vendingDataMap = new Map<string, any>();
      const incineratorDataMap = new Map<string, any>();

      (machine.vending || []).forEach((txn: any) => {
        if (txn.date && txn.date !== 'Total') {
          const standardDate = convertServiceDateToStandard(txn.date);
          vendingDataMap.set(standardDate, { ...txn, originalDate: txn.date });
          machineTotalQty += txn.quantity ?? 0;
          machineTotalCash += txn.cashCollected ?? 0;
        }
      });

      (machine.incinerator || []).forEach((txn: any) => {
        if (txn.date && txn.date !== 'Total') {
          const standardDate = convertServiceDateToStandard(txn.date);
          incineratorDataMap.set(standardDate, { ...txn, originalDate: txn.date });
          machineTotalBurnCycles += txn.burnCycles ?? 0;
          machineTotalSanNapkins += txn.sanitaryNapkinsBurnt ?? 0;

          const { totalTime, avgPerDay } = this.parseOnTimeString(txn.onTime);
          if (totalTime && totalTime !== '-') {
            machineTotalOnTimeFormatted = totalTime;
          }
          if (avgPerDay && avgPerDay !== '-') {
            machineTotalOnTimeAvgPerDay = avgPerDay;
          }
        }
      });

      allDatesList.forEach((date) => {
        const vendingData = vendingDataMap.get(date);
        const incineratorData = incineratorDataMap.get(date);

        let qty: any = '0';
        let cash: string = '₹0';
        let onTime: string = '0m';
        let onTimeAvgPerDay: string = '-';
        let burnCycles: any = '0';
        let sanNapkinsBurnt: any = '0';

        if (vendingData) {
          qty = vendingData.quantity ?? 0;
          cash = `₹ ${vendingData.cashCollected?.toFixed(2) ?? '0'}`;
        }

        if (incineratorData) {
          const { totalTime, avgPerDay } = this.parseOnTimeString(incineratorData.onTime);
          onTime = totalTime ?? '-';
          onTimeAvgPerDay = avgPerDay ?? '-';
          burnCycles = incineratorData.burnCycles ?? 0;
          sanNapkinsBurnt = incineratorData.sanitaryNapkinsBurnt ?? 0;
        }

        const displayDate = convertStandardToServiceDate(date);
        transactionsMap.set(date, {
          date: displayDate,
          qty: qty,
          cash: cash,
          onTime: onTime,
          onTimeAvgPerDay: onTimeAvgPerDay,
          burnCycles: burnCycles,
          sanNapkinsBurnt: sanNapkinsBurnt,
        });
      });

      transactionsMap.set('Total', {
        date: 'Total',
        qty: machineTotalQty,
        cash: `₹ ${machineTotalCash.toFixed(2)}`,
        onTime: machineTotalOnTimeFormatted,
        onTimeAvgPerDay: machineTotalOnTimeAvgPerDay,
        burnCycles: machineTotalBurnCycles,
        sanNapkinsBurnt: machineTotalSanNapkins,
      });

      grandTotalQty += machineTotalQty;
      grandTotalCash += machineTotalCash;
      grandTotalBurnCycles += machineTotalBurnCycles;
      grandTotalSanNapkins += machineTotalSanNapkins;

      const sortedTransactions = Array.from(transactionsMap.values()).sort((a, b) => {
        if (a.date === 'Total') return 1;
        if (b.date === 'Total') return -1;
        const dateA = convertServiceDateToStandard(a.date);
        const dateB = convertServiceDateToStandard(b.date);
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      const result = {
        srNo: index + 1,
        machineId: machine.machineId,
        machineLocation: machine.machineLocation ? machine.machineLocation.trim() : machine.address,
        address: machine.address || '',
        machineType: machine.machineType || 'N/A',
        Zone: machine.Zone || 'N/A',
        Ward: machine.Ward || 'N/A',
        Beat: machine.Beat || 'N/A',
        toiletType: machine.toiletType || 'N/A',
        reportType: machine.reportType || 'N/A',
        transactions: sortedTransactions,
      } as ReportItem;

      (result as any)._totalOnTime = machineTotalOnTimeFormatted;
      (result as any)._avgOnTimePerDay = machineTotalOnTimeAvgPerDay;

      return result;
    });

    let numberOfDays = 1;

    const calculateDaysBetween = (startDate: string, endDate: string): number => {
      try {
        const startParts = startDate.split(/[-\s]/);
        const endParts = endDate.split(/[-\s]/);
        const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]), 12, 0, 0);
        const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]), 12, 0, 0);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return 1;
        }
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 1;
      } catch (error) {
        return 1;
      }
    };

    if (this.reportFromPeriod && this.reportToPeriod && this.reportFromPeriod !== '-' && this.reportToPeriod !== '-') {
      numberOfDays = calculateDaysBetween(this.reportFromPeriod, this.reportToPeriod);
    } else if (startDate && endDate) {
      numberOfDays = calculateDaysBetween(startDate, endDate);
    }

    numberOfDays = Math.max(1, numberOfDays);

    const averageQty = numberOfMachines && numberOfDays ? grandTotalQty / numberOfMachines / numberOfDays : 0;
    const averageCash = numberOfMachines && numberOfDays ? grandTotalCash / numberOfMachines / numberOfDays : 0;
    const averageBurnCycles = numberOfMachines && numberOfDays ? grandTotalBurnCycles / numberOfMachines / numberOfDays : 0;
    const averageSanNapkins = numberOfMachines && numberOfDays ? grandTotalSanNapkins / numberOfMachines / numberOfDays : 0;

    this.grandTotal = {
      quantity: grandTotalQty,
      cash: `₹ ${grandTotalCash.toFixed(2)}`,
      burnCycles: grandTotalBurnCycles,
      sanNapkinsBurnt: grandTotalSanNapkins,
    };

    this.averages = {
      quantity: averageQty.toFixed(2),
      cash: `₹ ${averageCash.toFixed(2)}`,
      burnCycles: averageBurnCycles.toFixed(2),
      sanNapkinsBurnt: averageSanNapkins.toFixed(2),
    };

    this.calculationMetadata = {
      numberOfMachines,
      numberOfDays,
      uniqueDates: allDatesList,
    };

    this.filteredData = [...this.reportsData];
    this.updatePagination();
  }

  toggleSummaryType(): void {
    this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';
  }

  parseTimeToSeconds(timeStr: string): number {
    let totalSeconds = 0;
    const timeParts = timeStr.split(' ');
    timeParts.forEach((part) => {
      const numValue = parseInt(part) || 0;
      if (part.includes('h')) totalSeconds += numValue * 3600;
      else if (part.includes('m')) totalSeconds += numValue * 60;
      else if (part.includes('s')) totalSeconds += numValue;
    });
    return totalSeconds;
  }

  formatSecondsToTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  extractLastTwoWords(address: string): string {
    if (address) {
      const parts = address.split(',').map((part) => part.trim());
      const lastPart = parts[parts.length - 1];
      const words = lastPart.split(/\s+/);
      return words.slice(-2).join(' ');
    }
    return '';
  }
}