import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PluginsRoutingModule } from './plugins-routing.module';
import { FormsModule } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { GoogleMapsComponent } from './maps/google-maps.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, PluginsRoutingModule,FormsModule,FormsModule],
})
export class PluginsModule {}
