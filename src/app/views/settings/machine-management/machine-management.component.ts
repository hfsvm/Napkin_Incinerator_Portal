

// // import { Component, OnInit } from '@angular/core';
// // import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// // import { DataService } from '../../../service/data.service';
// // import { CommonDataService } from '../../../Common/common-data.service';

// // @Component({
// //   selector: 'app-machine-management',
// //   templateUrl: './machine-management.component.html',
// //   styleUrls: ['./machine-management.component.scss']
// // })
// // export class MachineManagementComponent implements OnInit {
// //   selectedTab: string = 'advanced';
// //   isMachineSelected: boolean = false;
// //   isLoading: boolean = false;
// //   errorMessage: string = '';
// //   machines: any[] = [];
// //   merchantId: string = 'VIKN250324';
// //   selectedMachineId: string | null = null;
  
// //   businessConfigForm!: FormGroup;
// //   techConfigForm!: FormGroup;
// //   incineratorConfigForm!: FormGroup;

// //   constructor(
// //     private fb: FormBuilder,
// //     private dataService: DataService,
// //     private commonDataService: CommonDataService
// //   ) {}

// //   ngOnInit(): void {
// //     this.initializeForms();
// //     this.loadUserDetails();
// //   }

// //   initializeForms(): void {
// //     this.businessConfigForm = this.fb.group({
// //       mid: ['', Validators.required],
// //       checksum: ['', Validators.required],
// //       imx: ['', Validators.required],
// //       key: ['', Validators.required],
// //       men: ['', Validators.required],
// //       qmx: ['', Validators.required],
// //       qrbyte: ['', Validators.required],
// //       itp: ['', Validators.required],
// //       spn: ['', Validators.required]
// //     });

// //     this.techConfigForm = this.fb.group({
// //       asl: [0, Validators.required],
// //       bfc: [0, Validators.required],
// //       bff: [0, Validators.required],
// //       cdf: [0, Validators.required],
// //       crc: [0, Validators.required],
// //       dfc: [0, Validators.required],
// //       dsc: [0, Validators.required],
// //       gsm: [0, Validators.required],
// //       key: ['', Validators.required],
// //       mid: ['', Validators.required],
// //       mlc: [0, Validators.required],
// //       mtp: [0, Validators.required],
// //       itp: ['', Validators.required],
// //       spn: ['', Validators.required],
// //       nss: ['', Validators.required],
// //       tsf: [0, Validators.required],
// //       rea_spn: [0, Validators.required],
// //       rea_mec: [0, Validators.required],
// //       rea_dec: [0, Validators.required],
// //       rea_sec: [0, Validators.required],
// //       spg_spn: [0, Validators.required],
// //       spg_nmc: [[], Validators.required],
// //       spg_ssc: [0, Validators.required],
// //       spg_mrp: [0, Validators.required],
// //       spg_psf: [0, Validators.required],
// //       spg_mon: [0, Validators.required],
// //       spg_mtp: [0, Validators.required],
// //       icr: ['', Validators.required],
// //       gps: [0, Validators.required],
// //       bdf: [0, Validators.required],
// //       wfi: [0, Validators.required],
// //       rcf_wsn: ['', Validators.required],
// //       rcf_wpn: ['', Validators.required],
// //       dsf: [0, Validators.required],
// //       mcf: [0, Validators.required],
// //       nse: [0, Validators.required]
// //     });

// //     this.incineratorConfigForm = this.fb.group({
// //       mid: [''],
// //       key: [''],
// //       crc: [''],
// //       bfc: [''],
// //       gps: [''],
// //       dfc: [''],
// //       icr: this.fb.group({
// //         ira: this.fb.group({
// //           icc: [0, Validators.required],
// //           sta: [950, Validators.required],
// //           stb: [650, Validators.required],
// //           hbo: [600, Validators.required],
// //           cta: [0, Validators.required],
// //           ctb: [0, Validators.required],
// //           bct: [0, Validators.required],
// //           act: this.fb.group({
// //             hur: [0, Validators.required],
// //             min: [0, Validators.required]
// //           }),
// //           bcc: [0, Validators.required],
// //           bmd: [0, Validators.required],
// //           acl: [0, Validators.required],
// //           inr: [0, Validators.required]
// //         })
// //       })
// //     });
// //   }

// //   loadUserDetails(): void {
// //     console.log("🔄 Loading user details...");
// //     this.commonDataService.loadUserDetails();
// //     console.log("User Details:", this.commonDataService.userDetails);

// //     if (!this.commonDataService.userDetails || !this.commonDataService.userDetails.machineId || this.commonDataService.userDetails.machineId.length === 0) {
// //       this.isLoading = false;
// //       this.errorMessage = 'No machine data available for the user.';
// //       console.error(this.errorMessage);
// //       return;
// //     }

// //     this.machines = this.commonDataService.userDetails.machineId;
// //     console.log("Machines Loaded:", this.machines);
// //   }

// //   onMachineSelect(): void {
// //     if (this.merchantId && this.selectedMachineId) {
// //       console.log("Machine Selected:", this.selectedMachineId);
// //       this.isMachineSelected = true;
// //       this.setTab('business');
// //       console.log("Merchant ID:", this.merchantId);
// //       console.log("Selected Machine ID:", this.selectedMachineId);
// //       this.fetchConfigurations();
// //     } else {
// //       console.error('❌ Missing merchantId or machineId');
// //     }
// //   }

// //   fetchConfigurations(): void {
// //     if (!this.merchantId || !this.selectedMachineId) {
// //       console.error('❌ Missing merchantId or machineId');
// //       return;
// //     }

// //     this.isLoading = true;

// //     this.dataService.getBusinessConfig(this.merchantId, this.selectedMachineId).subscribe({
// //       next: (response) => {
// //         console.log('Business Config:', response);
// //         if (response && response.data) {
// //           const businessData = response.data;
// //           this.businessConfigForm.patchValue({
// //             mid: businessData.mid,
// //             imx: businessData.imx,
// //             key: businessData.key,
// //             men: businessData.men,
// //             qmx: businessData.qmx,
// //             spn: businessData.ica[0]?.spn,
// //             qrbyte: businessData.ica[0]?.qrb,
// //             itp: businessData.ica[0]?.itp
// //           });
// //           console.log("Business Config Form Updated:", this.businessConfigForm.value);
// //         } else {
// //           console.error('❌ No data found in the response.');
// //         }
// //         this.isLoading = false;
// //       },
// //       error: (error) => {
// //         console.error('❌ Error fetching business config:', error);
// //         this.isLoading = false;
// //       }
// //     });

// //     this.dataService.getTechConfig(this.merchantId, this.selectedMachineId, 'Machine').subscribe({
// //       next: (response) => {
// //         console.log('Technical Config:', response);
// //         if (response && response.data) {
// //           const techData = response.data;
// //           this.techConfigForm.patchValue({
// //             mid: techData.mid,
// //             key: techData.key,
// //             crc: techData.crc,
// //             rea_spn: techData.rea[0]?.spn,
// //             rea_mec: techData.rea[0]?.mec,
// //             rea_dec: techData.rea[0]?.dec,
// //             rea_sec: techData.rea[0]?.sec,
// //             spg_spn: techData.spg[0]?.spn,
// //             spg_nmc: techData.spg[0]?.nmc,
// //             spg_ssc: techData.spg[0]?.ssc,
// //             spg_mrp: techData.spg[0]?.mrp,
// //             spg_psf: techData.spg[0]?.psf,
// //             spg_mon: techData.spg[0]?.mon,
// //             spg_mtp: techData.spg[0]?.mtp,
// //             icr: techData.icr,
// //             bfc: techData.bfc,
// //             gps: techData.gps,
// //             dfc: techData.dfc,
// //             cdf: techData.cdf,
// //             dsc: techData.dsc,
// //             mlc: techData.mlc,
// //             tsf: techData.tsf,
// //             bff: techData.bff,
// //             nss: techData.nss,
// //             gsm: techData.gsm,
// //             bdf: techData.bdf,
// //             wfi: techData.wfi,
// //             asl: techData.asl,
// //             rcf_wsn: techData.rcf?.wsn,
// //             rcf_wpn: techData.rcf?.wpn,
// //             dsf: techData.dsf,
// //             mcf: techData.mcf,
// //             mtp: techData.mtp,
// //             nse: techData.nse
// //           });
// //           console.log("Technical Config Form Updated:", this.techConfigForm.value);
// //         } else {
// //           console.error('❌ No data found in the technical config response.');
// //         }
// //         this.isLoading = false;
// //       },
// //       error: (error) => {
// //         console.error('❌ Error fetching technical config:', error);
// //         this.isLoading = false;
// //       }
// //     });

// //     this.dataService.getTechConfig(this.merchantId, this.selectedMachineId, 'Incinerator').subscribe({
// //       next: (response) => {
// //         console.log('Incinerator Config:', response);
// //         if (response && response.data) {
// //           const incineratorData = response.data;
// //           console.log('Incinerator ICR Data:', incineratorData.icr?.ira);
// //           this.incineratorConfigForm.patchValue({
// //             mid: incineratorData.mid,
// //             key: incineratorData.key,
// //             crc: incineratorData.crc,
// //             bfc: incineratorData.bfc,
// //             gps: incineratorData.gps,
// //             dfc: incineratorData.dfc,
// //             icr: {
// //               ira: {
// //                 icc: incineratorData.icr?.ira?.icc || 0,
// //                 sta: incineratorData.icr?.ira?.sta || 950,
// //                 stb: incineratorData.icr?.ira?.stb || 650,
// //                 hbo: incineratorData.icr?.ira?.hbo || 600,
// //                 cta: incineratorData.icr?. ica: incineratorData.icr?.ira?.cta || 0,
// //                 ctb: incineratorData.icr?.ira?.ctb || 0,
// //                 bct: incineratorData.icr?.ira?.bct || 0,
// //                 act: {
// //                   hur: incineratorData.icr?.ira?.act?.hur || 0,
// //                   min: incineratorData.icr?.ira?.act?.min || 0
// //                 },
// //                 bcc: incineratorData.icr?.ira?.bcc || 0,
// //                 bmd: incineratorData.icr?.ira?.bmd || 0,
// //                 acl: incineratorData.icr?.ira?.acl || 0,
// //                 inr: incineratorData.icr?.ira?.inr || 0
// //               }
// //             }
// //           });
// //           console.log("Incinerator Config Form Updated:", this.incineratorConfigForm.value);
// //         } else {
// //           console.error('❌ No data found in the incinerator config response.');
// //         }
// //         this.isLoading = false;
// //       },
// //       error: (error) => {
// //         console.error('❌ Error fetching incinerator config:', error);
// //         this.isLoading = false;
// //       }
// //     });
// //   }

// //   setTab(tab: string): void {
// //     if (this.isMachineSelected || tab === 'advanced') {
// //       this.selectedTab = tab;
// //     }
// //   }

// //   // Modified submitForm to accept a flag ('0' for save, '1' for submit)
// //   submitForm(flag: string): void {
// //     console.log(`🔄 Processing form with flag: ${flag}...`);

// //     if (this.selectedTab === 'business' && this.businessConfigForm.valid) {
// //       console.log("Business Config Data:", this.businessConfigForm.value);
// //       this.dataService.businessConfig(this.businessConfigForm.value, flag).subscribe({
// //         next: (response) => {
// //           console.log('Business Config Response:', response);
// //           this.errorMessage = '';
// //         },
// //         error: (error) => {
// //           console.error('❌ Error saving/submitting business config:', error);
// //           this.errorMessage = 'Failed to save/submit business configuration. Please try again.';
// //         }
// //       });
// //     } else if (this.selectedTab === 'technical' && this.techConfigForm.valid) {
// //       console.log("Technical Config Data:", this.techConfigForm.value);
// //       this.dataService.techconfig(this.techConfigForm.value, flag).subscribe({
// //         next: (response) => {
// //           console.log('Tech Config Response:', response);
// //           this.errorMessage = '';
// //         },
// //         error: (error) => {
// //           console.error('❌ Error saving/submitting technical config:', error);
// //           this.errorMessage = 'Failed to save/submit technical configuration. Please try again.';
// //         }
// //       });
// //     } else if (this.selectedTab === 'incinerator' && this.incineratorConfigForm.valid) {
// //       console.log("Incinerator Config Data:", this.incineratorConfigForm.value);
// //       this.dataService.techconfig(this.incineratorConfigForm.value, flag).subscribe({
// //         next: (response) => {
// //           console.log('Incinerator Config Response:', response);
// //           this.errorMessage = '';
// //         },
// //         error: (error) => {
// //           console.error('❌ Error saving/submitting incinerator config:', error);
// //           this.errorMessage = 'Failed to save/submit incinerator configuration. Please try again.';
// //         }
// //       });
// //     } else {
// //       console.warn('⚠️ Form is invalid or no valid tab selected.');
// //       this.errorMessage = 'Please ensure all required fields are filled correctly.';
// //     }
// //   }

// //   reset(): void {
// //     this.selectedTab = 'advanced';
// //     this.isMachineSelected = false;
// //     this.selectedMachineId = null;
// //     this.businessConfigForm.reset();
// //     this.techConfigForm.reset();
// //     this.incineratorConfigForm.reset();
// //     this.errorMessage = '';
// //   }
// // }

// //above is ai without submit 








import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service'; // Import service for dynamic user details
import { FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';




@Component({
  selector: 'app-machine-management',
  templateUrl: './machine-management.component.html',
  styleUrls: ['./machine-management.component.scss']
})
export class MachineManagementComponent implements OnInit {
  selectedTab: string = 'advanced'; // Initially set to advanced tab
  isMachineSelected: boolean = false; // Controls whether other tabs are enabled
  isLoading: boolean = false; // Flag to show loading state
  errorMessage: string = ''; // To display any error messages
  // machines: any[] = []; // List of Machines
  // merchantId: string = 'VIKN250324'; // Hardcoded Merchant ID

  merchantId: string = ''; 
  // merchantId: string = 'VIKN250324';

  selectedMachineId: string | null = null; // Selected Machine ID
  
  // Form groups for each configuration
  businessConfigForm!: FormGroup;
  techConfigForm!: FormGroup;
  incineratorConfigForm!: FormGroup;
  isEditingBusiness = false;
isEditingTechnical = false;



  saveForm(): void {
    console.log("Form save function called!");
  }
  constructor(
    private router: Router,
    private fb: FormBuilder, 
    private dataService: DataService, 
    private commonDataService: CommonDataService, // Inject the service to fetch user details dynamically
    private cdr: ChangeDetectorRef
  ) {}

  machines: any[] = []; // Your original machines array from userDetails
  originalMachines: any[] = []; // Backup for filtering
  
  ngOnInit(): void {

    if(this.commonDataService.merchantId === null || this.commonDataService.merchantId === undefined
      && this.commonDataService.userId === null || this.commonDataService.userId === undefined) {
     
      this.router.navigate(['/login']);
    }


    this.machines = this.commonDataService.userDetails.machineId;
    this.originalMachines = [...this.machines]; // Create a copy for filtering
  
    // Initialize forms
    this.initializeForms();
    // Load user details when the page is opened
    this.loadUserDetails();
    this.businessConfigForm.disable();
  this.techConfigForm.disable();
  this.incineratorConfigForm.disable();
    
  }
  
  filterMachines(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.machines = [...this.originalMachines];
    } else {
      this.machines = this.originalMachines.filter(
        machine => machine.toString().toLowerCase().includes(searchTerm)
      );
    }
  }
  
  
  // Initialize forms for business, technical, and incinerator configurations
  initializeForms(): void {
    this.businessConfigForm = this.fb.group({
      mid: [''],
      key: [''],
      imx: 0,
      men: 0,
      qmx: 0,
      ica: this.fb.array([
        this.fb.group({
          iid: [0],
          spn: [0],
          asn: this.fb.array([0]),
          qrb: [null],
          itp: [0]
        })
      ])
    });
    
  this.techConfigForm = this.fb.group({
    crc: [0],
    mid: [''],
    key: [''],
    rea: this.fb.array([
      this.fb.group({
        spn: [0],
        dec: [0],
        mec: [0],
        sec: [0]
      })
    ]),
    
    spg: this.fb.array([
      this.fb.group({
        spn: [0],
        mrp: [0],
        ssc: [0],
        psf: [0],
        nmc: this.fb.array([]),  // we'll fill this in loop later
        mon: [0],
        mtp: [0]
      })
    ]),
    mff: [0],
    dfc: [0],
    cdf: [0],
    rcf: this.fb.group({
      wpn: ['0'],
      wsn: ['0']
    }),
    gsm: [0],
    nse: [0],
    nss: [0],
    tsf: [0],
    bff: [0],
    wfi: [0],
    mcf: [0],
    mlc: [0],
    bdf: [0],
    gps: [0],
    asl: [0],
    dsf: [0],
    mtp: [0],
    dsc: [0],
    bfc: [0],
    mhc: [0]
  });
  
    
    
    this.incineratorConfigForm = this.fb.group({
      mid: [''],
      key: [''],
      crc: [''],
      bfc: [''],
      gps: [''],
      dfc: [''],
      icr: this.fb.group({
        ira: this.fb.group({
          icc: [0, Validators.required],
          sta: [950, Validators.required],
          stb: [650, Validators.required],
          hbo: [600, Validators.required],
          cta: [0, Validators.required],
          ctb: [0, Validators.required],
          bct: [0, Validators.required],
          act: this.fb.group({
            hur: [0, Validators.required],
            min: [0, Validators.required]
          }),
          bcc: [0, Validators.required],
          bmd: [0, Validators.required],
          acl: [0, Validators.required],
          inr: [0, Validators.required],
          ham:[0,Validators.required]
        })
      })
    });
  }



  enableEdit(type: string): void {
    if (type === 'business') {
      this.isEditingBusiness = true;
      Object.keys(this.businessConfigForm.controls).forEach(field => {
        if (field !== 'mid') {
          this.businessConfigForm.get(field)?.enable();
        }
            });
    } else if (type === 'technical') {
      this.isEditingTechnical = true;
      Object.keys(this.techConfigForm.controls).forEach(field => {
        this.techConfigForm.get(field)?.enable();
      });
    } else if (type === 'incinerator') {
      Object.keys(this.incineratorConfigForm.controls).forEach(field => {
        this.incineratorConfigForm.get(field)?.enable();
      });
    }
  
    this.cdr.detectChanges(); // 🔥 Force UI update
  }
  
  
  
  loadUserDetails(): void {
    console.log("🔄 Loading user details...");
  
    // Fetch user details from commonDataService
    this.commonDataService.loadUserDetails();
  
    // Log loaded details
    console.log("User Details:", this.commonDataService.userDetails);
  
    // If user details are missing or no machine data is available, show an error
    if (
      !this.commonDataService.userDetails ||
      !this.commonDataService.userDetails.machineId ||
      this.commonDataService.userDetails.machineId.length === 0
    ) {
      this.isLoading = false;
      this.errorMessage = 'No machine data available for the user.';
      console.error(this.errorMessage);
      return;
    }
    
    // Use the merchantId from the service property directly
    this.merchantId = this.commonDataService.merchantId || '';
    console.log("merchantid Loaded:", this.merchantId);
  
    // Populate machine data from user details (already available in userDetails)
    this.machines = this.commonDataService.userDetails.machineId;
    console.log("Machines Loaded:", this.machines);
  }
  
  // Method to handle machine selection
  onMachineSelect(): void {
    // Check if merchantId and selectedMachineId are available before fetching configurations
    if (this.merchantId && this.selectedMachineId) {
      console.log("Machine Selected:", this.selectedMachineId);
      this.isMachineSelected = true;
      this.setTab('business'); // Switch to the business tab

      console.log("Merchant ID:", this.merchantId);
      console.log("Selected Machine ID:", this.selectedMachineId);

      this.fetchConfigurations(); // Fetch machine configurations
    } else {
      console.error('❌ Missing merchantId or machineId');
    }
  }
  fetchConfigurations(): void {
    if (!this.merchantId || !this.selectedMachineId) {
      console.error('❌ Missing merchantId or machineId');
      return;
    }
  
    this.isLoading = true;
  
    // Fetch business config
    this.dataService.getBusinessConfig(this.merchantId, this.selectedMachineId).subscribe(response => {
      console.log('Business Config:', response);
  
      // Check if the response contains the expected structure
      if (response && response.data) {
        const businessData = response.data;
  
        // First, clear the existing ica FormArray
        const icaFormArray = this.businessConfigForm.get('ica') as FormArray;
        icaFormArray.clear(); // Reset the FormArray before pushing new values
  
        // Loop through the ica array from response
        businessData.ica.forEach((icaItem: any) => {
          // Ensure that 'asn' is always an array (fallback to empty array if undefined or null)
          const asnArray = Array.isArray(icaItem.asn) ? icaItem.asn : [];
  
          icaFormArray.push(this.fb.group({
            iid: [icaItem.iid || 0], // Default value if undefined
            spn: [icaItem.spn || 0], // Default value if undefined
            asn: this.fb.array(asnArray),  // Patch nested array directly
            qrb: [icaItem.qrb || null],  // Fallback to null if qrb is missing or undefined
            itp: [icaItem.itp || 0] // Default value if undefined
          }));
        });
  
        // Patch top-level values
        this.businessConfigForm.patchValue({
          mid: businessData.mid || '', // Default empty string if undefined
          key: businessData.key || '', // Default empty string if undefined
          imx: businessData.imx || 0, // Default value if undefined
          men: businessData.men || 0, // Default value if undefined
          qmx: businessData.qmx || 0  // Default value if undefined
        });
  
        console.log("Business Config Form Updated:", this.businessConfigForm.value);
      } else {
        console.error('❌ No data found in the response.');
      }
  
      this.isLoading = false;
    }, error => {
      console.error('❌ Error fetching business config:', error);
      this.isLoading = false;
    });
  
  
    this.dataService.getTechConfig(this.merchantId, this.selectedMachineId, 'Machine')
    .subscribe(response => {
      console.log('Technical Config:', response);
  
      if (response && response.data) {
        const techData = response.data;
  
        // Patch main fields first
        this.techConfigForm.patchValue({
          asl: techData.asl || 0,
          bdf: techData.bdf || 0,
          bfc: techData.bfc || 0,
          bff: techData.bff || 0,
          cdf: techData.cdf || 0,
          crc: techData.crc || 0,
          dfc: techData.dfc || 0,
          dsc: techData.dsc || 0,
          dsf: techData.dsf || 0,
          gps: techData.gps || 0,
          gsm: techData.gsm || 0,
          key: techData.key || '',
          mcf: techData.mcf || 0,
          mff: techData.mff || 0,
          mhc: techData.mhc || 0,
          mid: techData.mid || '',
          mlc: techData.mlc || 0,
          mtp: techData.mtp || 0,
          nse: techData.nse || 0,
          nss: techData.nss || 0,
          tsf: techData.tsf || 0,
          wfi: techData.wfi || 0,
          rcf: {
            wpn: techData.rcf?.wpn || '0',
            wsn: techData.rcf?.wsn || '0'
          },
        });
  
        // Handle `rea` array in Tech
        const reaArray = this.techConfigForm.get('rea') as FormArray;
        reaArray.clear();
        (techData.rea || []).forEach((r: any) => {
          reaArray.push(this.fb.group({
            dec: r.dec || 0,
            mec: r.mec || 0,
            sec: r.sec || 0,
            spn: r.spn || 0  // Make sure `spn` is handled gracefully if missing
          }));
        });
  
        // Handle `spg` array in Tech
        const spgArray = this.techConfigForm.get('spg') as FormArray;
        spgArray.clear();
        (techData.spg || []).forEach((s: any) => {
          const spgGroup = this.fb.group({
            spn: s.spn || 0,  // Default to 0 if `spn` is missing
            mrp: s.mrp || 0,
            ssc: s.ssc || 0,
            psf: s.psf || 0,
            mon: s.mon || 0,
            mtp: s.mtp || 0,
            nmc: this.fb.array(
              (s.nmc || []).map((n: any) => this.fb.group({ nmc: n.nmc || '' }))
            )
          });
          spgArray.push(spgGroup);
        });
  
        console.log("✅ Form Successfully Patched:", this.techConfigForm.value);
      } else {
        console.error('❌ No data found in the response.');
      }
  
      this.isLoading = false;
    }, error => {
      console.error('❌ API Error:', error);
      this.isLoading = false;
    });
  
  
    
    this.dataService.getTechConfig(this.merchantId, this.selectedMachineId, 'Incinerator').subscribe(response => {
      console.log('Incinerator Config:', response);
    
      // Check if the response contains the expected structure
      if (response && response.data) {
        const incineratorData = response.data;
    
        // Log the icr data to make sure it's present
        console.log('Incinerator ICR Data:', incineratorData.icr?.ira);
    
        // Patch the incinerator form with all the fields from the response data
        this.incineratorConfigForm.patchValue({
          mid: incineratorData.mid,
          key: incineratorData.key,
          crc: incineratorData.crc,
          bfc: incineratorData.bfc,
          gps: incineratorData.gps,
          dfc: incineratorData.dfc,
          icr: {
            ira: {
              icc: incineratorData.icr?.ira?.icc || 0,
              sta: incineratorData.icr?.ira?.sta || 950,
              stb: incineratorData.icr?.ira?.stb || 650,
              hbo: incineratorData.icr?.ira?.hbo || 600,
              cta: incineratorData.icr?.ira?.cta || 0,
              ctb: incineratorData.icr?.ira?.ctb || 0,
              bct: incineratorData.icr?.ira?.bct || 0,
              act: {
                hur: incineratorData.icr?.ira?.act?.hur || 0,
                min: incineratorData.icr?.ira?.act?.min || 0
              },
              bcc: incineratorData.icr?.ira?.bcc || 0,
              bmd: incineratorData.icr?.ira?.bmd || 0,
              acl: incineratorData.icr?.ira?.acl || 0,
              inr: incineratorData.icr?.ira?.inr || 0,
              ham: incineratorData.icr?.ira?.ham || 0
            }
          }
        });
    
        console.log("Incinerator Config Form Updated:", this.incineratorConfigForm.value);
      } else {
        console.error('❌ No data found in the incinerator config response.');
      }
    
      this.isLoading = false;
    }, error => {
      console.error('❌ Error fetching incinerator config:', error);
      this.isLoading = false;
    });
    
  }
  getInvalidControls() {
    const invalidControls: string[] = [];
    Object.keys(this.techConfigForm.controls).forEach((key) => {
      const control = this.techConfigForm.get(key);
      if (control && control.invalid) {
        invalidControls.push(key);
        console.error(`❌ ${key} is invalid!`, control.errors);
      }
    });
    console.error('⚠️ Invalid Controls:', invalidControls);
  }
  

  // Method to change the active tab
  setTab(tab: string): void {
    if (this.isMachineSelected || tab === 'advanced') {
      this.selectedTab = tab; // Change tab if machine is selected or tab is advanced
    }
  }

  saveBusinessConfig(): void {
    console.log('🟢 Save Business Config Clicked!');
    this.businessConfigForm.enable(); // Ensure form is enabled
    this.cdr.detectChanges(); // 🔥 Force UI update
  
    console.log('Business Form Valid:', this.businessConfigForm.valid);
    console.log('Business Form Values:', this.businessConfigForm.value);
  
    if (this.businessConfigForm.valid) {
      this.dataService.businessConfig(this.businessConfigForm.value, '0').subscribe(response => {
        console.log('Business Save Response:', response);
        if (response.code === 200) {
          alert('✅ Business Config Saved Successfully!');
        }
      }, error => {
        console.error('❌ Business Config Save Error:', error);
      });
    } else {
      console.warn('⚠️ Business Config Form is INVALID!');
    }
  }
  
  saveTechnicalConfig(): void {
    console.log('🟢 Save Technical Config Clicked!');
    this.techConfigForm.enable(); // Ensure form is enabled
    this.cdr.detectChanges(); // 🔥 Force UI update
  
    console.log('Technical Form Valid:', this.techConfigForm.valid);
    console.log('Technical Form Values:', this.techConfigForm.value);
  
    if (this.techConfigForm.valid) {
      this.dataService.techconfig(this.techConfigForm.value, '0').subscribe(response => {
        console.log('Technical Save Response:', response);
        if (response.code === 200) {
          alert('✅ Technical Config Saved Successfully!');
        }
      }, error => {
        console.error('❌ Technical Config Save Error:', error);
      });
    } else {
      console.warn('⚠️ Technical Config Form is INVALID!');
    }
  }
  
  saveIncineratorConfig(): void {
    console.log('🟢 Save Incinerator Config Clicked!');
    this.incineratorConfigForm.enable(); // Ensure form is enabled
    this.cdr.detectChanges(); // 🔥 Force UI update
  
    console.log('Incinerator Form Valid:', this.incineratorConfigForm.valid);
    console.log('Incinerator Form Values:', this.incineratorConfigForm.value);
  
    if (this.incineratorConfigForm.valid) {
      this.dataService.techconfig(this.incineratorConfigForm.value, '0').subscribe(response => {
        console.log('Incinerator Save Response:', response);
        if (response.code === 200) {
          alert('✅ Incinerator Config Saved Successfully!');
        }
      }, error => {
        console.error('❌ Incinerator Config Save Error:', error);
      });
    } else {
      console.warn('⚠️ Incinerator Config Form is INVALID!');
    }
  }
    // Submit methods
    
    submitBusinessConfig(): void {
      console.log('Business Submit Clicked!');
      console.log("📝 Form Values Sent:", JSON.stringify(this.techConfigForm.value));

      console.log('Form Valid:', this.businessConfigForm.valid);
      console.log('Form Values:', this.businessConfigForm.value);
    
      // Temporarily remove validation check
      this.dataService.businessConfig(this.businessConfigForm.value, '1').subscribe(response => {
        console.log('Response:', response);
        if (response.code === 200) {
          alert('Business Config Submitted Successfully!');
        }
      }, error => {
        console.error('Error:', error);
      });
    }
    submitTechnicalConfig(): void {
      console.log("🟢 Technical Submit Clicked!");
    
      // Enable form temporarily for submission
      if (this.techConfigForm.disabled) {
        this.techConfigForm.enable();
      }
    
      console.log("✅ Technical Form Valid:", this.techConfigForm.valid);
      console.log("📝 Form Values:", this.techConfigForm.value);
    
      if (this.techConfigForm.invalid) {
        console.error("⚠️ Technical Config Form is INVALID!");
        this.getInvalidControls();  // your existing debug helper
        return;
      }
    
      this.dataService.techconfig(this.techConfigForm.value, '1').subscribe(
        response => {
          console.log('✅ Technical Config Response:', response);
          if (response.code === 200) {
            alert('✅ Technical Config Submitted Successfully!');
          }
        },
        error => {
          console.error('❌ Technical Config Error:', error);
        }
      );
    }
    
    
  //   submitTechnicalConfig(): void {
  //     console.log("🟢 Technical Submit Clicked!");
  // console.log("✅ Technical Form Valid:", this.techConfigForm.valid);
  // console.log("📝 Form Values:", this.techConfigForm.value);

  // if (this.techConfigForm.invalid) {
  //   console.error("⚠️ Technical Config Form is INVALID!");
  //   this.getInvalidControls();  // 🔍 Debug invalid fields
  //   return;
  // }
      
  //     if (this.techConfigForm.valid) {
  //       this.dataService.techconfig(this.techConfigForm.value, '1').subscribe(response => {
  //         console.log('Technical Config Response:', response);
  //         if (response.code === 200) {
  //           alert('✅ Technical Config Submitted Successfully!');
  //         }
  //       }, error => {
  //         console.error('❌ Technical Config Error:', error);
  //       });
  //     } else {
  //       console.warn('⚠️ Technical Config Form is INVALID!');
  //     }
  //   }
        submitIncineratorConfig(): void {
          // Log the form validity and form values
          console.log('Form is valid:', this.incineratorConfigForm.valid);
          console.log('Form values:', this.incineratorConfigForm.value);
        
          if (this.incineratorConfigForm.valid) {
            // Log the data being sent to the service
            const formData = this.incineratorConfigForm.value;
            console.log('Sending data to incinerator service:', formData);
        
            // Call the data service
            this.dataService.techconfig(formData, '1').subscribe(response => {
              // Log the response from the server
              console.log('Response from incinerator service:', response);
        
              if (response.code === 200) {
                alert('Incinerator Config Submitted Successfully!');
              }
            }, error => {
              // Log any error that occurs during the API request
              console.error('Error during incinerator submission:', error);
            });
          }
        }
      
        
  // Reset the form and tab selection
  reset(): void {
    this.selectedTab = 'advanced';
    this.isMachineSelected = false;
    this.selectedMachineId = null;
    this.businessConfigForm.reset();
    this.techConfigForm.reset();
    this.incineratorConfigForm.reset();
  }
}