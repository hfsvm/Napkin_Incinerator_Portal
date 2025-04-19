// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';


// @Injectable({
//   providedIn: 'root'
// })
// export class CommonDataService {
//   merchantId: string | null = null;
//   userId: number | null = null;
//   roleName: string | null = null;
//   userDetails: any = null;
//   userRefreshed$ = new Subject<void>();

//   constructor() {
//     this.loadUserDetails(); // ✅ Load details when service starts
//     setInterval(() => {
//       this.loadUserDetails(); // reload from storage every 2 min
//     }, 2 * 60 * 1000);
//   }

//   loadUserDetails() {
//     console.log("🔄 Loading User Details from Storage...");
//     this.userRefreshed$.next();
//     // Load from sessionStorage first, if empty then fallback to localStorage
//     this.merchantId = sessionStorage.getItem('merchantId') || localStorage.getItem('merchantId');
//     this.userId = Number(sessionStorage.getItem('userId')) || Number(localStorage.getItem('userId'));
//     this.roleName = sessionStorage.getItem('roleName') || localStorage.getItem('roleName');
//     this.userDetails = JSON.parse(sessionStorage.getItem('userDetails') || localStorage.getItem('userDetails') || '{}');

//     console.log("✅ CommonDataService Loaded:", {
//       merchantId: this.merchantId,
//       userId: this.userId,
//       roleName: this.roleName,
//       userDetails: this.userDetails
//     });
//     this.userRefreshed$.next();
//   }

//   updateUserDetails(userData: any) {
//     console.log("🔹 Updating User Details in Storage:", userData);

//     this.userId = userData.userId;
//     this.merchantId = userData.merchantId;
//     this.roleName = userData.roleName;
//     this.userDetails = userData;

//     // ✅ Save in both sessionStorage and localStorage
//     sessionStorage.setItem('merchantId', userData.merchantId);
//     sessionStorage.setItem('userId', userData.userId.toString());
//     sessionStorage.setItem('roleName', userData.roleName);
//     sessionStorage.setItem('userDetails', JSON.stringify(userData));

//     localStorage.setItem('merchantId', userData.merchantId);
//     localStorage.setItem('userId', userData.userId.toString());
//     localStorage.setItem('roleName', userData.roleName);
//     localStorage.setItem('userDetails', JSON.stringify(userData));

//     console.log("✅ User Details Updated in Both Storages.");
//   }

//   clearUserDetails() {
//     console.log("🔴 Clearing User Details...");

//     this.merchantId = null;
//     this.userId = null;
//     this.roleName = null;
//     this.userDetails = null;

//     // ✅ Clear both sessionStorage and localStorage
//     sessionStorage.removeItem('merchantId');
//     sessionStorage.removeItem('userId');
//     sessionStorage.removeItem('roleName');
//     sessionStorage.removeItem('userDetails');

//     localStorage.removeItem('merchantId');
//     localStorage.removeItem('userId');
//     localStorage.removeItem('roleName');
//     localStorage.removeItem('userDetails');

//     console.log("✅ User Details Cleared from Both Storages.");
//   }
//   getMerchantId(): string {
//     return this.merchantId || localStorage.getItem('merchantId') || '';
//   }
 
//   setMerchantId(id: string): void {
//     this.merchantId = id;
//     sessionStorage.setItem('merchantId', id);
//     localStorage.setItem('merchantId', id);
//   }

// }
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {
  merchantId: string | null = null;
  userId: number | null = null;
  roleName: string | null = null;
  userDetails: any = null;
  userRefreshed$ = new Subject<void>();

  constructor() {
    this.loadUserDetails(); // ✅ Load details when service starts
    this.startAutoRefresh(); // Start the auto-refresh for every 2 minutes
  }

  loadUserDetails() {
    console.log("🔄 Loading User Details from Storage...");
    this.userRefreshed$.next();
    
    // Load from sessionStorage first, if empty then fallback to localStorage
    this.merchantId = sessionStorage.getItem('merchantId') || localStorage.getItem('merchantId');
    this.userId = Number(sessionStorage.getItem('userId')) || Number(localStorage.getItem('userId'));
    this.roleName = sessionStorage.getItem('roleName') || localStorage.getItem('roleName');
    this.userDetails = JSON.parse(sessionStorage.getItem('userDetails') || localStorage.getItem('userDetails') || '{}');

    console.log("✅ CommonDataService Loaded:", {
      merchantId: this.merchantId,
      userId: this.userId,
      roleName: this.roleName,
      userDetails: this.userDetails
    });
    this.userRefreshed$.next();
  }

  updateUserDetails(userData: any) {
    console.log("🔹 Updating User Details in Storage:", userData);

    this.userId = userData.userId;
    this.merchantId = userData.merchantId;
    this.roleName = userData.roleName;
    this.userDetails = userData;

    // ✅ Save in both sessionStorage and localStorage
    sessionStorage.setItem('merchantId', userData.merchantId);
    sessionStorage.setItem('userId', userData.userId.toString());
    sessionStorage.setItem('roleName', userData.roleName);
    sessionStorage.setItem('userDetails', JSON.stringify(userData));

    localStorage.setItem('merchantId', userData.merchantId);
    localStorage.setItem('userId', userData.userId.toString());
    localStorage.setItem('roleName', userData.roleName);
    localStorage.setItem('userDetails', JSON.stringify(userData));

    console.log("✅ User Details Updated in Both Storages.");
  }

  clearUserDetails() {
    console.log("🔴 Clearing User Details...");

    this.merchantId = null;
    this.userId = null;
    this.roleName = null;
    this.userDetails = null;

    // ✅ Clear both sessionStorage and localStorage
    sessionStorage.removeItem('merchantId');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('roleName');
    sessionStorage.removeItem('userDetails');

    localStorage.removeItem('merchantId');
    localStorage.removeItem('userId');
    localStorage.removeItem('roleName');
    localStorage.removeItem('userDetails');

    console.log("✅ User Details Cleared from Both Storages.");
  }

  getMerchantId(): string {
    return this.merchantId || localStorage.getItem('merchantId') || '';
  }
  
  setMerchantId(id: string): void {
    this.merchantId = id;
    sessionStorage.setItem('merchantId', id);
    localStorage.setItem('merchantId', id);
  }

  // ✅ Method to handle auto-refresh every 2 minutes
  private startAutoRefresh() {
    setInterval(() => {
      console.log("🔄 Refreshing User Details...");
      this.loadUserDetails();  // Reload user details from sessionStorage/localStorage
    }, 2 * 60 * 1000); // 2 minutes interval
  }
  
  // ✅ On page reload, ensure the API is called to refresh the data
  refreshUserDetails() {
    console.log("🔄 Refreshing user details on page reload...");
    this.loadUserDetails();
    // Call your API here if necessary to get fresh data (e.g., `this.fetchUserDetailsFromApi()`).
  }
}
