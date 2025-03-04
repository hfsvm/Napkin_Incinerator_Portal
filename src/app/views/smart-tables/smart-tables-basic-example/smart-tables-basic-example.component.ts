// import { Component } from '@angular/core';

// import usersData from '../_data';

// @Component({
//   selector: 'app-smart-tables-basic-example',
//   templateUrl: './smart-tables-basic-example.component.html',
//   styleUrls: ['./smart-tables-basic-example.component.scss']
// })
// export class SmartTablesBasicExampleComponent {

//   usersData = usersData;

//   columns = [
//     {
//       key: 'name',
//       _style: { width: '40%' }
//     },
//     'registered',
//     { key: 'role', _style: { width: '20%' } },
//     { key: 'status', _style: { width: '15%' } },
//     {
//       key: 'show',
//       label: '',
//       _style: { width: '5%' },
//       filter: false,
//       sorter: false
//     }
//   ];

//   getBadge(status: string) {
//     switch (status) {
//       case 'Active':
//         return 'success';
//       case 'Inactive':
//         return 'secondary';
//       case 'Pending':
//         return 'warning';
//       case 'Banned':
//         return 'danger';
//       default:
//         return 'primary';
//     }
//   }

//   details_visible = Object.create({});

//   toggleDetails(item: any) {
//     this.details_visible[item] = !this.details_visible[item];
//   }
// }

// import { Component } from '@angular/core';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// @Component({
//   selector: 'app-smart-tables-basic-example',
//   templateUrl: './smart-tables-basic-example.component.html',
//   styleUrls: ['./smart-tables-basic-example.component.scss']
// })
// export class SmartTablesBasicExampleComponent {
//   isLoading = false;

//   // Dummy Data for Filters
//   zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6'];
//   wards = ['A', 'D', 'E', 'F', 'N', 'G', 'H', 'W'];
//   beats = ['100', '101', '123', '125', '127', '128', '133'];
//   machines = ['AX225B015', 'AX226B005', 'AX226B006', 'AX226B009'];

//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];
//   selectedMachines: string[] = [];
//   startDate: string = new Date().toISOString().split('T')[0];
//   endDate: string = new Date().toISOString().split('T')[0];

//   dropdownOpen: Record<'zone' | 'ward' | 'beat' | 'machine', boolean> = {
//     zone: false,
//     ward: false,
//     beat: false,
//     machine: false
//   };
//   reportsData = [
//     { machineId: 'KE079B089', machineLocation: 'Community Toilet', address: 'Andheri East', machineType: 'Community Toilet', vending: 0, incinerator: 0, date: '2025-02-21', cash: '₹ 0' },
//     { machineId: 'PS050B038', machineLocation: 'Community Toilet', address: 'Goregaon West', machineType: 'Community Toilet', vending: 0, incinerator: 0, date: '2025-02-21', cash: '₹ 0' },
//     { machineId: 'KE083B114', machineLocation: 'Community Toilet', address: 'Vile Parle', machineType: 'Community Toilet', vending: 0, incinerator: 0, date: '2025-02-21', cash: '₹ 0' }
//   ];

//   filteredData = this.reportsData;
//   toggleDropdown(filter: keyof typeof this.dropdownOpen) {
//     this.dropdownOpen[filter] = !this.dropdownOpen[filter];
//   }

//   toggleSelection(value: string, list: string[]) {
//     const index = list.indexOf(value);
//     if (index > -1) {
//       list.splice(index, 1);
//     } else {
//       list.push(value);
//     }
//   }

//   loadReport() {
//     this.isLoading = true;
//     setTimeout(() => {
//       this.filteredData = this.reportsData.filter(item =>
//         (this.selectedZones.length === 0 || this.selectedZones.includes(item.machineLocation)) &&
//         (this.selectedWards.length === 0 || this.selectedWards.includes(item.address)) &&
//         (this.selectedBeats.length === 0 || this.selectedBeats.includes(item.machineId)) &&
//         (this.selectedMachines.length === 0 || this.selectedMachines.includes(item.machineId))
//       );
//       this.isLoading = false;
//     }, 2000);
//   }

//   exportToExcel() {
//     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredData);
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Report');
//     const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
//     saveAs(data, 'Report.xlsx');
//   }
// }
// above is template table
// below is working component
// commented cz using

// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { DataService } from '../../../service/data.service';

// interface Transaction {
//   date: string;
//   qty: number;
//   cash: string;
//   onTime: string;
//   burnCycles: number;
//   sanNapkinsBurnt: number;
// }

// interface ReportItem {
//   srNo: number;
//   machineId: string;
//   machineLocation: string;
//   address: string;
//   transactions: Transaction[];
// }

// @Component({
//   selector: 'app-smart-tables-basic-example',
//   templateUrl: './smart-tables-basic-example.component.html',
//   styleUrls: ['./smart-tables-basic-example.component.scss']
// })
// export class SmartTablesBasicExampleComponent implements OnInit {
//   isLoading = false;
//   summaryType: 'Daily' | 'Totals' = 'Daily';  // Default to 'Daily'
//   errorMessage: string = '';

//   // Dropdown arrays for filters
//   zones: string[] = [];
//   wards: string[] = [];
//   beats: string[] = [];
//   machineIds: string[] = [''];  // Default Machine ID
//   selectedMachineId: string = '';

//   // Selected filter values (for checklists)
//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];

//   // Date range filters
//   startDate: string = '';
//   endDate: string = '';

//   // For dropdown toggling
//   dropdownOpen: Record<string, boolean> = { zone: false, ward: false, beat: false };

//   // Report data arrays
//   reportsData: ReportItem[] = [];
//   filteredData: ReportItem[] = [];

//   constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

//   ngOnInit() {
//     this.setDefaultDates();
//     this.loadReport(); // Initial API call with default filters
//   }

//   // Set default dates (current date and 1-year span)
//   setDefaultDates() {
//     const today = new Date();
//     const lastYear = new Date();
//     lastYear.setFullYear(today.getFullYear() - 1);
//     this.startDate = this.formatDate(lastYear);
//     this.endDate = this.formatDate(today);
//   }

//   // Format the date to "dd-MM-yyyy"
//   formatDate(date: Date): string {
//     return date.toLocaleDateString('en-GB').split('/').reverse().join('-');
//   }

//   // Load report data from API using current filter selections
//   loadReport() {
//     this.isLoading = true;
//     this.errorMessage = '';
  
//     this.dataService.getMachineAndIncineratorTransaction(
//       this.startDate,
//       this.endDate,
//       'ABC1234567', // Example merchantId
//       this.selectedMachineId,  // ✅ Pass selected machines
//       this.selectedZones.length ? this.selectedZones.join(',') : '',
//       this.selectedWards.length ? this.selectedWards.join(',') : '',
//       this.selectedBeats.length ? this.selectedBeats.join(',') : ''
//     ).subscribe(
//       (response: any) => {
//         if (response.status === 200 && response.data.machineDetails.length > 0) {
//           // ✅ Populate Zones, Wards, Beats dynamically
//           this.zones = response.data.level1 ? [response.data.level1] : [];
//           this.wards = response.data.level2 ? [response.data.level2] : [];
//           this.beats = response.data.level3 ? [response.data.level3] : [];
//           this.selectedZones = [...this.zones];
//           this.selectedWards = [...this.wards];
//           this.selectedBeats = [...this.beats];
  
//           // ✅ Process Report Data
//           this.reportsData = response.data.machineDetails.map((machine: any, index: number) => ({
//             srNo: index + 1,
//             machineId: machine.machineId,
//             machineLocation: machine.machineLocation || `${machine.level1} / ${machine.level2} / ${machine.level3}`,
//             address: machine.address || `${machine.level1}, ${machine.level2}, ${machine.level3}`,
//             machineType: machine.machineType || 'Unknown',
//             transactions: machine.vending.map((txn: any) => ({
//               date: txn.date,
//               qty: txn.quantity,
//               cash: `₹ ${txn.cashCollected}`,
//               onTime: machine.incinerator[0]?.onTime || '0m',
//               burnCycles: machine.incinerator[0]?.burnCycles || 0,
//               sanNapkinsBurnt: machine.incinerator[0]?.sanitaryNapkinsBurnt || 0
//             }))
//           }));
  
//           this.filteredData = [...this.reportsData];
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
//   }
  
//   // Toggle summary type between Daily and Totals
//   toggleSummaryType() {
//     this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';
//     this.filteredData = this.reportsData.map(machine => ({
//       ...machine,
//       transactions: this.summaryType === 'Daily' ? machine.transactions : [{
//         date: 'Total',
//         qty: machine.transactions.reduce((sum, txn) => sum + txn.qty, 0),
//         cash: `₹ ${machine.transactions.reduce((sum, txn) => sum + parseFloat(txn.cash.replace('₹', '')), 0).toFixed(2)}`,
//         onTime: '0m',
//         burnCycles: machine.transactions.reduce((sum, txn) => sum + txn.burnCycles, 0),
//         sanNapkinsBurnt: machine.transactions.reduce((sum, txn) => sum + txn.sanNapkinsBurnt, 0)
//       }]
//     }));
//   }
  

//   // --- Filter Methods (these update internal state only; no API call) ---
//   selectAllZones() {
//     this.selectedZones = [...this.zones];
//     this.selectedWards = [];
//     this.selectedBeats = [];
//   }
  
//   unselectAllZones() {
//     this.selectedZones = [];
//     this.selectedWards = [];
//     this.selectedBeats = [];
//   }
  
//   selectAllWards() {
//     this.selectedWards = [...this.wards];
//     this.selectedBeats = [];
//   }
  
//   unselectAllWards() {
//     this.selectedWards = [];
//     this.selectedBeats = [];
//   }
  
//   selectAllBeats() {
//     this.selectedBeats = [...this.beats];
//   }
  
//   unselectAllBeats() {
//     this.selectedBeats = [];
//   }
  
//   toggleDropdown(filter: 'zone' | 'ward' | 'beat') {
//     this.dropdownOpen[filter] = !this.dropdownOpen[filter];
//   }

//   clearSelection(filter: 'zone' | 'ward' | 'beat') {
//     if (filter === 'zone') {
//       this.selectedZones = [];
//       this.selectedWards = [];
//       this.selectedBeats = [];
//     } else if (filter === 'ward') {
//       this.selectedWards = [];
//       this.selectedBeats = [];
//     } else if (filter === 'beat') {
//       this.selectedBeats = [];
//     }
//   }

//   onZoneChange(zone: string, event: any) {
//     if (event.target.checked) {
//       if (!this.selectedZones.includes(zone)) {
//         this.selectedZones.push(zone);
//       }
//     } else {
//       this.selectedZones = this.selectedZones.filter(z => z !== zone);
//       // Clear dependent filters
//       this.selectedWards = [];
//       this.selectedBeats = [];
//     }
//   }

//   onWardChange(ward: string, event: any) {
//     if (event.target.checked) {
//       if (!this.selectedWards.includes(ward)) {
//         this.selectedWards.push(ward);
//       }
//     } else {
//       this.selectedWards = this.selectedWards.filter(w => w !== ward);
//       // Clear dependent beats
//       this.selectedBeats = [];
//     }
//   }

//   onBeatChange(beat: string, event: any) {
//     if (event.target.checked) {
//       if (!this.selectedBeats.includes(beat)) {
//         this.selectedBeats.push(beat);
//       }
//     } else {
//       this.selectedBeats = this.selectedBeats.filter(b => b !== beat);
//     }
//   }

//   onMachineChange(machineId: string) {
//     this.selectedMachineId = machineId;
//   }

//   // --- Totals Calculation Methods ---

//   getTotalQty() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + txn.qty, 0), 0);
//   }

//   getTotalCash() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + parseFloat(txn.cash.replace('₹', '').replace(',', '')), 0), 0).toFixed(2);
//   }

//   getTotalBurnCycles() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + txn.burnCycles, 0), 0);
//   }

//   getTotalSanNapkinsBurnt() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + txn.sanNapkinsBurnt, 0), 0);
//   }

//   // applyFilters() is left empty so that changes in filters update state only.
//   applyFilters() {
//     // Do nothing here; the API call is triggered only by clicking "Load Report".
//   }

//   resetFilters() {
//     this.selectedZones = [...this.zones];
//     this.selectedWards = [...this.wards];
//     this.selectedBeats = [...this.beats];
//     this.selectedMachineId = '';
//     this.loadReport();
//   }
// }
//above before worked below testing with dummy

// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { DataService } from '../../../service/data.service';
// import { CommonDataService } from '../../../Common/common-data.service';

// interface Transaction {
//   date: string;
//   qty: number;
//   cash: string;
//   onTime: string;
//   burnCycles: number;
//   sanNapkinsBurnt: number;
// }

// interface ReportItem {
//   srNo: number;
//   machineId: string;
//   machineLocation: string;
//   address: string;
//   transactions: Transaction[];
// }

// @Component({
//   selector: 'app-smart-tables-basic-example',
//   templateUrl: './smart-tables-basic-example.component.html',
//   styleUrls: ['./smart-tables-basic-example.component.scss']
// })
// export class SmartTablesBasicExampleComponent implements OnInit {
//   isLoading = false;
//   summaryType: 'Daily' | 'Totals' = 'Daily';
//   errorMessage: string = '';

//   zones: string[] = [];
//   wards: string[] = [];
//   beats: string[] = [];

//   merchantId: string = ''; // ✅ Dynamic from login session
//   machineIds: string[] = ['MACH01', 'HFBM01', 'GSM001', 'GSM002', 'NASC00']; // ✅ Dummy machines for dropdown
//   selectedMachineId: string = this.machineIds[0]; // ✅ Default selected machine

//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];

//   startDate: string = '';
//   endDate: string = '';

//   dropdownOpen: Record<string, boolean> = { zone: false, ward: false, beat: false };
//   reportsData: ReportItem[] = [];
//   filteredData: ReportItem[] = [];

//   constructor(
//     private dataService: DataService,
//     private commonDataService: CommonDataService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.merchantId = this.commonDataService.merchantId ?? ''; // ✅ Get merchant ID from login session
//     this.setDefaultDates();
//     this.loadReport();
//   }

//   setDefaultDates() {
//     const today = new Date();
//     const lastYear = new Date();
//     lastYear.setFullYear(today.getFullYear() - 1);
//     this.startDate = this.formatDate(lastYear);
//     this.endDate = this.formatDate(today);
//   }

//   formatDate(date: Date): string {
//     return date.toISOString().split('T')[0];
//   }

//   loadReport() {
//     this.isLoading = true;
//     this.errorMessage = '';

//     this.dataService.getMachineAndIncineratorTransaction(
//       this.startDate,
//       this.endDate,
//       this.merchantId,
//       this.selectedMachineId, // ✅ Pass selected machine ID
//       this.selectedZones.join(','),
//       this.selectedWards.join(','),
//       this.selectedBeats.join(',')
//     ).subscribe(
//       (response: any) => {
//         if (response.status === 200 && response.data.machineDetails.length > 0) {
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
//   }

//   processResponseData(machineDetails: any[]) {
//     this.reportsData = machineDetails.map((machine, index) => ({
//       srNo: index + 1,
//       machineId: machine.machineId,
//       machineLocation: machine.machineLocation || `${machine.level1} / ${machine.level2} / ${machine.level3}`,
//       address: machine.address || `${machine.level1}, ${machine.level2}, ${machine.level3}`,
//       transactions: machine.vending.map((txn: any) => ({
//         date: txn.date,
//         qty: txn.quantity,
//         cash: `₹ ${txn.cashCollected}`,
//         onTime: machine.incinerator[0]?.onTime || '0m',
//         burnCycles: machine.incinerator[0]?.burnCycles || 0,
//         sanNapkinsBurnt: machine.incinerator[0]?.sanitaryNapkinsBurnt || 0
//       }))
//     }));

//     this.filteredData = [...this.reportsData];
//   }

//   toggleSummaryType() {
//     this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';
//     this.filteredData = this.reportsData.map(machine => ({
//       ...machine,
//       transactions: this.summaryType === 'Daily' ? machine.transactions : [{
//         date: 'Total',
//         qty: machine.transactions.reduce((sum, txn) => sum + txn.qty, 0),
//         cash: `₹ ${machine.transactions.reduce((sum, txn) => sum + parseFloat(txn.cash.replace('₹', '')), 0).toFixed(2)}`,
//         onTime: '0m',
//         burnCycles: machine.transactions.reduce((sum, txn) => sum + txn.burnCycles, 0),
//         sanNapkinsBurnt: machine.transactions.reduce((sum, txn) => sum + txn.sanNapkinsBurnt, 0)
//       }]
//     }));
//   }

//   // ✅ Select all zones
// selectAllZones() {
//   this.selectedZones = [...this.zones];
//   this.selectedWards = [];
//   this.selectedBeats = [];
// }

// // ✅ Clear zones (and reset wards & beats)
// clearSelection(type: 'zone' | 'ward' | 'beat') {
//   if (type === 'zone') {
//     this.selectedZones = [];
//     this.selectedWards = [];
//     this.selectedBeats = [];
//   } else if (type === 'ward') {
//     this.selectedWards = [];
//     this.selectedBeats = [];
//   } else if (type === 'beat') {
//     this.selectedBeats = [];
//   }
// }

// // ✅ Select all wards
// selectAllWards() {
//   this.selectedWards = [...this.wards];
//   this.selectedBeats = [];
// }

// // ✅ Select all beats
// selectAllBeats() {
//   this.selectedBeats = [...this.beats];
// }

//   // --- Machine Selection Logic ---
//   onMachineChange(machineId: string) {
//     this.selectedMachineId = machineId;
//   }

//   // --- Filters Logic ---
//   toggleDropdown(filter: 'zone' | 'ward' | 'beat') {
//     this.dropdownOpen[filter] = !this.dropdownOpen[filter];
//   }

//   getTotalQty() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + txn.qty, 0), 0);
//   }

//   getTotalCash() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + parseFloat(txn.cash.replace('₹', '').replace(',', '')), 0), 0).toFixed(2);
//   }

//   getTotalBurnCycles() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + txn.burnCycles, 0), 0);
//   }

//   getTotalSanNapkinsBurnt() {
//     return this.filteredData.reduce((total, item) => total + item.transactions.reduce((sum, txn) => sum + txn.sanNapkinsBurnt, 0), 0);
//   }
// }

// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { DataService } from '../../../service/data.service';

// interface Transaction {
//   date: string;
//   qty: number;
//   cash: string;
//   onTime: string;
//   burnCycles: number;
//   sanNapkinsBurnt: number;
// }

// interface ReportItem {
//   srNo: number;
//   machineId: string;
//   machineLocation: string;
//   address: string;
//   machineType: string;
//   transactions: Transaction[];
// }
// interface Machine {
//   machineId: string;
//   machineLocation: string;
//   address: string;
//   machineType: string;
//   vending: any[];  // Adjust based on actual structure
//   incinerator: any[];
// }


// @Component({
//   selector: 'app-smart-tables-basic-example',
//   templateUrl: './smart-tables-basic-example.component.html',
//   styleUrls: ['./smart-tables-basic-example.component.scss']
// })
// export class SmartTablesBasicExampleComponent implements OnInit {
//   isLoading = false;
//   summaryType: 'Daily' | 'Totals' = 'Daily';
//   errorMessage: string = '';
  
//   zones: string[] = [];
//   wards: string[] = [];
//   beats: string[] = [];
//   selectedMachineIds: string[] = [];
//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];
  
//   startDate: string = '';
//   endDate: string = '';
  
//   dropdownOpen: Record<string, boolean> = { zone: false, ward: false, beat: false };
//   reportsData: ReportItem[] = [];
//   filteredData: ReportItem[] = [];
  
//   merchantId: string = 'ABC1234567'; // Get this from login session
//   machineId: string = 'MACH07,MACH06'; // Set default machine IDs

//   constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

//   ngOnInit() {
//     this.setDefaultDates();
//     this.loadReport();
//   }

//   setDefaultDates() {
//     const today = new Date();
//     const lastYear = new Date();
//     lastYear.setFullYear(today.getFullYear() - 1);
//     this.startDate = this.formatDate(lastYear);
//     this.endDate = this.formatDate(today);
//   }

//   formatDate(date: Date): string {
//     return date.toISOString().slice(0, 19).replace('T', ' ');
//   }

//   loadReport() {
//     this.isLoading = true;
//     this.errorMessage = '';

//     this.dataService.getMachineAndIncineratorTransaction(
//       this.startDate,
//       this.endDate,
//       this.merchantId,
//       this.selectedMachineIds.length ? this.selectedMachineIds.join(',') : this.machineId,
//       this.selectedZones.length ? this.selectedZones.join(',') : '',
//       this.selectedWards.length ? this.selectedWards.join(',') : '',
//       this.selectedBeats.length ? this.selectedBeats.join(',') : ''
//     ).subscribe(
//       (response: any) => {
//         if (response.status === 200 && response.data.machineDetails.length > 0) {
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
//   }

//   processResponseData(machineDetails: any[]) {
//     this.reportsData = machineDetails.map((machine, index) => ({
//       srNo: index + 1,
//       machineId: machine.machineId,
//       machineLocation: machine.machineLocation || `${machine.level1} / ${machine.level2} / ${machine.level3}`,
//       address: machine.address || `${machine.level1}, ${machine.level2}, ${machine.level3}`,
//       machineType: machine.machineType || 'Unknown',
//       transactions: machine.vending.map((txn: any) => ({
//         date: txn.date,
//         qty: txn.quantity,
//         cash: `₹ ${txn.cashCollected}`,
//         onTime: machine.incinerator[0]?.onTime || '0m',
//         burnCycles: machine.incinerator[0]?.burnCycles || 0,
//         sanNapkinsBurnt: machine.incinerator[0]?.sanitaryNapkinsBurnt || 0
//       }))
//     }));

//     this.filteredData = [...this.reportsData];
//   }

//   toggleSummaryType() {
//     this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';
//     this.filteredData = this.reportsData.map(machine => ({
//       ...machine,
//       transactions: this.summaryType === 'Daily' ? machine.transactions : [{
//         date: 'Total',
//         qty: machine.transactions.reduce((sum, txn) => sum + txn.qty, 0),
//         cash: `₹ ${machine.transactions.reduce((sum, txn) => sum + parseFloat(txn.cash.replace('₹', '')), 0).toFixed(2)}`,
//         onTime: '0m',
//         burnCycles: machine.transactions.reduce((sum, txn) => sum + txn.burnCycles, 0),
//         sanNapkinsBurnt: machine.transactions.reduce((sum, txn) => sum + txn.sanNapkinsBurnt, 0)
//       }]
//     }));
//   }
// }

///working but changed because alignments uncomment respnse then it will work
// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { DataService } from '../../../service/data.service';
// import { CommonDataService } from '../../../Common/common-data.service';

// interface Transaction {
//   date: string;
//   qty: number;
//   cash: string;
//   onTime: string;
//   burnCycles: number;
//   sanNapkinsBurnt: number;
// }

// interface ReportItem {
//   machineType: string;
//   srNo: number;
//   machineId: string;
//   machineLocation: string;
//   address: string;
//   transactions: Transaction[];
// }

// @Component({
//   selector: 'app-smart-tables-basic-example',
//   templateUrl: './smart-tables-basic-example.component.html',
//   styleUrls: ['./smart-tables-basic-example.component.scss']
// })
// export class SmartTablesBasicExampleComponent implements OnInit {
//   isLoading = false;
//   summaryType: 'Daily' | 'Totals' = 'Daily';
//   errorMessage: string = '';

//   zones: string[] = [];
//   wards: string[] = [];
//   beats: string[] = [];

//   merchantId: string = ''; 
//   machineIds: string[] = ['GSM001', 'GSM002'];
//   selectedMachineIds: string[] = [...this.machineIds];  // ✅ Default: Select all

//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];

//   startDate: string = '';
//   endDate: string = '';

//   dropdownOpen: Record<string, boolean> = { zone: false, ward: false, beat: false, machine: false };
//   reportsData: ReportItem[] = [];
//   filteredData: ReportItem[] = [];

//   constructor(
//     private dataService: DataService,
//     private commonDataService: CommonDataService,
//     private cdr: ChangeDetectorRef
//   ) {}
//   ngOnInit() {
//     this.merchantId = this.commonDataService.merchantId ?? '';
//     this.setDefaultDates();
//     this.loadReport();  // ✅ Load data on page load
//   }

//   setDefaultDates() {
//     const today = new Date();
//     const lastWeek = new Date();
//     lastWeek.setDate(today.getDate() - 7); // ✅ Last 7 days by default
  
//     this.startDate = this.formatDate(lastWeek);
//     this.endDate = this.formatDate(today);
//   }

//   formatDate(date: Date): string {
//     return date.toISOString().split('T')[0];
//   }

//   loadReport() {
//     this.isLoading = true;
//     this.errorMessage = '';

//     // ✅ Pass selected machines (default: all)
//     const selectedMachines = this.selectedMachineIds.length > 0 ? this.selectedMachineIds : this.machineIds;

//     this.dataService.getMachineAndIncineratorTransaction(
//       this.startDate,  
//       this.endDate,    
//       this.merchantId,
//       selectedMachines,  
//       this.selectedZones,
//       this.selectedWards,
//       this.selectedBeats
//     ).subscribe(
//       (response: any) => {
//         if (response.status === 200 && response.data.machineDetails.length > 0) {
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
//   }

// //  processResponseData(machineDetails: any[]) {
// //   this.reportsData = machineDetails.map((machine, index) => {
// //     const vendingTransactions = machine.vending.map((txn: any) => ({
// //       date: txn.date,
// //       qty: txn.quantity,
// //       cash: `₹ ${txn.cashCollected}`,
// //       onTime: null,
// //       burnCycles: null,
// //       sanNapkinsBurnt: null
// //     }));

// //     const incineratorTransactions = machine.incinerator.map((inc: any) => ({
// //       date: inc.onTime,
// //       qty: null,  
// //       cash: null,  
// //       onTime: inc.onTime || '0m',
// //       burnCycles: inc.burnCycles || 0,
// //       sanNapkinsBurnt: inc.sanitaryNapkinsBurnt || 0
// //     }));

// //     // ✅ Define Explicit Types in `reduce()` to Fix Errors
// //     const totalRow = {
// //       date: 'Total',
// //       qty: vendingTransactions.reduce((sum: number, txn: { qty: number }) => sum + (txn.qty || 0), 0),
// //       cash: `₹ ${vendingTransactions.reduce((sum: number, txn: { cash: string }) => 
// //         sum + parseFloat(txn.cash.replace('₹', '')), 0).toFixed(2)}`,
// //       onTime: '0m / day',
// //       burnCycles: incineratorTransactions.reduce((sum: number, txn: { burnCycles: number }) => 
// //         sum + (txn.burnCycles || 0), 0),
// //       sanNapkinsBurnt: incineratorTransactions.reduce((sum: number, txn: { sanNapkinsBurnt: number }) => 
// //         sum + (txn.sanNapkinsBurnt || 0), 0)
// //     };

// //     return {
// //       srNo: index + 1,
// //       machineId: machine.machineId,
// //       machineLocation: machine.machineLocation?.trim() ? machine.machineLocation : machine.address,
// //       address: machine.address || `${machine.level1 || ''}, ${machine.level2 || ''}, ${machine.level3 || ''}`.trim(),
// //       machineType: machine.machineType || 'N/A',
// //       transactions: [...vendingTransactions, ...incineratorTransactions, totalRow]
// //     };
// //   });

// //   this.filteredData = this.reportsData.length > 0 ? [...this.reportsData] : [];
// //   if (this.filteredData.length === 0) {
// //     this.errorMessage = "No data available for the selected filters.";
// //   }
// // }

// processResponseData(machineDetails: any[]) {
//   this.reportsData = machineDetails.map((machine, index) => {
//     const vendingTransactions = machine.vending?.map((txn: any) => ({
//       date: txn.date || '-',
//       qty: txn.quantity ?? '',
//       cash: txn.cashCollected !== undefined ? `₹ ${txn.cashCollected}` : '',
//       onTime: '',
//       burnCycles: '',
//       sanNapkinsBurnt: ''
//     })) || [];  // ✅ Default to empty array if vending is missing

//     const incineratorTransactions = machine.incinerator?.map((inc: any) => ({
//       date: inc.onTime || '-',
//       qty: '',
//       cash: '',
//       onTime: inc.onTime ?? '',
//       burnCycles: inc.burnCycles ?? '',
//       sanNapkinsBurnt: inc.sanitaryNapkinsBurnt ?? ''
//     })) || [];  // ✅ Default to empty array if incinerator is missing

//     // ✅ No `.reduce()` errors! If empty, it shows `''`
//     const totalRow = {
//       date: 'Total',
//       qty: vendingTransactions.length ? vendingTransactions.reduce((sum: number, txn) => sum + (txn.qty || 0), 0) : '',
//       cash: vendingTransactions.length ? `₹ ${vendingTransactions.reduce((sum: number, txn) => sum + parseFloat(txn.cash.replace('₹', '') || '0'), 0).toFixed(2)}` : '',
//       onTime: incineratorTransactions.length ? `${incineratorTransactions.reduce((sum: number, txn) => sum + (parseFloat(txn.onTime) || 0), 0)}m` : '',
//       burnCycles: incineratorTransactions.length ? incineratorTransactions.reduce((sum: number, txn) => sum + (txn.burnCycles || 0), 0) : '',
//       sanNapkinsBurnt: incineratorTransactions.length ? incineratorTransactions.reduce((sum: number, txn) => sum + (txn.sanNapkinsBurnt || 0), 0) : ''
//     };

//     return {
//       srNo: index + 1,
//       machineId: machine.machineId,
//       machineLocation: machine.machineLocation?.trim() ? machine.machineLocation : machine.address,
//       address: machine.address || `${machine.level1 || ''}, ${machine.level2 || ''}, ${machine.level3 || ''}`.trim(),
//       machineType: machine.machineType || 'N/A',
//       transactions: [...vendingTransactions, ...incineratorTransactions, totalRow]
//     };
//   });

//   this.filteredData = [...this.reportsData];
//   if (this.filteredData.length === 0) {
//     this.errorMessage = "No data available for the selected filters.";
//   }
// }


//   toggleDropdown(filter: 'zone' | 'ward' | 'beat' | 'machine') {
//     this.dropdownOpen[filter] = !this.dropdownOpen[filter];
//   }

//   onMachineChange(machine: string, event: any) {
//     if (event.target.checked) {
//       this.selectedMachineIds.push(machine);  // ✅ Add to selection
//     } else {
//       this.selectedMachineIds = this.selectedMachineIds.filter(id => id !== machine);  // ✅ Remove from selection
//     }
//   }

//   toggleSummaryType() {
//     this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';
  
//     if (this.summaryType === 'Totals') {
//       this.filteredData = this.reportsData.map(machine => ({
//         srNo: machine.srNo,
//         machineId: machine.machineId,
//         machineLocation: machine.machineLocation,
//         address: machine.address,
//         machineType: machine.machineType || 'N/A',
//         transactions: [{
//           date: 'Total',
//           qty: machine.transactions.reduce((sum: number, txn: any) => sum + (txn.qty || 0), 0),  // ✅ Always a number
//           cash: `₹ ${machine.transactions.reduce((sum: number, txn: any) => sum + parseFloat((txn.cash || '₹ 0').replace('₹', '')), 0).toFixed(2)}`,
//           onTime: machine.transactions.reduce((sum: number, txn: any) => sum + (parseFloat(txn.onTime) || 0), 0) ? 
//                    `${machine.transactions.reduce((sum: number, txn: any) => sum + (parseFloat(txn.onTime) || 0), 0)}m` : '-',
//           burnCycles: machine.transactions.reduce((sum: number, txn: any) => sum + (txn.burnCycles || 0), 0),  // ✅ Always a number
//           sanNapkinsBurnt: machine.transactions.reduce((sum: number, txn: any) => sum + (txn.sanNapkinsBurnt || 0), 0)  // ✅ Always a number
//         }]
//       }));
//     } else {
//       this.filteredData = [...this.reportsData];  // ✅ Revert to Daily View
//     }
//   }
  
  

//   selectAllZones() {
//     this.selectedZones = [...this.zones];
//     this.selectedWards = [];
//     this.selectedBeats = [];
//   }

//   clearSelection(type: 'zone' | 'ward' | 'beat') {
//     if (type === 'zone') {
//       this.selectedZones = [];
//       this.selectedWards = [];
//       this.selectedBeats = [];
//     } else if (type === 'ward') {
//       this.selectedWards = [];
//       this.selectedBeats = [];
//     } else if (type === 'beat') {
//       this.selectedBeats = [];
//     }
//   }

//   selectAllWards() {
//     this.selectedWards = [...this.wards];
//     this.selectedBeats = [];
//     this.loadReport();
//   }

//   selectAllBeats() {
//     this.selectedBeats = [...this.beats];
//     this.loadReport();
//   }

//   getTotalQty(transactions: any[]): number {
//     return transactions.reduce((sum, txn) => sum + (txn.qty || 0), 0);
//   }

//   getTotalCash(transactions: any[]): string {
//     return "₹ " + transactions
//       .reduce((sum, txn) => sum + parseFloat((txn.cash || "0").replace('₹', '')), 0)
//       .toFixed(2);
//   }

//   getTotalBurnCycles(transactions: any[]): number {
//     return transactions.reduce((sum, txn) => sum + (txn.burnCycles || 0), 0);
//   }

//   getTotalSanNapkinsBurnt(transactions: any[]): number {
//     return transactions.reduce((sum, txn) => sum + (txn.sanNapkinsBurnt || 0), 0);
//   }
// }


import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';

interface Transaction {
  date: string;
  qty: number;
  cash: string;
  onTime: string;
  burnCycles: number;
  sanNapkinsBurnt: number;
}

interface ReportItem {
  machineType: string;
  srNo: number;
  machineId: string;
  machineLocation: string;
  address: string;
  transactions: Transaction[];
}

@Component({
  selector: 'app-smart-tables-basic-example',
  templateUrl: './smart-tables-basic-example.component.html',
  styleUrls: ['./smart-tables-basic-example.component.scss']
})
export class SmartTablesBasicExampleComponent implements OnInit {
  isLoading = false;
  summaryType: 'Daily' | 'Totals' = 'Daily';
  errorMessage = '';

  zones: string[] = [];
  wards: string[] = [];
  beats: string[] = [];

  merchantId = ''; 
  machineIds: string[] = ['GSM001', 'GSM002','MACH01','NASC00','HFBM01','MACH07','MACH06'];
  selectedMachineIds: string[] = [...this.machineIds];

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

  constructor(
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.merchantId = this.commonDataService.merchantId ?? '';
    this.setDefaultDates();
    this.loadReport();
  }

  setDefaultDates() {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    this.startDate = this.formatDate(lastWeek);
    this.endDate = this.formatDate(today);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadReport() {
    this.isLoading = true;
    this.errorMessage = '';

    const selectedMachines = this.selectedMachineIds.length > 0 ? this.selectedMachineIds : this.machineIds;

    this.dataService.getMachineAndIncineratorTransaction(
      this.startDate,  
      this.endDate,    
      this.merchantId,
      selectedMachines,  
      this.selectedZones,
      this.selectedWards,
      this.selectedBeats
    ).subscribe(
      (response: any) => {
        if (response.status === 200 && response.data.machineDetails.length > 0) {
          this.reportGenerated = response.data.reportGenerated;
          this.reportFromPeriod = response.data.reportFromPeriod;
          this.reportToPeriod = response.data.reportToPeriod;
          this.processResponseData(response.data.machineDetails);
        } else {
          this.filteredData = [];
          this.errorMessage = "No data available for the selected filters.";
        }
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = "Error fetching data. Please try again.";
        this.isLoading = false;
      }
    );
  }
  processResponseData(machineDetails: any[]) {
    let grandTotalQty = 0;
    let grandTotalCash = 0;
    let grandTotalBurnCycles = 0;
    let grandTotalSanNapkins = 0;
    
    let globalIndex = 0; // ✅ Global Counter for SR. NO.
  
    this.reportsData = machineDetails.map((machine, index) => {
      const vendingTotal = machine.vending?.find((txn: any) => txn.date?.trim() === 'Total') || {};
      const incineratorTotal = machine.incinerator?.find((txn: any) => txn.onTime?.trim() === 'Total') || {};
  
      const machineTotalQty = vendingTotal.quantity ?? 0;
      const machineTotalCash = vendingTotal.cashCollected !== undefined ? parseFloat(vendingTotal.cashCollected) : 0;
      const machineTotalBurnCycles = incineratorTotal.burnCycles ?? 0;
      const machineTotalSanNapkins = incineratorTotal.sanitaryNapkinsBurnt ?? 0;
  
      grandTotalQty += machineTotalQty;
      grandTotalCash += machineTotalCash;
      grandTotalBurnCycles += machineTotalBurnCycles;
      grandTotalSanNapkins += machineTotalSanNapkins;
  
      const transactions = [
        ...machine.vending.map((txn: any) => ({
          srNo: ++globalIndex, // ✅ Keep Incrementing
          date: txn.date || '-',
          qty: txn.quantity ?? 0,
          cash: `₹ ${txn.cashCollected !== undefined ? txn.cashCollected.toFixed(2) : '0'}`,
          onTime: '-',
          burnCycles: 0,
          sanNapkinsBurnt: 0                                                                  
        })),
        ...machine.incinerator.map((txn: any) => ({
          srNo: ++globalIndex, // ✅ Keep Incrementing
          date: txn.onTime || '-',
          qty: 0,
          cash: '-',
          onTime: txn.onTime ?? '-',
          burnCycles: txn.burnCycles ?? 0,
          sanNapkinsBurnt: txn.sanitaryNapkinsBurnt ?? 0
        }))
      ];
  
      return {
        srNo: index + 1,
        machineId: machine.machineId,
        machineLocation: machine.machineLocation?.trim() ? machine.machineLocation : machine.address,
        address: machine.address || '',
        machineType: machine.machineType || 'N/A',
        transactions, // ✅ Already Precomputed SR. NO.
        total: {
          date: 'Total',
          quantity: machineTotalQty,
          cashCollected: `₹ ${machineTotalCash.toFixed(2)}`,
          onTime: '-',
          burnCycles: machineTotalBurnCycles,
          sanitaryNapkinsBurnt: machineTotalSanNapkins
        }
      };
    });
  
    this.grandTotal = {
      quantity: grandTotalQty || 0,
      cash: `₹ ${grandTotalCash.toFixed(2)}` || '₹ 0',
      burnCycles: grandTotalBurnCycles || 0,
      sanNapkinsBurnt: grandTotalSanNapkins || 0
    };
  
    this.filteredData = [...this.reportsData];
    this.updatePagination();
  }
  

  toggleDropdown(filter: 'zone' | 'ward' | 'beat' | 'machine') {
    this.dropdownOpen[filter] = !this.dropdownOpen[filter];
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }
  
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
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

  toggleSelection(selectedArray: string[], option: string) {
    const index = selectedArray.indexOf(option);
    index > -1 ? selectedArray.splice(index, 1) : selectedArray.push(option);
  }

  toggleSummaryType() {
    this.summaryType = this.summaryType === 'Daily' ? 'Totals' : 'Daily';
    this.filteredData = this.summaryType === 'Totals'
      ? this.reportsData.map(machine => ({
          ...machine,
          transactions: [{
            date: 'Total',
            qty: machine.transactions.reduce((sum, txn) => sum + txn.qty, 0),
            cash: `₹ ${machine.transactions.reduce((sum, txn) => sum + parseFloat(txn.cash.replace('₹', '')), 0).toFixed(2)}`,
            onTime: '-',
            burnCycles: machine.transactions.reduce((sum, txn) => sum + txn.burnCycles, 0),
            sanNapkinsBurnt: machine.transactions.reduce((sum, txn) => sum + txn.sanNapkinsBurnt, 0)
          }]
        }))
      : [...this.reportsData];
  }
}
