import {
  Component,
  AfterContentInit,
  OnDestroy,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { DashboardRefreshService } from '../../../service/dashboard-refresh.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WidgetsComponent implements AfterContentInit, OnDestroy {
  @ViewChild('machineChart') machineChartRef!: ElementRef;
  @ViewChild('stockChart') stockChartRef!: ElementRef;

  totalMachines = 0;
  activeMachines = 0;
  inactiveMachines = 0;
  napkinsDispensed = 0;
  okStock = 0;
  lowStock = 0;
  emptyStock = 0;
  totalburningcycles = 0;
  totalCollection = 0;

  merchantId: string | null = null;
  refreshCountdown = 0;
  private refreshInterval = 120;
  private countdownInterval!: any;
  private refreshSubscription!: Subscription;

  constructor(
    private router: Router,
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private dashboardRefreshService: DashboardRefreshService
  ) {}

  ngAfterContentInit(): void {

     if(this.commonDataService.merchantId === null || this.commonDataService.merchantId === undefined
      && this.commonDataService.userId === null || this.commonDataService.userId === undefined) {
     
      this.router.navigate(['/login']);
    }

    this.merchantId = this.commonDataService.merchantId;
    if (this.merchantId) {
      this.fetchDashboardData();
      this.startRefreshCountdown();
      this.refreshSubscription =
        this.dashboardRefreshService.refresh$.subscribe(() => {
          this.fetchDashboardData();
          this.resetRefreshCountdown();
        });
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  startRefreshCountdown(): void {
    this.refreshCountdown = this.refreshInterval;
    this.countdownInterval = setInterval(() => {
      this.refreshCountdown--;
      if (this.refreshCountdown <= 0)
        this.refreshCountdown = this.refreshInterval;
    }, 1000);
  }

  resetRefreshCountdown(): void {
    this.refreshCountdown = this.refreshInterval;
  }

  // fetchDashboardData(): void {
  //   debugger;
  //   if (!this.merchantId) return;

  //   const userDetails = this.commonDataService.userDetails;
  //   if (!userDetails) return;

  //   const queryParams: any = {
  //     merchantId: this.merchantId,
  //     machineStatus: ['1', '2'],
  //     stockStatus: ['0', '1', '2'],
  //     burnStatus: ['1', '2'],
  //     level1: userDetails.state?.join(',') || '',
  //     level2: userDetails.district?.join(',') || '',
  //     level3: userDetails.companyName?.[0]?.ClientId || '',
  //     machineId: userDetails.machineId?.join(',') || '',
  //     client: userDetails.clientId,
  //     project: userDetails.projectId,
  //     zone: userDetails.zone?.join(',') || '',
  //     ward: userDetails.ward?.join(',') || '',
  //     beat: userDetails.beat?.join(',') || '',
  //   };

  //   this.dataService.getMachineDashboardSummary(queryParams).subscribe({
  //     next: (response) => {
  //       if (response.code === 200 && response.data) {
  //         const {
  //           machinesInstalled = 0,
  //           machinesRunning = 0,
  //           totalBurningCycles = 0,
  //           totalCollection = 0,
  //           itemsDispensed = 0,
  //           stockEmpty = 0,
  //           stockLow = 0,
  //         } = response.data;

  //         this.totalMachines = machinesInstalled;
  //         this.activeMachines = machinesRunning;
  //         this.inactiveMachines = machinesInstalled - machinesRunning;
  //         this.totalburningcycles = totalBurningCycles;
  //         this.totalCollection = totalCollection;
  //         this.napkinsDispensed = itemsDispensed;
  //         this.emptyStock = stockEmpty;
  //         this.lowStock = stockLow;
  //         this.okStock = machinesInstalled - (stockEmpty + stockLow);

  //         this.updateMachineChart();
  //         this.updateStockChart();
  //       }
  //     },
  //   });
  // }

  fetchDashboardData(): void {
    debugger;
    if (!this.merchantId) return;

    const userDetails = this.commonDataService.userDetails;
    if (!userDetails) return;

    // Extract states, districts, zones, wards, and beats from the nested structure
    const states =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.map((state: { state: any }) => state.state)
      ) || [];

    const districts =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.map(
            (district: { district: any }) => district.district
          )
        )
      ) || [];

    const zones =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.flatMap((district: { zones: any[] }) =>
            district.zones?.map((zone: { zone: any }) => zone.zone)
          )
        )
      ) || [];

    const wards =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.flatMap((district: { zones: any[] }) =>
            district.zones?.flatMap((zone: { wards: any[] }) =>
              zone.wards?.map((ward: { ward: any }) => ward.ward)
            )
          )
        )
      ) || [];

    const beats =
      userDetails.projects?.flatMap((project: { states: any[] }) =>
        project.states?.flatMap((state: { districts: any[] }) =>
          state.districts?.flatMap((district: { zones: any[] }) =>
            district.zones?.flatMap((zone: { wards: any[] }) =>
              zone.wards?.flatMap((ward: { beats: any[] }) =>
                ward.beats?.map((beat: { beat: any }) => beat.beat)
              )
            )
          )
        )
      ) || [];

    const queryParams: any = {
      merchantId: this.merchantId,
      machineStatus: ['1', '2'],
      stockStatus: ['0', '1', '2'],
      burnStatus: ['1', '2'],
      level1: states.join(','),
      level2: districts.join(','),
      level3: userDetails.companyName?.[0]?.ClientId || '',
      machineId: userDetails.machines?.join(',') || '',
      client: userDetails.clientId,
      project: userDetails.projectId,
      zone: zones.join(','),
      ward: wards.join(','),
      beat: beats.join(','),
    };

    this.dataService.getMachineDashboardSummary(queryParams).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          const {
            machinesInstalled = 0,
            machinesRunning = 0,
            totalBurningCycles = 0,
            totalCollection = 0,
            itemsDispensed = 0,
            stockEmpty = 0,
            stockLow = 0,
          } = response.data;

          this.totalMachines = machinesInstalled;
          this.activeMachines = machinesRunning;
          this.inactiveMachines = machinesInstalled - machinesRunning;
          this.totalburningcycles = totalBurningCycles;
          this.totalCollection = totalCollection;
          this.napkinsDispensed = itemsDispensed;
          this.emptyStock = stockEmpty;
          this.lowStock = stockLow;
          this.okStock = machinesInstalled - (stockEmpty + stockLow);

          this.updateMachineChart();
          this.updateStockChart();
        }
      },
    });
  }

  updateMachineChart(): void {
    const data = [
      { label: 'Online', value: this.activeMachines, color: '#4CAF50' },
      { label: 'Offline', value: this.inactiveMachines, color: '#D32F2F' },
    ];
    this.drawD3PieChart(this.machineChartRef.nativeElement, data, 0);
  }

  updateStockChart(): void {
    const data = [
      { label: 'Full Stock', value: this.okStock, color: '#4CAF50' },
      { label: 'Low Stock', value: this.lowStock, color: '#FFC107' },
      { label: 'Empty Stock', value: this.emptyStock, color: '#D32F2F' },
    ];
    this.drawD3PieChart(this.stockChartRef.nativeElement, data, 50);
  }

  drawD3PieChart(
    container: HTMLElement,
    data: { label: string; value: number; color: string }[],
    marginOffset: number // controls donut hole size
  ): void {
    // Clear previous chart
    d3.select(container).selectAll('*').remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2.5;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<any>().value((d: any) => d.value);

    // Main arc for drawing slices
    const arc = d3
      .arc<any>()
      .innerRadius(marginOffset)
      .outerRadius(radius - 15);

    // Outer arc for placing labels outside
    const outerArc = d3
      .arc<any>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Custom arc for reducing the starting point of arrow line
    const labelLineStartArc = d3
      .arc<any>()
      .innerRadius((radius + marginOffset) / 2) // midway between outer and inner
      .outerRadius((radius + marginOffset) / 2);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const pieData = pie(data);

    const arcs = svg.selectAll('arc').data(pieData).enter().append('g');

    // Draw pie slices
    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => d.data.color);

    // Labels and connecting lines
    arcs.each(function (d: any) {
      const group = d3.select(this);
      const percent = total === 0 ? 0 : (d.data.value / total) * 100;

      if (percent <= 0) return;

      const labelText = `${percent.toFixed(1)}%`;

      const centroid = labelLineStartArc.centroid(d); // reduced starting point
      const outerCentroid = outerArc.centroid(d);
      const midAngle = (d.startAngle + d.endAngle) / 2;
      const direction = midAngle < Math.PI ? 1 : -1;

      if (percent > 5) {
        group
          .append('text')
          .attr('transform', `translate(${centroid})`)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .text(labelText)
          .style('font-size', '12px')
          .style('fill', '#000')
          .style('font-weight', 'bold');
      } else {
        const labelPos = [
          outerCentroid[0] + 20 * direction,
          outerCentroid[1] - 20,
        ];

        group
          .append('polyline')
          .attr('points', [centroid, outerCentroid, labelPos].join(' '))
          .attr('stroke', '#000')
          .attr('fill', 'none')
          .attr('stroke-width', 1);

        group
          .append('text')
          .attr('transform', `translate(${labelPos})`)
          .attr('text-anchor', direction === 1 ? 'start' : 'end')
          .attr('alignment-baseline', 'middle')
          .attr('dy', '-0.5em')
          .text(labelText)
          .style('font-size', '12px')
          .style('fill', '#000')
          .style('font-weight', 'bold');
      }
    });

    // Color legend below the chart
    const legend = d3
      .select(container)
      .append('div')
      .attr('class', 'd3-legend')
      .style('display', 'flex')
      .style('justify-content', 'center')
      .style('flex-wrap', 'wrap')
      .style('margin-top', '10px')
      .style('gap', '12px');

    data.forEach((d) => {
      const item = legend
        .append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin', '0 8px');

      item
        .append('div')
        .style('width', '14px')
        .style('height', '14px')
        .style('background-color', d.color)
        .style('margin-right', '6px')
        .style('border-radius', '50%');

      item
        .append('span')
        .text(d.label)
        .style('font-size', '13px')
        .style('color', '#333');
    });
  }
}
