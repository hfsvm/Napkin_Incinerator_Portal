// import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { DOCUMENT } from '@angular/common';
// import { MapInfoWindow, MapMarker } from '@angular/google-maps';
// import { GoogleMapsLoaderService } from './google-maps-loader.service';

// /// <reference types="googlemaps" />

// // Marker interface for type safety
// interface Marker {
//   position: google.maps.LatLngLiteral;
//   label?: string;
//   title: string;
//   www: string;
//   machineId: string;
//   collection: string;
//   stockStatus: string;
//   stockError: string;
//   totalBurningCycles: number;
//   burningEnabled: boolean;
//   burningStatus: string;
//   machineStatus: string;
//   color: string;
// }

// @Component({
//   selector: 'app-google-maps-integration',
//   templateUrl: 'google-maps.component.html',
//   styleUrls: ['google-maps.component.scss'],
//   providers: [GoogleMapsLoaderService]
// })
// export class GoogleMapsComponent implements OnInit, OnDestroy {
//   title: string = '';
//   activeInfoWindow!: Marker;

//   options: google.maps.MapOptions = {
//     center: {
//       lat: 20.5937, // Centered in India
//       lng: 78.9629
//     },
//     zoom: 5
//   };

//   markerOptions: google.maps.MarkerOptions = { draggable: false };
//   markerPositions: google.maps.LatLngLiteral[] = [];

//   markers: Marker[] = [
//     { position: { lat: 28.7041, lng: 77.1025 }, label: 'D', title: 'Delhi', www: 'https://delhi.gov.in/', machineId: 'M001', collection: '₹54.2K', stockStatus: 'Okay', stockError: 'None', totalBurningCycles: 2193, burningEnabled: true, burningStatus: 'Idle', machineStatus: 'Online', color: 'green' },
//     { position: { lat: 19.0760, lng: 72.8777 }, label: 'M', title: 'Mumbai', www: 'https://mumbaicity.gov.in/', machineId: 'M002', collection: '₹48.5K', stockStatus: 'Low', stockError: 'None', totalBurningCycles: 1890, burningEnabled: false, burningStatus: 'Error', machineStatus: 'Offline', color: 'red' },
//     { position: { lat: 12.9716, lng: 77.5946 }, label: 'B', title: 'Bangalore', www: 'https://bbmp.gov.in/', machineId: 'M003', collection: '₹60.1K', stockStatus: 'Okay', stockError: 'None', totalBurningCycles: 2500, burningEnabled: true, burningStatus: 'Idle', machineStatus: 'Online', color: 'green' },
//     { position: { lat: 13.0827, lng: 80.2707 }, label: 'C', title: 'Chennai', www: 'https://chennaicorporation.gov.in/', machineId: 'M004', collection: '₹45.3K', stockStatus: 'Empty', stockError: 'Yes', totalBurningCycles: 1700, burningEnabled: false, burningStatus: 'Error', machineStatus: 'Offline', color: 'red' },
//     { position: { lat: 22.5726, lng: 88.3639 }, label: 'K', title: 'Kolkata', www: 'https://www.kmcgov.in/', machineId: 'M005', collection: '₹52.7K', stockStatus: 'Okay', stockError: 'None', totalBurningCycles: 2000, burningEnabled: true, burningStatus: 'Enabled', machineStatus: 'Online', color: 'green' },
//     { position: { lat: 26.9124, lng: 75.7873 }, label: 'J', title: 'Jaipur', www: 'https://jaipurmc.org/', machineId: 'M006', collection: '₹30.9K', stockStatus: 'Low', stockError: 'Yes', totalBurningCycles: 1200, burningEnabled: false, burningStatus: 'Error', machineStatus: 'Offline', color: 'red' },
//     { position: { lat: 17.3850, lng: 78.4867 }, label: 'H', title: 'Hyderabad', www: 'https://www.ghmc.gov.in/', machineId: 'M007', collection: '₹40.2K', stockStatus: 'Okay', stockError: 'None', totalBurningCycles: 1600, burningEnabled: true, burningStatus: 'Idle', machineStatus: 'Online', color: 'green' },
//     { position: { lat: 23.0225, lng: 72.5714 }, label: 'A', title: 'Ahmedabad', www: 'https://ahmedabadcity.gov.in/', machineId: 'M008', collection: '₹38.6K', stockStatus: 'Okay', stockError: 'None', totalBurningCycles: 1450, burningEnabled: false, burningStatus: 'Enabled', machineStatus: 'Offline', color: 'red' },
//     { position: { lat: 21.1458, lng: 79.0882 }, label: 'N', title: 'Nagpur', www: 'https://www.nmcnagpur.gov.in/', machineId: 'M009', collection: '₹55.4K', stockStatus: 'Empty', stockError: 'Yes', totalBurningCycles: 2150, burningEnabled: true, burningStatus: 'Idle', machineStatus: 'Online', color: 'green' },
//     { position: { lat: 15.2993, lng: 74.1240 }, label: 'G', title: 'Goa', www: 'https://www.goa.gov.in/', machineId: 'M010', collection: '₹28.1K', stockStatus: 'Low', stockError: 'None', totalBurningCycles: 1100, burningEnabled: false, burningStatus: 'Error', machineStatus: 'Offline', color: 'red' }
//   ];

//   @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

//   constructor(
//     public googleMapsLoaderService: GoogleMapsLoaderService,
//     @Inject(DOCUMENT) private document: any
//   ) { }

//   ngOnInit() {
//     this.setPositions();
//   }

//   ngOnDestroy() {}

//   setPositions() {
//     this.markers.forEach((marker) => {
//       const { lat, lng } = { ...marker.position };
//       this.markerPositions.push({ lat, lng });
//     });
//   }

//   openInfoWindow(marker: MapMarker, item: Marker) {
//     this.activeInfoWindow = item;
//     this.infoWindow.open(marker);
//   }
// }
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { GoogleMapsLoaderService } from './google-maps-loader.service';
import { DataService } from 'src/app/service/data.service';

import { ChangeDetectorRef } from '@angular/core';

/// <reference types="googlemaps" />

// Marker interface
interface Marker {
  position: google.maps.LatLngLiteral;
  title: string;
  machineId: string;
  collection: string;
  stockStatus: string;
  stockError: string;
  totalBurningCycles: number;
  burningEnabled: boolean;
  burningStatus: string;
  machineStatus: string;
  color: string;
}

@Component({
  selector: 'app-google-maps-integration',
  templateUrl: 'google-maps.component.html',
  styleUrls: ['google-maps.component.scss'],
  providers: [GoogleMapsLoaderService]
})
export class GoogleMapsComponent implements OnInit, OnDestroy {
  title: string = '';
  activeInfoWindow!: Marker;
  markers: Marker[] = [];
  markerPositions: google.maps.LatLngLiteral[] = [];

  options: google.maps.MapOptions = {
    center: { lat: 20.5937, lng: 78.9629 }, // Default center (India)
    zoom: 5
  };

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  constructor(
    public googleMapsLoaderService: GoogleMapsLoaderService,
    private dataService: DataService, // ✅ Inject API service
    private cdr: ChangeDetectorRef, // ✅ Ensures UI updates
    @Inject(DOCUMENT) private document: any
  ) {}

  ngOnInit() {
    this.loadMachineData(); // ✅ Fetch data when component loads
  }

  ngOnDestroy() {}

  // ✅ Fetch machine locations from API and update markers
  loadMachineData() {
    const merchantId = sessionStorage.getItem('merchantId');

    if (!merchantId) {
      console.warn('⚠️ No Merchant ID found in session');
      return;
    }

    this.dataService.getMachineLocations(merchantId).subscribe({
      next: (machines: any[]) => {
        console.log('🚀 API Response:', machines);

        this.markers = machines.map((m: any) => ({
          position: { lat: m.latitude, lng: m.longitude },
          title: m.name,
          machineId: m.machineId,
          collection: m.collection || 'N/A',
          stockStatus: m.stockStatus || 'N/A',
          stockError: m.stockError || 'None',
          totalBurningCycles: m.totalBurningCycles || 0,
          burningEnabled: m.burningEnabled || false,
          burningStatus: m.burningStatus || 'Unknown',
          machineStatus: m.status,
          color: m.status === 'Active' ? 'green' : 'red'
        }));

        console.log('✅ Updated Markers:', this.markers);
        this.markerPositions = this.markers.map(marker => marker.position);

        if (this.markerPositions.length > 0) {
          this.options.center = this.markerPositions[0]; // Center map on first machine
        }

        this.cdr.detectChanges(); // ✅ Force UI update
      },
      error: (error: any) => {
        console.error('❌ API Call Failed:', error);
      }
    });
  }

  openInfoWindow(marker: MapMarker, item: Marker) {
    this.activeInfoWindow = item;
    this.infoWindow.open(marker);
  }
}
