
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { DashboardRefreshService } from '../../service/dashboard-refresh.service';
import { Subscription, interval } from 'rxjs';  // Import interval and Subscription
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-machinedata',
  templateUrl: './machinedata.component.html',
  styleUrls: ['./machinedata.component.scss']
})
export class MachinedataComponent implements OnInit, OnDestroy {
  private refreshSubscription!: Subscription;  // Declare with '!' to avoid undefined error
  private autoRefreshSubscription!: Subscription;  // Declare auto refresh subscription

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
  // Projects (from second code)
  projects: { ProjectId: number, projectname: string }[] = [];
  selectedProjects: number[] = [];

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
    beats: ''
  };
  
  // Filters
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
  selectedZones: string[] = [];
  selectedWards: string[] = [];
  selectedBeats: string[] = [];

  zones: string[] = [];
  wards: string[] = [];
  beats: string[] = [];

  dropdownOpen: any = {};
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

  // Initial arrays to store filter values
  initialZones: string[] = [];
  initialWards: string[] = [];
  initialBeats: string[] = [];
  initialProjects: { ProjectId: number, projectname: string }[] = [];

  constructor(
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private changeDetectorRef: ChangeDetectorRef,
    private dashboardRefreshService: DashboardRefreshService
  ) {}

  ngOnInit() {
    this.searchText = {
      projects: '',
      machineStatuses: '',
      stockStatuses: '',
      burnStatuses: '',
      zones: '',
      wards: '',
      beats: ''
    };
    // Subscribe to dashboard refresh
    this.refreshSubscription = this.dashboardRefreshService.refresh$.subscribe(() => {
      this.refreshDashboard();
    });
  
    // Start auto-refresh functionality
    this.startAutoRefresh(); 
  
    // Start the countdown
    this.startRefreshCountdown();  // <-- Start the countdown here
  
    // Load machine data and user roles
    this.loadMachineData();
    document.addEventListener('click', this.handleClickOutside.bind(this));
    this.loadUserRole();
  
    // // Add Machines to Beats Without Disturbing Other Code
    // this.beats = this.commonDataService.userDetails?.machineId ?? [];
    // this.selectedBeats = [...this.beats];  // Pre-select all machines


      // 🔄 Fetch machine IDs from updated API
  const merchantId = this.commonDataService.merchantId;
  const userId = this.commonDataService.userId;

  if (merchantId && userId !== null) { 
    this.dataService.getUserDetails(merchantId, userId as number).subscribe({
      next: (response) => {
        if (response?.code === 200 && response?.data?.machineId) {
          this.beats = response.data.machineId;
          this.selectedBeats = [...this.beats];  // Pre-select all machines

          // Optional: update global userDetails with latest machineId
        }
      },
      error: (err) => {
        console.error("❌ Error loading updated machine IDs:", err);
      }
    });
  } else {
    console.warn("⚠️ merchantId or userId is missing, skipping machineId API fetch.");
  }

  
    // Initialize projects from user details
    this.projects = this.commonDataService.userDetails?.projectName ?? [];
    this.selectedProjects = this.projects.map(project => project.ProjectId);  // Pre-select all projects
    console.log('Projects Array:', this.projects);
  }
  

  startAutoRefresh(): void {
    // Refresh every 2 minutes (120,000 milliseconds)
    this.autoRefreshSubscription = interval(120000).subscribe(() => {
      console.log('🔄 Auto-refreshing machine data...');
      this.loadMachineData();

          // Fetch latest machine IDs
    const merchantId = this.commonDataService.merchantId;
    const userId = this.commonDataService.userId;

    if (merchantId && userId !== null) {
      this.dataService.getUserDetails(merchantId, userId as number).subscribe({
        next: (response) => {
          if (response?.code === 200 && response?.data?.machineId) {
            this.beats = response.data.machineId;
            this.selectedBeats = [...this.beats];
            console.log("✅ Updated machine IDs via auto-refresh:", this.beats);
          }
        },
        error: (err) => {
          console.error("❌ Error during machineId auto-refresh:", err);
        }
      });
    }

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
 
    if (!userDetails) {
      console.error('❌ No user details found!');
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
      this.isStateUser = false;  // Disable state selection
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
      projects: this.selectedProjects
    });
  }

  
  
  get totalPages(): number {
    return Math.ceil(this.filteredMachines.length / this.itemsPerPage);
  }
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  clearFilters() {
    // Reset selected filters
    this.selectedMachineStatuses = ['1', '2']; // Reset machine statuses to default (Online, Offline)
    this.selectedStockStatuses = []; // Clear stock statuses
    this.selectedBurnStatuses = []; // Clear burn statuses
    this.selectedZones = []; // Clear selected zones (states)
    this.selectedWards = []; // Clear selected wards (districts)
    this.selectedBeats = []; // Clear selected beats (machines)
    this.selectedProjects = []; // Clear selected projects

  // ✅ Reset search filters
  this.columnFilters = {
    'Machine ID': '', 
    'Location Name': '',
    'Location Address': '',
    'Uid': '',
    'Machine Type': '',
    'Status': '',
    'Stock Status': '',
    'Burning Status': ''
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
    this.isLoading = true;
    this.errorMessage = '';
 
    const merchantId = this.commonDataService.merchantId ?? '';
    const userDetails = this.commonDataService.userDetails;
 
    if (!userDetails || !userDetails.machineId || userDetails.machineId.length === 0) {
      console.error('❌ Missing User Details! API request cannot proceed.');
      this.isLoading = false;
      return;
    }
 
    const queryParams: any = {
      merchantId,
      machineId: this.selectedBeats.length > 0 ? [...this.selectedBeats] : [...userDetails.machineId],
      machineStatus: this.selectedMachineStatuses.length > 0 ? [...this.selectedMachineStatuses] : ['1', '2'],
      stockStatus: this.selectedStockStatuses.length > 0 ? [...this.selectedStockStatuses] : [],
      burnStatus: this.selectedBurnStatuses.length > 0 ? [...this.selectedBurnStatuses] : [],
      level1: this.selectedZones.length > 0 ? [...this.selectedZones] : [],
      level2: this.selectedWards.length > 0 ? [...this.selectedWards] : [],
      level3: [], // Default to empty array
      level4: this.selectedProjects.length > 0 ? [...this.selectedProjects] : [] // Added from second code
    };
 
    // Ensure `level3` is NOT the same as `machineId`
    if (this.selectedBeats.length > 0 && this.selectedBeats !== userDetails.machineId) {
      queryParams.level3 = [];
    }
 
    console.log('📡 Final API Call Params:', queryParams);
 
    this.dataService
      .getMachineDashboardSummary(queryParams)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.handleServerError(error);
          return throwError(() => error);
        })
      )
      .subscribe(
        (response: any) => {
          console.log('✅ API Response:', response);
 
          if (response?.code === 200 && response.data) {
            this.machines = response.data.machines.map((machine: any) => ({
              ...machine,
              status: machine.status === 'Online' ? '1' : '2',
              stockStatus: machine.stockStatus?.length > 0
                ? machine.stockStatus.map((stock: any) =>
                    stock.SpringStatus === 'Ok' ? 'Full' :
                    stock.SpringStatus === 'No Stock' ? 'Empty' :
                    stock.SpringStatus === 'Low Stock' ? 'Low' : 'N/A'
                  ).join(', ')
                : 'N/A',
              burningStatus: machine.burningStatus?.toLowerCase() === 'burning' ? '2' : '1'
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
              itemsDispensed: response.data.itemsDispensed ?? 0
            };
 
            this.updateFilters();
            
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
      .map(word => {
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
    const parts = address.split(',').map(part => part.trim());
 
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
      this.filteredMachines = this.machines.filter(machine =>
        machine.machineId.includes(this.searchQuery) ||
        machine.machineType?.includes(this.searchQuery) ||
        machine.status?.includes(this.searchQuery) ||
        machine.stockStatus?.includes(this.searchQuery) ||
        machine.burningStatus?.includes(this.searchQuery)
      );
    }
   
    this.currentPage = 1;
    this.paginateMachines();
   
    console.log('Filtered Machines after search:', this.filteredMachines);
   
    const totalPages = Math.ceil(this.filteredMachines.length / this.itemsPerPage);
    console.log('Total Pages:', totalPages);
   
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages > 0 ? totalPages : 1;
    }
   
    console.log('Current Page after search:', this.currentPage);
    this.paginateMachines();
  }
 
  // toggleSelectAll(selectedArray: any[], optionsArray: any[], filterKey?: string) {
  //   // Handle project selection specially
  //   if (filterKey === 'projects') {
  //     const allKeys = optionsArray.map(option => option.ProjectId);
     
  //     if (selectedArray.length === allKeys.length) {
  //       selectedArray.length = 0; // Clear array
  //     } else {
  //       selectedArray.splice(0, selectedArray.length, ...allKeys); // Fill array
  //     }
  //   } else {
  //     // For other types (machine statuses, etc.)
  //     const allKeys = optionsArray.map(option => option.key || option);
     
  //     const allSelected = allKeys.every(key => selectedArray.includes(key));
     
  //     if (allSelected) {
  //       selectedArray.length = 0; // unselect all
  //     } else {
  //       selectedArray.length = 0;
  //       selectedArray.push(...allKeys); // select all
  //     }
  //   }
 
  //   this.loadMachineData();
  // }
  toggleSelectAll(selectedArray: any[], optionsArray: any[], filterKey: string) {
    const allKeys = optionsArray.map(option => option.ProjectId || option.key || option);
  
    // If all items are selected, deselect all
    if (selectedArray.length === allKeys.length) {
      selectedArray.length = 0; // Clear selection
    } else {
      selectedArray.length = 0; // Clear current selection
      selectedArray.push(...allKeys); // Select all items
    }


    if (filterKey === 'zones') {
      this.filterWardsBasedOnZones(); // ✅ Update districts when zones are changed
    }
  
  
    this.loadMachineData(); // Re-fetch data after change
  }
  toggleSelection(array: any[], value: string, filterKey: string) {
    if (array.includes(value)) {
      array.splice(array.indexOf(value), 1); // Remove selection
    } else {
      array.push(value); // Add to selection
    }
  

    if (filterKey === 'zones') {
      this.filterWardsBasedOnZones(); // ✅ Update districts when zones are changed
    }
  
    this.loadMachineData(); // Re-fetch data after change
  }
  
  updateFilters() {
    if (this.initialZones.length === 0) {
      // Store all unique values from the API response for filters
      this.initialZones = Array.from(new Set(this.machines.map(m => m.level1).filter(Boolean))).sort();
      this.initialWards = Array.from(new Set(this.machines.map(m => m.level2).filter(Boolean))).sort();
      this.initialBeats = Array.from(new Set(this.machines.map(m => m.machineId).filter(Boolean))).sort();
      this.initialProjects = this.commonDataService.userDetails?.projectName ?? [];
    }
 
    this.zones = [...this.initialZones].sort();
    // Update wards based on selected zones (key feature you want to add)
    this.filterWardsBasedOnZones();
    this.beats = [...this.initialBeats].sort();
    this.projects = [...this.initialProjects].sort((a, b) => a.projectname.localeCompare(b.projectname));
 
    console.log('✅ Filters Updated:', {
      zones: this.zones,
      wards: this.wards,
      beats: this.beats,
      projects: this.projects
    });
  }
 
  // Key method for filtering districts based on selected states
  filterWardsBasedOnZones() {
    if (this.selectedZones.length === 0) {
      // If no zones selected, show all wards
      this.wards = [...this.initialWards];
    } else {
      // Filter wards based on selected zones
      this.wards = Array.from(
        new Set(
          this.machines
            .filter(machine => this.selectedZones.includes(machine.level1))
            .map(machine => machine.level2)
            .filter(Boolean)
        )
      ).sort();
    }
 
    // Reset selected wards if they are not in the new filtered list
    this.selectedWards = this.selectedWards.filter(ward => this.wards.includes(ward));
   
    console.log('🔍 Filtered Wards Based on Zones:', {
      selectedZones: this.selectedZones,
      filteredWards: this.wards,
      selectedWards: this.selectedWards
    });
  }
 
  toggleDropdown(filterType: string) {
    // If there is only one value, do not show dropdown
    if ((filterType === 'zones' && this.zones.length === 1) ||
        (filterType === 'wards' && this.wards.length === 1) ||
        (filterType === 'beats' && this.beats.length === 1) ||
        (filterType === 'projects' && this.projects.length === 1)) {
      return;
    }
 
    // Prevent dropdown toggle for 'zones' if the user is a District User
    if (filterType === 'zones' && this.isDistrictUser) {
      return;
    }
   
    // Remove any potentially problematic elements (from second code)
    document.querySelector('.fs-2.fw-semibold')?.remove();
 
    // Normal dropdown toggle
    Object.keys(this.dropdownOpen).forEach(key => {
      if (key !== filterType) {
        this.dropdownOpen[key] = false;
        this.searchText[key] = ''; // ✅ Already correct

      }
    });
 
    this.dropdownOpen[filterType] = !this.dropdownOpen[filterType];

    if (!this.dropdownOpen[filterType]) {
      this.searchText[filterType] = ''; // Clear search text when closing
    }
    
    
 
    // Auto-close dropdown after 15 seconds
    if (this.dropdownOpen[filterType]) {
      setTimeout(() => {
        if (this.dropdownOpen[filterType]) {
          this.dropdownOpen[filterType] = false;
          this.searchText[filterType] = ''; // ✅ Clear search on auto-close

          console.log(`⏳ Auto-closed dropdown: ${filterType} after 15 sec`);
        }
      }, 15000);
    }
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
    Object.keys(this.dropdownOpen).forEach(key => {
      this.dropdownOpen[key] = false;
      this.searchText[key] = ''; // Clear search text for each closed dropdown

    });
 
    console.log('❌ Clicked outside, closed all dropdowns.');
  }
 
  handleServerError(error: any) {
    console.error('❌ Server Error:', error);
    this.errorMessage = error.status === 0
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
  // applyFiltersAndSort() {
  //   this.filteredMachines = this.machines.filter(machine => {



  
  //     return (!this.columnFilters['Machine ID'] || machine.machineId.toLowerCase().includes(this.columnFilters['Machine ID'].toLowerCase())) &&
  //            (!this.columnFilters['Machine Type'] || machine.machineType.toLowerCase().includes(this.columnFilters['Machine Type'].toLowerCase())) &&
  //            (!this.columnFilters['Status'] || (machine.status === '1' ? 'Online' : 'Offline').toLowerCase().includes(this.columnFilters['Status'].toLowerCase())) &&
  //            (!this.columnFilters['Stock Status'] || machine.stockStatus.toLowerCase().includes(this.columnFilters['Stock Status'].toLowerCase())) &&
            
  //            (!this.columnFilters['Burning Status'] || this.getBurningStatusLabel(machine.burningStatus).toLowerCase().includes(this.columnFilters['Burning Status'].toLowerCase()));

                  
  //   });
  
  //   if (this.sortKey) {
  //     this.filteredMachines.sort((a, b) => {
  //       const valueA = a[this.sortKey]?.toString().toLowerCase();
  //       const valueB = b[this.sortKey]?.toString().toLowerCase();
  //       if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
  //       if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
  //       return 0;
  //     });
  //   }
  // }
  
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
    this.filteredMachines = this.machines.filter(machine => {
      const locationAddress = machine.address?.toLowerCase() || '';
      const locationName = this.getLastPartAfterLastComma(machine.address || '').toLowerCase();
      const uid = machine.uid?.toLowerCase() || '';
  
      return (
        (!this.columnFilters['Machine ID'] || machine.machineId.toLowerCase().includes(this.columnFilters['Machine ID'].toLowerCase())) &&
        (!this.columnFilters['Machine Type'] || machine.machineType.toLowerCase().includes(this.columnFilters['Machine Type'].toLowerCase())) &&
        (!this.columnFilters['Status'] || (machine.status === '1' ? 'Online' : 'Offline').toLowerCase().includes(this.columnFilters['Status'].toLowerCase())) &&
        (!this.columnFilters['Stock Status'] || machine.stockStatus.toLowerCase().includes(this.columnFilters['Stock Status'].toLowerCase())) &&
        (!this.columnFilters['Burning Status'] || this.getBurningStatusLabel(machine.burningStatus).toLowerCase().includes(this.columnFilters['Burning Status'].toLowerCase())) &&
        (!this.columnFilters['Location Address'] || locationAddress.includes(this.columnFilters['Location Address'].toLowerCase())) &&
        (!this.columnFilters['Location Name'] || locationName.includes(this.columnFilters['Location Name'].toLowerCase())) &&
        (!this.columnFilters['Uid'] || uid.includes(this.columnFilters['Uid'].toLowerCase()))
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
  
}