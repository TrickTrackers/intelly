import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubmodulesComponent} from './submodule/submodule.component';
// import { treemoduleComponent } from './treemodulecomponent/treemodule.component';
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
        component: SubmodulesComponent,
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
export class submoduleRoutingModule {}
