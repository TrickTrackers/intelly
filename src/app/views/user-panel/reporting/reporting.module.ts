import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportingRoutingModule } from './reporting-routing.module';
import { ReportingComponent } from './reporting/reporting.component';

import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BsDropdownModule } from 'ngx-bootstrap';
@NgModule({
  imports: [
    CommonModule,
    ReportingRoutingModule,
    PanelModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    BsDropdownModule.forRoot()
  ],
  declarations: [ReportingComponent]
})
export class ReportingModule { }
