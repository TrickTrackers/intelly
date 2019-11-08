// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { OverallSearchRoutingModule } from './overallsearch-routing.module';
// import { BoundSensorModule } from '../../../bound-sensor/public_api';
// import { AccordionModule } from 'ngx-bootstrap';
import {AccordionModule} from 'primeng/accordion';
import { ScrollDispatchModule } from '@angular/cdk/scrolling'
import { TabsModule } from 'ngx-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap';
import {TreeModule} from 'primeng/tree';
import {TreeTableModule} from 'primeng/treetable';
import {DragDropModule} from 'primeng/dragdrop';
// import {ContextMenuModule} from 'primeng/contextmenu';
import { ContextMenuModule,ContextMenuService } from 'ngx-contextmenu';
import {PanelModule} from 'primeng/panel';
import {CKEditorModule} from 'ngx-ckeditor';
import { OverallSearchComponent } from './overallsearch.component';
import {SidebarModule} from 'primeng/sidebar';

// prime modules
import {MenubarModule} from 'primeng/menubar';
import {MenuModule} from 'primeng/primeng';

import {TabViewModule} from 'primeng/tabview';
import {FieldsetModule} from 'primeng/fieldset';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CarouselModule} from 'primeng/carousel';
import {CardModule} from 'primeng/card';

import {DialogModule} from 'primeng/dialog';
import {SplitButtonModule} from 'primeng/splitbutton';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {DataTableModule} from 'primeng/datatable';
import {CheckboxModule} from 'primeng/checkbox';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ProgressBarModule} from 'primeng/progressbar';
import {ToolbarModule} from 'primeng/toolbar';
import {DropdownModule} from 'primeng/dropdown';
import {SelectButtonModule} from 'primeng/selectbutton';
import {PanelMenuModule} from 'primeng/panelmenu';
import {EditorModule} from 'primeng/editor';
import {TableModule} from 'primeng/table';
import {SliderModule} from 'primeng/slider';

import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
//import { SortableModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap';
import { InputMaskModule } from 'primeng/primeng';
import { NameService } from '../nameService';
import { CollaborationService } from '../../../services/appservices/collaboration.service';

import {HttpModule, RequestOptions, XHRBackend, Http} from "@angular/http";
@NgModule({
  imports: [
    ScrollPanelModule,
    CommonModule,
    // BoundSensorModule,
    ScrollDispatchModule,
    FormsModule,
    CardModule,
    CarouselModule,
    ButtonModule,
    InputTextModule,
    FieldsetModule,
    TabViewModule,
    AccordionModule,
    TooltipModule.forRoot(),
    DialogModule,
    SplitButtonModule,
    SliderModule,
    OverallSearchRoutingModule,
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CKEditorModule,
    TreeModule,
    TreeTableModule,
    ContextMenuModule,
    DragDropModule,
    PanelModule,
    // SortablejsModule.forRoot({ animation: 150 }),
    MenubarModule,
    MenuModule,
    DataTableModule,
    CheckboxModule,
    OverlayPanelModule,
    ProgressBarModule,
    ToolbarModule,
    DropdownModule,
    SelectButtonModule,
    SidebarModule,
    PanelMenuModule,
    EditorModule,
    TableModule,
    ConfirmDialogModule,
    InputMaskModule,
    BsDropdownModule.forRoot(),
    HttpModule
  ],
  declarations: [
    OverallSearchComponent,
  ],
  providers: [NameService,CollaborationService],
})

export class OverallSearchModule { }
