
 
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../service/data.service';
import { CommonDataService } from '../../../Common/common-data.service';
import { Subscription } from 'rxjs';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  intervalSub!: Subscription;

  loginForm!: FormGroup;
  errorMessage: string = '';
  loading: boolean = false; // ✅ Track if API is slow
 
  fieldErrors = {
    email: '',
    password: '',
    merchantId: '',
    captcha:'',
  };
 projectName: any
 projectId: any
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private commonDataService: CommonDataService
  ) {}
 
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]] ,
      merchantId: ['', [Validators.required, Validators.minLength(10)]] ,
      captcha: ['', [Validators.required]],
     
    });
    this.loadCaptcha();
  }
 
  captchaCode: string = '';
 
  loadCaptcha(): void {
    this.dataService.getCaptcha().subscribe(
      (res: any) => {
        if (res?.code === 200) {
          this.captchaCode = res.data;  // 👈 store the captcha value from API
        }
      },
      (error) => {
        console.error('❌ CAPTCHA fetch failed:', error);
      }
    );
  }
 
  preventPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }
  
 
  showPassword: boolean = false;
 
togglePasswordVisibility(){
  this.showPassword = !this.showPassword;
}
 
onSubmit(): void {
  this.loginForm.markAllAsTouched();
 
  this.fieldErrors = {
    email: '',
    password: '',
    merchantId: '',
    captcha: '',
  };
  this.errorMessage = '';
 
  const controls = this.loginForm.controls;
  if (this.loginForm.invalid) {   
 
    if (controls['email'].hasError('required')) {
      setTimeout(() => {
        this.fieldErrors.email = '📧 Email is required.';
      });
    } else if (controls['email'].hasError('email')) {
      setTimeout(() => {
        this.fieldErrors.email = '⚠️ Invalid email format.';
      });
    }
 
    if (controls['password'].hasError('required')) {
      setTimeout(() => {
        this.fieldErrors.password = '🔒 Password is required.';
      });
    } else if (controls['password'].hasError('minlength')) {
      setTimeout(() => {
        this.fieldErrors.password = '🔒 Password must be at least 6 characters.';
      });
    }
 
    if (controls['merchantId'].hasError('required')) {
      setTimeout(() => {
        this.fieldErrors.merchantId = '🏪 Merchant ID is required.';
      });
    } else if (controls['merchantId'].hasError('minlength')) {
      setTimeout(() => {
        this.fieldErrors.merchantId = '🏪 Merchant ID must be at least 10 characters.';
      });
    }
 
    if (controls['captcha'].hasError('required')) {
      setTimeout(() => {
        this.fieldErrors.captcha = '🔐 Captcha is required.';
      });
    }
 
    return;
  }

  if (controls['captcha'].value !== this.captchaCode) {
  setTimeout(() => {
    this.fieldErrors.captcha = '❌ Invalid CAPTCHA. Please match the code exactly.';
  });
  this.loadCaptcha();
  return;
} 

 
  const { email, password, merchantId, captcha } = this.loginForm.value;
 
  this.loading = true;
 
  this.dataService.login(email, password, merchantId, captcha).subscribe(
    (response: any) => {
      this.loading = false;
      if (response.code === 200 && response.data) {
    debugger;
        // this.router.navigate(['/widgets']);

        const { userId, roleName, userName } = response.data;
        this.commonDataService.updateUserDetails(response.data);
        this.startAutoRefresh(merchantId, userId);
        // Save to storage
        const stringified = JSON.stringify(response.data);
        sessionStorage.setItem('merchantId', merchantId);
        sessionStorage.setItem('userId', userId.toString());
        sessionStorage.setItem('roleName', roleName);
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userDetails', stringified);
        localStorage.setItem('merchantId', merchantId);
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('roleName', roleName);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userDetails', stringified);
 
        this.getUserDetailsByHierarchy(merchantId, userId);
      } else {
        this.setSpecificFieldError(response?.error);
        this.loadCaptcha(); // ✅ Load new captcha after server says wrong
      }
    },
    (error) => {
      this.loading = false;
      const errorMessage = error?.error?.error || 'Login failed. Please try again.';
      this.setSpecificFieldError(errorMessage);
      this.loadCaptcha(); // ✅ Load new captcha on error too
    }
  );
}


startAutoRefresh(merchantId: string, userId: number): void {
  // Clear any previous interval to avoid duplicates
  if (this.intervalSub) {
    this.intervalSub.unsubscribe();
  }

  // Using RxJS interval for better Angular cleanup
  this.intervalSub = new Subscription();

  const refreshInterval = setInterval(() => {
    console.log('🔁 Auto-refresh triggered from login service at:', new Date().toLocaleTimeString());
    
    this.dataService.getUserDetailsByHierarchy(merchantId, userId).subscribe(
      (res: any) => {
        if (res.code === 200 && res.phrase === 'Success' && res.data) {
          const userData = res.data;
          
          // Process the data like you do in getUserDetails
          const projectName = Array.isArray(userData.projects.projectName) ? userData.projects.projectName : [];
          const projectId = Array.isArray(userData.projects.projectId) ? userData.projects.projectId : [];

          const companyData = userData.companyName && userData.companyName.length > 0 ? userData.companyName[0] : null;
          const companyName = companyData ? companyData.companyname : null;
          const clientId = companyData ? companyData.ClientId : null;
          
          // Create the enriched user details
          const enrichedUserDetails = {
            ...userData,
            projectName,
            projectId,
            companyName,
            clientId
          };
          
          // Update CommonDataService
          this.commonDataService.updateUserDetails(enrichedUserDetails);
          
          console.log('🔄 Auto-refreshed user details from login:', res);
        }
      },
      (err) => {
        console.error('🚨 Error during auto-refresh:', err);
      }
    );
  }, 2 * 60 * 1000); // ⏱ Every 2 minutes

  // Save it to clear later if needed
  this.intervalSub.add({
    unsubscribe() {
      clearInterval(refreshInterval);
    }
  });
}
ngOnDestroy(): void {
  if (this.intervalSub) {
    this.intervalSub.unsubscribe();
  }
}


 
  setSpecificFieldError(message: string | undefined): void {
    const resetFields = {
      email: '',
      password: '',
      merchantId: '',
      captcha: '',
    };
 
    this.fieldErrors = { ...resetFields };
    this.errorMessage = '';
 
    if (!message) {
      this.errorMessage = '⚠️ An unexpected error occurred.';
      return;
    }
 
    const lowerMsg = message.toLowerCase();
 
    setTimeout(() => {
      if (lowerMsg.includes('email') || lowerMsg.includes('user')) {
        this.fieldErrors.email = message;
      } else if (lowerMsg.includes('password')) {
        this.fieldErrors.password = message;
      } else if (lowerMsg.includes('merchant')) {
        this.fieldErrors.merchantId = message;
      } else if (lowerMsg.includes('captcha')) {
        this.fieldErrors.captcha = message; // ✅ This is what was missing!
      }
      else {
        this.errorMessage = message;
      }
     
    }, 0); // ⏱ Force DOM refresh
  }
 
 
  getUserDetailsByHierarchy(merchantId: string, userId: number): void {
    console.log('🔹 Fetching User Details for:', { merchantId, userId });
 
    this.dataService.getUserDetailsByHierarchy(merchantId, userId).subscribe(
      (response: any) => {
        console.log('✅ getUserDetailsByHierarchy API Response from service:', response);
 
        if (response.code === 200 && response.phrase === 'Success' && response.data) {
          const userData = response.data;


          debugger;
          console.log('🔹 Extracted User Data:', userData);
 
      //     // ✅ Extract project name, company name, and client ID
      //     const projectName: string[] = Array.isArray(userData?.projects?.projectName)
      //     ? userData.projects.projectName
      //     : [];
        
      //   const projectId: string[] = Array.isArray(userData?.projects?.projectId)
      //     ? userData.projects.projectId
      //     : [];
        
      //  console.log("projectname: ==>",projectName)
      //  console.log("projectId: ==>",projectId)


      const projectName: string[] = userData.projects?.map((p: any) => p.projectName) || [];
      const projectId: number[] = userData.projects?.map((p: any) => p.projectId) || [];
      const clientId =  userData.clientId;

       console.log("projectname: ==>",projectName)
       console.log("projectId: ==>",projectId)
       console.log("ClientId: ==>",clientId)

 
          const companyData = userData.companyName && userData.companyName.length > 0 ? userData.companyName[0] : null;
          const companyName = companyData ? companyData.companyname : null;
          
 
         
          console.log("🏢 Extracted Company Name:", companyName);
 
          // ✅ Update CommonDataService
          this.commonDataService.userDetails = {
            ...userData,
            projectName,
            projectId,
            companyName,
            clientId
          };
 
          console.log('✅✅✅ CommonDataService Updated with User Details:', this.commonDataService);
          console.log('✅✅✅ CommonDataService Updated with User Details:', this.commonDataService.userDetails);

 
          // ✅ Persist updated details in sessionStorage & localStorage
          sessionStorage.setItem('userDetails', JSON.stringify(this.commonDataService.userDetails));
          localStorage.setItem('userDetails', JSON.stringify(this.commonDataService.userDetails));
 
          console.log("✅ User Details Persisted in Both Storages");
 
          // ✅ Navigate to WidgetsComponent
          this.router.navigate(['/widgets']);
        } else {
          console.warn("⚠️ Invalid response data structure");
        }
      },
      (error) => {
        console.error('❌ Error fetching user details:', error);
 
        if (error.status === 0) {
          alert('🚨 Cannot connect to server. Please check your internet.');
        } else if (error.status >= 500) {
          alert('⚠️ Server error while fetching user details.');
        } else {
          alert('❌ Failed to retrieve user details. Please try again.');
        }
      }
    );
  }
}
 