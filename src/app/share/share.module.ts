import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterDropdownPipe } from '../filter-dropdown.pipe';



@NgModule({
  declarations: [FilterDropdownPipe],
  imports: [
    CommonModule
  ],
  exports: [FilterDropdownPipe] 
})
export class ShareModule { }
