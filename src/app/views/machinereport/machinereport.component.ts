


// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { DataService } from '../../service/data.service';
// import { CommonDataService } from '../../Common/common-data.service';
// import { Pipe, PipeTransform } from '@angular/core';

// @Component({
//   selector: 'app-machinereport',
//   templateUrl: './machinereport.component.html',
//   styleUrls: ['./machinereport.component.scss'],
//   encapsulation: ViewEncapsulation.None
// })
// export class MachinereportComponent implements OnInit {
//   machineId: string = '';
//   merchantId: string = '';

//   // Tabs
//   activeTab: 'vending' | 'incineration' = 'vending';

//   // Data
//   vendingTransactions: any[] = [];
//   incinerationTransactions: any[] = [];
//   startDate: string = '';
//   endDate: string = '';
//   searchTerms: { [key: string]: string } = {};

//   // Pagination
//   currentPageVending = 1;
//   currentPageIncineration = 1;
//   itemsPerPage = 10;

//   constructor(
//     private route: ActivatedRoute,
//     private dataService: DataService,
//     private commonDataService: CommonDataService
//   ) {}

//   ngOnInit(): void {
//     this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
//     this.merchantId = localStorage.getItem('merchantId') || '';
//     const today = new Date();
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(today.getDate() - 6); // Includes today (7 total)
    
//     this.startDate = this.formatDateForAPI(sevenDaysAgo);
//     this.endDate = this.formatDateForAPI(today);
    
//     if (this.machineId && this.merchantId) {
//       // Fetch vending
//       this.dataService.getMachineTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
//         next: (res) => this.vendingTransactions = res.data || [],
//         error: (err) => console.error('Vending Error:', err)
//       });

//       // Fetch incineration
//       this.dataService.getIncInerationTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
//         next: (res) => this.incinerationTransactions = res.data || [],
//         error: (err) => console.error('Incineration Error:', err)
//       });
//     }
//   }
//   formatDateForAPI(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }
  
//   // Pagination helpers`
//   getPagedData(data: any[], page: number): any[] {
//     const start = (page - 1) * this.itemsPerPage;
//     return data.slice(start, start + this.itemsPerPage);
//   }

//   get totalPagesVending(): number {
//     return Math.ceil(this.vendingTransactions.length / this.itemsPerPage);
//   }

//   get totalPagesIncineration(): number {
//     return Math.ceil(this.incinerationTransactions.length / this.itemsPerPage);
//   }
//   fetchTransactions(): void {
//     if (this.machineId && this.merchantId) {
//       this.dataService.getMachineTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
//         next: (res) => this.vendingTransactions = res.data || [],
//         error: (err) => console.error('Vending Error:', err)
//       });
  
//       this.dataService.getIncInerationTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
//         next: (res) => this.incinerationTransactions = res.data || [],
//         error: (err) => console.error('Incineration Error:', err)
//       });
//     }
//   }
  


//   getFormattedDate(dateTime: string): string {
//     const date = new Date(dateTime);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }
  
//   getFormattedTime(dateTime: string): string {
//     const date = new Date(dateTime);
//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // The hour '0' should be '12'
//     return `${hours}:${minutes} ${ampm}`;
//   }
  
//   getHeaterStatus(status: number): string {
//     return status === 1 ? 'ON' : 'OFF';
//   }
  
//   getBurningMode(mode: number): string {
//     switch (mode) {
//       case 2: return 'AUTOMATIC';
//       case 1: return 'MANUAL';
//       case 3: return 'SCHEDULED';
//       default: return '—';
//     }
//   }
  
//   getBurningStatus(status: number): string {
//     switch (status) {
//       case 1: return 'IDLE';
//       case 2: return 'BURNING';
//       case 3: return 'COMPLETED';
//       case 4: return 'TIME OUT';
//       case 5: return 'POWER OFF TIME OUT';
//       default: return '—';
//     }
//   }
  

//   setTab(tab: 'vending' | 'incineration') {
//     this.activeTab = tab;
//   }
//   incrementVendingPage(): void {
//     if (this.currentPageVending < this.totalPagesVending) {
//       this.currentPageVending++;
//     }
//   }
  
//   decrementVendingPage(): void {
//     if (this.currentPageVending > 1) {
//       this.currentPageVending--;
//     }
//   }
  
//   incrementIncinerationPage(): void {
//     if (this.currentPageIncineration < this.totalPagesIncineration) {
//       this.currentPageIncineration++;
//     }
//   }
  
//   decrementIncinerationPage(): void {
//     if (this.currentPageIncineration > 1) {
//       this.currentPageIncineration--;
//     }
//   }
//   onStartDateChange() {
//     const start = new Date(this.startDate);
//     const end = new Date(this.endDate);
  
//     // Ensure end date is not earlier than start date
//     if (start > end) {
//       this.endDate = this.startDate;
//     }
  
//     // Restrict max range to 1 year
//     const oneYearLater = new Date(start);
//     oneYearLater.setFullYear(start.getFullYear() + 1);
  
//     if (end > oneYearLater) {
//       this.endDate = this.formatDateForAPI(oneYearLater);
//     }
  
//     this.fetchTransactions(); // Optional: re-fetch if needed
//   }
  
//   onEndDateChange() {
//     const start = new Date(this.startDate);
//     const end = new Date(this.endDate);
  
//     // Ensure start date is not later than end date
//     if (end < start) {
//       this.startDate = this.endDate;
//     }
  
//     // Restrict range to 1 year
//     const oneYearAgo = new Date(end);
//     oneYearAgo.setFullYear(end.getFullYear() - 1);
  
//     if (start < oneYearAgo) {
//       this.startDate = this.formatDateForAPI(oneYearAgo);
//     }
  
//     this.fetchTransactions(); // Optional: re-fetch if needed
//   }
  
// }









import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-machinereport',
  templateUrl: './machinereport.component.html',
  styleUrls: ['./machinereport.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MachinereportComponent implements OnInit {
  machineId: string = '';
  merchantId: string = '';
  selectedMachineId: string = '';
  machineIds: string[] = [];

  // Tabs
  activeTab: 'vending' | 'incineration' = 'vending';

  // Data
  vendingTransactions: any[] = [];
  incinerationTransactions: any[] = [];
  startDate: string = '';
  endDate: string = '';
  searchTerms: { [key: string]: string } = {};

  // Pagination
  currentPageVending = 1;
  currentPageIncineration = 1;
  itemsPerPage = 10;

  // Loading state
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private location: Location
  ) {}
  goBack(): void {
    this.location.back();
  }
  
  ngOnInit(): void {
    this.merchantId = localStorage.getItem('merchantId') || '';
    this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
    this.selectedMachineId = this.machineId;
    
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // Includes today (7 total)
    
    this.startDate = this.formatDateForAPI(sevenDaysAgo);
    this.endDate = this.formatDateForAPI(today);
    
    // Fetch list of machine IDs for the dropdown
    this.loadMachineIdsFromUserDetails();
  }

  loadMachineIdsFromUserDetails(): void {
    const userDetails = this.commonDataService.userDetails;
  
    if (userDetails && Array.isArray(userDetails.machineId)) {
      this.machineIds = [...userDetails.machineId];
      console.log('✅ Loaded machine IDs from userDetails:', this.machineIds);
  
      // If we have a machineId from URL, make sure it's selected in dropdown
      if (this.machineId) {
        this.selectedMachineId = this.machineId;
      }
      // If no machineId from URL but we have machines available, select the first one
      else if (this.machineIds.length > 0) {
        this.selectedMachineId = this.machineIds[0];
        this.machineId = this.selectedMachineId;
        // Update URL to reflect the auto-selected machine WITHOUT navigation
        history.replaceState({}, '', `/machinereport/${this.machineId}`);
      }
      
      // Fetch data for the selected machine after setting it
      if (this.selectedMachineId && this.merchantId) {
        this.fetchTransactions();
      }
    } else {
      console.error('❌ machineId is missing or invalid in userDetails:', userDetails);
    }
  }

  onMachineChange(): void {
    console.log('Machine changed to:', this.selectedMachineId);
    
    // Don't do anything if the machine ID is the same as current
    if (this.machineId === this.selectedMachineId) {
      console.log('Same machine selected, skipping update');
      return;
    }
    
    // Update the local machineId
    this.machineId = this.selectedMachineId;
    
    // Reset pagination when changing machine
    this.currentPageVending = 1;
    this.currentPageIncineration = 1;
    
    // Important: First fetch transactions for the selected machine
    this.fetchTransactions();
    
    // Just update browser URL without triggering full navigation
    history.replaceState({}, '', `/machinereport/${this.machineId}`);
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fetchTransactions(): void {
    if (!this.machineId || !this.merchantId) {
      console.error('Missing machine ID or merchant ID');
      return;
    }
  
    console.log('Fetching transactions for machine:', this.machineId);
    
    // Show loading state
    this.isLoading = true;
    
    // Get vending transactions
    this.dataService.getMachineTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
      next: (res) => {
        console.log('Vending transactions received:', res);
        this.vendingTransactions = res.data || [];
      },
      error: (err) => {
        console.error('Vending Error:', err);
        // Just handle the error, don't redirect
        this.vendingTransactions = [];
        
        // Log specific error info for debugging
        if (err.status) {
          console.error(`HTTP Status: ${err.status}, Error: ${err.message}`);
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  
    // Get incineration transactions
    this.dataService.getIncInerationTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
      next: (res) => {
        console.log('Incineration transactions received:', res);
        this.incinerationTransactions = res.data || [];
      },
      error: (err) => {
        console.error('Incineration Error:', err);
        // Just handle the error, don't redirect
        this.incinerationTransactions = [];
        
        // Log specific error info for debugging
        if (err.status) {
          console.error(`HTTP Status: ${err.status}, Error: ${err.message}`);
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Add the missing date change methods
  onStartDateChange(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
  
    // Ensure end date is not earlier than start date
    if (start > end) {
      this.endDate = this.startDate;
    }
  
    // Restrict max range to 1 year
    const oneYearLater = new Date(start);
    oneYearLater.setFullYear(start.getFullYear() + 1);
  
    if (end > oneYearLater) {
      this.endDate = this.formatDateForAPI(oneYearLater);
    }
  
    this.fetchTransactions();
  }
  
  onEndDateChange(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
  
    // Ensure start date is not later than end date
    if (end < start) {
      this.startDate = this.endDate;
    }
  
    // Restrict range to 1 year
    const oneYearAgo = new Date(end);
    oneYearAgo.setFullYear(end.getFullYear() - 1);
  
    if (start < oneYearAgo) {
      this.startDate = this.formatDateForAPI(oneYearAgo);
    }
  
    this.fetchTransactions();
  }

  // Keep all your existing methods
  getPagedData(data: any[], page: number): any[] {
    const start = (page - 1) * this.itemsPerPage;
    return data.slice(start, start + this.itemsPerPage);
  }

  get totalPagesVending(): number {
    return Math.ceil(this.vendingTransactions.length / this.itemsPerPage);
  }

  get totalPagesIncineration(): number {
    return Math.ceil(this.incinerationTransactions.length / this.itemsPerPage);
  }

  getFormattedDate(dateTime: string): string {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  getFormattedTime(dateTime: string): string {
    const date = new Date(dateTime);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }
  
  getHeaterStatus(status: number): string {
    return status === 1 ? 'ON' : 'OFF';
  }
  
  getBurningMode(mode: number): string {
    switch (mode) {
      case 2: return 'AUTOMATIC';
      case 1: return 'MANUAL';
      case 3: return 'SCHEDULED';
      default: return '—';
    }
  }
  
  getBurningStatus(status: number): string {
    switch (status) {
      case 1: return 'IDLE';
      case 2: return 'BURNING';
      case 3: return 'COMPLETED';
      case 4: return 'TIME OUT';
      case 5: return 'POWER OFF TIME OUT';
      default: return '—';
    }
  }
  
  setTab(tab: 'vending' | 'incineration') {
    this.activeTab = tab;
  }
  
  incrementVendingPage(): void {
    if (this.currentPageVending < this.totalPagesVending) {
      this.currentPageVending++;
    }
  }
  
  decrementVendingPage(): void {
    if (this.currentPageVending > 1) {
      this.currentPageVending--;
    }
  }
  
  incrementIncinerationPage(): void {
    if (this.currentPageIncineration < this.totalPagesIncineration) {
      this.currentPageIncineration++;
    }
  }
  
  decrementIncinerationPage(): void {
    if (this.currentPageIncineration > 1) {
      this.currentPageIncineration--;
    }
  }
}