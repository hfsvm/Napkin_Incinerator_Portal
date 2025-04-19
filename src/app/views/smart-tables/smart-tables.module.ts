import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination'; 
import {
  AlertModule,
  BadgeModule,
  ButtonModule,
  CardModule,
  CollapseModule,
  GridModule,
  SharedModule, 
  SmartTableModule,
  TableModule,
  UtilitiesModule
} from '@coreui/angular-pro';

// import { DocsComponentsModule } from '@docs-components/docs-components.module';

import { SmartTablesRoutingModule } from './smart-tables-routing.module';
import { SmartTablesComponent } from './smart-tables.component';

import { SmartTablesBasicExampleComponent } from './smart-tables-basic-example/smart-tables-basic-example.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShareModule } from '../../share/share.module';


@NgModule({
  declarations: [
    SmartTablesComponent,
    SmartTablesBasicExampleComponent,
   
    
   
  ],
  imports: [

    ShareModule,
    CommonModule,
    // DocsComponentsModule,
    SmartTablesRoutingModule,
    GridModule,
    CardModule,
    SmartTableModule,
    CollapseModule,
    TableModule,
    UtilitiesModule,
    BadgeModule,
    SharedModule,
    ButtonModule,
    AlertModule,
    FormsModule,
  SharedModule,
    NgxPaginationModule,
    ReactiveFormsModule,
  
    // MatCheckboxModule,
    // MatFormFieldModule,
    // MatSelectModule,
    // MatButtonModule,
    // MatTableModule,
    // MatIconModule,
    CommonModule,
    FormsModule
  ]
})
export class SmartTablesModule {
}
