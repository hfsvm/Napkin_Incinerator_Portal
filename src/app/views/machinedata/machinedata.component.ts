// import { Component } from '@angular/core';

// interface MachineData {
//   machineName: string;
//   stockStatus: string;
//   machineStatus: string;
//   status: string;
//   imsi: string;
//   rssi: string;
//   collection: number;
//   itemsDispensed: number;
//   itemsBurnt: number;
//   burningCycles: number;
// }

// @Component({
//   selector: 'app-machinedata',
//   templateUrl: './machinedata.component.html',
//   styleUrls: ['./machinedata.component.scss']
// })
// export class MachinedataComponent {
//   // Define the arrays required for dropdown and checkboxes
//   zones = ['Zone 1', 'Zone 2', 'Zone 3']; // Example zones
//   wards = ['Ward 1', 'Ward 2', 'Ward 3']; // Example wards
//   beats = ['Beat 1', 'Beat 2', 'Beat 3']; // Example beats

//   // Example machine statuses and stock statuses
//   machineStatuses = [
//     { name: 'Online', selected: false },
//     { name: 'Offline', selected: false },
//   ];

//   stockStatuses = [
//     { name: 'OK', selected: false },
//     { name: 'Full', selected: false },
//     { name: 'Empty', selected: false },
//   ];

//   filteredData: MachineData[] = [];  // Now it's an array of MachineData objects
//   allData: MachineData[] = [
//     {
//       machineName: 'Machine 1',
//       stockStatus: 'OK',
//       machineStatus: 'Online',
//       status: 'Running',
//       imsi: '12345',
//       rssi: 'Good',
//       collection: 60,
//       itemsDispensed: 6,
//       itemsBurnt: 16,
//       burningCycles: 2
//     },
//     {
//       machineName: 'Machine 2',
//       stockStatus: 'Full',
//       machineStatus: 'Offline',
//       status: 'Idle',
//       imsi: '67890',
//       rssi: 'Weak',
//       collection: 30,
//       itemsDispensed: 3,
//       itemsBurnt: 8,
//       burningCycles: 1
//     }
//     // Add more sample data as needed...
//   ];

//   // Declare hoveredItem as null initially
//   hoveredItem: MachineData | null = null;  // This fixes the error

//   selectedZone = '';
//   selectedWard = '';
//   selectedBeat = '';
//   searchTerm = '';
//   currentPage = 1;
//   itemsPerPage = 5;

//   // Apply filters based on user selection
//   applyFilters() {
//     this.filteredData = this.allData.filter(item => {
//       return (
//         (this.selectedZone ? item.machineName.includes(this.selectedZone) : true) &&
//         (this.selectedWard ? item.machineName.includes(this.selectedWard) : true) &&
//         (this.selectedBeat ? item.machineName.includes(this.selectedBeat) : true) &&
//         (this.machineStatuses.some(status => status.selected && item.machineStatus === status.name)) &&
//         (this.stockStatuses.some(status => status.selected && item.stockStatus === status.name))
//       );
//     });
//     this.currentPage = 1;  // Reset to first page after filtering
//     this.paginate();
//   }

//   // Handle search functionality
//   searchData() {
//     this.filteredData = this.filteredData.filter(item =>
//       item.machineName.toLowerCase().includes(this.searchTerm.toLowerCase())
//     );
//     this.paginate();
//   }

//   // Handle hover to show more details
//   showDetails(item: MachineData) {
//     this.hoveredItem = item;  // Set the hoveredItem to the current row's data
//   }

//   // Pagination functionality: Slice data based on the current page
//   paginate() {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = this.currentPage * this.itemsPerPage;
//     this.filteredData = this.filteredData.slice(startIndex, endIndex);
//   }

//   // Previous page functionality
//   previousPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       this.paginate();
//     }
//   }

//   // Next page functionality
//   nextPage() {
//     if (this.currentPage * this.itemsPerPage < this.allData.length) {
//       this.currentPage++;
//       this.paginate();
//     }
//   }
// }


// import { Component, OnInit } from '@angular/core';
// import { DataService } from '../../service/data.service';

// @Component({
//   selector: 'app-machinedata',
//   templateUrl: './machinedata.component.html',
//   styleUrls: ['./machinedata.component.scss']
// })
// export class MachinedataComponent implements OnInit {
//   isLoading = false;
//   errorMessage = '';
//   machines: any[] = [];
//   filteredMachines: any[] = [];
//   hoveredMachineId: string | null = null;

//   // Dashboard Summary Data
//   dashboardData = {
//     machinesInstalled: 0,
//     machinesRunning: 0,
//     burningEnabled: 0,
//     totalBurningCycles: 0,
//     totalCollection: 0,
//     itemsDispensed: 0,
//     stockEmpty: 0,
//     stockLow: 0
//   };

//   // Filters
//   machineStatuses = ["0", "1", "2"]; // 0: All, 1: Online, 2: Offline
//   stockStatuses = ["0", "1"]; // 0: Empty, 1: Ok
//   burnStatuses = ["1", "2"]; // 1: Idle, 2: Burning

//   selectedMachineStatuses: string[] = ["0", "1", "2"];
//   selectedStockStatuses: string[] = ["0", "1"];
//   selectedBurnStatuses: string[] = ["1", "2"];

//   zones: string[] = [];
//   wards: string[] = [];
//   beats: string[] = [];
//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];

//   constructor(private dataService: DataService) {}

//   ngOnInit() {
//     this.loadMachineData();
//   }

//   loadMachineData() {
//     this.isLoading = true;
//     this.errorMessage = '';

//     this.dataService.getMachineDashboardSummary(
//       'ABC1234567',
//       this.selectedMachineStatuses.join(','),
//       this.selectedStockStatuses.join(','),
//       this.selectedBurnStatuses.join(','),
//       this.selectedZones.join(','),
//       this.selectedWards.join(','),
//       this.selectedBeats.join(',')
//     ).subscribe(
//       (response: any) => {
//         if (response.status === 200) {
//           this.machines = response.data.machines || [];
//           this.filteredMachines = [...this.machines];

//           // Update dashboard summary cards
//           this.dashboardData = {
//             machinesInstalled: response.data.machinesInstalled,
//             machinesRunning: response.data.machinesRunning,
//             burningEnabled: response.data.burningEnabled,
//             totalBurningCycles: response.data.totalBurningCycles,
//             totalCollection: response.data.totalCollection,
//             itemsDispensed: response.data.itemsDispensed,
//             stockEmpty: response.data.stockEmpty,
//             stockLow: response.data.stockLow
//           };

//           this.extractFilters();
//         } else {
//           this.errorMessage = "No data available for selected filters.";
//           this.filteredMachines = [];
//         }
//         this.isLoading = false;
//       },
//       (error) => {
//         this.errorMessage = "Error fetching data. Please try again.";
//         this.isLoading = false;
//       }
//     );
//   }

//   extractFilters() {
//     this.zones = Array.from(new Set(this.machines.map(m => m.level1).filter(Boolean)));
//     this.wards = Array.from(new Set(this.machines.map(m => m.level2).filter(Boolean)));
//     this.beats = Array.from(new Set(this.machines.map(m => m.level3).filter(Boolean)));
//   }

//   applyFilters() {
//     this.loadMachineData();
//   }
// }
// it works fine fine fine 


// import { Component, OnInit } from '@angular/core';
// import { DataService } from '../../service/data.service';

// @Component({
//   selector: 'app-machinedata',
//   templateUrl: './machinedata.component.html',
//   styleUrls: ['./machinedata.component.scss']
// })
// export class MachinedataComponent implements OnInit {
//   isLoading = false;
//   errorMessage = '';
//   machines: any[] = [];
//   filteredMachines: any[] = [];

//   // Filters
//   machineStatuses = [
//     { key: "0", value: "All" },
//     { key: "1", value: "Online" },
//     { key: "2", value: "Offline" }
//   ];
  
//   stockStatuses = [
//     { key: "0", value: "Empty" },
//     { key: "1", value: "Low" }
//   ];

//   burnStatuses = [
//     { key: "1", value: "Idle" },
//     { key: "2", value: "Burning" }
//   ];

//   selectedMachineStatuses: string[] = ["0", "1", "2"];
//   selectedStockStatuses: string[] = ["0", "1"];
//   selectedBurnStatuses: string[] = ["1", "2"];

//   zones: string[] = [];
//   wards: string[] = [];
//   beats: string[] = [];
//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];

//   hoveredMachineId: string | null = null;
//   dropdownOpen: any = {};

//   dashboardData: any = {
//     machinesInstalled: 0,
//     machinesRunning: 0,
//     stockEmpty: 0,
//     stockLow: 0,
//     burningEnabled: 0,
//     totalBurningCycles: 0,
//     totalCollection: 0,
//     itemsDispensed: 0
//   };

//   constructor(private dataService: DataService) {}

//   ngOnInit() {
//     this.loadMachineData();
//   }

//   loadMachineData() {
//     this.isLoading = true;
//     this.errorMessage = '';

//     this.dataService.getMachineDashboardSummary(
//       'MAPL123456', // Merchant ID
//       this.selectedMachineStatuses.join(','),
//       this.selectedStockStatuses.join(','),
//       this.selectedBurnStatuses.join(','),
//       this.selectedZones.join(','),
//       this.selectedWards.join(','),
//       this.selectedBeats.join(',')
//     ).subscribe(
//       (response: any) => {
//         if (response.status === 200) {
//           this.machines = response.data.machines;
//           this.filteredMachines = [...this.machines];
//           this.dashboardData = { ...response.data };
//           this.extractFilters();
//         } else {
//           this.errorMessage = "No data available for selected filters.";
//           this.filteredMachines = [];
//         }
//         this.isLoading = false;
//       },
//       (error) => {
//         this.errorMessage = "Error fetching data. Please try again.";
//         this.isLoading = false;
//       }
//     );
//   }

//   extractFilters() {
//     this.zones = Array.from(new Set(this.machines.map(m => m.level1).filter(Boolean)));
//     this.wards = [];
//     this.beats = [];
//   }

//   applyFilters() {
//     this.filteredMachines = this.machines.filter(machine =>
//       (this.selectedMachineStatuses.includes(machine.status)) &&
//       (this.selectedStockStatuses.includes(machine.stockStatus)) &&
//       (this.selectedBurnStatuses.includes(machine.burningStatus)) &&
//       (this.selectedZones.includes(machine.level1)) &&
//       (this.selectedWards.includes(machine.level2)) &&
//       (this.selectedBeats.includes(machine.level3))
//     );
//   }

//   toggleDropdown(filterType: string) {
//     Object.keys(this.dropdownOpen).forEach(key => {
//       if (key !== filterType) {
//         this.dropdownOpen[key] = false;
//       }
//     });
//     this.dropdownOpen[filterType] = !this.dropdownOpen[filterType];
//   }

//   showInfo(machineId: string) {
//     this.hoveredMachineId = machineId;
//   }

//   hideInfo() {
//     this.hoveredMachineId = null;
//   }
// }



  // import { Component, OnInit } from '@angular/core';
  // import { DataService } from '../../service/data.service';
  // import { timeout } from 'rxjs/operators'; 
  // import{CommonDataService} from '../../Common/common-data.service';
  // @Component({
  //   selector: 'app-machinedata',
  //   templateUrl: './machinedata.component.html',
  //   styleUrls: ['./machinedata.component.scss']
  // })
  // export class MachinedataComponent implements OnInit {
    
  //   isLoading = false;
  //   errorMessage = '';
  //   machines: any[] = [];
  //   filteredMachines: any[] = [];
  

  //   // Filters
  //   machineStatuses = [
  //     // { key: '0', value: 'All' },
  //     { key: '1', value: 'Online' },
  //     { key: '2', value: 'Offline' }
  //   ];
  //   stockStatuses = [
  //     { key: '0', value: 'Empty' },
  //     { key: '1', value: 'Ok' },
  //     { key: '2', value: 'Low' }
  //   ];
  //   burnStatuses = [
  //     // { key: '0', value: 'All' },
  //     { key: '1', value: 'Idle' },
  //     { key: '2', value: 'Burning' }
  //   ];

  //   selectedMachineStatuses: string[] = ['1', '2'];
  //   selectedStockStatuses: string[] = ['0', '1'];
  //   selectedBurnStatuses: string[] = ['1', '2'];

  //   // ✅ Fix: Added missing properties
  //   zones: string[] = [];
  //   wards: string[] = [];
  //   beats: string[] = [];
  //   selectedZones: string[] = [];
  //   selectedWards: string[] = [];
  //   selectedBeats: string[] = [];

  //   dropdownOpen: any = {};
  //   dashboardData: any = {};
    
  

  //   constructor(private dataService: DataService,private commonDataService: CommonDataService ) {}

  //   ngOnInit() {
      
  //     this.loadMachineData();
      
  //   }
  

  //   // ✅ API Call to Fetch Machine Data
  //   loadMachineData() {
  //     this.isLoading = true;
  //     this.errorMessage = '';
    
  //     console.log("🔹 Calling API with:");
  //     console.log("Merchant ID:", '');
  //     console.log("Machine Status:", this.selectedMachineStatuses.join(','));
    
  //     this.dataService.getMachineDashboardSummary(
  //       this.commonDataService.merchantId || '',
  //       this.selectedMachineStatuses.join(','), 
  //       '',  
  //       ''   
  //     ).subscribe(
  //       (response: any) => {
  //         console.log("✅ API Response:", response);
    
  //         if (response.status === 200) {
  //           // this.machines = response.data.machines.map((machine: any) => {
  //           //   const springStatuses: string[] = machine.stockStatus.map((stock: any) => stock.springStatus.toString().trim());
            
  //           //   let machineStockStatus = "Ok"; // Default status
            
  //           //   if (springStatuses.length > 0 && springStatuses.every(status => status === "0")) {
  //           //     machineStockStatus = "Empty";
  //           //   } else if (springStatuses.length > 0 && springStatuses.every(status => status === "2")) {
  //           //     machineStockStatus = "Full";
  //           //   }
            
  //           //   console.log(`Machine: ${machine.machineId}, Computed Stock Status:`, machineStockStatus);
            
  //           //   return {
  //           //     ...machine,
  //           //     status: machine.status === 'Online' ? '1' : '2',
  //           //     stockStatus: machineStockStatus,
  //           //     burningStatus: machine.burningStatus === 'Burning' ? '2' : '1'
  //           //   };
  //           // });
            
  //           this.machines = response.data.machines.map((machine: any) => {
  //             const springStatuses: string[] = machine.stockStatus.map((stock: any) => stock.springStatus.toString().trim());
            
  //             let machineStockStatus = "Ok"; // Default status
            
  //             if (springStatuses.length > 0 && springStatuses.every(status => status === "0")) {
  //               machineStockStatus = "Empty";
  //             } else if (springStatuses.length > 0 && springStatuses.every(status => status === "2")) {
  //               machineStockStatus = "Full";
  //             } else if (springStatuses.includes("0") && springStatuses.includes("2")) {
  //               machineStockStatus = "Low";
  //             }
            
  //             console.log(`Machine: ${machine.machineId}, Computed Stock Status:`, machineStockStatus);
            
  //             return {
  //               ...machine,
  //               status: machine.status === 'Online' ? '1' : '2',
  //               stockStatus: machineStockStatus,
  //               burningStatus: machine.burningStatus === 'Burning' ? '2' : '1'
  //             };
  //           });
            
    
  //           this.filteredMachines = [...this.machines];
  //           this.dashboardData = { ...response.data };
    
  //           this.extractFilters();
  //         } else {
  //           this.errorMessage = 'No data available for selected filters.';
  //           this.filteredMachines = [];
  //         }
  //         this.isLoading = false;
  //       },
  //       (error) => {
  //         this.errorMessage = 'Error fetching data. Please try again.';
  //         this.isLoading = false;
  //       }
  //     );
  //   }
    

  //   // ✅ Fix: Extract Zones, Wards, Beats
  //   extractFilters() {
  //     this.zones = Array.from(new Set(this.machines.map(m => m.level1).filter(Boolean)));
  //     this.wards = Array.from(new Set(this.machines.map(m => m.level2).filter(Boolean)));
  //     this.beats = Array.from(new Set(this.machines.map(m => m.level3).filter(Boolean)));

  //     this.selectedZones = [...this.zones];
  //     this.selectedWards = [...this.wards];
  //     this.selectedBeats = [...this.beats];
  //   }

  //   // ✅ Refresh Data (Fixes missing `refreshData` function)
  //   refreshData() {
  //     console.log("🔄 Refreshing Data...");
  //     this.loadMachineData();
  //   }

  //   // ✅ Filters Work Correctly, "All" Keeps Everything
  //   applyFilters() {
  //     this.filteredMachines = this.machines.filter(machine =>
  //       (this.selectedMachineStatuses.includes('0') || this.selectedMachineStatuses.includes(machine.status)) &&
  //       (this.selectedStockStatuses.includes('0') || this.selectedStockStatuses.includes(machine.stockStatus.length > 0 ? '1' : '0')) &&
  //       (this.selectedBurnStatuses.includes('0') || this.selectedBurnStatuses.includes(machine.burningStatus === 'Burning' ? '2' : '1')) &&
  //       (this.selectedZones.includes(machine.level1) || this.selectedZones.length === 0) &&
  //       (this.selectedWards.includes(machine.level2) || this.selectedWards.length === 0) &&
  //       (this.selectedBeats.includes(machine.level3) || this.selectedBeats.length === 0)
  //     );

  //     this.errorMessage = this.filteredMachines.length === 0 ? "No Data Available." : "";
  //   }

  //   // ✅ Fix: Toggle Dropdowns
  //   toggleDropdown(filterType: string) {
  //     Object.keys(this.dropdownOpen).forEach(key => {
  //       if (key !== filterType) {
  //         this.dropdownOpen[key] = false;
  //       }
  //     });
  //     this.dropdownOpen[filterType] = !this.dropdownOpen[filterType];
  //   }

  //   // ✅ Fix: Toggle Selection
  //   toggleSelection(array: string[], value: string) {
  //     if (array.includes(value)) {
  //       array.splice(array.indexOf(value), 1);
  //     } else {
  //       array.push(value);
  //     }
  //     this.applyFilters();
  //   }
  // }
  
  //23;30

//   import { Component, OnInit } from '@angular/core';
// import { DataService } from '../../service/data.service';
// import { timeout } from 'rxjs/operators'; 
// import { CommonDataService } from '../../Common/common-data.service';

// @Component({
//   selector: 'app-machinedata',
//   templateUrl: './machinedata.component.html',
//   styleUrls: ['./machinedata.component.scss']
// })
// export class MachinedataComponent implements OnInit {

//   isLoading = false;
//   errorMessage = '';
//   machines: any[] = [];
//   filteredMachines: any[] = [];

//   // Filters
//   machineStatuses = [
//     { key: '1', value: 'Online' },
//     { key: '2', value: 'Offline' }
//   ];
//   stockStatuses = [
//     { key: '2', value: 'Full (Ok)' },
//     { key: '0', value: 'Empty' },
//     { key: '1', value: 'Low' }
//   ];
//   burnStatuses = [
//     { key: '1', value: 'Idle' },
//     { key: '2', value: 'Burning' }
//   ];

//   selectedMachineStatuses: string[] = ['1', '2'];
//   selectedStockStatuses: string[] = [];
//   selectedBurnStatuses: string[] = [];

//   zones: string[] = [];
//   wards: string[] = [];
//   beats: string[] = [];
//   selectedZones: string[] = [];
//   selectedWards: string[] = [];
//   selectedBeats: string[] = [];

//   dropdownOpen: any = {};
//   dashboardData: any = {};

//   constructor(private dataService: DataService, private commonDataService: CommonDataService) {}

//   ngOnInit() {
//     this.loadMachineData(true);
//   }

//   loadMachineData(resetFilters: boolean = false) {
//     this.isLoading = true;
//     this.errorMessage = '';

//     if (resetFilters) {
//       this.selectedMachineStatuses = ['1', '2'];
//       this.selectedStockStatuses = [];
//       this.selectedBurnStatuses = [];
//       this.selectedZones = [];
//       this.selectedWards = [];
//       this.selectedBeats = [];
//     }

//     const merchantId = this.commonDataService.merchantId ?? ''; // ✅ Handle null merchantId

//     console.log("🔹 Calling API with:");
//     console.log("Merchant ID:", merchantId);
//     console.log("Machine Status:", this.selectedMachineStatuses.join(',') || '1,2');
//     console.log("Stock Status:", this.selectedStockStatuses.length ? this.selectedStockStatuses.join(',') : '');
//     console.log("Burn Status:", this.selectedBurnStatuses.length ? this.selectedBurnStatuses.join(',') : '');
//     console.log("Level 1 (Zone):", this.selectedZones.join(','));
//     console.log("Level 2 (Ward):", this.selectedWards.join(','));
//     console.log("Level 3 (Beat):", this.selectedBeats.join(','));

//     this.dataService.getMachineDashboardSummary(
//       merchantId,
//       this.selectedMachineStatuses.join(',') || '1,2',
//       this.selectedStockStatuses.length ? this.selectedStockStatuses.join(',') : '',
//       this.selectedBurnStatuses.length ? this.selectedBurnStatuses.join(',') : '',
//       this.selectedZones.join(','),
//       this.selectedWards.join(','),
//       this.selectedBeats.join(',')
//     ).subscribe(
//       (response: any) => {
//         console.log("✅ API Response:", response);

//         if (response.status === 200) {
//           this.machines = response.data.machines.map((machine: any) => {
//             const springStatuses: string[] = machine.stockStatus?.map((stock: any) => stock.springStatus?.toString().trim() || '') || [];

//             let machineStockStatus = "1"; // Default to Low
//             if (springStatuses.every(status => status === "0")) {
//               machineStockStatus = "0"; // Empty
//             } else if (springStatuses.every(status => status === "2")) {
//               machineStockStatus = "2"; // Full (Ok)
//             }

//             let machineBurnStatus = machine.burningStatus === 'Burning' ? '2' : '1';

//             console.log(`🔹 Machine: ${machine.machineId || 'N/A'}`);
//             console.log(`   Spring Statuses: ${springStatuses}`);
//             console.log(`   Computed Stock Status: ${machineStockStatus}`);
//             console.log(`   Computed Burn Status: ${machineBurnStatus}`);

//             return {
//               ...machine,
//               status: machine.status === 'Online' ? '1' : '2',
//               stockStatus: machineStockStatus,
//               burningStatus: machineBurnStatus
//             };
//           });

//           this.filteredMachines = [...this.machines];
//           this.dashboardData = { ...response.data };
//         } else {
//           this.errorMessage = 'No data available for selected filters.';
//           this.filteredMachines = [];
//         }
//         this.isLoading = false;
//       },
//       (error) => {
//         this.errorMessage = 'Error fetching data. Please try again.';
//         this.isLoading = false;
//       }
//     );
//   }
//   toggleDropdown(filterType: string) {
//     Object.keys(this.dropdownOpen).forEach(key => {
//       if (key !== filterType) {
//         this.dropdownOpen[key] = false; // Close other dropdowns
//       }
//     });
//     this.dropdownOpen[filterType] = !this.dropdownOpen[filterType]; // Toggle current dropdown
//     console.log("🔹 Toggling Dropdown:", filterType, "=>", this.dropdownOpen[filterType]);
//   }
//   hoveredMachineId: string | null = null;

// showInfo(machineId: string) {
//   this.hoveredMachineId = machineId;
//   console.log("🔹 Hovered Machine:", machineId);
// }

// hideInfo() {
//   this.hoveredMachineId = null;
//   console.log("🔹 Hover Removed");
// }

  
//   refreshData() {
//     console.log("🔄 Refreshing Data...");
//     this.loadMachineData(true);
//   }
// }


import { Component, OnInit } from '@angular/core';
import { DataService } from '../../service/data.service';
import { timeout } from 'rxjs/operators'; 
import { CommonDataService } from '../../Common/common-data.service';

@Component({
  selector: 'app-machinedata',
  templateUrl: './machinedata.component.html',
  styleUrls: ['./machinedata.component.scss']
})
export class MachinedataComponent implements OnInit {

  isLoading = false;
  errorMessage = '';
  machines: any[] = [];
  filteredMachines: any[] = [];

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

  zones: string[] = [];
  wards: string[] = [];
  beats: string[] = [];
  selectedZones: string[] = [];
  selectedWards: string[] = [];
  selectedBeats: string[] = [];

  dropdownOpen: any = {};
  dashboardData: any = {};

  constructor(private dataService: DataService, private commonDataService: CommonDataService) {}

  ngOnInit() {
    this.loadMachineData(true);
  }
  loadMachineData(resetFilters: boolean = false) { // ✅ Allow optional parameter
    this.isLoading = true;
    this.errorMessage = '';
  
    const merchantId = this.commonDataService.merchantId ?? '';
  
    // ✅ Reset filters if `resetFilters` is true
    if (resetFilters) {
      this.selectedMachineStatuses = ['1', '2']; // ✅ Default: Online + Offline
      this.selectedStockStatuses = [];
      this.selectedBurnStatuses = [];
      this.selectedZones = [];
      this.selectedWards = [];
      this.selectedBeats = [];
    }
  
    this.dataService.getMachineDashboardSummary(
      merchantId,
      this.selectedMachineStatuses.length ? this.selectedMachineStatuses.join(',') : '',
      this.selectedStockStatuses.length ? this.selectedStockStatuses.join(',') : '',
      this.selectedBurnStatuses.length ? this.selectedBurnStatuses.join(',') : '',
      this.selectedZones.join(','),
      this.selectedWards.join(','),
      this.selectedBeats.join(',')
    ).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.machines = response.data.machines.map((machine: any) => {
            const springStatuses: string[] = machine.stockStatus?.map(
              (stock: any) => stock.springStatus?.toString().trim() || ''
            ) || [];
          
            // let machineStockStatus = "Low"; // ✅ Default: If mixed spring statuses, it stays "Low"
          
            // if (springStatuses.length > 0 && springStatuses.every(status => status === "0")) {
            //   machineStockStatus = "Empty"; // ✅ All springs are Empty
            // } else if (springStatuses.length > 0 && springStatuses.every(status => status === "2")) {
            //   machineStockStatus = "Full"; // ✅ All springs are Full
            // }
            let machineStockStatus = "Low"; // ✅ Default: If mixed spring statuses, it stays "Low"

// ✅ Fix: Properly determine stock status
if (springStatuses.length > 0 && springStatuses.every(status => status === "0")) {
  machineStockStatus = "Empty"; // ✅ All springs are Empty
} else if (springStatuses.length > 0 && springStatuses.every(status => status === "1")) {
  machineStockStatus = "Low";   // ✅ All springs are Low
} else if (springStatuses.length > 0 && springStatuses.every(status => status === "2")) {
  machineStockStatus = "Full";  // ✅ All springs are Full
}

          
          let machineBurnStatus = machine.burningStatus.toLowerCase() === 'burning' ? '2' : '1';

return {
  ...machine,
  status: machine.status === 'Online' ? '1' : '2',
  stockStatus: machineStockStatus, 
  burningStatus: machineBurnStatus
};
          });
          
          this.filteredMachines = [...this.machines];
  
          // ✅ Dynamically update dashboard card values
          this.dashboardData = {
            ...response.data,  // ✅ Directly use API values
            machinesInstalled: response.data.machinesInstalled, // ✅ Directly from API
            machinesRunning: response.data.machinesRunning,     // ✅ Directly from API
            stockEmpty: response.data.stockEmpty,               // ✅ Directly from API
            stockLow: response.data.stockLow,                   // ✅ Directly from API
            stockOk: response.data.stockOk,                     // ✅ Directly from API
            totalBurningCycles: response.data.totalBurningCycles,
            totalCollection: response.data.totalCollection,
            itemsDispensed: response.data.itemsDispensed
          };
          
  
          this.updateFilters();
        } else {
          this.errorMessage = 'No data available for selected filters.';
          this.filteredMachines = [];
        }
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching data. Please try again.';
        this.isLoading = false;
      }
    );
  }
  
  

  // ✅ Update filters dynamically based on available machines
  updateFilters() {
    this.zones = Array.from(new Set(this.filteredMachines.map(m => m.level1).filter(Boolean)));
    this.wards = Array.from(new Set(this.filteredMachines.map(m => m.level2).filter(Boolean)));
    this.beats = Array.from(new Set(this.filteredMachines.map(m => m.level3).filter(Boolean)));

    this.selectedZones = this.selectedZones.filter(zone => this.zones.includes(zone));
    this.selectedWards = this.selectedWards.filter(ward => this.wards.includes(ward));
    this.selectedBeats = this.selectedBeats.filter(beat => this.beats.includes(beat));
  }

  // ✅ Handles filter selection/unselection dynamically
  toggleSelection(array: string[], value: string, filterKey: string) {
    if (array.includes(value)) {
      array.splice(array.indexOf(value), 1);
    } else {
      array.push(value);
    }
    console.log("🔹 Updated Selection:", array);
    this.dropdownOpen[filterKey] = false; // ✅ Close the dropdown after selection
    this.loadMachineData(); // ✅ Reload API with new filters
  }
  
  hoveredMachineId: string | null = null;

showInfo(machineId: string) {
  this.hoveredMachineId = machineId;
  console.log("🔹 Hovered Machine:", machineId);
}

hideInfo() {
  this.hoveredMachineId = null;
  console.log("🔹 Hover Removed");
}

  
  // ✅ Handles opening/closing dropdowns correctly
  toggleDropdown(filterType: string) {
    Object.keys(this.dropdownOpen).forEach(key => {
      if (key !== filterType) {
        this.dropdownOpen[key] = false;
      }
    });
    this.dropdownOpen[filterType] = !this.dropdownOpen[filterType];
  }

  refreshData() {
    console.log("🔄 Refreshing Data...");
    this.loadMachineData(true);
  }
}
