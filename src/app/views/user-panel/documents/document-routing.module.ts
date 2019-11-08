import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentsComponent } from './documents.component';

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
        component: DocumentsComponent,
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
export class DocumentRoutingModule {}
