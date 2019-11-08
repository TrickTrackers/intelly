import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkflowComponent } from './workflow.component';

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
        component: WorkflowComponent,
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
export class WorkflowRoutingModule {}
