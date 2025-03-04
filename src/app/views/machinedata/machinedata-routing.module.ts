import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MachinedataComponent } from './machinedata.component';

const routes: Routes = [
  {
    path: '',
    component: MachinedataComponent,
    data: {
      title:`Machinedata`
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MachinedataRoutingModule {
}
