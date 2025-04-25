 
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
    burnCycles: number;
    sanNapkinsBurnt: number;
  }
 
  interface ReportItem {
    reportType: string;
    machineType: string;
    srNo: number;
    machineId: string;
    machineLocation: string;
    address: string;
    transactions: Transaction[];
    vending?: { date: string; quantity: number; cashCollected: number }[];
    incinerator?: { onTime: string; burnCycles: number; sanitaryNapkinsBurnt: number }[];
 
  }
 
  @Component({
    selector: 'app-smart-tables-basic-example',
    templateUrl: './smart-tables-basic-example.component.html',
    styleUrls: ['./smart-tables-basic-example.component.scss']
  })
  export class SmartTablesBasicExampleComponent implements OnInit {
    private refreshSubscription!: Subscription;  // Declare with '!' to avoid undefined error
    private autoRefreshSubscription!: Subscription;
    private refreshInterval = 120; // refresh interval in seconds
    private countdownInterval!: any;
    refreshCountdown = 0;
    searchQuery: string = '';  // ✅ This is the search input value
 
    isLoading = false;
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
 
    dropdownOpen: Record<string, boolean> = { zone: false, ward: false, beat: false, machine: false };
    reportsData: ReportItem[] = [];
    filteredData: ReportItem[] = [];
 
    reportGenerated = '';
    reportFromPeriod = '';
    reportToPeriod = '';
 
    grandTotal = {
      quantity: 0,
      cash: '₹ 0',
      burnCycles: 0,
      sanNapkinsBurnt: 0
    };
 
    // ✅ Pagination
    paginatedData: ReportItem[] = [];
    currentPage = 1;
    itemsPerPage = 10;
    reportType: any;
 
    constructor(
      private dataService: DataService,
      private commonDataService: CommonDataService,
      private cdr: ChangeDetectorRef
    ) {}
 
    ngOnInit() {
      // this.loadReport();
     
 
      this.merchantId = this.commonDataService.merchantId ?? '';
   
 
      if (!this.merchantId) {
        this.errorMessage = "User details not found. Please log in again.";
        return;
      }
 
 
      this.setDefaultDates();
      this.fetchUserDetails(); // ✅ Fetch User Details First
      this.loadCommonData();
 
      document.addEventListener('click', this.closeDropdownOnClickOutside.bind(this));
      this.cdr.detectChanges();
    // Start auto-refresh functionality
    this.startAutoRefresh();
 
    // Start the countdown
    this.startRefreshCountdown();
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
    const minutes = Math.floor(this.refreshCountdown / 60).toString().padStart(1, '0');
    const seconds = (this.refreshCountdown % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
 
  resetRefreshCountdown(): void {
    this.refreshCountdown = this.refreshInterval;
  }
 
 
 
  // loadCommonData() {
  //   this.commonDataService.userDetails().subscribe((res: any) => {
  //     console.log('CommonDataService Loaded: ', res);
  //     this.projectList = res.userDetails.projectName || [];
  //     this.projectNames = this.projectList.map((p: any) => p.projectname);
  //     console.log('Project List:', this.projectList);
  //     console.log('Project Names:', this.projectNames);
  //   });
  // }
 
 
 
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
 
 
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
 
    // ✅ Apply Search Filter Before Pagination
    let filteredResults: ReportItem[] = this.reportsData;
 
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
 
      filteredResults = this.reportsData
        .map(machine => {
          // ✅ Ensure All Machine-Level Fields Are Strings Before Searching
          const machineMatches = [
            machine.machineId?.toString().toLowerCase() ?? '',
            machine.machineLocation?.toString().toLowerCase() ?? '',
            machine.address?.toString().toLowerCase() ?? '',
            machine.machineType?.toString().toLowerCase() ?? ''
          ].some(value => value.includes(query)); // ✅ Check if query is found in any machine field
 
          // ✅ Ensure All Transaction Fields Are Strings Before Searching
          const filteredTransactions = machine.transactions?.filter(txn =>
            Object.values(txn || {}).some(value =>
              value !== null && value !== undefined &&
              value.toString().toLowerCase().includes(query)
            )
          ) || [];
         
          // ✅ Keep the machine if it matches OR any transaction matches
          if (machineMatches || filteredTransactions.length > 0) {
            return { ...machine, transactions: filteredTransactions.length > 0 ? filteredTransactions : machine.transactions };
          }
          return undefined;
        })
        .filter((machine): machine is ReportItem => machine !== undefined); // ✅ Remove `undefined` values
    }
 
    // Store the filtered data for pagination calculations
    this.filteredData = filteredResults;
   
    // ✅ Ensure current page is valid after changing items per page
    const maxPage = Math.max(1, Math.ceil(this.filteredData.length / this.itemsPerPage));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
 
    // ✅ Paginate the Filtered Data
    this.paginatedData = this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  }
 
  loadCommonData() {
    // Access userDetails as a property, not a function
    const userDetails = this.commonDataService.userDetails;
    console.log('CommonDataService User Details:', userDetails);
 
    if (userDetails && userDetails.projectName) {
      // Store the full project information
      this.projectList = Array.isArray(userDetails.projectName)
        ? userDetails.projectName
        : [userDetails.projectName];
   
      // Extract just the names for display
      this.projectNames = this.projectList.map((p: any) =>
        typeof p === 'object' ? p.projectname : p
      );
   
      console.log('Project List:', this.projectList);
      console.log('Project Names:', this.projectNames);
   
      // Auto-select all projects
      this.selectedProjectNames = [...this.projectNames];
    }
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
      document.removeEventListener('click', this.closeDropdownOnClickOutside.bind(this));
  }
  closeDropdownOnClickOutside(event: Event) {
    const clickedInsideDropdown = Object.keys(this.dropdownOpen).some(
      key => this.dropdownOpen[key] && event.target instanceof HTMLElement && event.target.closest('.dropdown')
    );
 
    if (!clickedInsideDropdown) {
      this.dropdownOpen = { zone: false, ward: false, beat: false, machine: false };
      this.cdr.detectChanges();
    }
  }
 
 
  fetchUserDetails() {
    this.isLoading = true;
 
    const userDetails = this.commonDataService.userDetails;
    console.log("📌 Raw API User Details:", userDetails);
 
    if (!userDetails || !userDetails.machineId || !userDetails.state || !userDetails.district || !userDetails.projectName) {
        console.error("❌ User details missing or empty!", userDetails);
        this.errorMessage = "User details not found. Please log in again.";
        this.isLoading = false;
        return;
    }
 
    // ✅ Assign values
    this.machineIds = [...userDetails.machineId];
    this.zones = [...userDetails.state];  
    this.wards = [...userDetails.district];
 
    // ✅ Auto-select all options
    this.selectedMachineIds = [...this.machineIds];
    this.selectedZones = [...this.zones];
    this.selectedWards = [...this.wards];
    this.projectNames = Array.isArray(userDetails.projectName) ? userDetails.projectName : [userDetails.projectName]; // Populate project names
    this.selectedProjectNames = [...this.projectNames]; // Auto-select all project names
 
    // ✅ Handle companyName as array of objects
    this.beats = Array.isArray(userDetails.projectName)
    ? userDetails.projectName.map((name: string, index: number) => ({
        ClientId: (index + 1).toString(), // or use another unique identifier if needed
        projectName: name
      }))
    : [{
        ClientId: '1',
        projectName: userDetails.projectName
      }];
 
 
    console.log("Beats Data:", this.beats);
 
    console.log("📌 Filters Populated & Selected:", {
        machineIds: this.machineIds,
        selectedMachineIds: this.selectedMachineIds,
        zones: this.zones,
        selectedZones: this.selectedZones,
        wards: this.wards,
        selectedWards: this.selectedWards,
        beats: this.beats,
        selectedBeats: this.selectedBeats
    });
 
    this.updateFilters();
    this.isLoading = false;
    this.cdr.detectChanges();  // ✅ Ensure UI updates
  }
 
 
  // updateFilters() {
  //   this.zones = Array.from(new Set(this.zones)).filter(Boolean);
  //   this.wards = Array.from(new Set(this.wards)).filter(Boolean);
  //   this.beats = Array.from(new Set(this.beats)).filter(Boolean);
  //   this.machineIds = Array.from(new Set(this.machineIds)).filter(Boolean);
  //   this.projectNames = Array.from(new Set(this.projectNames)).filter(Boolean); // Update project names
  //   if (this.projectNames.length === 1) this.selectedProjectNames = [this.projectNames[0]]; // Auto-select single project name
 
  //   // ✅ Auto-select single values
  //   if (this.zones.length === 1) this.selectedZones = [this.zones[0]];
  //   if (this.wards.length === 1) this.selectedWards = [this.wards[0]];
  //   if (this.beats.length === 1) this.selectedBeats = [this.beats[0]];
  //   if (this.machineIds.length === 1) this.selectedMachineIds = [this.machineIds[0]];
  // }
 
 
 
  updateFilters() {
    this.zones = Array.from(new Set(this.zones)).filter(Boolean);
    this.wards = Array.from(new Set(this.wards)).filter(Boolean);
    this.beats = Array.from(new Set(this.beats)).filter(Boolean);
    this.machineIds = Array.from(new Set(this.machineIds)).filter(Boolean);
 
    // Handle project names properly
    this.projectNames = Array.from(new Set(this.projectNames)).filter(Boolean);
 
    // Auto-select single values
    if (this.zones.length === 1) this.selectedZones = [this.zones[0]];
    if (this.wards.length === 1) this.selectedWards = [this.wards[0]];
    if (this.beats.length === 1) this.selectedBeats = [this.beats[0]];
    if (this.machineIds.length === 1) this.selectedMachineIds = [this.machineIds[0]];
    if (this.projectNames.length === 1) this.selectedProjectNames = [this.projectNames[0]];
 
    // Ensure we update the project IDs when filters are updated
    if (this.selectedProjectNames.length > 0) {
      const projectIds = this.getProjectIds(this.selectedProjectNames);
      console.log("Initial selected project IDs:", projectIds);
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
 
 
  //   /** ✅ Fetch Machine IDs Dynamically */
  //   fetchMachineIds() {
  //     this.isLoading = true;
 
  //     this.dataService.getMachineIds(this.merchantId).subscribe(
  //       (machineIds) => {
  //         this.machineIds = machineIds;
  //         this.selectedMachineIds = [...machineIds]; // Default select all machines
  //         this.loadReport();  // Load report after fetching machines
  //       },
  //       (error) => {
  //         console.error("❌ Error fetching machines:", error);
  //         this.errorMessage = "Error fetching machines.";
  //         this.isLoading = false;
  //       }
  //     );
  //   }
  //   getSerialNumber(machine: ReportItem): number {
  //     return this.paginatedData.findIndex(m => m.machineId === machine.machineId) + 1 + ((this.currentPage - 1) * this.itemsPerPage);
  //   }
 
 
 
  //   loadReport() {
  //     this.isLoading = true;
  //     this.errorMessage = '';
 
  //     // const selectedMachines = this.selectedMachineIds.length ? this.selectedMachineIds : [...this.machineIds];
  //     const selectedMachines =
  //   this.machineFilterTouched
  //     ? this.selectedMachineIds
  //     : [...this.machineIds];
 
  // if (selectedMachines.length === 0) {
 
  //   return;
  // }
 
  //     const selectedZones = this.selectedZones.length ? this.selectedZones : [...this.zones];
  //     const selectedWards = this.selectedWards.length ? this.selectedWards : [...this.wards];
   
  //     // Get project IDs based on selected project names
  //     const selectedProjects = this.selectedProjectNames.length ? this.selectedProjectNames : [...this.projectNames];
   
  //     // Get project IDs from the project list
  //     const selectedProjectIds = selectedProjects.map(projectName => {
  //       // Find the project in the project list
  //       const project = this.projectList.find(p =>
  //         p.projectname === projectName || p === projectName
  //       );
     
  //       // Return the ProjectId if found (note: case sensitive - ProjectId with capital P)
  //       return project && project.ProjectId ? project.ProjectId.toString() : '';
  //     }).filter(id => id); // Remove empty IDs
   
  //     console.log("📡 Calling API with:", {
  //       startDate: this.startDate,
  //       endDate: this.endDate,
  //       merchantId: this.merchantId,
  //       selectedMachines,
  //       selectedZones,
  //       selectedWards,
  //       selectedProjects,
  //       selectedProjectIds
  //     });
 
  //     // Call the API with the project IDs as an array
  //     this.dataService.getMachineAndIncineratorTransaction(
  //       this.startDate,
  //       this.endDate,
  //       this.merchantId,
  //       selectedMachines,
  //       selectedZones,
  //       selectedWards,
  //       [], // level3 (empty or your beat IDs if needed)
  //       selectedProjectIds // level4 - Pass as array of strings
  //     ).subscribe(
  //       (response: any) => {
  //         console.log("✅ API Response Received:", response);
  //         if (response.code === 200 && response.data?.machineDetails) {
  //           this.reportGenerated = new Date().toISOString();
  //           this.reportFromPeriod = response.data.reportFromPeriod || '-';
  //           this.reportToPeriod = response.data.reportToPeriod || '-';
  //           this.reportType = response.data.reportType || '-';
 
  //           console.log("📌 Report Metadata Set:", {
  //             reportGenerated: this.reportGenerated,
  //             reportFromPeriod: this.reportFromPeriod,
  //             reportToPeriod: this.reportToPeriod,
  //             reportType: this.reportType
  //           });
 
  //           this.processResponseData(response.data.machineDetails);
  //         } else {
  //           this.filteredData = [];
  //           this.errorMessage = "No data available for the selected filters.";
  //         }
  //         this.isLoading = false;
  //       },
  //       (error) => {
  //         this.errorMessage = "Error fetching data. Please try again.";
  //         this.isLoading = false;
  //       }
  //     );
  //   }   ABOVE IS WITHOUT ERROR CODES  
 /** ✅ Fetch Machine IDs Dynamically */
fetchMachineIds() {
  this.isLoading = true;
 
  this.dataService.getMachineIds(this.merchantId).subscribe(
    (machineIds) => {
      this.machineIds = machineIds;
      this.selectedMachineIds = [...machineIds]; // Default select all machines
      this.loadReport();  // Load report after fetching machines
    },
    (error) => {
      console.error("❌ Error fetching machines:", error);
      this.handleError(error);
      this.isLoading = false;
    }
  );
}
 
/** Method to show error messages as popups */
handleError(error: any) {
  let errorMessage = "An unknown error occurred.";
 
  if (error.status === 400) {
    errorMessage = "Bad Request (400). Please check the request data.";
  } else if (error.status === 404) {
    errorMessage = "Not Found (404). The requested resource could not be found.";
  } else if (error.status === 500) {
    errorMessage = "Internal Server Error (500). Something went wrong on the server.";
  } else if (error.status === 0) {
    errorMessage = "Network Error. Please check your internet connection.";
  }
 
  this.errorMessage = errorMessage;
 
  // Automatically hide the error message after 8 seconds
  setTimeout(() => {
    this.errorMessage = '';
  }, 8000);
}
 
getSerialNumber(machine: ReportItem): number {
  return this.paginatedData.findIndex(m => m.machineId === machine.machineId) + 1 + ((this.currentPage - 1) * this.itemsPerPage);
}
 
loadReport() {
  this.isLoading = true;
  this.errorMessage = '';
  console.log("Machine filter touched:", this.machineFilterTouched);
  console.log("Selected machine IDs:", this.selectedMachineIds);
  console.log("All machine IDs:", this.machineIds);
  const selectedMachines = this.machineFilterTouched
    ? this.selectedMachineIds
    : [...this.machineIds];
 
  if (selectedMachines.length === 0) {
    return;
  }
 
  const selectedZones = this.selectedZones.length ? this.selectedZones : [...this.zones];
  const selectedWards = this.selectedWards.length ? this.selectedWards : [...this.wards];
 
  const selectedProjects = this.selectedProjectNames.length ? this.selectedProjectNames : [...this.projectNames];
 
  const selectedProjectIds = selectedProjects.map(projectName => {
    const project = this.projectList.find(p =>
      p.projectname === projectName || p === projectName
    );
    return project && project.ProjectId ? project.ProjectId.toString() : '';
  }).filter(id => id);
 
  console.log("📡 Calling API with:", {
    startDate: this.startDate,
    endDate: this.endDate,
    merchantId: this.merchantId,
    selectedMachines,
    selectedZones,
    selectedWards,
    selectedProjects,
    selectedProjectIds
  });
 
  this.dataService.getMachineAndIncineratorTransaction(
    this.startDate,
    this.endDate,
    this.merchantId,
    selectedMachines,
    selectedZones,
    selectedWards,
    [],
    selectedProjectIds
  ).subscribe(
    (response: any) => {
      console.log("✅ API Response Received:", response);
      if (response.code === 200 && response.data?.machineDetails) {
        this.reportGenerated = new Date().toISOString();
        this.reportFromPeriod = response.data.reportFromPeriod || '-';
        this.reportToPeriod = response.data.reportToPeriod || '-';
        this.reportType = response.data.reportType || '-';
 
        console.log("📌 Report Metadata Set:", {
          reportGenerated: this.reportGenerated,
          reportFromPeriod: this.reportFromPeriod,
          reportToPeriod: this.reportToPeriod,
          reportType: this.reportType
        });
 
        this.processResponseData(response.data.machineDetails);
      } else {
        this.filteredData = [];
        this.errorMessage = "No data available for the selected filters.";
      }
      this.isLoading = false;
    },
    (error) => {
      this.handleError(error); // Handle the error by showing popup messages
      this.isLoading = false;
    }
  );
}
 
 
  // // Add this new method to your component
  // getProjectIds(projectNames: string[]): string[] {
  //   return projectNames.map(name => {
  //     const project = this.projectList.find(p => p.projectname === name || p === name);
  //     return project && project.ClientId ? project.ClientId.toString() : '';
  //   }).filter(id => id); // Filter out empty IDs
  // }
 
 
 
// // Improved getProjectIds method to handle different project object formats
// getProjectIds(projectNames: string[]): string[] {
//   const projectIds: string[] = [];
 
//   projectNames.forEach(name => {
//     // Find the project in the projectList by name
//     const project = this.projectList.find(p => {
//       // Handle both cases: when p is an object with projectname or when p is the name itself
//       return (p.projectname && p.projectname === name) || p === name;
//     });
   
//     // If found and it has a ClientId, add it to projectIds
//     if (project) {
//       const clientId = project.ClientId || project.clientId;
//       if (clientId) {
//         projectIds.push(clientId.toString());
//       }
//     }
//   });
 
//   console.log("Project Names mapped to IDs:", {
//     names: projectNames,
//     ids: projectIds
//   });
 
//   return projectIds;
// }
 
machineFilterTouched = false;
onMachineSelectionChange(selected: string[]) {
  this.selectedMachineIds = selected;
  this.machineFilterTouched = true;
}
 
getProjectIds(projectNames: string[]): string[] {
  // If user details has direct clientId, use it as a fallback
  if (projectNames.length > 0 &&
      this.commonDataService.userDetails &&
      this.commonDataService.userDetails.clientId) {
    return [this.commonDataService.userDetails.clientId.toString()];
  }
 
  // Otherwise try to map project names to IDs
  const projectIds: string[] = [];
 
  // Log current state for debugging
  console.log("Project names:", projectNames);
  console.log("Project list:", this.projectList);
 
  // If we have a clientId directly in user details, use it
  if (this.commonDataService.userDetails && this.commonDataService.userDetails.clientId) {
    return [this.commonDataService.userDetails.clientId.toString()];
  }
 
  return projectIds;
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
 
 
// processResponseData(machineDetails: any[]) {
//   let grandTotalQty = 0;
//   let grandTotalCash = 0;
//   let grandTotalBurnCycles = 0;
//   let grandTotalSanNapkins = 0;
 
//   // this.reportsData = machineDetails.map((machine, index): ReportItem => {//before i did
//     this.reportsData = machineDetails
//     .filter(machine => (machine.vending && machine.vending.length) || (machine.incinerator && machine.incinerator.length))
//     .map((machine, index): ReportItem => {
 
//       let transactionsMap = new Map<string, Transaction>();
 
//       // ✅ Initialize Machine Totals
//       let machineTotalQty = 0;
//       let machineTotalCash = 0;
//       let machineTotalBurnCycles = 0;
//       let machineTotalSanNapkins = 0;
 
//       // ✅ Handle Vending Transactions (Check for null)
//       (machine.vending || []).forEach((txn: any) => {
//           if (txn.date !== 'Total') {
//               machineTotalQty += txn.quantity ?? 0;
//               machineTotalCash += txn.cashCollected ?? 0;
//           }
//           transactionsMap.set(txn.date, {
//               date: txn.date,
//               qty: txn.quantity ?? 0,
//               cash: `₹ ${txn.cashCollected?.toFixed(2) ?? '0'}`,
//               onTime: '-',
//               burnCycles: 0,
//               sanNapkinsBurnt: 0
//           });
//       });
 
//       // ✅ Handle Incinerator Transactions (Check for null)
//       (machine.incinerator || []).forEach((txn: any) => {
//           if (txn.onTime !== 'Total') {
//               machineTotalBurnCycles += txn.burnCycles ?? 0;
//               machineTotalSanNapkins += txn.sanitaryNapkinsBurnt ?? 0;
//           }
 
//           if (transactionsMap.has(txn.onTime)) {
//               let existingTxn = transactionsMap.get(txn.onTime)!;
//               existingTxn.onTime = txn.onTime ?? '-';
//               existingTxn.burnCycles = txn.burnCycles ?? 0;
//               existingTxn.sanNapkinsBurnt = txn.sanitaryNapkinsBurnt ?? 0;
//           } else {
//               transactionsMap.set(txn.onTime, {
//                   date: txn.onTime,
//                   qty: 0,
//                   cash: '₹ 0',
//                   onTime: txn.onTime ?? '-',
//                   burnCycles: txn.burnCycles ?? 0,
//                   sanNapkinsBurnt: txn.sanitaryNapkinsBurnt ?? 0
//               });
//           }
//       });
 
//       // ✅ Add Machine's Total Row
//       transactionsMap.set('Total', {
//           date: 'Total',
//           qty: machineTotalQty,
//           cash: `₹ ${machineTotalCash.toFixed(2)}`,
//           onTime: '-',
//           burnCycles: machineTotalBurnCycles,
//           sanNapkinsBurnt: machineTotalSanNapkins
//       });
 
//       // ✅ Update Grand Total (Sum of Each Machine's Totals)
//       grandTotalQty += machineTotalQty;
//       grandTotalCash += machineTotalCash;
//       grandTotalBurnCycles += machineTotalBurnCycles;
//       grandTotalSanNapkins += machineTotalSanNapkins;


      
 
//       return {
//           srNo: index + 1,
//           machineId: machine.machineId,
//           machineLocation: machine.machineLocation ? machine.machineLocation.trim() : machine.address,
//           address: machine.address || '',
//           machineType: machine.machineType || 'N/A',
//           reportType: machine.reportType || 'N/A',
//           transactions: Array.from(transactionsMap.values())
//       };
//   });
 
//   // ✅ Update Grand Total Correctly
//   this.grandTotal = {
//       quantity: grandTotalQty,
//       cash: `₹ ${grandTotalCash.toFixed(2)}`,
//       burnCycles: grandTotalBurnCycles,
//       sanNapkinsBurnt: grandTotalSanNapkins
//   };
 
//   this.filteredData = [...this.reportsData];
//   this.updatePagination();
// }
 

processResponseData(machineDetails: any[]) {
  let grandTotalQty = 0;
  let grandTotalCash = 0;
  let grandTotalBurnCycles = 0;
  let grandTotalSanNapkins = 0;

  this.reportsData = machineDetails
    .filter(machine => (machine.vending && machine.vending.length) || (machine.incinerator && machine.incinerator.length))
    .map((machine, index): ReportItem => {

      let transactionsMap = new Map<string, Transaction>();

      // ✅ Initialize Machine Totals
      let machineTotalQty = 0;
      let machineTotalCash = 0;
      let machineTotalBurnCycles = 0;
      let machineTotalSanNapkins = 0;

      // ✅ Handle Vending Transactions (Check for null)
      (machine.vending || []).forEach((txn: any) => {
          if (txn.date !== 'Total') {
              machineTotalQty += txn.quantity ?? 0;
              machineTotalCash += txn.cashCollected ?? 0;
          }
          
          // Use date as the key to ensure data is properly matched
          const dateKey = txn.date;
          
          transactionsMap.set(dateKey, {
              date: txn.date,
              qty: txn.quantity ?? 0,
              cash: `₹ ${txn.cashCollected?.toFixed(2) ?? '0'}`,
              onTime: '-',
              burnCycles: 0,
              sanNapkinsBurnt: 0
          });
      });

      // ✅ Handle Incinerator Transactions (Check for null)
      (machine.incinerator || []).forEach((txn: any) => {
          if (txn.onTime !== 'Total') {
              machineTotalBurnCycles += txn.burnCycles ?? 0;
              machineTotalSanNapkins += txn.sanitaryNapkinsBurnt ?? 0;
          }

          // Use onTime as the key to ensure data is properly matched
          const dateKey = txn.onTime;
          
          if (transactionsMap.has(dateKey)) {
              // Update existing transaction for this date
              let existingTxn = transactionsMap.get(dateKey)!;
              existingTxn.onTime = txn.onTime ?? '-';
              existingTxn.burnCycles = txn.burnCycles ?? 0;
              existingTxn.sanNapkinsBurnt = txn.sanitaryNapkinsBurnt ?? 0;
          } else {
              // Create new transaction if no vending data exists for this date
              transactionsMap.set(dateKey, {
                  date: txn.onTime,
                  qty: 0,
                  cash: '₹ 0',
                  onTime: txn.onTime ?? '-',
                  burnCycles: txn.burnCycles ?? 0,
                  sanNapkinsBurnt: txn.sanitaryNapkinsBurnt ?? 0
              });
          }
      });

      // ✅ Add Machine's Total Row
      transactionsMap.set('Total', {
          date: 'Total',
          qty: machineTotalQty,
          cash: `₹ ${machineTotalCash.toFixed(2)}`,
          onTime: '-',
          burnCycles: machineTotalBurnCycles,
          sanNapkinsBurnt: machineTotalSanNapkins
      });

      // ✅ Update Grand Total (Sum of Each Machine's Totals)
      grandTotalQty += machineTotalQty;
      grandTotalCash += machineTotalCash;
      grandTotalBurnCycles += machineTotalBurnCycles;
      grandTotalSanNapkins += machineTotalSanNapkins;

      // Convert Map to array for sorting
      let transactions = Array.from(transactionsMap.values());
      
      // Sort transactions by date (keeping 'Total' at the end)
      transactions.sort((a, b) => {
        // Always keep 'Total' at the end
        if (a.date === 'Total') return 1;
        if (b.date === 'Total') return -1;
        
        // Parse dates in the format "DD-MMM-YYYY"
        const parseDate = (dateStr: string) => {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const months: Record<string, number> = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            
            const day = parseInt(parts[0]);
            const month = months[parts[1]] || 0;
            const year = parseInt(parts[2]);
            return new Date(year, month, day);
          }
          return new Date(dateStr);
        };

        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        
        // Sort chronologically
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // Fallback to string comparison
        return a.date.localeCompare(b.date);
      });

      return {
          srNo: index + 1,
          machineId: machine.machineId,
          machineLocation: machine.machineLocation ? machine.machineLocation.trim() : machine.address,
          address: machine.address || '',
          machineType: machine.machineType || 'N/A',
          reportType: machine.reportType || 'N/A',
          transactions: transactions
      };
  });

  // ✅ Update Grand Total Correctly
  this.grandTotal = {
      quantity: grandTotalQty,
      cash: `₹ ${grandTotalCash.toFixed(2)}`, 
      burnCycles: grandTotalBurnCycles,
      sanNapkinsBurnt: grandTotalSanNapkins
  };

  this.filteredData = [...this.reportsData];
  this.updatePagination();
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
 
 
private dropdownTimeouts: { [key: string]: any } = {};
 
toggleDropdown(filterType: string, event: Event) {
  event.stopPropagation();
 
  // 🔄 Close all other dropdowns
  Object.keys(this.dropdownOpen).forEach(key => {
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
 
  console.log("📌 Dropdown State Updated:", this.dropdownOpen);
  this.cdr.detectChanges(); // ✅ Make Angular aware of changes
}
 
 
 
 
  pageChanged(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
 
  // updatePagination() {
  //   const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  //   this.paginatedData = this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  // }
 
  setSearchQuery(value: string) {
    this.searchQuery = value;
    this.updatePagination(); // ✅ Apply search when user types
  }
  clearSearch() {
    this.searchQuery = '';
  }
 
  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }
 
  onMachineChange(machine: string, event: any) {
    if (event.target.checked) {
      this.selectedMachineIds.push(machine);
    } else {
      this.selectedMachineIds = this.selectedMachineIds.filter(id => id !== machine);
    }
  }
 
 
  // toggleSelection(selectedArray: any[], option: any) {
  //   debugger;
  //   console.log("Toggle selection called with:", { array: selectedArray, option });
   
  //   // For objects, check by matching a property
  //   if (typeof option === 'object' && option !== null) {
  //     const exists = selectedArray.some(item =>
  //       typeof item === 'object' ? item.id === option.id : item === option
  //     );
     
  //     if (exists) {
  //       const index = selectedArray.findIndex(item =>
  //         typeof item === 'object' ? item.id === option.id : item === option
  //       );
  //       selectedArray.splice(index, 1);
  //     } else {
  //       selectedArray.push(option);
  //     }
  //   } else {
  //     // For simple values like strings
  //     const exists = selectedArray.includes(option);
  //     if (exists) {
  //       selectedArray.splice(selectedArray.indexOf(option), 1);
  //     } else {
  //       selectedArray.push(option);
  //     }
  //   }
   
  //   console.log("After toggle, selected array:", selectedArray);
  //   this.cdr.detectChanges();
  // }
  toggleSelection(selectedArray: any[], option: any, filterType?: string) {
    console.log("Toggle selection called with:", { array: selectedArray, option, filterType });
     
    // For objects, check by matching a property
    if (typeof option === 'object' && option !== null) {
      const exists = selectedArray.some(item =>
        typeof item === 'object' ? item.id === option.id : item === option
      );
       
      if (exists) {
        const index = selectedArray.findIndex(item =>
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
     
    // Set machineFilterTouched flag if this is a machine selection
    if (filterType === 'machineIds') {
      this.machineFilterTouched = true;
    }
     
    console.log("After toggle, selected array:", selectedArray);
    this.cdr.detectChanges();
  }
 
  // toggleSelectAll(selectedArray: string[], fullList: string[], event: any) {
  //   if (event.target.checked) {
  //     selectedArray.length = 0;
  //     fullList.forEach(item => selectedArray.push(item));
  //   } else {
  //     selectedArray.length = 0;
  //   }
  // }
  toggleSelectAll(selectedArray: string[], fullList: string[], event: any, filterType?: string) {
    if (event.target.checked) {
      selectedArray.length = 0;
      fullList.forEach(item => selectedArray.push(item));
    } else {
      selectedArray.length = 0;
    }
   
    // Set the machine filter touched flag if this is a machine selection
    if (filterType === 'machineIds') {
      this.machineFilterTouched = true;
    }
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
 
 
 
exportToExcel() {
  const table = document.querySelector('.report-table') as HTMLTableElement;
  if (!table) {
    console.error("Table not found!");
    return;
  }
 
  const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Machine Report");
 
  XLSX.writeFile(wb, 'Machine_Report.xlsx');
}
 
// toggleProjectSelection(project: string) {
//   console.log("Toggling project selection:", project);
 
//   const index = this.selectedProjectNames.indexOf(project);
//   if (index === -1) {
//     this.selectedProjectNames.push(project);
//   } else {
//     this.selectedProjectNames.splice(index, 1);
//   }
 
//   console.log("Selected projects after toggle:", this.selectedProjectNames);
//   this.cdr.detectChanges();
 
//   // Reload the report whenever project selection changes
//   this.loadReport();
// }
 
 
toggleProjectSelection(project: string) {
  console.log("Toggling project selection:", project);
 
  const index = this.selectedProjectNames.indexOf(project);
  if (index === -1) {
    this.selectedProjectNames.push(project);
  } else {
    this.selectedProjectNames.splice(index, 1);
  }
 
  console.log("Selected projects after toggle:", this.selectedProjectNames);
 
  // Get the project IDs based on the selected names
  const selectedProjectIds = this.getProjectIds(this.selectedProjectNames);
  console.log("Selected project IDs:", selectedProjectIds);
 
  this.cdr.detectChanges();
 
  // Reload the report whenever project selection changes
  this.loadReport();
}
 
toggleSummaryType() {
  this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';
 
  if (this.summaryType === 'Totals') {
    this.filteredData = []; // ✅ Clear previous totals
 
    const uniqueMachineIds = new Set(); // ✅ Track unique machines to prevent duplication
    let grandTotalQty = 0, grandTotalCash = 0, grandTotalBurnCycles = 0, grandTotalSanNapkins = 0;
 
    this.reportsData.forEach((machine, index) => {
      if (!uniqueMachineIds.has(machine.machineId)) { // ✅ Prevent duplicate machines
        uniqueMachineIds.add(machine.machineId);
 
        // ✅ Extract only the last "Total" row for each machine from API
        const vendingTotal = machine.transactions.find(txn => txn.date === 'Total') || { qty: 0, cash: '₹ 0.00' };
        const incineratorTotal = machine.transactions.find(txn => txn.onTime === 'Total') || { burnCycles: 0, sanNapkinsBurnt: 0 };
 
        const totalQty = vendingTotal.qty ?? 0;
        const totalCash = parseFloat((vendingTotal.cash ?? '₹ 0.00').replace(/[₹,]/g, '')) || 0;
        const totalBurnCycles = incineratorTotal.burnCycles ?? 0;
        const totalSanNapkins = incineratorTotal.sanNapkinsBurnt ?? 0;
 
        // ✅ Update grand totals
        grandTotalQty += totalQty;
        grandTotalCash += totalCash;
        grandTotalBurnCycles += totalBurnCycles;
        grandTotalSanNapkins += totalSanNapkins;
 
        this.filteredData.push({
          srNo: index + 1,
          machineId: machine.machineId,
          machineLocation: machine.machineLocation || '-',
          address: machine.address || '-',
          machineType: machine.machineType || 'N/A',
          reportType:machine.reportType || 'N/A',
          transactions: [{
            date: 'Total',
            qty: totalQty,
            cash: `₹ ${totalCash.toFixed(2)}`,
            onTime: '-',
            burnCycles: totalBurnCycles,
            sanNapkinsBurnt: totalSanNapkins
          }]
        });
      }
    });
 
    // ✅ Add a final "Grand Total" row
 
 
  } else {
    this.filteredData = [...this.reportsData]; // ✅ Restore "Daily" view
  }
 
  this.currentPage = 1; // ✅ Reset pagination
  this.updatePagination();
}
searchTexts: { [key: string]: string } = {};
 
// Inside your component.ts
extractLastTwoWords(address: string): string {
  if (address) {
    // Split the address by commas
    const parts = address.split(',').map(part => part.trim());
 
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
 
 