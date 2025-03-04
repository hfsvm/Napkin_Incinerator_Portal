// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { DataService } from 'src/app/service/data.service'; 

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   errorMessage: string = '';

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,  // ✅ Inject Router
//     private dataService: DataService
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       merchantId: ['', Validators.required],
//       userId: ['', Validators.required],
//       password: ['', Validators.required]
//     });
//   }

//   onSubmit(): void {
//     if (this.loginForm.valid) {
//       const { merchantId, userId, password } = this.loginForm.value;

//       this.dataService.login(merchantId, password, userId).subscribe(
//         (response: any) => {
//           console.log("Login Response:", response);

//           if (response.statusCode === 200 && response.response === 'Success') {
//              // ✅ Store user session (if needed)
//             this.router.navigate(['/widgets']); // ✅ Redirect to Dashboard
//           } else {
//             this.errorMessage = 'Invalid credentials. Please try again.';
//           }
//         },
//         // (error) => {
//         //   console.error('Login Error:', error);
//         //   this.errorMessage = 'An error occurred. Please try again later.';
//         // }
//       );
//     }
//   }
// }

// working
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { DataService } from 'src/app/service/data.service';
// import { AuthService } from 'src/app/services/auth.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   errorMessage: string = '';

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private dataService: DataService,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       merchantId: ['', Validators.required],
//       userId: ['', Validators.required],
//       password: ['', Validators.required]
//     });
//   }

//   onSubmit(): void {
//     if (this.loginForm.valid) {
//       const { merchantId, userId, password } = this.loginForm.value;

//       this.dataService.login(merchantId, password, userId).subscribe(
//         (response: any) => {
//           console.log("Login Response:", response);
//           if (response.statusCode === 200 && response.response === 'Success') {
//             // Mark login as successful and store the merchantId
//             this.authService.loginSuccess(merchantId);
//             // Navigate to the widgets page
//             this.router.navigate(['/widgets']);
//           } else {
//             this.errorMessage = 'Invalid credentials. Please try again.';
//           }
//         },
//         (error) => {
//           console.error('Login Error:', error);
//           this.errorMessage = 'An error occurred. Please try again later.';
//         }
//       );
//     }
//   }
// }

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { DataService } from 'src/app/service/data.service';
// import { AuthService } from 'src/app/services/auth.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   errorMessage: string = '';

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private dataService: DataService,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     this.loginForm = this.fb.group({
//       merchantId: ['', Validators.required],
//       userId: ['', Validators.required],
//       password: ['', Validators.required]
//     });
//   }

//   onSubmit(): void {
//     if (this.loginForm.valid) {
//       const { merchantId, userId, password } = this.loginForm.value;
//       this.dataService.login(merchantId, password, userId).subscribe(
//         (response: any) => {
//           console.log("Login Response:", response);
//           if (response.statusCode === 200 && response.response === 'Success') {
//             // Mark login as successful and store merchant ID (in-memory only)
//             this.authService.loginSuccess(merchantId);
//             // Redirect to the protected route (widgets)
//             this.router.navigate(['/widgets']);
//           } else {
//             this.errorMessage = 'Invalid credentials. Please try again.';
//           }
//         },
//         (error) => {
//           console.error('Login Error:', error);
//           this.errorMessage = 'An error occurred. Please try again later.';
//         }
//       );
//     }
//   }
// }




import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../service/data.service';
import{AuthService} from '../../../services/auth.service'
// import { CommonDataService } from 'src/app/Common/common-data.service';

import { CommonDataService } from '../../../Common/common-data.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private commonDataService:CommonDataService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      merchantId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10}$/) // Exactly 8 characters, letters & numbers, no special characters
        ]
      ],
      userId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{1,6}$/) // Exactly 7 characters, letters & numbers, no special characters
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          // Validators.maxLength(10),
          // Validators.pattern(/^[A-Za-z]{1,10}$/) // Only letters, max 10 characters, no numbers or special characters
        ]
      ]
    });
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      const { merchantId, userId, password } = this.loginForm.value;
      
      this.dataService.login(merchantId, password, userId).subscribe(
        (response: any) => {
          if (response.statusCode === 200 && response.response === 'Success') {
            this.commonDataService.merchantId = merchantId; // ✅ Store in CommonDataService
            this.router.navigate(['/widgets']);
          } else {
            this.showErrorMessage('Invalid credentials. Please try again.');
          }
        },
        () => {
          this.showErrorMessage('An error occurred. Please try again later.');
        }
      );
    } else {
      this.showErrorMessage('Please fill all fields correctly.');
    }
  }
  
  showErrorMessage(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = ''; // Clear message after 1 second
    }, 1000);
  }
}
