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

import { DocsComponentsModule } from '@docs-components/docs-components.module';

import { SmartTablesRoutingModule } from './smart-tables-routing.module';
import { SmartTablesComponent } from './smart-tables.component';

import { SmartTablesBasicExampleComponent } from './smart-tables-basic-example/smart-tables-basic-example.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SmartTablesComponent,
    SmartTablesBasicExampleComponent,
   
    
   
  ],
  imports: [
    CommonModule,
    DocsComponentsModule,
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
