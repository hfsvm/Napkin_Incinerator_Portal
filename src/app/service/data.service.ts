import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { retry, catchError, tap, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { CommonDataService } from '../Common/common-data.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  getRunningMachinesDetail(merchantId: string, clientId: number) {
    throw new Error('Method not implemented.');
  }
  url = environment.url;
  urld = environment.urld;
  url1 = environment.url1;
  urla = environment.urla;
  urlc = environment.urlc;
  merchantId: string | null = localStorage.getItem('merchantId');

  constructor(
    private http: HttpClient,
    private commonDataService: CommonDataService
  ) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      hfsKey: 'HFSAdmin@1',
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, hfsKey',
    }),
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

  getMachines(
    merchantId: string,
    fromNo: number = 0,
    count: number = 50
  ): Observable<{ rowMachines: { machines: any[] }[] }> {
    if (!merchantId) {
      console.error('❌ Merchant ID is missing! Cannot fetch machines.');
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url =
      `${this.url1}/machines/${merchantId}/${fromNo}/${count}`.replace(
        /([^:]\/)\/+/g,
        '$1'
      );
    console.log('📡 Fetching machine data from:', url);

    return this.http
      .get<{ rowMachines: { machines: any[] }[] }>(url, this.httpOptions)
      .pipe(retry(1));
  }

  getMachineIds(
    merchantId: string,
    fromNo: number = 0,
    count: number = 50
  ): Observable<string[]> {
    return this.getMachines(merchantId, fromNo, count).pipe(
      map((response: { rowMachines: { machines: any[] }[] }) => {
        const machinesArray = response?.rowMachines?.[0]?.machines || [];
        return machinesArray.map((m: any) => m.machineId);
      })
    );
  }

  /** 🔹 Extract only machine locations from the getMachines method **/
  getMachineLocations(
    merchantId: string,
    fromNo: number = 0,
    count: number = 50
  ): Observable<any[]> {
    return this.getMachines(merchantId, fromNo, count).pipe(
      map((response: { rowMachines: { machines: any[] }[] }) =>
        response.rowMachines[0].machines.map((m: any) => ({
          machineId: m.machineId,
          name: m.vMName,
          latitude: m.latitude,
          longitude: m.logntitude, // Keeping as per API response (correct if typo)
          address: m.address,
          status: m.active === 1 ? 'Active' : 'Inactive',
        }))
      )
    );
  }

  getMachineAndIncineratorTransaction1(
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
    level1.forEach((lvl) => (params = params.append('level1', lvl)));
    level2.forEach((lvl) => (params = params.append('level2', lvl)));
    level3.forEach((lvl) => (params = params.append('level3', lvl)));
    level4.forEach((lvl) => (params = params.append('level4', lvl)));
    params = params.set('merchantId', merchantId);
    params = params.set('startDate', `${startDate} 00:00:00`);

    // Ensure machine IDs are appended correctly
    machineIds.forEach((id) => {
      params = params.append('machineId', id);
    });

    console.log(
      '📡 Final API URL:',
      `${this.url1}/getMachineAndIncineratorTransaction`
    );
    console.log('📡 Final Params:', params.toString());

    return this.http
      .get(`${this.url1}/getMachineAndIncineratorTransaction`, {
        headers: new HttpHeaders({
          hfskey: 'HFSAdmin@1',
          accept: '*/*',
        }),
        params: params,
      })
      .pipe(
        retry(1),
        catchError(this.handleError),
        tap((response) => console.log('GET Response:', response))
      );
  }

  getMachineAndIncineratorTransaction2(queryParams: any): Observable<any> {
    debugger;
    let params = new HttpParams();

    // Append formatted date-time for start and end
    if (queryParams.startDate) {
      params = params.set('startDate', `${queryParams.startDate} 00:00:00`);
    }
    if (queryParams.endDate) {
      params = params.set('endDate', `${queryParams.endDate} 23:59:00`);
    }

    // Dynamically append other query parameters
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (value && key !== 'startDate' && key !== 'endDate') {
        if (Array.isArray(value)) {
          value.forEach((v: string) => {
            params = params.append(key, v);
          });
        } else {
          params = params.set(key, value);
        }
      }
    });

    const apiUrl = `${
      this.url1
    }/getMachineAndIncineratorTransaction?${params.toString()}`;
    console.log('📡 API CALL URL:', apiUrl);

    return this.http
      .get(apiUrl, {
        headers: new HttpHeaders({
          hfskey: 'HFSAdmin@1',
          accept: '*/*',
        }),
      })
      .pipe(
        retry(1),
        catchError(this.handleError),
        tap((response) => console.log('✅ GET Response:', response))
      );
  }

  getMachineAndIncineratorTransaction(queryParams: any): Observable<any> {
    debugger;

    const body: any = {};

    // Format start and end dates to include time as expected
    if (queryParams.startDate) {
      body.startDate = `${queryParams.startDate} 00:00:00`;
    }
    if (queryParams.endDate) {
      body.endDate = `${queryParams.endDate} 23:59:00`;
    }

    // Convert other fields to comma-separated strings or assign directly
    Object.keys(queryParams).forEach((key) => {
      if (key !== 'startDate' && key !== 'endDate') {
        const value = queryParams[key];
        if (Array.isArray(value)) {
          body[key] = value.length > 0 ? value.join(',') : '';
        } else {
          body[key] = value ?? '';
        }
      }
    });

    const apiUrl = `${this.url1}/getMachineAndIncineratorTransaction`;

    console.log('📡 Final POST Body for Transaction:', body);
    console.log('📡 Calling URL:', apiUrl);

    return this.http
      .post(apiUrl, body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          hfskey: 'HFSAdmin@1',
          accept: '*/*',
        }),
      })
      .pipe(
        retry(1),
        catchError(this.handleError),
        tap((response) => console.log('✅ POST Response:', response))
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
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 Machine Transactions Response:', response)
      ),
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
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 Incineration Transactions Response:', response)
      ),
      catchError(this.handleError)
    );
  }

  getAdvanceConfig(merchantId: string, machineId: string): Observable<any> {
    const url = `${this.url1}/getAdvancedConfig/${merchantId}/${machineId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹tran advanced Response:', response)),
      catchError(this.handleError)
    );
  }
  getMachineDashboardSummary(queryParams: any): Observable<any> {
    const body: any = {};

    // Convert arrays to comma-separated strings; keep scalar values as-is
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        body[key] = value.length > 0 ? value.join(',') : '';
      } else {
        body[key] = value ?? ''; // Default to empty string if undefined/null
      }
    });

    const apiUrl = `${this.url1}/getMachineDashboardSummary`;

    // ✅ Custom headers (adjust if needed)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      hfskey: 'HFSAdmin@1', // Include this if the backend requires it
    });

    // ✅ Logging for debugging
    console.log('📡 Final POST Body:', body);
    console.log('📡 Calling URL:', apiUrl);

    // ✅ HTTP POST request with error handling
    return this.http.post(apiUrl, body, { headers }).pipe(
      timeout(60000),
      retry(1),
      catchError(this.handleError),
      tap((response) => console.log('✅ POST API Response:', response))
    );
  }

  getConfigMachineDashboardSummary(queryParams: any): Observable<any> {
    const body: any = {};

    // Convert arrays to comma-separated strings; keep scalar values as-is
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        body[key] = value.length > 0 ? value.join(',') : '';
      } else {
        body[key] = value ?? ''; // Default to empty string if undefined/null
      }
    });

    const apiUrl = `${this.url1}/getConfigMachineDashboardSummary`;

    // ✅ Custom headers (adjust if needed)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      hfskey: 'HFSAdmin@1', // Include this if the backend requires it
    });

    // ✅ Logging for debugging
    console.log('📡 Final POST Body:', body);
    console.log('📡 Calling URL:', apiUrl);

    // ✅ HTTP POST request with error handling
    return this.http.post(apiUrl, body, { headers }).pipe(
      timeout(60000),
      retry(1),
      catchError(this.handleError),
      tap((response) => console.log('✅ POST API Response:', response))
    );
  }

  getMachineLevelData(merchantId: string): Observable<any> {
    if (!merchantId) {
      console.error(
        '❌ Merchant ID not found. Cannot fetch machine level data.'
      );
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url = `${this.url1}/getMachineLevel/${merchantId}`;
    console.log('📡 Fetching machine level data from:', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        hfskey: 'HFSAdmin@1',
      }),
    };

    return this.http.get<any>(url, httpOptions).pipe(
      retry(1),
      tap((response) => {
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
    const url = `${this.url1}/updateAdvancedConfig`; // ✅ Updated API endpoint with flag

    return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
      retry(1), // ✅ Retry once on failure
      tap((response) => console.log('🔹 advance Config Response:', response)),
      catchError(this.handleError) // ✅ Handle errors
    );
  }

  // getAdvancedConfig(merchantId: string, machineId: string): Observable<any> {
  //   const url = `${this.url1}/getAdvancedConfig/${merchantId}/${machineId}`;
  //   return this.http.get(url, this.httpOptions).pipe(
  //     retry(1),
  //     tap(res => console.log('📥 Advanced Config Response:', res)),
  //     catchError(this.handleError)
  //   );
  // }

  // POST
  getMachinesByProject(projectId: number): Observable<any> {
    return this.http.post(`${this.url1}/getMachinesByProject`, { projectId });
  }

  advnaceconfig2(advnaceconfig: any): Observable<any> {
    const url = `${this.url1}/sendQRBusinessconfig`; // ✅ Updated API endpoint with flag

    return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
      retry(1), // ✅ Retry once on failure
      tap((response) =>
        console.log('🔹 advance Config Response for qr:', response)
      ),
      catchError(this.handleError) // ✅ Handle errors
    );
  }

  businessQr(payload: any, flag: number = 0): Observable<any> {
    const url = `${this.url1}/sendQRBusinessconfig/${flag}`;
    return this.http.post(url, payload, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 advance Config Response for qr:', response)
      ),
      catchError(this.handleError)
    );
  }

  businessConfig(businessConfig: any, flag: string): Observable<any> {
    const url = `${this.url1}/saveBusinessconfig/${flag}`; // ✅ Updated API endpoint with flag

    return this.http.post(url, businessConfig, this.httpOptions).pipe(
      retry(1), // ✅ Retry once on failure
      tap((response) => console.log('🔹 Business Config Response:', response)),
      catchError(this.handleError) // ✅ Handle errors
    );
  }

  getBusinessConfig(merchantId: string, machineId: string): Observable<any> {
    const url = `${this.url1}/getBusinessConfig/${merchantId}/${machineId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1), // Retry once in case of failure
      tap((response) => console.log('🔹 Business Config Response:', response)),
      catchError(this.handleError) // Handle any errors
    );
  }
  techconfig(techconfig: any, flag: string): Observable<any> {
    const url = `${this.url1}/saveTechconfig/${flag}`;

    console.log('📡 Sending Request to:', url);
    console.log('📤 Payload:', JSON.stringify(techconfig));
    console.log('📝 Headers:', this.httpOptions);

    return this.http.post(url, techconfig, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('✅ Tech Config Response:', response)),
      catchError(this.handleError)
    );
  }
  getTechConfig(
    merchantId: string,
    machineId: string,
    field: string
  ): Observable<any> {
    const url = `${this.url1}/getTechconfig/${merchantId}/${machineId}/${field}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1), // Retry once in case of failure
      tap((response) => console.log('🔹 Tech Config Response:', response)),
      catchError(this.handleError) // Handle any errors
    );
  }

  getFotaVersionDetails(
    merchantId: string,
    machineId: string
  ): Observable<any> {
    debugger;
    const url = `${this.url1}/getFotaVersionDetails/${merchantId}/${machineId}`;
    console.log('📡 API CALL for fota:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1), // Retry once in case of failure
      tap((response) => console.log('🔹  fota Response:', response)),
      catchError(this.handleError) // Handle any errors
    );
  }

  savefota(fota: any): Observable<any> {
    const url = `${this.url1}/saveFotaVersionDetails`; // ✅ Updated API endpoint with flag

    return this.http.post(url, fota, this.httpOptions).pipe(
      retry(1), // ✅ Retry once on failure
      tap((response) => console.log('🔹 fota save Response:', response)),
      catchError(this.handleError) // ✅ Handle errors
    );
  }
  machineOnboarding(machineOnboarding: any): Observable<any> {
    const url = `${this.url1}/machineOnBoarding`; // ✅ Updated API endpoint with flag

    return this.http.post(url, machineOnboarding, this.httpOptions).pipe(
      retry(1), // ✅ Retry once on failure
      tap((response) => console.log('🔹 Machine Onboarding', response)),
      catchError(this.handleError)
    );
  }
  getTransactions(merchantId: string): Observable<any> {
    const url = `${this.url1}/merchantTransactions/${merchantId}/100/10`;
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('Transaction Data:', response)),
      catchError(this.handleError)
    );
  }
  // getMachinesByClient(merchantId: string, clientId: number): Observable<any> {
  //   return this.http.get<any>(`${this.url1}/getMachinesByClient/${merchantId}/${clientId}`);
  // }
  getMachinesByClient(merchantId: string, clientId: number): Observable<any> {
    const url = `${this.url1}/getMachinesByClient/${merchantId}/${clientId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 client', response)),
      catchError(this.handleError)
    );
  }
  getOnlineMachinesByClient(
    merchantId: string,
    ProjetId: number
  ): Observable<any> {
    debugger;
    const url = `${this.url1}/getRunningMachinesDetail/${merchantId}/${ProjetId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 client', response)),
      catchError(this.handleError)
    );
  }

  getItemsByMerchant(merchantId: string): Observable<any> {
    const url = `${this.url1}/getItemDetails/${merchantId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 client', response)),
      catchError(this.handleError)
    );
  }

  /** 🔹 Login API */
  login(
    email: string,
    password: string,
    merchantId: string,
    captcha: string
  ): Observable<any> {
    const url = `${this.url1}/login`;
    console.log('📡 API CALL:', url);

    const body = { email, password, merchantId, captcha };
    return this.http.post(url, body, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Login Response:', response)),
      catchError(this.handleError)
    );
  }
  /** 🔹 Get User Details */
  getUserDetails(merchantId: string, userId: number): Observable<any> {
    const url = `${this.url1}/getUserDetails/${merchantId}/${userId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 User Details Response:', response)),
      catchError(this.handleError)
    );
  }

  /** 🔹 Get User Details */
  getUserDetailsByHierarchy(
    merchantId: string,
    userId: number
  ): Observable<any> {
    debugger;

    const url = `${this.url1}/getUserDetailsByHierarchy/${merchantId}/${userId}`;
    console.log('📡 API CALL:', url);
    debugger;

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 User Details Response:', response)),
      catchError(this.handleError)
    );
  }
  // // Fetch User Details by Hierarchy
  // getUserDetailsByHierarchy(merchantId: String, userId: number): Observable<any> {
  //   return this.http.get<any>(`${this.url1}/portal/getUserDetailsByHierarchy/${merchantId}/${userId}`);
  // }

  getCaptcha(): Observable<any> {
    const url = `${this.url1}/getCaptcha`; // ✅ Updated API endpoint with flag

    return this.http.get(url, this.httpOptions).pipe(
      retry(1), // ✅ Retry once on failure
      tap((response) => console.log('capatcha ', response)),
      catchError(this.handleError) // ✅ Handle errors
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
    level4: string = '',
    zone: string = '', // Add zone parameter
    ward: string = '', // Add ward parameter
    beat: string = '' // Add beat parameter
  ): Observable<any> {
    const params = new HttpParams()
      .set('merchantId', merchantId)
      .set('machineStatus', machineStatus)
      .set('stockStatus', stockStatus)
      .set('burnStatus', burnStatus)
      .set('zone', zone) // Add zone parameter
      .set('ward', ward) // Add ward parameter
      .set('beat', beat) // Add beat parameter

      .set('level1', level1)
      .set('level2', level2)
      .set('level3', level3)
      .set('level4', level4);

    return this.http
      .get(`${this.urld}/getMachineDashboardSummary`, {
        headers: this.httpOptions.headers,
        params,
      })
      .pipe(
        timeout(60000),
        retry(1),
        catchError(this.handleError),
        tap((response) => console.log('GET Response:', response))
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

    console.log('📡 Sending user data to:', url, userData); // Debugging log

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        hfskey: 'HFSAdmin@1', // Ensure the required header is included
      }),
    };

    return this.http.post<any>(url, userData, httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ User Saved/Updated Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

  createClient(clientData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateClients`; // Update with correct API endpoint

    console.log('📡 Sending client data to:', url, clientData); // Debugging log

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        hfskey: 'HFSAdmin@1', // Ensure the required header is included
      }),
    };

    return this.http.post<any>(url, clientData, httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ Client Saved/Updated Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

  /** ✅ Step 2B: Fetch Existing Clients */
  getExistingClients(): Observable<any> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error('❌ Merchant ID not found. Cannot fetch clients.');
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url = `${this.url1}/getClientDetails/${merchantId}`;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ Existing Clients Fetched:', response)
      ),
      catchError(this.handleError)
    );
  }

  // Fetch Client Details
  getClientDetails(): Observable<any> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error('❌ Merchant ID not found. Cannot fetch clients.');
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url = `${this.url1}/getClientDetails/${merchantId}`;

    console.log('📡 Fetching client details from:', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        hfskey: 'HFSAdmin@1',
      }),
    };

    return this.http.get<any>(url, httpOptions).pipe(
      retry(1),
      map((response) => response.data?.[0] || {}), // Extracting data
      tap((client) => console.log('✅ Client Details:', client)),
      catchError(this.handleError)
    );
  }

  // Fetch Project Details
  getProjectDetails(): Observable<any[]> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error('❌ Merchant ID not found. Cannot fetch clients.');
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url = `${this.url1}/getProjectDetails/${merchantId}`;

    console.log('📡 Fetching project details from:', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        hfskey: 'HFSAdmin@1',
      }),
    };

    return this.http.get<any>(url, httpOptions).pipe(
      retry(1),
      map((response) => response.data || []), // Extracting projects array
      tap((projects) => console.log('✅ Project Details:', projects)),
      catchError(this.handleError)
    );
  }

  submitUser(userData: any): Observable<any> {
    const url = `${this.url1}/submitUser`; // Correct API endpoint

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        hfskey: 'HFSAdmin@1', // Ensure correct authentication key
      }),
    };

    return this.http.post<any>(url, userData, httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ User Submitted Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

  // API to assign user access
  assignUserAccess(accessData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateUserAccess`; // Replace with the actual API endpoint

    console.log('📡 Sending user access data to:', url, accessData); // Debugging log

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        hfskey: 'HFSAdmin@1', // Ensure the required header is included
      }),
    };

    return this.http.post<any>(url, accessData, httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ User Access Assigned Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

  getClients(): Observable<any> {
    const url = `${this.url1}/getClients`;
    console.log('📡 Fetching Client List...');

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('📋 Clients:', response)),
      catchError(this.handleError)
    );
  }

  // getMachineDashboardSummaryBySearch(
  //   merchantId: string,
  //   field: string
  // ): Observable<any> {
  //   debugger;

  //   const url = `${this.url1}/getMachineDashboardSummaryBySearch/${merchantId}/${field}`;
  //   console.log('📡 API CALL:', url);
  //   debugger;

  //   return this.http.get(url, this.httpOptions).pipe(
  //     retry(1),
  //     tap((response) => console.log('🔹 User Details Response:', response)),
  //     catchError(this.handleError)
  //   );
  // }

  getMachineDashboardSummaryBySearch(
    merchantId: string,
    field: string
  ): Observable<any> {
    const url = `${this.url1}/getMachineDashboardSummaryBySearch`;
    console.log('📡 API CALL (POST):', url);

    const requestBody = {
      merchantId,
      field,
    };

    return this.http.post(url, requestBody, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Search Response:', response)),
      catchError(this.handleError)
    );
  }

  /** 🔹 Get stock information */
  getStockInformation(merchantId: string, userId: number): Observable<any> {
    debugger;

    const url = `${this.url1}/getStockInformation/${merchantId}/${userId}`;
    console.log('📡 API CALL:', url);
    debugger;

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Get Stockinfo Response:', response)),
      catchError(this.handleError)
    );
  }

  /** 🔹 Get stock information */
  saveStockSeenInformation(payload: {
    machineId: string[];
    merchantId: string;
    userId: number;
  }): Observable<any> {
    const url = `${this.url1}/saveStockSeenInformation`; // No path params

    console.log('📡 API CALL:', url, 'Payload:', payload);

    return this.http.post(url, payload, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 saveStockSeenInformation Response:', response)
      ),
      catchError(this.handleError)
    );
  }

  getAllUser(merchantId: string): Observable<any> {
    const url = `${this.url1}/getAllUser/${merchantId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 AllUser', response)),
      catchError(this.handleError)
    );
  }

  getAllNotificationType(): Observable<any> {
    const url = `${this.url1}/getAllNotificationType`;
    console.log('📡 Fetching NotificationType List...');

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('📋 NotificationType:', response)),
      catchError(this.handleError)
    );
  }

  getAllEventType(): Observable<any> {
    const url = `${this.url1}/getAllEventType`;
    console.log('📡 Fetching EventType List...');

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('📋 EventType:', response)),
      catchError(this.handleError)
    );
  }

  setUserNotificationAccess(payload: {
    eventTypeId: number[];
    merchantId: string;
    notificationTypeId: number;
    userId: number;
  }): Observable<any> {
    const url = `${this.url1}/setUserNotificationAccess`; // No path params

    console.log('📡 API CALL:', url, 'Payload:', payload);

    return this.http.post(url, payload, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 setUserNotificationAccess Response:', response)
      ),
      catchError(this.handleError)
    );
  }

  loadMachineData(loadMachineData: any): Observable<any> {
    const url = `${this.url1}/loadMachineData`;

    return this.http.post(url, loadMachineData, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Load MachineData Response:', response)),
      catchError(this.handleError)
    );
  }
}
