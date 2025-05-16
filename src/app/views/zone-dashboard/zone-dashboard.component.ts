import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { Location } from '@angular/common';
import * as maplibregl from 'maplibre-gl';
import { interval, Subscription, timer } from 'rxjs';

interface DonutChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-zone-dashboard',
  templateUrl: './zone-dashboard.component.html',
  styleUrls: ['./zone-dashboard.component.scss']
})
export class ZoneDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];
  private refreshSubscription!: Subscription;
  private zoneMarker: any;

  // Timer properties
  private refreshIntervalMs = 120000; // 2 minutes in milliseconds
timeUntilRefresh = this.refreshIntervalMs / 1000; // in seconds
timerDisplay = '02:00';
private timerSubscription!: Subscription;
  selectedMapView: string = 'machine';
  dashboardData: any = {};
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  showNoDataMessage = false;

  burnStatus = '1,2';
  stockStatus = '0,1,2';
  machineStatus = '0,1,2';

  beat = '';
  client = '';
  district = '';
  machineId = '';
  merchantId: string = '';
  project = '';
  state = '';
  ward = '';
  zone = '';

  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('stockChart') stockChartRef!: ElementRef;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private commonDataService: CommonDataService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.merchantId = this.commonDataService.merchantId ?? '';

    this.route.queryParams.subscribe(params => {
      if (params['zone']) {
        this.zone = params['zone'];
        console.log('Zone received:', this.zone);
      }
    });

      this.fetchDashboardData();
  this.setupAutoRefresh();
  this.startCountdownTimer(); // Initialize the timer

    
    // Set up auto-refresh every 2 minutes
    // this.refreshSubscription = interval(120000).subscribe(() => {
    //   console.log('Auto-refreshing dashboard data...');
    //   this.fetchDashboardData();
    // });
  }

  ngOnDestroy1(): void {
    // Clean up subscriptions
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    
    // Clean up map resources
    if (this.map) {
      this.map.remove();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeMap();
    });
  }

  private startCountdownTimer(): void {
  // Clear any existing timer
  if (this.timerSubscription) {
    this.timerSubscription.unsubscribe();
  }

  // Reset the timer
  this.timeUntilRefresh = this.refreshIntervalMs / 1000;
  this.updateTimerDisplay();

  // Start new timer
  this.timerSubscription = timer(0, 1000).subscribe(() => {
    this.timeUntilRefresh--;
    this.updateTimerDisplay();

    // When timer reaches 0, reset it and trigger refresh
    if (this.timeUntilRefresh <= 0) {
      this.timeUntilRefresh = this.refreshIntervalMs / 1000;
      this.fetchDashboardData(); // Trigger refresh
    }
  });
}

private updateTimerDisplay(): void {
  const minutes = Math.floor(this.timeUntilRefresh / 60);
  const seconds = Math.floor(this.timeUntilRefresh % 60);
  this.timerDisplay = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update your ngOnDestroy
ngOnDestroy(): void {
  if (this.refreshSubscription) {
    this.refreshSubscription.unsubscribe();
  }
  if (this.timerSubscription) {
    this.timerSubscription.unsubscribe();
  }
  if (this.map) {
    this.map.remove();
  }
}

  private setupAutoRefresh(): void {
    // Set up data refresh
    this.refreshSubscription = interval(this.refreshIntervalMs).subscribe(() => {
      console.log('Auto-refreshing dashboard data...');
      this.fetchDashboardData();
    });

    // Set up countdown timer
    this.startCountdownTimer();
  }

  private startCountdownTimer1(): void {
    this.timeUntilRefresh = this.refreshIntervalMs / 1000;
    this.updateTimerDisplay();

    this.timerSubscription = timer(1000, 1000).subscribe(() => {
      this.timeUntilRefresh--;
      this.updateTimerDisplay();

      if (this.timeUntilRefresh <= 0) {
        this.timeUntilRefresh = this.refreshIntervalMs / 1000;
      }
    });
  }

  private updateTimerDisplay1(): void {
    const minutes = Math.floor(this.timeUntilRefresh / 60);
    const seconds = this.timeUntilRefresh % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private cleanupSubscriptions(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private cleanupMap(): void {
    if (this.map) {
      this.map.remove();
    }
  }


  fetchDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;
    const merchantId = this.commonDataService.merchantId ?? '';

    const queryParams: any = {
      merchantId,
      burnStatus: this.burnStatus,
      machineStatus: this.machineStatus,
      stockStatus: this.stockStatus,
    };
    if (this.zone) queryParams.zone = this.zone;
    if (this.beat) queryParams.beat = this.beat;
    if (this.client) queryParams.client = this.client;
    if (this.district) queryParams.district = this.district;
    if (this.machineId) queryParams.machineId = this.machineId;
    if (this.project) queryParams.project = this.project;
    if (this.state) queryParams.state = this.state;
    if (this.ward) queryParams.ward = this.ward;

    this.dataService.getMachineDashboardSummary(queryParams).subscribe({
      next: (response: any) => {
        console.log('✅ API Response:', response);
  
        if (response?.code === 200 && response.data) {
          this.dashboardData = response.data;

          if (this.dashboardData.machines?.length === 0) {
            alert('This zone has no data currently');
            return;
          }
    
          if (this.map) {
            this.updateMap();
          }

          console.log('Dashboard data loaded:', this.dashboardData);
          this.renderCharts();
        } else {
          this.hasError = true;
          this.errorMessage = 'Invalid response format';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching dashboard data:', error);
        this.hasError = true;
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  changeZone(zone: string): void {
    this.zone = zone;
    this.fetchDashboardData();
  }

  changeMapView(viewType: string): void {
    console.log(`Changing map view to: ${viewType}`);
    this.selectedMapView = viewType;
    this.updateMap();
  }

  // Map Related Methods
  initializeMap(): void {
    console.log('🗺️ Initializing map...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map container element not found, will retry...');
      setTimeout(() => this.initializeMap(), 100);
      return;
    }

    if (this.map) {
      console.log('Map already initialized, resizing...');
      this.map.resize();
      return;
    }

    try {
      this.map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
        center: [72.8777, 19.0760],
        zoom: 11
      });

      this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      this.map.on('load', () => {
        console.log('Map loaded successfully');
        this.map.resize();
        
        if (this.dashboardData?.machines?.length) {
          this.updateMap();
        }
      });

      this.map.on('error', (e) => {
        console.error('Map error:', e);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  updateMap(): void {
    console.log(`🔄 updateMap() called! Current view: ${this.selectedMapView}`);
    
    if (!this.map) {
      console.warn('Map not initialized, cannot update view');
      return;
    }
    
    if (!this.map.loaded()) {
      console.log('Map not fully loaded, waiting...');
      this.map.once('load', () => {
        this.processMapUpdate();
      });
    } else {
      this.processMapUpdate();
    }
  }

  private processMapUpdate(): void {
    this.clearAllMarkers();
    
    if (!this.dashboardData?.machines?.length) {
      console.warn('No machine data available for map');
      return;
    }
    
    switch (this.selectedMapView) {
      case 'zone':
        this.displayZoneView();
        break;
      case 'ward':
        this.displayWardView();
        break;
      case 'beat':
        this.displayBeatView();
        break;
      default:
        this.displayMachineView();
        break;
    }
  }

  private clearAllMarkers(): void {
    if (this.zoneMarker) {
      this.zoneMarker.remove();
      this.zoneMarker = null;
    }
    
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  private displayZoneView(): void {
    console.log("📊 Displaying Zone View");
    
    const zoneSpecificMachines = this.dashboardData.machines.filter(
      (machine: { zone: string; }) => machine.zone === this.zone
    );
    
    console.log(`Found ${zoneSpecificMachines.length} machines for zone: ${this.zone}`);
    
    const machineToUse = zoneSpecificMachines.length > 0
      ? zoneSpecificMachines[0]
      : this.dashboardData.machines[0];
    
    const { zonelatitude: lat, zonelongitude: lng, zone } = machineToUse;
    
    if (!lat || !lng) {
      console.warn(`Zone coordinates missing for zone: ${this.zone}`);
      return;
    }
    
    this.map.setCenter([lng, lat]);
    this.map.setZoom(11);
    
    const markerEl = document.createElement('div');
    markerEl.textContent = `${zone}`;
    markerEl.style.backgroundColor = '#4CAF50';
    markerEl.style.color = '#fff';
    markerEl.style.padding = '8px 12px';
    markerEl.style.borderRadius = '4px';
    markerEl.style.fontWeight = 'bold';
    markerEl.style.textAlign = 'center';
    markerEl.style.minWidth = '80px';
    markerEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    markerEl.style.cursor = 'pointer';
    
    const installedMachines = zoneSpecificMachines.length;
    const runningMachines = zoneSpecificMachines.filter((m: { status: string; }) => m.status === 'Online').length;
    const totalCollection = zoneSpecificMachines.reduce((sum: any, m: { collection: any; }) => sum + (m.collection || 0), 0);
    const itemsDispensed = zoneSpecificMachines.reduce((sum: any, m: { itemsDispensed: any; }) => sum + (m.itemsDispensed || 0), 0);
    
    const stockLow = zoneSpecificMachines.filter((m: { stockStatus: any; }) =>
      this.getStockStatusNumber(m.stockStatus) === 1
    ).length;
    
    const stockEmpty = zoneSpecificMachines.filter((m: { stockStatus: any; }) =>
      this.getStockStatusNumber(m.stockStatus) === 0
    ).length;
    
    const stockOkay = zoneSpecificMachines.filter((m: { stockStatus: any; }) =>
      this.getStockStatusNumber(m.stockStatus) === 2
    ).length;
    
    const popupHTML = `
      <div class="zone-popup">
        <h4>Zone: ${zone}</h4>
        <div class="zone-stats">
          <div><strong>Machines Installed:</strong> ${installedMachines}</div>
          <div><strong>Machines Running:</strong> ${runningMachines}</div>
          <div><strong>Total Collection:</strong> ₹${totalCollection}</div>
          <div><strong>Items Dispensed:</strong> ${itemsDispensed}</div>
          <div><strong>Stock Empty:</strong> ${stockEmpty}</div>
          <div><strong>Stock Low:</strong> ${stockLow}</div>
          <div><strong>Stock Okay:</strong> ${stockOkay}</div>
        </div>
      </div>
    `;
    
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
      maxWidth: '300px'
    }).setHTML(popupHTML);
    
    this.zoneMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map);
    
    console.log(`📍 Custom zone marker added for ${zone} at [${lng}, ${lat}]`);
  }
  
  private displayWardView(): void {
    console.log("📊 Displaying Ward View");
    
    const uniqueWards = new Set();
    this.dashboardData.machines.forEach((machine: any) => {
      if (machine.ward && machine.wardlatitude && machine.wardlongitude) {
        uniqueWards.add(machine.ward);
      }
    });
    
    console.log(`Found ${uniqueWards.size} unique wards`);
    
    const firstMachine = this.dashboardData.machines[0];
    if (firstMachine.zonelatitude && firstMachine.zonelongitude) {
      this.map.setCenter([firstMachine.zonelongitude, firstMachine.zonelatitude]);
      this.map.setZoom(11);
    }
    
    uniqueWards.forEach(wardName => {
      const wardMachine = this.dashboardData.machines.find(
        (m: any) => m.ward === wardName
      );
      
      if (!wardMachine || !wardMachine.wardlatitude || !wardMachine.wardlongitude) {
        console.warn(`Ward coordinates missing for ward: ${wardName}`);
        return;
      }
      
      const lat = wardMachine.wardlatitude;
      const lng = wardMachine.wardlongitude;
      
      const markerEl = document.createElement('div');
      markerEl.textContent = `Ward: ${wardName}`;
      markerEl.style.backgroundColor = '#2196F3';
      markerEl.style.color = 'white';
      markerEl.style.padding = '8px 12px';
      markerEl.style.borderRadius = '4px';
      markerEl.style.fontWeight = 'bold';
      markerEl.style.textAlign = 'center';
      markerEl.style.minWidth = '80px';
      markerEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      
      const wardMachines = this.dashboardData.machines.filter(
        (m: any) => m.ward === wardName
      );
      
      const installedMachines = wardMachines.length;
      const runningMachines = wardMachines.filter((m: { status: string; }) => m.status === 'Online').length;
      const totalCollection = wardMachines.reduce((sum: any, m: { collection: any; }) => sum + (m.collection || 0), 0);
      const itemsDispensed = wardMachines.reduce((sum: any, m: { itemsDispensed: any; }) => sum + (m.itemsDispensed || 0), 0);
      
      const stockLow = wardMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 1
      ).length;
      
      const stockEmpty = wardMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 0
      ).length;
      
      const stockOkay = wardMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 2
      ).length;
      
      const popupHTML = `
        <div class="ward-popup">
          <h4>Ward: ${wardName}</h4>
          <div class="ward-stats">
            <div><strong>Machines Installed:</strong> ${installedMachines}</div>
            <div><strong>Machines Running:</strong> ${runningMachines}</div>
            <div><strong>Total Collection:</strong> ₹${totalCollection}</div>
            <div><strong>Items Dispensed:</strong> ${itemsDispensed}</div>
            <div><strong>Stock Empty:</strong> ${stockEmpty}</div>
            <div><strong>Stock Low:</strong> ${stockLow}</div>
            <div><strong>Stock Okay:</strong> ${stockOkay}</div>
          </div>
        </div>
      `;
      
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true,
        maxWidth: '300px'
      }).setHTML(popupHTML);
      
      const newMarker = new maplibregl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);
      
      this.markers.push(newMarker);
    });
  }
  
  private displayBeatView(): void {
    console.log("📊 Displaying Beat View");
    
    const uniqueBeats = new Set();
    this.dashboardData.machines.forEach((machine: any) => {
      if (machine.beat && (machine.beatlatitude || machine.latitude) && 
          (machine.beatlongitude || machine.longitude)) {
        uniqueBeats.add(machine.beat);
      }
    });
    
    console.log(`Found ${uniqueBeats.size} unique beats`);
    
    const firstMachine = this.dashboardData.machines[0];
    if (firstMachine.zonelatitude && firstMachine.zonelongitude) {
      this.map.setCenter([firstMachine.zonelongitude, firstMachine.zonelatitude]);
      this.map.setZoom(11);
    }
    
    uniqueBeats.forEach(beatName => {
      const beatMachines = this.dashboardData.machines.filter(
        (m: any) => m.beat === beatName
      );
      
      if (beatMachines.length === 0) {
        return;
      }
      
      const beatMachine = beatMachines.find(
        (m: any) => m.beatlatitude && m.beatlongitude && 
                  m.beatlatitude !== 0 && m.beatlongitude !== 0
      );
      
      let lat, lng;
      
      if (beatMachine && beatMachine.beatlatitude && beatMachine.beatlongitude &&
          beatMachine.beatlatitude !== 0 && beatMachine.beatlongitude !== 0) {
        lat = beatMachine.beatlatitude;
        lng = beatMachine.beatlongitude;
      } else {
        const firstBeatMachine = beatMachines[0];
        lat = firstBeatMachine.latitude;
        lng = firstBeatMachine.longitude;
      }
      
      if (!lat || !lng || lat === 0 || lng === 0) {
        console.warn(`Beat coordinates missing for beat: ${beatName}`);
        return;
      }
      
      const markerEl = document.createElement('div');
      markerEl.textContent = `Beat: ${beatName}`;
      markerEl.style.backgroundColor = '#FF9800';
      markerEl.style.color = 'white';
      markerEl.style.padding = '8px 12px';
      markerEl.style.borderRadius = '4px';
      markerEl.style.fontWeight = 'bold';
      markerEl.style.textAlign = 'center';
      markerEl.style.minWidth = '80px';
      markerEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      
      const installedMachines = beatMachines.length;
      const runningMachines = beatMachines.filter((m: { status: string; }) => m.status === 'Online').length;
      const totalCollection = beatMachines.reduce((sum: any, m: { collection: any; }) => sum + (m.collection || 0), 0);
      const itemsDispensed = beatMachines.reduce((sum: any, m: { itemsDispensed: any; }) => sum + (m.itemsDispensed || 0), 0);
      
      const stockLow = beatMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 1
      ).length;
      
      const stockEmpty = beatMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 0
      ).length;
      
      const stockOkay = beatMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 2
      ).length;
      
      const popupHTML = `
        <div class="beat-popup">
          <h4>Beat: ${beatName}</h4>
          <div class="beat-stats">
            <div><strong>Machines Installed:</strong> ${installedMachines}</div>
            <div><strong>Machines Running:</strong> ${runningMachines}</div>
            <div><strong>Total Collection:</strong> ₹${totalCollection}</div>
            <div><strong>Items Dispensed:</strong> ${itemsDispensed}</div>
            <div><strong>Stock Empty:</strong> ${stockEmpty}</div>
            <div><strong>Stock Low:</strong> ${stockLow}</div>
            <div><strong>Stock Okay:</strong> ${stockOkay}</div>
          </div>
        </div>
      `;
      
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true,
        maxWidth: '300px'
      }).setHTML(popupHTML);
      
      const newMarker = new maplibregl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);
      
      this.markers.push(newMarker);
    });
  }
  
  private displayMachineView(): void {
    console.log("🔍 Displaying Machine View");
    
    const firstMachine = this.dashboardData.machines[0];
    if (firstMachine.zonelatitude && firstMachine.zonelongitude) {
      this.map.setCenter([firstMachine.zonelongitude, firstMachine.zonelatitude]);
      this.map.setZoom(11);
    }
    
    const locationMap = new Map<string, number>();
    
    this.dashboardData.machines.forEach((machine: { latitude: any; longitude: any; machineId: any; stockStatus: any; }) => {
      if (!machine.latitude || !machine.longitude) {
        console.warn(`Machine ${machine.machineId} has no location data`);
        return;
      }

      let lng = Number(machine.longitude);
      let lat = Number(machine.latitude);
       
      if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
        console.warn(`Machine ${machine.machineId} has invalid coordinates`);
        return;
      }

      const key = `${lng},${lat}`;

      if (locationMap.has(key)) {
        const count = locationMap.get(key)! + 1;
        locationMap.set(key, count);

        const angle = (count * 45) * (Math.PI / 180);
        const radius = 0.000001 * count;
        lng += radius * Math.cos(angle);
        lat += radius * Math.sin(angle);
      } else {
        locationMap.set(key, 1);
      }

      let stockStatusNumber = this.getStockStatusNumber(machine.stockStatus);
      console.log(`Machine ${machine.machineId} processed stockStatus:`, stockStatusNumber);

      const iconUrl = this.getStockStatusIcon(stockStatusNumber);
      console.log(`Using icon: ${iconUrl} for status: ${stockStatusNumber}`);

      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.backgroundImage = `url(${iconUrl})`;
      markerElement.style.width = '40px';
      markerElement.style.height = '40px';
      markerElement.style.backgroundSize = 'contain';
      markerElement.style.backgroundRepeat = 'no-repeat';

      markerElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.map.flyTo({
          center: [lng, lat] as [number, number],
          zoom: 15,
          speed: 5,
          curve: 1,
          easing(t) {
            return t;
          }
        });
      });

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true
      }).setHTML(this.generatePopupHTML(machine));

      const newMarker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);

      this.markers.push(newMarker);
    });
  }

  // Chart Related Methods
  renderCharts(): void {
    if (this.statusChartRef && this.statusChartRef.nativeElement) {
      d3.select(this.statusChartRef.nativeElement).selectAll('*').remove();
    }
    if (this.stockChartRef && this.stockChartRef.nativeElement) {
      d3.select(this.stockChartRef.nativeElement).selectAll('*').remove();
    } 

    this.renderDonutChart({
      element: this.statusChartRef.nativeElement,
      data: this.prepareStatusChartData(),
      colors: ['#4CAF50', '#F44336']
    });

    this.renderDonutChart({
      element: this.stockChartRef.nativeElement,
      data: this.prepareStockChartData(),
      colors: ['#4CAF50', '#FFC107', '#F44336', '#9E9E9E']
    });
  }

  prepareStatusChartData(): DonutChartData[] {
    const online = this.dashboardData.machinesRunning || 0;
    const offline = (this.dashboardData.machinesInstalled || 0) - online;
    return [
      { name: 'Online', value: online },
      { name: 'Offline', value: offline }
    ];
  }

  prepareStockChartData(): DonutChartData[] {
    const stockOk = this.dashboardData.stockOk || 0;
    const stockLow = this.dashboardData.stockLow || 0;
    const stockEmpty = this.dashboardData.stockEmpty || 0;
    const totalStock = stockOk + stockLow + stockEmpty;
    const stockUnknown = (this.dashboardData.machinesInstalled || 0) - totalStock;
    
    return [
      { name: 'Ok', value: stockOk },
      { name: 'Low', value: stockLow },
      { name: 'Empty', value: stockEmpty },
      { name: 'Unknown', value: stockUnknown > 0 ? stockUnknown : 0 }
    ];
  }

  renderDonutChart(options: { element: any, data: DonutChartData[], colors: string[] }): void {
    const { element, data, colors } = options;
    
    if (!element || !data || data.length === 0) return;
    
    const width = 150;
    const height = 150;
    const radius = Math.min(width, height) / 2;
    
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(colors);
    
    const pie = d3.pie<DonutChartData>()
      .sort(null)
      .value(d => d.value);
    
    const pieData = pie(data);
    
    const arc = d3.arc<d3.PieArcDatum<DonutChartData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);
    
    svg.selectAll('pieces')
      .data(pieData)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d) { 
        return color(d.data.name); 
      })
      .attr('stroke', '#fff')
      .style('stroke-width', '1px');
  }

  // Helper Methods
  getStockStatusNumber(stockStatus: any): number {
    if (typeof stockStatus === 'number') {
      return stockStatus;
    }
    
    if (typeof stockStatus === 'string') {
      const parsedNumber = parseInt(stockStatus);
      if (!isNaN(parsedNumber)) {
        return parsedNumber;
      }
      
      if (stockStatus.toLowerCase() === 'ok' || stockStatus.toLowerCase() === 'okay') return 2;
      if (stockStatus.toLowerCase() === 'low stock') return 1;
      if (stockStatus.toLowerCase() === 'empty' || stockStatus.toLowerCase() === 'no stock') return 0;
    }
    
    if (Array.isArray(stockStatus)) {
      if (stockStatus.some(s => 
          s.SpringStatus?.toLowerCase() === 'empty' || 
          s.SpringStatus?.toLowerCase() === 'no stock')) {
        return 0;
      }
      
      if (stockStatus.some(s => s.SpringStatus?.toLowerCase() === 'low stock')) {
        return 1;
      }
      
      if (stockStatus.some(s => s.SpringStatus?.toLowerCase() === 'ok')) {
        return 2;
      }
    }
    
    console.log("Could not determine stock status, using default");
    return -1;
  }

  getStockStatusIcon(status: number): string { 
    console.log("Getting icon for status:", status);
    switch (status) {
      case 2: return './assets/img/icon/green2.png';
      case 1: return './assets/img/icon/yellow2.png';
      case 0: return './assets/img/icon/red2.png';
      default: 
        console.log("Using default icon for status:", status);
        return './assets/img/icon/pad1.png';
    }
  }

  generatePopupHTML(machine: any): string {
    let stockStatusText = 'Unknown';
    
    if (Array.isArray(machine.stockStatus)) {
      const statuses = machine.stockStatus.map((s: { SpringName: any; SpringStatus: any; }) => 
        `${s.SpringName}: ${s.SpringStatus}`).join(', ');
      stockStatusText = statuses || 'Unknown';
    } else {
      switch (this.getStockStatusNumber(machine.stockStatus)) {
        case 0: stockStatusText = 'Empty/No Stock'; break;
        case 1: stockStatusText = 'Low'; break;
        case 2: stockStatusText = 'Full'; break;
      }
    }

    let burningStatusText = machine.burningStatus || 'Unknown';

    return `
      <div style="position: relative; padding: 5px; background: white;">
        <button class="custom-close-btn" data-machine-id="${machine.machineId}" 
                style="position: absolute; top: 0px; right: 0px; background: #fff; border: 1px solid #ccc; 
                       width: 24px; height: 24px; border-radius: 10%; cursor: pointer; 
                       display: flex; align-items: center; justify-content: center; font-size: 16px;">
          ×
        </button>

        <h3 style="margin: 0 0 8px 0;">📍 Vending Machine</h3>
        <p><strong>Machine ID:</strong> ${machine.machineId}</p>
        <p><strong>State:</strong> ${machine.level1 || 'N/A'}</p>
        <p><strong>District:</strong> ${machine.level2 || 'N/A'}</p>
        <p><strong>Zone:</strong> ${machine.zone || 'N/A'}</p>
        <p><strong>Ward:</strong> ${machine.ward || 'N/A'}</p>
        <p><strong>Beat:</strong> ${machine.beat || 'N/A'}</p>
        <p><strong>Status:</strong> ${machine.status || 'N/A'}</p>
        <p><strong>Stock Status:</strong> ${stockStatusText}</p>
        <p><strong>Burning Status:</strong> ${burningStatusText}</p>
        <p><strong>Total Collection:</strong> ₹${machine.collection || 0}</p>
        <p><strong>Items Dispensed:</strong> ${machine.itemsDispensed || 0}</p>
        <p><strong>Address:</strong> ${machine.address || 'N/A'}</p>
      </div>`;
  }
}