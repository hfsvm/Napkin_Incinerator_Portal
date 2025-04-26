 
// import { Injectable } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
// import { retry, catchError, tap, timeout, map } from 'rxjs/operators';
// import { environment } from '../../environments/environment.prod';
// import { CommonDataService } from '../Common/common-data.service';
 
// @Injectable({
//   providedIn: 'root'
// })
// export class DataService {
//   url = environment.url;
//   urld = environment.urld;
//   url1 = environment.url1;
//   urla= environment.urla;
//   urlc= environment.urlc;
//   merchantId: string | null = localStorage.getItem('merchantId');
 
 
//   constructor(private http: HttpClient,private commonDataService: CommonDataService) {}
 
//   private httpOptions = {
//     headers: new HttpHeaders({
//       'Content-Type': 'application/json',
//       'hfsKey': 'HFSAdmin@1',
//       'Access-Control-Allow-Origin': 'http://localhost:4200',
//       'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, PATCH, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, hfsKey'
//     })
//   };
 
//   private handleError(error: any) {
//     let errorMessage = '';
//     if (error.error instanceof ErrorEvent) {
//       errorMessage = error.error.message;
//     } else {
//       errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
//     }
//     // window.alert(errorMessage);
//     return throwError(errorMessage);
//   }
 
//   getMachines(merchantId: string, fromNo: number = 0, count: number = 50): Observable<{ rowMachines: { machines: any[] }[] }> {
//     if (!merchantId) {
//         console.error("❌ Merchant ID is missing! Cannot fetch machines.");
//         return throwError(() => new Error("Merchant ID is required"));
//     }
 
//     const url = `${this.url1}/machines/${merchantId}/${fromNo}/${count}`.replace(/([^:]\/)\/+/g, "$1");
//     console.log("📡 Fetching machine data from:", url);
 
//     return this.http.get<{ rowMachines: { machines: any[] }[] }>(url, this.httpOptions).pipe(
//       retry(1)
//     );
// }
 
 
//   /** 🔹 Extract only Machine IDs from the getMachines method **/
//   getMachineIds(merchantId: string, fromNo: number = 0, count: number = 50): Observable<string[]> {
//     return this.getMachines(merchantId, fromNo, count).pipe(
//       map((response: { rowMachines: { machines: any[] }[] }) =>
//         response.rowMachines[0].machines.map((m: any) => m.machineId)
//       )
//     );
//   }
 
//   /** 🔹 Extract only machine locations from the getMachines method **/
//   getMachineLocations(merchantId: string, fromNo: number = 0, count: number = 50): Observable<any[]> {
//     return this.getMachines(merchantId, fromNo, count).pipe(
//       map((response: { rowMachines: { machines: any[] }[] }) =>
//         response.rowMachines[0].machines.map((m: any) => ({
//           machineId: m.machineId,
//           name: m.vMName,
//           latitude: m.latitude,
//           longitude: m.logntitude, // Keeping as per API response (correct if typo)
//           address: m.address,
//           status: m.active === 1 ? 'Active' : 'Inactive'
//         }))
//       )
//     );
//   }
 
 
 
 
//   // getMachineAndIncineratorTransaction(
//   //   startDate: string,
//   //   endDate: string,
//   //   merchantId: string,
//   //   machineIds: string[],  
//   //   level1: string[] = [],
//   //   level2: string[] = [],
//   //   level3: string[] = []
//   // ): Observable<any> {
//   //   let params = new HttpParams()
//   //     .set('merchantId', merchantId)
//   //     .set('startDate', `${startDate} 00:00:00`)
//   //     .set('endDate', `${endDate} 23:59:00`);
 
//   //   machineIds.forEach(id => params = params.append('machineId', id));
//   //   level1.forEach(lvl => params = params.append('level1', lvl));
//   //   level2.forEach(lvl => params = params.append('level2', lvl));
 
//   //   // ✅ Override level3 to always send "1" while keeping UI unchanged
//   //   params = params.append('level3', "1");
 
//   //   console.log("📡 Final API URL:", `${this.urld}/getMachineAndIncineratorTransaction`);
//   //   console.log("📡 Final Params:", params.toString());
 
//   //   return this.http.get(`${this.url1}/getMachineAndIncineratorTransaction`, {
//   //     headers: new HttpHeaders({
//   //       'hfskey': 'HFSAdmin@1',
//   //       'accept': '*/*'
//   //     }),
//   //     params: params
//   //   }).pipe(
//   //     retry(1),
//   //     catchError(this.handleError),
//   //     tap(response => console.log("GET Response:", response))
//   //   );
//   // }
 
//   // getMachineAndIncineratorTransaction(
//   //   startDate: string,
//   //   endDate: string,
//   //   merchantId: string,
//   //   machineIds: string[],  
//   //   level1: string[] = [],
//   //   level2: string[] = [],
//   //   level3: string[] = []  // 🔹 Now dynamic, not hardcoded
//   // ): Observable<any> {
//   //   let params = new HttpParams()
//   //     .set('merchantId', merchantId)
//   //     .set('startDate', `${startDate} 00:00:00`)
//   //     .set('endDate', `${endDate} 23:59:00`);
 
//   //   // Dynamically append all machine IDs
//   //   machineIds.forEach(id => params = params.append('machineId', id));
 
//   //   // Dynamically append levels if provided
//   //   level1.forEach(lvl => params = params.append('level1', lvl));
//   //   level2.forEach(lvl => params = params.append('level2', lvl));
//   //   level3.forEach(lvl => params = params.append('level3', lvl));  // 🔹 No more hardcoding
 
//   //   console.log("📡 Final API URL:", `${this.url1}/getMachineAndIncineratorTransaction`);
//   //   console.log("📡 Final Params:", params.toString());
 
//   //   return this.http.get(`${this.url1}/getMachineAndIncineratorTransaction`, {
//   //     headers: new HttpHeaders({
//   //       'hfskey': 'HFSAdmin@1',
//   //       'accept': '*/*'
//   //     }),
//   //     params: params
//   //   }).pipe(
//   //     retry(1),
//   //     catchError(this.handleError),
//   //     tap(response => console.log("GET Response:", response))
//   //   );
//   // }
 
//   getMachineAndIncineratorTransaction(
//     startDate: string,
//     endDate: string,
//     merchantId: string,
//     machineIds: string[],  
//     level1: string[] = [],
//     level2: string[] = [],
//     level3: string[] = [],
//     level4: string[] = []
//   ): Observable<any> {
//     let params = new HttpParams();
 
//     // Ensure the order of parameters matches the API expectation
//     params = params.set('endDate', `${endDate} 23:59:00`);
//     level1.forEach(lvl => params = params.append('level1', lvl));
//     level2.forEach(lvl => params = params.append('level2', lvl));
//     level3.forEach(lvl => params = params.append('level3', lvl));
//     level4.forEach(lvl => params = params.append('level4', lvl));
//     params = params.set('merchantId', merchantId);
//     params = params.set('startDate', `${startDate} 00:00:00`);
 
//     // Ensure machine IDs are appended correctly
//     machineIds.forEach(id => {
//       params = params.append('machineId', id);
//     });
 
//     console.log("📡 Final API URL:", `${this.url1}/getMachineAndIncineratorTransaction`);
//     console.log("📡 Final Params:", params.toString());
 
//     return this.http.get(`${this.url1}/getMachineAndIncineratorTransaction`, {
//       headers: new HttpHeaders({
//         'hfskey': 'HFSAdmin@1',
//         'accept': '*/*'
//       }),
//       params: params
//     }).pipe(
//       retry(1),
//       catchError(this.handleError),
//       tap(response => console.log("GET Response:", response))
//     );
//   }
 
 
//   getMachineTransaction(
//     merchantId: string,
//     machineId: string,
//     startDate: string,
//     endDate: string
//   ): Observable<any> {
//     const encodedStartDate = encodeURIComponent(`${startDate} 00:00:00`);
//     const encodedEndDate = encodeURIComponent(`${endDate} 23:59:00`);
   
//     const url = `${this.url1}/machineTransactions/${merchantId}/${machineId}/${encodedStartDate}/${encodedEndDate}`;
//     console.log("📡 API CALL:", url);
 
//     return this.http.get(url, this.httpOptions).pipe(
//       retry(1),
//       tap(response => console.log('🔹 Machine Transactions Response:', response)),
//       catchError(this.handleError)
//     );
//   }
 
 
 
//   getIncInerationTransaction(
//     merchantId: string,
//     machineId: string,
//     startDate: string,
//     endDate: string
//   ): Observable<any> {
//     const encodedStartDate = encodeURIComponent(`${startDate} 00:00:00`);
//     const encodedEndDate = encodeURIComponent(`${endDate} 23:59:00`);
 
//     const url = `${this.url1}/incineratorTransactions/${merchantId}/${machineId}/${encodedStartDate}/${encodedEndDate}`;
//     console.log("📡 API CALL:", url);
 
//     return this.http.get(url, this.httpOptions).pipe(
//       retry(1),
//       tap(response => console.log('🔹 Incineration Transactions Response:', response)),
//       catchError(this.handleError)
//     );
//   }
 
 
//   getAdvanceConfig(
//     merchantId: string,
//     machineId: string,
   
//   ): Observable<any> {
 
 
//     const url = `${this.url1}/getAdvancedConfig/${merchantId}/${machineId}`;
//     console.log("📡 API CALL:", url);
 
//     return this.http.get(url, this.httpOptions).pipe(
//       retry(1),
//       tap(response => console.log('🔹 advanced Response:', response)),
//       catchError(this.handleError)
//     );
//   }
 
//     getMachineDashboardSummary(queryParams: any): Observable<any> {
//       let params = new HttpParams();
   
//       // ✅ Correctly format query params, especially for `machineId`
//       Object.keys(queryParams).forEach((key) => {
//         if (queryParams[key]) {
//           if (Array.isArray(queryParams[key])) {
//             queryParams[key].forEach((value: string) => {
//               params = params.append(key, value);  // ✅ Append `machineId` properly
//             });
//           } else {
//             params = params.set(key, queryParams[key]);
//           }
//         }
//       });
   
//       const apiUrl = `${this.url1}/getMachineDashboardSummary?${params.toString()}`;
     
//       // ✅ Print the exact API URL
//       console.log("📡 API CALL URL:", apiUrl);
   
//       return this.http.get(apiUrl, { headers: this.httpOptions.headers }).pipe(
//         timeout(60000),
//         retry(1),
//         catchError(this.handleError),
//         tap(response => console.log('✅ GET Response:', response))
//       );
//     }
//     getMachineLevelData(merchantId: string): Observable<any> {
//       if (!merchantId) {
//         console.error("❌ Merchant ID not found. Cannot fetch machine level data.");
//         return throwError(() => new Error("Merchant ID is required"));
//       }
   
//       const url = `${this.url1}/getMachineLevel/${merchantId}`;
//       console.log("📡 Fetching machine level data from:", url);
   
//       const httpOptions = {
//         headers: new HttpHeaders({
//           'Content-Type': 'application/json',
//           'hfskey': 'HFSAdmin@1'
//         })
//       };
   
//       return this.http.get<any>(url, httpOptions).pipe(
//         retry(1),
//         tap(response => {
//           if (response?.code === 200) {
//             console.log('✅ Machine Level Response:', response);
//           } else {
//             console.warn('⚠️ Unexpected machine level response:', response);
//           }
//         }),
//         catchError(this.handleError)
//       );
//     }
 
//     advnaceconfig(advnaceconfig: any): Observable<any> {
//       const url = `${this.url1}/updateAdvancedConfig`;  // ✅ Updated API endpoint with flag
   
//       return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
//         retry(1),  // ✅ Retry once on failure
//         tap(response => console.log('🔹 advance Config Response:', response)),
//         catchError(this.handleError)  // ✅ Handle errors
//       );
//     }
   
//     advnaceconfig2(advnaceconfig: any): Observable<any> {
//       const url = `${this.url1}/sendQRBusinessconfig`;  // ✅ Updated API endpoint with flag
   
//       return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
//         retry(1),  // ✅ Retry once on failure
//         tap(response => console.log('🔹 advance Config Response:', response)),
//         catchError(this.handleError)  // ✅ Handle errors
//       );
//     }
//     // businessConfig(businessConfig: any): Observable<any> {
//     //   const url = `${this.url1}/businessconfig`;  // ✅ API endpoint
   
//     //   return this.http.post(url, businessConfig, this.httpOptions).pipe(
//     //     retry(1),  // ✅ Retry once on failure
//     //     tap(response => console.log('🔹 Business Config Response:', response)),
//     //     catchError(this.handleError)  // ✅ Handle errors
//     //   );
//     // }// no flag in this
//     businessConfig(businessConfig: any, flag: string): Observable<any> {
//       const url = `${this.url1}/saveBusinessconfig/${flag}`;  // ✅ Updated API endpoint with flag
   
//       return this.http.post(url, businessConfig, this.httpOptions).pipe(
//         retry(1),  // ✅ Retry once on failure
//         tap(response => console.log('🔹 Business Config Response:', response)),
//         catchError(this.handleError)  // ✅ Handle errors
//       );
//     }
   
//     // techconfig(techconfig: any): Observable<any> {
//     //   const url = `${this.url1}/techconfig`;  // ✅ API endpoint
//     //updateAdvancedConfig
//     //   return this.http.post(url, techconfig, this.httpOptions).pipe(
//     //     retry(1),  // ✅ Retry once on failure
//     //     tap(response => console.log('🔹 techconfig Config Response:', response)),
//     //     catchError(this.handleError)  // ✅ Handle errors
//     //   );
//     // }// no flag in this
//     // techconfig(techconfig: any, flag: string): Observable<any> {
//     //   const url = `${this.url1}/saveTechconfig/${flag}`;  // ✅ Updated API endpoint with flag
   
//     //   return this.http.post(url, techconfig, this.httpOptions).pipe(
//     //     retry(1),  // ✅ Retry once on failure
//     //     tap(response => console.log('🔹 Tech Config Response:', response)),
//     //     catchError(this.handleError)  // ✅ Handle errors
//     //   );
//     // }
//     techconfig(techconfig: any, flag: string): Observable<any> {
//       const url = `${this.url1}/saveTechconfig/${flag}`;
     
//       console.log('📡 Sending Request to:', url);
//       console.log('📤 Payload:', JSON.stringify(techconfig));
//       console.log('📝 Headers:', this.httpOptions);
   
//       return this.http.post(url, techconfig, this.httpOptions).pipe(
//         retry(1),
//         tap(response => console.log('✅ Tech Config Response:', response)),
//         catchError(this.handleError)
//       );
//     }
   
   
//     getBusinessConfig(merchantId: string, machineId: string): Observable<any> {
//       const url = `${this.url1}/getBusinessConfig/${merchantId}/${machineId}`;
//       console.log("📡 API CALL:", url);
   
//       return this.http.get(url, this.httpOptions).pipe(
//         retry(1),  // Retry once in case of failure
//         tap(response => console.log('🔹 Business Config Response:', response)),
//         catchError(this.handleError)  // Handle any errors
//       );
//     }
   
//     getTechConfig(merchantId: string, machineId: string, field: string): Observable<any> {
//       const url = `${this.url1}/getTechconfig/${merchantId}/${machineId}/${field}`;
//       console.log("📡 API CALL:", url);
   
//       return this.http.get(url, this.httpOptions).pipe(
//         retry(1),  // Retry once in case of failure
//         tap(response => console.log('🔹 Tech Config Response:', response)),
//         catchError(this.handleError)  // Handle any errors
//       );
//     }
   
//   getTransactions(merchantId: string): Observable<any> {
//     const url = `${this.url1}/merchantTransactions/${merchantId}/100/10`;
//     return this.http.get(url, this.httpOptions).pipe(
//       retry(1),
//       tap(response => console.log('Transaction Data:', response)),
//       catchError(this.handleError)
//     );
//   }
//  /** 🔹 Login API */
//  login(email: string, password: string, merchantId: string,captcha:string): Observable<any> {
//   const url = `${this.url1}/login`;
//   console.log("📡 API CALL:", url);
 
//   const body = { email, password,merchantId,captcha };
//   return this.http.post(url, body, this.httpOptions).pipe(
//     retry(1),
//     tap(response => console.log('🔹 Login Response:', response)),
//     catchError(this.handleError)
//   );
// }
//   /** 🔹 Get User Details */
//   getUserDetails(merchantId: string, userId: number): Observable<any> {
//     const url = `${this.url1}/getUserDetails/${merchantId}/${userId}`;
//     console.log("📡 API CALL:", url);
 
//     return this.http.get(url, this.httpOptions).pipe(
//       retry(1),
//       tap(response => console.log('🔹 User Details Response:', response)),
//       catchError(this.handleError)
//     );
//   }
 
//   getCaptcha(): Observable<any> {
//     const url = `${this.url1}/getCaptcha`;  // ✅ Updated API endpoint with flag
 
//     return this.http.get(url, this.httpOptions).pipe(
//       retry(1),  // ✅ Retry once on failure
//       tap(response => console.log('capatcha ', response)),
//       catchError(this.handleError)  // ✅ Handle errors
//     );
//   }
 
//   logout() {
//     localStorage.removeItem('merchantId');
//     this.merchantId = null;
//     console.log('🔴 Merchant ID removed from localStorage');
//   }
//   private statesUrl = 'https://states-api.onrender.com/api/states';
//   private districtsUrl = 'https://states-api.onrender.com/api/districts/';
 
 
 
 
//   // Fetch all states
//   getStates(): Observable<any> {
//     return this.http.get<any>(this.statesUrl);
//   }
 
//   getDistricts(state: string): Observable<any> {
//     let url = `https://states-api.onrender.com/api/districts/${state}`;
//     console.log('Fetching districts from:', url); // Debugging log
//     return this.http.get<any>(url);
// }
 
// getMachineDashboardSummary1(
//   merchantId: string,
//   machineStatus: string,
//   stockStatus: string,
//   burnStatus: string = '',
//   level1: string = '',
//   level2: string = '',
//   level3: string = '',
//    level4: string = ''
// ): Observable<any> {
//   const params = new HttpParams()
//     .set('merchantId', merchantId)
//     .set('machineStatus', machineStatus)
//     .set('stockStatus', stockStatus)
//     .set('burnStatus', burnStatus)
//     .set('level1', level1)
//     .set('level2', level2)
//     .set('level3', level3)
//     .set('level4', level4);;
 
//   return this.http.get(`${this.urld}/getMachineDashboardSummary`, { headers: this.httpOptions.headers, params }).pipe(
//     timeout(60000),
//     retry(1),
//     catchError(this.handleError),
//     tap(response => console.log('GET Response:', response))
//   );
// }
 
 
 
 
//   //  /** 🔹 Save And Update Users for Incinerator Vending Machine **/
//   //  saveAndUpdateUser(userData: any): Observable<any> {
//   //   const url = `${this.url2}/saveAndUpdateUsers`;
//   //   console.log("📡 Sending user data to:", url, userData);
 
//   //     // Add the `hfskey` header
//   // const headers = new HttpHeaders({
//   //   'Content-Type': 'application/json',
//   //   'hfskey': 'HFSAdmin@1',  // 🔹 Add this
//   // });
 
 
//   //   return this.http.post<any>(url, userData, this.httpOptions).pipe(
//   //     retry(1),
//   //     tap((response:any) => console.log('✅ User Saved/Updated Successfully:', response)),
//   //     catchError(this.handleError)
//   //   );
//   // }
 
//   saveAndUpdateUser(userData: any): Observable<any> {
//     const url = `${this.url1}/saveAndUpdateUsers`;
 
//     console.log("📡 Sending user data to:", url, userData); // Debugging log
 
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'hfskey': 'HFSAdmin@1' // Ensure the required header is included
//       })
//     };
 
//     return this.http.post<any>(url, userData, httpOptions).pipe(
//       retry(1),
//       tap((response: any) => console.log('✅ User Saved/Updated Successfully:', response)),
//       catchError(this.handleError)
//     );
//   }
 
 
//   createClient(clientData: any): Observable<any> {
//     const url = `${this.url1}/saveAndUpdateClients`; // Update with correct API endpoint
 
//     console.log("📡 Sending client data to:", url, clientData); // Debugging log
 
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'hfskey': 'HFSAdmin@1' // Ensure the required header is included
//       })
//     };
 
//     return this.http.post<any>(url, clientData, httpOptions).pipe(
//       retry(1),
//       tap((response: any) => console.log('✅ Client Saved/Updated Successfully:', response)),
//       catchError(this.handleError)
//     );
//   }
   
//       /** ✅ Step 2B: Fetch Existing Clients */
//   getExistingClients(): Observable<any> {
//     const merchantId = this.commonDataService.getMerchantId();
//     if (!merchantId) {
//       console.error("❌ Merchant ID not found. Cannot fetch clients.");
//       return throwError(() => new Error("Merchant ID is required"));
//     }
 
//     const url = `${this.url1}/getClientDetails/${merchantId}`;
//     return this.http.get<any>(url, this.httpOptions).pipe(
//       retry(1),
//       tap((response : any) => console.log('✅ Existing Clients Fetched:', response)),
//       catchError(this.handleError)
//     );
//   }
 
 
//   // Fetch Client Details
//   getClientDetails(): Observable<any> {
//     const merchantId = this.commonDataService.getMerchantId();
//     if (!merchantId) {
//       console.error("❌ Merchant ID not found. Cannot fetch clients.");
//       return throwError(() => new Error("Merchant ID is required"));
//     }
 
//     const url = `${this.url1}/getClientDetails/${merchantId}`;
   
//     console.log("📡 Fetching client details from:", url);
 
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'hfskey': 'HFSAdmin@1'
//       })
//     };
 
//     return this.http.get<any>(url, httpOptions).pipe(
//       retry(1),
//       map(response => response.data?.[0] || {}), // Extracting data
//       tap(client => console.log('✅ Client Details:', client)),
//       catchError(this.handleError)
//     );
//   }
 
//   // Fetch Project Details
//   getProjectDetails(): Observable<any[]> {
//     const merchantId = this.commonDataService.getMerchantId();
//     if (!merchantId) {
//       console.error("❌ Merchant ID not found. Cannot fetch clients.");
//       return throwError(() => new Error("Merchant ID is required"));
//     }
 
//     const url = `${this.url1}/getProjectDetails/${merchantId}`;
   
//     console.log("📡 Fetching project details from:", url);
 
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'hfskey': 'HFSAdmin@1'
//       })
//     };
 
//     return this.http.get<any>(url, httpOptions).pipe(
//       retry(1),
//       map(response => response.data || []), // Extracting projects array
//       tap(projects => console.log('✅ Project Details:', projects)),
//       catchError(this.handleError)
//     );
//   }
 
 
//   submitUser(userData: any): Observable<any> {
//     const url = `${this.url1}/submitUser`; // Correct API endpoint
 
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'hfskey': 'HFSAdmin@1' // Ensure correct authentication key
//       })
//     };
 
//     return this.http.post<any>(url, userData, httpOptions).pipe(
//       retry(1),
//       tap((response: any) => console.log('✅ User Submitted Successfully:', response)),
//       catchError(this.handleError)
//     );
//   }
 
//   // API to assign user access
//   assignUserAccess(accessData: any): Observable<any> {
//     const url = `${this.url1}/saveAndUpdateUserAccess`; // Replace with the actual API endpoint
 
//     console.log("📡 Sending user access data to:", url, accessData); // Debugging log
 
//     const httpOptions = {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         'hfskey': 'HFSAdmin@1' // Ensure the required header is included
//       })
//     };
 
//     return this.http.post<any>(url, accessData, httpOptions).pipe(
//       retry(1),
//       tap((response: any) => console.log('✅ User Access Assigned Successfully:', response)),
//       catchError(this.handleError)
//     );
//   }
 
 
 
//     getClients(): Observable<any> {
//       const url = `${this.url1}/getClients`;
//       console.log("📡 Fetching Client List...");
 
//       return this.http.get<any>(url, this.httpOptions).pipe(
//         retry(1),
//         tap(response => console.log('📋 Clients:', response)),
//         catchError(this.handleError)
//       );
//     }
// }
 
 







 
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { retry, catchError, tap, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { CommonDataService } from '../Common/common-data.service';
 
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
 
 
  constructor(private http: HttpClient,private commonDataService: CommonDataService) {}
 
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
    // window.alert(errorMessage);
    return throwError(errorMessage);
  }
 
  getMachines(merchantId: string, fromNo: number = 0, count: number = 50): Observable<{ rowMachines: { machines: any[] }[] }> {
    if (!merchantId) {
        console.error("❌ Merchant ID is missing! Cannot fetch machines.");
        return throwError(() => new Error("Merchant ID is required"));
    }
 
    const url = `${this.url1}/machines/${merchantId}/${fromNo}/${count}`.replace(/([^:]\/)\/+/g, "$1");
    console.log("📡 Fetching machine data from:", url);
 
    return this.http.get<{ rowMachines: { machines: any[] }[] }>(url, this.httpOptions).pipe(
      retry(1)
    );
}
 
 
  // /** 🔹 Extract only Machine IDs from the getMachines method **/
  // getMachineIds(merchantId: string, fromNo: number = 0, count: number = 50): Observable<string[]> {
  //   return this.getMachines(merchantId, fromNo, count).pipe(
  //     map((response: { rowMachines: { machines: any[] }[] }) =>
  //       response.rowMachines[0].machines.map((m: any) => m.machineId)
  //     )
  //   );
  // }

  getMachineIds(merchantId: string, fromNo: number = 0, count: number = 50): Observable<string[]> {
    return this.getMachines(merchantId, fromNo, count).pipe(
      map((response: { rowMachines: { machines: any[] }[] }) => {
        const machinesArray = response?.rowMachines?.[0]?.machines || [];
        return machinesArray.map((m: any) => m.machineId);
      })
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
  //     .set('startDate', `${startDate} 00:00:00`)
  //     .set('endDate', `${endDate} 23:59:00`);
 
  //   machineIds.forEach(id => params = params.append('machineId', id));
  //   level1.forEach(lvl => params = params.append('level1', lvl));
  //   level2.forEach(lvl => params = params.append('level2', lvl));
 
  //   // ✅ Override level3 to always send "1" while keeping UI unchanged
  //   params = params.append('level3', "1");
 
  //   console.log("📡 Final API URL:", `${this.urld}/getMachineAndIncineratorTransaction`);
  //   console.log("📡 Final Params:", params.toString());
 
  //   return this.http.get(`${this.url1}/getMachineAndIncineratorTransaction`, {
  //     headers: new HttpHeaders({
  //       'hfskey': 'HFSAdmin@1',
  //       'accept': '*/*'
  //     }),
  //     params: params
  //   }).pipe(
  //     retry(1),
  //     catchError(this.handleError),
  //     tap(response => console.log("GET Response:", response))
  //   );
  // }
 
  // getMachineAndIncineratorTransaction(
  //   startDate: string,
  //   endDate: string,
  //   merchantId: string,
  //   machineIds: string[],  
  //   level1: string[] = [],
  //   level2: string[] = [],
  //   level3: string[] = []  // 🔹 Now dynamic, not hardcoded
  // ): Observable<any> {
  //   let params = new HttpParams()
  //     .set('merchantId', merchantId)
  //     .set('startDate', `${startDate} 00:00:00`)
  //     .set('endDate', `${endDate} 23:59:00`);
 
  //   // Dynamically append all machine IDs
  //   machineIds.forEach(id => params = params.append('machineId', id));
 
  //   // Dynamically append levels if provided
  //   level1.forEach(lvl => params = params.append('level1', lvl));
  //   level2.forEach(lvl => params = params.append('level2', lvl));
  //   level3.forEach(lvl => params = params.append('level3', lvl));  // 🔹 No more hardcoding
 
  //   console.log("📡 Final API URL:", `${this.url1}/getMachineAndIncineratorTransaction`);
  //   console.log("📡 Final Params:", params.toString());
 
  //   return this.http.get(`${this.url1}/getMachineAndIncineratorTransaction`, {
  //     headers: new HttpHeaders({
  //       'hfskey': 'HFSAdmin@1',
  //       'accept': '*/*'
  //     }),
  //     params: params
  //   }).pipe(
  //     retry(1),
  //     catchError(this.handleError),
  //     tap(response => console.log("GET Response:", response))
  //   );
  // }
 
  getMachineAndIncineratorTransaction(
    startDate: string,
    endDate: string,
    merchantId: string,
    machineIds: string[],  
    level1: string[] = [],
    level2: string[] = [],
    level3: string[] = [],
    level4: string[] = []
  ): Observable<any> {
    let params = new HttpParams();
    // Ensure the order of parameters matches the API expectation
    params = params.set('endDate', `${endDate} 23:59:00`);
    level1.forEach(lvl => params = params.append('level1', lvl));
    level2.forEach(lvl => params = params.append('level2', lvl));
    level3.forEach(lvl => params = params.append('level3', lvl));
    level4.forEach(lvl => params = params.append('level4', lvl));
    params = params.set('merchantId', merchantId);
    params = params.set('startDate', `${startDate} 00:00:00`);
 
    // Ensure machine IDs are appended correctly
    machineIds.forEach(id => {
      params = params.append('machineId', id);
    });
 
    console.log("📡 Final API URL:", `${this.url1}/getMachineAndIncineratorTransaction`);
    console.log("📡 Final Params:", params.toString());
 
    return this.http.get(`${this.url1}/getMachineAndIncineratorTransaction`, {
      headers: new HttpHeaders({
        'hfskey': 'HFSAdmin@1',
        'accept': '*/*'
      }),
      params: params
    }).pipe(
      retry(1),
      catchError(this.handleError),
      tap(response => console.log("GET Response:", response))
    );
  }
 
 
  getMachineTransaction(
    merchantId: string,
    machineId: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const encodedStartDate = encodeURIComponent(`${startDate} 00:00:00`);
    const encodedEndDate = encodeURIComponent(`${endDate} 23:59:00`);
   
    const url = `${this.url1}/machineTransactions/${merchantId}/${machineId}/${encodedStartDate}/${encodedEndDate}`;
    console.log("📡 API CALL:", url);
 
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap(response => console.log('🔹 Machine Transactions Response:', response)),
      catchError(this.handleError)
    );
  }
 
 
 
  getIncInerationTransaction(
    merchantId: string,
    machineId: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const encodedStartDate = encodeURIComponent(`${startDate} 00:00:00`);
    const encodedEndDate = encodeURIComponent(`${endDate} 23:59:00`);
 
    const url = `${this.url1}/incineratorTransactions/${merchantId}/${machineId}/${encodedStartDate}/${encodedEndDate}`;
    console.log("📡 API CALL:", url);
 
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap(response => console.log('🔹 Incineration Transactions Response:', response)),
      catchError(this.handleError)
    );
  }
 
 
  getAdvanceConfig(
    merchantId: string,
    machineId: string,
   
  ): Observable<any> {
 
 
    const url = `${this.url1}/getAdvancedConfig/${merchantId}/${machineId}`;
    console.log("📡 API CALL:", url);
 
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap(response => console.log('🔹 advanced Response:', response)),
      catchError(this.handleError)
    );
  }
 
    getMachineDashboardSummary(queryParams: any): Observable<any> {
      let params = new HttpParams();
   
      // ✅ Correctly format query params, especially for `machineId`
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key]) {
          if (Array.isArray(queryParams[key])) {
            queryParams[key].forEach((value: string) => {
              params = params.append(key, value);  // ✅ Append `machineId` properly
            });
          } else {
            params = params.set(key, queryParams[key]);
          }
        }
      });
   
      const apiUrl = `${this.url1}/getMachineDashboardSummary?${params.toString()}`;
     
      // ✅ Print the exact API URL
      console.log("📡 API CALL URL:", apiUrl);
   
      return this.http.get(apiUrl, { headers: this.httpOptions.headers }).pipe(
        timeout(60000),
        retry(1),
        catchError(this.handleError),
        tap(response => console.log('✅ GET Response:', response))
      );
    }
    getMachineLevelData(merchantId: string): Observable<any> {
      if (!merchantId) {
        console.error("❌ Merchant ID not found. Cannot fetch machine level data.");
        return throwError(() => new Error("Merchant ID is required"));
      }
   
      const url = `${this.url1}/getMachineLevel/${merchantId}`;
      console.log("📡 Fetching machine level data from:", url);
   
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'hfskey': 'HFSAdmin@1'
        })
      };
   
      return this.http.get<any>(url, httpOptions).pipe(
        retry(1),
        tap(response => {
          if (response?.code === 200) {
            console.log('✅ Machine Level Response:', response);
          } else {
            console.warn('⚠️ Unexpected machine level response:', response);
          }
        }),
        catchError(this.handleError)
      );
    }
 
    advnaceconfig(advnaceconfig: any): Observable<any> {
      const url = `${this.url1}/updateAdvancedConfig`;  // ✅ Updated API endpoint with flag
   
      return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
        retry(1),  // ✅ Retry once on failure
        tap(response => console.log('🔹 advance Config Response:', response)),
        catchError(this.handleError)  // ✅ Handle errors
      );
    }
 
getAdvancedConfig(merchantId: string, machineId: string): Observable<any> {
  const url = `${this.url1}/getAdvancedConfig/${merchantId}/${machineId}`;
  return this.http.get(url, this.httpOptions).pipe(
    retry(1),
    tap(res => console.log('📥 Advanced Config Response:', res)),
    catchError(this.handleError)
  );
}
 
// POST
getMachinesByProject(projectId: number): Observable<any> {
  return this.http.post(`${this.url1}/getMachinesByProject`, { projectId });
}
 
 
    advnaceconfig2(advnaceconfig: any): Observable<any> {
      const url = `${this.url1}/sendQRBusinessconfig`;  // ✅ Updated API endpoint with flag
   
      return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
        retry(1),  // ✅ Retry once on failure
        tap(response => console.log('🔹 advance Config Response for qr:', response)),
        catchError(this.handleError)  // ✅ Handle errors
      );
    }
    // businessQr(payload: any): Observable<any> {
    //   const url = `${this.url1}/sendQRBusinessconfig`;
    //   return this.http.post(url, payload, this.httpOptions).pipe(
    //     retry(1),
    //     tap(response => console.log('🔹 advance Config Response:', response)),
    //     catchError(this.handleError)
    //   );
    // }
    // businessQr(payload: any, flag: number): Observable<any> {
    //   const url = `${this.url1}/sendQRBusinessconfig/${flag}`;
    //   return this.http.post(url, payload, this.httpOptions).pipe(
    //     retry(1),
    //     tap(response => console.log('🔹 advance Config Response:', response)),
    //     catchError(this.handleError)
    //   );
    // }
   
    businessQr(payload: any, flag: number = 0): Observable<any> {
      const url = `${this.url1}/sendQRBusinessconfig/${flag}`;
      return this.http.post(url, payload, this.httpOptions).pipe(
        retry(1),
        tap(response => console.log('🔹 advance Config Response for qr:', response)),
        catchError(this.handleError)
      );
    }
   
    // businessConfig(businessConfig: any): Observable<any> {
    //   const url = `${this.url1}/businessconfig`;  // ✅ API endpoint
   
    //   return this.http.post(url, businessConfig, this.httpOptions).pipe(
    //     retry(1),  // ✅ Retry once on failure
    //     tap(response => console.log('🔹 Business Config Response:', response)),
    //     catchError(this.handleError)  // ✅ Handle errors
    //   );
    // }// no flag in this
 
   
    // techconfig(techconfig: any): Observable<any> {
    //   const url = `${this.url1}/techconfig`;  // ✅ API endpoint
    //updateAdvancedConfig
    //   return this.http.post(url, techconfig, this.httpOptions).pipe(
    //     retry(1),  // ✅ Retry once on failure
    //     tap(response => console.log('🔹 techconfig Config Response:', response)),
    //     catchError(this.handleError)  // ✅ Handle errors
    //   );
    // }// no flag in this
    // techconfig(techconfig: any, flag: string): Observable<any> {
    //   const url = `${this.url1}/saveTechconfig/${flag}`;  // ✅ Updated API endpoint with flag
   
    //   return this.http.post(url, techconfig, this.httpOptions).pipe(
    //     retry(1),  // ✅ Retry once on failure
    //     tap(response => console.log('🔹 Tech Config Response:', response)),
    //     catchError(this.handleError)  // ✅ Handle errors
    //   );
    // }
 
 
    businessConfig(businessConfig: any, flag: string): Observable<any> {
      const url = `${this.url1}/saveBusinessconfig/${flag}`;  // ✅ Updated API endpoint with flag
   
      return this.http.post(url, businessConfig, this.httpOptions).pipe(
        retry(1),  // ✅ Retry once on failure
        tap(response => console.log('🔹 Business Config Response:', response)),
        catchError(this.handleError)  // ✅ Handle errors
      );
    }
 
   
   
    getBusinessConfig(merchantId: string, machineId: string): Observable<any> {
      const url = `${this.url1}/getBusinessConfig/${merchantId}/${machineId}`;
      console.log("📡 API CALL:", url);
   
      return this.http.get(url, this.httpOptions).pipe(
        retry(1),  // Retry once in case of failure
        tap(response => console.log('🔹 Business Config Response:', response)),
        catchError(this.handleError)  // Handle any errors
      );
    }
    techconfig(techconfig: any, flag: string): Observable<any> {
      const url = `${this.url1}/saveTechconfig/${flag}`;
     
      console.log('📡 Sending Request to:', url);
      console.log('📤 Payload:', JSON.stringify(techconfig));
      console.log('📝 Headers:', this.httpOptions);
   
      return this.http.post(url, techconfig, this.httpOptions).pipe(
        retry(1),
        tap(response => console.log('✅ Tech Config Response:', response)),
        catchError(this.handleError)
      );
    }
    getTechConfig(merchantId: string, machineId: string, field: string): Observable<any> {
      const url = `${this.url1}/getTechconfig/${merchantId}/${machineId}/${field}`;
      console.log("📡 API CALL:", url);
   
      return this.http.get(url, this.httpOptions).pipe(
        retry(1),  // Retry once in case of failure
        tap(response => console.log('🔹 Tech Config Response:', response)),
        catchError(this.handleError)  // Handle any errors
      );
    }
    
    getFotaVersionDetails(merchantId: string, machineId: string): Observable<any> {
      debugger
      const url = `${this.url1}/getFotaVersionDetails/${merchantId}/${machineId}`;
      console.log("📡 API CALL for fota:", url);
    
      return this.http.get(url, this.httpOptions).pipe(
        retry(1),  // Retry once in case of failure
        tap(response => console.log('🔹  fota Response:', response)),
        catchError(this.handleError)  // Handle any errors
      );
    }
    
    savefota(fota: any): Observable<any> {
      const url = `${this.url1}/saveFotaVersionDetails`;  // ✅ Updated API endpoint with flag
   
      return this.http.post(url, fota, this.httpOptions).pipe(
        retry(1),  // ✅ Retry once on failure
        tap(response => console.log('🔹 fota save Response:', response)),
        catchError(this.handleError)  // ✅ Handle errors
      );
    }
    machineOnboarding(machineOnboarding:any): Observable<any> {
      const url = `${this.url1}/machineOnBoarding`;  // ✅ Updated API endpoint with flag
   
      return this.http.post(url, machineOnboarding, this.httpOptions).pipe(
        retry(1),  // ✅ Retry once on failure
        tap(response => console.log('🔹 Machine Onboarding', response)),
        catchError(this.handleError) 
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
  // getMachinesByClient(merchantId: string, clientId: number): Observable<any> {
  //   return this.http.get<any>(`${this.url1}/getMachinesByClient/${merchantId}/${clientId}`);
  // }
  getMachinesByClient(merchantId: string, clientId: number): Observable<any> {
    const url = `${this.url1}/getMachinesByClient/${merchantId}/${clientId}`;
    console.log("📡 API CALL:", url);
 
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap(response => console.log('🔹 client', response)),
      catchError(this.handleError)
    );
  }
  getItemsByMerchant(merchantId: string): Observable<any> {
    const url = `${this.url1}/getItemDetails/${merchantId}`;
    console.log("📡 API CALL:", url);
 
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap(response => console.log('🔹 client', response)),
      catchError(this.handleError)
    );
  }
 
 /** 🔹 Login API */
 login(email: string, password: string, merchantId: string,captcha:string): Observable<any> {
  const url = `${this.url1}/login`;
  console.log("📡 API CALL:", url);
 
  const body = { email, password,merchantId,captcha };
  return this.http.post(url, body, this.httpOptions).pipe(
    retry(1),
    tap(response => console.log('🔹 Login Response:', response)),
    catchError(this.handleError)
  );
}
  /** 🔹 Get User Details */
  getUserDetails(merchantId: string, userId: number): Observable<any> {
    const url = `${this.url1}/getUserDetails/${merchantId}/${userId}`;
    console.log("📡 API CALL:", url);
 
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap(response => console.log('🔹 User Details Response:', response)),
      catchError(this.handleError)
    );
  }
 
  getCaptcha(): Observable<any> {
    const url = `${this.url1}/getCaptcha`;  // ✅ Updated API endpoint with flag
 
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),  // ✅ Retry once on failure
      tap(response => console.log('capatcha ', response)),
      catchError(this.handleError)  // ✅ Handle errors
    );
  }
 
  logout() {
    localStorage.removeItem('merchantId');
    this.merchantId = null;
    console.log('🔴 Merchant ID removed from localStorage');
  }
  private statesUrl = 'https://states-api.onrender.com/api/states';
  private districtsUrl = 'https://states-api.onrender.com/api/districts/';
 
 
 
 
  // Fetch all states
  getStates(): Observable<any> {
    return this.http.get<any>(this.statesUrl);
  }
 
  getDistricts(state: string): Observable<any> {
    let url = `https://states-api.onrender.com/api/districts/${state}`;
    console.log('Fetching districts from:', url); // Debugging log
    return this.http.get<any>(url);
}
 
getMachineDashboardSummary1(
  merchantId: string,
  machineStatus: string,
  stockStatus: string,
  burnStatus: string = '',
  level1: string = '',
  level2: string = '',
  level3: string = '',
   level4: string = ''
): Observable<any> {
  const params = new HttpParams()
    .set('merchantId', merchantId)
    .set('machineStatus', machineStatus)
    .set('stockStatus', stockStatus)
    .set('burnStatus', burnStatus)
    .set('level1', level1)
    .set('level2', level2)
    .set('level3', level3)
    .set('level4', level4);;
 
  return this.http.get(`${this.urld}/getMachineDashboardSummary`, { headers: this.httpOptions.headers, params }).pipe(
    timeout(60000),
    retry(1),
    catchError(this.handleError),
    tap(response => console.log('GET Response:', response))
  );
}
 
 
 
 
  //  /** 🔹 Save And Update Users for Incinerator Vending Machine **/
  //  saveAndUpdateUser(userData: any): Observable<any> {
  //   const url = `${this.url2}/saveAndUpdateUsers`;
  //   console.log("📡 Sending user data to:", url, userData);
 
  //     // Add the `hfskey` header
  // const headers = new HttpHeaders({
  //   'Content-Type': 'application/json',
  //   'hfskey': 'HFSAdmin@1',  // 🔹 Add this
  // });
 
 
  //   return this.http.post<any>(url, userData, this.httpOptions).pipe(
  //     retry(1),
  //     tap((response:any) => console.log('✅ User Saved/Updated Successfully:', response)),
  //     catchError(this.handleError)
  //   );
  // }
 
  saveAndUpdateUser(userData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateUsers`;
 
    console.log("📡 Sending user data to:", url, userData); // Debugging log
 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'hfskey': 'HFSAdmin@1' // Ensure the required header is included
      })
    };
 
    return this.http.post<any>(url, userData, httpOptions).pipe(
      retry(1),
      tap((response: any) => console.log('✅ User Saved/Updated Successfully:', response)),
      catchError(this.handleError)
    );
  }
 
 
  createClient(clientData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateClients`; // Update with correct API endpoint
 
    console.log("📡 Sending client data to:", url, clientData); // Debugging log
 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'hfskey': 'HFSAdmin@1' // Ensure the required header is included
      })
    };
 
    return this.http.post<any>(url, clientData, httpOptions).pipe(
      retry(1),
      tap((response: any) => console.log('✅ Client Saved/Updated Successfully:', response)),
      catchError(this.handleError)
    );
  }
   
      /** ✅ Step 2B: Fetch Existing Clients */
  getExistingClients(): Observable<any> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error("❌ Merchant ID not found. Cannot fetch clients.");
      return throwError(() => new Error("Merchant ID is required"));
    }
 
    const url = `${this.url1}/getClientDetails/${merchantId}`;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(1),
      tap((response : any) => console.log('✅ Existing Clients Fetched:', response)),
      catchError(this.handleError)
    );
  }
 
 
  // Fetch Client Details
  getClientDetails(): Observable<any> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error("❌ Merchant ID not found. Cannot fetch clients.");
      return throwError(() => new Error("Merchant ID is required"));
    }
 
    const url = `${this.url1}/getClientDetails/${merchantId}`;
   
    console.log("📡 Fetching client details from:", url);
 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'hfskey': 'HFSAdmin@1'
      })
    };
 
    return this.http.get<any>(url, httpOptions).pipe(
      retry(1),
      map(response => response.data?.[0] || {}), // Extracting data
      tap(client => console.log('✅ Client Details:', client)),
      catchError(this.handleError)
    );
  }
 
  // Fetch Project Details
  getProjectDetails(): Observable<any[]> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error("❌ Merchant ID not found. Cannot fetch clients.");
      return throwError(() => new Error("Merchant ID is required"));
    }
 
    const url = `${this.url1}/getProjectDetails/${merchantId}`;
   
    console.log("📡 Fetching project details from:", url);
 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'hfskey': 'HFSAdmin@1'
      })
    };
 
    return this.http.get<any>(url, httpOptions).pipe(
      retry(1),
      map(response => response.data || []), // Extracting projects array
      tap(projects => console.log('✅ Project Details:', projects)),
      catchError(this.handleError)
    );
  }
 
 
  submitUser(userData: any): Observable<any> {
    const url = `${this.url1}/submitUser`; // Correct API endpoint
 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'hfskey': 'HFSAdmin@1' // Ensure correct authentication key
      })
    };
 
    return this.http.post<any>(url, userData, httpOptions).pipe(
      retry(1),
      tap((response: any) => console.log('✅ User Submitted Successfully:', response)),
      catchError(this.handleError)
    );
  }
 
  // API to assign user access
  assignUserAccess(accessData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateUserAccess`; // Replace with the actual API endpoint
 
    console.log("📡 Sending user access data to:", url, accessData); // Debugging log
 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'hfskey': 'HFSAdmin@1' // Ensure the required header is included
      })
    };
 
    return this.http.post<any>(url, accessData, httpOptions).pipe(
      retry(1),
      tap((response: any) => console.log('✅ User Access Assigned Successfully:', response)),
      catchError(this.handleError)
    );
  }
 
 
 
    getClients(): Observable<any> {
      const url = `${this.url1}/getClients`;
      console.log("📡 Fetching Client List...");
 
      return this.http.get<any>(url, this.httpOptions).pipe(
        retry(1),
        tap(response => console.log('📋 Clients:', response)),
        catchError(this.handleError)
      );
    }
}
 
 