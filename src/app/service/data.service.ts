

// import { Injectable } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
// import { retry, catchError, tap } from 'rxjs/operators';
// import { environment } from '../../environments/environment.prod';
// import { JsonPipe } from '@angular/common';
// import { timeout } from 'rxjs/operators';


// @Injectable({
//   providedIn: 'root'
// })
// export class DataService {
  

//   url = environment.url;
//   urll = environment.urll;
//   urlc = environment.urlc;
//   urla = environment.urla;
//   urlp = environment.urlp;
//   url1 = environment.url1;
//   urld = environment.urld;
//   url2 = environment.url2;

//   urlz=environment.urlz;
//   urlt=environment.urlt;
//   error: any;
//   merchantId: string | null = localStorage.getItem('merchantId'); // ✅ Automatically set from localStorage


//   constructor(private http: HttpClient) { }

// httpOptions = {
//   headers: new HttpHeaders({
//     'Content-Type': 'application/json',
//     'hfsKey': 'HFSAdmin@1',
//     'Access-Control-Allow-Origin' : 'http://localhost:4200',
//     'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, PATCH, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type, hfsKey'
//   })
// }  
// handleError(error:any) {
//   let errorMessage = '';
//   if(error.error instanceof ErrorEvent) {
//     errorMessage = error.error.message;
//   } else {
//     errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
//   }
//   window.alert(errorMessage);
//   return throwError(errorMessage);
// }
// getMachines(merchantId: string, fromNo: number = 0, count: number = 50): Observable<any> {
//   const url = `${this.urld}/merchantPortal/machines/${merchantId}/${fromNo}/${count}`;
//   const headers = new HttpHeaders({ 'hfskey': 'HFSAdmin@1' });

//   return this.http.get(url, { headers }).pipe(
//     retry(1),
//     catchError(this.handleError),
//     tap(response => console.log('Machines:', response))
//   );
// }

// // getIncineratorTransaction(merchantId: string, machineId: string, startDate: string, endDate: string, level1: string = '', level2: string = '', level3: string = ''): Observable<any> {
// //   console.log(merchantId);
// //   debugger;
// //   console.log("Connecting..." + this.urld + "/getMachineAndIncineratorTransaction/" 
// //               + merchantId + "/" + machineId + "/" + startDate + "/" + endDate 
// //               + "/" + level1 + "/" + level2 + "/" + level3);

// //   return this.http.get(this.urld + "/getMachineAndIncineratorTransaction/" 
// //               + merchantId + "/" + machineId + "/" + startDate + "/" + endDate 
// //               + "/" + level1 + "/" + level2 + "/" + level3, this.httpOptions)
// //     .pipe(
// //       retry(1),
// //       catchError(this.handleError),
// //       tap(response => console.log("GET Response:", response))
// //     );
// // }


// // getMachineAndIncineratorTransaction(
// //   startDate: string,
// //   endDate: string,
// //   merchantId: string,
// //   machineId: string,
// //   level1: string = '',
// //   level2: string = '',
// //   level3: string = ''
// // ): Observable<any> {
// //   console.log("Fetching machine and incinerator transaction data...");

// //   // Construct query parameters dynamically
// //   const params = new HttpParams()
// //     .set('startDate', startDate)
// //     .set('endDate', endDate)
// //     .set('merchantId', merchantId)
// //     .set('machineId', machineId)
// //     .set('level1', level1)
// //     .set('level2', level2)
// //     .set('level3', level3);

// //   console.log("Connecting to:", this.urld + "/getMachineAndIncineratorTransaction");

// //   // Make the HTTP GET request and return observable
// //   return this.http
// //     .get(this.urld + '/getMachineAndIncineratorTransaction', { params, ...this.httpOptions })
// //     .pipe(
// //       retry(1),
// //       catchError(this.handleError),
// //       tap((response) => console.log('GET Response:', response))
// //     );
// // }

// getMachineAndIncineratorTransaction(
//   startDate: string,
//   endDate: string,
//   merchantId: string,
//   machineIds: string[],  
//   level1: string[] = [],
//   level2: string[] = [],
//   level3: string[] = []
// ): Observable<any> {
//   let params = new HttpParams()
//     .set('merchantId', merchantId)
//     .set('startDate', `${startDate} 00:00:00`) // ✅ Add time part
//     .set('endDate', `${endDate} 23:59:00`);   // ✅ Add time part

//   machineIds.forEach(id => {
//     params = params.append('machineId', id); // ✅ Append multiple machine IDs
//   });

//   level1.forEach(lvl => params = params.append('level1', lvl));
//   level2.forEach(lvl => params = params.append('level2', lvl));
//   level3.forEach(lvl => params = params.append('level3', lvl));

//   console.log("Final API URL:", `${this.urld}/getMachineAndIncineratorTransaction`);
//   console.log("Final Params:", params.toString());

//   return this.http.get(`${this.urld}/getMachineAndIncineratorTransaction`, {
//     headers: new HttpHeaders({ 
//       'hfskey': 'HFSAdmin@1',  // ✅ Add required header
//       'accept': '*/*'
//     }),
//     params: params
//   }).pipe(
//     retry(1),
//     catchError(this.handleError),
//     tap(response => console.log("GET Response:", response))
//   );
// }



// getMachineDashboardSummary(
//   merchantId: string, 
//   machineStatus: string, 
//   stockStatus: string, 
//   burnStatus: string = '', 
//   level1: string = '', 
//   level2: string = '', 
//   level3: string = ''
// ): Observable<any> {
  
//   console.log(merchantId);
//   debugger;

//   console.log("Connecting..." + this.urld + "/getMachineDashboardSummary");

//   // Construct query parameters dynamically
//   const params = new HttpParams()
//     .set('merchantId', merchantId)
//     .set('machineStatus', machineStatus)
//     .set('stockStatus', stockStatus)
//     .set('burnStatus', burnStatus)
//     .set('level1', level1)
//     .set('level2', level2)
//     .set('level3', level3);

//   return this.http.get(this.urld + "/getMachineDashboardSummary", { params, ...this.httpOptions })
//     .pipe(
//       timeout(60000),
//       retry(1),
//       catchError(this.handleError),
//       tap(response => console.log("GET Response:", response))
//     );
// }

// getTransactions(merchantId: string): Observable<any> {
//   const url = `${this.url1}/merchantTransactions/${merchantId}/100/10`;
//   console.log("Fetching Transaction Data from:", url);

//   return this.http.get<any>(url, this.httpOptions).pipe(
//     retry(1),
//     tap(response => console.log("Transaction Data:", response)), 
//     catchError(this.handleError)
//   );
// }

// // login(merchantId: string, password: string, userId: string): Observable<any> {
// //   // const hardcodedMerchantId = 'ABC1234567'; // ✅ Always use this Merchant ID

// //   const loginPayload = { 
// //     merchantId, // 
// //     userId, 
// //     password 
// //   }; // Securely send data in the request body
// //   console.log("Connecting to:", `${this.url1}/login`);

// //   return this.http.post<any>(`${this.url1}/login`, loginPayload, this.httpOptions).pipe(
// //     retry(1), // Retry once if the request fails
// //     tap(response => {
// //       console.log("Login Response:", response); // Debugging
// //       if (response.statusCode === 200 &&response.response === "Success" ) { // Ensure token exists
// //          // Store token
// //         console.log('✅ ');
// //       } else {
// //         console.warn('❌ ');
// //       }
// //     }),
// //     catchError(this.handleError) // Handle errors
// //   );
// // }
// login(merchantId: string, password: string, userId: string): Observable<any> {
//   const loginPayload = { merchantId, userId, password };
//   console.log("Connecting to:", `${this.url1}/login`);

//   return this.http.post<any>(`${this.url1}/login`, loginPayload, this.httpOptions).pipe(
//     retry(1),
//     tap(response => {
//       console.log("Login Response:", response);
//       if (response.statusCode === 200 && response.response === "Success") { 
//         localStorage.setItem('merchantId', merchantId); // ✅ Save Merchant ID in localStorage
//         this.merchantId = merchantId; // ✅ Store in service variable
//         console.log('✅ Merchant ID saved:', merchantId);
//       } else {
//         console.warn('❌ Login Failed');
//       }
//     }),
//     catchError(this.handleError)
//   );
// }
// logout() {
//   localStorage.removeItem('merchantId');
//   this.merchantId = null; // ✅ Clear from service variable
//   console.log('🔴 Merchant ID removed from localStorage');
// }

// // Handle errors properly


// }


//good

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { retry, catchError, tap, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  url = environment.url;
  urld = environment.urld;
  url1 = environment.url1;
  urla= environment.urla;
  urlc= environment.urlc;
  merchantId: string | null = localStorage.getItem('merchantId');

  constructor(private http: HttpClient) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'hfsKey': 'HFSAdmin@1',
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, hfsKey'
    })
  };

  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
  getMachines(merchantId: string, fromNo: number = 0, count: number = 50): Observable<{ rowMachines: { machines: any[] }[] }> {
    const url = `${this.url1}/machines/${merchantId}/${fromNo}/${count}`;
    return this.http.get<{ rowMachines: { machines: any[] }[] }>(url, this.httpOptions).pipe(
      retry(1)
    );
  }

  /** 🔹 Extract only Machine IDs from the getMachines method **/
  getMachineIds(merchantId: string, fromNo: number = 0, count: number = 50): Observable<string[]> {
    return this.getMachines(merchantId, fromNo, count).pipe(
      map((response: { rowMachines: { machines: any[] }[] }) =>
        response.rowMachines[0].machines.map((m: any) => m.machineId)
      )
    );
  }

  /** 🔹 Extract only machine locations from the getMachines method **/
  getMachineLocations(merchantId: string, fromNo: number = 0, count: number = 50): Observable<any[]> {
    return this.getMachines(merchantId, fromNo, count).pipe(
      map((response: { rowMachines: { machines: any[] }[] }) =>
        response.rowMachines[0].machines.map((m: any) => ({
          machineId: m.machineId,
          name: m.vMName,
          latitude: m.latitude,
          longitude: m.logntitude, // Keeping as per API response (correct if typo)
          address: m.address,
          status: m.active === 1 ? 'Active' : 'Inactive'
        }))
      )
    );
  }





  
  getMachineAndIncineratorTransaction(
    startDate: string,
    endDate: string,
    merchantId: string,
    machineIds: string[],
    level1: string[] = [],
    level2: string[] = [],
    level3: string[] = []
  ): Observable<any> {
    console.log("Calling getMachineAndIncineratorTransaction with:", {
      startDate,
      endDate,
      merchantId,
      machineIds,
      level1,
      level2,
      level3
    });

    let params = new HttpParams()
      .set('merchantId', merchantId)
      .set('startDate', `${startDate} 00:00:00`)
      .set('endDate', `${endDate} 23:59:00`);

    machineIds.forEach(id => params = params.append('machineId', id));
    level1.forEach(lvl => params = params.append('level1', lvl));
    level2.forEach(lvl => params = params.append('level2', lvl));
    level3.forEach(lvl => params = params.append('level3', lvl));

    console.log("Final API URL:", `${this.urld}/getMachineAndIncineratorTransaction`);
    console.log("Final Params:", params.toString());

    return this.http.get(`${this.urld}/getMachineAndIncineratorTransaction`, { headers: this.httpOptions.headers, params }).pipe(
      retry(1),
      tap(response => console.log('API Response:', response)),
      catchError(this.handleError)
    );}

  getMachineDashboardSummary(
    merchantId: string, 
    machineStatus: string, 
    stockStatus: string, 
    burnStatus: string = '', 
    level1: string = '', 
    level2: string = '', 
    level3: string = ''
  ): Observable<any> {
    const params = new HttpParams()
      .set('merchantId', merchantId)
      .set('machineStatus', machineStatus)
      .set('stockStatus', stockStatus)
      .set('burnStatus', burnStatus)
      .set('level1', level1)
      .set('level2', level2)
      .set('level3', level3);

    return this.http.get(`${this.urld}/getMachineDashboardSummary`, { headers: this.httpOptions.headers, params }).pipe(
      timeout(60000),
      retry(1),
      catchError(this.handleError),
      tap(response => console.log('GET Response:', response))
    );
  }

  getTransactions(merchantId: string): Observable<any> {
    const url = `${this.url1}/merchantTransactions/${merchantId}/100/10`;
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap(response => console.log('Transaction Data:', response)),
      catchError(this.handleError)
    );
  }

  login(merchantId: string, password: string, userId: string): Observable<any> {
    const loginPayload = { merchantId, userId, password };
    return this.http.post<any>(`${this.url1}/login`, loginPayload, this.httpOptions).pipe(
      retry(1),
      tap(response => {
        console.log('Login Response:', response);
        if (response.statusCode === 200 && response.response === 'Success') {
          localStorage.setItem('merchantId', merchantId);
          this.merchantId = merchantId;
        }
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('merchantId');
    this.merchantId = null;
    console.log('🔴 Merchant ID removed from localStorage');
  }
}
