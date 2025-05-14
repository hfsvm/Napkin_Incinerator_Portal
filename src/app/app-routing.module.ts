// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';

// import { DefaultLayoutComponent, EmailLayoutComponent } from './containers';
// import { Page404Component } from './views/pages/page404/page404.component';
// import { Page500Component } from './views/pages/page500/page500.component';
// import { LoginComponent } from './views/pages/login/login.component';
// import { RegisterComponent } from './views/pages/register/register.component';
// import { WidgetsComponent } from './views/widgets/widgets/widgets.component';
// import { AuthGuard } from './guards/auth.guard';
// import { VideosComponent } from './views/videos/videos.component';
//  import { UserManagementComponent } from './views/settings/user-management/user-management.component';
//  import { MachineManagementComponent } from './views/settings/machine-management/machine-management.component';
 
// import { AdvancedManagementComponent } from './views/settings/advanced-management/advanced-management.component';
// import { MachinedataComponent } from './views/machinedata/machinedata.component';

// const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'login',
//     pathMatch: 'full'
//   },
  
//   {
//     path: 'login',
//     component: LoginComponent,
//     data: {
//       title: 'Login Page'
//     }},

//     { path: 'dashboard', component: WidgetsComponent, canActivate: [AuthGuard] },
//     { path: 'dashboard', component: VideosComponent, canActivate: [AuthGuard] },


//   {
//     path: 'apps/email',
//     component: EmailLayoutComponent,

//     children: [
//       {
//         path: '',
//         loadChildren: () =>
//           import('./views/apps/email/email.module').then((m) => m.EmailModule)
//       }
//     ]
//   },
//   {
//     path: '',
//     component: DefaultLayoutComponent,
//     data: {
//       title: ''
//     },
//     children: [
//       {
//         path: 'machinedata',
//         loadChildren: () =>
//           import('./views/machinedata/machinedata.module').then((m) => m.MachinedataModule)
//       },
   
//       {
//         path: 'videos',
//         loadChildren: () =>
//           import('./views/videos/videos.module').then((m) => m.VideosModule)
//       },
  
//       {
//         path: 'theme',
//         loadChildren: () =>
//           import('./views/theme/theme.module').then((m) => m.ThemeModule)
//       },
//       {
//         path: 'base',
//         loadChildren: () =>
//           import('./views/base/base.module').then((m) => m.BaseModule)
//       },
//       {
//         path: 'buttons',
//         loadChildren: () =>
//           import('./views/buttons/buttons.module').then((m) => m.ButtonsModule)
//       },
//       {
//         path: 'forms',
//         loadChildren: () =>
//           import('./views/forms/forms.module').then((m) => m.CoreUIFormsModule)
//       },
//       {
//         path: 'icons',
//         loadChildren: () =>
//           import('./views/icons/icons.module').then((m) => m.IconsModule)
//       },
//       {
//         path: 'notifications',
//         loadChildren: () =>
//           import('./views/notifications/notifications.module').then((m) => m.NotificationsModule)
//       },
//       {
//         path: 'widgets',
//         loadChildren: () =>
//           import('./views/widgets/widgets.module').then((m) => m.WidgetsModule),
//         canActivate: [AuthGuard]
//       },
//       {
//         path: 'smart-table',
//         loadChildren: () =>
//           import('./views/smart-tables/smart-tables.module').then((m) => m.SmartTablesModule)
//       },
//       {
//         path: 'plugins',
//         loadChildren: () =>
//           import('./views/plugins/plugins.module').then((m) => m.PluginsModule)
//       },
//       {
//         path: 'pages',
//         loadChildren: () =>
//           import('./views/pages/pages.module').then((m) => m.PagesModule)
//       },
//       {
//         path: 'apps',
//         loadChildren: () =>
//           import('./views/apps/apps.module').then((m) => m.AppsModule)
//       },
//       {
//         path: 'settings',
//         data: { title: 'Settings' },
//         children: [
//           {
//             path: 'user-management',
//             component: UserManagementComponent,
//             data: { title: 'User Management' }
//           },
//           {
//             path: 'machine-management',
//             component: MachineManagementComponent,
//             data: { title: 'Machine Management' }
//           },
//           {
//             path: 'advanced-management',
//             component: AdvancedManagementComponent,
//             data: { title: '' }
//           }
//         ]
//       }
    
//     ]
//   },
//   { path: 'machinedata', component: MachinedataComponent },

//   {
//     path: '404',
//     component: Page404Component,
//     data: {
//       title: 'Page 404'
//     }
//   },
//   {
//     path: '500',
//     component: Page500Component,
//     data: {
//       title: 'Page 500'
//     }
//   },
//   {
//     path: 'login',
//     component: LoginComponent,
//     data: {
//       title: 'Login Page'
//     }
//   },
//   {
//     path: 'register',
//     component: RegisterComponent,
//     data: {
//       title: 'Register Page'
//     }
//   },
//   {path: '**', redirectTo: 'login'},
//   { path: '**', redirectTo: 'widget', pathMatch: 'full' }
// ];

// @NgModule({
//   imports: [
//     RouterModule.forRoot(routes, {
//       scrollPositionRestoration: 'top',
//       anchorScrolling: 'enabled',
//       initialNavigation: 'enabledBlocking'
//       // relativeLinkResolution: 'legacy'
//     })
//   ],
//   exports: [RouterModule]
// })
// export class AppRoutingModule {
// }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent, EmailLayoutComponent } from './containers';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';
import { WidgetsComponent } from './views/widgets/widgets/widgets.component';
import { AuthGuard } from './guards/auth.guard';
import { VideosComponent } from './views/videos/videos.component';
 import { UserManagementComponent } from './views/settings/user-management/user-management.component';
 import { MachineManagementComponent } from './views/settings/machine-management/machine-management.component';
 
import { AdvancedManagementComponent } from './views/settings/advanced-management/advanced-management.component';
import { MachinedataComponent } from './views/machinedata/machinedata.component';
import { MachinereportComponent } from './views/machinereport/machinereport.component';
import { GoogleMapsComponent } from './views/plugins/maps/google-maps.component';
import { ZoneDashboardComponent } from './views/zone-dashboard/zone-dashboard.component';
import { GraphDashboardComponent } from './views/graph-dashboard/graph-dashboard.component';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'standalone-map',
    component: GoogleMapsComponent
  },

  {
    path: 'zone-dashboard',
    component: ZoneDashboardComponent,
    data: {
      title: 'Zone Dashboard'
    }
  },

  {
    path: 'graph-dashboard',
    component: GraphDashboardComponent,
    data: {
      title: 'Graph Dashboard'
    }
  },
  // {
  //   path: '',
  //   component: ZoneDashboardComponent
  // },

  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }},

    // {
    //   path: 'zone/:id',
    //   component: ZoneDashboardComponent,
    //   data: {
    //     title: 'Zone Dashboard'
    //   }
    // },
  

    // { path: 'dashboard', component: WidgetsComponent, canActivate: [AuthGuard] },
    // { path: 'dashboard', component: VideosComponent, canActivate: [AuthGuard] },
    
    // other routes...


  {
    path: 'apps/email',
    component: EmailLayoutComponent,

    children: [
      {
        path: '',
        loadChildren: () =>
          import('./views/apps/email/email.module').then((m) => m.EmailModule)
      },
    ]
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: ''
    },
    children: [
      {
        path: 'machinedata',
        loadChildren: () =>
          import('./views/machinedata/machinedata.module').then((m) => m.MachinedataModule),
        
      },

    
    
      
   
      {
        path: 'videos',
        loadChildren: () =>
          import('./views/videos/videos.module').then((m) => m.VideosModule)
      },
      { path: 'machine-report/:machineId', component: MachinereportComponent },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule)
      },




      {
        path: 'base',
        loadChildren: () =>
          import('./views/base/base.module').then((m) => m.BaseModule)
      },
      {
        path: 'buttons',
        loadChildren: () =>
          import('./views/buttons/buttons.module').then((m) => m.ButtonsModule)
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./views/forms/forms.module').then((m) => m.CoreUIFormsModule)
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/icons.module').then((m) => m.IconsModule)
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/notifications.module').then((m) => m.NotificationsModule)
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/widgets.module').then((m) => m.WidgetsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'smart-table',
        loadChildren: () =>
          import('./views/smart-tables/smart-tables.module').then((m) => m.SmartTablesModule)
      },

      {
        path: 'plugins',
        loadChildren: () =>
          import('./views/plugins/plugins.module').then((m) => m.PluginsModule)
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule)
      },
      {
        path: 'apps',
        loadChildren: () =>
          import('./views/apps/apps.module').then((m) => m.AppsModule)
      },
      {
        path: 'settings',
        data: { title: 'Settings' },
        children: [
          {
            path: 'user-management',
            component: UserManagementComponent,
            data: { title: 'User Management' }
          },
          {
            path: 'machine-management',
            component: MachineManagementComponent,
            data: { title: 'Machine Management' }
          },
          {
            path: 'advanced-management',
            component: AdvancedManagementComponent,
            data: { title: '' }
          }
        ]
      }
    
    ]
  },
  


  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {path: '**', redirectTo: 'login'},
  { path: '**', redirectTo: 'widget', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking'
      // relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
