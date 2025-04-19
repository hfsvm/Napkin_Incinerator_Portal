
// import { Component, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
// import {  ChartType, registerables } from 'chart.js';
// import { DataService } from '../../../service/data.service';
// import { CommonDataService } from '../../../Common/common-data.service';
// import Chart from 'chart.js/auto';

// Chart.register(...registerables);

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

//   doughnutChart: any;
//   stockChart: any;
//   merchantId: string | null = null;
//   chartDoughnut!: Chart;
//   chartStock!: Chart;

//   constructor(
//     private changeDetectorRef: ChangeDetectorRef,
//     private dataService: DataService,
//     private commonDataService: CommonDataService
//   ) {}

//   // ngAfterContentInit(): void {
//   //   this.merchantId = this.commonDataService.merchantId;
//   //   if (this.merchantId) {
//   //     this.fetchDashboardData();
//   //   } else {
//   //     console.error('❌ No Merchant ID Found! Redirecting to login...');
//   //   }
//   // }before set interval
//   intervalId: any;

// ngAfterContentInit(): void {
//   this.merchantId = this.commonDataService.merchantId;
//   if (this.merchantId) {
//     this.fetchDashboardData();
//     this.intervalId = setInterval(() => {
//       console.log('🔁 Auto-refreshing dashboard data...');
//       this.fetchDashboardData();
//     }, 120000);
//   } else {
//     console.error('❌ No Merchant ID Found! Redirecting to login...');
//   }
// }

// ngOnDestroy(): void {
//   if (this.intervalId) {
//     clearInterval(this.intervalId);
//   }
// }

//   // fetchDashboardData(): void {
//   //   if (!this.merchantId) return;
  
//   //   // ✅ Ensure userDetails exist before using them
//   //   const userDetails = this.commonDataService.userDetails;
//   //   console.log('🔍 Debugging userDetails:', userDetails);
  
//   //   if (!userDetails || !userDetails.machineId) {
//   //     console.error('❌ No User Details Found! API request may be incomplete.');
//   //     return;
//   //   }
  
//   //   // ✅ Prepare API Query Params (Pass Client ID in level3)
//   //   const queryParams: any = {
//   //     merchantId: this.merchantId,
//   //     machineStatus: ['1', '2'], // ✅ Default values
//   //     stockStatus: ['0', '1', '2'], 
//   //     burnStatus: ['1', '2'], 
//   //     level1: userDetails.state && userDetails.state.length > 0 ? userDetails.state.join(',') : '', 
//   //     level2: userDetails.district && userDetails.district.length > 0 ? userDetails.district.join(',') : '',
//   //     level3: userDetails.companyName && userDetails.companyName.length > 0 ? userDetails.companyName[0].ClientId : '',  // ✅ Pass only 1 Client ID
//   //     machineId: userDetails.machineId && userDetails.machineId.length > 0 ? userDetails.machineId.join(',') : '' 
//   //   };
  
//   //   // ✅ Log formatted API URL before making the request
//   //   const apiUrl = `${this.dataService.url1}/getMachineDashboardSummary?${new URLSearchParams(queryParams).toString()}`;
//   //   console.log('📡 Final API URL:', apiUrl);
  
//   //   this.dataService.getMachineDashboardSummary(queryParams).subscribe({
//   //     next: (response) => {
//   //       console.log('✅ API Response:', response);
  
//   //       if (response.code === 200 && response.data) {
//   //         const { machinesInstalled, totalCollection, itemsDispensed, machines, stockEmpty, stockLow, machinesRunning } = response.data;
  
//   //         this.totalMachines = machinesInstalled || 0;
//   //         this.totalCollection = totalCollection || 0;
//   //         this.napkinsDispensed = itemsDispensed || 0;
//   //         this.activeMachines = machinesRunning ? machines.filter((m: any) => m.status === 'Online').length : 0;
//   //         this.inactiveMachines = this.totalMachines - this.activeMachines;
//   //         this.emptyStock = stockEmpty || 0;
//   //         this.lowStock = stockLow || 0;
//   //         this.okStock = this.totalMachines - (this.emptyStock + this.lowStock);
  
//   //         this.updateMachineChart();
//   //         this.updateStockChart();
//   //         this.changeDetectorRef.detectChanges();
//   //       }
//   //     },
//   //     error: (error) => console.error('❌ Error fetching dashboard data:', error)
//   //   });
//   // }
//   fetchDashboardData(): void {
//     if (!this.merchantId) return;
  
//     const userDetails = this.commonDataService.userDetails;
//     console.log('🔍 Debugging userDetails:', userDetails);
  
//     if (!userDetails) {
//       console.error('❌ No User Details Found! API request may be incomplete.');
//       return;
//     }
  
//     const queryParams: any = {
//       merchantId: this.merchantId,
//       machineStatus: ['1', '2'],
//       stockStatus: ['0', '1', '2'],
//       burnStatus: ['1', '2'],
//       level1: userDetails.state?.join(',') || '',
//       level2: userDetails.district?.join(',') || '',
//       level3: userDetails.companyName?.[0]?.ClientId || '',
//       machineId: userDetails.machineId?.join(',') || ''
//     };
  
//     const apiUrl = `${this.dataService.url1}/getMachineDashboardSummary?${new URLSearchParams(queryParams).toString()}`;
//     console.log('📡 Final API URL:', apiUrl);
  
//     this.dataService.getMachineDashboardSummary(queryParams).subscribe({
//       next: (response) => {
//         console.log('✅ API Response:', response);
  
//         if (response.code === 200 && response.data) {
//           const { machinesInstalled = 0, machinesRunning = 0, totalCollection = 0, itemsDispensed = 0, stockEmpty = 0, stockLow = 0 } = response.data;
  
//           this.totalMachines = machinesInstalled;
//           this.activeMachines = machinesRunning;
//           this.inactiveMachines = machinesInstalled - machinesRunning;
//           this.totalCollection = totalCollection;
//           this.napkinsDispensed = itemsDispensed;
//           this.emptyStock = stockEmpty;
//           this.lowStock = stockLow;
//           this.okStock = machinesInstalled - (stockEmpty + stockLow);
  
//           this.updateMachineChart();
//           this.updateStockChart();
//           this.changeDetectorRef.detectChanges();
//         }
//       },
//       error: (error) => console.error('❌ Error fetching dashboard data:', error)
//     });
//   }
  
//   updateMachineChart(): void {
//     this.initializeChart('canvasDoughnut', 'doughnut', ['Online', 'Offline'], [this.activeMachines, this.inactiveMachines], ['#4CAF50', '#D32F2F'], 'chartDoughnut');
//   }
//   updateStockChart(): void {
//     console.log('📊 Updating Stock Chart with:', this.okStock, this.lowStock, this.emptyStock);
  
//     this.initializeChart(
//       'canvasStock', 
//       'pie', 
//       ['Full Stock', 'Low Stock', 'Empty Stock'], 
//       [this.okStock, this.lowStock, this.emptyStock], 
//       ['#4CAF50', '#FFC107', '#D32F2F'],
//       'chartStock'
      
//     );
//   }
  
  
//   // initializeChart(canvasId: string, chartType: ChartType, labels: string[], data: number[], colors: string[], chartRef: 'chartDoughnut' | 'chartStock'): void {
//   //   setTimeout(() => {
//   //     const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
//   //     if (!canvas) {
//   //       console.warn(`⚠️ Canvas ID '${canvasId}' not found! Skipping chart initialization.`);
//   //       return;
//   //     }
  
//   //     if (this[chartRef]) {
//   //       this[chartRef].destroy(); // ✅ Destroy only if the chart exists
//   //     }
  
//   //     this[chartRef] = new Chart(canvas, {
//   //       type: chartType,
//   //       data: {
//   //         labels,
//   //         datasets: [{
//   //           data,
//   //           backgroundColor: colors
//   //         }]
//   //       },
//   //       options: {
//   //         responsive: false,
//   //         maintainAspectRatio: false,
//   //         plugins: {
//   //           legend: {
//   //             display: true, // ✅ Ensure the legend is visible
//   //             position: 'bottom', // ✅ Moves legend below the chart
//   //             labels: {
//   //               usePointStyle: true, // ✅ Use round icons instead of squares
//   //               pointStyle: 'circle', // ✅ Makes the indicators round
//   //               padding: 20, // ✅ Adds spacing for better appearance
//   //             }
//   //           }
//   //         }
//   //       }
//   //     });
//   //   }, 500);
//   // }
//   initializeChart(


//     canvasId: string,
//     chartType: ChartType,
//     labels: string[],
//     data: number[],
//     colors: string[],
//     chartRef: 'chartDoughnut' | 'chartStock'
//   ): void {
//     setTimeout(() => {
//       const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  
//       if (!canvas) {
//         console.warn(`⚠️ Canvas ID '${canvasId}' not found! Skipping chart initialization.`);
//         return;
//       }
  
//       // Destroy previous chart if exists
//       if (this[chartRef]) {
//         this[chartRef].destroy();
//       }
  
//       // Reset canvas dimensions manually if responsive is false
//       canvas.width = canvas.offsetWidth;
//       canvas.height = canvas.offsetHeight;
  
//       // Initialize new Chart
//       this[chartRef] = new Chart(canvas, {
//         type: chartType,
//         data: {
//           labels,
//           datasets: [{
//             data,
//             backgroundColor: colors
//           }]
//         },
//         options: {
//           responsive: false,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               display: true,
//               position: 'bottom',
//               labels: {
//                 usePointStyle: true,
//                 pointStyle: 'circle',
//                 padding: 20
//               }
//             }
//           }
//         }
//       });
//     }, 500);
//   }
  
// }  
// src/app/pages/dashboard/widgets/widgets.component.ts

import { Component, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { DashboardRefreshService } from '../../../service/dashboard-refresh.service';
import { ChartType, registerables } from 'chart.js';
import Chart from 'chart.js/auto';

Chart.register(...registerables);

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class WidgetsComponent implements AfterContentInit, OnDestroy {
  // All your existing variables...
  totalMachines = 0;
  activeMachines = 0;
  inactiveMachines = 0;
  napkinsDispensed = 0;
  okStock = 0;
  lowStock = 0;
  emptyStock = 0;
  unknownStock = 0;
  totalCollection = 0;

  chartDoughnut!: Chart;
  chartStock!: Chart;
  merchantId: string | null = null;
  refreshCountdown = 0;
  private refreshInterval = 120; // refresh interval in seconds
  private countdownInterval!: any;
  
  private refreshSubscription!: Subscription;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private dashboardRefreshService: DashboardRefreshService
  ) {}

  ngAfterContentInit(): void {
    this.merchantId = this.commonDataService.merchantId;
    if (this.merchantId) {
      this.fetchDashboardData();
  
      // Start countdown timer
      this.startRefreshCountdown();
  
      this.refreshSubscription = this.dashboardRefreshService.refresh$.subscribe(() => {
        this.fetchDashboardData();
        this.resetRefreshCountdown();
      });
  
    } else {
      console.error('❌ No Merchant ID Found! Redirecting to login...');
    }
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
  
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  
    // Clear countdown interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
  

  fetchDashboardData(): void {
    if (!this.merchantId) return;

    const userDetails = this.commonDataService.userDetails;
    console.log('🔍 Debugging userDetails:', userDetails);

    if (!userDetails) {
      console.error('❌ No User Details Found! API request may be incomplete.');
      return;
    }

    const queryParams: any = {
      merchantId: this.merchantId,
      machineStatus: ['1', '2'],
      stockStatus: ['0', '1', '2'],
      burnStatus: ['1', '2'],
      level1: userDetails.state?.join(',') || '',
      level2: userDetails.district?.join(',') || '',
      level3: userDetails.companyName?.[0]?.ClientId || '',
      machineId: userDetails.machineId?.join(',') || ''
    };

    const apiUrl = `${this.dataService.url1}/getMachineDashboardSummary?${new URLSearchParams(queryParams).toString()}`;
    console.log('📡 Final API URL:', apiUrl);

    this.dataService.getMachineDashboardSummary(queryParams).subscribe({
      next: (response) => {
        console.log('✅ API Response:', response);

        if (response.code === 200 && response.data) {
          const { machinesInstalled = 0, machinesRunning = 0, totalCollection = 0, itemsDispensed = 0, stockEmpty = 0, stockLow = 0 } = response.data;

          this.totalMachines = machinesInstalled;
          this.activeMachines = machinesRunning;
          this.inactiveMachines = machinesInstalled - machinesRunning;
          this.totalCollection = totalCollection;
          this.napkinsDispensed = itemsDispensed;
          this.emptyStock = stockEmpty;
          this.lowStock = stockLow;
          this.okStock = machinesInstalled - (stockEmpty + stockLow);

          this.updateMachineChart();
          this.updateStockChart();
          this.changeDetectorRef.detectChanges();
        }
      },
      error: (error) => console.error('❌ Error fetching dashboard data:', error)
    });
  }

  updateMachineChart(): void {
    this.initializeChart('canvasDoughnut', 'doughnut', ['Online', 'Offline'], [this.activeMachines, this.inactiveMachines], ['#4CAF50', '#D32F2F'], 'chartDoughnut');
  }

  updateStockChart(): void {
    this.initializeChart(
      'canvasStock',
      'pie',
      ['Full Stock', 'Low Stock', 'Empty Stock'],
      [this.okStock, this.lowStock, this.emptyStock],
      ['#4CAF50', '#FFC107', '#D32F2F'],
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
        this[chartRef].destroy();
      }

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

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
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20
              }
            }
          }
        }
      });
    }, 500);
  }
}
