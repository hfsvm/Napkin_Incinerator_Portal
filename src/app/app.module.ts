import { NgModule } from '@angular/core';


import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

// Import routing module
import { AppRoutingModule } from './app-routing.module';

// Import app component
import { AppComponent } from './app.component';

// Import containers
import {
  DefaultAsideComponent,
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
  EmailLayoutComponent,
} from './containers';

import {
  AvatarModule,
  BadgeModule,
  BreadcrumbModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  DropdownModule,
  FooterModule,
  FormModule,
  GridModule,
  HeaderModule,
  ListGroupModule,
  NavModule,
  ProgressModule,
  SharedModule,
  SidebarModule,
  TabsModule,
  UtilitiesModule,
 
  
} from '@coreui/angular-pro';

import { IconModule, IconSetService } from '@coreui/icons-angular';
import { DataService } from './service/data.service';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';
import { PagesModule } from './views/pages/pages.module';
import { SmartTablesModule } from './views/smart-tables/smart-tables.module';
import { VideosComponent } from './views/videos/videos.component';
import { UserManagementComponent } from './views/settings/user-management/user-management.component';
import { MachineManagementComponent } from './views/settings/machine-management/machine-management.component';
import { AdvancedManagementComponent } from './views/settings/advanced-management/advanced-management.component';
import { ConfirmDialogComponent } from './views/confirm-dialog/confirm-dialog.component';
import { MachinereportComponent } from './views/machinereport/machinereport.component';
import { ShareModule } from './share/share.module';

import { GraphDashboardComponent } from './views/graph-dashboard/graph-dashboard.component';

import { ZoneDashboardComponent } from './views/zone-dashboard/zone-dashboard.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

const APP_CONTAINERS = [
  DefaultAsideComponent,
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
  EmailLayoutComponent,

];

@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS, UserManagementComponent, MachineManagementComponent, AdvancedManagementComponent, ConfirmDialogComponent, MachinereportComponent,    GraphDashboardComponent,ZoneDashboardComponent],
  imports: [
   
    FormsModule,

    BrowserModule,
    ShareModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    PerfectScrollbarModule,
    NavModule,
    ButtonModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SidebarModule,
    SharedModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    ListGroupModule,
    CardModule,
    BrowserModule, HttpClientModule,  GoogleMapsModule,FormsModule, FormsModule,  
    ReactiveFormsModule,PagesModule,  

  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
   
    DataService,
   
    IconSetService,
    Title
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
