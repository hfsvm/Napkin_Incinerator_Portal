import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ElementRef,
  HostListener,
} from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.scss'],
})
export class DataManagementComponent implements OnInit {
  activeTab: string = 'dataEntry';
  isSubmitting: boolean = false;
  isUpdatingOnlineStatus: boolean = false;
  isUpdatingStocks: boolean = false;
  maxDate: string = '';

  // Data model matching your JSON structure with BigDecimal
  data = {
    burnAvg: null as number | null,
    txnDate: '',
    vendAvg: null as number | null,
    ward: '',
  };

  // Online Status Update model
  onlineStatusCount: number = 0;
  currentActiveMachines: number = 0;
  totalMachines: number = 0;

  // Stock counts - Will be fetched from API
  stockCounts = {
    empty: 0,    // Will be fetched from API
    low: 0,      // Will be fetched from API  
    full: 0,     // Will be fetched from API
    isLoading: false,
    lastUpdated: null as Date | null
  };

  // Stocks Update model - BIDIRECTIONAL: Can be positive or negative
  stocksData = {
    targetType: '0' as string | null, // Empty(0) or Low(1) - TARGET type
    quantity: 0 as number | null, // Positive or negative number
  };

  // Confirmation popups
  showConfirmationPopup: boolean = false;
  showOnlineStatusConfirmation: boolean = false;
  showStocksConfirmation: boolean = false;

  // Stock type options
  targetTypeOptions = [
    { value: '0', label: 'Empty' },
    { value: '1', label: 'Low' }
  ];

  // Predefined ward options
  wardOptions = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'FN',
    'FS',
    'GN',
    'GS',
    'HE',
    'HW',
    'KE',
    'KW',
    'L',
    'ME',
    'MW',
    'N',
    'PN',
    'PS',
    'RC',
    'RN',
    'RS',
    'S',
    'T',
  ];

  // Notification system
  notification = {
    message: '',
    type: '', // 'success' or 'error'
  };

  // Popup system
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  popupConfirmAction: () => void = () => {};

  // User details for filtering
  userDetails: any = null;

  constructor(
    private router: Router,
    private commonDataService: CommonDataService,
    private dataService: DataService,
    private changeDetectorRef: ChangeDetectorRef,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Initialize with current date as default and set max date to today
    this.maxDate = this.getCurrentDate();
    this.data.txnDate = this.maxDate;
    
    // Get user details for filtering
    this.userDetails = this.commonDataService.userDetails;
    
    // Fetch current active machines count
    this.fetchCurrentActiveMachines();
    
    // Initialize with default values (will be updated when tab is switched)
    this.stockCounts = {
      empty: 0,
      low: 0,
      full: 0,
      isLoading: false,
      lastUpdated: null
    };
  }

  // Get current date in YYYY-MM-DD format for the date input
  getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Helper method to get absolute value
  getAbsoluteValue(value: number | null): number {
    if (value === null) return 0;
    return Math.abs(value);
  }

  // Fetch current active machines count using machine dashboard service
  fetchCurrentActiveMachines(): void {
    const merchantId = this.commonDataService.merchantId;
    if (!merchantId) {
      console.warn('Merchant ID not available');
      return;
    }

    // Build query parameters based on user hierarchy
    const queryParams = this.buildDashboardQueryParams();

    console.log('🔄 Fetching active machines with params:', queryParams);

    // Call machine dashboard service
    this.dataService.getMachineDashboardSummary(queryParams).subscribe({
      next: (response) => {
        console.log('✅ Active machines API response:', response);
        
        if (response.code === 200 && response.data) {
          const {
            machinesInstalled = 0,
            machinesRunning = 0,
          } = response.data;

          this.totalMachines = machinesInstalled;
          this.currentActiveMachines = machinesRunning;
          
          console.log(`📊 Active machines: ${this.currentActiveMachines} / ${this.totalMachines}`);
          
          this.changeDetectorRef.detectChanges(); // Trigger change detection
          
          // Auto-validate current count after fetching new data
          this.validateOnlineStatusCount();
        } else {
          console.warn('⚠️ Unexpected response format for active machines:', response);
        }
      },
      error: (error) => {
        console.error('❌ Error fetching active machines:', error);
        this.showNotification('❌ Failed to fetch current machine status', 'error');
      }
    });
  }

  // Fetch stock counts from API
  fetchStockCounts(): void {
    const merchantId = this.commonDataService.merchantId;
    if (!merchantId) {
      console.warn('Merchant ID not available');
      this.stockCounts.isLoading = false;
      return;
    }

    this.stockCounts.isLoading = true;
    console.log('🔄 Fetching stock counts...');

    // Build query parameters for dashboard API to get stock counts
    const queryParams = this.buildDashboardQueryParams();
    
    console.log('📊 Stock counts API parameters:', JSON.stringify(queryParams, null, 2));

    this.dataService.getMachineDashboardSummary(queryParams).subscribe({
      next: (response) => {
        console.log('📊 Stock counts API response:', response);
        this.stockCounts.isLoading = false;
        this.stockCounts.lastUpdated = new Date();
        
        if (response && response.code === 200 && response.data) {
          const data = response.data;
          
          // Extract stock counts from API response
          this.extractStockCountsFromResponse(data);
          
          this.changeDetectorRef.detectChanges();
          
          console.log(`📊 Stock counts fetched - Empty: ${this.stockCounts.empty}, Low: ${this.stockCounts.low}, Full: ${this.stockCounts.full}`);
        } else {
          console.warn('⚠️ Unexpected response format or empty data:', response);
          this.showNotification('⚠️ Could not fetch stock counts', 'error');
        }
      },
      error: (error) => {
        this.stockCounts.isLoading = false;
        console.error('❌ Error fetching stock counts:', error);
        this.showNotification('❌ Failed to fetch stock counts', 'error');
      }
    });
  }

  // Extract stock counts from API response
  private extractStockCountsFromResponse(data: any): void {
    console.log('🔍 Extracting stock counts from:', data);
    
    // Based on your dashboard API, the properties are:
    // stockEmpty, stockLow, stockOk (for Full)
    if (data.stockEmpty !== undefined) {
      this.stockCounts.empty = data.stockEmpty || 0;
      console.log(`📥 Empty count: ${this.stockCounts.empty}`);
    }
    
    if (data.stockLow !== undefined) {
      this.stockCounts.low = data.stockLow || 0;
      console.log(`📥 Low count: ${this.stockCounts.low}`);
    }
    
    if (data.stockOk !== undefined) {
      this.stockCounts.full = data.stockOk || 0;
      console.log(`📥 Full count: ${this.stockCounts.full}`);
    }
    
    // Also check machinesEmpty, machinesLow, machinesFull as fallback
    if (data.machinesEmpty !== undefined && this.stockCounts.empty === 0) {
      this.stockCounts.empty = data.machinesEmpty || 0;
    }
    
    if (data.machinesLow !== undefined && this.stockCounts.low === 0) {
      this.stockCounts.low = data.machinesLow || 0;
    }
    
    if (data.machinesFull !== undefined && this.stockCounts.full === 0) {
      this.stockCounts.full = data.machinesFull || 0;
    }
    
    console.log(`📊 Final stock counts - Empty: ${this.stockCounts.empty}, Low: ${this.stockCounts.low}, Full: ${this.stockCounts.full}`);
  }

  // Build query parameters for dashboard API
  buildDashboardQueryParams(): any {
    const merchantId = this.commonDataService.merchantId;
    if (!merchantId) {
      console.error('❌ Merchant ID not found');
      return { merchantId: '' };
    }

    const params: any = {
      merchantId: merchantId,
      machineStatus: ['1', '2'],    // Both online and offline
      stockStatus: ['0', '1', '2'], // All stock statuses: 0=Empty, 1=Low, 2=Full
      burnStatus: ['1', '2'],       // All burn statuses
    };

    // Add user hierarchy if available
    if (this.userDetails && Array.isArray(this.userDetails.clients) && this.userDetails.clients.length > 0) {
      const states: string[] = [];
      const districts: string[] = [];
      const zones: string[] = [];
      const wards: string[] = [];
      const beats: string[] = [];
      const machines: string[] = [];
      const clientIds: string[] = [];
      const projectIds: string[] = [];

      this.userDetails.clients.forEach((client: any) => {
        if (client.clientId) {
          clientIds.push(client.clientId.toString());
        }

        client.projects?.forEach((project: any) => {
          if (project.projectId) {
            projectIds.push(project.projectId.toString());
          }

          project.states?.forEach((state: any) => {
            if (state.state) {
              states.push(state.state);
            }

            state.districts?.forEach((district: any) => {
              if (district.district) {
                districts.push(district.district);
              }

              district.zones?.forEach((zone: any) => {
                if (zone.zone) {
                  zones.push(zone.zone);
                }

                zone.wards?.forEach((ward: any) => {
                  if (ward.ward) {
                    wards.push(ward.ward);
                  }

                  ward.beats?.forEach((beat: any) => {
                    if (beat.beat) {
                      beats.push(beat.beat);
                    }

                    if (Array.isArray(beat.machines)) {
                      machines.push(...beat.machines);
                    }
                  });
                });
              });
            });
          });
        });
      });

      // Add filters only if they have values
      if (states.length > 0) params.state = states.join(',');
      if (districts.length > 0) params.district = districts.join(',');
      if (clientIds.length > 0) params.client = clientIds.join(',');
      if (projectIds.length > 0) params.project = projectIds.join(',');
      if (zones.length > 0) params.zone = zones.join(',');
      if (wards.length > 0) params.ward = wards.join(',');
      if (beats.length > 0) params.beat = beats.join(',');
      if (machines.length > 0) params.machine = machines.join(',');
    }

    console.log('📋 Built dashboard query params:', params);
    return params;
  }

  // Handle number input to ensure only whole numbers
  onNumberInput(event: any, field: 'burnAvg' | 'vendAvg'): void {
    const input = event.target;
    let value = input.value;

    // Remove any decimal points and convert to integer
    if (value.includes('.')) {
      value = Math.floor(parseFloat(value));
      input.value = value;
      (this.data as any)[field] = value;
    }

    // Ensure value is within reasonable bounds
    if (value > 9999) {
      value = 9999;
      input.value = value;
      (this.data as any)[field] = value;
    }

    // Handle empty input
    if (value === '') {
      (this.data as any)[field] = null;
    }
  }

  // Handle tab changes
  onTabChange(tab: string): void {
    this.activeTab = tab;
    
    // When switching to update online status tab, refresh active machines count
    if (tab === 'updateOnlineStatus') {
      this.fetchCurrentActiveMachines();
    }
    
    // When switching to update stocks tab, refresh stock counts
    if (tab === 'updateStocks') {
      console.log('🔄 Switching to Update Stocks tab, fetching stock counts...');
      this.fetchStockCounts();
    }
  }

  // Get target type label
  getTargetTypeLabel(targetType: string | null): string {
    if (!targetType) return 'Not selected';
    
    const option = this.targetTypeOptions.find(opt => opt.value === targetType);
    return option ? option.label : 'Unknown';
  }

  // Validate online status count
  validateOnlineStatusCount(): void {
    // Ensure it's an integer
    if (!Number.isInteger(this.onlineStatusCount)) {
      this.onlineStatusCount = Math.round(this.onlineStatusCount);
    }
    
    const max = this.totalMachines - this.currentActiveMachines;
    const min = -this.currentActiveMachines;
    
    // Ensure the value stays within bounds
    if (this.onlineStatusCount > max) {
      this.onlineStatusCount = max;
      if (max > 0) {
        this.showNotification(`⚠️ Cannot exceed available offline machines (${max})`, 'error', 2000);
      }
    } else if (this.onlineStatusCount < min) {
      this.onlineStatusCount = min;
      if (min < 0) {
        this.showNotification(`⚠️ Cannot make more than ${Math.abs(min)} machines offline`, 'error', 2000);
      }
    }
  }

  // Enhanced increase method with animation
  increaseCount(): void {
    const max = this.totalMachines - this.currentActiveMachines;
    
    if (this.onlineStatusCount < max) {
      this.onlineStatusCount++;
      this.animateCountChange('increase');
      this.validateOnlineStatusCount();
    } else if (max <= 0) {
      this.showNotification('ℹ️ No machines available to bring online', 'info', 2000);
    }
  }

  // Enhanced decrease method with animation
  decreaseCount(): void {
    const min = -this.currentActiveMachines;
    
    if (this.onlineStatusCount > min) {
      this.onlineStatusCount--;
      this.animateCountChange('decrease');
      this.validateOnlineStatusCount();
    } else if (min >= 0) {
      this.showNotification('ℹ️ No active machines to take offline', 'info', 2000);
    }
  }

  // Handle mouse wheel for quick adjustments
  onQuantityWheel(event: WheelEvent): void {
    event.preventDefault();
    
    if (event.deltaY < 0) {
      // Scrolling up
      this.increaseCount();
    } else {
      // Scrolling down
      this.decreaseCount();
    }
  }

  // Add visual feedback for count changes
  animateCountChange(direction: 'increase' | 'decrease' | 'reset'): void {
    const input = document.getElementById('onlineStatusCount');
    if (input) {
      input.classList.remove('count-change');
      void input.offsetWidth; // Trigger reflow
      input.classList.add('count-change');
      
      // Remove animation class after animation completes
      setTimeout(() => {
        input.classList.remove('count-change');
      }, 300);
    }
  }

  // Get maximum positive (move FROM Full TO target type)
  getMaxPositive(): number {
    return this.stockCounts.full;
  }

  // Get maximum negative (move FROM target type TO Full)
  getMaxNegative(): number {
    if (!this.stocksData.targetType) return 0;
    
    switch(this.stocksData.targetType) {
      case '0': // Reduce from Empty, move to Full
        return this.stockCounts.empty;
      case '1': // Reduce from Low, move to Full
        return this.stockCounts.low;
      default:
        return 0;
    }
  }

  // Stock quantity methods - BIDIRECTIONAL: Can be positive or negative
  onTargetTypeChange(): void {
    // Reset quantity when target type changes
    this.stocksData.quantity = 0;
    this.validateStockQuantity();
  }

  validateStockQuantity(): void {
    if (this.stocksData.quantity === null) return;
    
    // Ensure it's an integer
    if (!Number.isInteger(this.stocksData.quantity)) {
      this.stocksData.quantity = Math.round(this.stocksData.quantity);
    }
    
    const quantity = this.stocksData.quantity;
    
    if (quantity > 0) {
      // Positive: Moving FROM Full TO target type
      const maxPositive = this.getMaxPositive();
      if (quantity > maxPositive) {
        this.stocksData.quantity = maxPositive;
        if (maxPositive > 0) {
          this.showNotification(`⚠️ Cannot exceed available Full machines (${maxPositive})`, 'error', 2000);
        } else {
          this.showNotification('⚠️ No Full machines available to move', 'error', 2000);
        }
      }
    } else if (quantity < 0) {
      // Negative: Moving FROM target type TO Full
      const maxNegative = this.getMaxNegative();
      const absoluteValue = Math.abs(quantity);
      
      if (absoluteValue > maxNegative) {
        this.stocksData.quantity = -maxNegative;
        if (maxNegative > 0) {
          this.showNotification(`⚠️ Cannot exceed available ${this.getTargetTypeLabel(this.stocksData.targetType)} machines (${maxNegative})`, 'error', 2000);
        } else {
          this.showNotification(`⚠️ No ${this.getTargetTypeLabel(this.stocksData.targetType)} machines available to move`, 'error', 2000);
        }
      }
    }
    
    // Ensure it's not too large (reasonable limit)
    const absoluteValue = Math.abs(this.stocksData.quantity);
    if (absoluteValue > 1000) {
      this.stocksData.quantity = this.stocksData.quantity > 0 ? 1000 : -1000;
      this.showNotification('⚠️ Maximum allowed is 1000', 'error', 2000);
    }
  }

  increaseStockQuantity(): void {
    if (this.stocksData.quantity === null) {
      this.stocksData.quantity = 0;
    }
    
    // Check if we're increasing positive or negative
    if (this.stocksData.quantity >= 0) {
      // Increase positive number
      const maxPositive = this.getMaxPositive();
      if (this.stocksData.quantity < maxPositive) {
        this.stocksData.quantity++;
        this.animateStockQuantityChange('increase');
        this.validateStockQuantity();
      } else if (maxPositive <= 0) {
        this.showNotification('ℹ️ No Full machines available to move', 'info', 2000);
      }
    } else {
      // Make negative number less negative (closer to zero)
      this.stocksData.quantity++;
      this.animateStockQuantityChange('increase');
      this.validateStockQuantity();
    }
  }

  decreaseStockQuantity(): void {
    if (this.stocksData.quantity === null) {
      this.stocksData.quantity = 0;
    }
    
    // Check if we're decreasing positive or negative
    if (this.stocksData.quantity <= 0) {
      // Decrease negative number (make more negative)
      const maxNegative = this.getMaxNegative();
      const absoluteValue = Math.abs(this.stocksData.quantity);
      
      if (absoluteValue < maxNegative) {
        this.stocksData.quantity--;
        this.animateStockQuantityChange('decrease');
        this.validateStockQuantity();
      } else if (maxNegative <= 0) {
        this.showNotification(`ℹ️ No ${this.getTargetTypeLabel(this.stocksData.targetType)} machines available to move`, 'info', 2000);
      }
    } else {
      // Make positive number less positive (closer to zero)
      this.stocksData.quantity--;
      this.animateStockQuantityChange('decrease');
      this.validateStockQuantity();
    }
  }

  onStockQuantityWheel(event: WheelEvent): void {
    event.preventDefault();
    
    if (event.deltaY < 0) {
      // Scrolling up - increase
      this.increaseStockQuantity();
    } else {
      // Scrolling down - decrease
      this.decreaseStockQuantity();
    }
  }

  animateStockQuantityChange(direction: 'increase' | 'decrease' | 'reset'): void {
    const input = document.getElementById('quantity');
    if (input) {
      input.classList.remove('count-change');
      void input.offsetWidth; // Trigger reflow
      input.classList.add('count-change');
      
      // Remove animation class after animation completes
      setTimeout(() => {
        input.classList.remove('count-change');
      }, 300);
    }
  }

  getCurrentTargetCount(): number {
    if (!this.stocksData.targetType) return 0;
    
    switch(this.stocksData.targetType) {
      case '0': return this.stockCounts.empty;
      case '1': return this.stockCounts.low;
      default: return 0;
    }
  }

  getNewTargetCount(): number {
    const current = this.getCurrentTargetCount();
    const quantity = this.stocksData.quantity || 0;
    return current + quantity; // If positive, adds; if negative, subtracts
  }

  getNewFullCount(): number {
    const currentFull = this.stockCounts.full;
    const quantity = this.stocksData.quantity || 0;
    
    // If positive: Moving FROM Full TO target type (Full decreases)
    // If negative: Moving FROM target type TO Full (Full increases)
    return currentFull - quantity; // Inverse relationship
  }

  getStockQuantityIcon(): string {
    const quantity = this.stocksData.quantity || 0;
    if (quantity > 0) return 'bi-arrow-up-circle-fill text-success';
    if (quantity < 0) return 'bi-arrow-down-circle-fill text-danger';
    return 'bi-dash-circle-fill text-secondary';
  }

  getStockQuantityClass(): string {
    const quantity = this.stocksData.quantity || 0;
    if (quantity > 0) return 'text-success';
    if (quantity < 0) return 'text-danger';
    return 'text-secondary';
  }

  getStockActionDescription(): string {
    const quantity = this.stocksData.quantity || 0;
    const targetType = this.getTargetTypeLabel(this.stocksData.targetType);
    const absoluteValue = Math.abs(quantity);
    
    if (quantity > 0) {
      return `move ${absoluteValue} machine(s) FROM Full TO ${targetType}`;
    } else if (quantity < 0) {
      return `move ${absoluteValue} machine(s) FROM ${targetType} TO Full`;
    } else {
      return 'unchanged';
    }
  }

  showStockPreview(): boolean {
    return this.stocksData.targetType !== null && 
           this.stocksData.quantity !== null && 
           this.stocksData.quantity !== 0;
  }

  // Show confirmation for online status update
  submitOnlineStatus(): void {
    if (this.validateOnlineStatus()) {
      this.showOnlineStatusConfirmation = true;
    }
  }

  // Validate online status data
  validateOnlineStatus(): boolean {
    if (this.onlineStatusCount === 0) {
      this.showNotification('⚠️ Please enter a count value (positive or negative).', 'error');
      return false;
    }

    if (!Number.isInteger(this.onlineStatusCount)) {
      this.showNotification('⚠️ Count must be a whole number.', 'error');
      return false;
    }

    // Check bounds
    const max = this.totalMachines - this.currentActiveMachines;
    const min = -this.currentActiveMachines;
    
    if (this.onlineStatusCount > max) {
      this.showNotification(`⚠️ Cannot exceed maximum available (${max})`, 'error');
      return false;
    }
    
    if (this.onlineStatusCount < min) {
      this.showNotification(`⚠️ Cannot go below minimum (${min})`, 'error');
      return false;
    }

    return true;
  }

  // Show confirmation for stocks update
  submitStocksUpdate(): void {
    if (this.validateStocksData()) {
      this.showStocksConfirmation = true;
    }
  }

  // Validate stocks data - BIDIRECTIONAL: Can be positive or negative
  validateStocksData(): boolean {
    // Check target type
    if (!this.stocksData.targetType) {
      this.showNotification('⚠️ Please select a target type.', 'error');
      return false;
    }

    // Check quantity
    if (this.stocksData.quantity === null) {
      this.showNotification('⚠️ Please enter quantity.', 'error');
      return false;
    }

    if (this.stocksData.quantity === 0) {
      this.showNotification('⚠️ Quantity must be non-zero.', 'error');
      return false;
    }

    if (!Number.isInteger(this.stocksData.quantity)) {
      this.showNotification('⚠️ Quantity must be a whole number.', 'error');
      return false;
    }

    const quantity = this.stocksData.quantity;
    
    if (quantity > 0) {
      // Positive: Moving FROM Full TO target type
      const maxPositive = this.getMaxPositive();
      if (quantity > maxPositive) {
        this.showNotification(`⚠️ Not enough Full machines available. Maximum: ${maxPositive}`, 'error');
        return false;
      }
    } else {
      // Negative: Moving FROM target type TO Full
      const maxNegative = this.getMaxNegative();
      const absoluteValue = Math.abs(quantity);
      
      if (absoluteValue > maxNegative) {
        this.showNotification(`⚠️ Not enough ${this.getTargetTypeLabel(this.stocksData.targetType)} machines available. Maximum: ${maxNegative}`, 'error');
        return false;
      }
    }

    return true;
  }

  // User confirmed online status update
  confirmOnlineStatusUpdate(): void {
    this.showOnlineStatusConfirmation = false;
    this.updateOnlineStatus();
  }

  // User canceled online status update
  cancelOnlineStatusUpdate(): void {
    this.showOnlineStatusConfirmation = false;
  }

  // User confirmed stocks update
  confirmStocksUpdate(): void {
    this.showStocksConfirmation = false;
    this.updateStocks();
  }

  // User canceled stocks update
  cancelStocksUpdate(): void {
    this.showStocksConfirmation = false;
  }

  // Update online status with API call
  updateOnlineStatus(): void {
    this.isUpdatingOnlineStatus = true;

    const merchantId = this.commonDataService.merchantId;
    if (!merchantId) {
      this.showNotification('❌ Merchant ID not found. Please login again.', 'error');
      this.isUpdatingOnlineStatus = false;
      return;
    }

    if (this.onlineStatusCount === 0) {
      this.showNotification('⚠️ Please enter a valid count (positive or negative).', 'error');
      this.isUpdatingOnlineStatus = false;
      return;
    }

    const payload = {
      limit: this.onlineStatusCount,
      merchantId: merchantId,
      projectId: 7
    };

    console.log('📤 Updating online status with payload:', payload);

    this.dataService.updateOnlineStatus(payload).subscribe({
      next: (response: any) => {
        this.isUpdatingOnlineStatus = false;
        console.log('✅ Update Online Status Response:', response);
        
        if (response && response.code === 200) {
          const action = this.onlineStatusCount > 0 ? 'ONLINE' : 'OFFLINE';
          const count = this.getAbsoluteValue(this.onlineStatusCount);
          
          const successMessage = response.phrase || `${count} machine(s) brought ${action}`;
          
          this.showNotification(`✅ ${successMessage}`, 'success');
          
          // Update current active machines count
          if (this.onlineStatusCount !== 0) {
            this.currentActiveMachines += this.onlineStatusCount;
            if (this.currentActiveMachines < 0) this.currentActiveMachines = 0;
          }
          
          this.clearOnlineStatusForm();
          
          // Refresh the actual count from API
          setTimeout(() => {
            this.fetchCurrentActiveMachines();
          }, 2000);
        } else {
          const errorMessage = response?.phrase || 
                              response?.message || 
                              response?.error || 
                              'Failed to update online status.';
          this.showNotification(`⚠️ ${errorMessage}`, 'error');
        }
      },
      error: (error: any) => {
        this.isUpdatingOnlineStatus = false;
        console.error('❌ Update Online Status Error:', error);
        
        let errorMessage = 'Failed to update online status.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.statusText) {
          errorMessage = error.statusText;
        }
        
        this.showNotification(`❌ Error: ${errorMessage}`, 'error');
      }
    });
  }

  // Update stocks with API call - BIDIRECTIONAL
  updateStocks(): void {
    this.isUpdatingStocks = true;

    const merchantId = this.commonDataService.merchantId;
    if (!merchantId) {
      this.showNotification('❌ Merchant ID not found. Please login again.', 'error');
      this.isUpdatingStocks = false;
      return;
    }

    // stockLevelId is the TARGET type (0: empty, 1: low)
    // quantity determines direction:
    // - Positive: Move FROM Full TO target type
    // - Negative: Move FROM target type TO Full
    const stockLevelId = parseInt(this.stocksData.targetType || '0');
    const limit = this.stocksData.quantity || 0; // Can be positive or negative
    
    const payload = {
      limit: limit,
      merchantId: merchantId,
      projectId: 7,
      stockLevelId: stockLevelId // Target type (0=Empty, 1=Low)
    };

    console.log('📤 Updating stocks with payload:', payload);

    // Call the API endpoint: loadMachineStockCount
    this.dataService.updateStockCount(payload).subscribe({
      next: (response: any) => {
        this.isUpdatingStocks = false;
        console.log('✅ Update Stocks Response:', response);
        
        if (response && response.code === 200) {
          // Update local stock counts based on the movement
          this.updateLocalStockCounts();
          
          const successMessage = response.phrase || 'Stock updated successfully';
          this.showNotification(`✅ ${successMessage}`, 'success');
          
          this.clearStocksForm();
          
          // Refresh stock counts after successful update
          setTimeout(() => {
            this.fetchStockCounts();
          }, 1000);
          
        } else {
          const errorMessage = response?.phrase || 
                              response?.message || 
                              response?.error || 
                              'Failed to update stocks.';
          this.showNotification(`⚠️ ${errorMessage}`, 'error');
        }
      },
      error: (error: any) => {
        this.isUpdatingStocks = false;
        console.error('❌ Update Stocks Error:', error);
        
        let errorMessage = 'Failed to update stocks.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.statusText) {
          errorMessage = error.statusText;
        }
        
        this.showNotification(`❌ Error: ${errorMessage}`, 'error');
      }
    });
  }

  // Helper method to update local stock counts - BIDIRECTIONAL
  updateLocalStockCounts(): void {
    if (!this.stocksData.targetType || this.stocksData.quantity === null || this.stocksData.quantity === 0) return;
    
    const quantity = this.stocksData.quantity;
    const absoluteValue = Math.abs(quantity);
    const targetType = this.stocksData.targetType;
    
    if (quantity > 0) {
      // Positive: Move FROM Full TO target type
      this.stockCounts.full -= quantity; // Reduce Full
      
      switch(targetType) {
        case '0': // Add to Empty
          this.stockCounts.empty += quantity;
          break;
        case '1': // Add to Low
          this.stockCounts.low += quantity;
          break;
      }
    } else {
      // Negative: Move FROM target type TO Full
      this.stockCounts.full += absoluteValue; // Increase Full
      
      switch(targetType) {
        case '0': // Reduce Empty
          this.stockCounts.empty += quantity; // quantity is negative
          break;
        case '1': // Reduce Low
          this.stockCounts.low += quantity; // quantity is negative
          break;
      }
    }
    
    // Ensure no negative values
    if (this.stockCounts.empty < 0) this.stockCounts.empty = 0;
    if (this.stockCounts.low < 0) this.stockCounts.low = 0;
    if (this.stockCounts.full < 0) this.stockCounts.full = 0;
    
    console.log(`📊 Updated local stock counts - Empty: ${this.stockCounts.empty}, Low: ${this.stockCounts.low}, Full: ${this.stockCounts.full}`);
  }

  // Clear online status form
  clearOnlineStatusForm(): void {
    this.onlineStatusCount = 0;
    this.animateCountChange('reset');
  }

  // Clear stocks form
  clearStocksForm(): void {
    this.stocksData = {
      targetType: '0', // Reset to Empty
      quantity: 0
    };
  }

  // Submit data with confirmation
  onSubmitWithConfirmation(): void {
    if (!this.validateData()) {
      return;
    }

    this.showConfirmationPopup = true;
  }

  // User confirmed submission
  confirmSubmission(): void {
    this.showConfirmationPopup = false;
    this.submitData();
  }

  // User canceled submission
  cancelSubmission(): void {
    this.showConfirmationPopup = false;
  }

  // Submit data to backend
  submitData(): void {
    this.isSubmitting = true;

    const payload = {
      burnAvg: this.data.burnAvg,
      txnDate: this.data.txnDate,
      vendAvg: this.data.vendAvg,
      ward: this.data.ward,
    };

    console.log('Submitting data:', payload);

    this.dataService.loadMachineData(payload).subscribe(
      (response: any) => {
        this.isSubmitting = false;
        console.log('Data saved successfully:', response);

        if (response && response.code === 200) {
          this.showNotification(
            '✅ Machine data saved successfully!',
            'success'
          );
          this.clearForm();
        } else {
          this.showNotification(
            `⚠️ ${response.phrase || response.message || 'Failed to save data.'}`,
            'error'
          );
        }
      },
      (error) => {
        this.isSubmitting = false;
        console.error('Error saving data:', error);
        this.showNotification(
          `❌ Error: ${error.error?.message || error.message || 'Failed to save data.'}`,
          'error'
        );
      }
    );
  }

  // Validate form data
  validateData(): boolean {
    // Check ward
    if (!this.data.ward) {
      this.showNotification('⚠️ Please select a ward.', 'error');
      return false;
    }

    // Check transaction date
    if (!this.data.txnDate) {
      this.showNotification('⚠️ Transaction date is required.', 'error');
      return false;
    }

    // Check vend average
    if (this.data.vendAvg === null || this.data.vendAvg === undefined) {
      this.showNotification('⚠️ Vend average is required.', 'error');
      return false;
    }

    if (this.data.vendAvg < 0) {
      this.showNotification('⚠️ Vend average cannot be negative.', 'error');
      return false;
    }

    if (!Number.isInteger(this.data.vendAvg)) {
      this.showNotification('⚠️ Vend average must be a whole number.', 'error');
      return false;
    }

    // Check burn average
    if (this.data.burnAvg === null || this.data.burnAvg === undefined) {
      this.showNotification('⚠️ Burn average is required.', 'error');
      return false;
    }

    if (this.data.burnAvg < 0) {
      this.showNotification('⚠️ Burn average cannot be negative.', 'error');
      return false;
    }

    if (!Number.isInteger(this.data.burnAvg)) {
      this.showNotification('⚠️ Burn average must be a whole number.', 'error');
      return false;
    }

    return true;
  }

  // Clear the form
  clearForm(): void {
    this.data = {
      burnAvg: null,
      txnDate: this.getCurrentDate(),
      vendAvg: null,
      ward: '',
    };
  }

  // Enhanced show notification with optional duration
  showNotification(message: string, type: 'success' | 'error' | 'info', duration: number = 5000): void {
    this.notification.message = message;
    this.notification.type = type;

    // Clear previous timeout if exists
    if ((this as any)._notificationTimeout) {
      clearTimeout((this as any)._notificationTimeout);
    }

    // Set new timeout
    (this as any)._notificationTimeout = setTimeout(() => {
      this.notification.message = '';
      this.notification.type = '';
    }, duration);
  }

  // Popup methods
  openPopup(title: string, message: string, confirmAction: () => void): void {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupConfirmAction = confirmAction;
    this.showPopup = true;
  }

  confirmPopup(): void {
    this.popupConfirmAction();
    this.showPopup = false;
  }

  cancelPopup(): void {
    this.showPopup = false;
  }

  // Keyboard shortcuts for arrows
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.activeTab === 'updateOnlineStatus' && !this.isUpdatingOnlineStatus) {
      const input = document.getElementById('onlineStatusCount') as HTMLInputElement;
      if (input && input === document.activeElement) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.increaseCount();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.decreaseCount();
        }
      }
    } else if (this.activeTab === 'updateStocks' && !this.isUpdatingStocks) {
      const input = document.getElementById('quantity') as HTMLInputElement;
      if (input && input === document.activeElement) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.increaseStockQuantity();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.decreaseStockQuantity();
        }
      }
    }
  }
}