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

  

updateMap(): void {
  console.log("🔄 updateMap() called!");

  if (!this.map) {
    console.warn('Map not initialized, cannot update');
    return;
  }

  if (!this.dashboardData?.machines?.length) {
    console.warn('No machine data available for map');
    return;
  }

  // Filter machines by the zone received from routing
  const zoneSpecificMachines = this.dashboardData.machines.filter(
    (    machine: { zone: string; }) => machine.zone === this.zone
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

  // Check if map is fully loaded
  if (!this.map.loaded()) {
    console.log('Map not fully loaded, waiting...');
    this.map.once('load', () => {
      this.updateMapWithCoordinates(lng, lat, zone);
    });
  } else {
    this.updateMapWithCoordinates(lng, lat, zone);
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

  console.log(`📍 Custom zone marker added for ${zone} at [${lng}, ${lat}]`);
}

  // This will be implemented later to add markers
  updateMap1(): void {
    console.log("🔄 updateMap() called!");

    if (!this.map || !this.dashboardData || !this.dashboardData.machines || this.dashboardData.machines.length === 0) {
      console.warn('Map or zone data not available');
      return;
    }
  
    const firstMachine = this.dashboardData.machines[0];
    const zoneLat = firstMachine.zonelatitude;
    const zoneLng = firstMachine.zonelongitude;
    const zoneName = firstMachine.zone;
  
    if (!zoneLat || !zoneLng) {
      console.warn('Zone coordinates missing');
      return;
    }
  
    // Center the map on the zone
    this.map.setCenter([zoneLng, zoneLat]);
    this.map.setZoom(13); // Adjust zoom as needed
  
    // Optional: Clear previous zone marker
    if (this.zoneMarker) {
      this.zoneMarker.remove();
    }
  
    // Add marker at the zone location
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <strong>${zoneName}</strong><br>
      Lat: ${zoneLat}, Lng: ${zoneLng}
    `);
  
    this.zoneMarker = new maplibregl.Marker({ color: '#007BFF' })
      .setLngLat([zoneLng, zoneLat])
      .setPopup(popup)
      .addTo(this.map);
  
    console.log(`📍 Zone marker added for ${zoneName} at [${zoneLng}, ${zoneLat}]`);
    }



    
}
