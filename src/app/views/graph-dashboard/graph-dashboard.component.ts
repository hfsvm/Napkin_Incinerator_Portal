import { Component, OnInit, AfterViewInit, ViewChild, ElementRef,QueryList } from '@angular/core';
import * as d3 from 'd3';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { CommonDataService } from '../../Common/common-data.service';
import { Location } from '@angular/common';
import { ViewChildren } from '@angular/core';






import * as maplibregl from 'maplibre-gl';


interface DonutChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-zone-dashboard',
  templateUrl: './graph-dashboard.component.html',
  styleUrls: ['./graph-dashboard.component.scss']
})
export class GraphDashboardComponent implements OnInit {

  private map!: maplibregl.Map;
  private markers: maplibregl.Marker[] = [];

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



  showNoDataMessage = false;

  // Chart references
  // @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('stockChart') stockChartRef!: ElementRef;
// @ViewChild('statusChart') statusChartRefs!: QueryList<ElementRef>;
@ViewChildren('statusChart') statusChartRef!: QueryList<ElementRef>;

  // @ViewChild('statusChart') statusChartRef!: QueryList<ElementRef>;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private commonDataService: CommonDataService,
    private location: Location
  ) { }

  ngOnInit(): void {
    debugger;
    this.merchantId = this.commonDataService.merchantId ?? '';

    this.route.queryParams.subscribe(params => {
      if (params['zone']) {
        this.zone = params['zone'];
        console.log('Zone received:', this.zone);
      }
    });
  

    // this.fetchDashboardData();
    this.getDashboardDataForZones(this.zone);
    // this.getDashboardDataForZones();
    this.initializeMap();

    this.updateMap();
    this.renderCharts();
  }

  
  getDashboardDataForZones(zones: string[]): void {
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

  

//   renderCharts(): void {
//   // Clear previous charts
//   this.statusChartRefs.forEach(ref => {
//     d3.select(ref.nativeElement).selectAll('*').remove();
//   });

//   // Render one chart per zone
//   this.zoneSummaries.forEach((zoneSummary, index) => {
//     const chartElement = this.statusChartRefs.get(index)?.nativeElement;
//     if (chartElement) {
//       this.renderDonutChart({
//         element: chartElement,
//         data: this.prepareStatusChartData(zoneSummary.zone),
//         colors: ['#4CAF50', '#F44336']
//       });
//     }
//   });
// }


//   prepareStatusChartData(zone: string): DonutChartData[] {
//   const summary = this.zoneSummaries.find(z => z.zone === zone); // Find the selected zone

//   if (!summary) {
//     return []; // Return empty if not found
//   }

//   const online = summary.online || 0;
//   const offline = summary.offline || 0;

//   return [
//     { name: 'Online', value: online },
//     { name: 'Offline', value: offline }
//   ];
// }

  // prepareStatusChartData(): DonutChartData[] {
  //   // const online = this.dashboardData.machinesRunning || 0;
  //   // const offline = (this.dashboardData.machinesInstalled || 0) - online;

  //   const online = 50;
  //   const offline = 10;
  //   return [
  //     { name: 'Online', value: online },
  //     { name: 'Offline', value: offline }
  //   ];
  // }

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
 
  
  // Method to change zone
  changeZone(zone: string): void {
    this.zone = zone;
    // this.fetchDashboardData();
    // this.getDashboardDataForZones(zone);
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
