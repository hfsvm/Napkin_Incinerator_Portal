import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { logoNegative, sygnet } from '../../icons/brand';
import { INavData } from '@coreui/angular-pro'; // ✅ Import INavData
import { navItems as allNavItems } from './_nav'; // ✅ Import all navigation items

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit {
  public logoNegative = logoNegative;
  public sygnet = sygnet;

  public title!: string;
  public navItems: INavData[] = []; // ✅ Explicitly define navItems type
  public activeItem: string = '';  

  public perfectScrollbarConfig = {
    suppressScrollX: true
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setUserNavItems(); // ✅ Set sidebar items based on role

    this.router.events.subscribe(() => {
      this.activeItem = this.router.url;
    });

    this.titleSubscribe();
  }

  titleSubscribe() {
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd && !event.snapshot.firstChild),
      map(value => {
        const activatedRoute = <ActivatedRoute><unknown>value;
        return activatedRoute.snapshot?.data?.['title'] ?? null;
      })
    ).subscribe((title: string | null) => {
      this.title = title ?? '';
    });
  }

  // ✅ Function to filter nav items based on user role
  setUserNavItems(): void {
    const userRole = localStorage.getItem('roleName') || sessionStorage.getItem('roleName') || 'User'; 
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'User'; 
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || ''; // 🔹 Get userId
  
    // 🛡️ Condition to hide "Settings" for userId == 15, even if Admin
    // const shouldHideSettings = userId === '15';
  
    // ✅ Logic to determine navItems
    if (userRole === 'Admin') {
      this.navItems = allNavItems; // Full access for other Admins
    } else {
      this.navItems = allNavItems.filter((item: INavData) => item.name !== 'Settings');
    }
  
    console.log('📌 Filtered Nav Items:', this.navItems);
  }
}  
