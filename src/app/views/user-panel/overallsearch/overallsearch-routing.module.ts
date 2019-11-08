import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OverallSearchComponent } from './overallsearch.component';

const routes: Routes = [
  {
    path: '',
    //component: ControlHomeComponent,
    data: {
      title: 'Modules'
    },
    children: [

      {
        path     : '',
        component: OverallSearchComponent,
        data     : {
          title: 'Sub_module'
        }
      }      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OverallSearchRoutingModule {}
