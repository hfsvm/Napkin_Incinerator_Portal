import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonDataService {
  merchantId: string | null = null;
  userId: number | null = null;
  roleName: string | null = null;
  userDetails: any = null;
  userName: string | null = null;
  projectId: number | null = null;
  projectName: string | null = null;
  clientId: number | null = null;
  clientName: string | null = null;
  isSSAUser: boolean = false;
  
  userRefreshed$ = new Subject<void>();
  private refreshInterval: any;

  constructor() {
    this.loadUserDetails(); // Load details when service starts
    this.startAutoRefresh(); // Start the auto-refresh for every 2 minutes
  }

  loadUserDetails() {
    console.log('🔄 Loading User Details from Storage...');
    
    // ✅ Load from sessionStorage first, if empty then fallback to localStorage
    this.merchantId = sessionStorage.getItem('merchantId') || localStorage.getItem('merchantId');
    this.userId = Number(sessionStorage.getItem('userId')) || Number(localStorage.getItem('userId')) || null;
    this.userName = sessionStorage.getItem('userName') || localStorage.getItem('userName');
    this.roleName = sessionStorage.getItem('roleName') || localStorage.getItem('roleName');
    
    // ✅ Load new fields from sessionStorage first, then localStorage
    this.projectId = Number(sessionStorage.getItem('projectId')) || Number(localStorage.getItem('projectId')) || null;
    this.projectName = sessionStorage.getItem('projectName') || localStorage.getItem('projectName');
    this.clientId = Number(sessionStorage.getItem('clientId')) || Number(localStorage.getItem('clientId')) || null;
    this.clientName = sessionStorage.getItem('clientName') || localStorage.getItem('clientName');
    this.isSSAUser = (sessionStorage.getItem('isSSAUser') === 'true') || (localStorage.getItem('isSSAUser') === 'true') || this.projectId === 8;
    
    // Load userDetails from sessionStorage first, then localStorage
    const userDetailsStr = sessionStorage.getItem('userDetails') || localStorage.getItem('userDetails');
    if (userDetailsStr && userDetailsStr !== '{}' && userDetailsStr !== 'null') {
      try {
        this.userDetails = JSON.parse(userDetailsStr);
      } catch (e) {
        console.error('Error parsing userDetails:', e);
        this.userDetails = {};
      }
    } else {
      this.userDetails = {};
    }
    
    // ✅ Ensure userDetails has all fields
    if (this.userDetails) {
      if (this.projectId && !this.userDetails.projectId) this.userDetails.projectId = this.projectId;
      if (this.projectName && !this.userDetails.projectName) this.userDetails.projectName = this.projectName;
      if (this.clientId && !this.userDetails.clientId) this.userDetails.clientId = this.clientId;
      if (this.clientName && !this.userDetails.clientName) this.userDetails.clientName = this.clientName;
    }
    
    console.log('✅ CommonDataService Loaded:', {
      merchantId: this.merchantId,
      userId: this.userId,
      roleName: this.roleName,
      userName: this.userName,
      projectId: this.projectId,
      projectName: this.projectName,
      clientId: this.clientId,
      clientName: this.clientName,
      isSSAUser: this.isSSAUser,
      userDetails: this.userDetails
    });
    
    this.userRefreshed$.next();
  }

  updateUserDetails(userData: any) {
    console.log('🔹 Updating User Details in Storage:', userData);

    // Update service properties
    this.userId = userData.userId;
    this.merchantId = userData.merchantId;
    this.roleName = userData.roleName;
    this.userDetails = userData;
    this.userName = userData.userName;
    
    // ✅ Update new fields
    this.projectId = userData.projectId;
    this.projectName = userData.projectName;
    this.clientId = userData.clientId;
    this.clientName = userData.clientName;
    this.isSSAUser = this.projectId === 8;

    // ✅ Save to sessionStorage (primary storage for current session)
    sessionStorage.setItem('merchantId', userData.merchantId || '');
    sessionStorage.setItem('userId', userData.userId?.toString() || '');
    sessionStorage.setItem('roleName', userData.roleName || '');
    sessionStorage.setItem('userDetails', JSON.stringify(userData));
    sessionStorage.setItem('userName', userData.userName || '');
    
    // ✅ Save new fields to sessionStorage
    sessionStorage.setItem('projectId', userData.projectId?.toString() || '');
    sessionStorage.setItem('projectName', userData.projectName || '');
    sessionStorage.setItem('clientId', userData.clientId?.toString() || '');
    sessionStorage.setItem('clientName', userData.clientName || '');
    sessionStorage.setItem('isSSAUser', (this.projectId === 8).toString());

    // ✅ Save to localStorage (persistent storage for fallback)
    localStorage.setItem('merchantId', userData.merchantId || '');
    localStorage.setItem('userId', userData.userId?.toString() || '');
    localStorage.setItem('roleName', userData.roleName || '');
    localStorage.setItem('userDetails', JSON.stringify(userData));
    localStorage.setItem('userName', userData.userName || '');
    
    // ✅ Save new fields to localStorage
    localStorage.setItem('projectId', userData.projectId?.toString() || '');
    localStorage.setItem('projectName', userData.projectName || '');
    localStorage.setItem('clientId', userData.clientId?.toString() || '');
    localStorage.setItem('clientName', userData.clientName || '');
    localStorage.setItem('isSSAUser', (this.projectId === 8).toString());

    console.log('✅ User Details Updated in Both Storages (sessionStorage & localStorage)');
    this.userRefreshed$.next();
  }

  // ✅ Method to partially update user details (for refresh without losing data)
  partialUpdateUserDetails(updatedData: any) {
    console.log('🔄 Partially Updating User Details:', updatedData);
    
    // Merge existing userDetails with new data
    const mergedDetails = {
      ...this.userDetails,
      ...updatedData
    };
    
    // ✅ Preserve critical fields that shouldn't be overwritten
    mergedDetails.projectId = this.projectId || mergedDetails.projectId;
    mergedDetails.projectName = this.projectName || mergedDetails.projectName;
    mergedDetails.clientId = this.clientId || mergedDetails.clientId;
    mergedDetails.clientName = this.clientName || mergedDetails.clientName;
    
    // Update with merged data
    this.updateUserDetails(mergedDetails);
  }

  clearUserDetails() {
    console.log('🔴 Clearing User Details...');

    // Clear service properties
    this.merchantId = null;
    this.userId = null;
    this.roleName = null;
    this.userDetails = null;
    this.userName = null;
    this.projectId = null;
    this.projectName = null;
    this.clientId = null;
    this.clientName = null;
    this.isSSAUser = false;

    // ✅ Clear both sessionStorage and localStorage
    const keysToRemove = [
      'merchantId', 'userId', 'roleName', 'userDetails', 'userName',
      'projectId', 'projectName', 'clientId', 'clientName', 'isSSAUser'
    ];
    
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });

    console.log('✅ User Details Cleared from Both Storages (sessionStorage & localStorage)');
  }

  getMerchantId(): string {
    return this.merchantId || sessionStorage.getItem('merchantId') || localStorage.getItem('merchantId') || '';
  }

  setMerchantId(id: string): void {
    this.merchantId = id;
    sessionStorage.setItem('merchantId', id);
    localStorage.setItem('merchantId', id);
  }

  // ✅ Get projectId from service or storage
  getProjectId(): number | null {
    return this.projectId || 
           Number(sessionStorage.getItem('projectId')) || 
           Number(localStorage.getItem('projectId')) || 
           null;
  }

  // ✅ Get projectName from service or storage
  getProjectName(): string | null {
    return this.projectName || 
           sessionStorage.getItem('projectName') || 
           localStorage.getItem('projectName');
  }

  // ✅ Check if SSA user (projectId === 8)
  isSSALogin(): boolean {
    return this.isSSAUser || 
           this.getProjectId() === 8 ||
           sessionStorage.getItem('isSSAUser') === 'true' ||
           localStorage.getItem('isSSAUser') === 'true';
  }

  // ✅ Get dynamic labels based on login type
  getZoneLabel(): string {
    return this.isSSALogin() ? 'Segment' : 'Zone';
  }

  getWardLabel(): string {
    return this.isSSALogin() ? 'District' : 'Ward';
  }

  getBeatLabel(): string {
    return this.isSSALogin() ? 'Mandal' : 'Beat';
  }

  // ✅ Method to handle auto-refresh every 2 minutes
  private startAutoRefresh() {
    // Clear any existing interval to prevent memory leaks
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing User Details from Storage...');
      // Only reload from storage, don't fetch from API automatically
      // This preserves all existing data including projectId
      this.loadUserDetails();
    }, 2 * 60 * 1000); // 2 minutes interval
  }

  // ✅ Stop auto-refresh (call in ngOnDestroy of root component)
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Auto-refresh stopped');
    }
  }

  // ✅ Refresh user details from API (call this when you need fresh data)
  refreshUserDetailsFromApi(dataService: any) {
    if (this.merchantId && this.userId) {
      console.log('🔄 Fetching fresh user details from API...');
      
      dataService.getUserDetailsByHierarchy(this.merchantId, this.userId).subscribe(
        (response: any) => {
          if (response?.code === 200 && response?.data) {
            // Preserve critical fields
            const freshData = response.data;
            const preservedData = {
              ...freshData,
              projectId: this.getProjectId() || freshData.projectId,
              projectName: this.getProjectName() || freshData.projectName,
              clientId: this.clientId || freshData.clientId,
              clientName: this.clientName || freshData.clientName
            };
            this.updateUserDetails(preservedData);
            console.log('✅ Fresh user details loaded from API');
          }
        },
        (error: any) => {
          console.error('❌ Failed to refresh user details from API:', error);
        }
      );
    }
  }

  // ✅ Helper method to check if storage has all required fields
  validateStorage(): boolean {
    const requiredFields = ['merchantId', 'userId', 'roleName', 'projectId'];
    const hasSessionStorage = requiredFields.every(field => sessionStorage.getItem(field));
    const hasLocalStorage = requiredFields.every(field => localStorage.getItem(field));
    
    if (!hasSessionStorage) {
      console.warn('⚠️ Missing fields in sessionStorage');
    }
    if (!hasLocalStorage) {
      console.warn('⚠️ Missing fields in localStorage');
    }
    
    return hasSessionStorage || hasLocalStorage;
  }
}