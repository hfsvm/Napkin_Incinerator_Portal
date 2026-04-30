import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule, GridModule } from '@coreui/angular-pro';
import { IconModule } from '@coreui/icons-angular';

import { CoreUIIconsComponent } from './coreui-icons.component';
import { IconsRoutingModule } from './icons-routing.module';

// ✅ Removed DocsComponentsModule — it's a CoreUI demo dependency not available in this project

@NgModule({
  imports: [
    IconsRoutingModule,
    CardModule,
    GridModule,
    IconModule,
    CommonModule,
  ],
  declarations: [
    CoreUIIconsComponent
  ]
})
export class IconsModule {}