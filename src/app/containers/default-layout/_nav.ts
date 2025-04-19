import { INavData } from '@coreui/angular-pro';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/widgets',
    iconComponent: { name: 'cil-speedometer' },
    // badge: {
    //   // color: 'info',
    //   // text: 'NEW'
    // },
  
  },
  

  { name: 'Machine Data',
    url: '/machinedata',
     iconComponent: { name: 'cil-spreadsheet' },
     },
  {
    name: 'Reports',
    url: '/smart-table',
    iconComponent: { name: 'cil-grid'},
   
  },
 


  // {
  //   name: 'Machine Map',
  //   iconComponent: { name: 'cil-LocationPin' },
  //   url: '/plugins/google-maps',
    

  // },
  {
    name: 'Google Map',
    url: '/standalone-map',
    iconComponent: { name: 'cil-location-pin' },
    attributes: { target: '_blank' }  // Add target="_blank" to open in a new tab
  },
  
  
  
  
  
  {
    name: 'Video library',
    iconComponent: { name: 'cil-star' },
    url: 'videos'
  },
  {
    name: 'Settings',
    iconComponent: { name: 'cil-settings' },
    url: '/settings',
    children: [
      {
        name: 'User Management',
        url: '/settings/user-management'
      },
      {
        name: 'Machine Management',
        url: '/settings/machine-management'
      },
      {
        name: 'Advanced Configurations',
        url: '/settings/advanced-management'
      }
    ]
  }

  // {
  //   // title: true,
  //   // name: 'Extras'
  // },
  // {
    // name: 'Pages',
    // url: '/login',
    // iconComponent: { name: 'cil-star' },
  //   children: [
  //     {
  //       name: 'Login',
  //       url: '/login'
  //     },
      
  //     {
  //       name: 'Register',
  //       url: '/register'
  //     },
  //     {
  //       name: 'Error 404',
  //       url: '/404'
  //     },
  //     {
  //       name: 'Error 500',
  //       url: '/500'
  //     }
  //   ]
  // },
  // {
  //   // name: 'Apps',
  //   // url: '/apps',
  //   // iconComponent: { name: 'cil-layers' },
  //   children: [
  //     {
  //       name: 'Invoicing',
  //       iconComponent: { name: 'cil-spreadsheet' },
  //       url: '/apps/invoicing',
  //       children: [
  //         {
  //           name: 'Invoice',
  //           badge: {
  //             color: 'danger-gradient',
  //             text: 'PRO'
  //           },
  //           url: '/apps/invoicing/invoice'
  //         }
  //       ]
  //     },
  //     {
  //       name: 'Email',
  //       url: '/apps/email',
  //       iconComponent: { name: 'cil-envelope-open' },
  //       children: [
  //         {
  //           name: 'Inbox',
  //           badge: {
  //             color: 'danger-gradient',
  //             text: 'PRO'
  //           },
  //           url: '/apps/email/inbox'
  //         },
  //         {
  //           name: 'Message',
  //           badge: {
  //             color: 'danger-gradient',
  //             text: 'PRO'
  //           },
  //           url: '/apps/email/message'
  //         },
  //         {
  //           name: 'Compose',
  //           badge: {
  //             color: 'danger-gradient',
  //             text: 'PRO'
  //           },
  //           url: '/apps/email/compose'
  //         }
  //       ]
  //     }
  //   ]
  // }
];
