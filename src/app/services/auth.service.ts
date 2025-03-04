// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   getMerchantId(): string | null {
//     throw new Error('Method not implemented.');
//   }
//   private isAuthenticated = false; // Store auth state here

//   loginSuccess() {
//     this.isAuthenticated = true; // Set to true on successful login
//   }

//   isLoggedIn(): boolean {
//     console.log("AuthService → Checking authentication:", this.isAuthenticated);
//     return this.isAuthenticated; // Return auth status
//   }

//   logout() {
//     this.isAuthenticated = false; // Reset on logout
//   }
// }

// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private isAuthenticated = false; // In-memory flag

//   // Call this when login is successful
//   loginSuccess(merchantId: string): void {
//     this.isAuthenticated = true;
//     localStorage.setItem('isLoggedIn', 'true');
//     localStorage.setItem('merchantId', merchantId);
//     console.log('AuthService: loginSuccess called. isAuthenticated set to', this.isAuthenticated);
//   }

//   // Check if the user is logged in (first by in-memory flag, then from localStorage)
//   isLoggedIn(): boolean {
//     const stored = localStorage.getItem('isLoggedIn');
//     console.log("AuthService → Checking authentication:", this.isAuthenticated, stored);
//     return this.isAuthenticated || stored === 'true';
//   }

//   // Retrieve the stored merchantId
//   getMerchantId(): string | null {
//     return localStorage.getItem('merchantId');
//   }

//   // Logout clears the authentication state
//   logout(): void {
//     this.isAuthenticated = false;
//     localStorage.removeItem('isLoggedIn');
//     localStorage.removeItem('merchantId');
//   }
// }

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
