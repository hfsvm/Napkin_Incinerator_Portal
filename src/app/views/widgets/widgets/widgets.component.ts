import {
  Component,
  AfterContentInit,
  OnDestroy,
  ViewEncapsulation,
  ElementRef,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { DashboardRefreshService } from '../../../service/dashboard-refresh.service';

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss'],
  encapsulation: ViewEncapsulation.None
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
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private dashboardRefreshService: DashboardRefreshService
  ) {}

  ngAfterContentInit(): void {
    this.merchantId = this.commonDataService.merchantId;
    if (this.merchantId) {
      this.fetchDashboardData();
      this.startRefreshCountdown();
      this.refreshSubscription = this.dashboardRefreshService.refresh$.subscribe(() => {
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
      if (this.refreshCountdown <= 0) this.refreshCountdown = this.refreshInterval;
    }, 1000);
  }

  resetRefreshCountdown(): void {
    this.refreshCountdown = this.refreshInterval;
  }

  fetchDashboardData(): void {
    if (!this.merchantId) return;

    const userDetails = this.commonDataService.userDetails;
    if (!userDetails) return;

    const queryParams: any = {
      merchantId: this.merchantId,
      machineStatus: ['1', '2'],
      stockStatus: ['0', '1', '2'],
      burnStatus: ['1', '2'],
      level1: userDetails.state?.join(',') || '',
      level2: userDetails.district?.join(',') || '',
      level3: userDetails.companyName?.[0]?.ClientId || '',
      machineId: userDetails.machineId?.join(',') || '',
      client: userDetails.clientId,
      project: userDetails.projectId
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
            stockLow = 0
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
      }
    });
  }

  updateMachineChart(): void {
    const data = [
      { label: 'Online', value: this.activeMachines, color: '#4CAF50' },
      { label: 'Offline', value: this.inactiveMachines, color: '#D32F2F' }
    ];
    this.drawD3PieChart(this.machineChartRef.nativeElement, data,0);
  }

  updateStockChart(): void {
    const data = [
      { label: 'Full Stock', value: this.okStock, color: '#4CAF50' },
      { label: 'Low Stock', value: this.lowStock, color: '#FFC107' },
      { label: 'Empty Stock', value: this.emptyStock, color: '#D32F2F' }
    ];
    this.drawD3PieChart(this.stockChartRef.nativeElement, data,50);
  }

 drawD3PieChart(
  container: HTMLElement,
  data: { label: string; value: number; color: string }[],
  innerRadius: number = 0 // default 0 for full pie
): void {
  // Clear container
  d3.select(container).selectAll('*').remove();

  // Ensure container has relative position
  d3.select(container).style('position', 'relative');

  const width = 300;
  const height = 230;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block')
    .style('margin', '0 auto')
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie<any>()
    .value(d => d.value)
    .sort(null);

  const arc = d3.arc<any>()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  const arcs = svg.selectAll('arc')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc');

  const tooltip = d3.select(container)
    .append('div')
    .style('position', 'absolute')
    .style('z-index', '1000')
    .style('background', 'rgba(0,0,0,0.7)')
    .style('color', '#fff')
    .style('padding', '4px 8px')
    .style('border-radius', '4px')
    .style('pointer-events', 'none')
    .style('font-size', '12px')
    .style('display', 'none');

  // Draw pie slices with tooltip behavior
  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .on('mouseover', function (event, d) {
      tooltip
        .style('display', 'block')
        .html(`<strong>${d.data.label}</strong>: ${d.data.value}`);
    })
    .on('mousemove', function (event) {
      const bounds = container.getBoundingClientRect();
      tooltip
        .style('left', `${event.clientX - bounds.left + 10}px`)
        .style('top', `${event.clientY - bounds.top - 28}px`);
    })
    .on('mouseout', function () {
      tooltip.style('display', 'none');
    });

  // Add percentage text inside slices
  const total = d3.sum(data, d => d.value);

  arcs.append('text')
  .attr('transform', d => `translate(${arc.centroid(d)})`)
  .attr('text-anchor', 'middle')
  .attr('dy', '0.35em')
  .style('font-size', '12px')
  .style('fill', '#fff')
  .text(d => {
    const percent = total === 0 ? 0 : (d.data.value / total) * 100;
    return percent > 0 ? `${percent.toFixed(1)}%` : null; // 👈 Only show if > 0
  });


  // Draw legend
  const legend = d3.select(container)
    .append('div')
    .attr('class', 'd3-legend')
    .style('display', 'flex')
    .style('justify-content', 'center')
    .style('flex-wrap', 'wrap')
    .style('margin-top', '15px');

  data.forEach(d => {
    const item = legend.append('div')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('margin', '0 10px');


      item.append('div')
  .style('width', '14px')
  .style('height', '14px')
  .style('background-color', d.color)
  .style('margin-right', '6px')
  .style('border-radius', '50%');  // ← Circle

    item.append('span')
      .text(d.label)
      .style('font-size', '13px')
      .style('color', '#333');
  });
}






}
