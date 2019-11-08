// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { WorkflowRoutingModule } from './workflow-routing.module';
// import { BoundSensorModule } from '../../../bound-sensor/public_api';
// import { AccordionModule } from 'ngx-bootstrap';
// import {AccordionModule} from 'primeng/accordion';
import { ScrollDispatchModule } from '@angular/cdk/scrolling'
import { TabsModule } from 'ngx-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap';
import {TreeTableModule} from 'primeng/treetable';
import {DragDropModule} from 'primeng/dragdrop';
import {InplaceModule} from 'primeng/inplace';
import {AutoCompleteModule} from 'primeng/autocomplete';
// import {ContextMenuModule} from 'primeng/contextmenu';
import { ContextMenuModule } from 'ngx-contextmenu';
import {PanelModule} from 'primeng/panel';
import { SortablejsModule } from '../../../drag-drop/sortablejs.module';
import {CKEditorModule} from 'ngx-ckeditor';
import { WorkflowComponent } from './workflow.component';
// import { TasksComponent } from '../tasks/tasks.component';

// prime modules

import {TabViewModule} from 'primeng/tabview';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';

import {DialogModule} from 'primeng/dialog';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {DataTableModule} from 'primeng/datatable';
import {CheckboxModule} from 'primeng/checkbox';
import {ProgressBarModule} from 'primeng/progressbar';
import {ToolbarModule} from 'primeng/toolbar';
import {DropdownModule} from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import {SliderModule} from 'primeng/slider';

import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
//import { SortableModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NameService } from '../nameService';

import {HttpModule} from "@angular/http";
import { WorkflowService } from '../../../services/appservices/workflow.service';
import { DocumentService } from '../../../services/appservices/userpanelservices/document.service';
import { TaskListComponent } from './task-list/task-list.component';
// import { SelectModule } from 'ng2-select';
import { GanttchartComponent } from './ganttchart/ganttchart.component';
import { SharedModuleModule } from '../../../shared/shared.module';
import { PopoverModule } from 'ngx-bootstrap/popover';
// import {ColorPickerModule} from 'primeng/colorpicker';
import { ColorPickerModule } from 'ngx-color-picker';
// import { MultiSelectModule } from 'primeng/multiselect';
import {RadioButtonModule} from 'primeng/radiobutton';
import { NgSelectModule } from '@ng-select/ng-select';
import { HotTableModule } from 'ng2-handsontable';
import { ExcelService } from '../../../services/appservices/excel.service';
import { NotificationService } from '../../../services/appservices/notification.service';
@NgModule({
  imports: [
    ScrollPanelModule,
    CommonModule,
    // BoundSensorModule,
    ScrollDispatchModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    // AccordionModule,
    TooltipModule.forRoot(),
    DialogModule,
    SliderModule,
    InplaceModule,
    AutoCompleteModule,
    //TableModule,
    // BrowserAnimationsModule,
    WorkflowRoutingModule,
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CKEditorModule,
    TreeTableModule,
    ContextMenuModule,
    DragDropModule,
    PanelModule,
    SortablejsModule.forRoot({ animation: 800 }),
    DataTableModule,
    CheckboxModule,
    ProgressBarModule,
    ToolbarModule,
    DropdownModule,
    TableModule,
    ConfirmDialogModule,
    BsDropdownModule.forRoot(),
    HttpModule,
    // SelectModule,
    SharedModuleModule,
    PopoverModule.forRoot(),
    ColorPickerModule,
    // MultiSelectModule,
    RadioButtonModule,
    NgSelectModule,
    HotTableModule
  ],
  declarations: [
    // TasksComponent,
    WorkflowComponent,
    TaskListComponent,
	  GanttchartComponent,
  ],
  providers: [NameService,WorkflowService,DocumentService,ExcelService,NotificationService],
})

export class WorkflowModule { }
