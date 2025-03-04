//before dashboardsummary api 

// import { Component, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
// import { Chart } from 'chart.js';
// import { DataService } from '../../../service/data.service';
// import { AuthService } from '../../../services/auth.service';

// @Component({
//   selector: 'app-widgets',
//   templateUrl: './widgets.component.html',
//   styleUrls: ['./widgets.component.scss'],
//   encapsulation: ViewEncapsulation.None,
//   changeDetection: ChangeDetectionStrategy.Default
// })
// export class WidgetsComponent implements AfterContentInit {

//   totalMachines = 0;
//   activeMachines = 0;
//   inactiveMachines = 0;
//   napkinsDispensed = 0; // Updated to be dynamic

//   okStock = 120;
//   lowStock = 50;
//   emptyStock = 20;
//   unknownStock = 0;

//   totalCollection = 0; // Updated to be dynamic

//   merchantId: string | null = null;
//   chartDoughnut: any;
//   chartStock: any;

//   constructor(
//     private changeDetectorRef: ChangeDetectorRef,
//     private dataService: DataService,
//     private authService: AuthService
//   ) {}

//   ngAfterContentInit(): void {
//     this.merchantId ;
//     if (this.merchantId) {
//       this.fetchMachineData();
//       this.fetchTransactionData(); // Fetch transaction data
//       this.updateStockChart();
//     } else {
//       console.error('❌ No Merchant ID Found! Redirecting to login...');
//     }
//   }

//   fetchMachineData(): void {
//     if (!this.merchantId) return;

//     this.dataService.getMachines(this.merchantId).subscribe({
//       next: (response) => {
//         console.log('Machines Data:', response);
//         if (response) {
//           this.activeMachines = response.activeCount || 0;
//           this.inactiveMachines = response.inActiveCount || 0;
//           this.totalMachines = this.activeMachines + this.inactiveMachines;
//           this.updateMachineChart();
//           this.changeDetectorRef.detectChanges();
//         }
//       },
//       error: (error) => console.error('Error fetching machine data:', error)
//     });
//   }

//   fetchTransactionData(): void {
//     if (!this.merchantId) return;

//     this.dataService.getTransactions(this.merchantId).subscribe({
//       next: (response) => {
//         console.log('Transaction Data:', response);
//         if (response.status === 200 && response.data) {
//           const transactions = response.data;

//           this.totalCollection = transactions.reduce((sum: any, txn: { txnAmount: any; }) => sum + (txn.txnAmount || 0), 0);
//           this.napkinsDispensed = transactions.reduce((sum: any, txn: { quantity: any; }) => sum + (txn.quantity || 0), 0);

//           this.changeDetectorRef.detectChanges();
//         }
//       },
//       error: (error) => console.error('Error fetching transaction data:', error)
//     });
//   }

//   updateMachineChart(): void {
//     const machineChartData = {
//       labels: ['Online', 'Offline'],
//       datasets: [{
//         data: [this.activeMachines, this.inactiveMachines],
//         backgroundColor: ['#2ac123', '#dd1f1f']
//       }]
//     };
//     this.initializeMachineChart(machineChartData);
//   }

//   updateStockChart(): void {
//     const stockChartData = {
//       labels: ['OK', 'LOW', 'EMPTY', 'UNKNOWN'],
//       datasets: [{
//         data: [this.okStock, this.lowStock, this.emptyStock, this.unknownStock],
//         backgroundColor: ['#2ac123', '#f39c12', '#dd1f1f', 'grey']
//       }]
//     };
//     this.initializeStockChart(stockChartData);
//   }

//   initializeMachineChart(chartData: any): void {
//     setTimeout(() => {
//       const doughnutCanvas = document.getElementById('canvasDoughnut') as HTMLCanvasElement;

//       if (doughnutCanvas) {
//         if (this.chartDoughnut) this.chartDoughnut.destroy();
//         this.chartDoughnut = new Chart(doughnutCanvas, {
//           type: 'doughnut',
//           data: chartData,
//           options: { responsive: false, maintainAspectRatio: false }
//         });
//       }
//     }, 500);
//   }

//   initializeStockChart(chartData: any): void {
//     setTimeout(() => {
//       const stockCanvas = document.getElementById('canvasStock') as HTMLCanvasElement;

//       if (stockCanvas) {
//         if (this.chartStock) this.chartStock.destroy();
//         this.chartStock = new Chart(stockCanvas, {
//           type: 'pie',
//           data: chartData,
//           options: { responsive: false, maintainAspectRatio: false }
//         });
//       }
//     }, 500);
//   }
// }

//After summarydashboard api
// import { Component, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
// import { Chart } from 'chart.js';
// import { DataService } from '../../../service/data.service';
// import { CommonDataService } from 'src/app/Common/common-data.service';

// @Component({
//   selector: 'app-widgets',
//   templateUrl: './widgets.component.html',
//   styleUrls: ['./widgets.component.scss'],
//   encapsulation: ViewEncapsulation.None,
//   changeDetection: ChangeDetectionStrategy.Default
// })
// export class WidgetsComponent implements AfterContentInit {

//   totalMachines = 0;
//   activeMachines = 0;
//   inactiveMachines = 0;
//   napkinsDispensed = 0;
//   okStock = 0;
//   lowStock = 0;
//   emptyStock = 0;
//   unknownStock = 0;
//   totalCollection = 0;

//   merchantId: string | null = null;
//   chartDoughnut: any;
//   chartStock: any;

//   constructor(
//     private changeDetectorRef: ChangeDetectorRef,
//     private dataService: DataService,
//     private commonDataService: CommonDataService
//   ) {}

//   ngAfterContentInit(): void {
//     this.merchantId = this.commonDataService.merchantId;
    
//     if (this.merchantId) {
//       this.fetchDashboardData();
//     } else {
//       console.error('❌ No Merchant ID Found! Redirecting to login...');
//     }
//   }
//   fetchDashboardData(): void {
//     if (!this.merchantId) return;
  
//     console.log('🔹 Fetching Dashboard Data for Merchant:', this.merchantId);
  
//     this.dataService.getMachineDashboardSummary(this.merchantId, '1,2', '', '').subscribe({
//       next: (response) => {
//         console.log('✅ Dashboard Data:', response);
  
//         if (response.status === 200 && response.data) {
//           const { machinesInstalled, machinesRunning, totalCollection, itemsDispensed, machines } = response.data;
  
//           // ✅ Assign General Data
//           this.totalMachines = machinesInstalled || 0;
//           this.activeMachines = machinesRunning || 0;
//           this.inactiveMachines = this.totalMachines - this.activeMachines;
//           this.totalCollection = totalCollection || 0;
//           this.napkinsDispensed = itemsDispensed || 0;
  
//           // ✅ Stock Status Calculation - Optimized
//           let emptyCount = 0, lowCount = 0, fullCount = 0;
  
//           machines.forEach((machine: any) => {
//             if (!machine.stockStatus || machine.stockStatus.length === 0) return; // Skip invalid data
  
//             const statuses: string[] = machine.stockStatus.map((s: { springStatus: string }) => s.springStatus); // Explicitly type 's'
  
//             if (statuses.every(s => s === '2')) fullCount++;
//             else if (statuses.every(s => s === '0')) emptyCount++;
//             else lowCount++; // If mixed, consider it Low
//           });
  
//           // ✅ Assign Stock Values
//           this.okStock = fullCount;
//           this.lowStock = lowCount;
//           this.emptyStock = emptyCount;
//           this.unknownStock = 0;
  
//           // ✅ Update Charts Only If Data Changed
//           this.updateMachineChart();
//           this.updateStockChart();
//           this.changeDetectorRef.detectChanges();
//         } else {
//           console.warn('⚠️ No valid data received');
//         }
//       },
//       error: (error) => console.error('❌ Error fetching dashboard data:', error)
//     });
//   }
  
//   updateMachineChart(): void {
//     const machineChartData = {
//       labels: ['Online', 'Offline'],
//       datasets: [{
//         data: [this.activeMachines, this.inactiveMachines],
//         backgroundColor: ['#2ac123', '#dd1f1f']
//       }]
//     };
//     this.initializeMachineChart(machineChartData);
//   }

//   updateStockChart(): void {
//     const stockChartData = {
//       labels: ['OK', 'LOW', 'EMPTY', 'UNKNOWN'],
//       datasets: [{
//         data: [this.okStock, this.lowStock, this.emptyStock, this.unknownStock],
//         backgroundColor: ['#2ac123', '#f39c12', '#dd1f1f', 'grey']
//       }]
//     };
//     this.initializeStockChart(stockChartData);
//   }

//   initializeMachineChart(chartData: any): void {
//     setTimeout(() => {
//       const doughnutCanvas = document.getElementById('canvasDoughnut') as HTMLCanvasElement;
//       if (doughnutCanvas) {
//         if (this.chartDoughnut) this.chartDoughnut.destroy();
//         this.chartDoughnut = new Chart(doughnutCanvas, {
//           type: 'doughnut',
//           data: chartData,
//           options: { responsive: false, maintainAspectRatio: false }
//         });
//       }
//     }, 500);
//   }

//   initializeStockChart(chartData: any): void {
//     setTimeout(() => {
//       const stockCanvas = document.getElementById('canvasStock') as HTMLCanvasElement;
//       if (stockCanvas) {
//         if (this.chartStock) this.chartStock.destroy();
//         this.chartStock = new Chart(stockCanvas, {
//           type: 'pie',
//           data: chartData,
//           options: { responsive: false, maintainAspectRatio: false }
//         });
//       }
//     }, 500);
//   } 
// }
//After code optimization

import { Component, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Chart, ChartType, registerables } from 'chart.js';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class WidgetsComponent implements AfterContentInit {
  totalMachines = 0;
  activeMachines = 0;
  inactiveMachines = 0;
  napkinsDispensed = 0;
  okStock = 0;
  lowStock = 0;
  emptyStock = 0;
  unknownStock = 0;
  totalCollection = 0;

  merchantId: string | null = null;
  chartDoughnut!: Chart;
  chartStock!: Chart;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private commonDataService: CommonDataService
  ) {}

  ngAfterContentInit(): void {
    this.merchantId = this.commonDataService.merchantId;
    if (this.merchantId) {
      this.fetchDashboardData();
    } else {
      console.error('❌ No Merchant ID Found! Redirecting to login...');
    }
  }
 
  
  // fetchDashboardData(): void {
  //   if (!this.merchantId) return;
  
  //   console.log('🔹 Fetching Dashboard Data for Merchant:', this.merchantId);
  
  //   this.dataService.getMachineDashboardSummary(this.merchantId, '1,2', '', '').subscribe({
  //     next: (response) => {
  //       console.log('✅ Dashboard Data:', response);
  
  //       if (response.status === 200 && response.data) {
  //         const { machinesInstalled, machinesRunning, totalCollection, itemsDispensed, machines, stockEmpty, stockLow } = response.data;
  
  //         // ✅ Assign General Data
  //         this.totalMachines = machinesInstalled || 0;
  //         this.activeMachines = machinesRunning || 0;
  //         this.inactiveMachines = this.totalMachines - this.activeMachines;
  //         this.totalCollection = totalCollection || 0;
  //         this.napkinsDispensed = itemsDispensed || 0;
  
  //         // ✅ Fix: Directly Use API Data for Stock Counts
  //         this.emptyStock = stockEmpty || 0;
  //         this.lowStock = stockLow || 0;
  //         this.okStock = this.totalMachines - (this.emptyStock + this.lowStock); // Full stock count
  
  //         // ✅ Fix: Ensure Charts Update
  //         this.updateMachineChart();
  //         this.updateStockChart();
  //         this.changeDetectorRef.detectChanges();
  //       } else {
  //         console.warn('⚠️ No valid data received');
  //       }
  //     },
  //     error: (error) => console.error('❌ Error fetching dashboard data:', error)
  //   });
  // }
  fetchDashboardData(): void {
    if (!this.merchantId) return;
  
    console.log('🔹 Fetching Dashboard Data for Merchant:', this.merchantId);
  
    this.dataService.getMachineDashboardSummary(this.merchantId, '1','').subscribe({
      next: (response) => {
        console.log('✅ Dashboard Data:', response);
  
        if (response.status === 200 && response.data) {
          const { machinesInstalled, totalCollection, itemsDispensed, machines, stockEmpty, stockLow,machinesRunning } = response.data;
  
          // ✅ Assign General Data from API
          this.totalMachines = machinesInstalled || 0;
          this.totalCollection = totalCollection || 0;
          this.napkinsDispensed = itemsDispensed || 0;
  
          // ✅ Fix: Calculate Machines Running Dynamically
          this.activeMachines = machinesRunning ? machines.filter((m: any) => m.status === 'Online').length : 0;
          this.inactiveMachines = this.totalMachines - this.activeMachines;
  
          // ✅ Fix: Use API Data for Stock Counts
          this.emptyStock = stockEmpty || 0;
          this.lowStock = stockLow || 0;
          this.okStock = this.totalMachines - (this.emptyStock + this.lowStock); // Full stock count
  
          // ✅ Update Charts Dynamically
          this.updateMachineChart();
          this.updateStockChart();
          this.changeDetectorRef.detectChanges();
        } else {
          console.warn('⚠️ No valid data received');
        }
      },
      error: (error) => console.error('❌ Error fetching dashboard data:', error)
    });
  }
  
  updateMachineChart(): void {
    this.initializeChart('canvasDoughnut', 'doughnut', ['Online', 'Offline'], [this.activeMachines, this.inactiveMachines], ['#2ac123', '#dd1f1f'], 'chartDoughnut');
  }
  updateStockChart(): void {
    console.log('📊 Updating Stock Chart with:', this.okStock, this.lowStock, this.emptyStock);
  
    this.initializeChart(
      'canvasStock', 
      'pie', 
      ['Full Stock', 'Low Stock', 'Empty Stock'], 
      [this.okStock, this.lowStock, this.emptyStock], 
      ['#2ac123', '#f39c12', '#dd1f1f'],
      'chartStock'
    );
  }
  
  
  initializeChart(canvasId: string, chartType: ChartType, labels: string[], data: number[], colors: string[], chartRef: 'chartDoughnut' | 'chartStock'): void {
    setTimeout(() => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        console.warn(`⚠️ Canvas ID '${canvasId}' not found! Skipping chart initialization.`);
        return;
      }
  
      if (this[chartRef]) {
        this[chartRef].destroy(); // ✅ Destroy only if the chart exists
      }
  
      this[chartRef] = new Chart(canvas, {
        type: chartType,
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true, // ✅ Ensure the legend is visible
              position: 'bottom', // ✅ Moves legend below the chart
              labels: {
                usePointStyle: true, // ✅ Use round icons instead of squares
                pointStyle: 'circle', // ✅ Makes the indicators round
                padding: 20, // ✅ Adds spacing for better appearance
              }
            }
          }
        }
      });
    }, 500);
  }
}  