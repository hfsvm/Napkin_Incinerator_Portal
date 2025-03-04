// import { Injectable } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service'; 

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(): boolean {
//     console.log("AuthGuard executed! Checking authentication...");
    
//     if (this.authService.isLoggedIn()) {
//       return true; // Allow access if authenticated
//     }

//     console.error("❌ User is NOT authenticated! Redirecting to /login...");
//     this.router.navigate(['/login']); // Redirect if not logged in
//     return false;
//   }
// }
// working
// import { Injectable } from '@angular/core';
// import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//     console.log("AuthGuard executed! Checking authentication...");
//     const loggedIn = this.authService.isLoggedIn();
//     console.log("AuthGuard: isLoggedIn returns", loggedIn);
//     if (loggedIn) {
//       return true; // Allow access if authenticated
//     }
//     console.error("❌ User is NOT authenticated! Redirecting to /login...");
//     this.router.navigate(['/login']);
//     return false;
//   }
// }

// import { Injectable } from '@angular/core';
// import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//     console.log("AuthGuard executed! Checking authentication...");
    
//     if (this.authService.isLoggedIn()) {
//       console.log("✅ User is authenticated!");
//       return true;
//     }
    
//     console.error("❌ User is NOT authenticated! Redirecting to /login...");
//     this.router.navigate(['/login']);
//     return false;
//   }
// }


import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CommonDataService } from '../Common/common-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private commonDataService: CommonDataService, private router: Router) {}

  canActivate(): boolean {
    const merchantId = this.commonDataService.merchantId; // ✅ Get merchant ID

    console.log("AuthGuard executed! Checking authentication...");
    
    if (merchantId) {
      console.log("✅ User is authenticated!", merchantId);
      return true;
    }
    
    console.error("❌ User is NOT authenticated! Redirecting to /login...");
    this.router.navigate(['/login']);
    return false;
  }
}
