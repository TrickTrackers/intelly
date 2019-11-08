import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssessmentComponent } from './assessment.component';

const routes: Routes = [
  {
    path: '',
   // component: AssessmentComponent,
    data: {
      title: 'Modules'
    },
    children: [

      {
        path     : '',
        component: AssessmentComponent,
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
export class AssessmentRoutingModule {}
