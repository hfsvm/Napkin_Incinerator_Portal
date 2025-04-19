
import { Injectable } from '@angular/core';
import { CommonDataService } from '../Common/common-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor(private commonDataService: CommonDataService) {
    // ✅ Load authentication state from sessionStorage when service initializes
    this.isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    this.commonDataService.merchantId = sessionStorage.getItem('merchantId'); // Load merchantId
  }

  // ✅ Call this on successful login
  loginSuccess(merchantId: string): void {
    this.isAuthenticated = true;
    this.commonDataService.merchantId = merchantId; // ✅ Store in CommonDataService

    // ✅ Persist in session storage
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('merchantId', merchantId);

    console.log('AuthService: loginSuccess() called. isAuthenticated set to', this.isAuthenticated);
  }

  isLoggedIn(): boolean {
    console.log("AuthService → Checking authentication:", this.isAuthenticated);
    return this.isAuthenticated;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.commonDataService.merchantId = null; // ✅ Clear merchantId

    // ✅ Remove from session storage
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('merchantId');

    console.log('AuthService: logout() called. Authentication cleared.');
  }
}
