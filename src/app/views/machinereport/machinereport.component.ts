// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { DataService } from '../../service/data.service';
// import { CommonDataService } from '../../Common/common-data.service';
// @Component({
//   selector: 'app-machinereport',
//   templateUrl: './machinereport.component.html',
//   styleUrls: ['././machinereport.component.scss']

  
  
// })
// export class MachinereportComponent implements OnInit {
//   machineId: string = '';
//   merchantId: string = '';
//   transactions: any[] = [];

//   constructor(
//     private route: ActivatedRoute,
//     private dataService: DataService,
//     private commonDataService: CommonDataService
//   ) {}

//   ngOnInit(): void {
//     this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
//     this.merchantId = this.commonDataService.getMerchantId(); // ✅ pulling from storage

//     console.log("📥 Loaded machineId & merchantId:", {
//       machineId: this.machineId,
//       merchantId: this.merchantId
//     });

//     if (this.machineId && this.merchantId) {
//       this.dataService.getMachineTransaction(this.merchantId, this.machineId).subscribe({
//         next: (response) => {
//           console.log('📦 Response:', response);
//           this.transactions = response.data || [];
//         },
//         error: (err) => {
//           console.error('❌ API Error:', err);
//         }
//       });
//     } else {
//       console.warn('⚠️ Missing machineId or merchantId. Cannot fetch transactions.');
//     }
//   }
//   getTotalAmount(): number {
//     return this.transactions.reduce((sum, txn) => sum + txn.txnAmount, 0);
//   }
  
// }


// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { DataService } from '../../service/data.service';
// import { CommonDataService } from '../../Common/common-data.service';

// @Component({
//   selector: 'app-machinereport',
//   templateUrl: './machinereport.component.html',
//   styles: [`
//     .report-container {
//       padding: 20px;
//       font-family: 'Roboto', Arial, sans-serif;
//       color: #333;
//     }
  
//     h2 {
//       font-size: 24px;
//       font-weight: 600;
//       margin-bottom: 20px;
//       color: #222;
//     }
  
//     .table-container {
//       overflow-x: auto;
//       background: #fff;
//       border-radius: 10px;
//       box-shadow: 0 2px 10px rgba(0,0,0,0.08);
//     }
  
//     .report-table {
//       width: 100%;
//       border-collapse: collapse;
//       font-size: 14px;
//       min-width: 1200px;
//     }
  
//     .report-table thead {
//       background-color: #4A90E2;
//       color: white;
//     }
  
//     .report-table th, .report-table td {
//       padding: 12px 16px;
//       border: 1px solid #ddd;
//       text-align: left;
//       vertical-align: middle;
//     }
  
//     .report-table tbody tr:hover {
//       background-color: #f1f7ff;
//     }
  
//     .report-table tbody .alt-row {
//       background-color: #f9f9f9;
//     }
  
//     .pagination {
//       margin-top: 15px;
//       display: flex;
//       justify-content: flex-start;
//       align-items: center;
//       gap: 10px;
//       font-size: 14px;
//     }
  
//     .pagination button {
//       padding: 6px 12px;
//       border: none;
//       background-color: #4A90E2;
//       color: white;
//       border-radius: 4px;
//       cursor: pointer;
//       transition: background 0.3s ease;
//     }
  
//     .pagination button:hover {
//       background-color: #4A90E2;
//     }
  
//     .pagination button:disabled {
//       background-color: #ccc;
//       cursor: not-allowed;
//     }
//       h2 {
//   font-size: 24px;
//   font-weight: 600;
//   margin-bottom: 20px;
//   color: #222;
//   text-align: center; /* ✅ Add this line */
// }

//   `],
  
//   encapsulation: ViewEncapsulation.None
// })
// export class MachinereportComponent implements OnInit {
//   machineId: string = '';
//   merchantId: string = '';
//   transactions: any[] = [];

//   // Pagination
//   currentPage: number = 1;
//   itemsPerPage: number = 10;

//   constructor(
//     private route: ActivatedRoute,
//     private dataService: DataService,
//     private commonDataService: CommonDataService
//   ) {}

//   ngOnInit(): void {
//     this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
//     this.merchantId = localStorage.getItem('merchantId') || '';
//     console.log('Merchantid:', this.merchantId);

//     if (this.machineId && this.merchantId) {
//       this.dataService.getMachineTransaction(this.merchantId, this.machineId).subscribe({
//         next: (response) => {
//           this.transactions = response.data || [];
//         },
//         error: (err) => {
//           console.error('❌ API Error:', err);
//         }
//       });
//     }
//   }

//   getTotalAmount(): number {
//     return this.transactions.reduce((sum, txn) => sum + txn.txnAmount, 0);
//   }

//   get pagedTransactions(): any[] {
//     const start = (this.currentPage - 1) * this.itemsPerPage;
//     return this.transactions.slice(start, start + this.itemsPerPage);
//   }

//   get totalPages(): number {
//     return Math.ceil(this.transactions.length / this.itemsPerPage);
//   }

//   goToPreviousPage(): void {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   goToNextPage(): void {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }
//   getFormattedDate(datetime: string): string {
//     return new Date(datetime).toLocaleDateString();
//   }
  
//   getFormattedTime(datetime: string): string {
//     return new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   }
  
// }

// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { DataService } from '../../service/data.service';
// import { CommonDataService } from '../../Common/common-data.service';
// @Component({
//   selector: 'app-machinereport',
//   templateUrl: './machinereport.component.html',
//   styleUrls: ['././machinereport.component.scss']

  
  
// })
// export class MachinereportComponent implements OnInit {
//   machineId: string = '';
//   merchantId: string = '';
//   transactions: any[] = [];

//   constructor(
//     private route: ActivatedRoute,
//     private dataService: DataService,
//     private commonDataService: CommonDataService
//   ) {}

//   ngOnInit(): void {
//     this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
//     this.merchantId = this.commonDataService.getMerchantId(); // ✅ pulling from storage

//     console.log("📥 Loaded machineId & merchantId:", {
//       machineId: this.machineId,
//       merchantId: this.merchantId
//     });

//     if (this.machineId && this.merchantId) {
//       this.dataService.getMachineTransaction(this.merchantId, this.machineId).subscribe({
//         next: (response) => {
//           console.log('📦 Response:', response);
//           this.transactions = response.data || [];
//         },
//         error: (err) => {
//           console.error('❌ API Error:', err);
//         }
//       });
//     } else {
//       console.warn('⚠️ Missing machineId or merchantId. Cannot fetch transactions.');
//     }
//   }
//   getTotalAmount(): number {
//     return this.transactions.reduce((sum, txn) => sum + txn.txnAmount, 0);
//   }
  
// }


// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { DataService } from '../../service/data.service';
// import { CommonDataService } from '../../Common/common-data.service';

// @Component({
//   selector: 'app-machinereport',
//   templateUrl: './machinereport.component.html',
//   styles: [`
//     .report-container {
//       padding: 20px;
//       font-family: 'Roboto', Arial, sans-serif;
//       color: #333;
//     }
  
//     h2 {
//       font-size: 24px;
//       font-weight: 600;
//       margin-bottom: 20px;
//       color: #222;
//     }
  
//     .table-container {
//       overflow-x: auto;
//       background: #fff;
//       border-radius: 10px;
//       box-shadow: 0 2px 10px rgba(0,0,0,0.08);
//     }
  
//     .report-table {
//       width: 100%;
//       border-collapse: collapse;
//       font-size: 14px;
//       min-width: 1200px;
//     }
  
//     .report-table thead {
//       background-color: #4A90E2;
//       color: white;
//     }
  
//     .report-table th, .report-table td {
//       padding: 12px 16px;
//       border: 1px solid #ddd;
//       text-align: left;
//       vertical-align: middle;
//     }
  
//     .report-table tbody tr:hover {
//       background-color: #f1f7ff;
//     }
  
//     .report-table tbody .alt-row {
//       background-color: #f9f9f9;
//     }
  
//     .pagination {
//       margin-top: 15px;
//       display: flex;
//       justify-content: flex-start;
//       align-items: center;
//       gap: 10px;
//       font-size: 14px;
//     }
  
//     .pagination button {
//       padding: 6px 12px;
//       border: none;
//       background-color: #4A90E2;
//       color: white;
//       border-radius: 4px;
//       cursor: pointer;
//       transition: background 0.3s ease;
//     }
  
//     .pagination button:hover {
//       background-color: #4A90E2;
//     }
  
//     .pagination button:disabled {
//       background-color: #ccc;
//       cursor: not-allowed;
//     }
//       h2 {
//   font-size: 24px;
//   font-weight: 600;
//   margin-bottom: 20px;
//   color: #222;
//   text-align: center; /* ✅ Add this line */
// }

//   `],
  
//   encapsulation: ViewEncapsulation.None
// })
// export class MachinereportComponent implements OnInit {
//   machineId: string = '';
//   merchantId: string = '';
//   transactions: any[] = [];

//   // Pagination
//   currentPage: number = 1;
//   itemsPerPage: number = 10;

//   constructor(
//     private route: ActivatedRoute,
//     private dataService: DataService,
//     private commonDataService: CommonDataService
//   ) {}

//   ngOnInit(): void {
//     this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
//     this.merchantId = localStorage.getItem('merchantId') || '';
//     console.log('Merchantid:', this.merchantId);

//     if (this.machineId && this.merchantId) {
//       this.dataService.getMachineTransaction(this.merchantId, this.machineId).subscribe({
//         next: (response) => {
//           this.transactions = response.data || [];
//         },
//         error: (err) => {
//           console.error('❌ API Error:', err);
//         }
//       });
//     }
//   }

//   getTotalAmount(): number {
//     return this.transactions.reduce((sum, txn) => sum + txn.txnAmount, 0);
//   }

//   get pagedTransactions(): any[] {
//     const start = (this.currentPage - 1) * this.itemsPerPage;
//     return this.transactions.slice(start, start + this.itemsPerPage);
//   }

//   get totalPages(): number {
//     return Math.ceil(this.transactions.length / this.itemsPerPage);
//   }

//   goToPreviousPage(): void {
//     if (this.currentPage > 1) this.currentPage--;
//   }

//   goToNextPage(): void {
//     if (this.currentPage < this.totalPages) this.currentPage++;
//   }
//   getFormattedDate(datetime: string): string {
//     return new Date(datetime).toLocaleDateString();
//   }
  
//   getFormattedTime(datetime: string): string {
//     return new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   }
  
// }


import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private location: Location
  ) {}
  goBack(): void {
    this.location.back();
  }
  
  ngOnInit(): void {
    this.machineId = this.route.snapshot.paramMap.get('machineId') || '';
    this.merchantId = localStorage.getItem('merchantId') || '';
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // Includes today (7 total)
    
    this.startDate = this.formatDateForAPI(sevenDaysAgo);
    this.endDate = this.formatDateForAPI(today);
    
    if (this.machineId && this.merchantId) {
      // Fetch vending
      this.dataService.getMachineTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
        next: (res) => this.vendingTransactions = res.data || [],
        error: (err) => console.error('Vending Error:', err)
      });

      // Fetch incineration
      this.dataService.getIncInerationTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
        next: (res) => this.incinerationTransactions = res.data || [],
        error: (err) => console.error('Incineration Error:', err)
      });
    }
  }
  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Pagination helpers`
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
  fetchTransactions(): void {
    if (this.machineId && this.merchantId) {
      this.dataService.getMachineTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
        next: (res) => this.vendingTransactions = res.data || [],
        error: (err) => console.error('Vending Error:', err)
      });
  
      this.dataService.getIncInerationTransaction(this.merchantId, this.machineId, this.startDate, this.endDate).subscribe({
        next: (res) => this.incinerationTransactions = res.data || [],
        error: (err) => console.error('Incineration Error:', err)
      });
    }
  }
  


  getFormattedDate(dateTime: string): string {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
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
  onStartDateChange() {
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
  
    this.fetchTransactions(); // Optional: re-fetch if needed
  }
  
  onEndDateChange() {
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
  
    this.fetchTransactions(); // Optional: re-fetch if needed
  }
  
}
