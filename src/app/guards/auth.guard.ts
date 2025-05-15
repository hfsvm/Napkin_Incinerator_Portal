
// import { Injectable } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';
// import { CommonDataService } from '../Common/common-data.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//   constructor(private commonDataService: CommonDataService, private router: Router) {}

//   canActivate(): boolean {
//     const merchantId = this.commonDataService.merchantId; // ✅ Get merchant ID

//     console.log("AuthGuard executed! Checking authentication...");
    
//     if (merchantId) {
//       console.log("✅ User is authenticated!", merchantId);
//       return true;
//     }
    
//     console.error("❌ User is NOT authenticated! Redirecting to /login...");
//     this.router.navigate(['/login']);
//     return false;
//   }
// }



import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CommonDataService } from '../Common/common-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private commonDataService: CommonDataService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log("AuthGuard executed! Checking authentication...");
    
    // Check if merchantId is in URL parameters for new tab navigation
    const merchantIdFromUrl = route.queryParamMap.get('merchantId');
    
    if (merchantIdFromUrl) {
      console.log("MerchantId found in URL parameters:", merchantIdFromUrl);
      // Store the merchantId in CommonDataService and sessionStorage
      this.commonDataService.merchantId = merchantIdFromUrl;
      sessionStorage.setItem('merchantId', merchantIdFromUrl);
      sessionStorage.setItem('isAuthenticated', 'true');
      
      // Remove merchantId from URL for security
      this.cleanUrl();
      return true;
    }
    
    // Check if already authenticated (existing behavior)
    const merchantId = this.commonDataService.merchantId;
    
    if (merchantId) {
      console.log("✅ User is authenticated!", merchantId);
      return true;
    }
    
    // Try to get merchantId from sessionStorage as fallback
    const storedMerchantId = sessionStorage.getItem('merchantId');
    if (storedMerchantId) {
      console.log("✅ User authentication restored from session!", storedMerchantId);
      this.commonDataService.merchantId = storedMerchantId;
      return true;
    }
    
    console.error("❌ User is NOT authenticated! Redirecting to /login...");
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
  
  private cleanUrl(): void {
    // Remove merchantId from URL without navigation
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.href.split('?')[0];
      const params = new URLSearchParams(window.location.search);
      params.delete('merchantId');
      
      const newParams = params.toString();
      const newUrl = newParams ? `${cleanUrl}?${newParams}` : cleanUrl;
      
      window.history.replaceState({}, document.title, newUrl);
    }
  }
}
