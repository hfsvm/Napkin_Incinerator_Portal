import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-machine-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './machine-onboarding.component.html',
  styleUrls: ['./machine-onboarding.component.css']
})
export class MachineOnboardingComponent implements OnInit {
  // Tab management - 6 tabs (removed project tab)
  activeTab: 'basic' | 'billing' | 'location' | 'gsm' | 'qrcode' | 'spring' = 'basic';
  
  // API URLs - Using the exact URL from your curl command
  private baseUrl = 'http://vmuat.hfsgroup.in:8080/hfs_napkinIncinerator';
  private onboardingApi = `${this.baseUrl}/portal/machineOnBoarding`;
  private itemFromStockApi = `${this.baseUrl}/portal/getItemDetails`; // For itemFromStockId

  // Onboarding data structure - MATCHING YOUR CURL PAYLOAD EXACTLY
  onboardingConfig = {
    active: 1,
    machineId: '',
    merchantId: 'MAPL123456', // Using the merchant ID from your curl example
    posId: 'string', // Default from curl example
    billingInfo: {
      acId: '1', // Default from curl example
      acKey: 'string', // Default from curl example
      account: '', // Required field
      paymentmethod_Id: 0 // Will be 1, 2, or 3
    },
    machineInfo: {
      address: '',
      areaCode: '530045', // Default from curl example
      category: 0,
      clientId: 0,
      cpi: '',
      field: '',
      ime: '',
      installed: 1,
      installedDate: new Date().toISOString().split('.')[0] + 'Z', // ISO format
      latitude: 0,
      levelTypeId: 0,
      logntitude: 0, // Note: API uses "logntitude" not "longitude"
      machineLocation: '',
      mcSrNo: '',
      pcbNo: '',
      projectId: 0,
      qrcode: 'string', // Default from curl example
      uid: ''
    },
    springInfo: {
      sNo: 1, // Always 1 as per requirement
      springName: 'A1', // Always A1 as per requirement
      stock: {
        active: 0, // 0 from curl example
        base64: 'string',
        enterDate: '', // Will be set
        expireDate: '', // Will be set
        icon: 0,
        itemFromStockId: 2, // Default from curl example
        merchantId: 'MAPL123456',
        item: {
          active: 0,
          category: 0,
          costPrice: 0,
          description: 'string',
          discount: 0,
          gst: 0,
          itemId: 0,
          merchantId: 'string',
          name: 'string',
          sellPrice: 0,
          threshold: 0
        }
      }
    }
  };

  // Form validation flags
  formErrors = {
    machineId: false,
    account: false,
    address: false,
    machineLocation: false,
    latitude: false,
    longitude: false,
    category: false,
    clientId: false,
    projectId: false,
    levelTypeId: false,
    cpi: false,
    ime: false,
    qrcode: false,
    itemFromStockId: false
  };
  
  // Loading states
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  
  // Popup
  showPopup: boolean = false;
  popupTitle: string = '';
  popupMessage: string = '';
  
  // Notification
  notification = {
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    show: false
  };

  // Track completion status - 6 sections
  completedSections = {
    basic: false,
    billing: false,
    location: false,
    gsm: false,
    qrcode: false,
    spring: false
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeDates();
    this.loadItemFromStockId();
  }

  // Initialize dates
  initializeDates(): void {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    
    // Format dates exactly as in curl example
    this.onboardingConfig.machineInfo.installedDate = today.toISOString().split('.')[0] + 'Z';
    this.onboardingConfig.springInfo.stock.enterDate = today.toISOString().split('.')[0] + 'Z';
    this.onboardingConfig.springInfo.stock.expireDate = nextYear.toISOString().split('.')[0] + 'Z';
  }

  // Load itemFromStockId from API
  loadItemFromStockId(): void {
    const merchantId = this.onboardingConfig.merchantId;
    const url = `${this.itemFromStockApi}/${merchantId}`;
    const headers = this.getHeaders();

    this.http.get<any>(url, { headers }).subscribe(
      (response) => {
        console.log('Item API Response:', response);
        if (response && response.code === 200 && response.data) {
          // Assuming the API returns an array of items, take the first item's ID
          const items = Array.isArray(response.data) ? response.data : [response.data];
          if (items.length > 0) {
            // Use itemId from the first item as itemFromStockId
            this.onboardingConfig.springInfo.stock.itemFromStockId = items[0].itemId || items[0].id || 2;
          } else {
            this.onboardingConfig.springInfo.stock.itemFromStockId = 2; // Default from curl
          }
        } else {
          this.onboardingConfig.springInfo.stock.itemFromStockId = 2; // Default from curl
        }
      },
      (error) => {
        console.error('Error loading item data:', error);
        this.onboardingConfig.springInfo.stock.itemFromStockId = 2; // Default from curl on error
      }
    );
  }

  // Get HTTP headers
  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'accept': '*/*',
      'hfskey': 'HFSAdmin@1'
    });
  }

  // Get payment method name - FIXED: patym = 1, razorpay = 2, phonepay = 3
  getPaymentMethodName(id: number): string {
    if (!id) return 'Not selected';
    switch(id) {
      case 1: return 'patym';
      case 2: return 'razorpay';
      case 3: return 'phonepay';
      default: return 'Not selected';
    }
  }

  // Tab management - 6 tabs
  onTabChange(tab: 'basic' | 'billing' | 'location' | 'gsm' | 'qrcode' | 'spring'): void {
    this.activeTab = tab;
  }

  // Save methods for each tab
  saveBasicInfo(): void {
    const isValid = this.validateField('machineId', this.onboardingConfig.machineId) &&
                   this.validateField('category', this.onboardingConfig.machineInfo.category) &&
                   this.validateField('clientId', this.onboardingConfig.machineInfo.clientId) &&
                   this.validateField('projectId', this.onboardingConfig.machineInfo.projectId) &&
                   this.validateField('levelTypeId', this.onboardingConfig.machineInfo.levelTypeId);
    
    if (!isValid) {
      this.showNotification('Please fill in all required fields marked with *', 'error');
      return;
    }
    
    this.completedSections.basic = true;
    this.showNotification('Basic information saved successfully', 'success');
  }

  saveBillingInfo(): void {
    const isValid = this.validateField('account', this.onboardingConfig.billingInfo.account);
    
    if (!isValid) {
      this.showNotification('Account name is required', 'error');
      return;
    }
    
    this.completedSections.billing = true;
    this.showNotification('Billing information saved successfully', 'success');
  }

  saveLocationInfo(): void {
    const isValid = this.validateField('address', this.onboardingConfig.machineInfo.address) &&
                   this.validateField('machineLocation', this.onboardingConfig.machineInfo.machineLocation) &&
                   (this.onboardingConfig.machineInfo.latitude !== 0) &&
                   (this.onboardingConfig.machineInfo.logntitude !== 0);
    
    if (!isValid) {
      this.showNotification('Please fill in all required location fields', 'error');
      return;
    }
    
    this.completedSections.location = true;
    this.showNotification('Location information saved successfully', 'success');
  }

  saveGsmInfo(): void {
    const isValid = this.validateField('cpi', this.onboardingConfig.machineInfo.cpi) &&
                   this.validateField('ime', this.onboardingConfig.machineInfo.ime);
    
    if (!isValid) {
      this.showNotification('Both CPI and IMEI are required', 'error');
      return;
    }
    
    this.completedSections.gsm = true;
    this.showNotification('GSM/IMEI information saved successfully', 'success');
  }

  saveQrCodeInfo(): void {
    const isValid = this.validateField('qrcode', this.onboardingConfig.machineInfo.qrcode);
    
    if (!isValid) {
      this.showNotification('QR Code UPI string is required', 'error');
      return;
    }
    
    this.completedSections.qrcode = true;
    this.showNotification('QR Code information saved successfully', 'success');
  }

  saveSpringInfo(): void {
    const isValid = this.validateField('itemFromStockId', this.onboardingConfig.springInfo.stock.itemFromStockId);
    
    if (!isValid) {
      this.showNotification('Item From Stock ID is required', 'error');
      return;
    }
    
    this.completedSections.spring = true;
    this.showNotification('Spring configuration saved successfully', 'success');
  }

  // Clear methods
  clearBasicInfo(): void {
    this.onboardingConfig.machineId = '';
    this.onboardingConfig.posId = 'string';
    this.onboardingConfig.machineInfo.category = 0;
    this.onboardingConfig.machineInfo.clientId = 0;
    this.onboardingConfig.machineInfo.projectId = 0;
    this.onboardingConfig.machineInfo.levelTypeId = 0;
    this.completedSections.basic = false;
    this.resetFormErrors(['machineId', 'category', 'clientId', 'projectId', 'levelTypeId']);
    this.showNotification('Basic information cleared', 'info');
  }

  clearBillingInfo(): void {
    this.onboardingConfig.billingInfo = {
      acId: '1',
      acKey: 'string',
      account: '',
      paymentmethod_Id: 0
    };
    this.completedSections.billing = false;
    this.resetFormErrors(['account']);
    this.showNotification('Billing information cleared', 'info');
  }

  clearLocationInfo(): void {
    this.onboardingConfig.machineInfo.address = '';
    this.onboardingConfig.machineInfo.areaCode = '530045';
    this.onboardingConfig.machineInfo.latitude = 0;
    this.onboardingConfig.machineInfo.logntitude = 0;
    this.onboardingConfig.machineInfo.machineLocation = '';
    this.completedSections.location = false;
    this.resetFormErrors(['address', 'machineLocation', 'latitude', 'longitude']);
    this.showNotification('Location information cleared', 'info');
  }

  clearGsmInfo(): void {
    this.onboardingConfig.machineInfo.cpi = '';
    this.onboardingConfig.machineInfo.ime = '';
    this.completedSections.gsm = false;
    this.resetFormErrors(['cpi', 'ime']);
    this.showNotification('GSM/IMEI information cleared', 'info');
  }

  clearQrCodeInfo(): void {
    this.onboardingConfig.machineInfo.qrcode = 'string';
    this.completedSections.qrcode = false;
    this.resetFormErrors(['qrcode']);
    this.showNotification('QR Code information cleared', 'info');
  }

  clearSpringInfo(): void {
    this.onboardingConfig.springInfo.stock.itemFromStockId = 2;
    this.loadItemFromStockId(); // Reload default value
    this.completedSections.spring = false;
    this.resetFormErrors(['itemFromStockId']);
    this.showNotification('Spring configuration cleared', 'info');
  }

  // Helper to reset form errors
  resetFormErrors(fields: string[]): void {
    fields.forEach(field => {
      this.formErrors[field as keyof typeof this.formErrors] = false;
    });
  }

  // Validate field
  validateField(fieldName: string, value: any): boolean {
    let isValid = false;
    
    switch(fieldName) {
      case 'machineId':
      case 'account':
      case 'address':
      case 'machineLocation':
      case 'cpi':
      case 'ime':
      case 'qrcode':
        isValid = value !== null && value !== undefined && value !== '' && value !== 'string';
        break;
      case 'category':
      case 'clientId':
      case 'projectId':
      case 'levelTypeId':
      case 'itemFromStockId':
      case 'latitude':
      case 'longitude':
        isValid = value !== null && value !== undefined && value !== 0;
        break;
      default:
        isValid = true;
    }
    
    this.formErrors[fieldName as keyof typeof this.formErrors] = !isValid;
    return isValid;
  }

  // Validation methods
  isBasicInfoComplete(): boolean {
    return !!this.onboardingConfig.machineId && 
           this.onboardingConfig.machineInfo.category !== 0 &&
           this.onboardingConfig.machineInfo.clientId !== 0 &&
           this.onboardingConfig.machineInfo.projectId !== 0 &&
           this.onboardingConfig.machineInfo.levelTypeId !== 0;
  }

  isBillingInfoComplete(): boolean {
    return !!this.onboardingConfig.billingInfo.account && this.onboardingConfig.billingInfo.account !== '';
  }

  isLocationInfoComplete(): boolean {
    return !!this.onboardingConfig.machineInfo.address && 
           !!this.onboardingConfig.machineInfo.machineLocation &&
           this.onboardingConfig.machineInfo.latitude !== 0 &&
           this.onboardingConfig.machineInfo.logntitude !== 0;
  }

  isGsmInfoComplete(): boolean {
    return !!this.onboardingConfig.machineInfo.cpi && 
           !!this.onboardingConfig.machineInfo.ime &&
           this.onboardingConfig.machineInfo.cpi !== '' &&
           this.onboardingConfig.machineInfo.ime !== '';
  }

  isQrCodeInfoComplete(): boolean {
    return !!this.onboardingConfig.machineInfo.qrcode && this.onboardingConfig.machineInfo.qrcode !== 'string';
  }

  isSpringInfoComplete(): boolean {
    return this.onboardingConfig.springInfo.stock.itemFromStockId !== 0;
  }

  // Progress tracking
  getCompletedSections(): number {
    return Object.values(this.completedSections).filter(Boolean).length;
  }

  getProgressPercentage(): number {
    const total = Object.keys(this.completedSections).length;
    const completed = this.getCompletedSections();
    return Math.round((completed / total) * 100);
  }

  isAllSectionsComplete(): boolean {
    return this.isBasicInfoComplete() &&
           this.isBillingInfoComplete() &&
           this.isLocationInfoComplete() &&
           this.isGsmInfoComplete() &&
           this.isQrCodeInfoComplete() &&
           this.isSpringInfoComplete();
  }

  // Final submission
  submitCompleteOnboarding(): void {
    if (!this.isAllSectionsComplete()) {
      this.showNotification('Please complete all sections before submitting', 'error');
      return;
    }

    // Show confirmation popup
    this.showPopup = true;
    this.popupTitle = 'Confirm Onboarding Submission';
    this.popupMessage = `
      <div class="confirmation-details">
        <p>Are you sure you want to submit the complete machine onboarding?</p>
        <div class="detail-item">
          <strong>Machine ID:</strong> ${this.onboardingConfig.machineId}
        </div>
        <div class="detail-item">
          <strong>Merchant ID:</strong> ${this.onboardingConfig.merchantId}
        </div>
        <div class="detail-item">
          <strong>Location:</strong> ${this.onboardingConfig.machineInfo.machineLocation}
        </div>
        <div class="detail-item">
          <strong>Payment Method:</strong> ${this.getPaymentMethodName(this.onboardingConfig.billingInfo.paymentmethod_Id)}
        </div>
        <div class="mt-3 alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          This action cannot be undone.
        </div>
      </div>
    `;
  }

  // Prepare data for API call - EXACTLY LIKE YOUR CURL EXAMPLE
  private prepareApiData(): any {
    return {
      active: Number(this.onboardingConfig.active),
      billingInfo: {
        acId: this.onboardingConfig.billingInfo.acId || '1',
        acKey: this.onboardingConfig.billingInfo.acKey || 'string',
        account: this.onboardingConfig.billingInfo.account || 'NCCODEVENDSYSTEMS',
        paymentmethod_Id: Number(this.onboardingConfig.billingInfo.paymentmethod_Id) || 3
      },
      machineId: this.onboardingConfig.machineId,
      machineInfo: {
        address: this.onboardingConfig.machineInfo.address,
        machineLocation: this.onboardingConfig.machineInfo.machineLocation,
        areaCode: this.onboardingConfig.machineInfo.areaCode || '530045',
        category: Number(this.onboardingConfig.machineInfo.category),
        clientId: Number(this.onboardingConfig.machineInfo.clientId),
        projectId: Number(this.onboardingConfig.machineInfo.projectId),
        cpi: this.onboardingConfig.machineInfo.cpi,
        ime: this.onboardingConfig.machineInfo.ime,
        levelTypeId: Number(this.onboardingConfig.machineInfo.levelTypeId),
        latitude: Number(this.onboardingConfig.machineInfo.latitude),
        logntitude: Number(this.onboardingConfig.machineInfo.logntitude), // Note: API uses "logntitude"
        installed: Number(this.onboardingConfig.machineInfo.installed),
        qrcode: this.onboardingConfig.machineInfo.qrcode || 'string'
      },
      merchantId: this.onboardingConfig.merchantId,
      posId: this.onboardingConfig.posId || 'string',
      springInfo: {
        sNo: 1, // Always 1
        springName: 'A1', // Always A1
        stock: {
          active: 0,
          base64: 'string',
          enterDate: this.onboardingConfig.springInfo.stock.enterDate,
          expireDate: this.onboardingConfig.springInfo.stock.expireDate,
          icon: 0,
          item: {
            active: 0,
            category: 0,
            costPrice: 0,
            description: 'string',
            discount: 0,
            gst: 0,
            itemId: 0,
            merchantId: 'string',
            name: 'string',
            sellPrice: 0,
            threshold: 0
          },
          itemFromStockId: Number(this.onboardingConfig.springInfo.stock.itemFromStockId),
          merchantId: this.onboardingConfig.merchantId
        }
      }
    };
  }

  // Make API call
  private callOnboardingApi(): void {
    this.isSubmitting = true;
    const apiData = this.prepareApiData();
    
    // Set headers exactly as in curl
    const headers = new HttpHeaders({
      'accept': '*/*',
      'hfskey': 'HFSAdmin@1',
      'Content-Type': 'application/json'
    });

    console.log('🚀 Making API call to:', this.onboardingApi);
    console.log('📤 Request Body:', JSON.stringify(apiData, null, 2));

    this.http.post(this.onboardingApi, apiData, { headers })
      .subscribe(
        (response: any) => {
          this.isSubmitting = false;
          console.log('✅ API Response:', response);
          
          // Check for code 200 (success) as per your curl response
          if (response && response.code === 200) {
            const successMessage = response.phrase || 'Machine onboarding successful!';
            this.showNotification(successMessage, 'success');
            this.resetAllForms();
          } else {
            const errorMsg = response?.error || response?.phrase || 'Unknown error occurred';
            this.showNotification(`Submission failed: ${errorMsg}`, 'error');
          }
        },
        (error) => {
          this.isSubmitting = false;
          console.error('❌ API Error:', error);
          
          let errorMessage = 'Submission failed: ';
          
          if (error.status === 404) {
            errorMessage = 'API endpoint not found. Please check the URL.';
          } else if (error.status === 401) {
            errorMessage = 'Authentication failed. Check your hfskey.';
          } else if (error.status === 400) {
            errorMessage = 'Bad request. Please check your input data.';
          } else if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
          } else if (error.error) {
            // Try to parse the error response
            if (error.error.error) {
              errorMessage += error.error.error;
            } else if (error.error.message) {
              errorMessage += error.error.message;
            } else if (typeof error.error === 'string') {
              errorMessage += error.error;
            } else {
              errorMessage += 'Server error occurred';
            }
          } else {
            errorMessage += error.message || 'Unknown error';
          }
          
          this.showNotification(errorMessage, 'error');
        }
      );
  }

  // Popup handlers
  confirmPopup(): void {
    this.showPopup = false;
    this.callOnboardingApi();
  }

  cancelPopup(): void {
    this.showPopup = false;
    this.isSubmitting = false;
  }

  // Reset all forms
  resetAllForms(): void {
    // Reset to initial state matching curl example
    this.onboardingConfig = {
      active: 1,
      machineId: '',
      merchantId: 'MAPL123456',
      posId: 'string',
      billingInfo: {
        acId: '1',
        acKey: 'string',
        account: '',
        paymentmethod_Id: 0
      },
      machineInfo: {
        address: '',
        areaCode: '530045',
        category: 0,
        clientId: 0,
        cpi: '',
        field: '',
        ime: '',
        installed: 1,
        installedDate: new Date().toISOString().split('.')[0] + 'Z',
        latitude: 0,
        levelTypeId: 0,
        logntitude: 0,
        machineLocation: '',
        mcSrNo: '',
        pcbNo: '',
        projectId: 0,
        qrcode: 'string',
        uid: ''
      },
      springInfo: {
        sNo: 1,
        springName: 'A1',
        stock: {
          active: 0,
          base64: 'string',
          enterDate: new Date().toISOString().split('.')[0] + 'Z',
          expireDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('.')[0] + 'Z',
          icon: 0,
          itemFromStockId: 2,
          merchantId: 'MAPL123456',
          item: {
            active: 0,
            category: 0,
            costPrice: 0,
            description: 'string',
            discount: 0,
            gst: 0,
            itemId: 0,
            merchantId: 'string',
            name: 'string',
            sellPrice: 0,
            threshold: 0
          }
        }
      }
    };
    
    // Reset completion tracking
    this.completedSections = {
      basic: false,
      billing: false,
      location: false,
      gsm: false,
      qrcode: false,
      spring: false
    };
    
    // Reset form errors
    Object.keys(this.formErrors).forEach(key => {
      this.formErrors[key as keyof typeof this.formErrors] = false;
    });
    
    this.activeTab = 'basic';
    
    // Reload itemFromStockId
    this.loadItemFromStockId();
  }

  // Notification methods
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.notification.message = message;
    this.notification.type = type;
    this.notification.show = true;
    
    setTimeout(() => {
      this.notification.show = false;
    }, 5000);
  }

  // Helper method to convert date to string for datetime-local inputs
  formatDateToISO(date: Date): string {
    return date.toISOString();
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Format to YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Update datetime values from input
  updateDateField(field: string, value: string): void {
    if (value) {
      const date = new Date(value);
      const isoDate = date.toISOString().split('.')[0] + 'Z';
      
      if (field === 'installedDate') {
        this.onboardingConfig.machineInfo.installedDate = isoDate;
      } else if (field === 'enterDate') {
        this.onboardingConfig.springInfo.stock.enterDate = isoDate;
      } else if (field === 'expireDate') {
        this.onboardingConfig.springInfo.stock.expireDate = isoDate;
      }
    }
  }

  // Get current location using browser geolocation
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      this.isLoading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.onboardingConfig.machineInfo.latitude = position.coords.latitude;
          this.onboardingConfig.machineInfo.logntitude = position.coords.longitude;
          this.isLoading = false;
          this.showNotification('Location retrieved successfully', 'success');
        },
        (error) => {
          this.isLoading = false;
          let errorMessage = 'Error getting location: ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "User denied the request for Geolocation.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "The request to get user location timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          this.showNotification(errorMessage, 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      this.showNotification('Geolocation is not supported by this browser', 'error');
    }
  }
}