import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { FormArray } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-machine-management',
  templateUrl: './machine-management.component.html',
  styleUrls: ['./machine-management.component.scss']
})
export class MachineManagementComponent implements OnInit {
  selectedTab: string = 'advanced';
  isMachineSelected: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  merchantId: string = '';
  selectedMachineId: string | null = null;

  businessConfigForm!: FormGroup;
  techConfigForm!: FormGroup;
  incineratorConfigForm!: FormGroup;

  isEditingBusiness = false;
  isEditingTechnical = false;

  machines: any[] = [];
  originalMachines: any[] = [];

  // ✅ Cache icr from Incinerator API response
  private cachedIcr: any = {
    ira: {
      icc: 1, sta: 950, stb: 650, hbo: 600,
      cta: 0, ctb: 0, bct: 40,
      act: { hur: 18, min: 0 },
      bcc: 10, bmd: 3, acl: 1, inr: 1, ham: 900
    }
  };

  // ✅ FIX 1: Cache key from Business Config API (tech config API returns key as null)
  private cachedKey: string = '';

  // ✅ FIX 2: Cache spg and rea from Tech Config API
  // These arrays contain fields (spn, ssc, psf etc.) not shown in the UI form,
  // so we must preserve the original API values instead of reading zeroed form fields.
  private cachedSpg: any[] = [];
  private cachedRea: any[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dataService: DataService,
    private commonDataService: CommonDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.commonDataService.merchantId || !this.commonDataService.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeForms();

    this.machines = this.commonDataService.userDetails?.machineId ?? [];
    this.originalMachines = [...this.machines];

    this.loadUserDetails();

    this.businessConfigForm.disable();
    this.techConfigForm.disable();
    this.incineratorConfigForm.disable();
  }

  filterMachines(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.machines = [...this.originalMachines];
    } else {
      this.machines = this.originalMachines.filter(
        machine => machine.toString().toLowerCase().includes(searchTerm)
      );
    }
  }

  initializeForms(): void {
    this.businessConfigForm = this.fb.group({
      mid: [''],
      key: [''],
      imx: [0],
      men: [0],
      qmx: [0],
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
          nmc: this.fb.array([]),
          mon: [0],
          mtp: [0]
        })
      ]),
      mff: [0],
      dfc: [0],
      cdf: [0],
      // ✅ FIX 3: rcf defaults changed from '0' to 'string' to match backend expectation
      rcf: this.fb.group({
        wpn: ['string'],
        wsn: ['string']
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
      mhc: [0],
      fas: [0],
      fcs: [0],
      fnc: [0]
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
          ham: [0, Validators.required]
        })
      })
    });
  }

  enableEdit(type: string): void {
    if (type === 'business') {
      this.isEditingBusiness = true;
      this.businessConfigForm.enable();
      this.businessConfigForm.get('mid')?.disable();
    } else if (type === 'technical') {
      this.isEditingTechnical = true;
      this.techConfigForm.enable();
    } else if (type === 'incinerator') {
      this.incineratorConfigForm.enable();
    }
    this.cdr.detectChanges();
  }

  loadUserDetails(): void {
    console.log('🔄 Loading user details...');
    this.commonDataService.loadUserDetails();
    console.log('User Details:', this.commonDataService.userDetails);

    const userDetails = this.commonDataService.userDetails;

    if (!userDetails || !Array.isArray(userDetails.machineId) || userDetails.machineId.length === 0) {
      this.isLoading = false;
      this.errorMessage = 'No machine data available for the user.';
      console.error(this.errorMessage);
      this.machines = [];
      this.originalMachines = [];
      return;
    }

    this.merchantId = this.commonDataService.merchantId || '';
    console.log('merchantId Loaded:', this.merchantId);

    if (!this.merchantId) {
      console.error('❌ merchantId is still empty after loadUserDetails!');
    }

    this.machines = userDetails.machineId;
    this.originalMachines = [...this.machines];
    console.log('Machines Loaded:', this.machines);
  }

  onMachineSelect(): void {
    if (!this.merchantId) {
      this.merchantId = this.commonDataService.merchantId || '';
    }

    if (this.merchantId && this.selectedMachineId) {
      console.log('Machine Selected:', this.selectedMachineId);
      console.log('Merchant ID:', this.merchantId);
      this.isMachineSelected = true;
      this.setTab('business');
      this.fetchConfigurations();
    } else {
      console.error('❌ Missing merchantId or machineId — merchantId:', this.merchantId, 'machineId:', this.selectedMachineId);
    }
  }

  fetchConfigurations(): void {
    if (!this.merchantId || !this.selectedMachineId) {
      console.error('❌ Missing merchantId or machineId');
      return;
    }

    this.isLoading = true;

    // ── Business Config ──────────────────────────────────────────────
    this.dataService.getBusinessConfig(this.merchantId, this.selectedMachineId).subscribe(response => {
      console.log('Business Config:', response);

      if (response && response.data) {
        const businessData = response.data;

        const icaFormArray = this.businessConfigForm.get('ica') as FormArray;
        icaFormArray.clear();

        businessData.ica.forEach((icaItem: any) => {
          const asnArray = Array.isArray(icaItem.asn) ? icaItem.asn : [];
          icaFormArray.push(this.fb.group({
            iid: [icaItem.iid || 0],
            spn: [icaItem.spn || 0],
            asn: this.fb.array(asnArray),
            qrb: [icaItem.qrb || null],
            itp: [icaItem.itp || 0]
          }));
        });

        this.businessConfigForm.patchValue({
          mid: businessData.mid || '',
          key: businessData.key || '',
          imx: businessData.imx || 0,
          men: businessData.men || 0,
          qmx: businessData.qmx || 0
        });

        // ✅ FIX 1: Cache key from business config — tech config API returns key as null
        this.cachedKey = businessData.key || '';
        console.log('✅ Cached key from business config:', this.cachedKey);

        console.log('Business Config Form Updated:', this.businessConfigForm.value);
      } else {
        console.error('❌ No data found in the response.');
      }

      this.isLoading = false;
    }, error => {
      console.error('❌ Error fetching business config:', error);
      this.isLoading = false;
    });

    // ── Technical Config ─────────────────────────────────────────────
    this.dataService.getTechConfig(this.merchantId, this.selectedMachineId, 'Machine').subscribe(response => {
      console.log('Technical Config:', response);

      if (response && response.data) {
        const techData = response.data;

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
          fas: techData.fas || 0,
          fcs: techData.fcs || 0,
          fnc: techData.fnc || 0,
          rcf: {
            wpn: techData.rcf?.wpn || 'string',
            wsn: techData.rcf?.wsn || 'string'
          }
        });

        const reaArray = this.techConfigForm.get('rea') as FormArray;
        reaArray.clear();
        (techData.rea || []).forEach((r: any) => {
          reaArray.push(this.fb.group({
            dec: r.dec || 0,
            mec: r.mec || 0,
            sec: r.sec || 0,
            spn: r.spn || 0
          }));
        });

        const spgArray = this.techConfigForm.get('spg') as FormArray;
        spgArray.clear();
        (techData.spg || []).forEach((s: any) => {
          spgArray.push(this.fb.group({
            spn: s.spn || 0,
            mrp: s.mrp || 0,
            ssc: s.ssc || 0,
            psf: s.psf || 0,
            mon: s.mon || 0,
            mtp: s.mtp || 0,
            nmc: this.fb.array(
              (s.nmc || []).map((n: any) => this.fb.group({ nmc: n.nmc || '' }))
            )
          }));
        });

        // ✅ FIX 2: Cache full spg and rea arrays from API
        // The UI only shows mrp for spg — other fields (spn, ssc, psf etc.) are not
        // editable in the form, so we preserve the original API values here.
        this.cachedSpg = techData.spg || [];
        this.cachedRea = techData.rea || [];
        console.log('✅ Cached spg:', this.cachedSpg);
        console.log('✅ Cached rea:', this.cachedRea);

        console.log('✅ Technical Form Patched:', this.techConfigForm.value);
      } else {
        console.error('❌ No data found in the technical config response.');
      }

      this.isLoading = false;
    }, error => {
      console.error('❌ API Error:', error);
      this.isLoading = false;
    });

    // ── Incinerator Config ───────────────────────────────────────────
    this.dataService.getTechConfig(this.merchantId, this.selectedMachineId, 'Incinerator').subscribe(response => {
      console.log('Incinerator Config:', response);

      if (response && response.data) {
        const incineratorData = response.data;

        if (incineratorData.icr) {
          this.cachedIcr = incineratorData.icr;
        }

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

        console.log('Incinerator Config Form Updated:', this.incineratorConfigForm.value);
      } else {
        console.error('❌ No data found in the incinerator config response.');
      }

      this.isLoading = false;
    }, error => {
      console.error('❌ Error fetching incinerator config:', error);
      this.isLoading = false;
    });
  }

  // ✅ Helper: builds the sanitized tech config payload used by both save and submit
  private buildTechPayload(): any {
    const raw = this.techConfigForm.getRawValue();

    return {
      ...raw,
      // ✅ FIX 1: Use cachedKey — tech config API returns key as null/empty
      mid: raw.mid || '',
      key: this.cachedKey || raw.key || '',
      crc:  Number(raw.crc  || 0),
      mff:  Number(raw.mff  || 0),
      dfc:  Number(raw.dfc  || 0),
      bdf:  Number(raw.bdf  || 0),
      bfc:  Number(raw.bfc  || 0),
      bff:  Number(raw.bff  || 0),
      wfi:  Number(raw.wfi  || 0),
      mcf:  Number(raw.mcf  || 0),
      mlc:  Number(raw.mlc  || 0),
      gps:  Number(raw.gps  || 0),
      asl:  Number(raw.asl  || 0),
      dsf:  Number(raw.dsf  || 0),
      dsc:  Number(raw.dsc  || 0),
      gsm:  Number(raw.gsm  || 0),
      nse:  Number(raw.nse  || 0),
      nss:  Number(raw.nss  || 0),
      tsf:  Number(raw.tsf  || 0),
      mtp:  Number(raw.mtp  || 0),
      mhc:  Number(raw.mhc  || 0),
      fas:  Number(raw.fas  || 0),
      fcs:  Number(raw.fcs  || 0),
      fnc:  Number(raw.fnc  || 0),
      // ✅ FIX: checkbox boolean → 1/0
      cdf:  raw.cdf ? 1 : 0,
      // ✅ FIX 3: always send 'string' for rcf — backend rejects '0'
      rcf: {
        wpn: 'string',
        wsn: 'string'
      },
      // ✅ FIX 2: use cachedSpg so hidden fields (spn, ssc, psf etc.) are preserved
      // Only mrp is user-editable in the UI; all other spg fields come from the cache.
      spg: this.cachedSpg.map((s: any, i: number) => ({
        spn: Number(s.spn || 0),
        mrp: Number(raw.spg?.[i]?.mrp ?? s.mrp ?? 0),
        ssc: Number(s.ssc || 0),
        psf: Number(s.psf || 0),
        mon: Number(s.mon || 0),
        mtp: Number(s.mtp || 0),
        nmc: s.nmc || []
      })),
      // ✅ FIX 2: use cachedRea — rea fields are not shown in UI at all
      rea: this.cachedRea.map((r: any) => ({
        spn: Number(r.spn || 0),
        dec: Number(r.dec || 0),
        mec: Number(r.mec || 0),
        sec: Number(r.sec || 0)
      })),
      // ✅ Always use cachedIcr — populated from Incinerator API
      icr: this.cachedIcr
    };
  }

  getInvalidControls(): void {
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

  setTab(tab: string): void {
    this.selectedTab = tab;
  }

  // ── Save Methods ─────────────────────────────────────────────────

  saveBusinessConfig(): void {
    console.log('🟢 Save Business Config Clicked!');
    this.businessConfigForm.enable();
    this.businessConfigForm.get('mid')?.disable();
    this.cdr.detectChanges();

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
    this.techConfigForm.enable();
    this.cdr.detectChanges();

    if (this.techConfigForm.valid) {
      const payload = this.buildTechPayload();
      console.log('📝 Save Payload:', JSON.stringify(payload));

      this.dataService.techconfig(payload, '0').subscribe(response => {
        console.log('Technical Save Response:', response);
        if (response.code === 200) {
          alert('✅ Technical Config Saved Successfully!');
        } else {
          alert('⚠️ Save response: ' + response.phrase);
        }
        this.fetchConfigurations();
      }, error => {
        console.error('❌ Technical Config Save Error:', error);
        alert('❌ Save failed: ' + (error?.message || JSON.stringify(error)));
      });
    } else {
      console.warn('⚠️ Technical Config Form is INVALID!');
    }
  }

  saveIncineratorConfig(): void {
    console.log('🟢 Save Incinerator Config Clicked!');
    this.incineratorConfigForm.enable();
    this.cdr.detectChanges();

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

  // ── Submit Methods ───────────────────────────────────────────────

  submitBusinessConfig(): void {
    console.log('Business Submit Clicked!');
    console.log('📝 Form Values Sent:', JSON.stringify(this.businessConfigForm.value));

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
    console.log('🟢 Technical Submit Clicked!');
    this.techConfigForm.enable();
    this.cdr.detectChanges();

    const payload = this.buildTechPayload();
    console.log('📝 Sanitized Payload:', JSON.stringify(payload));

    this.dataService.techconfig(payload, '1').subscribe(
      response => {
        console.log('✅ Technical Config Response:', response);
        if (response.code === 200) {
          alert('✅ Technical Config Submitted Successfully!');
        } else {
          alert('⚠️ Submit response: ' + response.phrase);
        }
        this.fetchConfigurations();
      },
      error => {
        console.error('❌ Technical Config Error:', error);
        alert('❌ Submit failed: ' + (error?.message || JSON.stringify(error)));
      }
    );
  }

  submitIncineratorConfig(): void {
    if (this.incineratorConfigForm.valid) {
      this.dataService.techconfig(this.incineratorConfigForm.value, '1').subscribe(response => {
        console.log('Response from incinerator service:', response);
        if (response.code === 200) {
          alert('Incinerator Config Submitted Successfully!');
        }
      }, error => {
        console.error('Error during incinerator submission:', error);
      });
    }
  }

  // ── Misc ─────────────────────────────────────────────────────────

  saveForm(): void {
    console.log('Form save function called!');
  }

  submitForm(): void {}

  reset(): void {
    this.selectedTab = 'advanced';
    this.isMachineSelected = false;
    this.selectedMachineId = null;
    this.businessConfigForm.reset();
    this.techConfigForm.reset();
    this.incineratorConfigForm.reset();
    this.errorMessage = '';
  }
}