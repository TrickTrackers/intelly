import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportingComponent } from './reporting/reporting.component';

const routes: Routes = [
  {
    path: '',
    component: ReportingComponent,
    data: {
      title: 'Reporting'
    },
    // children: [
    //   {path:'',redirectTo:'reporting',pathMatch:'full'},
    //   {
    //     path: 'reporting',
    //     component: ReportingComponent,
    //     data: {
    //       title: 'Reporting'
    //     }
    //   },
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
