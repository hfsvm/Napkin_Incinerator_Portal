import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineOnboardingComponent } from './machine-onboarding.component';

@NgModule({
  declarations: [
    MachineOnboardingComponent
  ],
  imports: [
    CommonModule,  // <-- Add this
    FormsModule    // <-- Make sure this is also included for ngModel
  ],
  exports: [
    MachineOnboardingComponent
  ]
})
export class MachineOnboardingModule { }