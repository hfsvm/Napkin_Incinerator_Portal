import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import * as XLSX from 'xlsx';
import { Subscription, interval } from 'rxjs';

interface Transaction {
  date: string;
  qty: number;
  cash: string;
  onTime: string;
  onTimeAvgPerDay: string; // Added this field
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
  selector: 'app-smart-tables-basic-example',
  templateUrl: './smart-tables-basic-example.component.html',
  styleUrls: ['./smart-tables-basic-example.component.scss'],
})
export class SmartTablesBasicExampleComponent implements OnInit {
  private refreshSubscription!: Subscription; // Declare with '!' to avoid undefined error
  private autoRefreshSubscription!: Subscription;
  private refreshInterval = 120; // refresh interval in seconds
  private countdownInterval!: any;
  refreshCountdown = 0;
  searchQuery: string = ''; // ✅ This is the search input value

  isLoading: boolean = false;
  showInitialMessage: boolean = true;
  summaryType: 'Daily' | 'Totals' = 'Daily';
  errorMessage = '';

  zones: string[] = [];
  wards: string[] = [];
  beats: string[] = [];

  projectList: any[] = [];
  selectedProjectId: number | null = null;

  projectNames: string[] = []; // New property for project names
  selectedProjectNames: string[] = []; // New property for selected project names

  merchantId = '';
  machineIds: string[] = []; // ✅ Now Dynamic
  selectedMachineIds: string[] = [];

  selectedZones: string[] = [];
  selectedWards: string[] = [];
  selectedBeats: string[] = [];

  startDate = '';
  endDate = '';

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

  // Averages per machine per day
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

  // Metadata for calculation (optional - for debugging)
  calculationMetadata: {
    numberOfMachines: number;
    numberOfDays: number;
    uniqueDates: string[];
  } = {
    numberOfMachines: 0,
    numberOfDays: 0,
    uniqueDates: [],
  };

  // ✅ Pagination
  paginatedData: ReportItem[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  reportType: any;

  //report variables start
  // isLoading = false;
  // errorMessage = '';
  machines: any[] = [];
  filteredMachines: any[] = [];
  userRole: string = ''; // Stores the role of the logged-in user
  isAdmin: boolean = false;
  isStateUser: boolean = false;
  isDistrictUser: boolean = false;
  isEndUser: boolean = false;
  // currentPage: number = 1;
  // itemsPerPage: number = 10;
  paginatedMachines: any[] = [];
  // searchQuery: string = '';
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
  // dropdownOpen: any = {};
  fullData: any[] = [];
  hierarchicalData: any[] = [];
  selectedProjects: any[] = [];
  // selectedZones: any[] = [];
  // selectedWards: any[] = [];
  selectedSubZones: any[] = [];
  selectedWardList: any[] = [];
  selectedBeatList: any[] = [];
  // selectedBeats: any[] = [];
  projects: any[] = [];
  // zones: any[] = [];
  // wards: any[] = [];
  subZones: any[] = [];
  wardList: any[] = [];
  beatList: any[] = [];
  // beats: any[] = [];
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
  // isBmcClient: boolean;
  isBmcClient: boolean = false; // ✅ safest

  // report variables end

  constructor(
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    //this.loadReport();

    this.merchantId = this.commonDataService.merchantId ?? '';
    this.userId = this.commonDataService.userId ?? 0;

    this.loadHierarchicalData();

    if (!this.merchantId) {
      this.errorMessage = 'User details not found. Please log in again.';
      return;
    }

    this.setDefaultDates();
    // this.fetchUserDetails(); // ✅ Fetch User Details First
    // this.loadCommonData();

    document.addEventListener(
      'click',
      this.closeDropdownOnClickOutside.bind(this)
    );
    this.cdr.detectChanges();
    // Start auto-refresh functionality
    this.startAutoRefresh();

    // Start the countdown
    this.startRefreshCountdown();

    this.updatePagination();
  }

  getTotalCash(machine: any): number {
    debugger;
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction =
      machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      // Remove the currency symbol and parse the number
      const cashString = lastTransaction.cash || '₹ 0.00';
      console.log('cashString= ' + cashString);
      console.log('cashNumber= ' + cashString);

      return cashString;
    }

    return 0;
  }

  getTotalQty(machine: any): number {
    debugger;
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction =
      machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      // Remove the currency symbol and parse the number
      const qtyString = lastTransaction.qty || '0';
      console.log('qtyString= ' + qtyString);
      return qtyString;
    }

    return 0;
  }

  getTotalBurnCycles(machine: any): number {
    debugger;
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction =
      machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      // Remove the currency symbol and parse the number
      const burnCyclesString = lastTransaction.burnCycles || '0';
      console.log('burnCycles= ' + burnCyclesString);
      return burnCyclesString;
    }

    return 0;
  }

  getTotalSanNapkinsBurnt(machine: any): number {
    debugger;
    if (!machine.transactions || machine.transactions.length === 0) {
      return 0;
    }

    const lastTransaction =
      machine.transactions[machine.transactions.length - 1];

    if (lastTransaction.date === 'Total') {
      // Remove the currency symbol and parse the number
      const sanNapkinsBurntString = lastTransaction.sanitaryNapkinsBurnt || '0';
      console.log('sanNapkinsBurnt= ' + sanNapkinsBurntString);
      return sanNapkinsBurntString;
    }

    return 0;
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

  toggleSelectAll(selected: any[], options: any[], key: string) {
    // First check if all items are already selected
    const allSelected =
      selected.length === options.length && options.length > 0;

    console.log(
      `Toggle Select All for ${key} - Current selection: ${selected.length}/${options.length} items`
    );

    if (allSelected) {
      // Clear the selection
      selected.length = 0; // This modifies the array in-place
      console.log(`Cleared all selections for ${key}`);

      // Clear dependent filters when appropriate
      this.clearDependentSelections(key);
    } else {
      // Clear the array first
      selected.length = 0;

      // Then add all values from options
      options.forEach((option) => {
        // Extract the appropriate ID from the option
        const value =
          typeof option === 'object'
            ? option.ProjectId || option.key || option.id || option.value
            : option;

        selected.push(value);
      });

      console.log(`Selected all ${selected.length} options for ${key}`);
    }

    // Update the hierarchy selection with a new array reference
    this.updateHierarchySelection(key, [...selected]);

    // Rebuild filter chain
    this.rebuildFilterChain(key);

    // Reload data with updated filters
    // this.loadMachineData();
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
    // this.loadMachineData();
  }

  loadHierarchicalData(): void {
    // this.isLoading = true;
    this.errorMessage = '';

    console.log(
      `📡 Loading hierarchical data for merchant ${this.merchantId} and user ${this.userId}`
    );

    this.dataService
      .getUserDetailsByHierarchy(this.merchantId, this.userId)
      .subscribe(
        (response: any) => {
          console.log('✅ Hierarchy API Response:', response);

          if (response?.code === 200 && response.data) {
            console.log('✅✅✅✅✅✅Hierarchy API Response:', response);
            debugger;
            this.hierarchicalData = response.data;
            this.fullData = response.data.projects;

            this.projects = this.fullData.map((p: any) => ({
              ProjectId: p.projectId,
              projectname: p.projectName,
            }));

            // this.clientId = response.data.clientId;
            // this.projectId = response.data.projects?.[0]?.projectId;
            // console.log('📌 Extracted projectId:', this.projectId);

            // Check if selected project (client) is BMC
            const selectedProject = this.fullData.find((p) =>
              p.projectName.toLowerCase().includes('bmc')
            );
            this.isBmcClient = !!selectedProject;
            this.selectedProjects = this.projects.map((p) => p.ProjectId);
            this.rebuildFilterChain('projects');

            //this.processHierarchicalData();
            // this.loadMachineData(); // Load machine data after hierarchy is processed
          } else {
            console.warn('⚠️ No valid hierarchy data received.');
            this.isLoading = false;
            this.errorMessage = 'Failed to load user hierarchy data.';
          }
        },
        (error) => {
          console.error('❌ Hierarchy API Call Failed:', error);
          this.isLoading = false;
          this.errorMessage =
            'Error loading hierarchy data: ' +
            (error.message || 'Unknown error');
        }
      );
  }

  filterStates() {
    this.zones = [];
    this.selectedZones = [];

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((stateobj: any) => {
        if (!this.zones.includes(stateobj.state)) {
          this.zones.push(stateobj.state);
        }
      });
    });
    this.selectedZones = [...this.zones];
    // this.filterWards();
  }

  filterWards() {
    this.wards = [];
    this.selectedWards = [];

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
      project?.states?.forEach((stateobj: any) => {
        if (this.selectedZones.includes(stateobj.state)) {
          stateobj.districts?.forEach((districtobj: any) => {
            if (
              !this.wards.find((w: any) => w.district === districtobj.district)
            ) {
              this.wards.push(districtobj.district);
            }
          });
        }
      });
    });
    this.selectedWards = [...this.wards];
    // this.filterSubZones();
  }

  filterSubZones() {
    this.subZones = [];
    this.selectedSubZones = [];

    this.selectedProjects.forEach((pid) => {
      const project = this.fullData.find((p) => p.projectId === pid);
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
    this.selectedSubZones = [...this.subZones];
    // this.filterWardList();
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
    // this.filterBeatList();
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
    this.selectedBeatList = [...this.beatList];
    // this.filterMachines(); // Optional next step
  }

  filterMachines() {
    this.beats = [];
    this.selectedBeats = [];

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
    console.log(
      `Updating hierarchy for ${key} with ${selectedArray.length} selections`
    );

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
    console.log(
      'Updated hierarchy selection:',
      JSON.stringify(this.hierarchySelection)
    );
  }

  rebuildFilterChain(startKey: string) {
    // Determine where to start rebuilding based on the changed key
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
    // Refresh every 2 minutes (120,000 milliseconds)
    this.autoRefreshSubscription = interval(120000).subscribe(() => {
      console.log('🔄 Auto-refreshing data...');
      // Replace with your data loading method
      this.loadReport();
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

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  updatePagination(): void {
    debugger;
    const query = this.searchQuery.trim().toLowerCase();

    // Step 1: Filter data based on search
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

          const filteredTransactions =
            machine.transactions?.filter((txn) =>
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
              transactions:
                filteredTransactions.length > 0
                  ? filteredTransactions
                  : machine.transactions,
            };
          }
          return undefined;
        })
        .filter((machine): machine is ReportItem => machine !== undefined);
    }

    // Step 2: Update filteredData
    this.filteredData = filteredResults;

    // Step 3: Ensure currentPage is within bounds
    const totalPages = this.totalPages; // Uses the getter
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    // Assuming this.allItems holds the full data array
    // Step 4: Paginate the filtered data
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // const endIndex = startIndex + this.itemsPerPage;
    const endIndex = startIndex + Number(this.itemsPerPage);

    this.paginatedData = this.filteredData.slice(
      startIndex,
      startIndex + Number(this.itemsPerPage)
    );
  }

  // Helper method to check if an item matches search
  private itemMatchesSearch(item: ReportItem, query: string): boolean {
    // Check machine properties
    if (
      (item.machineId?.toString().toLowerCase() || '').includes(query) ||
      (item.machineLocation?.toLowerCase() || '').includes(query) ||
      (item.address?.toLowerCase() || '').includes(query) ||
      (item.machineType?.toLowerCase() || '').includes(query) ||
      (item.toiletType?.toLowerCase() || '').includes(query)
    ) {
      return true;
    }

    // Check transactions
    return (item.transactions || []).some((txn) =>
      Object.values(txn || {}).some(
        (val) =>
          val !== null &&
          val !== undefined &&
          val.toString().toLowerCase().includes(query)
      )
    );
  }

  onProjectChange() {
    console.log('Selected ProjectId:', this.selectedProjectId);
    this.loadReport();
  }
  ngOnDestroy() {
    // Clean up subscriptions and intervals
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // ✅ Remove listener to avoid memory leaks
    document.removeEventListener(
      'click',
      this.closeDropdownOnClickOutside.bind(this)
    );
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
  fetchMachineIds() {
    this.isLoading = true;
  }

  /** Method to show error messages as popups */
  handleError(error: any) {
    let errorMessage = 'An unknown error occurred.';

    if (error.status === 400) {
      errorMessage = 'Bad Request (400). Please check the request data.';
    } else if (error.status === 404) {
      errorMessage =
        'Not Found (404). The requested resource could not be found.';
    } else if (error.status === 500) {
      errorMessage =
        'Internal Server Error (500). Something went wrong on the server.';
    } else if (error.status === 0) {
      errorMessage = 'Network Error. Please check your internet connection.';
    }

    this.errorMessage = errorMessage;

    // Automatically hide the error message after 8 seconds
    setTimeout(() => {
      this.errorMessage = '';
    }, 8000);
  }

  getSerialNumber(machine: ReportItem): number {
    return (
      this.paginatedData.findIndex((m) => m.machineId === machine.machineId) +
      1 +
      (this.currentPage - 1) * this.itemsPerPage
    );
  }

  loadReport() {
    debugger;
    this.showInitialMessage = false;
    this.isLoading = true;
    this.errorMessage = '';

    const merchantId = this.commonDataService.merchantId ?? '';
    const userDetails = this.commonDataService.userDetails;

    const queryParams: any = {
      merchantId,
      startDate: this.startDate,
      endDate: this.endDate,
      state:
        this.hierarchySelection.state?.length > 0
          ? [...this.hierarchySelection.state]
          : [],
      district:
        this.hierarchySelection.district?.length > 0
          ? [...this.hierarchySelection.district]
          : [],
      zone:
        this.hierarchySelection.zone?.length > 0
          ? [...this.hierarchySelection.zone]
          : [],
      ward:
        this.hierarchySelection.ward?.length > 0
          ? [...this.hierarchySelection.ward]
          : [],
      beat:
        this.hierarchySelection.beat?.length > 0
          ? [...this.hierarchySelection.beat]
          : [],
      client: userDetails.clientId,
      project: userDetails.projectId,
    };

    // Include machine selection if available
    if (this.selectedBeats?.length > 0) {
      queryParams.machineId = [...this.selectedBeats];
    }

    console.log('API Query Parameters:', queryParams);

    this.dataService.getMachineAndIncineratorTransaction(queryParams).subscribe(
      (response: any) => {
        console.log('✅ API Response Received:', response);

        if (response.code === 200 && response.data?.machineDetails) {
          debugger;
          this.reportGenerated = new Date().toISOString();
          this.reportFromPeriod = response.data.reportFromPeriod || '-';
          this.reportToPeriod = response.data.reportToPeriod || '-';
          this.reportType = response.data.reportType || '-';

          console.log('📌 Report Metadata Set:', {
            reportGenerated: this.reportGenerated,
            reportFromPeriod: this.reportFromPeriod,
            reportToPeriod: this.reportToPeriod,
            reportType: this.reportType,
          });
          this.isLoading = false;
          this.processResponseData(response.data.machineDetails);
        } else {
          this.filteredData = [];
          this.errorMessage = 'No data available for the selected filters.';
        }
      },
      (error) => {
        this.handleError(error); // Handle the error by showing popup messages
      }
    );
  }
  machineFilterTouched = false;
  onMachineSelectionChange(selected: string[]) {
    debugger;
    this.selectedMachineIds = selected;
    this.machineFilterTouched = true;
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

  private dropdownTimeouts: { [key: string]: any } = {};

  toggleDropdown1(filterType: string, event: Event) {
    event.stopPropagation();

    // 🔄 Close all other dropdowns
    Object.keys(this.dropdownOpen).forEach((key) => {
      if (key !== filterType) {
        this.dropdownOpen[key] = false;
        clearTimeout(this.dropdownTimeouts[key]);
      }
    });

    // ✅ Toggle current dropdown
    this.dropdownOpen[filterType] = !this.dropdownOpen[filterType];

    // ⏱️ Set a timeout to auto-close after 10 seconds
    if (this.dropdownOpen[filterType]) {
      clearTimeout(this.dropdownTimeouts[filterType]); // Clear any existing timeout
      this.dropdownTimeouts[filterType] = setTimeout(() => {
        this.dropdownOpen[filterType] = false;
        this.cdr.detectChanges();
      }, 10000); // 10 seconds
    } else {
      clearTimeout(this.dropdownTimeouts[filterType]);
    }

    console.log('📌 Dropdown State Updated:', this.dropdownOpen);
    this.cdr.detectChanges(); // ✅ Make Angular aware of changes
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  setSearchQuery(value: string) {
    this.searchQuery = value;
    this.currentPage = 1; // Reset to first page
    // this.updatePagination(); //
  }

  clearSearch() {
    this.searchQuery = '';
  }

  onMachineChange(machine: string, event: any) {
    if (event.target.checked) {
      this.selectedMachineIds.push(machine);
    } else {
      this.selectedMachineIds = this.selectedMachineIds.filter(
        (id) => id !== machine
      );
    }
  }

  toggleSelection1(selectedArray: any[], option: any) {
    debugger;
    console.log('Toggle selection called with:', {
      array: selectedArray,
      option,
    });

    // For objects, check by matching a property
    if (typeof option === 'object' && option !== null) {
      const exists = selectedArray.some((item) =>
        typeof item === 'object' ? item.id === option.id : item === option
      );

      if (exists) {
        const index = selectedArray.findIndex((item) =>
          typeof item === 'object' ? item.id === option.id : item === option
        );
        selectedArray.splice(index, 1);
      } else {
        selectedArray.push(option);
      }
    } else {
      // For simple values like strings
      const exists = selectedArray.includes(option);
      if (exists) {
        selectedArray.splice(selectedArray.indexOf(option), 1);
      } else {
        selectedArray.push(option);
      }
    }

    console.log('After toggle, selected array:', selectedArray);
    this.cdr.detectChanges();
  }

  toggleSelectAll1(selectedArray: string[], fullList: string[], event: any) {
    if (event.target.checked) {
      selectedArray.length = 0;
      fullList.forEach((item) => selectedArray.push(item));
    } else {
      selectedArray.length = 0;
    }
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

  // exportToExcel() {
  //   debugger;
  //   const table = document.querySelector('.report-table') as HTMLTableElement;
  //   if (!table) {
  //     console.error('Table not found!');
  //     return;
  //   }

  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Machine Report');

  //   XLSX.writeFile(wb, 'Machine_Report.xlsx');
  // }

  exportToExcel(): void {
    debugger;
    if (!this.reportsData || this.reportsData.length === 0) {
      console.warn('No data to export.');
      return;
    }

    const exportData: any[] = [];

    this.reportsData.forEach((report) => {
      if (this.summaryType === 'Daily') {
        // Export each transaction
        report.transactions.forEach((txn) => {
          exportData.push({
            'MACHINE ID': report.machineId,
            LOCATION: report.machineLocation,
            ADDRESS: report.address,
            'MACHINE TYPE': report.machineType,
            ZONE: report.Zone,
            WARD: report.Ward,
            BEAT: report.Beat,
            'TOILET TYPE': report.toiletType,
            'REPORT TYPE': report.reportType,
            DATE: txn.date,
            QUANTITY: txn.qty,
            CASH: txn.cash,
            'ON TIME': txn.onTime,
            'AVG ON TIME/DAY': txn.onTimeAvgPerDay,
            'BURN CYCLES': txn.burnCycles,
            'SANITARY NAPKINS BURNT': txn.sanNapkinsBurnt,
          });
        });
      } else {
        // Export only the total transaction row
        const totalTxn = report.transactions.find(
          (txn) => txn.date === 'Total'
        );
        if (totalTxn) {
          exportData.push({
            'MACHINE ID': report.machineId,
            LOCATION: report.machineLocation,
            ADDRESS: report.address,
            'MACHINE TYPE': report.machineType,
            ZONE: report.Zone,
            WARD: report.Ward,
            BEAT: report.Beat,
            'TOILET TYPE': report.toiletType,
            'REPORT TYPE': report.reportType,
            DATE: 'Total',
            QUANTITY: totalTxn.qty,
            CASH: totalTxn.cash,
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
      [
        'NO. OF MACHINES',
        this.reportsData.length,
        'REPORT TYPE',
        this.reportType || 'N/A',
      ],
      ['STATE', 'MAHARASHTRA', 'DISTRICT', 'MUMBAI'],
      [
        'REPORT GENERATED',
        now.toLocaleDateString(),
        'TIME',
        now.toLocaleTimeString(),
      ],
      [],
      [],
      [], // Empty rows for spacing
    ];

    const summaryRowCount = summaryRows.length;
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.sheet_add_json(ws, exportData, { origin: summaryRowCount });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Machine Report');
    XLSX.writeFile(wb, 'Machine_Report_With_Summary.xlsx');
  }

  // toggleSummaryType() {
  //   this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';

  //   if (this.summaryType === 'Totals') {
  //     this.filteredData = []; // ✅ Clear previous totals

  //     const uniqueMachineIds = new Set(); // ✅ Track unique machines to prevent duplication
  //     let grandTotalQty = 0, grandTotalCash = 0, grandTotalBurnCycles = 0, grandTotalSanNapkins = 0;

  //     console.log('Switching to Totals view - processing machines:');

  //     this.reportsData.forEach((machine, index) => {
  //       if (!uniqueMachineIds.has(machine.machineId)) { // ✅ Prevent duplicate machines
  //         uniqueMachineIds.add(machine.machineId);

  //         // ✅ Extract only the last "Total" row for each machine from API
  //         const vendingTotal = machine.transactions.find(txn => txn.date === 'Total') || { qty: 0, cash: '₹ 0.00' };

  //         // Find the most recent incinerator transaction to get the onTime value
  //         const incineratorTxns = machine.transactions.filter(txn => txn.onTime && txn.onTime !== 'Total');
  //         const mostRecentIncineratorTxn = incineratorTxns.length > 0 ?
  //             incineratorTxns[incineratorTxns.length - 1] :
  //             { onTime: '-', burnCycles: 0, sanNapkinsBurnt: 0 };

  //         const incineratorTotal = machine.transactions.find(txn => txn.onTime === 'Total') || { burnCycles: 0, sanNapkinsBurnt: 0 };

  //         // Debug logs for onTime value
  //         console.log(`Machine ID: ${machine.machineId}`);
  //         console.log('  All incinerator transactions:', incineratorTxns.map(txn => ({date: txn.date, onTime: txn.onTime})));
  //         console.log('  Most recent incinerator transaction:', mostRecentIncineratorTxn);
  //         console.log('  onTime value being used:', mostRecentIncineratorTxn.onTime);

  //         const totalQty = vendingTotal.qty ?? 0;
  //         const totalCash = parseFloat((vendingTotal.cash ?? '₹ 0.00').replace(/[₹,]/g, '')) || 0;
  //         const totalBurnCycles = incineratorTotal.burnCycles ?? 0;
  //         const totalSanNapkins = incineratorTotal.sanNapkinsBurnt ?? 0;

  //         // ✅ Update grand totals
  //         grandTotalQty += totalQty;
  //         grandTotalCash += totalCash;
  //         grandTotalBurnCycles += totalBurnCycles;
  //         grandTotalSanNapkins += totalSanNapkins;

  //         this.filteredData.push({
  //           srNo: index + 1,
  //           machineId: machine.machineId,
  //           machineLocation: machine.machineLocation || '-',
  //           address: machine.address || '-',
  //           machineType: machine.machineType || 'N/A',
  //           reportType: machine.reportType || 'N/A',
  //           transactions: [{
  //             date: 'Total',
  //             qty: totalQty,
  //             cash: `₹ ${totalCash.toFixed(2)}`,
  //             onTime: mostRecentIncineratorTxn.onTime, // This is where onTime is assigned
  //             burnCycles: totalBurnCycles,
  //             sanNapkinsBurnt: totalSanNapkins
  //           }]
  //         });

  //         // Debug: log what's actually being added to filteredData
  //         console.log(`  Final onTime added to filteredData: ${mostRecentIncineratorTxn.onTime}`);
  //       }
  //     });

  //     // Set grand total values
  //     this.grandTotal = {
  //       quantity: grandTotalQty,
  //       cash: `₹ ${grandTotalCash.toFixed(2)}`,
  //       burnCycles: grandTotalBurnCycles,
  //       sanNapkinsBurnt: grandTotalSanNapkins
  //     };

  //     // After populating filteredData, check what's actually there
  //     console.log('Final filteredData onTime values:');
  //     this.filteredData.forEach(machine => {
  //       console.log(`Machine: ${machine.machineId}, onTime: ${machine.transactions[0]?.onTime}`);
  //     });
  //   } else {
  //     this.filteredData = [...this.reportsData]; // ✅ Restore "Daily" view
  //     console.log('Switching back to Daily view');
  //   }

  //   this.currentPage = 1; // ✅ Reset pagination
  //   this.updatePagination();
  // }

  // Function to parse the onTime string from the API
  parseOnTimeString(onTimeStr: string): {
    totalTime: string;
    avgPerDay: string;
  } {
    if (!onTimeStr || onTimeStr === '-') {
      return { totalTime: '-', avgPerDay: '-' };
    }

    // Split by newline character to separate total time and daily average
    const parts = onTimeStr.split('\n');

    // Extract the total time (first part)
    const totalTime = parts[0]?.trim() || '-';

    // Extract the daily average (second part)
    const avgPerDay = parts[1]?.trim() || '-';

    return { totalTime, avgPerDay };
  }

  processResponseData(
    machineDetails: any[],
    startDate?: string,
    endDate?: string
  ): void {
    let grandTotalQty = 0;
    let grandTotalCash = 0;
    let grandTotalBurnCycles = 0;
    let grandTotalSanNapkins = 0;

    // Count the number of machines (excluding those with no transactions)
    const machinesWithTransactions = machineDetails.filter(
      (machine) =>
        (machine.vending && machine.vending.length) ||
        (machine.incinerator && machine.incinerator.length)
    );
    const numberOfMachines = machinesWithTransactions.length;

    this.reportsData = machineDetails
      .filter(
        (machine) =>
          (machine.vending && machine.vending.length) ||
          (machine.incinerator && machine.incinerator.length)
      )
      .map((machine, index): ReportItem => {
        let transactionsMap = new Map<string, Transaction>();

        // ✅ Initialize Machine Totals
        let machineTotalQty = 0;
        let machineTotalCash = 0;
        let machineTotalBurnCycles = 0;
        let machineTotalSanNapkins = 0;
        let machineTotalOnTimeSeconds = 0;
        let machineTotalOnTimeFormatted = '-';
        let machineTotalOnTimeAvgPerDay = '-';
        debugger;
        // ✅ Handle Vending Transactions (Check for null)
        (machine.vending || []).forEach((txn: any) => {
          if (txn.date !== 'Total') {
            machineTotalQty += txn.quantity ?? 0;
            machineTotalCash += txn.cashCollected ?? 0;
          }
          transactionsMap.set(txn.date, {
            date: txn.date,
            qty: txn.quantity ?? 0,
            cash: `₹ ${txn.cashCollected?.toFixed(2) ?? '0'}`,
            onTime: '-',
            onTimeAvgPerDay: '-',
            burnCycles: 0,
            sanNapkinsBurnt: 0,
          });
        });

        // ✅ Handle Incinerator Transactions (Check for null)
        (machine.incinerator || []).forEach((txn: any) => {
          if (txn.date !== 'Total') {
            machineTotalBurnCycles += txn.burnCycles ?? 0;
            machineTotalSanNapkins += txn.sanitaryNapkinsBurnt ?? 0;

            // Parse the onTime string to extract total time and average per day
            const { totalTime, avgPerDay } = this.parseOnTimeString(txn.onTime);

            // Store the last valid onTime to use for machine total
            if (totalTime && totalTime !== '-') {
              machineTotalOnTimeFormatted = totalTime;
            }

            // Store the last valid avgPerDay to use for machine total
            if (avgPerDay && avgPerDay !== '-') {
              machineTotalOnTimeAvgPerDay = avgPerDay;
            }
          }

          if (transactionsMap.has(txn.date)) {
            let existingTxn = transactionsMap.get(txn.date)!;
            const { totalTime, avgPerDay } = this.parseOnTimeString(txn.onTime);
            existingTxn.onTime = totalTime ?? '-';
            existingTxn.onTimeAvgPerDay = avgPerDay ?? '-';
            existingTxn.burnCycles = txn.burnCycles ?? 0;
            existingTxn.sanNapkinsBurnt = txn.sanitaryNapkinsBurnt ?? 0;
          } else {
            const { totalTime, avgPerDay } = this.parseOnTimeString(txn.onTime);
            transactionsMap.set(txn.date, {
              date: txn.date,
              qty: 0,
              cash: '₹ 0',
              onTime: totalTime ?? '-',
              onTimeAvgPerDay: avgPerDay ?? '-',
              burnCycles: txn.burnCycles ?? 0,
              sanNapkinsBurnt: txn.sanitaryNapkinsBurnt ?? 0,
            });
          }
        });

        // ✅ Add Machine's Total Row
        transactionsMap.set('Total', {
          date: 'Total',
          qty: machineTotalQty,
          cash: `₹ ${machineTotalCash.toFixed(2)}`,
          onTime: machineTotalOnTimeFormatted,
          onTimeAvgPerDay: machineTotalOnTimeAvgPerDay,
          burnCycles: machineTotalBurnCycles,
          sanNapkinsBurnt: machineTotalSanNapkins,
        });

        // ✅ Update Grand Total (Sum of Each Machine's Totals)
        grandTotalQty += machineTotalQty;
        grandTotalCash += machineTotalCash;
        grandTotalBurnCycles += machineTotalBurnCycles;
        grandTotalSanNapkins += machineTotalSanNapkins;

        // Store total onTime in a custom property for later use
        const result = {
          srNo: index + 1,
          machineId: machine.machineId,
          machineLocation: machine.machineLocation
            ? machine.machineLocation.trim()
            : machine.address,
          address: machine.address || '',
          machineType: machine.machineType || 'N/A',
          Zone: machine.Zone || 'N/A',
          Ward: machine.Ward || 'N/A',
          Beat: machine.Beat || 'N/A',
          toiletType: machine.toiletType || 'N/A',
          reportType: machine.reportType || 'N/A',
          transactions: Array.from(transactionsMap.values()),
        } as ReportItem;

        // Add the onTime to the result as custom properties
        (result as any)._totalOnTime = machineTotalOnTimeFormatted;
        (result as any)._avgOnTimePerDay = machineTotalOnTimeAvgPerDay;

        return result;
      });

    // Calculate number of days between start date and end date
    let numberOfDays = 1; // Default to 1 to avoid division by zero

    // Define our helper function for calculating days between dates
    const calculateDaysBetween = (
      startDate: string,
      endDate: string
    ): number => {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error('Invalid date format in calculateDaysBetween:', {
            startDate,
            endDate,
          });
          return 1; // Return default
        }

        // Reset hours to avoid time zone and daylight saving issues
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        // Calculate difference in milliseconds and convert to days
        const diffTime = Math.abs(end.getTime() - start.getTime());
        // Add 1 to include both the start and end dates
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return diffDays > 0 ? diffDays : 1; // Ensure at least 1 day
      } catch (error) {
        console.error('Error in calculateDaysBetween:', error);
        return 1; // Return default on error
      }
    };

    // Check if we have the top-level report period data
    if (
      this.reportFromPeriod &&
      this.reportToPeriod &&
      this.reportFromPeriod !== '-' &&
      this.reportToPeriod !== '-'
    ) {
      try {
        // Use the top-level reportFromPeriod and reportToPeriod
        const fromPeriodStr = this.reportFromPeriod;
        const toPeriodStr = this.reportToPeriod;

        numberOfDays = calculateDaysBetween(fromPeriodStr, toPeriodStr);
        console.log(
          `Using top-level report date range: ${fromPeriodStr} to ${toPeriodStr}`
        );
        console.log(`Number of days in report: ${numberOfDays}`);
      } catch (error) {
        console.error(
          'Error calculating date difference from top-level report periods:',
          error
        );
      }
    }
    // Fallback: Check if we have report period data in machineDetails
    else if (machineDetails && machineDetails.length > 0) {
      // Find first machine with valid report period data
      const machineWithReportPeriod = machineDetails.find(
        (machine) => machine.reportFromPeriod && machine.reportToPeriod
      );

      if (machineWithReportPeriod) {
        try {
          // Extract date strings
          const fromPeriodStr = machineWithReportPeriod.reportFromPeriod;
          const toPeriodStr = machineWithReportPeriod.reportToPeriod;

          numberOfDays = calculateDaysBetween(fromPeriodStr, toPeriodStr);
          console.log(
            `Using machine report date range: ${fromPeriodStr} to ${toPeriodStr}`
          );
          console.log(`Number of days in report: ${numberOfDays}`);
        } catch (error) {
          console.error(
            'Error calculating date difference from machine report periods:',
            error
          );
        }
      }
    }

    // If we still have default numberOfDays, try using startDate and endDate parameters
    if (numberOfDays === 1 && startDate && endDate) {
      try {
        numberOfDays = calculateDaysBetween(startDate, endDate);
        console.log(`Date parameter range: ${startDate} to ${endDate}`);
        console.log(`Number of days from parameters: ${numberOfDays}`);
      } catch (error) {
        console.error(
          'Error calculating date difference from parameters:',
          error
        );
      }
    }

    // Final safety check - ensure we have at least 1 day
    numberOfDays = Math.max(1, numberOfDays);

    // FIX: Calculate averages per machine per day
    // Correct formula: (grand total value / number of machines) / number of days
    const averageQty =
      numberOfMachines && numberOfDays
        ? grandTotalQty / numberOfMachines / numberOfDays
        : 0;
    const averageCash =
      numberOfMachines && numberOfDays
        ? grandTotalCash / numberOfMachines / numberOfDays
        : 0;
    const averageBurnCycles =
      numberOfMachines && numberOfDays
        ? grandTotalBurnCycles / numberOfMachines / numberOfDays
        : 0;
    const averageSanNapkins =
      numberOfMachines && numberOfDays
        ? grandTotalSanNapkins / numberOfMachines / numberOfDays
        : 0;

    console.log('Average calculation details:', {
      grandTotalQty,
      grandTotalCash,
      grandTotalBurnCycles,
      grandTotalSanNapkins,
      numberOfMachines,
      numberOfDays,
      averageQty,
      averageCash,
      averageBurnCycles,
      averageSanNapkins,
    });

    // ✅ Update Grand Total Correctly
    this.grandTotal = {
      quantity: grandTotalQty,
      cash: `₹ ${grandTotalCash.toFixed(2)}`,
      burnCycles: grandTotalBurnCycles,
      sanNapkinsBurnt: grandTotalSanNapkins,
    };

    // Add averages to the component
    this.averages = {
      quantity: averageQty.toFixed(2),
      cash: `₹ ${averageCash.toFixed(2)}`,
      burnCycles: averageBurnCycles.toFixed(2),
      sanNapkinsBurnt: averageSanNapkins.toFixed(2),
    };

    // Store the calculation metadata for debugging/display if needed
    this.calculationMetadata = {
      numberOfMachines,
      numberOfDays,
      uniqueDates: [], // Empty array to satisfy the type requirement, no longer used for calculations
    };

    // Add dateRange as a separate property if needed
    (this.calculationMetadata as any).dateRange =
      startDate && endDate
        ? `${startDate} to ${endDate}`
        : 'No date range provided';

    this.filteredData = [...this.reportsData];
    this.updatePagination();
  }

  // Fix for toggleSummaryType method
  // toggleSummaryType(): void {
  //   this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';

  //   if (this.summaryType === 'Totals') {
  //     this.filteredData = []; // Clear previous totals
  //     const uniqueMachineIds = new Set(); // Track unique machines to prevent duplication
  //     let grandTotalQty = 0,
  //       grandTotalCash = 0,
  //       grandTotalBurnCycles = 0,
  //       grandTotalSanNapkins = 0;

  //     this.reportsData.forEach((machine, index) => {
  //       if (!uniqueMachineIds.has(machine.machineId)) {
  //         // Prevent duplicate machines
  //         uniqueMachineIds.add(machine.machineId);

  //         // Find the total transaction (last item in transactions array)
  //         const totalTransaction = machine.transactions.find(
  //           (t) => t.date === 'Total'
  //         );

  //         // Get totals from the total transaction
  //         const totalQty = totalTransaction ? totalTransaction.qty : 0;
  //         const totalCashStr = totalTransaction ? totalTransaction.cash : '₹ 0';
  //         const totalBurnCycles = totalTransaction
  //           ? totalTransaction.burnCycles
  //           : 0;
  //         const totalSanNapkins = totalTransaction
  //           ? totalTransaction.sanNapkinsBurnt
  //           : 0;

  //         // Get the machine's total onTime from our custom property
  //         const totalOnTime = (machine as any)._totalOnTime || '-';

  //         // Update grand totals
  //         grandTotalQty += totalQty;
  //         grandTotalCash += parseFloat(totalCashStr.replace('₹ ', '')) || 0;
  //         grandTotalBurnCycles += totalBurnCycles;
  //         grandTotalSanNapkins += totalSanNapkins;

  //         const newMachine = {
  //           srNo: index + 1,
  //           machineId: machine.machineId,
  //           machineLocation: machine.machineLocation || '-',
  //           address: machine.address || '-',
  //           machineType: machine.machineType || 'N/A',
  //           reportType: machine.reportType || 'N/A',
  //           transactions: [
  //             {
  //               date: 'Total',
  //               qty: totalQty,
  //               cash: totalCashStr,
  //               onTime: totalOnTime,
  //               burnCycles: totalBurnCycles,
  //               sanNapkinsBurnt: totalSanNapkins,
  //             },
  //           ],
  //         } as ReportItem;

  //         // Add our custom property
  //         (newMachine as any)._totalOnTime = totalOnTime;

  //         this.filteredData.push(newMachine);
  //       }
  //     });

  //     // Get the correct number of days dynamically - this needs to be recalculated
  //     // because date range might change in the UI
  //     const numberOfMachines = uniqueMachineIds.size;
  //     let numberOfDays = 1; // Default to 1, but we'll try to calculate it

  //     // First, try to find report period data in any machine that has it
  //     const machineWithReportPeriod = this.reportsData.find(
  //       (machine) => machine.reportFromPeriod && machine.reportFromPeriod
  //     );

  //     if (machineWithReportPeriod) {
  //       try {
  //         // Extract date strings
  //         const fromPeriodStr = machineWithReportPeriod.reportFromPeriod;
  //         const toPeriodStr = machineWithReportPeriod.reportFromPeriod;

  //         // Handle date strings in format "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
  //         const fromDateParts = fromPeriodStr.split(' ')[0].split('-');
  //         const toDateParts = toPeriodStr.split(' ')[0].split('-');

  //         if (fromDateParts.length === 3 && toDateParts.length === 3) {
  //           // Create dates using year, month (0-indexed), day
  //           const fromDate = new Date(
  //             parseInt(fromDateParts[0]),
  //             parseInt(fromDateParts[1]) - 1,
  //             parseInt(fromDateParts[2])
  //           );

  //           const toDate = new Date(
  //             parseInt(toDateParts[0]),
  //             parseInt(toDateParts[1]) - 1,
  //             parseInt(toDateParts[2])
  //           );

  //           // Validate dates were parsed correctly
  //           if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
  //             // Calculate the difference in milliseconds
  //             const diffMs = toDate.getTime() - fromDate.getTime();
  //             // Convert to days and add 1 to include both start and end dates
  //             numberOfDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  //             console.log(
  //               `Toggle - Report date range: ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`
  //             );
  //             console.log(`Toggle - Number of days in report: ${numberOfDays}`);
  //           }
  //         }
  //       } catch (error) {
  //         console.error(
  //           'Error calculating date difference in toggleSummaryType:',
  //           error
  //         );
  //       }
  //     }

  //     // Final fallback - use the stored calculation metadata if available
  //     if (numberOfDays === 1 && this.calculationMetadata?.numberOfDays > 1) {
  //       numberOfDays = this.calculationMetadata.numberOfDays;
  //       console.log(
  //         `Toggle - Using calculation metadata: ${numberOfDays} days`
  //       );
  //     }

  //     // Final safety check
  //     numberOfDays = Math.max(1, numberOfDays);

  //     // FIX: Calculate averages per machine per day with the correct formula
  //     const averageQty =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalQty / numberOfMachines / numberOfDays
  //         : 0;
  //     const averageCash =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalCash / numberOfMachines / numberOfDays
  //         : 0;
  //     const averageBurnCycles =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalBurnCycles / numberOfMachines / numberOfDays
  //         : 0;
  //     const averageSanNapkins =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalSanNapkins / numberOfMachines / numberOfDays
  //         : 0;

  //     console.log('Totals view average calculation:', {
  //       grandTotalQty,
  //       grandTotalCash,
  //       grandTotalBurnCycles,
  //       grandTotalSanNapkins,
  //       numberOfMachines,
  //       numberOfDays,
  //       averageQty,
  //       averageCash,
  //       averageBurnCycles,
  //       averageSanNapkins,
  //     });

  //     // Update grand total
  //     this.grandTotal = {
  //       quantity: grandTotalQty,
  //       cash: `₹ ${grandTotalCash.toFixed(2)}`,
  //       burnCycles: grandTotalBurnCycles,
  //       sanNapkinsBurnt: grandTotalSanNapkins,
  //     };

  //     // Update averages
  //     this.averages = {
  //       quantity: averageQty.toFixed(2),
  //       cash: `₹ ${averageCash.toFixed(2)}`,
  //       burnCycles: averageBurnCycles.toFixed(2),
  //       sanNapkinsBurnt: averageSanNapkins.toFixed(2),
  //     };

  //     // We don't need to update calculation metadata here as we're reusing it
  //   } else {
  //     this.filteredData = [...this.reportsData]; // Restore "Daily" view

  //     // No need to recalculate averages here as they were calculated
  //     // in the processResponseData method and should be preserved
  //   }

  //   this.currentPage = 1; // Reset pagination
  //   this.updatePagination();
  // }

  toggleSummaryType(): void {
    debugger;
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

  // Helper method to format seconds to "0h 0m 0s" format
  formatSecondsToTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // toggleSummaryType1() {
  //   this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';

  //   if (this.summaryType === 'Totals') {
  //     this.filteredData = []; // Clear previous totals
  //     const uniqueMachineIds = new Set(); // Track unique machines to prevent duplication
  //     let grandTotalQty = 0,
  //       grandTotalCash = 0,
  //       grandTotalBurnCycles = 0,
  //       grandTotalSanNapkins = 0;

  //     this.reportsData.forEach((machine, index) => {
  //       if (!uniqueMachineIds.has(machine.machineId)) {
  //         // Prevent duplicate machines
  //         uniqueMachineIds.add(machine.machineId);

  //         // Find the total transaction (last item in transactions array)
  //         const totalTransaction = machine.transactions.find(
  //           (t) => t.date === 'Total'
  //         );

  //         // Get totals from the total transaction
  //         const totalQty = totalTransaction ? totalTransaction.qty : 0;
  //         const totalCashStr = totalTransaction ? totalTransaction.cash : '₹ 0';
  //         const totalBurnCycles = totalTransaction
  //           ? totalTransaction.burnCycles
  //           : 0;
  //         const totalSanNapkins = totalTransaction
  //           ? totalTransaction.sanNapkinsBurnt
  //           : 0;

  //         // Get the machine's total onTime from our custom property
  //         const totalOnTime = (machine as any)._totalOnTime || '-';

  //         // Update grand totals
  //         grandTotalQty += totalQty;
  //         grandTotalCash += parseFloat(totalCashStr.replace('₹ ', '')) || 0;
  //         grandTotalBurnCycles += totalBurnCycles;
  //         grandTotalSanNapkins += totalSanNapkins;

  //         const newMachine = {
  //           srNo: index + 1,
  //           machineId: machine.machineId,
  //           machineLocation: machine.machineLocation || '-',
  //           address: machine.address || '-',
  //           machineType: machine.machineType || 'N/A',
  //           Zone: machine.Zone || 'N/A',
  //           Ward: machine.Ward || 'N/A',
  //           Beat: machine.Beat || 'N/A',
  //           toiletType: machine.toiletType || 'N/A',
  //           reportType: machine.reportType || 'N/A',
  //           transactions: [
  //             {
  //               date: 'Total',
  //               qty: totalQty,
  //               cash: totalCashStr,
  //               onTime: totalOnTime,
  //               burnCycles: totalBurnCycles,
  //               sanNapkinsBurnt: totalSanNapkins,
  //             },
  //           ],
  //         } as ReportItem;

  //         // Add our custom property
  //         (newMachine as any)._totalOnTime = totalOnTime;

  //         this.filteredData.push(newMachine);
  //       }
  //     });

  //     // You can add a final "Grand Total" row here if needed
  //   } else {
  //     this.filteredData = [...this.reportsData]; // Restore "Daily" view
  //   }

  //   this.currentPage = 1; // Reset pagination
  //   this.updatePagination();
  // }

  // toggleSummaryType2() {
  //   this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';

  //   if (this.summaryType === 'Totals') {
  //     this.filteredData = []; // Clear previous totals
  //     const uniqueMachineIds = new Set(); // Track unique machines to prevent duplication
  //     let grandTotalQty = 0,
  //       grandTotalCash = 0,
  //       grandTotalBurnCycles = 0,
  //       grandTotalSanNapkins = 0;

  //     // Set to track unique dates across all machines in Totals view
  //     const uniqueDatesSet = new Set<string>();

  //     this.reportsData.forEach((machine, index) => {
  //       if (!uniqueMachineIds.has(machine.machineId)) {
  //         // Prevent duplicate machines
  //         uniqueMachineIds.add(machine.machineId);

  //         // Find the total transaction (last item in transactions array)
  //         const totalTransaction = machine.transactions.find(
  //           (t) => t.date === 'Total'
  //         );

  //         // Get totals from the total transaction
  //         const totalQty = totalTransaction ? totalTransaction.qty : 0;
  //         const totalCashStr = totalTransaction ? totalTransaction.cash : '₹ 0';
  //         const totalBurnCycles = totalTransaction
  //           ? totalTransaction.burnCycles
  //           : 0;
  //         const totalSanNapkins = totalTransaction
  //           ? totalTransaction.sanNapkinsBurnt
  //           : 0;

  //         // Get the machine's total onTime from our custom property
  //         const totalOnTime = (machine as any)._totalOnTime || '-';

  //         // Update grand totals
  //         grandTotalQty += totalQty;
  //         grandTotalCash += parseFloat(totalCashStr.replace('₹ ', '')) || 0;
  //         grandTotalBurnCycles += totalBurnCycles;
  //         grandTotalSanNapkins += totalSanNapkins;

  //         // Collect unique dates from this machine's transactions
  //         machine.transactions.forEach((txn) => {
  //           if (txn.date && txn.date !== 'Total' && txn.date !== '-') {
  //             uniqueDatesSet.add(txn.date);
  //           }
  //         });

  //         const newMachine = {
  //           srNo: index + 1,
  //           machineId: machine.machineId,
  //           machineLocation: machine.machineLocation || '-',
  //           address: machine.address || '-',
  //           machineType: machine.machineType || 'N/A',
  //           reportType: machine.reportType || 'N/A',
  //           transactions: [
  //             {
  //               date: 'Total',
  //               qty: totalQty,
  //               cash: totalCashStr,
  //               onTime: totalOnTime,
  //               burnCycles: totalBurnCycles,
  //               sanNapkinsBurnt: totalSanNapkins,
  //             },
  //           ],
  //         } as ReportItem;

  //         // Add our custom property
  //         (newMachine as any)._totalOnTime = totalOnTime;

  //         this.filteredData.push(newMachine);
  //       }
  //     });

  //     // Calculate number of machines and days
  //     const numberOfMachines = uniqueMachineIds.size;
  //     const numberOfDays = Math.max(1, uniqueDatesSet.size); // Ensure we don't divide by zero

  //     // Calculate averages per machine per day
  //     const averageQty =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalQty / (numberOfMachines * numberOfDays)
  //         : 0;
  //     const averageCash =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalCash / (numberOfMachines * numberOfDays)
  //         : 0;
  //     const averageBurnCycles =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalBurnCycles / (numberOfMachines * numberOfDays)
  //         : 0;
  //     const averageSanNapkins =
  //       numberOfMachines && numberOfDays
  //         ? grandTotalSanNapkins / (numberOfMachines * numberOfDays)
  //         : 0;

  //     // Update grand total
  //     this.grandTotal = {
  //       quantity: grandTotalQty,
  //       cash: `₹ ${grandTotalCash.toFixed(2)}`,
  //       burnCycles: grandTotalBurnCycles,
  //       sanNapkinsBurnt: grandTotalSanNapkins,
  //     };

  //     // Update averages
  //     this.averages = {
  //       quantity: averageQty.toFixed(2),
  //       cash: `₹ ${averageCash.toFixed(2)}`,
  //       burnCycles: averageBurnCycles.toFixed(2),
  //       sanNapkinsBurnt: averageSanNapkins.toFixed(2),
  //     };

  //     // Update calculation metadata
  //     this.calculationMetadata = {
  //       numberOfMachines,
  //       numberOfDays,
  //       uniqueDates: Array.from(uniqueDatesSet),
  //     };
  //   } else {
  //     this.filteredData = [...this.reportsData]; // Restore "Daily" view

  //     // No need to recalculate averages here as they were calculated
  //     // in the processResponseData method and should be preserved
  //   }

  //   this.currentPage = 1; // Reset pagination
  //   this.updatePagination();
  // }

  searchTexts: { [key: string]: string } = {};

  // Inside your component.ts
  extractLastTwoWords(address: string): string {
    if (address) {
      // Split the address by commas
      const parts = address.split(',').map((part) => part.trim());

      // Get the last part (which should contain the last words)
      const lastPart = parts[parts.length - 1];

      // Split the last part by spaces and get the last two words
      const words = lastPart.split(/\s+/);

      // Return the last two words joined by a space
      return words.slice(-2).join(' ');
    }
    return ''; // Return empty string if address is not provided
  }
  /** ✅ Check if "Select All" should be checked */
  /** ✅ Toggle individual selection */

  /** ✅ Check if "Select All" should be checked */
  isAllSelected(selectedArray: string[], fullList: string[]): boolean {
    return selectedArray.length === fullList.length && fullList.length > 0;
  }

  /** ✅ Toggle "Select All" Checkbox */
}
