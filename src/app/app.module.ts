import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
// import { NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LocationStrategy, HashLocationStrategy,DatePipe } from '@angular/common';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgHttpLoaderModule } from './ng-http-loader/ng-http-loader.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxPermissionsModule } from 'ngx-permissions';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import { CommonUtilityService } from './services/common-utility.service';
import { EmployeeService } from './services/appservices/employee.service';
import { DbGroupService } from './services/appservices/dbChatService';
// modules
import { TreeModule } from 'primeng/tree';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { GrowlModule } from 'primeng/growl';
import { DialogModule } from 'primeng/dialog';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {SidebarModule} from 'primeng/sidebar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
// import {MegaMenuModule} from 'primeng/megamenu';
import { CarouselModule } from 'primeng/carousel';
import { MessageService } from 'primeng/components/common/messageservice';
import { ContextMenuModule, ContextMenuService } from 'ngx-contextmenu';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
// import {  SimpleLineIconsComponent } from './shared/components/icons/simple-line-icons.component';
// Import containers
import { DefaultLayoutComponent } from './containers';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginUserComponent } from './views/login-user/login-user.component';
import { UserServicesComponent } from './views/user-services/user-services.component';
import { UserSalesComponent } from './views/user-sales/user-sales.component';

import { UserSupportComponent } from './views/user-support/user-support.component';
import { UserHomeComponent } from './views/user-panel/user-home/user-home.component';
import { UserEmployeeRegisterComponent } from './views/user-employee-register/user-employee-register.component';
import { UserCompanyRegisterComponent } from './views/user-company-register/user-company-register.component';
import { UserForgotPasswordComponent } from './views/user-forgot-password/user-forgot-password.component';
import { ChatComponent } from './views/chat/chat.component';
import { SubmoduleService } from './services/submodule.service';
import { ModuleService } from './services/module.services';
import { MasterGroupService } from './services/appservices/master-group.service';
import { MasterService } from './services/master.service';
import { CommonAppService } from './services/appservices/common-app.service';
import { TabViewModule } from 'primeng/tabview';
// import {FieldsetModule} from 'primeng/fieldset';
import { StepsModule } from 'primeng/steps';
import { PopoverModule } from 'ngx-bootstrap';
import { CookieService } from './services/cookie.service';
const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  //AppSidebarModule

} from './coreui';
// boundry sensor module
// import { BoundSensorModule } from './bound-sensor/public_api';
// Import routing module


// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ChartsModule } from 'ng2-charts/ng2-charts';
//import { OwlModule } from 'ngx-owl-carousel';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { InputMaskModule } from 'primeng/primeng';
// import { NgSelectModule } from '@ng-select/ng-select';
// services
import { CommonHttpService } from './shared/common-http.service';
import { LocalStorageService } from './shared/local-storage.service';
import { JWTTokenInterceptorService } from './shared/jwttoken-interceptor.service';

import { UPModelService } from './services/appservices/userpanelservices/upmodel.service';
import { BookmarkPageComponent } from './shared/components/bookmark-page/bookmark-page.component';
import { PreferenceMenuComponent } from './shared/components/preference-menu/preference-menu.component';
import { UPPreferenceService } from './services/appservices/userpanelservices/preference.service';
import {CheckboxModule} from 'primeng/checkbox';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SidebarComponent } from './containers/sidebar/sidebar.component';
import { MenuService } from './services/menu.service';
import { SharedModuleModule } from './shared/shared.module';
import { FilterTagService } from './services/appservices/userpanelservices/filtertag.service';
import {KeyFilterModule} from 'primeng/components/keyfilter/keyfilter';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {SplitButtonModule} from 'primeng/splitbutton';
import {DropdownModule} from 'primeng/dropdown';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import { DetailsService } from './services/appservices/userpanelservices/details.service';
import { ReportsService } from './services/appservices/userpanelservices/reports.service';

import {TableModule} from 'primeng/table';
import {CKEditorModule} from 'ngx-ckeditor';
import {BlockUIModule} from 'primeng/blockui';
import { Inactivity } from './user-inactivity/inactivity.module';
import {RadioButtonModule} from 'primeng/radiobutton';
// import { IconSetComponent } from './views/user-panel/icon-set/icon-set.component';
import { ReportPageComponent } from './shared/components/report-page/report-page.component';
import {DataTableModule} from 'primeng/datatable';
import { PinComponent } from './views/pin/pin.component';
import { ScrollToModule } from './scrolls/index';
import { DocumentService } from './services/appservices/userpanelservices/document.service';
import { ExternalLoginComponent } from './views/external-login/external-login.component';
import { ColorPickerModule } from 'ngx-color-picker';
import {TreeTableModule} from 'primeng/treetable';
@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    NgHttpLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgxPermissionsModule.forRoot(),
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    //AppSidebarModule,
    PerfectScrollbarModule,
    // BoundSensorModule,
    BsDropdownModule.forRoot(),
    SplitButtonModule,
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    // MegaMenuModule,
    ConfirmDialogModule,
    ChartsModule,
    TreeModule,
    MessagesModule,
    MessageModule,
    GrowlModule,
    DialogModule,
    OverlayPanelModule,
    SidebarModule,
    CarouselModule,
    TabViewModule,
    // FieldsetModule,
    // MenuItem,
    CardModule,
    StepsModule,
    PanelModule,
    DropdownModule,
    KeyFilterModule,
    ScrollPanelModule,
    AutoCompleteModule,
    ContextMenuModule.forRoot({
      autoFocus: true,
    }),
    InputMaskModule,
    // SortablejsModule.forRoot({ animation: 800 }),
    PopoverModule.forRoot(),
    CheckboxModule,
    PdfViewerModule,
    SharedModuleModule,
    TableModule,
    CKEditorModule,
    Inactivity,
    BlockUIModule,
    RadioButtonModule,
    DataTableModule,
    ScrollToModule.forRoot(),
    ColorPickerModule,
    // NgSelectModule
    TreeTableModule
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginUserComponent,
    UserServicesComponent,
    UserSalesComponent,
    UserSupportComponent,
    UserEmployeeRegisterComponent,
    UserCompanyRegisterComponent,
    UserHomeComponent,
    BookmarkPageComponent,
    PreferenceMenuComponent,
    SidebarComponent,
    UserForgotPasswordComponent,
    // IconSetComponent,
    ChatComponent,
    ReportPageComponent,
    PinComponent,
    ExternalLoginComponent
  ],
  providers: [
    DatePipe,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JWTTokenInterceptorService,
      multi: true,
    },
    SubmoduleService,ModuleService,MasterGroupService, MessageService, ContextMenuService, CommonHttpService, 
     MasterService,CommonAppService,LocalStorageService,ConfirmationService,CommonUtilityService,ReportsService,
     UPModelService, UPPreferenceService,MenuService, FilterTagService, DetailsService,DbGroupService,EmployeeService,
     DocumentService,CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
