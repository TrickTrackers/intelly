import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
// bank
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ValidatorService } from './../validators/validator.service';
// import {  SimpleLineIconsComponent } from '../shared/components/icons/simple-line-icons.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ContextMenuModule,ContextMenuService } from 'ngx-contextmenu';
import { AddDocumentComponent } from '../shared/components/add-document/add-document.component';
import { IconSetComponent } from '../views/user-panel/icon-set/icon-set.component';
import {CKEditorModule} from 'ngx-ckeditor';
import { TreeModule } from 'primeng/tree';
import {CheckboxModule} from 'primeng/checkbox';
import { DocumentService } from '../services/appservices/userpanelservices/document.service';
import {TreeTableModule} from 'primeng/treetable';
import {ButtonModule} from 'primeng/button';
import {SelectButtonModule} from 'primeng/selectbutton';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DropdownModule,
    PanelModule,
    NgxPermissionsModule,
    BsDatepickerModule,
    ContextMenuModule,
    CKEditorModule,
    TreeModule,
    CheckboxModule,
    TreeTableModule,
    ButtonModule,
    SelectButtonModule
      ],
  declarations: [
    // SimpleLineIconsComponent
    AddDocumentComponent,
    IconSetComponent
  ],
  providers: [
    ValidatorService,
    ContextMenuService,
    DocumentService
  ],
  exports:
  [
    AddDocumentComponent,
    IconSetComponent
  ]
})
export class SharedModuleModule { }
