import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GoogleMapsComponent } from './google-maps.component';

const routes: Routes = [
  {
    path: '',
    component: GoogleMapsComponent,
    data: {
      title: 'Machine Locations',
    },
    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapsRoutingModule {}

