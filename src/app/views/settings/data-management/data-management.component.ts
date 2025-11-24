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

@Component({
  selector: 'app-data-management',
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.scss'],
})
export class DataManagementComponent implements OnInit {
  activeTab: string = 'dataEntry';
  isSubmitting: boolean = false;
  maxDate: string = '';

  // Data model matching your JSON structure with BigDecimal
  data = {
    burnAvg: null as number | null,
    txnDate: '',
    vendAvg: null as number | null,
    ward: '',
  };

  // Confirmation popup
  showConfirmationPopup: boolean = false;

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

  constructor(
    private router: Router,
    private commonDataService: CommonDataService,
    private dataService: DataService,
    private changeDetectorRef: ChangeDetectorRef,
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize with current date as default and set max date to today
    this.maxDate = this.getCurrentDate();
    this.data.txnDate = this.maxDate;
  }

  // Get current date in YYYY-MM-DD format for the date input
  getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
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
  }

  // Show confirmation popup instead of directly submitting
  onSubmitWithConfirmation(): void {
    if (!this.validateData()) {
      return;
    }

    // Show confirmation popup
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

  // Check if we should show data preview
  showDataPreview(): boolean {
    return !!(
      this.data.ward ||
      this.data.txnDate ||
      this.data.vendAvg !== null ||
      this.data.burnAvg !== null
    );
  }

  // Submit data to backend
  submitData(): void {
    this.isSubmitting = true;

    // Prepare payload with proper data types for BigDecimal
    const payload = {
      burnAvg: this.data.burnAvg,
      txnDate: this.data.txnDate,
      vendAvg: this.data.vendAvg,
      ward: this.data.ward,
    };

    console.log('Submitting data:', payload);

    // Call your data service to save the data
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
            `⚠️ ${
              response.phrase || response.message || 'Failed to save data.'
            }`,
            'error'
          );
        }
      },
      (error) => {
        this.isSubmitting = false;
        console.error('Error saving data:', error);
        this.showNotification(
          `❌ Error: ${
            error.error?.message || error.message || 'Failed to save data.'
          }`,
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

  // Show notification
  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification.message = message;
    this.notification.type = type;

    setTimeout(() => {
      this.notification.message = '';
      this.notification.type = '';
    }, 5000);
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
}
