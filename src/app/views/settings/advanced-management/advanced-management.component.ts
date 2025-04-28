// import { ChangeDetectorRef, Component, OnInit ,HostListener,ElementRef } from '@angular/core';
// import { DataService } from '../../../service/data.service';
// import { CommonDataService } from '../../../Common/common-data.service';

 
// @Component({
//   selector: 'app-advanced-management',
//   templateUrl: './advanced-management.component.html',
//   styleUrls: ['./advanced-management.component.scss']
// })

// export class AdvancedManagementComponent implements OnInit {
//   schedulerHour: number | null = null;
//   schedulerMinute: number | null = null;
//   merchantId: string = '';
//   machineIds: string[] = [];
//   selectedMachineId: string = '';
//   activeTab: string = 'pricing'; // Active tab selector for pricing or incineration
//   incinerationConfig: any = null;
//   projectList: any[] = [];
//  selectedProjectId!: number | null;
//  clientId!: number;
//  searchText: string = '';
//  filteredMachineIds: string[] = [];
//  selectedMachineIdPricing: string | null = null;
//  dropdownOpenPricing: boolean = false;
//  machineSearchTermPricing: string = '';
// // Or correct your type
//   // Pricing Config Values (current values and updated values)
//   currentValues = {
//     iid: '',
//     itp: '',
//     qrBytes: ''
//   };
//   itemList: any[] = [];
//   updatedValues = {
//     iid: null as number | null,
//     itp: 0,
//     qrBytes: ''
//   };
 
//   notification = {
//     message: '',
//     type: ''  // 'success' or 'error'
//   };
//   // Incineration Config Values (current values and updated values)
//   incinerationCurrentValues = {
   
//     scheduler: '',
//     limitSwitch: '',
//     napkinCost: '',
//     setHeaterTempA: '',
//     setHeaterTempB: '',
//     heaterAMinTemp: '',
//     heaterBOnTemp: ''
//   };
 
//   updatedIncinerationValues = {
   
//     scheduler: '',
//     limitSwitch: '',
//     napkinCost: '',
//     setHeaterTempA: '',
//     setHeaterTempB: '',
//     heaterAMinTemp: '',
//     heaterBOnTemp: ''
//   };


//   // Add these properties to your component class
// showPopup = false;
// popupTitle = '';
// popupMessage = '';
// popupConfirmAction: () => void = () => {};
 
//   constructor(
//     private commonDataService: CommonDataService,
//     private dataService: DataService,
//     private changeDetectorRef: ChangeDetectorRef,
//     private eRef: ElementRef
//   ) {}
 
//   // @HostListener('document:click', ['$event'])
//   // handleClickOutside(event: MouseEvent) {
//   //   if (!this.eRef.nativeElement.contains(event.target)) {
//   //     this.dropdownOpenPricing = false;
//   //   }
//   // }
  
//   selectMachinePricing(id: string) {
//     this.selectedMachineIdPricing = id;
//     this.selectedMachineId = id;
//     this.dropdownOpenPricing = false;
//     this.machineSearchTerm = ''; // Clear search text

//     console.log('Machine selected:', id); // ✅ debug
  
  
//     // Fetch pricing data based on selectedMachineId
//     this.dataService.getBusinessConfig(this.merchantId, this.selectedMachineIdPricing).subscribe(
//       (res: any) => {
//         console.log('📥 Business Config Response:', res);
   
//         if (res.code !== 200 || res.error) {
//           const msg = res.phrase || res.error || 'Business configuration error.';
//           this.showNotification(`⚠️ ${msg}`, 'error');
//           return;
//         }
   
//         const configData = res.data?.ica?.[0]; // First object in ICA array
   
//         if (configData) {
//           this.currentValues.iid = configData.iid || '';
//           this.currentValues.itp = configData.itp || '';
//           this.currentValues.qrBytes = configData.qrb || '';
//         } else {
//           this.currentValues.iid = '';
//           this.currentValues.itp = '';
//           this.currentValues.qrBytes = '';
//         }
   
//         this.changeDetectorRef.detectChanges();
//       },
//       error => {
//         console.error("❌ Business Config HTTP Error:", error);
   
//         if (error.status === 404) {
//           this.showNotification("No configuration found for the selected machine. Please set configurations.", "error");
//         } else if (error.status === 401) {
//           this.showNotification("🔒 Error 401: Unauthorized access to business config.", "error");
//         } else if (error.status === 500) {
//           this.showNotification("💥 Error 500: Server error while fetching business config.", "error");
//         } else if (error.status === 0) {
//           this.showNotification("🔌 Network error while fetching business config.", "error");
//         } else {
//           this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
//         }
//       }
//     );
   
//   }
    
// // Method to open the popup with HTML support
// openPopup(title: string, message: string, confirmAction: () => void) {
//   this.popupTitle = title;
//   this.popupMessage = message;
//   this.popupConfirmAction = confirmAction;
//   this.showPopup = true;
// }
// // Method to handle confirm action
// confirmPopup() {
//   this.popupConfirmAction();
//   this.showPopup = false;
// }

// // Method to handle cancel
// cancelPopup() {
//   this.showPopup = false;
// }

//   ngOnInit(): void {
//     this.filteredMachineIds = this.machineIds; // Set initially
//     this.merchantId = this.commonDataService.getMerchantId();
//     this.machineIds = Array.isArray(this.commonDataService.userDetails?.machineId)
//     ? this.commonDataService.userDetails.machineId
//     : [];
//     const userDetails = this.commonDataService.userDetails;
 
//     this.projectList = userDetails?.projectName || [];
 
//     if (this.projectList.length > 0) {
//       this.selectedProjectId = this.projectList[0].ProjectId;
//       if (this.projectList.length > 0) {
//         this.selectedProjectId = this.projectList[0].ProjectId;
     
//         if (this.selectedProjectId !== null) {
//           this.getMachinesByProject(this.selectedProjectId!);
//         }
//       }
//       this.getItemsByMerchant(this.merchantId);
//     }
//   }
//   getItemsByMerchant(merchantId: string): void {
//     this.dataService.getItemsByMerchant(merchantId).subscribe(
//       (res) => {
//         if (res.code === 200 && res.data) {
//           // Map the API response to our item list
//           this.itemList = res.data.map((item: any) => ({
//             iid: item.itemId, // itemId corresponds to iid
//             itp: item.sellPrice, // sellPrice corresponds to itp
//           }));
//         }
//       },
//       (error) => {
//         console.error('Error fetching items:', error);
//       }
//     );
//   }
 
//   // This method is triggered when the Item ID (iid) changes in the dropdown
//   onIidChange(): void {
//     const selected = this.itemList.find(item => item.iid === this.updatedValues.iid);
//     if (selected) {
//       // Update the Napkin Cost (itp) based on the selected Item ID (iid)
//       this.updatedValues.itp = selected.itp;
//     }
//   }
//   onProjectChange(): void {
//     if (this.selectedProjectId !== null) {
//       this.getMachinesByProject(this.selectedProjectId);
//     }
//   }
 
// onMachineChange(): void {
//   // Reset the current values before fetching new data
//   this.resetData();
//  debugger
//   if (!this.selectedMachineId) {
//     this.showNotification("⚠️ Please select a machine first.", "error");
//     return;
//   }
 
//   // 📡 Fetch Business Config
//   this.dataService.getBusinessConfig(this.merchantId, this.selectedMachineId).subscribe(
//     (res: any) => {
//       console.log('📥 Business Config Response:', res);
 
//       if (res.code !== 200 || res.error) {
//         const msg = res.phrase || res.error || 'Business configuration error.';
//         this.showNotification(`⚠️ ${msg}`, 'error');
//         return;
//       }
 
//       const configData = res.data?.ica?.[0]; // First object in ICA array
 
//       if (configData) {
//         this.currentValues.iid = configData.iid || '';
//         this.currentValues.itp = configData.itp || '';
//         this.currentValues.qrBytes = configData.qrb || '';
//       } else {
//         this.currentValues.iid = '';
//         this.currentValues.itp = '';
//         this.currentValues.qrBytes = '';
//       }
 
//       this.changeDetectorRef.detectChanges();
//     },
//     error => {
//       console.error("❌ Business Config HTTP Error:", error);
 
//       if (error.status === 404) {
//         this.showNotification("No configuration found for the selected machine. Please set configurations.", "error");
//       } else if (error.status === 401) {
//         this.showNotification("🔒 Error 401: Unauthorized access to business config.", "error");
//       } else if (error.status === 500) {
//         this.showNotification("💥 Error 500: Server error while fetching business config.", "error");
//       } else if (error.status === 0) {
//         this.showNotification("🔌 Network error while fetching business config.", "error");
//       } else {
//         this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
//       }
//     }
//   );
 
//   // 🔥 Fetch Incineration Config
//   this.dataService.getAdvancedConfig(this.merchantId, this.selectedMachineId).subscribe(
//     (res: any) => {
//       console.log('📥 Incineration Config Response:', res);
 
//       if (res.code !== 200 || res.error) {
//         const msg = res.phrase || res.error || 'Advanced configuration error.';
//         this.showNotification(`⚠️ ${msg}`, 'error');
//         return;
//       }
 
//       const incinerationData = res.data;
 
//       if (incinerationData) {
//         this.incinerationCurrentValues.scheduler = incinerationData.scheduler || '';
//         this.incinerationCurrentValues.limitSwitch = incinerationData.limitSwitch || '';
//         this.incinerationCurrentValues.napkinCost = incinerationData.napkinCost || '';
//         this.incinerationCurrentValues.setHeaterTempA = incinerationData.setHeaterTempA || '';
//         this.incinerationCurrentValues.setHeaterTempB = incinerationData.setHeaterTempB || '';
//         this.incinerationCurrentValues.heaterAMinTemp = incinerationData.heaterAMinTemp || '';
//         this.incinerationCurrentValues.heaterBOnTemp = incinerationData.heaterBOnTemp || '';
 
//         if (this.activeTab === 'incineration') {
//           this.currentValues = {
//             iid: '',
//             itp: '',
//             qrBytes: '',
//             ...this.incinerationCurrentValues
//           };
//         }
//       } else {
//         this.incinerationCurrentValues = {
//           scheduler: '',
//           limitSwitch: '',
//           napkinCost: '',
//           setHeaterTempA: '',
//           setHeaterTempB: '',
//           heaterAMinTemp: '',
//           heaterBOnTemp: ''
//         };
//       }
 
//       this.changeDetectorRef.detectChanges();
//     },
//     error => {
//       console.error("❌ Incineration Config HTTP Error:", error);
   
//       if (error.code === 404) {
//         this.showNotification("No configuration found for the selected machine. Please set configurations.", "error");
//       } else if (error.code === 401) {
//         this.showNotification("🔒 Error 401: Unauthorized access.", "error");
//       } else if (error.code === 500) {
//         this.showNotification("💥 Error 500: Server error occurred.", "error");
//       } else if (error.code === 0) {
//         this.showNotification("🔌 Network error. Please check your connection.", "error");
//       } else {
//         this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
//       }
//     }
   
//   );
// }
 
// getMachinesByProject(clientId: number): void {
//   if (!clientId || !this.merchantId) return;
 
//   this.dataService.getMachinesByClient(this.merchantId, clientId).subscribe(
//     (res: any) => {
//       if (res.code === 200 && Array.isArray(res.data)) {
//         this.machineIds = res.data;  // ✅ correct key
//         this.selectedMachineId = ''; // reset previously selected machine
//         this.changeDetectorRef.detectChanges();
//       } else {
//         this.machineIds = [];
//         this.showNotification("⚠️ No machines found for selected client.", "error");
//       }
//     },
//     error => {
//       console.error("❌ Error fetching machines by client:", error);
//       this.showNotification("❌ Failed to fetch machines for selected client.", "error");
//     }
//   );
// }
 
 
 
// // Helper method to reset data
// private resetData() {
//   this.currentValues = {
//     iid: '',
//     itp: '',
//     qrBytes: ''
//   };
//   this.incinerationCurrentValues = {
//     scheduler: '',
//     limitSwitch: '',
//     napkinCost: '',
//     setHeaterTempA: '',
//     setHeaterTempB: '',
//     heaterAMinTemp: '',
//     heaterBOnTemp: ''
//   };
//   this.updatedValues = { iid: null as number | null, itp: 0, qrBytes: '' };
//   this.updatedIncinerationValues = {
//     scheduler: '',
//     limitSwitch: '',
//     napkinCost: '',
//     setHeaterTempA: '',
//     setHeaterTempB: '',
//     heaterAMinTemp: '',
//     heaterBOnTemp: ''
//   };
// }
 

// submitUpdatedConfig(): void {
//   if (!this.selectedMachineId) {
//     this.showNotification("⚠️ Please select a machine before submitting.", "error");
//     return;
//   }

//   if (this.updatedValues.itp && !this.updatedValues.qrBytes) {
//     this.showNotification('⚠️ Please enter QR URL.', 'error');
//     return;
//   }

//   const payload = {
//     iid: this.updatedValues.iid || this.currentValues.iid,
//     itp: this.updatedValues.itp || this.currentValues.itp,
//     mid: this.selectedMachineId,
//     qrb: this.updatedValues.qrBytes || this.currentValues.qrBytes
//   };

//   console.log("📤 Sending Payload to Business Config API:", payload);

//   this.dataService.businessQr(payload).subscribe(
//     response => {
//       console.log("🔹 API Response Received: ", response);

//       if (response && response.code === 200) {

//         console.log("✅ Config Submitted Successfully", response);

//         this.showNotification("✅ Config Updated Successfully!", "success");
//         this.clearEnteredValues();
//         this.onMachineChange();
//       } else if (response && response.code === 404 && response.error === "A machine with the given QR Code ID already exists") {
//         // Handle the error case with custom popup and include the phrase from the response
//         console.log("⚠️ QR Code already exists, triggering custom popup.");
        
//         // Get the specific phrase from the response or use a default message
//         const detailPhrase = response.phrase || "QR Code ID already exists.";
//         let qrCodePart = "";
//         let machinePart = "";
        
//         if (detailPhrase.includes("QR Code ID:") && detailPhrase.includes("Machine ID:")) {
//           const parts = detailPhrase.split("Machine ID:");
//           qrCodePart = parts[0].trim(); // "QR Code ID: XXXXX is already mapped to"
//           machinePart = "Machine ID: " + parts[1].trim(); // "Machine ID: YYYYY"
//         } else {
//           // Fallback if the format is different
//           qrCodePart = detailPhrase;
//         }
        
//         // Create message with the specific line break you want
//         const formattedMessage = `⚠️ ${qrCodePart}<br>
//         ${machinePart} Do you want to replace it?`;
        
//         this.openPopup(
//           "QR Code Confirmation",
//           formattedMessage,
//           () => {
//             this.updateQrCode();
//           }
//         );
//               } else {
//         const msg = response?.error || "Unexpected response format.";
//         this.showNotification(`⚠️ ${msg}`, "error");
//       }
//     },
//     error => {
//       console.error("❌ Submission Error:", error);
//       console.log("Error Details:", error);

//       // Check if the API response indicates QR Code exists
//       if (error.status === 404 && 
//           (error.error?.error === "A machine with the given QR Code ID already exists")) {
//         console.log("⚠️ QR Code already exists, triggering custom popup.");
        
//         // Extract the phrase from the error response
//         const detailPhrase = error.error?.phrase || "QR Code ID already exists.";
        
//         this.openPopup(
//           "QR Code Confirmation", 
//           `⚠️ ${detailPhrase} Do you want to replace it?`, 
//           () => {
//             this.updateQrCode(); // This will run when user clicks "OK"
//           }
//         );
//       } else {
//         // Handle other errors
//         this.showNotification(`❌ Error: ${error.status} ${error.error?.message || error.error || 'Unknown error occurred'}`, "error");
//       }
//     }
//   );
// }
//   updateQrCode(): void {
//     // Prepare the payload to update QR Code
//     const payloadWithFlag = {
//       iid: this.updatedValues.iid || this.currentValues.iid,
//       itp: this.updatedValues.itp || this.currentValues.itp,
//       mid: this.selectedMachineId,
//       qrb: this.updatedValues.qrBytes || this.currentValues.qrBytes
//     };
 
//     // Add flag to indicate replacement (flag = 1 for replacement)
//     this.dataService.businessQr(payloadWithFlag, 1).subscribe(
//       retryResponse => {
//         console.log("🔄 Retry Response:", retryResponse);
 
//         if (retryResponse && retryResponse.code === 200) {
//           this.showNotification("✅ QR Replaced Successfully!", "success");
//         } else {
//           this.showNotification(`⚠️ ${retryResponse?.error || "Unexpected response."}`, "error");
//         }
//       },
//       retryErr => {
//         console.log("❌ Retry Failed:", retryErr);
//         this.showNotification(`❌ Retry Failed: ${retryErr.error?.message || 'Unknown error'}`, "error");
//       }
//     );
//   }
 
//   // validateHeaterInputs(): boolean {
//   //   // Destructure updated values from the form state
//   //   const { setHeaterTempA, setHeaterTempB, heaterAMinTemp, heaterBOnTemp } = this.updatedIncinerationValues;
 
//   //   // Check if updated values for heater temps exist (ensure validation only happens when values are updated)
//   //   if (setHeaterTempA && setHeaterTempB) {
//   //     // Only perform the validation if both Set Heater Temp A and Set Heater Temp B are updated.
//   //     if (+setHeaterTempA <= +setHeaterTempB) {
//   //       this.showNotification('⚠️ Heater B cut off temperature must be less than Heater A cut off temperature .', 'error');
//   //       return false;
//   //     }
//   //   }
 
//   //   // Validate Heater A Minimum Temp (if updated)
//   //   if (heaterAMinTemp && +heaterAMinTemp >= +setHeaterTempA) {
//   //     console.log('Heater A Min Temp:', heaterAMinTemp, 'Heater A Cut Off Temp:', setHeaterTempA);

//   //     this.showNotification('⚠️ Heater A Min Temp should be less than  Heater A cut off temperature.', 'error');
//   //     return false;
//   //   }
 
//   //   // Validate Heater A Minimum Temp and Set Heater Temp B (if updated)
//   //   if (heaterAMinTemp && +heaterAMinTemp <= +setHeaterTempB) {
//   //     console.log('Heater A Min Temp:', heaterAMinTemp, 'Heater A Cut Off Temp:', setHeaterTempA);

//   //     this.showNotification('⚠️ Heater A Min Temp should be greater than Heater B cut off temperature.', 'error');
//   //     return false;
//   //   }
 
//   //   // Validate Heater B On Temp (if updated)
//   //   if (heaterBOnTemp && (+heaterBOnTemp >= +setHeaterTempA || +heaterBOnTemp >= +setHeaterTempB)) {
//   //     this.showNotification('⚠️ Heater A temperature to start Heater B should less than heater A cut off temperature.', 'error');
//   //     return false;
//   //   }
 
//   //   return true; // All validations passed
//   // }
//   validateHeaterInputs(): boolean {
//     const { setHeaterTempA, setHeaterTempB, heaterAMinTemp, heaterBOnTemp } = this.updatedIncinerationValues;
  
//     // Check if Heater A and Heater B cut-off temperatures are updated
//     if (setHeaterTempA && setHeaterTempB) {
//       // Validate: Heater A cut-off temp must be greater than Heater B cut-off
//       if (+setHeaterTempA <= +setHeaterTempB) {
//         this.showNotification(
//           '⚠️ Heater A cut-off temperature must be greater than Heater B cut-off temperature.',
//           'error'
//         );
//         return false;
//       }
//     }
  
//     // Validate: Heater A Minimum Temperature should be less than Heater A Cut-off Temperature
//     if (heaterAMinTemp && setHeaterTempA) {
//       if (+heaterAMinTemp >= +setHeaterTempA) {
//         this.showNotification(
//           '⚠️ Heater A Minimum Temperature should be less than Heater A cut-off temperature.',
//           'error'
//         );
//         return false;
//       }
//     }
  
//     // Validate: Heater A Min Temp should be greater than Heater B cut-off temperature
//     if (heaterAMinTemp && setHeaterTempB) {
//       if (+heaterAMinTemp <= +setHeaterTempB) {
//         this.showNotification(
//           '⚠️ Heater A Minimum Temperature should be greater than Heater B cut-off temperature.',
//           'error'
//         );
//         return false;
//       }
//     }
  
//     // Validate: Heater B ON Temp should be less than both Heater A and B cut-off temperatures
//     if (heaterBOnTemp) {
//       if (
//         (setHeaterTempA && +heaterBOnTemp >= +setHeaterTempA) ||
//         (setHeaterTempB && +heaterBOnTemp >= +setHeaterTempB)
//       ) {
//         this.showNotification(
//           '⚠️ Heater B ON temperature must be less than both Heater A and B cut-off temperatures.',
//           'error'
//         );
//         return false;
//       }
//     }
  
//     return true; // ✅ All validations passed
//   }
  
//   validateTimeInputs(): boolean {
//     const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
//     if (this.updatedIncinerationValues.scheduler && !timeRegex.test(this.updatedIncinerationValues.scheduler)) {
//       this.showNotification('⚠️ Invalid time format. Please use HH:MM format where HH ≤ 23 and MM ≤ 59.', 'error');
//       return false;
//     }
//     return true;
//   }
 
//   validateNumericInputs(): boolean {
//     const numericFields: (keyof typeof this.updatedIncinerationValues)[] = [
//       'napkinCost', 'setHeaterTempA', 'setHeaterTempB', 'heaterAMinTemp', 'heaterBOnTemp'
//     ];
 
//     for (const field of numericFields) {
//       if (this.updatedIncinerationValues[field] && +this.updatedIncinerationValues[field] > 1000) {
//         this.showNotification(`⚠️ ${field} value cannot be greater than 1000.`, 'error');
//         return false;
//       }
//     }
 
//     return true;
//   }
 
  
  
//   submitIncinerationConfig(): void {
//     // Check if machineId is selected
//     if (!this.selectedMachineId) {
//       this.showNotification('⚠️ Please select a Machine ID.', 'error');
//       return;
//     }
 
//     // First, validate if updated values exist, only run validation for updated fields
//     if (this.updatedIncinerationValues) {
//       if (!this.validateHeaterInputs()) {
//         return;
//       }
//     }
 
//     if (!this.validateTimeInputs() || !this.validateNumericInputs()) {
//       return;
//     }
 
//     // Prepare and send the payload
//     const incinerationPayload = {
//       scheduler: this.updatedIncinerationValues.scheduler || this.incinerationCurrentValues.scheduler,
//       limitSwitch: this.updatedIncinerationValues.limitSwitch || this.incinerationCurrentValues.limitSwitch,
//       napkinCost: this.updatedIncinerationValues.napkinCost || this.incinerationCurrentValues.napkinCost,
//       setHeaterTempA: this.updatedIncinerationValues.setHeaterTempA || this.incinerationCurrentValues.setHeaterTempA,
//       setHeaterTempB: this.updatedIncinerationValues.setHeaterTempB || this.incinerationCurrentValues.setHeaterTempB,
//       heaterAMinTemp: this.updatedIncinerationValues.heaterAMinTemp || this.incinerationCurrentValues.heaterAMinTemp,
//       heaterBOnTemp: this.updatedIncinerationValues.heaterBOnTemp || this.incinerationCurrentValues.heaterBOnTemp,
//       machineId: this.selectedMachineId,
//       merchantId: this.merchantId
//     };
 
//     // Send payload to the API
//     console.log("📤 Sending Payload to Incineration Config API:", incinerationPayload);
//     this.dataService.advnaceconfig(incinerationPayload).subscribe(
//       response => {
//         console.log("✅ Incineration Config Submitted:", response);
//         if (response && response.code === 200) {
//           this.showNotification("✅ Incineration Config Updated Successfully!", "success");
//           this.clearIncinerationValues();
//           this.onMachineChange();
//         } else {
//           this.showNotification(`⚠️ ${response.phrase || 'Unexpected response from server.'}`, "error");
//         }
//       },
//       error => {
//         console.error("❌ Submission Error:", error);
//         this.showNotification(`❌ Error: ${error.message || 'Unknown error occurred'}`, "error");
//       }
//     );
//   }
 
 
 
//   clearEnteredValues(): void {
//     this.updatedValues = { iid: null as number | null, itp: 0, qrBytes: '' };
//   }
 
//   clearIncinerationValues(): void {
//     this.schedulerHour = null;
//     this.schedulerMinute = null;
//     this.updatedIncinerationValues = { scheduler: '', limitSwitch: '', napkinCost: '', setHeaterTempA: '', setHeaterTempB: '', heaterAMinTemp: '', heaterBOnTemp: '' };
//   }
//   onTabChange(tab: string): void {
//     this.activeTab = tab;
//     this.selectedMachineId = '';
 
//     // Always reset both pricing and incineration values regardless of tab
//     this.currentValues = {
//       iid: '',
//       itp: '',
//       qrBytes: ''
//     };
//     this.updatedValues = {
//       iid: null as number | null,
//       itp: 0,
//       qrBytes: ''
//     };
//     this.incinerationCurrentValues = {
//       scheduler: '',
//       limitSwitch: '',
//       napkinCost: '',
//       setHeaterTempA: '',
//       setHeaterTempB: '',
//       heaterAMinTemp: '',
//       heaterBOnTemp: ''
//     };
 
//     this.notification = {
//       message: '',
//       type: ''
//     };
//   }
 
//   showNotification(message: string, type: 'success' | 'error') {
//     this.notification.message = message;
//     this.notification.type = type;
 
//     setTimeout(() => {
//       this.notification.message = '';
//       this.notification.type = '';
//     }, 8000);
//   }
//   onInputChange(event: Event): void {
//     const inputElement = event.target as HTMLInputElement;
//     const value = inputElement.value;
 
//     // Restrict to 3 digits max
//     if (value.length > 3) {
//       inputElement.value = value.slice(0, 3);  // Truncate input to 4 characters
//       this.updatedIncinerationValues.setHeaterTempA = inputElement.value;  // Update the model
//     }
//   }
//   onLimitSwitchInputChange(event: Event): void {
//     const inputElement = event.target as HTMLInputElement;
 
//     // Restrict the input to 2 digits
//     if (inputElement.value.length > 2) {
//       inputElement.value = inputElement.value.slice(0, 2);  // Trim the input to 2 digits
//     }
//   }
//   onInputChangeHeaterAMinTemp(event: Event): void {
//     const inputElement = event.target as HTMLInputElement;
//     if (inputElement.value.length > 3) {
//       inputElement.value = inputElement.value.slice(0, 3);  // Restrict to 4 digits
//     }
//   }
//   onHeaterBOnTempChange(event: any): void {
//     const input = event.target;
//     let value = input.value;
 
//     // Trim to 3 digits max
//     if (value.length > 3) {
//       value = value.slice(0, 3);
//     }
 
//     // Convert to number and enforce max limit
//     const numericValue = Math.min(parseInt(value || '0', 10), 999);
   
//     // Update the input field and the model
//     input.value = numericValue.toString();
//     this.updatedIncinerationValues.heaterBOnTemp = numericValue.toString();
//   }
 
//   onInputChangeSetHeaterTempA(event: Event): void {
//     const inputElement = event.target as HTMLInputElement;
//     if (inputElement.value.length > 3) {
//       inputElement.value = inputElement.value.slice(0, 3);  // Restrict to 4 digits
//     }
//   }
//   onHeaterTempBInput(event: any) {
//     const rawValue = event.target.value.slice(0, 3);
//     const val = Math.min(+rawValue, 1000);
//     this.updatedIncinerationValues.setHeaterTempB = val.toString(); // Convert to string here
//   }
 
 
//   validateItp(event: any): void {
//     let value = event.target.value;
 
//     // Restrict value to 2 digits before and after decimal
//     const regex = /^\d{0,3}(\.\d{0,3})?$/;
 
//     if (!regex.test(value)) {
//       value = value.slice(0, -1); // Remove last character
//     }
 
//     if (parseFloat(value) > 999) {
//       value = '999.00';
//     }
 
//     event.target.value = value;
//     this.updatedValues.itp = parseFloat(value); // Update model
//   }
//   // onIidChange(): void {
//   //   const selected = this.itemList.find(item => item.iid === this.updatedValues.iid);
//   //   if (selected) {
//   //     this.updatedValues.itp = selected.itp;
//   //   }
//   // }
 
//   getFormattedSchedulerTime(): string {
//     if (!this.incinerationCurrentValues.scheduler) return '';
 
//     const [hourStr, minuteStr] = this.incinerationCurrentValues.scheduler.split(':');
//     const hour = parseInt(hourStr, 10);
//     const minute = parseInt(minuteStr, 10);
 
//     const hourLabel = hour === 1 ? 'Hour' : 'Hours';
//     const minuteLabel = minute === 1 ? 'Minute' : 'Minutes';
 
//     return `${hour} ${hourLabel} ${minute} ${minuteLabel}`;
//   }
 
//   // dropdownOpen = false;
// machineSearchTerm = '';
 
 
// selectMachine(id: string) {
//   this.selectedMachineId = id;
//   this.dropdownOpen = false;
//   this.machineSearchTerm = ''; // Clear search text
//   this.machineSearchTermPricing = ''; // Clear search text

//   this.onMachineChange();
 
// }
// clientDropdownOpen = false;
// clientSearchTerm = '';
// selectedClientId = '';
 
// selectClient(id: string) {
//   this.selectedClientId = id;
//   this.clientDropdownOpen = false;
//   this.clientSearchTerm = ''; // Clear search text
//   this.onProjectChange(); // Optional if you want to trigger something
// }

// machineSearch: string = '';

// filterMachineIds(): void {
//   const searchTerm = this.machineSearch.toLowerCase();
//   this.filteredMachineIds = this.machineIds.filter(id =>
//     id.toLowerCase().includes(searchTerm)
//   );
// }


// // Add a method to clear machine search when dropdown closes
// clearMachineSearch(): void {
//   this.machineSearch = '';
//   this.filteredMachineIds = this.machineIds; // Reset to full list
// }

// toggleDropdownPricing(event: MouseEvent): void {
//   this.dropdownOpenPricing = !this.dropdownOpenPricing;
//   // Clear search when closing the dropdown
//   if (!this.dropdownOpenPricing) {
//     this.machineSearchTermPricing = '';
//     this.machineSearchTerm = ''; // Clear search text

//   }
  
//   event.stopPropagation(); // Prevent event propagation to document
// }

// // Handle selecting a machine


// // Close dropdown when clicking outside
// @HostListener('document:click', ['$event'])
// onClickOutside(event: MouseEvent): void {
//   const clickedInside = (event.target as HTMLElement).closest('.form-select');

  
//   if (!clickedInside && this.dropdownOpenPricing) {
//     this.dropdownOpenPricing = false;
//     this.machineSearchTermPricing = ''; // Clear the search text when dropdown closes
//     this.machineSearchTerm = ''; // Clear search text


//   }

//   if (!clickedInside && this.dropdownOpen) {
//     this.dropdownOpen = false;
//     this.machineSearchTerm = ''; // Clear the search text when dropdown closes
//     this.machineSearchTermPricing = ''; // Clear search text

//   }
  
//   if (!clickedInside && this.clientDropdownOpen) {
//     this.clientDropdownOpen = false;
//     this.clientSearchTerm = ''; // Clear the client search text when dropdown closes
//   }
  
// }

// private _dropdownOpen = false;

// get dropdownOpen(): boolean {
//   return this._dropdownOpen;
// }

// set dropdownOpen(value: boolean) {
//   this._dropdownOpen = value;

//   // Auto-clear search text when dropdown closes
//   if (!value) {
//     this.machineSearchTerm = '';
//     this.machineSearchTermPricing = '';
//   }
// }


// toggleDropdown(event: MouseEvent): void {
//   this.dropdownOpen = !this.dropdownOpen;
//   // Clear search when closing the dropdown
//   if (!this.dropdownOpen) {
//     this.machineSearchTerm = '';
    
//   }
  
//   event.stopPropagation(); // Prevent event propagation to document
// }

// // Handle selecting a machine


// // Close dropdown when clicking outside

 
// }
 
 







// NEWCODE 



import { ChangeDetectorRef, Component, OnInit ,HostListener,ElementRef } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
 
 
@Component({
  selector: 'app-advanced-management',
  templateUrl: './advanced-management.component.html',
  styleUrls: ['./advanced-management.component.scss']
})
 
export class AdvancedManagementComponent implements OnInit {
  fotaTable: any[] = [];
  fotaRows: any[] = [];
selectedFotaRows: Set<string> = new Set(); // store selected machineids
 
  selectedVersion: string = '';
  selectedMachineInstalledId: string = '';
installedStatus: string = ''; // Installed status (1 or 0)
uid: string = '';
  schedulerHour: number | null = null;
  schedulerMinute: number | null = null;
  merchantId: string = '';
  machineIds: string[] = [];
  selectedMachineId: string = '';
  activeTab: string = 'fotaa'; // Active tab selector for pricing or incineration
  incinerationConfig: any = null;
  projectList: any[] = [];
 selectedProjectId!: number | null;
 clientId!: number;
 searchText: string = '';
 filteredMachineIds: string[] = [];
 selectedMachineIdPricing: string | null = null;
 dropdownOpenPricing: boolean = false;
 machineSearchTermPricing: string = '';
 
 fotaConfigList: any[] = [];
 
 
 selectedUpdatedVersion: string | null = null;
 
 // UID input by user
 
// Or correct your type
  // Pricing Config Values (current values and updated values)
  currentValues = {
    iid: '',
    itp: '',
    qrBytes: ''
  };
  itemList: any[] = [];
  updatedValues = {
    iid: null as number | null,
    itp: 0,
    qrBytes: ''
  };
  fotaData = {
    machineid: '',
    imenumber: '',
    updatedVersion: [],  // Will come from API
    selectedVersion: null
  };
  fotaData = {
    machineid: '',
    imenumber: '',
    updatedVersion: [],  // Will come from API
    selectedVersion: null
  };
  notification = {
    message: '',
    type: ''  // 'success' or 'error'
  };
  notificationMessage = '';
notificationType = '';
  notificationMessage = '';
notificationType = '';
  // Incineration Config Values (current values and updated values)
  incinerationCurrentValues = {
   
    scheduler: '',
    limitSwitch: '',
    napkinCost: '',
    setHeaterTempA: '',
    setHeaterTempB: '',
    heaterAMinTemp: '',
    heaterBOnTemp: ''
  };
 
  updatedIncinerationValues = {
   
    scheduler: '',
    limitSwitch: '',
    napkinCost: '',
    setHeaterTempA: '',
    setHeaterTempB: '',
    heaterAMinTemp: '',
    heaterBOnTemp: ''
  };
 
 
  // Add these properties to your component class
showPopup = false;
popupTitle = '';
popupMessage = '';
popupConfirmAction: () => void = () => {};
 
  constructor(
    private commonDataService: CommonDataService,
    private dataService: DataService,
    private changeDetectorRef: ChangeDetectorRef,
    private eRef: ElementRef
  ) {}
 
  // @HostListener('document:click', ['$event'])
  // handleClickOutside(event: MouseEvent) {
  //   if (!this.eRef.nativeElement.contains(event.target)) {
  //     this.dropdownOpenPricing = false;
  //   }
  // }
 
  selectMachinePricing(id: string) {
    debugger
    this.selectedMachineIdPricing = id;
    this.selectedMachineId = id;
    this.dropdownOpenPricing = false;
    console.log('Machine selected:', id); // ✅ debug
 
 
    // Fetch pricing data based on selectedMachineId
    this.dataService.getBusinessConfig(this.merchantId, this.selectedMachineIdPricing).subscribe(
      (res: any) => {
        console.log('📥 Business Config Response:', res);
   
        if (res.code !== 200 || res.error) {
          const msg = res.phrase || res.error || 'Business configuration error.';
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
   
        this.changeDetectorRef.detectChanges();
      },
      error => {
        console.error("❌ Business Config HTTP Error:", error);
   
        if (error.status === 404) {
          this.showNotification("No configuration found for the selected machine. Please set configurations.", "error");
        } else if (error.status === 401) {
          this.showNotification("🔒 Error 401: Unauthorized access to business config.", "error");
        } else if (error.status === 500) {
          this.showNotification("💥 Error 500: Server error while fetching business config.", "error");
        } else if (error.status === 0) {
          this.showNotification("🔌 Network error while fetching business config.", "error");
        } else {
          this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
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
    // this.getFotaVersionDetails();
    // this.getFotaVersionDetails();
    this.filteredMachineIds = this.machineIds; // Set initially
    this.merchantId = this.commonDataService.getMerchantId();
    this.machineIds = Array.isArray(this.commonDataService.userDetails?.machineId)
    ? this.commonDataService.userDetails.machineId
    : [];
    const userDetails = this.commonDataService.userDetails;
 
    this.projectList = userDetails?.projectName || [];
 
    if (this.projectList.length > 0) {
      this.selectedProjectId = this.projectList[0].ProjectId;
      if (this.projectList.length > 0) {
        this.selectedProjectId = this.projectList[0].ProjectId;
     
        if (this.selectedProjectId !== null) {
          this.getMachinesByProject(this.selectedProjectId!);
        }
      }
      this.getItemsByMerchant(this.merchantId);
    }
  }
  getItemsByMerchant(merchantId: string): void {
    this.dataService.getItemsByMerchant(merchantId).subscribe(
      (res) => {
        if (res.code === 200 && res.data) {
          // Map the API response to our item list
          this.itemList = res.data.map((item: any) => ({
            iid: item.itemId, // itemId corresponds to iid
            itp: item.sellPrice, // sellPrice corresponds to itp
          }));
        }
      },
      (error) => {
        console.error('Error fetching items:', error);
      }
    );
  }
 
  // This method is triggered when the Item ID (iid) changes in the dropdown
  onIidChange(): void {
    const selected = this.itemList.find(item => item.iid === this.updatedValues.iid);
    if (selected) {
      // Update the Napkin Cost (itp) based on the selected Item ID (iid)
      this.updatedValues.itp = selected.itp;
    }
  }
  onProjectChange(): void {
    if (this.selectedProjectId !== null) {
      this.getMachinesByProject(this.selectedProjectId);
    }
  }
 
onMachineChange(): void {
  // this.getFotaVersionDetails();
  // this.getFotaVersionDetails();
  // Reset the current values before fetching new data
  this.resetData();
 debugger
  if (!this.selectedMachineId) {
    this.showNotification("⚠️ Please select a machine first.", "error");
    return;
  }
 
  // 📡 Fetch Business Config
  this.dataService.getBusinessConfig(this.merchantId, this.selectedMachineId).subscribe(
    (res: any) => {
      console.log('📥 Business Config Response:', res);
 
      if (res.code !== 200 || res.error) {
        const msg = res.phrase || res.error || 'Business configuration error.';
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
 
      this.changeDetectorRef.detectChanges();
    },
    error => {
      console.error("❌ Business Config HTTP Error:", error);
 
      if (error.status === 404) {
        this.showNotification("No configuration found for the selected machine. Please set configurations.", "error");
      } else if (error.status === 401) {
        this.showNotification("🔒 Error 401: Unauthorized access to business config.", "error");
      } else if (error.status === 500) {
        this.showNotification("💥 Error 500: Server error while fetching business config.", "error");
      } else if (error.status === 0) {
        this.showNotification("🔌 Network error while fetching business config.", "error");
      } else {
        this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
      }
    }
  );
 
 
  // 🔥 Fetch Incineration Config
  this.dataService.getAdvancedConfig(this.merchantId, this.selectedMachineId).subscribe(
    (res: any) => {
      console.log('📥 Incineration Config Response:', res);
 
      if (res.code !== 200 || res.error) {
        const msg = res.phrase || res.error || 'Advanced configuration error.';
        this.showNotification(`⚠️ ${msg}`, 'error');
        return;
      }
 
      const incinerationData = res.data;
 
      if (incinerationData) {
        this.incinerationCurrentValues.scheduler = incinerationData.scheduler || '';
        this.incinerationCurrentValues.limitSwitch = incinerationData.limitSwitch || '';
        this.incinerationCurrentValues.napkinCost = incinerationData.napkinCost || '';
        this.incinerationCurrentValues.setHeaterTempA = incinerationData.setHeaterTempA || '';
        this.incinerationCurrentValues.setHeaterTempB = incinerationData.setHeaterTempB || '';
        this.incinerationCurrentValues.heaterAMinTemp = incinerationData.heaterAMinTemp || '';
        this.incinerationCurrentValues.heaterBOnTemp = incinerationData.heaterBOnTemp || '';
 
        if (this.activeTab === 'incineration') {
          this.currentValues = {
            iid: '',
            itp: '',
            qrBytes: '',
            ...this.incinerationCurrentValues
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
          heaterBOnTemp: ''
        };
      }
 
      this.changeDetectorRef.detectChanges();
    },
    error => {
      console.error("❌ Incineration Config HTTP Error:", error);
   
      if (error.code === 404) {
        this.showNotification("No configuration found for the selected machine. Please set configurations.", "error");
      } else if (error.code === 401) {
        this.showNotification("🔒 Error 401: Unauthorized access.", "error");
      } else if (error.code === 500) {
        this.showNotification("💥 Error 500: Server error occurred.", "error");
      } else if (error.code === 0) {
        this.showNotification("🔌 Network error. Please check your connection.", "error");
      } else {
        this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
      }
    }
   
  );
 
    this.dataService.getFotaVersionDetails(this.merchantId, this.selectedMachineId).subscribe(
      (res: any) => {
        console.log('📥 FOTA Version Response:', res);
 
        if (res.code !== 200 || res.error) {
          const msg = res.phrase || res.error || 'FOTA version fetch error.';
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
 
        this.changeDetectorRef.detectChanges();
      },
      error => {
        console.error("❌ FOTA Config HTTP Error:", error);
 
        if (error.code === 404) {
          this.showNotification("⚠️ No FOTA info found for the machine.", "error");
        } else if (error.code === 0) {
          this.showNotification("🔌 Network error. Please check your connection.", "error");
        } else {
          this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
        }
      }
    );
 
 
 
 
 
}
 
// getFotaVersionDetails() {
//   debugger
//   this.dataService.getFotaVersionDetails(this.merchantId, this.selectedMachineId).subscribe(
//     (res: any) => {
//       console.log('📥 FOTA Version Response:', res);
     
//       if (res.code !== 200 || res.error) {
//         const msg = res.phrase || res.error || 'FOTA version fetch error.';
//         this.showNotification(`⚠️ ${msg}`, 'error');
//         return;
//       }
 
//       const fotaData = res.data;
//       if (fotaData) {
//         this.selectedMachineId = fotaData.machineid || '';
//         this.installedStatus = fotaData.currentVersion || 'Not Installed';
//         this.uid = fotaData.imenumber || '';
//         this.fotaRows = fotaData.updatedVersion || [];
//         this.selectedUpdatedVersion = null; // For dropdown selection
//       } else {
//         this.selectedMachineId = '';
//         this.installedStatus = 'Not Available';
//         this.uid = '';
//         this.fotaRows = [];
//       }
 
//       this.changeDetectorRef.detectChanges();
//     },
//     error => {
//       console.error("❌ FOTA Config HTTP Error:", error);
 
//       if (error.code === 404) {
//         this.showNotification("⚠️ No FOTA info found for the machine.", "error");
//       } else if (error.code === 0) {
//         this.showNotification("🔌 Network error. Please check your connection.", "error");
//       } else {
//         this.showNotification(`❌ Error ${error.status}: ${error.error?.message || 'Unknown error occurred'}`, "error");
//       }
//     }
//   );
// }
 
getMachinesByProject(clientId: number): void {
  if (!clientId || !this.merchantId) return;
 
  this.dataService.getMachinesByClient(this.merchantId, clientId).subscribe(
    (res: any) => {
      if (res.code === 200 && Array.isArray(res.data)) {
        this.machineIds = res.data;  // ✅ correct key
        this.selectedMachineId = ''; // reset previously selected machine
        this.changeDetectorRef.detectChanges();
      } else {
        this.machineIds = [];
        this.showNotification("⚠️ No machines found for selected client.", "error");
      }
    },
    error => {
      console.error("❌ Error fetching machines by client:", error);
      this.showNotification("❌ Failed to fetch machines for selected client.", "error");
    }
  );
}
 
 
 
// Helper method to reset data
private resetData() {
  this.currentValues = {
    iid: '',
    itp: '',
    qrBytes: ''
  };
  this.incinerationCurrentValues = {
    scheduler: '',
    limitSwitch: '',
    napkinCost: '',
    setHeaterTempA: '',
    setHeaterTempB: '',
    heaterAMinTemp: '',
    heaterBOnTemp: ''
  };
  this.updatedValues = { iid: null as number | null, itp: 0, qrBytes: '' };
  this.updatedIncinerationValues = {
    scheduler: '',
    limitSwitch: '',
    napkinCost: '',
    setHeaterTempA: '',
    setHeaterTempB: '',
    heaterAMinTemp: '',
    heaterBOnTemp: ''
  };
}
 
 
submitUpdatedConfig(): void {
  if (!this.selectedMachineId) {
    this.showNotification("⚠️ Please select a machine before submitting.", "error");
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
    qrb: this.updatedValues.qrBytes || this.currentValues.qrBytes
  };
 
  console.log("📤 Sending Payload to Business Config API:", payload);
 
  this.dataService.businessQr(payload).subscribe(
    response => {
      console.log("🔹 API Response Received: ", response);
 
      if (response && response.code === 200) {
 
        console.log("✅ Config Submitted Successfully", response);
 
        this.showNotification("✅ Config Updated Successfully!", "success");
        this.clearEnteredValues();
        this.onMachineChange();
      } else if (response && response.code === 404 && response.error === "A machine with the given QR Code ID already exists") {
        // Handle the error case with custom popup and include the phrase from the response
        console.log("⚠️ QR Code already exists, triggering custom popup.");
       
        // Get the specific phrase from the response or use a default message
        const detailPhrase = response.phrase || "QR Code ID already exists.";
        let qrCodePart = "";
        let machinePart = "";
       
        if (detailPhrase.includes("QR Code ID:") && detailPhrase.includes("Machine ID:")) {
          const parts = detailPhrase.split("Machine ID:");
          qrCodePart = parts[0].trim(); // "QR Code ID: XXXXX is already mapped to"
          machinePart = "Machine ID: " + parts[1].trim(); // "Machine ID: YYYYY"
        } else {
          // Fallback if the format is different
          qrCodePart = detailPhrase;
        }
       
        // Create message with the specific line break you want
        const formattedMessage = `⚠️ ${qrCodePart}<br>
        ${machinePart} Do you want to replace it?`;
       
        this.openPopup(
          "QR Code Confirmation",
          formattedMessage,
          () => {
            this.updateQrCode();
          }
        );
              } else {
        const msg = response?.error || "Unexpected response format.";
        this.showNotification(`⚠️ ${msg}`, "error");
      }
    },
    error => {
      console.error("❌ Submission Error:", error);
      console.log("Error Details:", error);
 
      // Check if the API response indicates QR Code exists
      if (error.status === 404 &&
          (error.error?.error === "A machine with the given QR Code ID already exists")) {
        console.log("⚠️ QR Code already exists, triggering custom popup.");
       
        // Extract the phrase from the error response
        const detailPhrase = error.error?.phrase || "QR Code ID already exists.";
       
        this.openPopup(
          "QR Code Confirmation",
          `⚠️ ${detailPhrase} Do you want to replace it?`,
          () => {
            this.updateQrCode(); // This will run when user clicks "OK"
          }
        );
      } else {
        // Handle other errors
        this.showNotification(`❌ Error: ${error.status} ${error.error?.message || error.error || 'Unknown error occurred'}`, "error");
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
      qrb: this.updatedValues.qrBytes || this.currentValues.qrBytes
    };
 
    // Add flag to indicate replacement (flag = 1 for replacement)
    this.dataService.businessQr(payloadWithFlag, 1).subscribe(
      retryResponse => {
        console.log("🔄 Retry Response:", retryResponse);
 
        if (retryResponse && retryResponse.code === 200) {
          this.showNotification("✅ QR Replaced Successfully!", "success");
        } else {
          this.showNotification(`⚠️ ${retryResponse?.error || "Unexpected response."}`, "error");
        }
      },
      retryErr => {
        console.log("❌ Retry Failed:", retryErr);
        this.showNotification(`❌ Retry Failed: ${retryErr.error?.message || 'Unknown error'}`, "error");
      }
    );
  }
  submitFotaConfig(): void {
    // Validate Machine ID
    if (!this.selectedMachineId) {
      this.showNotification('⚠️ Please select a Machine ID.', 'error');
      return;
    }
 
    // Validate Selected Version
    if (!this.selectedUpdatedVersion) {
      this.showNotification('⚠️ Please select an Updated Version.', 'error');
      return;
    }
 
    // Build the FOTA object
    const fotaConfig = {
      currentVersion: this.installedStatus || '', // or null if needed
      imenumber: this.uid || '',
      machineid: this.selectedMachineInstalledId || '',
      merchantid: this.merchantId || '',
      updatedVersion: this.selectedUpdatedVersion || ''
    };
 
    // Add to array if multiple are supported
    this.fotaConfigList = this.fotaConfigList || []; // create if not exists
    this.fotaConfigList.push(fotaConfig);
 
    // Log or send to server
    console.log('📤 Sending FOTA Config List:', this.fotaConfigList);
    this.dataService.savefota(this.fotaConfigList).subscribe(
      (response: any) => {
        console.log('✅ FOTA Config Submitted:', response);
        if (response && response.code === 200) {
          this.showNotification("✅ FOTA Config Submitted Successfully!", "success");
          this.fotaConfigList = [];
        } else {
          this.showNotification(`⚠️ ${response.phrase || 'Unexpected response from server.'}`, "error");
        }
      },
      (error: any) => {
        console.error('❌ FOTA Submission Error:', error);
        this.showNotification(`❌ Error: ${error.message || 'Unknown error occurred'}`, 'error');
      }
    );
   
  }
 
 
  // onSubmitMachineInstalled(): void {
  //   debugger
  //   if (!this.selectedMachineId || !this.installedStatus || !this.uid) {
  //     this.notificationMessage = '⚠️ Please fill all fields.';
  //     this.notificationType = 'error';
  //     return;
  //   }
 
  //   // Prepare the payload
  //   const machineOnboardingPayload = {
  //     machineId: this.selectedMachineId,
  //     machineInfo: {
  //       uid: this.uid,
  //       installed: Number(this.installedStatus), // Convert to 1 (Yes) or 0 (No)
  //     },
  //     merchantId: this.merchantId
  //   };
 
  //   // Call the API to submit the form
  //   this.dataService.machineOnboarding(machineOnboardingPayload).subscribe(
  //     (response: any) => {
  //       if (response.code === 200) {
  //         this.notificationMessage = '✅ Machine onboarded successfully.';
  //         this.notificationType = 'success';
         
  //       } else {
  //         this.notificationMessage = `⚠️ ${response.error || 'An error occurred.'}`;
  //         this.notificationType = 'error';
  //       }
  //     },
  //     (error) => {
  //       this.notificationMessage = `❌ Error: ${error.message || 'Unknown error.'}`;
  //       this.notificationType = 'error';
  //     }
  //   );
  //   this.resetMachineInstalledForm();
  // }
 
  // onSubmitMachineInstalled(): void {
  //   debugger;
  //   if (!this.selectedMachineId || !this.installedStatus || !this.uid) {
  //     this.showNotification('⚠️ Please fill all fields.', 'error');
  //     return;
  //   }
 
  //   const machineOnboardingPayload = {
  //     machineId: this.selectedMachineId,
  //     machineInfo: {
  //       uid: this.uid,
  //       installed: Number(this.installedStatus),
  //     },
  //     merchantId: this.merchantId
  //   };
 
  //   this.dataService.machineOnboarding(machineOnboardingPayload).subscribe(
  //     (response: any) => {
  //       if (response.code === 200) {
  //         this.showNotification('✅ Machine onboarded successfully.', 'success');
  //         this.resetMachineInstalledForm();
  //       } else {
  //         this.showNotification(`⚠️ ${response.error || 'An error occurred.'}`, 'error');
  //       }
  //     },
  //     (error) => {
  //       this.showNotification(`❌ Error: ${error.message || 'Unknown error.'}`, 'error');
  //     }
  //   );
  // }
  onSubmitMachineInstalled(): void {
    debugger;
    if (!this.selectedMachineId || !this.installedStatus || !this.uid) {
      this.showNotification('⚠️ Please fill all fields.', 'error');
      return;
    }
 
    const machineOnboardingPayload = {
      machineId: this.selectedMachineId,
      machineInfo: {
        uid: this.uid,
        installed: Number(this.installedStatus),
      },
      merchantId: this.merchantId
    };
 
    // 🔍 Log the payload being sent to the API
    console.log('📤 Submitting Machine Onboarding Payload:', machineOnboardingPayload);
 
    this.dataService.machineOnboarding(machineOnboardingPayload).subscribe(
      (response: any) => {
        if (response.code === 200) {
          this.showNotification('✅ Machine Installed successfully.', 'success');
          this.resetMachineInstalledForm();
        } else {
          this.showNotification(`⚠️ ${response.error || 'An error occurred.'}`, 'error');
        }
      },
      (error) => {
        this.showNotification(`❌ Error: ${error.message || 'Unknown error.'}`, 'error');
      }
    );
  }
 
  // validateHeaterInputs(): boolean {
  //   // Destructure updated values from the form state
  //   const { setHeaterTempA, setHeaterTempB, heaterAMinTemp, heaterBOnTemp } = this.updatedIncinerationValues;
 
  //   // Check if updated values for heater temps exist (ensure validation only happens when values are updated)
  //   if (setHeaterTempA && setHeaterTempB) {
  //     // Only perform the validation if both Set Heater Temp A and Set Heater Temp B are updated.
  //     if (+setHeaterTempA <= +setHeaterTempB) {
  //       this.showNotification('⚠️ Heater B cut off temperature must be less than Heater A cut off temperature .', 'error');
  //       return false;
  //     }
  //   }
 
  //   // Validate Heater A Minimum Temp (if updated)
  //   if (heaterAMinTemp && +heaterAMinTemp >= +setHeaterTempA) {
  //     console.log('Heater A Min Temp:', heaterAMinTemp, 'Heater A Cut Off Temp:', setHeaterTempA);
 
  //     this.showNotification('⚠️ Heater A Min Temp should be less than  Heater A cut off temperature.', 'error');
  //     return false;
  //   }
 
  //   // Validate Heater A Minimum Temp and Set Heater Temp B (if updated)
  //   if (heaterAMinTemp && +heaterAMinTemp <= +setHeaterTempB) {
  //     console.log('Heater A Min Temp:', heaterAMinTemp, 'Heater A Cut Off Temp:', setHeaterTempA);
 
  //     this.showNotification('⚠️ Heater A Min Temp should be greater than Heater B cut off temperature.', 'error');
  //     return false;
  //   }
 
  //   // Validate Heater B On Temp (if updated)
  //   if (heaterBOnTemp && (+heaterBOnTemp >= +setHeaterTempA || +heaterBOnTemp >= +setHeaterTempB)) {
  //     this.showNotification('⚠️ Heater A temperature to start Heater B should less than heater A cut off temperature.', 'error');
  //     return false;
  //   }
 
  //   return true; // All validations passed
  // }
  validateHeaterInputs(): boolean {
    const { setHeaterTempA, setHeaterTempB, heaterAMinTemp, heaterBOnTemp } = this.updatedIncinerationValues;
 
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
    if (this.updatedIncinerationValues.scheduler && !timeRegex.test(this.updatedIncinerationValues.scheduler)) {
      this.showNotification('⚠️ Invalid time format. Please use HH:MM format where HH ≤ 23 and MM ≤ 59.', 'error');
      return false;
    }
    return true;
  }
 
  validateNumericInputs(): boolean {
    const numericFields: (keyof typeof this.updatedIncinerationValues)[] = [
      'napkinCost', 'setHeaterTempA', 'setHeaterTempB', 'heaterAMinTemp', 'heaterBOnTemp'
    ];
 
    for (const field of numericFields) {
      if (this.updatedIncinerationValues[field] && +this.updatedIncinerationValues[field] > 1000) {
        this.showNotification(`⚠️ ${field} value cannot be greater than 1000.`, 'error');
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
      scheduler: this.updatedIncinerationValues.scheduler || this.incinerationCurrentValues.scheduler,
      limitSwitch: this.updatedIncinerationValues.limitSwitch || this.incinerationCurrentValues.limitSwitch,
      napkinCost: this.updatedIncinerationValues.napkinCost || this.incinerationCurrentValues.napkinCost,
      setHeaterTempA: this.updatedIncinerationValues.setHeaterTempA || this.incinerationCurrentValues.setHeaterTempA,
      setHeaterTempB: this.updatedIncinerationValues.setHeaterTempB || this.incinerationCurrentValues.setHeaterTempB,
      heaterAMinTemp: this.updatedIncinerationValues.heaterAMinTemp || this.incinerationCurrentValues.heaterAMinTemp,
      heaterBOnTemp: this.updatedIncinerationValues.heaterBOnTemp || this.incinerationCurrentValues.heaterBOnTemp,
      machineId: this.selectedMachineId,
      merchantId: this.merchantId
    };
 
    // Send payload to the API
    console.log("📤 Sending Payload to Incineration Config API:", incinerationPayload);
    this.dataService.advnaceconfig(incinerationPayload).subscribe(
      response => {
        console.log("✅ Incineration Config Submitted:", response);
        if (response && response.code === 200) {
          this.showNotification("✅ Incineration Config Updated Successfully!", "success");
          this.clearIncinerationValues();
          this.onMachineChange();
        } else {
          this.showNotification(`⚠️ ${response.phrase || 'Unexpected response from server.'}`, "error");
        }
      },
      error => {
        console.error("❌ Submission Error:", error);
        this.showNotification(`❌ Error: ${error.message || 'Unknown error occurred'}`, "error");
      }
    );
  }
 
 
 
  clearEnteredValues(): void {
    this.updatedValues = { iid: null as number | null, itp: 0, qrBytes: '' };
  }
 
  clearIncinerationValues(): void {
    this.schedulerHour = null;
    this.schedulerMinute = null;
    this.updatedIncinerationValues = { scheduler: '', limitSwitch: '', napkinCost: '', setHeaterTempA: '', setHeaterTempB: '', heaterAMinTemp: '', heaterBOnTemp: '' };
  }
  onTabChange(tab: string): void {
    debugger
    debugger
    this.activeTab = tab;
    this.selectedMachineId = '';
    if (tab === 'MachineInstalled') {
      this.resetMachineInstalledForm(); // Reset fields when changing tab
    }
    // if (this.activeTab === 'pricing1') {
    //   this.getFotaVersionDetails();
    // }
 
    // Always reset both pricing and incineration values regardless of tab
    this.currentValues = {
      iid: '',
      itp: '',
      qrBytes: ''
    };
    this.updatedValues = {
      iid: null as number | null,
      itp: 0,
      qrBytes: ''
    };
    this.incinerationCurrentValues = {
      scheduler: '',
      limitSwitch: '',
      napkinCost: '',
      setHeaterTempA: '',
      setHeaterTempB: '',
      heaterAMinTemp: '',
      heaterBOnTemp: ''
    };
 
    this.notification = {
      message: '',
      type: ''
    };
  }
  resetMachineInstalledForm(): void {
    this.selectedMachineInstalledId = '';
    this.installedStatus = '';
    this.uid = '';
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
      inputElement.value = value.slice(0, 3);  // Truncate input to 4 characters
      this.updatedIncinerationValues.setHeaterTempA = inputElement.value;  // Update the model
    }
  }
  onLimitSwitchInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
 
    // Restrict the input to 2 digits
    if (inputElement.value.length > 2) {
      inputElement.value = inputElement.value.slice(0, 2);  // Trim the input to 2 digits
    }
  }
  onInputChangeHeaterAMinTemp(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.length > 3) {
      inputElement.value = inputElement.value.slice(0, 3);  // Restrict to 4 digits
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
      inputElement.value = inputElement.value.slice(0, 3);  // Restrict to 4 digits
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
  // onIidChange(): void {
  //   const selected = this.itemList.find(item => item.iid === this.updatedValues.iid);
  //   if (selected) {
  //     this.updatedValues.itp = selected.itp;
  //   }
  // }
 
  getFormattedSchedulerTime(): string {
    if (!this.incinerationCurrentValues.scheduler) return '';
 
    const [hourStr, minuteStr] = this.incinerationCurrentValues.scheduler.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
 
    const hourLabel = hour === 1 ? 'Hour' : 'Hours';
    const minuteLabel = minute === 1 ? 'Minute' : 'Minutes';
 
    return `${hour} ${hourLabel} ${minute} ${minuteLabel}`;
  }
 
  dropdownOpen = false;
machineSearchTerm = '';
 
 
selectMachine(id: string) {
  this.selectedMachineId = id;
  this.dropdownOpen = false;
  this.onMachineChange();
 
}
clientDropdownOpen = false;
clientSearchTerm = '';
selectedClientId = '';
 
selectClient(id: string) {
  this.selectedClientId = id;
  this.clientDropdownOpen = false;
  this.onProjectChange(); // Optional if you want to trigger something
}
 
machineSearch: string = '';
 
filterMachineIds(): void {
  const searchTerm = this.machineSearch.toLowerCase();
  this.filteredMachineIds = this.machineIds.filter(id =>
    id.toLowerCase().includes(searchTerm)
  );
}
toggleDropdownPricing(event: MouseEvent): void {
  this.dropdownOpenPricing = !this.dropdownOpenPricing;
  event.stopPropagation(); // Prevent event propagation to document
}
 
// Handle selecting a machine
 
 
// Close dropdown when clicking outside
@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent): void {
  const clickedInside = (event.target as HTMLElement).closest('.form-select');
  if (!clickedInside && this.dropdownOpenPricing) {
    this.dropdownOpenPricing = false;
  }
}
toggleDropdown(event: MouseEvent): void {
  this.dropdownOpen = !this.dropdownOpen;
  event.stopPropagation(); // Prevent event propagation to document
}
 
// Handle selecting a machine
 
 
// Close dropdown when clicking outside
 
 
}
 
 
 
 
