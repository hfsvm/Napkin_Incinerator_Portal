import {
  ChangeDetectorRef,
  Component,
  OnInit,
  HostListener,
  ElementRef,
} from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { Router } from '@angular/router';

// Define interfaces for better type safety
interface RemapData {
  cpi: string;
  cvn: string;
  ime: string;
  mid: string;
}

interface Client {
  id: number;
  companyName: string;
  [key: string]: any; // Allow other properties
}

interface MachineGsmDetails {
  machineGSMId: number;
  merchantId: string;
  machineId: string;
  batchno: string | null;
  imei: string;
  chip_Id: string;
  sim_number: string | null;
  serial_gsm: string | null;
  uid_gsm: string | null;
  board_version: string;  // This is CVN
  createddatetime: string;
  lastupdateddatetime: string;
}

@Component({
  selector: 'app-advanced-management',
  templateUrl: './advanced-management.component.html',
  styleUrls: ['./advanced-management.component.scss'],
})
export class AdvancedManagementComponent implements OnInit {

  // Add these properties for the REMAP-IMEI-MID tab
  remapData: RemapData = {
    cpi: '',
    cvn: '',
    ime: '',
    mid: ''
  };
  
  // Current values for REMAP tab - these will show the current values from API
  currentRemapValues: RemapData = {
    cpi: '',
    cvn: '',
    ime: '',
    mid: ''
  };
  
  remapResponse: any = null;
  isRemapLoading: boolean = false;
  submittedRemap: boolean = false;
  isRemapChanged: boolean = false;
  
  // Property to track REMAP form validity
  isRemapFormValidState: boolean = false;
  
  currentTime: string = '';
  private timer: any;

  fotaMachines: any[] = []; // Table data
  selectedMachines: any[] = []; // Selected rows

  masterSelected: boolean = false;

  fotaTable: any[] = [];
  fotaRows: any[] = [];
  selectedFotaRows: Set<string> = new Set(); // store selected machineids
  selectedVersion: string = '';
  selectedMachineInstalledId: string = '';
  installedStatus: string = '1'; // Installed status (1 or 0)
  isInstalled: boolean = false;
  uid: string = '';
  pcbNo: string = '';
  mcSrNo: string = '';
  schedulerHour: number | null = null;
  schedulerMinute: number | null = null;
  merchantId: string = '';
  machineIds: string[] = [];
  fotamachineIds: string[] = [];
  selectedMachineId: string = '';
  selectedFotaMachineId: string = '';
  activeTab: string = 'pricing'; // Active tab selector for pricing or incineration
  incinerationConfig: any = null;
  projectList: any[] = [];
  selectedProjectId!: number | null;
  selectedProjectIdfota!: number | null;
  selectedRemapProjectId: number | null = null; // For REMAP tab client selection
  clientId!: number;
  clientname: string = '';
  currentTab: string = 'Pricing';
  searchText: string = '';
  filteredMachineIds: string[] = [];
  selectedMachineIdPricing: string | null = null;
  dropdownOpenPricing: boolean = false;
  machineSearchTermPricing: string = '';
  fotaConfigList: any[] = [];
  selectedUpdatedVersion: string | null = null;

  selectedUserId: number | null = null;
  selectedUser: string = '';
  notificationTypes: any[] = [];
  selectedNotificationTypeId: number | null = null;
  eventTypes: any[] = [];
  selectedEventTypeIds: number[] = [];
  users: any[] = [];

  currentValues = {
    iid: '',
    itp: '',
    qrBytes: '',
  };
  itemList: any[] = [];
  updatedValues = {
    iid: null as number | null,
    itp: 0,
    qrBytes: '',
  };
  fotaData = {
    machineid: '',
    imenumber: '',
    updatedVersion: [], // Will come from API
    selectedVersion: null,
  };

  notification = {
    message: '',
    type: '', // 'success' or 'error'
  };
  notificationMessage = '';
  notificationType = '';
  selectUser = '';
  // Incineration Config Values (current values and updated values)
  incinerationCurrentValues = {
    scheduler: '',
    limitSwitch: '',
    napkinCost: '',
    setHeaterTempA: '',
    setHeaterTempB: '',
    heaterAMinTemp: '',
    heaterBOnTemp: '',
  };

  updatedIncinerationValues = {
    scheduler: '',
    limitSwitch: '',
    napkinCost: '',
    setHeaterTempA: '',
    setHeaterTempB: '',
    heaterAMinTemp: '',
    heaterBOnTemp: '',
  };

  // Add these properties to your component class
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupConfirmAction: () => void = () => {};

  // NEW PROPERTIES FOR REMAP TAB
  remapClients: any[] = []; // Clients for REMAP tab
  remapMachineIds: string[] = []; // Machine IDs for REMAP tab
  filteredRemapMachineIds: string[] = []; // Filtered machine IDs for REMAP tab
  selectedRemapMachineId: string = ''; // Selected machine for REMAP tab
  remapMachineSearchTerm: string = ''; // Search term for REMAP machines
  remapDropdownOpen: boolean = false; // Dropdown state for REMAP machines
  remapMachineData: MachineGsmDetails | null = null; // Machine data from board API
  isFetchingMachineData: boolean = false; // Loading state for machine data fetch
  installedDate: string = '';
  dropdownOpen = false;
  dropdownOpenMachine = false;
  machineSearchTerm = '';
  clientDropdownOpen = false;
  clientSearchTerm = '';
  selectedClientId = '';
  machineSearch: string = '';
  submitted: boolean = false;

  constructor(
    private router: Router,
    private commonDataService: CommonDataService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef
  ) {}

  selectMachinePricing(id: string) {
    this.selectedMachineIdPricing = id;
    this.selectedMachineId = id;
    this.dropdownOpenPricing = false;
    console.log('Machine selected:', id);

    // Fetch pricing data based on selectedMachineId
    this.dataService
      .getBusinessConfig(this.merchantId, this.selectedMachineIdPricing)
      .subscribe(
        (res: any) => {
          console.log('📥 Business Config Response:', res);

          if (res.code !== 200 || res.error) {
            const msg =
              res.phrase || res.error || 'Business configuration error.';
            this.showNotification(`⚠️ ${msg}`, 'error');
            return;
          }

          const configData = res.data?.ica?.[0];

          if (configData) {
            this.currentValues.iid = configData.iid || '';
            this.currentValues.itp = configData.itp || '';
            this.currentValues.qrBytes = configData.qrb || '';
          } else {
            this.currentValues.iid = '';
            this.currentValues.itp = '';
            this.currentValues.qrBytes = '';
          }

         this.cdr.detectChanges();

        },
        (error: any) => {
          console.error('❌ Business Config HTTP Error:', error);

          if (error.status === 404) {
            this.showNotification(
              'No configuration found for the selected machine. Please set configurations.',
              'error'
            );
          } else if (error.status === 401) {
            this.showNotification(
              '🔒 Error 401: Unauthorized access to business config.',
              'error'
            );
          } else if (error.status === 500) {
            this.showNotification(
              '💥 Error 500: Server error while fetching business config.',
              'error'
            );
          } else if (error.status === 0) {
            this.showNotification(
              '🔌 Network error while fetching business config.',
              'error'
            );
          } else {
            this.showNotification(
              `❌ Error ${error.status}: ${
                error.error?.message || 'Unknown error occurred'
              }`,
              'error'
            );
          }
        }
      );
  }

  // Method to open the popup with HTML support
  openPopup(title: string, message: string, confirmAction: () => void) {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupConfirmAction = confirmAction;
    this.showPopup = true;
  }
  // Method to handle confirm action
  confirmPopup() {
    this.popupConfirmAction();
    this.showPopup = false;
  }

  // Method to handle cancel
  cancelPopup() {
    this.showPopup = false;
  }

  ngOnInit(): void {
    if (
      this.commonDataService.merchantId === null ||
      (this.commonDataService.merchantId === undefined &&
        this.commonDataService.userId === null) ||
      this.commonDataService.userId === undefined
    ) {
      this.router.navigate(['/login']);
    }

    this.filteredMachineIds = this.machineIds;
    this.merchantId = this.commonDataService.getMerchantId();
    this.clientname = '';
    this.machineIds = Array.isArray(
      this.commonDataService.userDetails?.machineId
    )
      ? this.commonDataService.userDetails.machineId
      : [];

    // Get clients and their projects
    const userDetails = this.commonDataService.userDetails;
    this.projectList =
      userDetails?.clients?.flatMap(
        (client: any) =>
          client.projects?.map((project: any) => ({
            clientId: client.clientId,
            clientName: client.clientName,
            projectId: project.projectId,
            projectName: project.projectName,
          })) || []
      ) || [];
    
    // Initialize REMAP clients from the same project list
    this.remapClients = [...this.projectList];
    
    if (this.projectList.length > 0) {
      this.selectedProjectId = null;
      console.log('Selected Project ID:', this.selectedProjectId);

      if (this.selectedProjectId !== null) {
        this.getMachinesByProject(this.selectedProjectId);
      }

      this.getItemsByMerchant(this.merchantId);
    }

    if (this.projectList.length > 0) {
      this.selectedProjectIdfota = null;
      console.log('Selected Project ID fota:', this.selectedProjectIdfota);

      if (this.selectedProjectIdfota !== null) {
        this.getOnlineMachinesByProject(this.selectedProjectIdfota);
      }

      this.getItemsByMerchant(this.merchantId);
    }
    this.loadNotificationAccessData();
  }

  // Load machines for REMAP tab when client is selected
  onRemapClientChange(): void {
    this.selectedRemapMachineId = '';
    this.remapMachineIds = [];
    this.filteredRemapMachineIds = [];
    this.remapMachineData = null;
    this.clearRemapForm();

    if (this.selectedRemapProjectId !== null) {
      this.getRemapMachinesByProject(this.selectedRemapProjectId);
    }
    this.cdr.detectChanges();
  }

  // Get machines for REMAP tab
  getRemapMachinesByProject(clientId: number): void {
    console.log('Getting machines for REMAP client id:', clientId);
    if (!clientId || !this.merchantId) return;

    this.dataService.getMachinesByClient(this.merchantId, clientId).subscribe(
      (res: any) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          console.log('REMAP machines data:', res.data);
          this.remapMachineIds = res.data;
          this.filteredRemapMachineIds = [...this.remapMachineIds];
          this.selectedRemapMachineId = '';
          this.cdr.detectChanges();
        } else {
          this.remapMachineIds = [];
          this.filteredRemapMachineIds = [];
          this.showNotification(
            '⚠️ No machines found for selected client.',
            'error'
          );
        }
      },
      (error: any) => {
        console.error('❌ Error fetching REMAP machines by client:', error);
        this.showNotification(
          '❌ Failed to fetch machines for selected client.',
          'error'
        );
      }
    );
  }

  // Select machine in REMAP tab - UPDATED
  selectRemapMachine(id: string) {
    this.selectedRemapMachineId = id;
    this.remapData.mid = id; // Set machine ID in form
    
    // Clear form data
    this.remapData = {
      cpi: '',
      cvn: '',
      ime: '',
      mid: id
    };
    
    this.remapDropdownOpen = false;
    
    console.log('REMAP Machine selected:', id);
    
    // Check form validity
    this.checkRemapFormValidity();
    
    // Call board API to get machine details
    this.fetchMachineDetailsFromBoard(id);
  }

  // Update the fetchMachineDetailsFromBoard method to add more debugging:

fetchMachineDetailsFromBoard(machineId: string): void {
  this.isFetchingMachineData = true;
  this.remapMachineData = null;
  
  // Reset current values
  this.currentRemapValues = {
    mid: machineId,
    ime: 'Not available',
    cpi: 'Not available',
    cvn: 'Not available'
  };
  
  // Clear form data
  this.remapData = {
    cpi: '',
    cvn: '',
    ime: '',
    mid: machineId
  };
  
  // Update form validity
  this.checkRemapFormValidity();
  
  // Call GET API to fetch machine details
  this.dataService.getMachineGsmDetails(this.merchantId, machineId).subscribe({
    next: (res: any) => {
      this.isFetchingMachineData = false;
      console.log('📥 GET Machine GSM Details Response:', res);
      
      if (res?.code === 200 && res?.data) {
        this.remapMachineData = res.data;
        
        // FIXED: Explicitly map each field with logging
        const apiData = res.data;
        
        // Debug: Log what we're getting from API
        console.log('🔍 Debug - API Response Values:', {
          imei: apiData.imei,
          chip_Id: apiData.chip_Id,
          board_version: apiData.board_version,
          machineId: apiData.machineId
        });
        
        // Set current values - make sure each field gets the right value
        this.currentRemapValues = {
          mid: apiData.machineId || machineId,
          ime: apiData.imei || 'Not available',
          cpi: apiData.chip_Id || 'Not available',
          cvn: apiData.board_version || 'Not available' // This should be "1.4" not IMEI
        };
        
        // Debug: Log what we're setting
        console.log('🔍 Debug - Setting Current Values:', this.currentRemapValues);
        
        // Auto-fill the form fields with current values for editing
        this.remapData = {
          mid: machineId, // Machine ID cannot be changed
          ime: apiData.imei || '',
          cpi: apiData.chip_Id || '',
          cvn: apiData.board_version || '' // This should be "1.4"
        };
        
        // Debug: Log what we're setting in the form
        console.log('🔍 Debug - Setting Form Values:', this.remapData);
        
        // Check form validity after loading data
        this.checkRemapChanges();
        
        this.showNotification('✅ Machine details loaded successfully!', 'success');
      } else {
        // Machine not found in board API
        this.showNotification('ℹ️ Machine not found in board system. You can enter new details.', 'error');
      }
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      this.isFetchingMachineData = false;
      console.error('❌ GET Machine GSM Details Error:', error);
      
      // Check for CORS error
      if (error.status === 0 || error?.name === 'HttpErrorResponse') {
        // CORS or network error - provide user-friendly message
        console.warn('⚠️ CORS error detected. The API may not be accessible from localhost.');
        this.showNotification('⚠️ Could not connect to server. You can manually enter GSM details.', 'error');
        
        // Still allow manual entry
        this.remapMachineData = null;
        this.currentRemapValues = {
          mid: machineId,
          ime: 'Not available (Connection error)',
          cpi: 'Not available (Connection error)',
          cvn: 'Not available (Connection error)'
        };
      } else if (error?.status === 404) {
        this.showNotification('ℹ️ Machine not found. You can enter new GSM details.', 'error');
      } else {
        this.showNotification('❌ Failed to fetch machine details from board.', 'error');
      }
      this.cdr.detectChanges();
    }
  });
}

  // Filter machines in REMAP tab
  filterRemapMachines(): void {
    const searchTerm = this.remapMachineSearchTerm.toLowerCase();
    this.filteredRemapMachineIds = this.remapMachineIds.filter((id) =>
      id.toLowerCase().includes(searchTerm)
    );
  }

  // Toggle REMAP machine dropdown
  toggleRemapDropdown(event: MouseEvent): void {
    this.remapDropdownOpen = !this.remapDropdownOpen;
    event.stopPropagation();
  }

  // Check if REMAP form has been changed - UPDATED
  checkRemapChanges(): void {
    if (!this.remapData.mid) {
      this.isRemapChanged = false;
      this.isRemapFormValidState = false;
      return;
    }
    
    // Check if any of the editable fields have been changed
    // Compare form data with current values
    this.isRemapChanged = 
      this.remapData.cpi !== this.currentRemapValues.cpi ||
      this.remapData.cvn !== this.currentRemapValues.cvn ||
      this.remapData.ime !== this.currentRemapValues.ime;
    
    // Check form validity
    this.checkRemapFormValidity();
  }

  // Method to check REMAP form validity - UPDATED (CVN is now optional)
  checkRemapFormValidity(): void {
    // Check all required fields are filled
    const hasMachineId = !!this.remapData.mid && this.remapData.mid.trim() !== '';
    const hasIMEI = !!this.remapData.ime && this.remapData.ime.trim() !== '';
    const hasCPI = !!this.remapData.cpi && this.remapData.cpi.trim() !== '';
    // CVN is now optional - can be empty
    const hasCVN = true; // CVN is optional, so always true
    
    // Validate IMEI format if present
    const isIMEIValid = hasIMEI ? this.isValidIMEI(this.remapData.ime) : false;
    
    // Machine ID, IMEI and CPI are required. CVN is optional.
    this.isRemapFormValidState = hasMachineId && hasIMEI && hasCPI && isIMEIValid;
    
    console.log('REMAP Form Validity:', {
      hasMachineId,
      hasIMEI,
      hasCPI,
      hasCVN,
      isIMEIValid,
      isValid: this.isRemapFormValidState
    });
  }

  // IMEI Validation Method
  isValidIMEI(imei: string): boolean {
    if (!imei) return false;
    
    // Clean the IMEI (remove non-numeric characters)
    const cleanedImei = imei.replace(/\D/g, '');
    
    // Check length: 15-20 digits
    const isValidLength = cleanedImei.length >= 15 && cleanedImei.length <= 20;
    
    // Check if it's all numbers
    const isAllNumbers = /^\d+$/.test(cleanedImei);
    
    return isValidLength && isAllNumbers;
  }

  // Field change handler for REMAP form
  onRemapFieldChange(field: keyof RemapData, value: string): void {
    // Update the field value
    this.remapData[field] = value;
    
    // Check for changes and validate
    this.checkRemapChanges();
  }

  // UPDATED: REMAP-IMEI-MID Submit Method - CVN is now optional
  submitRemapImeiMid(): void {
    this.submittedRemap = true;
    
    if (!this.isRemapFormValidState) {
      this.showNotification('⚠️ Please fill all required fields with valid values.', 'error');
      return;
    }

    // Validate IMEI format one more time
    if (!this.isValidIMEI(this.remapData.ime)) {
      this.showNotification('⚠️ IMEI must be 15-20 numeric digits.', 'error');
      return;
    }

    this.isRemapLoading = true;

    // Prepare the payload exactly as in your curl example
    const payload: RemapData = {
      cpi: this.remapData.cpi,        // Chip ID (required)
      cvn: this.remapData.cvn || '',  // Current Value Number (Board Version) - optional
      ime: this.remapData.ime,        // New IMEI value (required)
      mid: this.remapData.mid         // Machine ID (required)
    };

    console.log('📤 Sending REMAP-IMEI-MID Payload:', payload);
    console.log('Calling initializeGSMDetails API...');

    // Call the service method - this is the key line that needs to work
    this.dataService.initializeGSMDetails(payload).subscribe(
      (res: any) => {
        this.isRemapLoading = false;
        this.submittedRemap = false;
        
        console.log('📥 REMAP API Response:', res);
        
        if (res && res.code === 200) {
          this.remapResponse = {
            success: true,
            message: res.phrase || 'GSM details processed successfully.',
            data: {
              machineId: this.remapData.mid,
              merchantId: this.merchantId,
              imei: this.remapData.ime,
              cpi: this.remapData.cpi,
              cvn: this.remapData.cvn || 'Not provided'
            },
            timestamp: new Date().toISOString()
          };
          
          this.showNotification('✅ ' + (res.phrase || 'GSM details processed successfully!'), 'success');
          
          // Update current values after successful submission
          this.currentRemapValues = {
            mid: this.remapData.mid,
            ime: this.remapData.ime,
            cpi: this.remapData.cpi,
            cvn: this.remapData.cvn || 'Not provided'
          };
          
          // Reset form data but keep machine selected
          this.remapData = {
            cpi: '',
            cvn: '',
            ime: '',
            mid: this.selectedRemapMachineId // Keep machine ID selected
          };
          
          this.isRemapChanged = false;
          this.isRemapFormValidState = false;
        } else {
          this.remapResponse = {
            success: false,
            message: res?.phrase || 'Failed to process GSM details',
            data: null,
            timestamp: new Date().toISOString()
          };
          this.showNotification(`⚠️ ${res?.phrase || 'Remap failed'}`, 'error');
        }
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.isRemapLoading = false;
        this.submittedRemap = false;
        
        console.error('❌ REMAP API Error Details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        
        this.remapResponse = {
          success: false,
          message: error.error?.phrase || error.error?.message || 'API call failed',
          data: null,
          timestamp: new Date().toISOString()
        };
        
        // Show detailed error message with CORS specific guidance
        let errorMsg = 'Error initializing GSM details';
        if (error.status === 0) {
          errorMsg = `
          ❌ CORS/Network Error: 
          1. The API endpoint may not allow requests from localhost
          2. Please check if the backend server has CORS enabled for this endpoint
          3. URL attempted: ${error.url || 'Unknown'}
        `;
        } else if (error.status === 404) {
          errorMsg = 'API endpoint not found. Check URL configuration.';
        } else if (error.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else {
          errorMsg = `Error ${error.status}: ${error.message || 'Unknown error'}`;
        }
        
        this.showNotification('❌ ' + errorMsg, 'error');
        this.cdr.detectChanges();
      }
    );
  }

  // Clear REMAP form
  clearRemapForm(): void {
    this.remapData = {
      cpi: '',
      cvn: '',
      ime: '',
      mid: this.selectedRemapMachineId || ''
    };
    this.remapResponse = null;
    this.submittedRemap = false;
    this.isRemapChanged = false;
    this.isRemapFormValidState = false;
    this.cdr.detectChanges();
  }

  // For backward compatibility
  isRemapFormValid(): boolean {
    return this.isRemapFormValidState;
  }

  // IMEI Validation Method (for backward compatibility)
  validateIMEI(): void {
    this.checkRemapChanges();
  }

  // Add these new methods
  loadNotificationAccessData(): void {
    this.loadNotificationUsers();
    this.loadNotificationTypes();
    this.loadEventTypes();
  }

  loadNotificationUsers(): void {
    this.dataService.getAllUser(this.merchantId).subscribe(
      (res: any) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.users = res.data
            .filter((user: { email: any }) => user.email)
            .map((user: { userId: any; email: any; userName: any }) => ({
              userId: user.userId,
              email: user.email,
              userName: user.userName || 'No Name',
            }));
        }
      },
      (error: any) => {
        console.error('Error loading users:', error);
      }
    );
  }

  loadNotificationTypes(): void {
    this.dataService.getAllNotificationType().subscribe(
      (res: any) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.notificationTypes = res.data.map((type: any) => ({
            id: type.notificationTypeId,
            name: type.notificationTypeName,
          }));
          console.log('Notification types loaded:', this.notificationTypes);
        } else {
          console.error('Unexpected response format for notification types');
          this.notificationTypes = [];
        }
      },
      (error: any) => {
        console.error('Error loading notification types:', error);
        this.notificationTypes = [];
      }
    );
  }

  loadEventTypes(): void {
    this.dataService.getAllEventType().subscribe(
      (res: any) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.eventTypes = res.data.map((event: any) => ({
            id: event.eventTypeId,
            name: event.eventTypeName,
            selected: false,
          }));
          console.log('Event types loaded:', this.eventTypes);
        } else {
          console.error('Unexpected response format for event types');
          this.eventTypes = [];
        }
      },
      (error: any) => {
        console.error('Error loading event types:', error);
        this.eventTypes = [];
      }
    );
  }

  updateSelectedEventTypes(): void {
    const allEvent = this.eventTypes.find((e) => e.name === 'All');

    if (allEvent && allEvent.selected) {
      // Only include "All"'s ID
      this.selectedEventTypeIds = [allEvent.id];
    } else {
      // Include all selected except "All"
      this.selectedEventTypeIds = this.eventTypes
        .filter((e) => e.selected && e.name !== 'All')
        .map((e) => e.id);
    }
  }

  onEventTypeChange(changedEvent: any): void {
    if (changedEvent.name === 'All') {
      // If "All" is selected, select/deselect all
      this.eventTypes.forEach(
        (event) => (event.selected = changedEvent.selected)
      );
    } else {
      // If any non-"All" is toggled, check/uncheck "All" accordingly
      const allEvent = this.eventTypes.find((e) => e.name === 'All');
      const otherEvents = this.eventTypes.filter((e) => e.name !== 'All');

      if (allEvent) {
        allEvent.selected = otherEvents.every((e) => e.selected);
      }
    }

    this.updateSelectedEventTypes();
  }

  saveNotificationAccess(): void {
    // Validate inputs
    if (!this.selectedUserId) {
      this.showNotification('⚠️ Please select a user.', 'error');
      return;
    }

    if (!this.selectedNotificationTypeId) {
      this.showNotification('⚠️ Please select a notification type.', 'error');
      return;
    }

    if (this.selectedEventTypeIds.length === 0) {
      this.showNotification(
        '⚠️ Please select at least one event type.',
        'error'
      );
      return;
    }

    // Prepare payload
    const payload = {
      eventTypeId: this.selectedEventTypeIds,
      merchantId: this.merchantId,
      notificationTypeId: this.selectedNotificationTypeId,
      userId: this.selectedUserId,
    };

    console.log('📤 Sending Notification Access Payload:', payload);

    // Call the service
    this.dataService.setUserNotificationAccess(payload).subscribe(
      (response: any) => {
        console.log('✅ Notification Access Response:', response);
        if (response && response.code === 200) {
          this.showNotification(
            '✅ Notification access saved successfully!',
            'success'
          );
          this.clearNotificationAccessForm();
        } else {
          this.showNotification(
            `⚠️ ${response.phrase || 'Failed to save notification access.'}`,
            'error'
          );
        }
      },
      (error: any) => {
        console.error('❌ Notification Access Error:', error);
        this.showNotification(
          `❌ Error: ${error.message || 'Failed to save notification access.'}`,
          'error'
        );
      }
    );
  }

  clearNotificationAccessForm(): void {
    this.selectedUserId = null;
    this.selectedNotificationTypeId = null;
    this.selectedEventTypeIds = [];

    // Reset checkboxes
    this.eventTypes.forEach((event) => (event.selected = false));

    // Reset the form to initial state
    this.cdr.detectChanges();
  }

  getItemsByMerchant(merchantId: string): void {
    this.dataService.getItemsByMerchant(merchantId).subscribe(
      (res: any) => {
        if (res.code === 200 && res.data) {
          // Map the API response to our item list
          this.itemList = res.data.map((item: any) => ({
            iid: item.itemId, // itemId corresponds to iid
            itp: item.sellPrice, // sellPrice corresponds to itp
          }));
        }
      },
      (error: any) => {
        console.error('Error fetching items:', error);
      }
    );
  }

  // This method is triggered when the Item ID (iid) changes in the dropdown
  onIidChange(): void {
    const selected = this.itemList.find(
      (item) => item.iid === this.updatedValues.iid
    );
    if (selected) {
      // Update the Napkin Cost (itp) based on the selected Item ID (iid)
      this.updatedValues.itp = selected.itp;
    }
  }
  
  onProjectChange(): void {
    this.selectedMachineId = ''; // Clear previously selected machine
    this.filteredMachineIds = []; // Optionally clear machine list before loading new ones
    this.selectedMachineIdPricing = ''; // Clear dropdown placeholder value

    if (this.selectedProjectId !== null) {
      this.getMachinesByProject(this.selectedProjectId);
    }
    this.cdr.detectChanges(); // Force refresh if needed
  }

  onProjectChangeFota(): void {
    this.selectedMachineId = ''; // Clear previously selected machine
    this.filteredMachineIds = []; // Optionally clear machine list before loading new ones
    this.selectedMachineIdPricing = ''; // Clear dropdown placeholder value

    if (this.selectedProjectIdfota !== null) {
      this.getOnlineMachinesByProject(this.selectedProjectIdfota);
    }
    this.cdr.detectChanges(); // Force refresh if needed
  }

  onMachineChange(): void {
    // Reset the current values before fetching new data
    this.resetData();
    if (!this.selectedMachineId) {
      this.showNotification('⚠️ Please select a machine first.', 'error');
      return;
    }
    if (this.activeTab !== 'machineInstalled') {
      this.dataService
        .getBusinessConfig(this.merchantId, this.selectedMachineId)
        .subscribe(
          (res: any) => {
            console.log('📥 Business Config Response:', res);

            if (res.code !== 200 || res.error) {
              const msg =
                res.phrase || res.error || 'Business configuration error.';
              this.showNotification(`⚠️ ${msg}`, 'error');
              return;
            }

            const configData = res.data?.ica?.[0]; // First object in ICA array

            if (configData) {
              this.currentValues.iid = configData.iid || '';
              this.currentValues.itp = configData.itp || '';
              this.currentValues.qrBytes = configData.qrb || '';
            } else {
              this.currentValues.iid = '';
              this.currentValues.itp = '';
              this.currentValues.qrBytes = '';
            }

            this.cdr.detectChanges();

          },
          (error: any) => {
            console.error('❌ Business Config HTTP Error:', error);

            if (error.status === 404) {
              this.showNotification(
                'No configuration found for the selected machine. Please set configurations.',
                'error'
              );
            } else if (error.status === 401) {
              this.showNotification(
                '🔒 Error 401: Unauthorized access to business config.',
                'error'
              );
            } else if (error.status === 500) {
              this.showNotification(
                '💥 Error 500: Server error while fetching business config.',
                'error'
              );
            } else if (error.status === 0) {
              this.showNotification(
                '🔌 Network error while fetching business config.',
                'error'
              );
            } else {
              this.showNotification(
                `❌ Error ${error.status}: ${
                  error.error?.message || 'Unknown error occurred'
                }`,
                'error'
              );
            }
          }
        );

      // Fetch Incineration Config
      this.dataService
        .getAdvanceConfig(this.merchantId, this.selectedMachineId)
        .subscribe(
          (res: any) => {
            console.log('📥 Incineration Config Response:', res);

            if (res.code !== 200 || res.error) {
              const msg =
                res.phrase || res.error || 'Advanced configuration error.';
              this.showNotification(`⚠️ ${msg}`, 'error');
              return;
            }

            const incinerationData = res.data;

            if (incinerationData) {
              this.incinerationCurrentValues.scheduler =
                incinerationData.scheduler || '';
              this.incinerationCurrentValues.limitSwitch =
                incinerationData.limitSwitch || '';
              this.incinerationCurrentValues.napkinCost =
                incinerationData.napkinCost || '';
              this.incinerationCurrentValues.setHeaterTempA =
                incinerationData.setHeaterTempA || '';
              this.incinerationCurrentValues.setHeaterTempB =
                incinerationData.setHeaterTempB || '';
              this.incinerationCurrentValues.heaterAMinTemp =
                incinerationData.heaterAMinTemp || '';
              this.incinerationCurrentValues.heaterBOnTemp =
                incinerationData.heaterBOnTemp || '';

              if (this.activeTab === 'incineration') {
                this.currentValues = {
                  iid: '',
                  itp: '',
                  qrBytes: '',
                  ...this.incinerationCurrentValues,
                };
              }
            } else {
              this.incinerationCurrentValues = {
                scheduler: '',
                limitSwitch: '',
                napkinCost: '',
                setHeaterTempA: '',
                setHeaterTempB: '',
                heaterAMinTemp: '',
                heaterBOnTemp: '',
              };
            }

            this.cdr.detectChanges();

          },
          (error: any) => {
            console.error('❌ Incineration Config HTTP Error:', error);

            if (error.status === 404) {
              this.showNotification(
                'No configuration found for the selected machine. Please set configurations.',
                'error'
              );
            } else if (error.status === 401) {
              this.showNotification(
                '🔒 Error 401: Unauthorized access.',
                'error'
              );
            } else if (error.status === 500) {
              this.showNotification(
                '💥 Error 500: Server error occurred.',
                'error'
              );
            } else if (error.status === 0) {
              this.showNotification(
                '🔌 Network error. Please check your connection.',
                'error'
              );
            } else {
              this.showNotification(
                `❌ Error ${error.status}: ${
                  error.error?.message || 'Unknown error occurred'
                }`,
                'error'
              );
            }
          }
        );

      this.dataService
        .getFotaVersionDetails(this.merchantId, this.selectedMachineId)
        .subscribe(
          (res: any) => {
            console.log('📥 FOTA Version Response:', res);

            if (res.code !== 200 || res.error) {
              const msg =
                res.phrase || res.error || 'FOTA version fetch error.';
              this.showNotification(`⚠️ ${msg}`, 'error');
              return;
            }

            const fotaData = res.data;

            if (fotaData) {
              this.selectedMachineId = fotaData.machineid || '';
              this.installedStatus = fotaData.currentVersion || 'Not Installed';
              this.uid = fotaData.imenumber || '';
              this.fotaRows = fotaData.updatedVersion || [];
              this.selectedUpdatedVersion = null; // For dropdown selection
            } else {
              this.selectedMachineId = '';
              this.installedStatus = 'Not Available';
              this.uid = '';
              this.fotaRows = [];
            }

            this.cdr.detectChanges();

          },
          (error: any) => {
            console.error('❌ FOTA Config HTTP Error:', error);

            if (error.status === 404) {
              this.showNotification(
                '⚠️ No FOTA info found for the machine.',
                'error'
              );
            } else if (error.status === 0) {
              this.showNotification(
                '🔌 Network error. Please check your connection.',
                'error'
              );
            } else {
              this.showNotification(
                `❌ Error ${error.status}: ${
                  error.error?.message || 'Unknown error occurred'
                }`,
                'error'
              );
            }
          }
        );
    }
  }

  selectMachineFota(id: string) {
    this.selectedFotaMachineId = id;
    console.log('Fota Machine selected:', id);

    const alreadyExists = this.fotaMachines.some(
      (machine) => machine.machineid === id
    );
    if (alreadyExists) {
      this.showNotification(
        `⚠️ Machine ${id} is already added to the grid.`,
        'error'
      );
      return;
    }

    // Fetch fota data based on selectedMachineId
    this.dataService
      .getFotaVersionDetails(this.merchantId, this.selectedFotaMachineId)
      .subscribe(
        (res: any) => {
          console.log('📥 FOTA Version Response:', res);

          if (res.code !== 200 || res.error) {
            const msg = res.phrase || res.error || 'FOTA version fetch error.';
            this.showNotification(`⚠️ ${msg}`, 'error');
            return;
          }

          const fotaData = res.data;

          if (fotaData) {
            this.fotaMachines.push({
              machineid: fotaData.machineid || '',
              installedStatus: fotaData.currentVersion || 'Not Installed',
              uid: fotaData.imenumber || '',
              updatedVersion: fotaData.updatedVersion || [],
              selectedUpdatedVersion: null,
              merchantId: this.merchantId || '',
              isSelected: false // Add this property for selection
            });
          }

          this.cdr.detectChanges();

        },
        (error: any) => {
          console.error('❌ FOTA Config HTTP Error:', error);
          if (error.status === 404) {
            this.showNotification(
              '⚠️ No FOTA info found for the machine.',
              'error'
            );
          } else if (error.status === 0) {
            this.showNotification(
              '🔌 Network error. Please check your connection.',
              'error'
            );
          } else {
            this.showNotification(
              `❌ Error ${error.status}: ${
                error.error?.message || 'Unknown error occurred'
              }`,
              'error'
            );
          }
        }
      );
  }
  
  toggleSelectAll() {
    for (let i = 0; i < this.fotaMachines.length; i++) {
      this.fotaMachines[i].isSelected = this.masterSelected;
    }
    this.getSelectedMachines();
  }
  
  checkIfAllSelected() {
    this.masterSelected = this.fotaMachines.every(function (item: any) {
      return item.isSelected == true;
    });
    this.getSelectedMachines();
  }
  
  toggleSelection1(machine: any) {
    const index = this.selectedMachines.findIndex(
      (x) => x.machineid === machine.machineid
    );
    if (index > -1) {
      this.selectedMachines.splice(index, 1);
    } else {
      this.selectedMachines.push(machine);
    }
  }
  
  getSelectedMachines() {
    this.selectedMachines = this.fotaMachines.filter((m) => m.isSelected);
  }
  
  isSelected(machine: any): boolean {
    return this.selectedMachines.some((x) => x.machineid === machine.machineid);
  }

  saveSelected() {
    console.log('✅ Selected Machines to save:', this.selectedMachines);
    // Post this.selectedMachines to your API if needed
  }

  deleteRow(machine: any) {
    const index = this.fotaMachines.indexOf(machine);
    if (index > -1) {
      this.fotaMachines.splice(index, 1);
      this.getSelectedMachines();
    }
  }

  submitFotaConfig(): void {
    var merchantid = this.merchantId;
    const invalidMachines = this.selectedMachines.filter(
      (machine) =>
        machine.selectedUpdatedVersion === null ||
        machine.selectedUpdatedVersion === '' ||
        machine.selectedUpdatedVersion === 0
    );

    if (invalidMachines.length > 0) {
      const invalidIds = invalidMachines.map((m) => m.machineid).join(', ');
      this.showNotification(
        `⚠️ Please select an Updated Version for the following machines: ${invalidIds}`,
        'error'
      );
      return;
    }

    const payload = this.selectedMachines.map((machine) => ({
      currentVersion: machine.installedStatus,
      imenumber: machine.uid,
      machineid: machine.machineid,
      merchantid: merchantid, // Ensure this field exists in your machine object
      updatedVersion: machine.selectedUpdatedVersion,
    }));

    console.log('📤 Sending FOTA Config List:', payload);
    this.dataService.savefota(payload).subscribe(
      (response: any) => {
        console.log('✅ FOTA Config Submitted:', response);
        if (response && response.code === 200) {
          this.showNotification(
            '✅ FOTA Config Submitted Successfully!',
            'success'
          );
          this.fotaConfigList = [];
          this.fotaMachines = [];
          this.selectedMachines = [];
          this.masterSelected = false;
        } else {
          this.showNotification(
            `⚠️ ${response.phrase || 'Unexpected response from server.'}`,
            'error'
          );
        }
      },
      (error: any) => {
        console.error('❌ FOTA Submission Error:', error);
        this.showNotification(
          `❌ Error: ${error.message || 'Unknown error occurred'}`,
          'error'
        );
      }
    );
  }

  getOnlineMachinesByProject(clienId: number): void {
    console.log('client id ============>', clienId);
    if (!clienId || !this.merchantId) return;

    this.dataService
      .getOnlineMachinesByClient(this.merchantId, clienId)
      .subscribe(
        (res: any) => {
          if (res.code === 200 && Array.isArray(res.data)) {
            console.log(
              'response data for the fota screen machineIds ============>',
              res.data
            );
            this.machineIds = res.data; // ✅ correct key
            this.selectedMachineId = ''; // reset previously selected machine
            this.selectedFotaMachineId = '';
            this.cdr.detectChanges();

          } else {
            this.machineIds = [];
            this.showNotification(
              '⚠️ No machines found for selected client.',
              'error'
            );
          }
        },
        (error: any) => {
          console.error('❌ Error fetching machines by client:', error);
          this.showNotification(
            '❌ Failed to fetch machines for selected client.',
            'error'
          );
        }
      );
  }

  getMachinesByProject(clientId: number): void {
    console.log('client id ============>', clientId);
    if (!clientId || !this.merchantId) return;

    this.dataService.getMachinesByClient(this.merchantId, clientId).subscribe(
      (res: any) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          console.log(
            'response data for the other screens machineIds ============>',
            res.data
          );
          this.machineIds = res.data; // ✅ correct key
          this.selectedMachineId = ''; // reset previously selected machine
          this.selectedFotaMachineId = '';
          this.cdr.detectChanges();

        } else {
          this.machineIds = [];
          this.showNotification(
            '⚠️ No machines found for selected client.',
            'error'
          );
        }
      },
      (error: any) => {
        console.error('❌ Error fetching machines by client:', error);
        this.showNotification(
          '❌ Failed to fetch machines for selected client.',
          'error'
        );
      }
    );
  }

  // Helper method to reset data
  private resetData() {
    this.currentValues = {
      iid: '',
      itp: '',
      qrBytes: '',
    };
    this.incinerationCurrentValues = {
      scheduler: '',
      limitSwitch: '',
      napkinCost: '',
      setHeaterTempA: '',
      setHeaterTempB: '',
      heaterAMinTemp: '',
      heaterBOnTemp: '',
    };
    this.updatedValues = { iid: null as number | null, itp: 0, qrBytes: '' };
    this.updatedIncinerationValues = {
      scheduler: '',
      limitSwitch: '',
      napkinCost: '',
      setHeaterTempA: '',
      setHeaterTempB: '',
      heaterAMinTemp: '',
      heaterBOnTemp: '',
    };
  }

  submitUpdatedConfig(): void {
    if (!this.selectedMachineId) {
      this.showNotification(
        '⚠️ Please select a machine before submitting.',
        'error'
      );
      return;
    }

    if (this.updatedValues.itp && !this.updatedValues.qrBytes) {
      this.showNotification('⚠️ Please enter QR URL.', 'error');
      return;
    }

    const payload = {
      iid: this.updatedValues.iid || this.currentValues.iid,
      itp: this.updatedValues.itp || this.currentValues.itp,
      mid: this.selectedMachineId,
      qrb: this.updatedValues.qrBytes || this.currentValues.qrBytes,
    };

    console.log('📤 Sending Payload to Business Config API:', payload);

    this.dataService.businessQr(payload).subscribe(
      (response: any) => {
        console.log('🔹 API Response Received: ', response);

        if (response && response.code === 200) {
          console.log('✅ Config Submitted Successfully', response);

          this.showNotification('✅ Config Updated Successfully!', 'success');
          this.clearEnteredValues();
          this.onMachineChange();
        } else if (
          response &&
          response.code === 404 &&
          response.error ===
            'A machine with the given QR Code ID already exists'
        ) {
          // Handle the error case with custom popup and include the phrase from the response
          console.log('⚠️ QR Code already exists, triggering custom popup.');

          // Get the specific phrase from the response or use a default message
          const detailPhrase = response.phrase || 'QR Code ID already exists.';
          let qrCodePart = '';
          let machinePart = '';

          if (
            detailPhrase.includes('QR Code ID:') &&
            detailPhrase.includes('Machine ID:')
          ) {
            const parts = detailPhrase.split('Machine ID:');
            qrCodePart = parts[0].trim(); // "QR Code ID: XXXXX is already mapped to"
            machinePart = 'Machine ID: ' + parts[1].trim(); // "Machine ID: YYYYY"
          } else {
            // Fallback if the format is different
            qrCodePart = detailPhrase;
          }

          // Create message with the specific line break you want
          const formattedMessage = `⚠️ ${qrCodePart}<br>
        ${machinePart} Do you want to replace it?`;

          this.openPopup('QR Code Confirmation', formattedMessage, () => {
            this.updateQrCode();
          });
        } else {
          const msg = response?.error || 'Unexpected response format.';
          this.showNotification(`⚠️ ${msg}`, 'error');
        }
      },
      (error: any) => {
        console.error('❌ Submission Error:', error);
        console.log('Error Details:', error);

        // Check if the API response indicates QR Code exists
        if (
          error.status === 404 &&
          error.error?.error ===
            'A machine with the given QR Code ID already exists'
        ) {
          console.log('⚠️ QR Code already exists, triggering custom popup.');

          // Extract the phrase from the error response
          const detailPhrase =
            error.error?.phrase || 'QR Code ID already exists.';

          this.openPopup(
            'QR Code Confirmation',
            `⚠️ ${detailPhrase} Do you want to replace it?`,
            () => {
              this.updateQrCode(); // This will run when user clicks "OK"
            }
          );
        } else {
          // Handle other errors
          this.showNotification(
            `❌ Error: ${error.status} ${
              error.error?.message || error.error || 'Unknown error occurred'
            }`,
            'error'
          );
        }
      }
    );
  }
  
  updateQrCode(): void {
    // Prepare the payload to update QR Code
    const payloadWithFlag = {
      iid: this.updatedValues.iid || this.currentValues.iid,
      itp: this.updatedValues.itp || this.currentValues.itp,
      mid: this.selectedMachineId,
      qrb: this.updatedValues.qrBytes || this.currentValues.qrBytes,
    };

    // Add flag to indicate replacement (flag = 1 for replacement)
    this.dataService.businessQr(payloadWithFlag, 1).subscribe(
      (retryResponse: any) => {
        console.log('🔄 Retry Response:', retryResponse);

        if (retryResponse && retryResponse.code === 200) {
          this.showNotification('✅ QR Replaced Successfully!', 'success');
        } else {
          this.showNotification(
            `⚠️ ${retryResponse?.error || 'Unexpected response.'}`,
            'error'
          );
        }
      },
      (retryErr: any) => {
        console.log('❌ Retry Failed:', retryErr);
        this.showNotification(
          `❌ Retry Failed: ${retryErr.error?.message || 'Unknown error'}`,
          'error'
        );
      }
    );
  }

  onSubmitMachineInstalled(): void {
    if (
      !this.selectedMachineId ||
      !this.installedStatus ||
      (this.installedStatus === 'Yes' && !this.uid)
    ) {
      this.showNotification('⚠️ Please fill all required fields.', 'error');
      return;
    }

    // Format the installedDate to yyyy-MM-dd HH:mm:ss by adding :00 at the end
    let formattedInstalledDate = this.installedDate.toString();
    if (formattedInstalledDate.length === 16) {
      // If format is yyyy-MM-ddTHH:mm
      formattedInstalledDate = formattedInstalledDate.replace('T', ' ') + ':00';
    }

    const machineOnboardingPayload = {
      machineId: this.selectedMachineId,
      machineInfo: {
        uid: this.uid,
        pcbNo: this.pcbNo,
        mcSrNo: this.mcSrNo,
        installed: Number(this.installedStatus),
        installedDate: formattedInstalledDate,
        field: 'UID',
      },
      installed: Number(this.installedStatus),
      merchantId: this.merchantId,
    };

    // 🔍 Log the payload being sent to the API
    console.log(
      '📤 Submitting Machine Onboarding Payload:',
      machineOnboardingPayload
    );
    this.dataService.machineOnboarding(machineOnboardingPayload).subscribe(
      (response: any) => {
        if (response.code === 200) {
          this.showNotification(
            '✅ Machine Installed successfully.',
            'success'
          );
          this.resetMachineInstalledForm();
        } else {
          this.showNotification(
            `⚠️ ${response.error || 'An error occurred.'}`,
            'error'
          );
        }
      },
      (error: any) => {
        this.showNotification(
          `❌ Error: ${error.message || 'Unknown error.'}`,
          'error'
        );
      }
    );
  }

  validateHeaterInputs(): boolean {
    const { setHeaterTempA, setHeaterTempB, heaterAMinTemp, heaterBOnTemp } =
      this.updatedIncinerationValues;

    // Check if Heater A and Heater B cut-off temperatures are updated
    if (setHeaterTempA && setHeaterTempB) {
      // Validate: Heater A cut-off temp must be greater than Heater B cut-off
      if (+setHeaterTempA <= +setHeaterTempB) {
        this.showNotification(
          '⚠️ Heater A cut-off temperature must be greater than Heater B cut-off temperature.',
          'error'
        );
        return false;
      }
    }

    // Validate: Heater A Minimum Temperature should be less than Heater A Cut-off Temperature
    if (heaterAMinTemp && setHeaterTempA) {
      if (+heaterAMinTemp >= +setHeaterTempA) {
        this.showNotification(
          '⚠️ Heater A Minimum Temperature should be less than Heater A cut-off temperature.',
          'error'
        );
        return false;
      }
    }

    // Validate: Heater A Min Temp should be greater than Heater B cut-off temperature
    if (heaterAMinTemp && setHeaterTempB) {
      if (+heaterAMinTemp <= +setHeaterTempB) {
        this.showNotification(
          '⚠️ Heater A Minimum Temperature should be greater than Heater B cut-off temperature.',
          'error'
        );
        return false;
      }
    }

    // Validate: Heater B ON Temp should be less than both Heater A and B cut-off temperatures
    if (heaterBOnTemp) {
      if (
        (setHeaterTempA && +heaterBOnTemp >= +setHeaterTempA) ||
        (setHeaterTempB && +heaterBOnTemp >= +setHeaterTempB)
      ) {
        this.showNotification(
          '⚠️ Heater B ON temperature must be less than both Heater A and B cut-off temperatures.',
          'error'
        );
        return false;
      }
    }

    return true; // ✅ All validations passed
  }

  validateTimeInputs(): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    if (
      this.updatedIncinerationValues.scheduler &&
      !timeRegex.test(this.updatedIncinerationValues.scheduler)
    ) {
      this.showNotification(
        '⚠️ Invalid time format. Please use HH:MM format where HH ≤ 23 and MM ≤ 59.',
        'error'
      );
      return false;
    }
    return true;
  }

  validateNumericInputs(): boolean {
    const numericFields: (keyof typeof this.updatedIncinerationValues)[] = [
      'napkinCost',
      'setHeaterTempA',
      'setHeaterTempB',
      'heaterAMinTemp',
      'heaterBOnTemp',
    ];

    for (const field of numericFields) {
      if (
        this.updatedIncinerationValues[field] &&
        +this.updatedIncinerationValues[field] > 1000
      ) {
        this.showNotification(
          `⚠️ ${field} value cannot be greater than 1000.`,
          'error'
        );
        return false;
      }
    }

    return true;
  }

  submitIncinerationConfig(): void {
    // Check if machineId is selected
    if (!this.selectedMachineId) {
      this.showNotification('⚠️ Please select a Machine ID.', 'error');
      return;
    }

    // First, validate if updated values exist, only run validation for updated fields
    if (this.updatedIncinerationValues) {
      if (!this.validateHeaterInputs()) {
        return;
      }
    }

    if (!this.validateTimeInputs() || !this.validateNumericInputs()) {
      return;
    }

    // Prepare and send the payload
    const incinerationPayload = {
      scheduler:
        this.updatedIncinerationValues.scheduler ||
        this.incinerationCurrentValues.scheduler,
      limitSwitch:
        this.updatedIncinerationValues.limitSwitch ||
        this.incinerationCurrentValues.limitSwitch,
      napkinCost:
        this.updatedIncinerationValues.napkinCost ||
        this.incinerationCurrentValues.napkinCost,
      setHeaterTempA:
        this.updatedIncinerationValues.setHeaterTempA ||
        this.incinerationCurrentValues.setHeaterTempA,
      setHeaterTempB:
        this.updatedIncinerationValues.setHeaterTempB ||
        this.incinerationCurrentValues.setHeaterTempB,
      heaterAMinTemp:
        this.updatedIncinerationValues.heaterAMinTemp ||
        this.incinerationCurrentValues.heaterAMinTemp,
      heaterBOnTemp:
        this.updatedIncinerationValues.heaterBOnTemp ||
        this.incinerationCurrentValues.heaterBOnTemp,
      machineId: this.selectedMachineId,
      merchantId: this.merchantId,
      installedDate: this.installedDate,
    };

    // Send payload to the API
    console.log(
      '📤 Sending Payload to Incineration Config API:',
      incinerationPayload
    );
    this.dataService.advnaceconfig(incinerationPayload).subscribe(
      (response: any) => {
        console.log('✅ Incineration Config Submitted:', response);
        if (response && response.code === 200) {
          this.showNotification(
            '✅ Incineration Config Updated Successfully!',
            'success'
          );
          this.clearIncinerationValues();
          this.onMachineChange();
        } else {
          this.showNotification(
            `⚠️ ${response.phrase || 'Unexpected response from server.'}`,
            'error'
          );
        }
      },
      (error: any) => {
        console.error('❌ Submission Error:', error);
        this.showNotification(
          `❌ Error: ${error.message || 'Unknown error occurred'}`,
          'error'
        );
      }
    );
  }
  
  clearEnteredValues(): void {
    this.updatedValues = { iid: null as number | null, itp: 0, qrBytes: '' };
  }

  clearIncinerationValues(): void {
    this.schedulerHour = null;
    this.schedulerMinute = null;
    this.updatedIncinerationValues = {
      scheduler: '',
      limitSwitch: '',
      napkinCost: '',
      setHeaterTempA: '',
      setHeaterTempB: '',
      heaterAMinTemp: '',
      heaterBOnTemp: '',
    };
  }

  clearClientAndMachine(): void {
    this.selectedClientId = '';
    this.selectedMachineId = '';
    this.selectedMachineIdPricing = '';
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.submittedRemap = false;

    // Clear REMAP data when switching from REMAP tab
    if (tab !== 'remapImeiMid') {
      this.clearRemapForm();
      this.currentRemapValues = {
        cpi: '',
        cvn: '',
        ime: '',
        mid: ''
      };
      this.selectedRemapProjectId = null;
      this.selectedRemapMachineId = '';
      this.remapMachineIds = [];
      this.filteredRemapMachineIds = [];
      this.remapMachineData = null;
      this.isFetchingMachineData = false;
      this.isRemapChanged = false;
      this.isRemapFormValidState = false; // Clear validity state
    }

    // Clear form data when switching from machine installed tab
    if (tab !== 'machineInstalled') {
      this.resetMachineInstalledForm();
    }

    // Clear notification access form when switching from that tab
    if (tab !== 'notificationAccess') {
      this.clearNotificationAccessForm();
    }

    // Reset other tab-specific data
    this.selectedFotaMachineId = '';
    this.selectedProjectIdfota = null;
    this.fotaMachines = [];
    this.selectedProjectId = null;
    this.machineIds = [];
    this.clientname = '';
    this.selectedMachineIdPricing = null;

    // Clear form values
    this.currentValues = { iid: '', itp: '', qrBytes: '' };
    this.updatedValues = { iid: null, itp: 0, qrBytes: '' };

    this.incinerationCurrentValues = {
      scheduler: '',
      limitSwitch: '',
      napkinCost: '',
      setHeaterTempA: '',
      setHeaterTempB: '',
      heaterAMinTemp: '',
      heaterBOnTemp: '',
    };

    this.notification = { message: '', type: '' };
  }

  resetMachineInstalledForm(): void {
    this.installedStatus = '1';
    this.uid = '';
    this.pcbNo = '';
    this.mcSrNo = '';
    this.installedDate = '';
    this.notificationMessage = '';
    this.notificationType = '';
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notification.message = message;
    this.notification.type = type;

    setTimeout(() => {
      this.notification.message = '';
      this.notification.type = '';
    }, 8000);
  }
  
  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // Restrict to 3 digits max
    if (value.length > 3) {
      inputElement.value = value.slice(0, 3); // Truncate input to 4 characters
      this.updatedIncinerationValues.setHeaterTempA = inputElement.value; // Update the model
    }
  }
  
  onLimitSwitchInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    // Restrict the input to 2 digits
    if (inputElement.value.length > 2) {
      inputElement.value = inputElement.value.slice(0, 2); // Trim the input to 2 digits
    }
  }
  
  onInputChangeHeaterAMinTemp(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.length > 3) {
      inputElement.value = inputElement.value.slice(0, 3); // Restrict to 4 digits
    }
  }
  
  onHeaterBOnTempChange(event: any): void {
    const input = event.target;
    let value = input.value;

    // Trim to 3 digits max
    if (value.length > 3) {
      value = value.slice(0, 3);
    }

    // Convert to number and enforce max limit
    const numericValue = Math.min(parseInt(value || '0', 10), 999);

    // Update the input field and the model
    input.value = numericValue.toString();
    this.updatedIncinerationValues.heaterBOnTemp = numericValue.toString();
  }

  onInputChangeSetHeaterTempA(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.length > 3) {
      inputElement.value = inputElement.value.slice(0, 3); // Restrict to 4 digits
    }
  }
  
  onHeaterTempBInput(event: any) {
    const rawValue = event.target.value.slice(0, 3);
    const val = Math.min(+rawValue, 1000);
    this.updatedIncinerationValues.setHeaterTempB = val.toString(); // Convert to string here
  }

  validateItp(event: any): void {
    let value = event.target.value;

    // Restrict value to 2 digits before and after decimal
    const regex = /^\d{0,3}(\.\d{0,3})?$/;

    if (!regex.test(value)) {
      value = value.slice(0, -1); // Remove last character
    }

    if (parseFloat(value) > 999) {
      value = '999.00';
    }

    event.target.value = value;
    this.updatedValues.itp = parseFloat(value); // Update model
  }

  getFormattedSchedulerTime(): string {
    if (!this.incinerationCurrentValues.scheduler) return '';

    const [hourStr, minuteStr] =
      this.incinerationCurrentValues.scheduler.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const hourLabel = hour === 1 ? 'Hour' : 'Hours';
    const minuteLabel = minute === 1 ? 'Minute' : 'Minutes';

    return `${hour} ${hourLabel} ${minute} ${minuteLabel}`;
  }

  toggleDropdownPricing(event: MouseEvent): void {
    this.dropdownOpenPricing = !this.dropdownOpenPricing;
    event.stopPropagation(); // Prevent event propagation to document
  }

  // Handle selecting a machine
  onInstalledChange(): void {
    this.isInstalled = this.installedStatus === '0';

    if (this.isInstalled) {
      this.uid = '';
      this.pcbNo = '';
      this.mcSrNo = '';
      this.installedDate = '';
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = (event.target as HTMLElement).closest('.form-select');

    // Close pricing dropdown if clicked outside
    if (!clickedInside && this.dropdownOpenPricing) {
      this.dropdownOpenPricing = false;
    }

    // Close machine dropdown if clicked outside
    if (!clickedInside && this.dropdownOpenMachine) {
      this.dropdownOpenMachine = false;
    }

    // Close general dropdown if clicked outside
    if (!clickedInside && this.dropdownOpen) {
      this.dropdownOpen = false;
    }

    // Close REMAP dropdown if clicked outside
    if (!clickedInside && this.remapDropdownOpen) {
      this.remapDropdownOpen = false;
    }
  }
  
  toggleDropdown(event: MouseEvent): void {
    this.dropdownOpen = !this.dropdownOpen;
    event.stopPropagation(); // Prevent event propagation to document
  }

  onDateChange(event: string) {
    // Convert to your required format: 'YYYY-MM-DD HH:mm:ss'
    const date = new Date(event);
    const formatted = this.formatDateTime(date);
    console.log('Formatted Date:', formatted); // e.g. 2025-05-08 23:59:00
  }

  formatDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}   ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  }

  filterMachineIds(): void {
    const searchTerm = this.machineSearch.toLowerCase();
    this.filteredMachineIds = this.machineIds.filter((id) =>
      id.toLowerCase().includes(searchTerm)
    );
  }

  selectMachine(id: string) {
    this.selectedMachineId = id;
    this.dropdownOpen = false;
    this.dropdownOpenMachine = false;

    // Only call onMachineChange if we're not on the Machine Installed tab
    if (this.activeTab !== 'machineInstalled') {
      this.onMachineChange();
    }
  }

  selectClient(id: string) {
    this.selectedClientId = id;
    this.clientDropdownOpen = false;
    this.onProjectChange(); // Optional if you want to trigger something
  }
}