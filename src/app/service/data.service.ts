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
  url = environment.url;
  urld = environment.urld;
  url1 = environment.url1;  // For portal APIs: /portal/*
  url2 = environment.url2;  // For board APIs: /board/*
  urla = environment.urla;
  urlc = environment.urlc;
  merchantId: string | null = localStorage.getItem('merchantId');

  constructor(
    private http: HttpClient,
    private commonDataService: CommonDataService
  ) {}

  // FIXED: Use consistent headers for ALL methods
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      hfskey: 'HFSAdmin@1', // Changed from hfsKey to hfskey (lowercase k)
      accept: '*/*',
    }),
  };

  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('❌ API Error:', errorMessage);
    return throwError(errorMessage);
  }

  // ==================== REMAP-IMEI-MID METHODS ====================
  
  /** 
   * GET: Fetch machine GSM details from board API
   * URL: /getMachineGsmDetails/{merchantId}/{machineId}
   */
  getMachineGsmDetails(merchantId: string, machineId: string): Observable<any> {
    const url = `${this.url1}/getMachineGsmDetails/${merchantId}/${machineId}`;
    
    console.log('📤 GET Machine GSM Details API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => {
        console.log('✅ GET Machine GSM Details Response:', response);
      }),
      catchError(this.handleError)
    );
  }

  initializeGSMDetails(payload: {
  cpi: string;
  cvn: string;
  ime: string;
  mid: string;
}): Observable<any> {
  // Now url2 is already the full absolute URL
  const url = `${this.url2}/board/initializeGSMDetails`;
  
  console.log('📤 Initialize GSM Details API CALL:', {
    url: url,
    payload: payload,
    method: 'POST'
  });

  return this.http.post(url, payload, this.httpOptions).pipe(
    retry(1),
    tap((response) => {
      console.log('✅ Initialize GSM Details Response:', response);
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Initialize GSM Details Error:', error);
      return throwError(() => error);
    })
  );
}

  // ==================== MACHINE MANAGEMENT METHODS ====================

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
          longitude: m.logntitude,
          address: m.address,
          status: m.active === 1 ? 'Active' : 'Inactive',
        }))
      )
    );
  }

  getMachinesByClient(merchantId: string, clientId: number): Observable<any> {
    const url = `${this.url1}/getMachinesByClient/${merchantId}/${clientId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Machines by Client Response:', response)),
      catchError(this.handleError)
    );
  }

  getOnlineMachinesByClient(
    merchantId: string,
    projectId: number
  ): Observable<any> {
    const url = `${this.url1}/getRunningMachinesDetail/${merchantId}/${projectId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Online Machines Response:', response)),
      catchError(this.handleError)
    );
  }

  // ==================== TRANSACTION METHODS ====================

  getMachineAndIncineratorTransaction(queryParams: any): Observable<any> {
    const body: any = {};

    if (queryParams.startDate) {
      body.startDate = `${queryParams.startDate} 00:00:00`;
    }
    if (queryParams.endDate) {
      body.endDate = `${queryParams.endDate} 23:59:00`;
    }

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
      .post(apiUrl, body, this.httpOptions)
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

  getTransactions(merchantId: string): Observable<any> {
    const url = `${this.url1}/merchantTransactions/${merchantId}/100/10`;
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('Transaction Data:', response)),
      catchError(this.handleError)
    );
  }

  // ==================== CONFIGURATION METHODS ====================

  getAdvanceConfig(merchantId: string, machineId: string): Observable<any> {
    const url = `${this.url1}/getAdvancedConfig/${merchantId}/${machineId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Advanced Config Response:', response)),
      catchError(this.handleError)
    );
  }

  advnaceconfig(advnaceconfig: any): Observable<any> {
    const url = `${this.url1}/updateAdvancedConfig`;
    return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Advance Config Response:', response)),
      catchError(this.handleError)
    );
  }

  getBusinessConfig(merchantId: string, machineId: string): Observable<any> {
    const url = `${this.url1}/getBusinessConfig/${merchantId}/${machineId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Business Config Response:', response)),
      catchError(this.handleError)
    );
  }

  businessQr(payload: any, flag: number = 0): Observable<any> {
    const url = `${this.url1}/sendQRBusinessconfig/${flag}`;
    return this.http.post(url, payload, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Business QR Response:', response)),
      catchError(this.handleError)
    );
  }

  businessConfig(businessConfig: any, flag: string): Observable<any> {
    const url = `${this.url1}/saveBusinessconfig/${flag}`;
    return this.http.post(url, businessConfig, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Business Config Response:', response)),
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
      retry(1),
      tap((response) => console.log('🔹 Tech Config Response:', response)),
      catchError(this.handleError)
    );
  }

  techconfig(techconfig: any, flag: string): Observable<any> {
    const url = `${this.url1}/saveTechconfig/${flag}`;
    console.log('📡 Sending Request to:', url);
    console.log('📤 Payload:', JSON.stringify(techconfig));

    return this.http.post(url, techconfig, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('✅ Tech Config Response:', response)),
      catchError(this.handleError)
    );
  }

  // ==================== FOTA METHODS ====================

  getFotaVersionDetails(
    merchantId: string,
    machineId: string
  ): Observable<any> {
    const url = `${this.url1}/getFotaVersionDetails/${merchantId}/${machineId}`;
    console.log('📡 API CALL for fota:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 FOTA Response:', response)),
      catchError(this.handleError)
    );
  }

  savefota(fota: any): Observable<any> {
    const url = `${this.url1}/saveFotaVersionDetails`;
    return this.http.post(url, fota, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 FOTA Save Response:', response)),
      catchError(this.handleError)
    );
  }

  // ==================== MACHINE ONBOARDING ====================

  machineOnboarding(machineOnboarding: any): Observable<any> {
    const url = `${this.url1}/machineOnBoarding`;
    
    console.log('🚀 Machine Onboarding API:', url);
    console.log('📤 Payload:', JSON.stringify(machineOnboarding, null, 2));

    return this.http.post(url, machineOnboarding, this.httpOptions).pipe(
      retry(1),
      tap((response) => {
        console.log('✅ Machine Onboarding Response:', response);
      }),
      catchError(this.handleError)
    );
  }

  // ==================== ITEM MANAGEMENT ====================

  getItemsByMerchant(merchantId: string): Observable<any> {
    const url = `${this.url1}/getItemDetails/${merchantId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Items Response:', response)),
      catchError(this.handleError)
    );
  }

  // ==================== DASHBOARD METHODS ====================

  getMachineDashboardSummary(queryParams: any): Observable<any> {
    const body: any = {};

    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        body[key] = value.length > 0 ? value.join(',') : '';
      } else {
        body[key] = value ?? '';
      }
    });

    const apiUrl = `${this.url1}/getMachineDashboardSummary`;

    console.log('📡 Final POST Body:', body);
    console.log('📡 Calling URL:', apiUrl);

    return this.http.post(apiUrl, body, this.httpOptions).pipe(
      timeout(60000),
      retry(1),
      catchError(this.handleError),
      tap((response) => console.log('✅ POST API Response:', response))
    );
  }

  getConfigMachineDashboardSummary(queryParams: any): Observable<any> {
    const body: any = {};

    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        body[key] = value.length > 0 ? value.join(',') : '';
      } else {
        body[key] = value ?? '';
      }
    });

    const apiUrl = `${this.url1}/getConfigMachineDashboardSummary`;

    console.log('📡 Final POST Body:', body);
    console.log('📡 Calling URL:', apiUrl);

    return this.http.post(apiUrl, body, this.httpOptions).pipe(
      timeout(60000),
      retry(1),
      catchError(this.handleError),
      tap((response) => console.log('✅ POST API Response:', response))
    );
  }

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

  getMachineLevelData(merchantId: string): Observable<any> {
    if (!merchantId) {
      console.error(
        '❌ Merchant ID not found. Cannot fetch machine level data.'
      );
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url = `${this.url1}/getMachineLevel/${merchantId}`;
    console.log('📡 Fetching machine level data from:', url);

    return this.http.get<any>(url, this.httpOptions).pipe(
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

  // ==================== NOTIFICATION ACCESS METHODS ====================

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
    const url = `${this.url1}/setUserNotificationAccess`;

    console.log('📡 API CALL:', url, 'Payload:', payload);

    return this.http.post(url, payload, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 setUserNotificationAccess Response:', response)
      ),
      catchError(this.handleError)
    );
  }

  // ==================== STOCK MANAGEMENT ====================

  getStockInformation(merchantId: string, userId: number): Observable<any> {
    const url = `${this.url1}/getStockInformation/${merchantId}/${userId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Get Stockinfo Response:', response)),
      catchError(this.handleError)
    );
  }

  saveStockSeenInformation(payload: {
    machineId: string[];
    merchantId: string;
    userId: number;
  }): Observable<any> {
    const url = `${this.url1}/saveStockSeenInformation`;

    console.log('📡 API CALL:', url, 'Payload:', payload);

    return this.http.post(url, payload, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 saveStockSeenInformation Response:', response)
      ),
      catchError(this.handleError)
    );
  }

  // ==================== USER MANAGEMENT ====================

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

  getUserDetails(merchantId: string, userId: number): Observable<any> {
    const url = `${this.url1}/getUserDetails/${merchantId}/${userId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 User Details Response:', response)),
      catchError(this.handleError)
    );
  }

  getUserDetailsByHierarchy(
    merchantId: string,
    userId: number
  ): Observable<any> {
    const url = `${this.url1}/getUserDetailsByHierarchy/${merchantId}/${userId}`;
    console.log('📡 API CALL:', url);

    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 User Details Response:', response)),
      catchError(this.handleError)
    );
  }

  saveAndUpdateUser(userData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateUsers`;

    console.log('📡 Sending user data to:', url, userData);

    return this.http.post<any>(url, userData, this.httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ User Saved/Updated Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

  submitUser(userData: any): Observable<any> {
    const url = `${this.url1}/submitUser`;

    return this.http.post<any>(url, userData, this.httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ User Submitted Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

  assignUserAccess(accessData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateUserAccess`;

    console.log('📡 Sending user access data to:', url, accessData);

    return this.http.post<any>(url, accessData, this.httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ User Access Assigned Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

  // ==================== CLIENT & PROJECT MANAGEMENT ====================

  createClient(clientData: any): Observable<any> {
    const url = `${this.url1}/saveAndUpdateClients`;

    console.log('📡 Sending client data to:', url, clientData);

    return this.http.post<any>(url, clientData, this.httpOptions).pipe(
      retry(1),
      tap((response: any) =>
        console.log('✅ Client Saved/Updated Successfully:', response)
      ),
      catchError(this.handleError)
    );
  }

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

  getClientDetails(): Observable<any> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error('❌ Merchant ID not found. Cannot fetch clients.');
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url = `${this.url1}/getClientDetails/${merchantId}`;

    console.log('📡 Fetching client details from:', url);

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(1),
      map((response) => response.data?.[0] || {}),
      tap((client) => console.log('✅ Client Details:', client)),
      catchError(this.handleError)
    );
  }

  getProjectDetails(): Observable<any[]> {
    const merchantId = this.commonDataService.getMerchantId();
    if (!merchantId) {
      console.error('❌ Merchant ID not found. Cannot fetch clients.');
      return throwError(() => new Error('Merchant ID is required'));
    }

    const url = `${this.url1}/getProjectDetails/${merchantId}`;

    console.log('📡 Fetching project details from:', url);

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(1),
      map((response) => response.data || []),
      tap((projects) => console.log('✅ Project Details:', projects)),
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

  // ==================== UTILITY METHODS ====================

  getCaptcha(): Observable<any> {
    const url = `${this.url1}/getCaptcha`;
    return this.http.get(url, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('captcha ', response)),
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('merchantId');
    this.merchantId = null;
    console.log('🔴 Merchant ID removed from localStorage');
  }

  getStates(): Observable<any> {
    const statesUrl = 'https://states-api.onrender.com/api/states';
    return this.http.get<any>(statesUrl);
  }

  getDistricts(state: string): Observable<any> {
    let url = `https://states-api.onrender.com/api/districts/${state}`;
    console.log('Fetching districts from:', url);
    return this.http.get<any>(url);
  }

  loadMachineData(loadMachineData: any): Observable<any> {
    const url = `${this.url1}/loadMachineData`;

    return this.http.post(url, loadMachineData, this.httpOptions).pipe(
      retry(1),
      tap((response) => console.log('🔹 Load MachineData Response:', response)),
      catchError(this.handleError)
    );
  }

  getMachinesByProject(projectId: number): Observable<any> {
    return this.http.post(`${this.url1}/getMachinesByProject`, { projectId }, this.httpOptions);
  }

  advnaceconfig2(advnaceconfig: any): Observable<any> {
    const url = `${this.url1}/sendQRBusinessconfig`;
    return this.http.post(url, advnaceconfig, this.httpOptions).pipe(
      retry(1),
      tap((response) =>
        console.log('🔹 advance Config Response for qr:', response)
      ),
      catchError(this.handleError)
    );
  }

  // Deprecated methods kept for backward compatibility
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
    params = params.set('endDate', `${endDate} 23:59:00`);
    level1.forEach((lvl) => (params = params.append('level1', lvl)));
    level2.forEach((lvl) => (params = params.append('level2', lvl)));
    level3.forEach((lvl) => (params = params.append('level3', lvl)));
    level4.forEach((lvl) => (params = params.append('level4', lvl)));
    params = params.set('merchantId', merchantId);
    params = params.set('startDate', `${startDate} 00:00:00`);

    machineIds.forEach((id) => {
      params = params.append('machineId', id);
    });

    console.log(
      '📡 Final API URL:',
      `${this.url1}/getMachineAndIncineratorTransaction`
    );

    return this.http
      .get(`${this.url1}/getMachineAndIncineratorTransaction`, {
        params: params,
      })
      .pipe(
        retry(1),
        catchError(this.handleError),
        tap((response) => console.log('GET Response:', response))
      );
  }

  getMachineAndIncineratorTransaction2(queryParams: any): Observable<any> {
    let params = new HttpParams();

    if (queryParams.startDate) {
      params = params.set('startDate', `${queryParams.startDate} 00:00:00`);
    }
    if (queryParams.endDate) {
      params = params.set('endDate', `${queryParams.endDate} 23:59:00`);
    }

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
      .get(apiUrl, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError),
        tap((response) => console.log('✅ GET Response:', response))
      );
  }

  getRunningMachinesDetail(merchantId: string, clientId: number) {
    throw new Error('Method not implemented.');
  }
updateOnlineStatus(payload: { limit: number, merchantId: string, projectId: number }): Observable<any> {
  // url1 is: 'https://vmuat.hfsgroup.in/hfs_napkinIncinerator/portal'
  const url = `${this.url1}/loadMachineOnlineCount`;
  
  console.log('📤 Update Online Status API CALL:', {
    url: url,
    payload: payload,
    method: 'POST',
    timestamp: new Date().toISOString()
  });

  return this.http.post(url, payload, this.httpOptions).pipe(
    retry(1),
    timeout(60000), // 60 second timeout
    tap((response) => {
      console.log('✅ Update Online Status Response:', response);
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Update Online Status Error:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error,
        url: error.url
      });
      return throwError(() => error);
    })
  );
}

updateStockCount(payload: any): Observable<any> {
  const url = 'https://vmuat.hfsgroup.in/hfs_napkinIncinerator/portal/loadMachineStockCount';
  
  const headers = new HttpHeaders({
    'accept': '*/*',
    'hfskey': 'HFSAdmin@1',
    'Content-Type': 'application/json'
  });

  return this.http.post<any>(url, payload, { headers });
}
  
}