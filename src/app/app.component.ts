import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { DashboardRefreshService } from './service/dashboard-refresh.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'body',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'REALZEST VENDCON PORTAL';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private refreshService: DashboardRefreshService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };
    this.refreshService.startAutoRefresh();
  }

  // ngOnInit(): void {
  //   this.router.events.subscribe((evt) => {
  //     if (!(evt instanceof NavigationEnd)) {
  //       return;
  //     }
  //   });
  // }
  ngOnInit(): void {
    console.log('AppComponent initialized'); // 🔍 Debug log
  
    // Move this from constructor to ngOnInit
    this.refreshService.startAutoRefresh();
  
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        const url = evt.urlAfterRedirects || evt.url;
        if (url.startsWith('/external|')) {
          const externalUrl = url.replace('/external|', '');
          window.open(externalUrl, '_blank');
        }
      }
    });
  }
  
  
}
