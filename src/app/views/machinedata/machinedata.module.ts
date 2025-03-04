import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  AlertModule,
  AvatarModule,
  BadgeModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  CollapseModule,
  FormModule,
  GridModule,
  NavModule,
  ProgressModule,
  SharedModule,
  TableModule,
  TabsModule,
  UtilitiesModule
} from '@coreui/angular-pro';
import { IconModule } from '@coreui/icons-angular';
import { ChartjsModule } from '@coreui/angular-chartjs';

import { MachinedataRoutingModule } from './machinedata-routing.module';
import { MachinedataComponent } from './machinedata.component';

import { WidgetsModule } from '../widgets/widgets.module';
import { DataService } from '../../service/data.service';

@NgModule({
  imports: [
    MachinedataRoutingModule,
    CardModule,
    NavModule,
    IconModule,
    TabsModule,
    CommonModule,
    GridModule,
    ProgressModule,
    ReactiveFormsModule,
    ButtonModule,
    FormModule,
    ButtonModule,
    ButtonGroupModule,
    ChartjsModule,
    AvatarModule,
    TableModule,
    WidgetsModule,

    FormsModule,
    CollapseModule,
        TableModule,
        UtilitiesModule,
        BadgeModule,
        SharedModule,
        ButtonModule,
        AlertModule,
        FormsModule,
     
   
  ],
  declarations: [MachinedataComponent]
})
export class MachinedataModule {
}
