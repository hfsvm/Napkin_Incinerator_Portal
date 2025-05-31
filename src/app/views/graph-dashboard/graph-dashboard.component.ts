import { Component, OnInit, AfterViewInit, ViewChild, ElementRef,QueryList } from '@angular/core';
import * as d3 from 'd3';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { Location } from '@angular/common';
import { ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, timer } from 'rxjs';
import * as maplibregl from 'maplibre-gl';


interface DonutChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-zone-dashboard',
  templateUrl: './graph-dashboard.component.html',
  styleUrls: ['./graph-dashboard.component.scss'],

    styles: [`
    /* Remove default MapLibre popup background and styling */
    ::ng-deep .custom-machine-popup .maplibregl-popup-content,
    ::ng-deep .custom-aggregated-popup .maplibregl-popup-content {
      background: transparent !important;
      padding: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }

    ::ng-deep .custom-machine-popup .maplibregl-popup-tip,
    ::ng-deep .custom-aggregated-popup .maplibregl-popup-tip {
      display: none !important;
    }

    ::ng-deep .custom-machine-popup .maplibregl-popup-content > div,
    ::ng-deep .custom-aggregated-popup .maplibregl-popup-content > div {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
  `]

})
export class GraphDashboardComponent implements OnInit,AfterViewInit {

  private refreshIntervalMs = 120000; // 2 minutes in milliseconds
  timeUntilRefresh = this.refreshIntervalMs / 1000; // in seconds
  timerDisplay = '02:00';
  private refreshSubscription!: Subscription;
  private timerSubscription!: Subscription;

  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];
    private mapInitialized = false;


  goBack(): void {
    this.location.back(); // Navigates to previous page
  }

  // Dashboard summary data
  dashboardData: any = {};
  
  // Loading state
  isLoading: boolean = false;
  
  // Error state
  hasError: boolean = false;
  errorMessage: string = '';

  burnStatus = '1,2';
  stockStatus = '0,1,2';
  machineStatus = '0,1,2';
  allZonesDashboardData: { zone: string, data: any }[] = [];
  zoneSummaries: any[] = [];
  chartContainers: any[] = [];

  beat = '';
  client = '';
  district = '';
  machineId = '';
  merchantId: string = '';
  project = '';
  state = '';
  ward = '';
  // zone = '';
  zone:any;

  zoneMarker: any;

zonesArray: any[] = [];

  showNoDataMessage = false;



  selectedMapView: string = 'machine'; // Default view type
machines: any[] = []; // Will store machine data


  // Chart references
  // @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('stockChart') stockChartRef!: ElementRef;
// @ViewChild('statusChart') statusChartRefs!: QueryList<ElementRef>;
@ViewChildren('statusChart') statusChartRef!: QueryList<ElementRef>;
@ViewChild('map') mapElementRef!: ElementRef;


  // @ViewChild('statusChart') statusChartRef!: QueryList<ElementRef>;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private commonDataService: CommonDataService,
    private location: Location
  ) { }


  
  
  
// ngAfterViewInit(): void {
//   this.initializeMap();
// }



    ngAfterViewInit(): void {
    // Initialize map after the view has been initialized
    setTimeout(() => {
      this.initializeMap();
    }, 100); // Small delay to ensure DOM is ready
  }


  


  getDashboardDataForZones1(zones: string[]): void {
    debugger;
    this.zoneSummaries = [];
    zones.forEach(zone => {
      const queryParams: any = {
        
        merchantId: this.merchantId,
        burnStatus: "1,2",
        machineStatus: "0,1,2",
        stockStatus: "0,1,2",
        zone: zone
      };
  
      this.dataService.getMachineDashboardSummary(queryParams).subscribe({
        next: (response: any) => {
          console.log(`✅ Response for ${zone}:`, response);
  
          if (response?.code === 200 && response.data) {
            const dashboardData = response.data;
            const data = response.data;

  
            // if (dashboardData.machines?.length === 0) {
            //   alert(`Zone "${zone}" has no data currently`);
            //   return;
            // }
  
            // Do something with dashboardData (e.g., push to an array)

            this.allZonesDashboardData.push({ zone, data: response.data });
            const zoneSummary = {
              zone: zone,
              online: data.machinesRunning || 0,
              offline: (data.machinesInstalled || 0) - (data.machinesRunning || 0),
              totalMachines: data.machinesInstalled || 0
            };

            this.zoneSummaries.push(zoneSummary);
            console.log('✅ Zone summary:', zoneSummary);
            console.log('✅ Zone:', this.zoneSummaries);

  console.log('this.allZonesDashboardData',this.allZonesDashboardData);
   if (this.zoneSummaries.length === zones.length) {
            this.renderCharts();
          }
     
            // if (this.map) {
            //   this.updateMap(); // Update map per zone if needed
            // }
  
            // this.renderCharts();
          } else {
            console.error(`Invalid response for zone ${zone}`);
          }
        },
        error: (error: any) => {
          console.error(`Error fetching data for zone ${zone}:`, error);
        }
      });
    });
  }
  
ngOnInit(): void {
    debugger;
    this.merchantId = this.commonDataService.merchantId ?? '';

    this.route.queryParams.subscribe(params => {
      if (params['zone']) {
        const zonesArray = JSON.parse(params['zone']);
        this.zone = zonesArray;
        console.log('Zone received:', this.zone);

        this.getDashboardDataForZones(this.zone);
        this.setupViewSelectionHandlers();
        this.fetchMachineDashboardData();
        this.selectedMapView = 'machine';
      }
    });

    // Set up auto-refresh
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
    // ... (keep existing cleanup code)
  }

  private setupAutoRefresh(): void {
    // Clear any existing subscriptions
    this.cleanupSubscriptions();

    // Set up data refresh every 2 minutes
    this.refreshSubscription = interval(this.refreshIntervalMs).subscribe(() => {
      console.log('Auto-refreshing dashboard data...');
      if (this.zone) {
        this.getDashboardDataForZones(this.zone);
        this.fetchMachineDashboardData();
      }
    });

    // Start countdown timer
    this.startCountdownTimer();
  }

  private startCountdownTimer(): void {
    // Reset timer
    this.timeUntilRefresh = this.refreshIntervalMs / 1000;
    this.updateTimerDisplay();

    // Update timer every second
    this.timerSubscription = timer(0, 1000).subscribe(() => {
      this.timeUntilRefresh--;
      this.updateTimerDisplay();

      // When timer reaches 0, trigger refresh and reset
      if (this.timeUntilRefresh <= 0) {
        this.timeUntilRefresh = this.refreshIntervalMs / 1000;
        if (this.zone) {
          this.getDashboardDataForZones(this.zone);
          this.fetchMachineDashboardData();
        }
      }
    });
  }

  private updateTimerDisplay(): void {
    const minutes = Math.floor(this.timeUntilRefresh / 60);
    const seconds = Math.floor(this.timeUntilRefresh % 60);
    this.timerDisplay = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private cleanupSubscriptions(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }


  getDashboardDataForZones(zones: string[]): void {
    this.isLoading = true;
    this.zoneSummaries = [];
    
    zones.forEach(zone => {
      const queryParams: any = {
        merchantId: this.merchantId,
        burnStatus: "1,2",
        machineStatus: "0,1,2",
        stockStatus: "0,1,2",
        zone: zone
      };
  
      this.dataService.getMachineDashboardSummary(queryParams).subscribe({
        next: (response: any) => {
          console.log(`✅ Response for ${zone}:`, response);
          this.isLoading = false;
  
          if (response?.code === 200 && response.data) {
            const data = response.data;
  
            this.allZonesDashboardData.push({ zone, data: response.data });
            const zoneSummary = {
              zone: zone,
              online: data.machinesRunning || 0,
              offline: (data.machinesInstalled || 0) - (data.machinesRunning || 0),
              totalMachines: data.machinesInstalled || 0
            };

            this.zoneSummaries.push(zoneSummary);
            
            // Save data for our map
            if (data.machines && data.machines.length > 0) {
              this.dashboardData = data;
            }
            
            // Only call these after all zones are processed
            if (this.zoneSummaries.length === zones.length) {
              this.renderCharts();
              
              // Update map only if it's already initialized
              if (this.mapInitialized && this.map) {
                this.updateMap();
              }
            }
          } else {
            console.error(`Invalid response for zone ${zone}`);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error(`Error fetching data for zone ${zone}:`, error);
        }
      });
    });
  }



    // Fetch machine dashboard data
  fetchMachineDashboardData(): void {
    console.log('📊 Fetching machine dashboard data...');
    
    const queryParams: any = {
      merchantId: this.merchantId,
      burnStatus: "1,2",
      machineStatus: "0,1,2",
      stockStatus: "0,1,2",
    };
    
    this.dataService.getMachineDashboardSummary(queryParams).subscribe({
      next: (response) => {
        console.log('✅ Dashboard data received:', response);
        this.dashboardData = response;
        
        // Update map if it's already initialized
        if (this.mapInitialized) {
          this.updateMap();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching dashboard data:', error);
      }
    });
  }



//   fetchDashboardData(): void {
//     this.isLoading = true;
//     this.hasError = false;
//     const merchantId = this.commonDataService.merchantId ?? '';
// debugger;
//     const queryParams: any = {
//       merchantId,
//       burnStatus: "1,2",
//       machineStatus: "0,1,2",
//       stockStatus: "0,1,2",
//       zone: "Zone 1 (South Mumbai)"
//     };
//     if (this.zone) queryParams.zone = this.zone;

//     if (this.beat) queryParams.beat = this.beat;
//     if (this.client) queryParams.client = this.client;
//     if (this.district) queryParams.district = this.district;
//     if (this.machineId) queryParams.machineId = this.machineId;
//     if (this.project) queryParams.project = this.project;
//     if (this.state) queryParams.state = this.state;
//     if (this.ward) queryParams.ward = this.ward;

  
//   }

  


  renderCharts(): void {
  // Clear previous charts
  this.statusChartRef?.toArray().forEach(ref => {
    d3.select(ref.nativeElement).selectAll('*').remove();
  });

  // Render one chart per zone
  this.zoneSummaries.forEach((zoneSummary, index) => {
    const chartElement = this.statusChartRef?.toArray()[index]?.nativeElement;
    if (chartElement) {
      this.renderDonutChart({
        element: chartElement,
        data: this.prepareStatusChartData(zoneSummary.zone),
        colors: ['#4CAF50', '#F44336']
      });
    }
  });
}

  
  prepareStatusChartData(zone: string): DonutChartData[] {
  const summary = this.zoneSummaries.find(z => z.zone === zone);
  if (!summary) return [];
  
  return [
    { name: 'Online', value: summary.online || 0 },
    { name: 'Offline', value: summary.offline || 0 }
  ];
}



   renderDonutChart(options: { element: any, data: DonutChartData[], colors: string[] }): void {
  const { element, data, colors } = options;
 
  if (!element || !data || data.length === 0) return;
 
  const width = 150;
  const height = 150;
  const radius = Math.min(width, height) / 2;
 
  // Clear previous chart if any
  d3.select(element).selectAll('*').remove();
 
  // Create SVG
  const svg = d3.select(element)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
 
  // Tooltip div (positioned absolutely outside SVG)
  const tooltip = d3.select(element)
    .append('div')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.7)')
    .style('color', '#fff')
    .style('padding', '4px 8px')
    .style('border-radius', '4px')
    .style('pointer-events', 'none')
    .style('font-size', '12px')
    .style('display', 'none');
 
  // Color scale
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
 
  // Build the pie chart
  svg.selectAll('path')
    .data(pieData)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.name))
    .attr('stroke', '#fff')
    .style('stroke-width', '1px')
    .on('mouseover', function (event, d) {
      tooltip
        .style('display', 'block')
        .html(`<strong>${d.data.name}</strong>: ${d.data.value}`);
    })
    .on('mousemove', function (event) {
      tooltip
        .style('left', (event.offsetX + 10) + 'px')
        .style('top', (event.offsetY + 10) + 'px');
    })
    .on('mouseout', function () {
      tooltip.style('display', 'none');  
    });
     
}
 
  
  // // Method to change zone
  // changeZone(zone: string): void {
  //   this.zone = zone;
  //   this.getDashboardDataForZones([zone]);
  // }



    initializeMap3(): void {
    console.log('🗺️ Initializing map...');
    
    // Check if map element exists in DOM
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map container element not found, will retry...');
      // Try again in a moment if element not found
      setTimeout(() => this.initializeMap(), 100);
      return;
    }

    // Check if map is already initialized
    if (this.map) {
      console.log('Map already initialized, resizing...');
      this.map.resize();
      return;
    }

    try {
      // Create a new map instance
      this.map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
        center: [72.8777, 19.0760], // Mumbai coordinates
        zoom: 11
      });

      // Add navigation controls
      this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      // Add resize handler for proper map rendering
      window.addEventListener('resize', () => {
        if (this.map) this.map.resize();
      });
      
      // Wait for map to load
      this.map.on('load', () => {
        console.log('Map loaded successfully');
        this.mapInitialized = true;
        this.map.resize();
        
        // Update map with data if available
        if (this.dashboardData?.machines?.length) {
          this.updateMap();
        }
      });

      // Add error handling
      this.map.on('error', (e) => {
        console.error('Map error:', e);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }


// working code of map but map is showing some portion 
  //   initializeMap(): void {
  //   console.log('🗺️ Initializing map...');
    
  //   // Check if map element exists in DOM
  //   const mapElement = document.getElementById('map');
  //   if (!mapElement) {
  //     console.error('Map container element not found, will retry...');
  //     // Try again in a moment if element not found
  //     setTimeout(() => this.initializeMap(), 100);
  //     return;
  //   }
    
  //   // Check if map is already initialized
  //   if (this.map) {
  //     console.log('Map already initialized, resizing...');
  //     this.map.resize();
  //     return;
  //   }
    
  //   try {
  //     // Create a new map instance
  //     this.map = new maplibregl.Map({
  //       container: 'map',
  //       style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
  //       center: [72.87, 19.07], // Mumbai coordinates
  //       zoom: 10.5
  //     });
      
  //     // Add navigation controls
  //     this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
  //     // Add resize handler for proper map rendering
  //     window.addEventListener('resize', () => {
  //       if (this.map) this.map.resize();
  //     });
      
  //     // Wait for map to load
  //     this.map.on('load', () => {
  //       console.log('Map loaded successfully');
  //       this.mapInitialized = true;
  //       this.map.resize();
        
  //       // Update map with data if available
  //       if (this.dashboardData?.machines?.length) {
  //         this.updateMap();
  //       }
  //     });
      
  //     // Add error handling
  //     this.map.on('error', (e) => {
  //       console.error('Map error:', e);
  //     });
  //   } catch (error) {
  //     console.error('Error initializing map:', error);
  //   }
  // }







//   changeMapView(viewType: string): void {
//   console.log(`Changing map view to: ${viewType}`);
//   this.selectedMapView = viewType;
//   this.updateMap();
// }



initializeMap(): void {
  console.log('🗺️ Initializing map...');
  
  // Check if map element exists in DOM
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map container element not found, will retry...');
    // Try again in a moment if element not found
    setTimeout(() => this.initializeMap(), 100);
    return;
  }
  
  // Check if map is already initialized
  if (this.map) {
    console.log('Map already initialized, resizing...');
    this.map.resize();
    return;
  }
  
  try {
    // Default coordinates for India (fallback)
    let centerCoordinates: [number, number] = [72.8777, 19.076];
    let zoomLevel: number = 10;
    
    // Create a new map instance
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
      center: centerCoordinates,
      zoom: zoomLevel,
      attributionControl: false // disable default attribution control
    });
    
    // Add compact attribution control
    const attributionControl = new maplibregl.AttributionControl({ compact: true });
    this.map.addControl(attributionControl, 'bottom-right');
    
    // Add navigation controls
    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Add resize handler for proper map rendering
    window.addEventListener('resize', () => {
      if (this.map) this.map.resize();
    });
    
    // Wait for map to load
    this.map.on('load', () => {
      console.log('Map loaded successfully');
      this.mapInitialized = true;
      this.map.resize();
      console.log('Map bounds:', this.map.getBounds());
      
      // Fit map to show all machines if data available (without animation)
      if (this.dashboardData?.machines?.length) {
        this.fitMapToShowAllMachines();
      }
      
      // Update map with data if available
      if (this.dashboardData?.machines?.length) {
        this.updateMap();
      }
    });
    
    // Set padding (keep this from your maps page)
    this.map.setPadding({ right: 400, top: 50 });
    
    // Add event listeners for map interactions
    this.map.on('moveend', () => this.updateMap());
    this.map.on('zoomend', () => this.updateMap());
    
    // Add error handling
    this.map.on('error', (e) => {
      console.error('Map error:', e);
    });
    
    // MutationObserver to remove the 'maplibregl-compact-show' class as soon as it's added
    const observer = new MutationObserver(() => {
      const attrEl = document.querySelector('.maplibregl-ctrl-attrib');
      if (attrEl?.classList.contains('maplibregl-compact-show')) {
        attrEl.classList.remove('maplibregl-compact-show');
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

// Helper method to calculate bounds from machine coordinates
private calculateMachineBounds(): maplibregl.LngLatBoundsLike | null {
  if (!this.dashboardData?.machines?.length) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  this.dashboardData.machines.forEach((machine: { latitude: { toString: () => string; }; longitude: { toString: () => string; }; }) => {
    if (machine.latitude && machine.longitude) {
      const lat = parseFloat(machine.latitude.toString());
      const lng = parseFloat(machine.longitude.toString());
      
      if (!isNaN(lat) && !isNaN(lng)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    }
  });

  // Check if we found valid coordinates
  if (minLat === Infinity || maxLat === -Infinity || minLng === Infinity || maxLng === -Infinity) {
    return null;
  }

  // Add some padding to the bounds
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;

  return [
    [minLng - lngPadding, minLat - latPadding], // Southwest corner
    [maxLng + lngPadding, maxLat + latPadding]  // Northeast corner
  ];
}

// Method to fit map to show all machines (no animation, immediate fit)
private fitMapToShowAllMachines(): void {
  if (!this.map || !this.dashboardData?.machines?.length) {
    return;
  }

  const bounds = this.calculateMachineBounds();
  if (bounds) {
    // Immediately fit to bounds without animation
    this.map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 450 }, // Extra right padding for sidebar
      maxZoom: 12,
      duration: 0 // No animation - immediate fit
    });
  }
}

// Method to refresh map bounds when data changes (no animation)
public refreshMapBounds(): void {
  if (this.map && this.mapInitialized && this.dashboardData?.machines?.length) {
    this.fitMapToShowAllMachines();
  }
}

/*start */


  changeMapView(viewType: string): void {
    console.log(`Changing map view to: ${viewType}`);
    this.selectedMapView = viewType;
    this.updateMap();
  }

  // Method to update map based on selected view
  updateMap(): void {
    console.log(`🔄 updateMap() called! Current view: ${this.selectedMapView}`);
    
    if (!this.map) {
      console.warn('Map not initialized, cannot update view');
      return;
    }
    
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    
    // Get the machines data to display
    // For demo, we'll use dashboardData.machines if available
    let machinesToDisplay: any[] = [];
    
    if (this.dashboardData?.machines?.length) {
      machinesToDisplay = this.dashboardData.machines;
    } else if (this.allZonesDashboardData?.length) {
      // Combine machines from all zones
      this.allZonesDashboardData.forEach(zoneData => {
        if (zoneData.data?.machines?.length) {
          machinesToDisplay = [...machinesToDisplay, ...zoneData.data.machines];
        }
      });
    }
    
    if (machinesToDisplay.length === 0) {
      console.warn('No machine data available for map');
      return;
    }
    
    this.machines = machinesToDisplay;
    console.log(`Found ${this.machines.length} machines to display`);
    
    // Log sample machine to debug stock status
    if (this.machines.length > 0) {
      console.log('Sample machine data:', this.machines[0]);
    }
    
    // Handle different view types
    switch (this.selectedMapView) {
      case 'zone':
        this.displayAggregatedView(this.machines, 'zone', '#4CAF50'); // Green for zones
        break;
      case 'ward':
        this.displayAggregatedView(this.machines, 'ward', '#2196F3'); // Blue for wards
        break;
      case 'beat':
        this.displayAggregatedView(this.machines, 'beat', '#FF9800'); // Orange for beats
        break;
      default:
        this.displayMachineView(this.machines);
        break;
    }
  }

// Modified displayMachineView method to handle new stockStatus format
displayMachineView1(machines: any[]): void {
  console.log("🔍 Displaying Machine View");
  
  // Handle overlapping markers
  const locationMap = new Map<string, number>();
  
  // Create markers for all machines
  machines.forEach(machine => {
    if (!machine.location && (!machine.longitude || !machine.latitude)) {
      console.warn(`Machine ${machine.machineId} has no location data`);
      return;
    }

    // Use machine.location if available, otherwise use longitude/latitude
    let lng: number, lat: number;
    if (machine.location && Array.isArray(machine.location) && machine.location.length >= 2) {
      lng = Number(machine.location[0]);
      lat = Number(machine.location[1]);
    } else {
      lng = Number(machine.longitude);
      lat = Number(machine.latitude);
    }
    
    // Skip if coordinates are invalid
    if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
      console.warn(`Machine ${machine.machineId} has invalid coordinates`);
      return;
    }

    const key = `${lng},${lat}`;

    // Handle overlapping markers by slightly offsetting them
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

    // Get stock status - handle the new format where stockStatus is an array
    let stockStatusNumber = this.getStockStatusNumber(machine.stockStatus);
    console.log(`Machine ${machine.machineId} processed stockStatus:`, stockStatusNumber);

    // Set marker icon based on machine status
    const iconUrl = this.getStockStatusIcon(stockStatusNumber);
    console.log(`Using icon: ${iconUrl} for status: ${stockStatusNumber}`);

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.backgroundImage = `url(${iconUrl})`;
    markerElement.style.width = '40px';
    markerElement.style.height = '40px';
    markerElement.style.backgroundSize = 'contain';
    markerElement.style.backgroundRepeat = 'no-repeat';

    // Zoom on double-click
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

    // Create popup with machine info
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true
    }).setHTML(this.generatePopupHTML(machine));

    // Create and add marker to map
    const newMarker = new maplibregl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map);

    // Store marker for later removal
    this.markers.push(newMarker);
  });
  
  console.log(`✅ Added ${this.markers.length} markers to map`);
}

// New helper method to convert stockStatus array to a number
getStockStatusNumber(stockStatus: any): number {
  // Handle when stockStatus is already a number
  if (typeof stockStatus === 'number') {
    return stockStatus;
  }
  
  // Handle when stockStatus is a string that can be parsed as a number
  if (typeof stockStatus === 'string') {
    const parsedNumber = parseInt(stockStatus);
    if (!isNaN(parsedNumber)) {
      return parsedNumber;
    }
    
    // Handle string representation
    if (stockStatus.toLowerCase() === 'ok' || stockStatus.toLowerCase() === 'okay') return 2;
    if (stockStatus.toLowerCase() === 'low stock') return 1;
    if (stockStatus.toLowerCase() === 'empty' || stockStatus.toLowerCase() === 'no stock') return 0;
  }
  
  // Handle when stockStatus is an array with SpringStatus property
  if (Array.isArray(stockStatus)) {
    // Check if empty springs exist (check for both 'empty' and 'no stock')
    if (stockStatus.some(s => 
        s.SpringStatus?.toLowerCase() === 'empty' || 
        s.SpringStatus?.toLowerCase() === 'no stock')) {
      return 0; // Empty/No Stock has highest priority
    }
    
    // Check if low stock springs exist
    if (stockStatus.some(s => s.SpringStatus?.toLowerCase() === 'low stock')) {
      return 1; // Low stock has second priority
    }
    
    // Check if ok springs exist
    if (stockStatus.some(s => s.SpringStatus?.toLowerCase() === 'ok')) {
      return 2; // All ok
    }
  }
  
  console.log("Could not determine stock status, using default");
  return -1; // Default (unknown)
}

// Updated method to get icon based on stock status
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

// Updated popup HTML generator to handle the new data structure
generatePopupHTML1(machine: any): string {
  // Convert stock status to text
  let stockStatusText = 'Unknown';
  
  // Handle the array format for stock status
  if (Array.isArray(machine.stockStatus)) {
    const statuses = machine.stockStatus.map((s: { SpringName: any; SpringStatus: any; }) => `${s.SpringName}: ${s.SpringStatus}`).join(', ');
    stockStatusText = statuses || 'Unknown';
  } else {
    // Use the legacy conversion
    switch (this.getStockStatusNumber(machine.stockStatus)) {
      case 0: stockStatusText = 'Empty/No Stock'; break;
      case 1: stockStatusText = 'Low'; break;
      case 2: stockStatusText = 'Full'; break;
    }
  }

  // Convert burning status to text
  let burningStatusText = machine.burningStatus || 'Unknown'; // Use the string value directly

  return `
    <div style="position: relative; padding: 5px; background: white;">
      
      <!-- Close Button -->
      <button class="custom-close-btn" data-machine-id="${machine.machineId}" 
              style="position: absolute; top: 0px; right: 0px; background: #fff; border: 1px solid #ccc; 
                     width: 24px; height: 24px; border-radius: 10%; cursor: pointer; 
                     display: flex; align-items: center; justify-content: center; font-size: 16px;">
        ×
      </button>

      <!-- Card Content -->
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
  // Generic method to display aggregated views (zone, ward, beat)
  displayAggregatedView1(machines: any[], viewType: 'zone' | 'ward' | 'beat', markerColor: string): void {
    console.log(`📊 Displaying ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View`);
    
    // Group machines by the selected view type
    const groups = this.groupMachinesByProperty(machines, viewType);
    
    // Create a marker for each group
    Object.entries(groups).forEach(([groupName, groupMachines]) => {
      if (groupName === 'Unknown' || groupName === 'null' || !groupName) {
        console.warn(`⚠️ Skipping ${viewType} with invalid name: "${groupName}"`);
        return;
      }
      
      // Find coordinates - try specialized lat/long first, then fallback to averaging machine positions
      let groupLocation: [number, number];
      
      const coordPropertyPrefix = {
        'zone': 'zone',
        'ward': 'ward',
        'beat': 'beat'
      }[viewType];
      
      const latProperty = `${coordPropertyPrefix}latitude`;
      const longProperty = `${coordPropertyPrefix}longitude`;
      
      // Try to use specialized coordinates if available
      const firstMachineWithCoords = groupMachines.find(m => 
        m[latProperty] && m[longProperty] && 
        m[latProperty] !== 0 && m[longProperty] !== 0
      );
      
      if (firstMachineWithCoords) {
        groupLocation = [
          Number(firstMachineWithCoords[longProperty]), 
          Number(firstMachineWithCoords[latProperty])
        ];
      } else {
        // Fallback: Calculate average coordinates of all machines in group
        const validMachines = groupMachines.filter(m => 
          m.longitude && m.latitude && 
          m.longitude !== 0 && m.latitude !== 0
        );
        
        if (validMachines.length === 0) {
          console.warn(`⚠️ No valid coordinates for ${viewType}: ${groupName}`);
          return;
        }
        
        const totalLng = validMachines.reduce((sum, m) => sum + Number(m.longitude), 0);
        const totalLat = validMachines.reduce((sum, m) => sum + Number(m.latitude), 0);
        
        groupLocation = [
          totalLng / validMachines.length, 
          totalLat / validMachines.length
        ];
      }
      
      if (!groupLocation || groupLocation[0] === 0 || groupLocation[1] === 0) {
        console.warn(`⚠️ Invalid coordinates for ${viewType}: ${groupName}`);
        return;
      }
      
      // Create custom marker element - button style with name
      const markerElement = document.createElement('div');
      markerElement.className = `${viewType}-marker`;
      markerElement.style.backgroundColor = markerColor;
      markerElement.style.color = 'white';
      markerElement.style.padding = '8px 12px';
      markerElement.style.borderRadius = '4px';
      markerElement.style.fontWeight = 'bold';
      markerElement.style.textAlign = 'center';
      markerElement.style.minWidth = '80px';
      markerElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      markerElement.style.cursor = 'pointer';
      markerElement.style.display = 'flex';
      markerElement.style.alignItems = 'center';
      markerElement.style.justifyContent = 'center';
      
      // Add text label - capitalize the first letter of viewType
      const viewTypeCapitalized = viewType.charAt(0).toUpperCase() + viewType.slice(1);
      markerElement.textContent = `${viewTypeCapitalized}: ${groupName}`;

      // Calculate statistics for this group
      const installedMachines = groupMachines.length;
      const runningMachines = groupMachines.filter(m => m.status === 'Online').length;
      const totalCollection = groupMachines.reduce((sum, m) => sum + (m.totalCollection || 0), 0);
      const itemsDispensed = groupMachines.reduce((sum, m) => sum + (m.itemsDispensed || 0), 0);
      const stockLow = groupMachines.filter(m =>
        m.stockStatus === 'Low Stock' ||
        m.stockStatus === 1 ||
        (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Low Stock'))
      ).length;
      const stockEmpty = groupMachines.filter(m =>
        m.stockStatus === 'Empty' ||
        m.stockStatus === 0 ||
        (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Empty'))
      ).length;
      const stockError = groupMachines.filter(m =>
        m.stockStatus === 'Error' ||
        (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Error'))
      ).length;
      const stockOkay = groupMachines.filter(m =>
        m.stockStatus === 'Okay' ||
        m.stockStatus === 2 ||
        (Array.isArray(m.stockStatus) && m.stockStatus.every((s: any) => s.SpringStatus === 'Okay'))
      ).length;
      const burningIdle = groupMachines.filter(m => m.burnStatus === 1).length;
      const burningEnabled = groupMachines.filter(m => m.burnStatus === 2).length;
      const burningError = groupMachines.filter(m => m.burnStatus === 3).length;
      const totalBurningCycle = groupMachines.reduce((sum, m) => sum + (m.burningCycle || 0), 0);
      
      // Create popup with group info
      const popupHTML = `
        <div class="${viewType}-popup">
          <h4>${viewTypeCapitalized}: ${groupName}</h4>
          <div class="${viewType}-stats">
            <div><strong>Machines Installed:</strong> ${installedMachines}</div>
            <div><strong>Machines Running:</strong> ${runningMachines}</div>
            <div><strong>Total Collection:</strong> ${totalCollection}</div>
            <div><strong>Items Dispensed:</strong> ${itemsDispensed}</div>
            <div><strong>Stock Empty:</strong> ${stockEmpty}</div>
            <div><strong>Stock Low:</strong> ${stockLow}</div>
            <div><strong>Stock Error:</strong> ${stockError}</div>
            <div><strong>Stock Okay:</strong> ${stockOkay}</div>
            <div><strong>Burning Idle:</strong> ${burningIdle}</div>
            <div><strong>Burning Enabled:</strong> ${burningEnabled}</div>
            <div><strong>Burning Error:</strong> ${burningError}</div>
            <div><strong>Total Burning Cycles:</strong> ${totalBurningCycle}</div>
          </div>
        </div>
      `;
      
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true,
        maxWidth: '300px'
      }).setHTML(popupHTML);
      
      // Create and add marker to map
      const newMarker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([groupLocation[0], groupLocation[1]])
        .setPopup(popup)
        .addTo(this.map);
      
      // Store marker for later removal
      this.markers.push(newMarker);
      
      console.log(`✅ Added ${viewType} marker for: ${groupName} at [${groupLocation}]`);
    });
  }

  // Helper method to group machines by any property (zone, ward, beat)
  groupMachinesByProperty(machines: any[], property: string): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    machines.forEach(machine => {
      const propertyMap: Record<string, string> = {
        'zone': 'zone',
        'ward': 'ward',
        'beat': 'beat'
      };
      
      // Get the actual property key from the mapping
      const propertyKey = propertyMap[property];
      const propertyValue = machine[propertyKey] || 'Unknown';
      
      if (!groups[propertyValue]) {
        groups[propertyValue] = [];
      }
      groups[propertyValue].push(machine);
    });
    
    return groups;
  }


  // Updated displayMachineView method with working close button
displayMachineView(machines: any[]): void {
  console.log("🔍 Displaying Machine View");
  
  // Handle overlapping markers
  const locationMap = new Map<string, number>();
  
  // Create markers for all machines
  machines.forEach(machine => {
    if (!machine.location && (!machine.longitude || !machine.latitude)) {
      console.warn(`Machine ${machine.machineId} has no location data`);
      return;
    }

    // Use machine.location if available, otherwise use longitude/latitude
    let lng: number, lat: number;
    if (machine.location && Array.isArray(machine.location) && machine.location.length >= 2) {
      lng = Number(machine.location[0]);
      lat = Number(machine.location[1]);
    } else {
      lng = Number(machine.longitude);
      lat = Number(machine.latitude);
    }
    
    // Skip if coordinates are invalid
    if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
      console.warn(`Machine ${machine.machineId} has invalid coordinates`);
      return;
    }

    const key = `${lng},${lat}`;

    // Handle overlapping markers by slightly offsetting them
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

    // Get stock status - handle the new format where stockStatus is an array
    let stockStatusNumber = this.getStockStatusNumber(machine.stockStatus);
    console.log(`Machine ${machine.machineId} processed stockStatus:`, stockStatusNumber);

    // Set marker icon based on machine status
    const iconUrl = this.getStockStatusIcon(stockStatusNumber);
    console.log(`Using icon: ${iconUrl} for status: ${stockStatusNumber}`);

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.backgroundImage = `url(${iconUrl})`;
    markerElement.style.width = '40px';
    markerElement.style.height = '40px';
    markerElement.style.backgroundSize = 'contain';
    markerElement.style.backgroundRepeat = 'no-repeat';

    // Zoom on double-click
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

    // Create popup with machine info
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
      className: 'custom-machine-popup'
    }).setHTML(this.generatePopupHTML(machine));

    // Add event listener for close button after popup is added to DOM
    popup.on('open', () => {
      const closeBtn = document.querySelector(`[data-machine-id="${machine.machineId}"]`);
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          popup.remove();
        });
      }
    });

    // Create and add marker to map
    const newMarker = new maplibregl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map);

    // Store marker for later removal
    this.markers.push(newMarker);
  });
  
  console.log(`✅ Added ${this.markers.length} markers to map`);
}

// Updated popup HTML generator with improved styling
generatePopupHTML(machine: any): string {
  // Convert stock status to text
  let stockStatusText = 'Unknown';
  
  // Handle the array format for stock status
  if (Array.isArray(machine.stockStatus)) {
    const statuses = machine.stockStatus.map((s: { SpringName: any; SpringStatus: any; }) => `${s.SpringName}: ${s.SpringStatus}`).join(', ');
    stockStatusText = statuses || 'Unknown';
  } else {
    // Use the legacy conversion
    switch (this.getStockStatusNumber(machine.stockStatus)) {
      case 0: stockStatusText = 'Empty/No Stock'; break;
      case 1: stockStatusText = 'Low'; break;
      case 2: stockStatusText = 'Full'; break;
    }
  }

  // Convert burning status to text
  let burningStatusText = machine.burningStatus || 'Unknown';

  return `
    <div style="position: relative; padding: 12px 15px 15px 15px; background: white; border-radius: 8px; min-width: 280px; 
                border: 1px solid #e0e0e0;">
      
      <!-- Close Button -->
      <button class="custom-close-btn" data-machine-id="${machine.machineId}" 
              style="position: absolute; top: 5px; right: 5px; background: #f44336; color: white; 
                     border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; 
                     display: flex; align-items: center; justify-content: center; font-size: 12px;
                     font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.3); z-index: 999;
                     line-height: 1;">
        ×
      </button>

      <!-- Card Content -->
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px; padding-right: 25px;">📍 Vending Machine</h3>
      <div style="font-size: 13px; line-height: 1.4;">
        <p style="margin: 3px 0;"><strong>Machine ID:</strong> ${machine.machineId}</p>
        <p style="margin: 3px 0;"><strong>State:</strong> ${machine.level1 || 'N/A'}</p>
        <p style="margin: 3px 0;"><strong>District:</strong> ${machine.level2 || 'N/A'}</p>
        <p style="margin: 3px 0;"><strong>Zone:</strong> ${machine.zone || 'N/A'}</p>
        <p style="margin: 3px 0;"><strong>Ward:</strong> ${machine.ward || 'N/A'}</p>
        <p style="margin: 3px 0;"><strong>Beat:</strong> ${machine.beat || 'N/A'}</p>
        <p style="margin: 3px 0;"><strong>Status:</strong> ${machine.status || 'N/A'}</p>
        <p style="margin: 3px 0;"><strong>Stock Status:</strong> ${stockStatusText}</p>
        <p style="margin: 3px 0;"><strong>Burning Status:</strong> ${burningStatusText}</p>
        <p style="margin: 3px 0;"><strong>Total Collection:</strong> ₹${machine.collection || 0}</p>
        <p style="margin: 3px 0;"><strong>Items Dispensed:</strong> ${machine.itemsDispensed || 0}</p>
        <p style="margin: 3px 0;"><strong>Address:</strong> ${machine.address || 'N/A'}</p>
      </div>
    </div>`;
}

// Updated displayAggregatedView method with close buttons
displayAggregatedView(machines: any[], viewType: 'zone' | 'ward' | 'beat', markerColor: string): void {
  console.log(`📊 Displaying ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View`);
  
  // Group machines by the selected view type
  const groups = this.groupMachinesByProperty(machines, viewType);
  
  // Create a marker for each group
  Object.entries(groups).forEach(([groupName, groupMachines]) => {
    if (groupName === 'Unknown' || groupName === 'null' || !groupName) {
      console.warn(`⚠️ Skipping ${viewType} with invalid name: "${groupName}"`);
      return;
    }
    
    // Find coordinates - try specialized lat/long first, then fallback to averaging machine positions
    let groupLocation: [number, number];
    
    const coordPropertyPrefix = {
      'zone': 'zone',
      'ward': 'ward',
      'beat': 'beat'
    }[viewType];
    
    const latProperty = `${coordPropertyPrefix}latitude`;
    const longProperty = `${coordPropertyPrefix}longitude`;
    
    // Try to use specialized coordinates if available
    const firstMachineWithCoords = groupMachines.find(m => 
      m[latProperty] && m[longProperty] && 
      m[latProperty] !== 0 && m[longProperty] !== 0
    );
    
    if (firstMachineWithCoords) {
      groupLocation = [
        Number(firstMachineWithCoords[longProperty]), 
        Number(firstMachineWithCoords[latProperty])
      ];
    } else {
      // Fallback: Calculate average coordinates of all machines in group
      const validMachines = groupMachines.filter(m => 
        m.longitude && m.latitude && 
        m.longitude !== 0 && m.latitude !== 0
      );
      
      if (validMachines.length === 0) {
        console.warn(`⚠️ No valid coordinates for ${viewType}: ${groupName}`);
        return;
      }
      
      const totalLng = validMachines.reduce((sum, m) => sum + Number(m.longitude), 0);
      const totalLat = validMachines.reduce((sum, m) => sum + Number(m.latitude), 0);
      
      groupLocation = [
        totalLng / validMachines.length, 
        totalLat / validMachines.length
      ];
    }
    
    if (!groupLocation || groupLocation[0] === 0 || groupLocation[1] === 0) {
      console.warn(`⚠️ Invalid coordinates for ${viewType}: ${groupName}`);
      return;
    }
    
    // Create custom marker element - button style with name
    const markerElement = document.createElement('div');
    markerElement.className = `${viewType}-marker`;
    markerElement.style.backgroundColor = markerColor;
    markerElement.style.color = 'white';
    markerElement.style.padding = '8px 12px';
    markerElement.style.borderRadius = '4px';
    markerElement.style.fontWeight = 'bold';
    markerElement.style.textAlign = 'center';
    markerElement.style.minWidth = '80px';
    markerElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    markerElement.style.cursor = 'pointer';
    markerElement.style.display = 'flex';
    markerElement.style.alignItems = 'center';
    markerElement.style.justifyContent = 'center';
    
    // Add text label - capitalize the first letter of viewType
    const viewTypeCapitalized = viewType.charAt(0).toUpperCase() + viewType.slice(1);
    markerElement.textContent = `${viewTypeCapitalized}: ${groupName}`;

    // Calculate statistics for this group
    const installedMachines = groupMachines.length;
    const runningMachines = groupMachines.filter(m => m.status === 'Online').length;
    const totalCollection = groupMachines.reduce((sum, m) => sum + (m.totalCollection || 0), 0);
    const itemsDispensed = groupMachines.reduce((sum, m) => sum + (m.itemsDispensed || 0), 0);
    const stockLow = groupMachines.filter(m =>
      m.stockStatus === 'Low Stock' ||
      m.stockStatus === 1 ||
      (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Low Stock'))
    ).length;
    const stockEmpty = groupMachines.filter(m =>
      m.stockStatus === 'Empty' ||
      m.stockStatus === 0 ||
      (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Empty'))
    ).length;
    const stockError = groupMachines.filter(m =>
      m.stockStatus === 'Error' ||
      (Array.isArray(m.stockStatus) && m.stockStatus.some((s: any) => s.SpringStatus === 'Error'))
    ).length;
    const stockOkay = groupMachines.filter(m =>
      m.stockStatus === 'Okay' ||
      m.stockStatus === 2 ||
      (Array.isArray(m.stockStatus) && m.stockStatus.every((s: any) => s.SpringStatus === 'Okay'))
    ).length;
    const burningIdle = groupMachines.filter(m => m.burnStatus === 1).length;
    const burningEnabled = groupMachines.filter(m => m.burnStatus === 2).length;
    const burningError = groupMachines.filter(m => m.burnStatus === 3).length;
    const totalBurningCycle = groupMachines.reduce((sum, m) => sum + (m.burningCycle || 0), 0);
    
    // Generate unique ID for this popup
    const popupId = `${viewType}-${groupName.replace(/\s+/g, '-')}`;
    
    // Create popup with group info and close button
    const popupHTML = `
      <div class="${viewType}-popup" style="position: relative; padding: 12px 15px 15px 15px; background: white; border-radius: 8px; min-width: 320px;
                                            border: 1px solid #e0e0e0;">
        
        <!-- Close Button -->
        <button class="aggregated-close-btn" data-popup-id="${popupId}" 
                style="position: absolute; top: 5px; right: 5px; background: #f44336; color: white; 
                       border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; 
                       display: flex; align-items: center; justify-content: center; font-size: 12px;
                       font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.3); z-index: 999;
                       line-height: 1;">
          ×
        </button>

        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px; padding-right: 25px;">${viewTypeCapitalized}: ${groupName}</h4>
        <div class="${viewType}-stats" style="font-size: 13px; line-height: 1.4;">
          <div style="margin: 3px 0;"><strong>Machines Installed:</strong> ${installedMachines}</div>
          <div style="margin: 3px 0;"><strong>Machines Running:</strong> ${runningMachines}</div>
          <div style="margin: 3px 0;"><strong>Total Collection:</strong> ₹${totalCollection}</div>
          <div style="margin: 3px 0;"><strong>Items Dispensed:</strong> ${itemsDispensed}</div>
          <div style="margin: 3px 0;"><strong>Stock Empty:</strong> ${stockEmpty}</div>
          <div style="margin: 3px 0;"><strong>Stock Low:</strong> ${stockLow}</div>
          <div style="margin: 3px 0;"><strong>Stock Error:</strong> ${stockError}</div>
          <div style="margin: 3px 0;"><strong>Stock Okay:</strong> ${stockOkay}</div>
          <div style="margin: 3px 0;"><strong>Burning Idle:</strong> ${burningIdle}</div>
          <div style="margin: 3px 0;"><strong>Burning Enabled:</strong> ${burningEnabled}</div>
          <div style="margin: 3px 0;"><strong>Burning Error:</strong> ${burningError}</div>
          <div style="margin: 3px 0;"><strong>Total Burning Cycles:</strong> ${totalBurningCycle}</div>
        </div>
      </div>
    `;
    
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
      maxWidth: '350px',
      className: 'custom-aggregated-popup'
    }).setHTML(popupHTML);

    // Add event listener for close button after popup is added to DOM
    popup.on('open', () => {
      const closeBtn = document.querySelector(`[data-popup-id="${popupId}"]`);
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          popup.remove();
        });
      }
    });
    
    // Create and add marker to map
    const newMarker = new maplibregl.Marker({ element: markerElement })
      .setLngLat([groupLocation[0], groupLocation[1]])
      .setPopup(popup)
      .addTo(this.map);
    
    // Store marker for later removal
    this.markers.push(newMarker);
    
    console.log(`✅ Added ${viewType} marker for: ${groupName} at [${groupLocation}]`);
  });
}
  setupViewSelectionHandlers() {
    // If using radio buttons or other UI elements to change views
    // Connect them to the changeMapView method
    const viewButtons = document.querySelectorAll('.view-selector');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const viewType = target.getAttribute('data-view');
        if (viewType) {
          this.changeMapView(viewType);
        }
      });
    });
  }





/*end*/


  updateMapmain(): void {
    console.log("🔄 updateMap() called!");

    if (!this.map || !this.mapInitialized) {
      console.warn('Map not initialized, cannot update');
      return;
    }

    if (!this.dashboardData?.machines?.length) {
      console.warn('No machine data available for map');
      return;
    }

    // Get machines for the current zone (assuming zone is now a string array)
    const zoneToCheck = Array.isArray(this.zone) ? this.zone[0] : this.zone;
    
    // Filter machines by the zone
    const zoneSpecificMachines = this.dashboardData.machines.filter(
      (machine: { zone: string; }) => machine.zone === zoneToCheck
    );
    
    console.log(`Found ${zoneSpecificMachines.length} machines for zone: ${zoneToCheck}`);
    
    // If no machines found for this zone, try with the first machine as fallback
    const machineToUse = zoneSpecificMachines.length > 0 
      ? zoneSpecificMachines[0] 
      : this.dashboardData.machines[0];
      
    if (!machineToUse) {
      console.warn('No machine data available for map');
      return;
    }
    
    const { zonelatitude: lat, zonelongitude: lng, zone: zoneName } = machineToUse;

    if (!lat || !lng) {
      console.warn(`Zone coordinates missing for zone: ${zoneToCheck}`);
      return;
    }

    // Check if map is fully loaded
    if (!this.map.loaded()) {
      console.log('Map not fully loaded, waiting...');
      this.map.once('load', () => {
        this.updateMapWithCoordinates(lng, lat, zoneName);
      });
    } else {
      this.updateMapWithCoordinates(lng, lat, zoneName);
    }
  }

  // Helper method to update map with coordinates
  private updateMapWithCoordinates(lng: number, lat: number, zone: string): void {
    // Center the map
    this.map.setCenter([lng, lat]);
    this.map.setZoom(13);

    // Remove existing marker
    if (this.zoneMarker) {
      this.zoneMarker.remove();
    }

    // Create custom HTML marker element
    const markerEl = document.createElement('div');
    markerEl.textContent = `${zone}`;
    markerEl.style.backgroundColor = '#28a745'; // Bootstrap-style green
    markerEl.style.color = '#fff';
    markerEl.style.padding = '5px 10px';
    markerEl.style.borderRadius = '6px';
    markerEl.style.fontSize = '14px';
    markerEl.style.fontWeight = 'bold';
    markerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    markerEl.style.whiteSpace = 'nowrap';
    markerEl.style.cursor = 'pointer';

    // Add the custom marker
    this.zoneMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(this.map);
  }   
}
