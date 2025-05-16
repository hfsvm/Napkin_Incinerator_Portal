// import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
// import * as d3 from 'd3';
// import { ActivatedRoute, Router } from '@angular/router';
// import { DataService } from '../../service/data.service';
// import { CommonDataService } from '../../Common/common-data.service';
// import { Location } from '@angular/common';


// interface DonutChartData {
//   name: string;
//   value: number;
// }

// @Component({
//   selector: 'app-zone-dashboard',
//   templateUrl: './zone-dashboard.component.html',
//   styleUrls: ['./zone-dashboard.component.scss']
// })
// export class ZoneDashboardComponent implements OnInit, AfterViewInit {
//   // Dashboard summary data
//   dashboardData: any = {};
  
//   // // Current zone selection
//   // selectedZone: string = 'Zone 1 (South Mumbai)';
  
//   // Loading state
//   isLoading: boolean = false;
  
//   // Error state
//   hasError: boolean = false;
//   errorMessage: string = '';


//   burnStatus = '1,2';
// stockStatus = '0,1,2';
// machineStatus = '0,1,2';

// beat = '';
// client = '';
// district = '';
// machineId = '';
// merchantId = 'VIKN250324';
// project = '';
// state = '';
// ward = '';
// zone = 'Zone 1 (South Mumbai)';


//   // Chart references
//   @ViewChild('statusChart') statusChartRef!: ElementRef;
//   @ViewChild('stockChart') stockChartRef!: ElementRef;

//   constructor(
//     private dataService: DataService,
//     private route: ActivatedRoute,
//     private router: Router,
//     private commonDataService: CommonDataService,
//     private location: Location

//   ) { }

//   ngOnInit(): void {
//     this.fetchDashboardData();
//   }

//   ngAfterViewInit(): void {
//     // Charts will be initialized after data is loaded
//   }

//   fetchDashboardData(): void {
//     this.isLoading = true;
//     this.hasError = false;
    
//     const queryParams: any = {
//       // burnStatus: this.burnStatus,
//       // stockStatus: this.stockStatus,
//       // machineStatus: this.machineStatus,
//       // merchantId: this.merchantId,
//       // zone: this.zone
//       burnStatus: "1,2",
//       machineStatus: "0,1,2",
//       merchantId: "VIKN250324",
//       stockStatus: "0,1,2",
//       zone: "Zone 1 (South Mumbai)"

//     };
  
//     if (this.beat) queryParams.beat = this.beat;
//     if (this.client) queryParams.client = this.client;
//     if (this.district) queryParams.district = this.district;
//     if (this.machineId) queryParams.machineId = this.machineId;
//     if (this.project) queryParams.project = this.project;
//     if (this.state) queryParams.state = this.state;
//     if (this.ward) queryParams.ward = this.ward;
//     debugger;

//     this.dataService.getMachineDashboardSummary(queryParams).subscribe(
//       (response: any) => {
//         console.log('✅ API Response:', response);
  
//         if (response?.code === 200 && response.data) {
//               debugger;

//             this.dashboardData = response.data;
//             console.log('Dashboard data loaded:', this.dashboardData);
//             setTimeout(() => {
//               this.renderCharts();
//             }, 0);
//           } else {
//             this.hasError = true;
//             this.errorMessage = 'Invalid response format';
//           }
//           this.isLoading = false;
//           debugger;
//         },
//         error: (error) => {
//           console.error('Error fetching dashboard data:', error);
//           this.hasError = true;
//           this.errorMessage = 'Failed to load dashboard data';
//           this.isLoading = false;
//         }
//       });
//   }

//   renderCharts(): void {
//     // Clear previous charts if they exist
//     if (this.statusChartRef && this.statusChartRef.nativeElement) {
//       d3.select(this.statusChartRef.nativeElement).selectAll('*').remove();
//     }
//     if (this.stockChartRef && this.stockChartRef.nativeElement) {
//       d3.select(this.stockChartRef.nativeElement).selectAll('*').remove();
//     } 

//     // Render status chart (Online/Offline)
//     this.renderDonutChart({
//       element: this.statusChartRef.nativeElement,
//       data: this.prepareStatusChartData(),
//       colors: ['#4CAF50', '#F44336']  // Online, Offline
//     });

//     // Render stock chart (Ok/Low/Empty/Unknown)
//     this.renderDonutChart({
//       element: this.stockChartRef.nativeElement,
//       data: this.prepareStockChartData(),
//       colors: ['#4CAF50', '#FFC107', '#F44336', '#9E9E9E']  // Ok, Low, Empty, Unknown
//     });
//   }

//   prepareStatusChartData(): any[] {
//     const online = this.dashboardData.machinesRunning || 0;
//     const offline = (this.dashboardData.machinesInstalled || 0) - online;
//     return [
//       { name: 'Online', value: online },
//       { name: 'Offline', value: offline }
//     ];
//   }

//   prepareStockChartData(): any[] {
//     const stockOk = this.dashboardData.stockOk || 0;
//     const stockLow = this.dashboardData.stockLow || 0;
//     const stockEmpty = this.dashboardData.stockEmpty || 0;
//     const totalStock = stockOk + stockLow + stockEmpty;
//     const stockUnknown = (this.dashboardData.machinesInstalled || 0) - totalStock;
    
//     return [
//       { name: 'Ok', value: stockOk },
//       { name: 'Low', value: stockLow },
//       { name: 'Empty', value: stockEmpty },
//       { name: 'Unknown', value: stockUnknown > 0 ? stockUnknown : 0 }
//     ];
//   }

//   renderDonutChart(options: { element: any, data: DonutChartData[], colors: string[] }): void {
//     const { element, data, colors } = options;
    
//     if (!element || !data || data.length === 0) return;
    
//     // Chart dimensions
//     const width = 150;
//     const height = 150;
//     const radius = Math.min(width, height) / 2;
    
//     // Create SVG
//     const svg = d3.select(element)
//       .append('svg')
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//       .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
//     // Color scale with explicit return type
//     const color = d3.scaleOrdinal<string, string>()
//       .domain(data.map(d => d.name))
//       .range(colors);
    
//     // Compute the position of each group on the pie
//     const pie = d3.pie<DonutChartData>()
//       .sort(null)
//       .value(d => d.value);
    
//     const pieData = pie(data);
    
//     // Build arcs
//     const arc = d3.arc<d3.PieArcDatum<DonutChartData>>()
//       .innerRadius(radius * 0.6)  // Donut hole size
//       .outerRadius(radius * 0.9);
    
//     // Build the pie chart
//     svg.selectAll('pieces')
//       .data(pieData)
//       .enter()
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', function(d) { 
//         return color(d.data.name); 
//       })
//       .attr('stroke', '#fff')
//       .style('stroke-width', '1px');
//   }
  
//   // Method to change zone
//   changeZone(zone: string): void {
//     this.zone = zone;
//     this.fetchDashboardData();
//   }
// }


import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { Location } from '@angular/common';


import * as maplibregl from 'maplibre-gl';


interface DonutChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-zone-dashboard',
  templateUrl: './zone-dashboard.component.html',
  styleUrls: ['./zone-dashboard.component.scss']
})
export class ZoneDashboardComponent implements OnInit, AfterViewInit {

  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];


    selectedMapView: string = 'zone'; // Default to zone view

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

  

  beat = '';
  client = '';
  district = '';
  machineId = '';
  merchantId: string = '';
  project = '';
  state = '';
  ward = '';
  zone = '';

  zoneMarker: any;



  showNoDataMessage = false;

  // Chart references
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
    // this.initializeMap();

    // this.updateMap();
  }

  ngAfterViewInit(): void {

    setTimeout(() =>{
      this.initializeMap();

    })

      

    // Charts will be initialized after data is loaded
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;
    const merchantId = this.commonDataService.merchantId ?? '';

    const queryParams: any = {
      merchantId,
      burnStatus: "1,2",
      machineStatus: "0,1,2",
      stockStatus: "0,1,2",
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
            // Show popup if machines array is empty
            alert('This zone has no data currently'); // Replace with a proper modal/snackbar if using Angular Material
            return; // Exit early if no machine data
          }
    
    

          if (this.map){
              this.updateMap(); // call this here

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

  renderCharts(): void {
    // Clear previous charts if they exist
    if (this.statusChartRef && this.statusChartRef.nativeElement) {
      d3.select(this.statusChartRef.nativeElement).selectAll('*').remove();
    }
    if (this.stockChartRef && this.stockChartRef.nativeElement) {
      d3.select(this.stockChartRef.nativeElement).selectAll('*').remove();
    } 

    // Render status chart (Online/Offline)
    this.renderDonutChart({
      element: this.statusChartRef.nativeElement,
      data: this.prepareStatusChartData(),
      colors: ['#4CAF50', '#F44336']  // Online, Offline
    });

    // Render stock chart (Ok/Low/Empty/Unknown)
    this.renderDonutChart({
      element: this.stockChartRef.nativeElement,
      data: this.prepareStockChartData(),
      colors: ['#4CAF50', '#FFC107', '#F44336', '#9E9E9E']  // Ok, Low, Empty, Unknown
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
    
    // Chart dimensions
    const width = 150;
    const height = 150;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Color scale with explicit return type
    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(colors);
    
    // Compute the position of each group on the pie
    const pie = d3.pie<DonutChartData>()
      .sort(null)
      .value(d => d.value);
    
    const pieData = pie(data);
    
    // Build arcs
    const arc = d3.arc<d3.PieArcDatum<DonutChartData>>()
      .innerRadius(radius * 0.6)  // Donut hole size
      .outerRadius(radius * 0.9);
    
    // Build the pie chart
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
  
  // Method to change zone
  changeZone(zone: string): void {
    this.zone = zone;
    this.fetchDashboardData();
  }
  // Initialize the map
//   initializeMap(): void {
//     // Check if map element exists in DOM
//     const mapElement = document.getElementById('map');
//     if (!mapElement) {
//       console.error('Map container element not found');
//       return;
//     }

//     try {
//       console.log('🗺️ Initializing map...');
      
//       // Create a new map instance
//       this.map = new maplibregl.Map({
//         container: 'map',
//         style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=Ldz7Kz6Xwxrw9kq0aYn3',
//         center: [72.8777, 19.0760], // Mumbai coordinates since you're focusing on South Mumbai
//         zoom: 11 // Closer zoom for city level
//       });

//       this.map.on('load', () => {
//         setTimeout(() => {
//           this.map.resize(); // Allow layout to settle before resizing
//           this.updateMap();
//         }, 100);
//       console.log('Map bounds:', this.map.getBounds());
//       });
  
      
//       // Add navigation controls (optional)
//       this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
//       // Once map is loaded, resize and update
//       this.map.on('load', () => {
//         this.map.resize();
//         console.log('Map loaded successfully');
//         console.log('Map bounds:', this.map.getBounds());
//       });
//     } catch (error) {
//       console.error('Error initializing map:', error);
//     }
//   }
  


//   updateMap(): void {
//     console.log("🔄 updateMap() called!");
  
//     if (!this.map || !this.dashboardData?.machines?.length) {
//       console.warn('Map or zone data not available');
//       return;
//     }
  
//     const firstMachine = this.dashboardData.machines[0];
//     const { zonelatitude: lat, zonelongitude: lng, zone } = firstMachine;
  
//     if (!lat || !lng) {
//       console.warn('Zone coordinates missing');
//       return;
//     }
  
//     // Center the map
//     this.map.setCenter([lng, lat]);
//     this.map.setZoom(13);
  
//     // Remove existing marker
//     if (this.zoneMarker) {
//       this.zoneMarker.remove();
//     }
  
//     // Create custom HTML marker element
//     // const markerEl = document.createElement('div');
//     // markerEl.className = 'zone-marker';
//     // markerEl.textContent = `${zone}`;


//     const markerEl = document.createElement('div');
// markerEl.textContent = `${zone}`;
// markerEl.style.backgroundColor = '#28a745'; // Bootstrap-style green
// markerEl.style.color = '#fff';
// markerEl.style.padding = '5px 10px';
// markerEl.style.borderRadius = '6px';
// markerEl.style.fontSize = '14px';
// markerEl.style.fontWeight = 'bold';
// markerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
// markerEl.style.whiteSpace = 'nowrap';
// markerEl.style.cursor = 'pointer';

  
//     // Add the custom marker
//     this.zoneMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
//       .setLngLat([lng, lat])
//       .addTo(this.map);
  
//     console.log(`📍 Custom zone marker added for ${zone} at [${lng}, ${lat}]`);
//   }



initializeMap(): void {
  console.log('🗺️ Initializing map...');
  
  // Check if map element exists in DOM
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map container element not found, will retry...');
    // Try again in a moment if element not found (might not be rendered yet)
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
    
    // Wait for map to load
    this.map.on('load', () => {
      console.log('Map loaded successfully');
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

// updateMap(): void {
//   console.log("🔄 updateMap() called!");

//   if (!this.map) {
//     console.warn('Map not initialized, cannot update');
//     return;
//   }

//   if (!this.dashboardData?.machines?.length) {
//     console.warn('No machine data available for map');
//     return;
//   }

//   const firstMachine = this.dashboardData.machines[0];
//   const { zonelatitude: lat, zonelongitude: lng, zone } = firstMachine;

//   if (!lat || !lng) {
//     console.warn('Zone coordinates missing');
//     return;
//   }

//   // Check if map is fully loaded
//   if (!this.map.loaded()) {
//     console.log('Map not fully loaded, waiting...');
//     this.map.once('load', () => {
//       this.updateMapWithCoordinates(lng, lat, zone);
//     });
//   } else {
//     this.updateMapWithCoordinates(lng, lat, zone);
//   }
// }

// // Helper method to update map with coordinates
// private updateMapWithCoordinates(lng: number, lat: number, zone: string): void {
//   // Center the map
//   this.map.setCenter([lng, lat]);
//   this.map.setZoom(13);

//   // Remove existing marker
//   if (this.zoneMarker) {
//     this.zoneMarker.remove();
//   }

//   // Create custom HTML marker element
//   const markerEl = document.createElement('div');
//   markerEl.textContent = `${zone}`;
//   markerEl.style.backgroundColor = '#28a745'; // Bootstrap-style green
//   markerEl.style.color = '#fff';
//   markerEl.style.padding = '5px 10px';
//   markerEl.style.borderRadius = '6px';
//   markerEl.style.fontSize = '14px';
//   markerEl.style.fontWeight = 'bold';
//   markerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
//   markerEl.style.whiteSpace = 'nowrap';
//   markerEl.style.cursor = 'pointer';

//   // Add the custom marker
//   this.zoneMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
//     .setLngLat([lng, lat])
//     .addTo(this.map);

//   console.log(`📍 Custom zone marker added for ${zone} at [${lng}, ${lat}]`);
// }

  

// updateMap2(): void {
//   console.log("🔄 updateMap() called!");

//   if (!this.map) {
//     console.warn('Map not initialized, cannot update');
//     return;
//   }

//   if (!this.dashboardData?.machines?.length) {
//     console.warn('No machine data available for map');
//     return;
//   }

//   // Filter machines by the zone received from routing
//   const zoneSpecificMachines = this.dashboardData.machines.filter(
//     (    machine: { zone: string; }) => machine.zone === this.zone
//   );
  
//   console.log(`Found ${zoneSpecificMachines.length} machines for zone: ${this.zone}`);
  
//   // If no machines found for this zone, try with the first machine as fallback
//   const machineToUse = zoneSpecificMachines.length > 0 
//     ? zoneSpecificMachines[0] 
//     : this.dashboardData.machines[0];
    
//   const { zonelatitude: lat, zonelongitude: lng, zone } = machineToUse;

//   if (!lat || !lng) {
//     console.warn(`Zone coordinates missing for zone: ${this.zone}`);
//     return;
//   }

//   // Check if map is fully loaded
//   if (!this.map.loaded()) {
//     console.log('Map not fully loaded, waiting...');
//     this.map.once('load', () => {
//       this.updateMapWithCoordinates(lng, lat, zone);
//     });
//   } else {
//     this.updateMapWithCoordinates(lng, lat, zone);
//   }
// }


  // Change map view based on radio button selection
  changeMapView(viewType: string): void {
    console.log(`Changing map view to: ${viewType}`);
    this.selectedMapView = viewType;
    this.updateMap();
  }

  // Main update map method to handle different view types
  updateMap(): void {
    console.log(`🔄 updateMap() called! Current view: ${this.selectedMapView}`);
    
    if (!this.map) {
      console.warn('Map not initialized, cannot update view');
      return;
    }
    
    // Make sure map is loaded
    if (!this.map.loaded()) {
      console.log('Map not fully loaded, waiting...');
      this.map.once('load', () => {
        this.processMapUpdate();
      });
    } else {
      this.processMapUpdate();
    }
  }

  // Process map update based on selected view
  private processMapUpdate(): void {
    // Clear existing markers
    this.clearAllMarkers();
    
    if (!this.dashboardData?.machines?.length) {
      console.warn('No machine data available for map');
      return;
    }
    
    // Handle different view types
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

  // Clear all markers from the map
  private clearAllMarkers(): void {
    // Clear zone marker if exists
    if (this.zoneMarker) {
      this.zoneMarker.remove();
      this.zoneMarker = null;
    }
    
    // Clear all other markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  // Display Zone View
  private displayZoneView(): void {
    console.log("📊 Displaying Zone View");
    
    // Filter machines by the current zone
    const zoneSpecificMachines = this.dashboardData.machines.filter(
      (machine: { zone: string; }) => machine.zone === this.zone
    );
    
    console.log(`Found ${zoneSpecificMachines.length} machines for zone: ${this.zone}`);
    
    // If no machines found for this zone, try with the first machine as fallback
    const machineToUse = zoneSpecificMachines.length > 0
      ? zoneSpecificMachines[0]
      : this.dashboardData.machines[0];
    
    const { zonelatitude: lat, zonelongitude: lng, zone } = machineToUse;
    
    if (!lat || !lng) {
      console.warn(`Zone coordinates missing for zone: ${this.zone}`);
      return;
    }
    
    // Center the map
    this.map.setCenter([lng, lat]);
    this.map.setZoom(11);
    
    // Create custom HTML marker element
    const markerEl = document.createElement('div');
    markerEl.textContent = `${zone}`;
    markerEl.style.backgroundColor = '#4CAF50'; // Green for zones
    markerEl.style.color = '#fff';
    markerEl.style.padding = '8px 12px';
    markerEl.style.borderRadius = '4px';
    markerEl.style.fontWeight = 'bold';
    markerEl.style.textAlign = 'center';
    markerEl.style.minWidth = '80px';
    markerEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    markerEl.style.cursor = 'pointer';
    
    // Calculate statistics for this zone
    const installedMachines = zoneSpecificMachines.length;
    const runningMachines = zoneSpecificMachines.filter((m: { status: string; }) => m.status === 'Online').length;
    const totalCollection = zoneSpecificMachines.reduce((sum: any, m: { collection: any; }) => sum + (m.collection || 0), 0);
    const itemsDispensed = zoneSpecificMachines.reduce((sum: any, m: { itemsDispensed: any; }) => sum + (m.itemsDispensed || 0), 0);
    
    // Process stock status across machines
    const stockLow = zoneSpecificMachines.filter((m: { stockStatus: any; }) =>
      this.getStockStatusNumber(m.stockStatus) === 1
    ).length;
    
    const stockEmpty = zoneSpecificMachines.filter((m: { stockStatus: any; }) =>
      this.getStockStatusNumber(m.stockStatus) === 0
    ).length;
    
    const stockOkay = zoneSpecificMachines.filter((m: { stockStatus: any; }) =>
      this.getStockStatusNumber(m.stockStatus) === 2
    ).length;
    
    // Create popup with zone info
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
    
    // Add the custom marker
    this.zoneMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map);
    
    console.log(`📍 Custom zone marker added for ${zone} at [${lng}, ${lat}]`);
  }
  
  // Display Ward View
  private displayWardView(): void {
    console.log("📊 Displaying Ward View");
    
    // Get unique wards in this zone
    const uniqueWards = new Set();
    this.dashboardData.machines.forEach((machine: any) => {
      if (machine.ward && machine.wardlatitude && machine.wardlongitude) {
        uniqueWards.add(machine.ward);
      }
    });
    
    console.log(`Found ${uniqueWards.size} unique wards`);
    
    // Center map on zone
    const firstMachine = this.dashboardData.machines[0];
    if (firstMachine.zonelatitude && firstMachine.zonelongitude) {
      this.map.setCenter([firstMachine.zonelongitude, firstMachine.zonelatitude]);
      this.map.setZoom(11);
    }
    
    // Create a marker for each ward
    uniqueWards.forEach(wardName => {
      // Find first machine with this ward
      const wardMachine = this.dashboardData.machines.find(
        (m: any) => m.ward === wardName
      );
      
      if (!wardMachine || !wardMachine.wardlatitude || !wardMachine.wardlongitude) {
        console.warn(`Ward coordinates missing for ward: ${wardName}`);
        return;
      }
      
      const lat = wardMachine.wardlatitude;
      const lng = wardMachine.wardlongitude;
      
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.textContent = `Ward: ${wardName}`;
      markerEl.style.backgroundColor = '#2196F3'; // Blue for wards
      markerEl.style.color = 'white';
      markerEl.style.padding = '8px 12px';
      markerEl.style.borderRadius = '4px';
      markerEl.style.fontWeight = 'bold';
      markerEl.style.textAlign = 'center';
      markerEl.style.minWidth = '80px';
      markerEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      
      // Get all machines in this ward
      const wardMachines = this.dashboardData.machines.filter(
        (m: any) => m.ward === wardName
      );
      
      // Calculate statistics for this ward
      const installedMachines = wardMachines.length;
      const runningMachines = wardMachines.filter((m: { status: string; }) => m.status === 'Online').length;
      const totalCollection = wardMachines.reduce((sum: any, m: { collection: any; }) => sum + (m.collection || 0), 0);
      const itemsDispensed = wardMachines.reduce((sum: any, m: { itemsDispensed: any; }) => sum + (m.itemsDispensed || 0), 0);
      
      // Process stock status
      const stockLow = wardMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 1
      ).length;
      
      const stockEmpty = wardMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 0
      ).length;
      
      const stockOkay = wardMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 2
      ).length;
      
      // Create popup with ward info
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
      
      // Create and add marker to map
      const newMarker = new maplibregl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);
      
      // Store marker for later removal
      this.markers.push(newMarker);
      
      console.log(`✅ Added ward marker for: ${wardName} at [${lng}, ${lat}]`);
    });
  }
  
  // Display Beat View
  private displayBeatView(): void {
    console.log("📊 Displaying Beat View");
    
    // Get unique beats in this zone with valid coordinates
    const uniqueBeats = new Set();
    this.dashboardData.machines.forEach((machine: any) => {
      if (machine.beat && (machine.beatlatitude || machine.latitude) && 
          (machine.beatlongitude || machine.longitude)) {
        uniqueBeats.add(machine.beat);
      }
    });
    
    console.log(`Found ${uniqueBeats.size} unique beats`);
    
    // Center map on zone
    const firstMachine = this.dashboardData.machines[0];
    if (firstMachine.zonelatitude && firstMachine.zonelongitude) {
      this.map.setCenter([firstMachine.zonelongitude, firstMachine.zonelatitude]);
      this.map.setZoom(11);
    }
    
    // Create a marker for each beat
    uniqueBeats.forEach(beatName => {
      // Find all machines with this beat
      const beatMachines = this.dashboardData.machines.filter(
        (m: any) => m.beat === beatName
      );
      
      if (beatMachines.length === 0) {
        return;
      }
      
      // Try to find beat coordinates
      const beatMachine = beatMachines.find(
        (m: any) => m.beatlatitude && m.beatlongitude && 
                  m.beatlatitude !== 0 && m.beatlongitude !== 0
      );
      
      let lat, lng;
      
      if (beatMachine && beatMachine.beatlatitude && beatMachine.beatlongitude &&
          beatMachine.beatlatitude !== 0 && beatMachine.beatlongitude !== 0) {
        // Use beat-specific coordinates if available
        lat = beatMachine.beatlatitude;
        lng = beatMachine.beatlongitude;
      } else {
        // Fallback: Use first machine's coordinates
        const firstBeatMachine = beatMachines[0];
        lat = firstBeatMachine.latitude;
        lng = firstBeatMachine.longitude;
      }
      
      if (!lat || !lng || lat === 0 || lng === 0) {
        console.warn(`Beat coordinates missing for beat: ${beatName}`);
        return;
      }
      
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.textContent = `Beat: ${beatName}`;
      markerEl.style.backgroundColor = '#FF9800'; // Orange for beats
      markerEl.style.color = 'white';
      markerEl.style.padding = '8px 12px';
      markerEl.style.borderRadius = '4px';
      markerEl.style.fontWeight = 'bold';
      markerEl.style.textAlign = 'center';
      markerEl.style.minWidth = '80px';
      markerEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      
      // Calculate statistics for this beat
      const installedMachines = beatMachines.length;
      const runningMachines = beatMachines.filter((m: { status: string; }) => m.status === 'Online').length;
      const totalCollection = beatMachines.reduce((sum: any, m: { collection: any; }) => sum + (m.collection || 0), 0);
      const itemsDispensed = beatMachines.reduce((sum: any, m: { itemsDispensed: any; }) => sum + (m.itemsDispensed || 0), 0);
      
      // Process stock status
      const stockLow = beatMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 1
      ).length;
      
      const stockEmpty = beatMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 0
      ).length;
      
      const stockOkay = beatMachines.filter((m: { stockStatus: any; }) => 
        this.getStockStatusNumber(m.stockStatus) === 2
      ).length;
      
      // Create popup with beat info
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
      
      // Create and add marker to map
      const newMarker = new maplibregl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map);
      
      // Store marker for later removal
      this.markers.push(newMarker);
      
      console.log(`✅ Added beat marker for: ${beatName} at [${lng}, ${lat}]`);
    });
  }
  
  // Display Machine View
  private displayMachineView(): void {
    console.log("🔍 Displaying Machine View");
    
    // Center map on zone
    const firstMachine = this.dashboardData.machines[0];
    if (firstMachine.zonelatitude && firstMachine.zonelongitude) {
      this.map.setCenter([firstMachine.zonelongitude, firstMachine.zonelatitude]);
      this.map.setZoom(11);
    }
    
    // Handle overlapping markers
    const locationMap = new Map<string, number>();
    
    // Create markers for all machines
    this.dashboardData.machines.forEach((machine: { latitude: any; longitude: any; machineId: any; stockStatus: any; }) => {
      if (!machine.latitude || !machine.longitude) {
        console.warn(`Machine ${machine.machineId} has no location data`);
        return;
      }

      let lng = Number(machine.longitude);
      let lat = Number(machine.latitude);
       
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

      // Get stock status number
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
    
    console.log(`✅ Added ${this.markers.length} machine markers to map`);
  }

  // Helper method to convert stockStatus array to a number
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

  // Get icon based on stock status
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

  // Generate popup HTML for a machine
  generatePopupHTML(machine: any): string {
    // Convert stock status to text
    let stockStatusText = 'Unknown';
    
    // Handle the array format for stock status
    if (Array.isArray(machine.stockStatus)) {
      const statuses = machine.stockStatus.map((s: { SpringName: any; SpringStatus: any; }) => 
        `${s.SpringName}: ${s.SpringStatus}`).join(', ');
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





// Helper method to update map with coordinates
// private updateMapWithCoordinates(lng: number, lat: number, zone: string): void {
//   // Center the map
//   this.map.setCenter([lng, lat]);
//   this.map.setZoom(13);

//   // Remove existing marker
//   if (this.zoneMarker) {
//     this.zoneMarker.remove();
//   }

//   // Create custom HTML marker element
//   const markerEl = document.createElement('div');
//   markerEl.textContent = `${zone}`;
//   markerEl.style.backgroundColor = '#28a745'; // Bootstrap-style green
//   markerEl.style.color = '#fff';
//   markerEl.style.padding = '5px 10px';
//   markerEl.style.borderRadius = '6px';
//   markerEl.style.fontSize = '14px';
//   markerEl.style.fontWeight = 'bold';
//   markerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
//   markerEl.style.whiteSpace = 'nowrap';
//   markerEl.style.cursor = 'pointer';

//   // Add the custom marker
//   this.zoneMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
//     .setLngLat([lng, lat])
//     .addTo(this.map);

//   console.log(`📍 Custom zone marker added for ${zone} at [${lng}, ${lat}]`);
// }




  // This will be implemented later to add markers
  // updateMap2(): void {
  //   console.log("🔄 updateMap() called!");

  //   if (!this.map || !this.dashboardData || !this.dashboardData.machines || this.dashboardData.machines.length === 0) {
  //     console.warn('Map or zone data not available');
  //     return;
  //   }
  
  //   const firstMachine = this.dashboardData.machines[0];
  //   const zoneLat = firstMachine.zonelatitude;
  //   const zoneLng = firstMachine.zonelongitude;
  //   const zoneName = firstMachine.zone;
  
  //   if (!zoneLat || !zoneLng) {
  //     console.warn('Zone coordinates missing');
  //     return;
  //   }
  
  //   // Center the map on the zone
  //   this.map.setCenter([zoneLng, zoneLat]);
  //   this.map.setZoom(13); // Adjust zoom as needed
  
  //   // Optional: Clear previous zone marker
  //   if (this.zoneMarker) {
  //     this.zoneMarker.remove();
  //   }
  
  //   // Add marker at the zone location
  //   const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
  //     <strong>${zoneName}</strong><br>
  //     Lat: ${zoneLat}, Lng: ${zoneLng}
  //   `);
  
  //   this.zoneMarker = new maplibregl.Marker({ color: '#007BFF' })
  //     .setLngLat([zoneLng, zoneLat])
  //     .setPopup(popup)
  //     .addTo(this.map);
  
  //   console.log(`📍 Zone marker added for ${zoneName} at [${zoneLng}, ${zoneLat}]`);
  //   }



    
}
