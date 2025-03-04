import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss']
})
export class DefaultHeaderComponent implements OnInit {
  @Input() sidebarId: string = "sidebar1";
  public isDarkMode: boolean = false; // Track dark mode state
  public dropdownOpen = false; // User dropdown state
  public showLogoutModal = false; // Logout modal state

  constructor() {}

  ngOnInit() {
    // ✅ Set Light Mode as Default
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = false; // Default to Light Mode
      localStorage.setItem('theme', 'light'); // Store it
    }
    this.applyTheme();
  }

  // ✅ Toggle Dark Mode when clicking the moon/sun icon
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  // ✅ Apply Dark Mode or Light Mode
  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  // ✅ Toggle Dropdown Menu
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // ✅ Show Logout Confirmation
  confirmLogout() {
    this.showLogoutModal = true;
    this.dropdownOpen = false;
  }

  // ✅ Logout User
  logout() {
    localStorage.removeItem('merchantId');
    this.showLogoutModal = false;
    window.location.href = '/login';
  }

  // ✅ Close Modal
  closeModal() {
    this.showLogoutModal = false;
  }
}
