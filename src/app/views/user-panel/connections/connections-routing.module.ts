import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MxConnectionsComponent } from './mx-connections/mx-connections.component';
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
        component: MxConnectionsComponent,
        data     : {
          title: 'Sub_module'
        }
      }, 
      // {
      //   path     : 'mx-connection',
      //   component: ConnectionsComponent,
      //   data     : {
      //     title: 'Sub_module'
      //   }
      // }      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConnectionRoutingModule {}
