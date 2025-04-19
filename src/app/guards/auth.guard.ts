
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
