// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { submoduleRoutingModule } from './submodule-routing.module';
// import { BoundSensorModule } from '../../../bound-sensor/public_api';
// import { AccordionModule } from 'ngx-bootstrap';
import { ScrollDispatchModule } from '@angular/cdk/scrolling'
import { TabsModule } from 'ngx-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap';
import {TreeModule} from 'primeng/tree';
// import {ContextMenuModule} from 'primeng/contextmenu';
import { ContextMenuModule,ContextMenuService } from 'ngx-contextmenu';
import { SortablejsModule } from '../../../drag-drop/sortablejs.module';
import {CKEditorModule} from 'ngx-ckeditor';
import {  SimpleLineIconsComponent } from '../../../shared/components/icons/simple-line-icons.component';
// prime modules

import {DialogModule} from 'primeng/dialog';

import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {TreeDragDropService} from 'primeng/api';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
//import { SortableModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NameService } from '../nameService';

import {HttpModule} from "@angular/http";
import { SubmodulesComponent } from './submodule/submodule.component';
// import { treemoduleComponent } from './treemodulecomponent/treemodule.component';
// import { ModuleItemsComponent } from './module-items/module-items.component';
// import { ModuleService } from '../../../services/module.services';
import { orderByPipe } from '../../../services/orderBy.pipe';
import { SharedModuleModule } from '../../../shared/shared.module';
//import { MouseMoveService } from '../../../services/mouseMove.service';
// import { FontAwesomeComponent } from '../../../shared/components/icons/font-awesome.component';
// import { IconSetComponent } from '../../../views/user-panel/icon-set/icon-set.component';
@NgModule({
  imports: [
    CommonModule,
    // BoundSensorModule,
    ScrollDispatchModule,
    FormsModule,
    TooltipModule.forRoot(),
    DialogModule,
    //TableModule,
    // BrowserAnimationsModule,
    submoduleRoutingModule,
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CKEditorModule,
    TreeModule,
    ContextMenuModule.forRoot({
      autoFocus: true,
    }),
    SortablejsModule.forRoot({ animation: 800 }),
    ConfirmDialogModule,
    BsDropdownModule.forRoot(),
    HttpModule,
    SharedModuleModule
  ],
  declarations: [
    SubmodulesComponent,
    // ModuleItemsComponent,
    // treemoduleComponent,
    SimpleLineIconsComponent,
    // IconSetComponent,
    // FontAwesomeComponent,
    orderByPipe
  ],
  providers: [NameService,ConfirmationService,ContextMenuService,TreeDragDropService],
})

export class SubModuleModule { }
