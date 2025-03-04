import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {
  private _merchantId: string | null = sessionStorage.getItem('merchantId'); // Persist across refresh

  get merchantId(): string | null {
    return this._merchantId;
  }

  set merchantId(value: string | null) {
    this._merchantId = value;
    if (value) {
      sessionStorage.setItem('merchantId', value); // ✅ Store in session storage
    } else {
      sessionStorage.removeItem('merchantId'); // ✅ Clear if null
    }
  }

  constructor() {}
}
