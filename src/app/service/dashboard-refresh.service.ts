// src/app/service/dashboard-refresh.service.ts

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardRefreshService {
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();
  private intervalId: any;

  startAutoRefresh() {
    if (!this.intervalId) {
      console.log('✅ Starting Auto-refresh service...');
      this.intervalId = setInterval(() => {
        console.log('🔁 Global Auto-refresh triggered...');
        this.refreshSubject.next();
      }, 120000); // 2 minutes
    } else {
      console.log('⚠️ Auto-refresh already started');
    }
  }
  

  stopAutoRefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
