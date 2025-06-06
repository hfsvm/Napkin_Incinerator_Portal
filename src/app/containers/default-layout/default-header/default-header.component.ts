import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { interval, Subscription } from 'rxjs';

interface NotificationItem {
  machineId: string;
  message: string;
  seen: boolean;
}


@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss']
})
export class DefaultHeaderComponent implements OnInit, OnDestroy {
  @Input() sidebarId: string = "sidebar1";
  public isDarkMode: boolean = false;
  public dropdownOpen = false;
  public showLogoutModal = false;
  public userRole: string = 'Guest';
  public userName: string = 'Unknown'; // 🔹 Add this line
  public currentTime: string = '';  
  private intervalId: any; 
  public showLogoutTooltip: boolean = false;
  showNotifications = false;
  stockNotifications: NotificationItem[] = [];
  notificationSubscription!: Subscription;
  seenMachineIds: string[] = []; // ✅ collected IDs
  unseenCount: number = 0;

  constructor(
    private router: Router,
    private dataService: DataService,
    private commonDataService: CommonDataService
  ) {}

  ngOnInit() {
    // ✅ Load roleName
    const storedUserRole = sessionStorage.getItem('roleName') || localStorage.getItem('roleName');
    this.userRole = storedUserRole ? storedUserRole : 'Guest';

    // ✅ Load userName
    const storedUserName = sessionStorage.getItem('userName') || localStorage.getItem('userName');
    this.userName = storedUserName ? storedUserName : 'Unknown';

    console.log("🆔 Loaded User Role:", this.userRole);
    console.log("🙋 Loaded User Name:", this.userName);

    // Theme setup
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    // Clock
    this.updateTime();
    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);

    // Fetch notifications every 2 minutes
    this.notificationSubscription = interval(120000).subscribe(() => {
      this.fetchStockNotifications();
    });

    // Initial call
    this.fetchStockNotifications();
  }

  fetchStockNotifications() {

    const merchantId = this.commonDataService.merchantId || '';
    const userId = this.commonDataService.userId || 0;

    this.dataService.getStockInformation(merchantId, userId).subscribe({
      next: (response) => {
        if (response?.code === 200 && response?.data) {
          debugger;
          this.stockNotifications = response.data.map((machineId: string) => ({
      machineId,
      message: `${machineId} machine has low stock.`,
      seen: false // 👈 Needed to track seen state
    }));

        // 🔴 Count unseen notifications
        this.unseenCount = this.stockNotifications.filter(n => !n.seen).length;
          
        }
      },
      error: (error) => {
        console.error('Error fetching stock notification data: ', error);
      },
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
    this.fetchStockNotifications(); // 🔄 Fetch fresh data on bell click
  }
  }

  closeNotifications() {
  this.showNotifications = false;

  if (this.seenMachineIds.length > 0) {
    const merchantId = this.commonDataService.merchantId || '';
    const userId = this.commonDataService.userId || 0;

    const payload = {
      machineId: this.seenMachineIds,
      merchantId,
      userId
    };

    this.dataService.saveStockSeenInformation(payload).subscribe({
      next: (response) => {
        console.log('✅ Bulk seen update success', response);
        this.seenMachineIds = []; // ✅ clear after sending
      },
      error: (err) => {
        console.error('❌ Error sending bulk seen IDs:', err);
      }
    });
  }
}

 markAsSeen(notification: NotificationItem): void {
  if (!notification.seen) {
    notification.seen = true; // disable button
    this.seenMachineIds.push(notification.machineId); // ✅ collect
    this.unseenCount--; // 🔻 Decrease badge count
  }
}


  ngOnDestroy() {

    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateTime() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.currentTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  confirmLogout() {
    this.showLogoutModal = true;
    this.dropdownOpen = false;
  }

  logout(): void {
    console.log('🚪 Logging out...');
    sessionStorage.removeItem('merchantId');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('roleName');
    sessionStorage.removeItem('userName'); // ✅ clear userName too

    localStorage.removeItem('merchantId');
    localStorage.removeItem('userId');
    localStorage.removeItem('roleName');
    localStorage.removeItem('userName'); // ✅ clear userName too

    this.userRole = 'Guest';
    this.userName = 'Unknown';

    this.commonDataService.merchantId = null;
    this.commonDataService.userId = null;


    this.router.navigate(['/#/login']);
  }

  closeModal() {
    this.showLogoutModal = false;
  }
}
