import { Component, OnInit, ViewChild, HostListener, AfterViewInit, AfterViewChecked, ChangeDetectorRef, ElementRef, NgZone } from '@angular/core';
// import { navItems } from './../../_nav';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as $ from 'jquery';
import { ModuleService } from '../../services/module.services';
import { Subscription } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { AppSidebarNavComponent } from '../../coreui/sidebar/app-sidebar-nav.component';
import { NgxPermissionsService } from 'ngx-permissions';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { CommonAppService } from '../../services/appservices/common-app.service';
import { Observable } from 'rxjs/Rx';
import { MessageService } from 'primeng/components/common/messageservice';
import { UPModelService } from '../../services/appservices/userpanelservices/upmodel.service';
import { ConfirmationService } from 'primeng/api';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MenuService } from "../../services/menu.service";
import { InactivityDirective } from '../../user-inactivity/inactivity.directive';
import { AppConstant } from '../../app.constant';
import { DomSanitizer } from '@angular/platform-browser';
import { DbGroupService } from '../../services/appservices/dbChatService';
import { CommonUtilityService } from '../../services/common-utility.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit, AfterViewInit, AfterViewChecked {
  thisComponent = this;
  @ViewChild('moduleTabset') moduleTabset: TabsetComponent;
  @ViewChild('appsidebarnav') appsidebarnav: AppSidebarNavComponent;
  @ViewChild('downloadZipLink') private downloadZipLink: ElementRef;
  subscription: Subscription;
  public inactiveTimeoutValue: number = 30;
  public isReferenceModule: boolean = false;
  public OrginalModuleData: any = {};
  public OrginalModuleDataUrl: string = "";
  public ScreenBlocked: boolean = false;
  public navItems: any;
  public moduleItems: any = null;
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement = document.body;
  public isHome = false;
  public isPin = false;
  public isActive: any;
  public selectedItem: any;
  public disableBasicMenu = false;
  public globalSelectedModule: any;
  private IERedirectRequired: boolean = false;
  private isIE11: boolean = false;
  public SelectedModule: any;
  public cpDefaultValue: any;
  public chatbar_display = true;
  public activeTab: number = 0;
  public selectedModuleId: any;
  public selectedModelId: any;
  public defaultModelHierarchy: any = [];
  public unreadMsgCount: number = 0;
  public unreadPvtMsgCountData: any;
  private _subscriptions = new Subscription();
  public employeeNavigation: boolean = false;
  public documentNavigation: boolean = false;
  public detailsDefaultRedirection = "stab_details_uemplist";
  public changelogPermission = false;
  display: boolean = false;
  modal_dialog: boolean = false;
  loadChatComponent: boolean = true;
  public module_levels: any = [];
  msgs: any;
  model_name: string;
  userinfo: any = {};
  legoinfo: any = {};
  companyId: number;
  employeeId: number;
  public modelList: any = {};
  query: any = [];
  queryparams: any = [];
  // currentqueryparams:any;
  ctype: any;

  assessment_sub_tab: any = {
    Strength: "Areas Needing Improvement",
    Weaknesses: "Achievement of Goals",
    Opportunities: "Performance Objectives",
    Threats: "Peer Feedback"
  };
  details_sub_tab: any = {
    stab_details_processinfo: "Process Information",
    stab_details_uemplist: "Unit Employee List",
    stab_details_managefiltertags: "Manage Filter Tags",
    stab_details_changelogs: "Change Log",
    stab_details_submchangelogs: "Submodule Change Log",
    stab_details_accessrights: "Access Rights"
  };
  public selectedlist: any = {};
  performanceStatus: boolean = false;
  public searchstring: any;
  preferenceSettings: any = {};
  defaultToBoardorTask = 'tasks';
  checkrights: any = [];
  browserMessage: boolean = false;
  private resolvedPromise = typeof Promise == 'undefined' ? null : Promise.resolve();
  nextTick = this.resolvedPromise ? function (fn) { this.resolvedPromise.then(fn); } : function (fn) { setTimeout(fn); };
  public MenuRightMenuActions = [
    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-hand-rock-o"></i>
        </span>
        <span class="context-title">Select Icon</span>`;
      },
      click: (event) => {
        //this.CommonModuleRightEvent('add', event);
        return;
      },
      enabled: (event) => {
        var enabled = false;

        return enabled;
      },
      visible: (event) => {
        var enabled = false;

        return enabled;
      }
    }
  ];

  windowonResize(event) {
    // var w = event.target.innerWidth;
    // //console.log("window resizing 2: ", w);
    // //console.log("window resizing 2 event: ", event);
    // this.setElementAutoHeight(event);
    // const w = event.target.innerWidth;
    // if (w >= this.breakpoint) {
    //   this.visible = true;
    // } else {
    //   // whenever the window is less than 768, hide this component.
    //   this.visible = false;
    // }
  }
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + 2
    );
    // main tab
    $("#main_tab_container > .tab-content").css("height", res_h + "px");
    //  sub tabs class: sub_tab_container
    var inner_res_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 60);
    $("#main_tab_container .sub_tab_container > .tab-content").css("height", inner_res_h + "px");
    $('.main_ckeditor .cke_inner > .cke_contents').each(function () {
      var ck_res_h = inner_res_h - 125;
      $(this).css("height", ck_res_h + "px");
    });
  }
  ngAfterViewInit() {
    // this.setElementAutoHeight(null);
    this.hideOnEmployeeNavigation();
    var hasvalue = window.location.hash;
    var url = hasvalue;
    if (hasvalue.indexOf("/home") == -1) {
      this.activateModuleTabs(hasvalue);
      // $(".app-header .navbar-toggler").hide();
    }
    else {
      this.activateModuleTabs();
      this.activeTab = 9;
    }
    // setTimeout(() => {
    //   if (this.cd !== null &&
    //     this.cd !== undefined &&
    //     !(this.cd["ChangeDetectorRef"])) {
    //     this.cd.detectChanges();
    //   }
    // }, 250);
    this.nextTick(() => {
      if (this.cd !== null &&
        this.cd !== undefined &&
        !(this.cd["ChangeDetectorRef"])) {
        this.cd.detectChanges();
      }
      // your code
    });
    // setTimeout(() => {
    //   this.chatbar_display = false;
    //   setTimeout(() => {
    //     $("#chat_sidebar .ui-sidebar-right").css({ "visibility": "visible" })
    //   }, 2000);
    // }, 3000);
    this.nextTick(() => {
      this.chatbar_display = false;
      this.nextTick(() => {
        $("#chat_sidebar .ui-sidebar-right").css({ "visibility": "visible" })
      });
    });
    var screenWidth = window.innerWidth;
    if (screenWidth <= 991) {
      $('body').removeClass('sidebar-fixed');
      $("#customsidebar").addClass("d-none");
      $("#sidemenuHolder").addClass("d-none");
    }
  }
  pinmodule_active: boolean = true;
  queryParamsObject: any = {};
  companyInfo: any;
  companyDfMdls: any;
  isDefaultModel: any;
  companyModel: any;
  PIN_URL: string = AppConstant.PIN_URL;
  CLICKONCE_URL: string = AppConstant.CLICKONCE_URL;
  isMobileDevice = false;
  constructor(public router: Router, public ActivatedRoute: ActivatedRoute, public ModuleService: ModuleService,
    private UPModelService: UPModelService, private CommonUtilityService: CommonUtilityService,
    private LocalStorageService: LocalStorageService, private messageService: MessageService,
    private CommonAppService: CommonAppService, private ConfirmationService: ConfirmationService, private cd: ChangeDetectorRef, public MenuService: MenuService,
    public DbGroupService: DbGroupService, private ngZone: NgZone, ) {
    //  this.downloadUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.downloadlink);
    this.isMobileDevice = this.CommonUtilityService.isMobileDevice();
    this.isIE11 = this.CommonUtilityService.isIE11Browser();
    console.log("this is IE browser: ", this.isIE11);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.companyInfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
    this.companyDfMdls = this.companyInfo.DfMdls || 0;
    this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    if (this.preferenceSettings != undefined && this.preferenceSettings != null) {
      this.defaultToBoardorTask = (this.preferenceSettings.isBoardDefault == true) ? 'boards' : 'tasks';
    }
    if (this.userinfo != undefined && this.userinfo != null) {
      this.companyId = parseInt(this.userinfo.CompanyId);
      this.employeeId = parseInt(this.userinfo.EmployeeId);
      this.Assessmentmenu();
    }
    this.getModelList(null);
    this.getTreeModules();
    // this.changes = new MutationObserver((mutations) => {
    //   this.sidebarMinimized = document.body.classList.contains('sidebar-minimized')
    // });

    // this.changes.observe(<Element>this.element, {
    //   attributes: true
    // });

    this.router.events.subscribe((event: any) => {
      var screenWidth = window.innerWidth;
      if (event.constructor.name === "NavigationStart") {
        console.log("Default NavigationStart");
        if (window.location.hash.indexOf("workflow") > 0 && this.isIE11 && this.queryparams.t != "tasks") {
          console.log("IE require redirection");
          this.IERedirectRequired = true;
        }
        else {
          this.IERedirectRequired = false;
        }
      }
      if (event.constructor.name === "NavigationEnd") {
        // if(this.IERedirectRequired == true && this.isIE11 && window.location.hash.indexOf("workflow") < 0){
        //   console.log("IE  redirection started");
        //   location.reload();
        //   return;
        // }
        this.isHomeNavigation(event.url);
        if (event.url.indexOf("/home") == -1) {
          this.activateModuleTabs(event.url);
        }
        if (screenWidth <= 991) {
          $('body').removeClass('sidebar-fixed');
          $("#customsidebar").addClass("d-none");
          $("#sidemenuHolder").addClass("d-none");
        }

        // else{
        // //console.log(event);
        // // this.Assessmentmenu();
        // this.isHomeNavigation(event.url);
        // if (event.url.indexOf("/home") == -1) {
        //   this.activateModuleTabs(event.url);
        // }
        // if (screenWidth <= 991) {
        //   $('body').removeClass('sidebar-fixed');
        //   $("#customsidebar").addClass("d-none");
        //   $("#sidemenuHolder").addClass("d-none");
        // }
        // }

      }
    });
    this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryParamsObject = params;
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];

      this.isDefaultModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      var companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
      if (companyinfo != null) {
        if (companyinfo.DfMdls != undefined) {
          this.companyModel = companyinfo.DfMdls;
        }
      }
      this.Assessmentmenu();
    });
    var hasvalue = window.location.hash;
    if (hasvalue.indexOf("/home") >= 0) {
      $("body").removeClass("sidebar-lg-show");
      this.isHome = true;
      // $(".app-header .navbar-toggler").hide();
    }
    else {
      this.activateModuleTabs(hasvalue);
      this.isHome = false;
      $("body").addClass("sidebar-lg-show");
      $(".app-header .navbar-toggler").show();
    }
    this.getcpDefaultValue();
    this.initChatServices();
  }
  goDefaultworkflowNavigation() {
    this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    if (this.preferenceSettings != undefined && this.preferenceSettings != null) {
      this.defaultToBoardorTask = (this.preferenceSettings.isBoardDefault == true) ? 'boards' : 'tasks';
      this.navigateRoute('/workflow', this.defaultToBoardorTask);
    }
  }
  togglesidebarMenu() {
    this.MenuService.setToggleMenu();
  }
  getModelList(LastInsertedLego) {
    this.ModuleService.setModelList().then((res) => {
      //console.log("call back module service:", res);
      this.modelList = this.ModuleService.getModelList();
      if (LastInsertedLego != null) {
        if (LastInsertedLego.length > 0) {
          this.changeModel(LastInsertedLego[0]);
          //this.ModuleService.setselectedModel(LastInsertedLego[0]);
        }
      }
    });
  }


  setSelectedModule(item) {
    if (!_.isEmpty(item)) {
      this.ModuleService.setSelectedModule(item);
    }
    if (item.params.mode == 'E') {

      let urlTree = this.router.parseUrl(this.router.url);
      var newparams = _.clone(item.params);
      newparams.t = "stab_details_uemplist";
      this.router.navigate(['/details'], { queryParams: newparams });
      //return;
    }
    else if (item.params.mode == 'T' || item.params.mode == 'O' || item.params.mode == 'P') {

      let urlTree = this.router.parseUrl(this.router.url);
      var newparams = _.clone(item.params);
      newparams.t = "submodules";
      this.router.navigate(['/submodule'], { queryParams: newparams });
      //return;
    }
    else {
      // dynamic change router value
      let urlTree = this.router.parseUrl(this.router.url);
      // urlTree.queryParams= item.params;
      _.merge(urlTree.queryParams, item.params);
      this.router.navigateByUrl(urlTree);
    }
  }
  redirectToSelectedModule(item) {
    return this.ModuleService.redirecttoSelectedModule(item);
    // return this.ModuleService.redirecttoSubModule(item);

  }
  isHomeNavigation(url) {
    if (url == "/home") {
      this.isHome = true;
      //    var menuopen = this.MenuService.checkMenuOpen();
      $("body").removeClass("sidebar-lg-show");
      // $(".app-header .navbar-toggler").hide();
      // this.MenuService.hideMenu();
      // this.MenuService.showhideMenu(true);
    }
    else {

      this.isHome = false;
      //    this.MenuService.setToggleMenu();
      $("body").addClass("sidebar-lg-show");
      // $(".app-header .navbar-toggler").show();
    }
  }
  public activateModuleTabs(hasvalue?) {
    var querystring = this.queryParamsObject['t'];
    var allQuerystring = this.queryParamsObject;

    if (allQuerystring['ispin'] == true) {
      console.log("ispinned");
    }
    if (querystring == "stab_preferece") {
      this.pinmodule_active = false;
    }
    else {
      this.pinmodule_active = true;
    }
    if (this.moduleTabset) {
      var activeTab = (querystring == 'submodules') ? 0 :
        (querystring == 'tasks' || querystring == 'boards') ? 1 :
          (querystring == "connections") ? 2 :
            (querystring == "stab_document_link" || querystring == 'stab_document_Add' || querystring == 'stab_view_document') ? 3 :
              (querystring == "stab_strategy_summary" || querystring == 'stab_strategy_mission' || querystring == 'stab_strategy_vision'
                || querystring == 'stab_strategy_strategy' || querystring == 'stab_strategy_goals') ? 4 :
                (querystring == "stab_assessment_summary" || querystring == "stab_assessment_strength" || querystring == "tab_assessment" || querystring == "stab_assessment_reviewer"
                  || querystring == 'stab_assessment_weakness' || querystring == 'stab_assessment_opportunities' || querystring == "stab_assessment_threats") ? 5 :
                  (querystring == 'stab_performance_metrics' || querystring == 'stab_performance_strategyexe') ? 6 :
                    //(querystring == "stab_collaboration_forum" || querystring == "stab_collaboration_notes") ? 7 :
                    (querystring == "stab_collaboration_notes" || querystring == "stab_collaboration_module") ? 7 :
                      (querystring == "stab_details_uemplist" || querystring == "stab_details_processinfo" || querystring == "tab_details"
                        || querystring == "stab_details_managefiltertags" || querystring == "stab_details_changelogs"
                        || querystring == "stab_details_submchangelogs" || querystring == "stab_details_accessrights") ? 8 :
                        (querystring == "reporting") ? 9 : -1;
      this.activeTab = (activeTab > -1) ? activeTab : 9;
      // setTimeout(() => {
      if (this.moduleTabset.tabs) {
        if (this.moduleTabset.tabs.length > 0) {
          _.forEach(this.moduleTabset.tabs, (t) => {
            // t.active = false;
            $("#" + t.id + "-link").removeClass("active");
            $("#" + t.id + "-link").parent(".nav-item").removeClass("active");
          });
          if (activeTab > -1) {
            $("#" + this.moduleTabset.tabs[activeTab].id + "-link").addClass("active");
            $("#" + this.moduleTabset.tabs[activeTab].id + "-link").parent(".nav-item").addClass("active");
            this.moduleTabset.tabs[activeTab].active = true;
          }

        }
      }
      //  }, 100);

    }

    //this.moduleTabset.tabs[activeTab].active = true;
  }
  hidebreadscrumb(m, i) {
    //console.log(i);
    for (i = 0; i < this.module_levels.length; i++) {
      if (i >= m.mid) {
        this.module_levels[i].hide = true;
      }
      else {
        this.module_levels[i].hide = false;
      }
    }
  }
  getTreeModules() {
    if ($("#treenavigation_component").length > 0) {
      if ($("#treenavigation_component > li").children.length > 0) {
        $("#treenavigation_component > li").remove();
      }
      //$("#treenavigation_component").html("");
    }
    this.moduleItems = this.ModuleService.getTreeModules();
    if (this.appsidebarnav != undefined) {
      this.appsidebarnav.navItems = [];
      this.appsidebarnav.navItems = this.moduleItems;
    }
  }
  ngOnInit() {
    let msg: boolean = this.CommonAppService.detechBrowserCompatibility();
    if (msg == true) {
      this.browserMessage = true;
    }
    else {
      this.browserMessage = false;
    }
    const data = 'some text';

    const blob = new Blob([data], { type: 'application/octet-stream' });
    this._subscriptions.add(this.ModuleService.getModuleUpdates().subscribe(count => {
      // this.cartcount = count;
      this.getTreeModules();
      this.getBreadcrumbData();
    }));
    this._subscriptions.add(this.DbGroupService.getunreadMsgCount().subscribe(countData => {
      // this.cartcount = count;
      this.unreadPvtMsgCountData = [];
      this.unreadPvtMsgCountData = countData;
      this.formatUnreadCount();
    }));
    this._subscriptions.add(this.DbGroupService.getSingleUnreadMsgCount().subscribe(countData => {
      this.formatSingleUnreadCount(countData);
    }));
    this._subscriptions.add(this.ModuleService.getSelectedModuleUpdates().subscribe(selectedModule => {
      // this.cartcount = count;
      //console.log("selected module changes", selectedModule);
      //this.queryparams = selectedModule.treeModules.url;
      //this.queryparams = selectedModule.treeModules.params;
      this.ctype = selectedModule.treeModules.cType;
      this.globalSelectedModule = selectedModule.treeModules;
      this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
      this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      this.SelectedModule = selectedModule;
      this.getBreadcrumbData();
      if (this.globalSelectedModule.type == "D") {
        this.router.navigate(['dlibrary', this.globalSelectedModule.params]);
        return false;
      }
      if (this.globalSelectedModule.type == "E") {
        this.assessment_sub_tab.Strength = "Areas Needing Improvement";
        this.assessment_sub_tab.Weaknesses = "Achievement of Goals";
        this.assessment_sub_tab.Opportunities = "Performance Objectives";
        this.assessment_sub_tab.Threats = "Peer Feedback";
        this.performanceStatus = true;

        this.details_sub_tab.stab_details_processinfo = "Employee Information";
        this.details_sub_tab.stab_details_uemplist = " Employee List";
        this.details_sub_tab.stab_details_managefiltertags = "Manage Filter Tags";
        this.details_sub_tab.stab_details_changelogs = "Change Log";
        this.details_sub_tab.stab_details_submchangelogs = "Job Description";
        this.details_sub_tab.stab_details_accessrights = "Competencies and Skills";

        this.router.navigate(['employee', this.globalSelectedModule.params]);
        return false;
      }
      else {
        this.assessment_sub_tab.Strength = "Strength";
        this.assessment_sub_tab.Weaknesses = "Weaknesses";
        this.assessment_sub_tab.Opportunities = "Opportunities";
        this.assessment_sub_tab.Threats = "Threats";
        this.performanceStatus = false;

        this.details_sub_tab.stab_details_processinfo = "Process Information";
        this.details_sub_tab.stab_details_uemplist = " Unit Employee List";
        this.details_sub_tab.stab_details_managefiltertags = "Manage Filter Tags";
        this.details_sub_tab.stab_details_changelogs = "Change Log";
        this.details_sub_tab.stab_details_submchangelogs = "Submodule Change Log";
        this.details_sub_tab.stab_details_accessrights = "Access Rights";
      }
      // this.getTreeModules();

    }));;

    this.setElementAutoHeight(null);

    //alert(this.router.routerState.root.queryParams)

  }

  getBreadcrumbData() {
    var module_levels = this.ModuleService.getBreadcrumb();
    this.module_levels = _.cloneDeep(module_levels);
    this.SelectedModule = this.module_levels[this.module_levels.length - 1];
    var w = $("#navigation_breadcrumb").width();
    var l = this.module_levels.length;
    this.ellipsisBreadCrumb(w, l);
    if (!_.isEmpty(this.SelectedModule)) {
      if (this.SelectedModule.referenceLegoId > 0) {
        this.isReferenceModule = true;
        var lego = this.ModuleService.getModule(this.SelectedModule.referenceLegoId);
        if (!_.isEmpty(lego)) {
          // this.OrginalModuleDataUrl = lego
          this.OrginalModuleData = lego;
        }
      }
      else {
        this.isReferenceModule = false;
        this.OrginalModuleData = {};
      }
    }
  }
  ellipsisBreadCrumb(w, l) {
    var Removal = Math.floor((l / 2) + 1);
    if (Removal > l) {
      this.module_levels.splice(Removal - 1, 1);
      var l = this.module_levels.length;
      if (l > 0) {
        var bw = w / l;
        if (bw > 100) {
          this.ellipsisBreadCrumb(w, l);
        }
      }
    }
  }
  redirecttoHome() {
    this.router.navigate(['/home']);
  }
  // showDialog() {
  //   this.modal_dialog = false;
  //   this.display = true;
  // }
  show_modal_dialog() {
    this.model_name = "";
    this.display = false;
    this.modal_dialog = true;
    // setTimeout(() => {
    //   $("#create_model_textbox").focus();
    // }, 200);
    this.nextTick(() => {
      $("#create_model_textbox").focus();
    });
  }
  showMessage(data) {

  }
  navigateTosubTabs(component, tab_id) {
    //console.log(component);
    var selected_tab = _.find(component.modulesubTabset.tabs, (tab) => {
      return (tab.id == tab_id);
    });
    if (!_.isEmpty(selected_tab)) {
      selected_tab.active = true;
    }
  }

  ngAfterViewChecked() {
    var hasvalue = window.location.hash;
    var url = hasvalue;
    if (hasvalue.indexOf("/home") >= 0) {
      url = "/home";
      $("body").removeClass("sidebar-lg-show");
      this.isHome = true;
      // $(".app-header .navbar-toggler").hide();
    }
    else {
      //  this.activateModuleTabs(hasvalue);
    }
    // this.isPin = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.ISPIN) || false;
    this.isHomeNavigation(url);
    // this.hideOnEmployeeNavigation();
    //this.activateModuleTabs("tab");
    var selectedEmpname = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SELCTEDEMPNAME);
    $("#empname").text(selectedEmpname);
  }

  logout() {
    this.DbGroupService.abortConnection();
    this.CommonAppService.logOut("");
    this.router.navigate(['/user-login']);
    // var params = {
    //   uname: 'zZeBDTEWXLg%3D',
    //   upwd: 'zZeBDTEWXLg%3D',
    //   pinid: 'lD0NYHPjw8M%3D',
    //   isReLogin: true,
    // }
    // setTimeout(() => {
    //   this.router.navigate(['/pin-login'], { queryParams: params });
    // }, 1000);

  }

  openModel(lego) {
    this.changeModel(lego);
    // this.setSelectedModule(lego)   
    //   setTimeout(() => {
    //     this.ngOnInit();
    // }, 100);
  }
  changeModel(lego: any) {
    if (!_.isEmpty(lego)) {
      var newparams: any = {
        lId: lego.legoId,
        pId: lego.parentId,
        lLvl: lego.legoLevel,
        pos: lego.position,
        mode: lego.cType,
        t: "submodules"
      }
      lego.params = newparams;
      this.ModuleService.setselectedModel(lego);
      // setTimeout(() => {
      //   //this.ModuleService.redirecttoSelectedModule(lego);
      //   this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
      //   this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      //   $("#main_tab_container").show();
      //   $("#lego_menu").show();
      //   $("#doc_menu").hide();
      //   this.router.navigate(['/submodule'], { queryParams: newparams });
      // }, 1000);
      this.nextTick(() => {
        //this.ModuleService.redirecttoSelectedModule(lego);
        this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
        this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
        $("#main_tab_container").show();
        $("#lego_menu").show();
        $("#doc_menu").hide();
        this.router.navigate(['/submodule'], { queryParams: newparams });
      });
      //  this.router.navigate(['/submodule'], { queryParams: newparams });

      //   var queryParams : any = _.clone(this.ActivatedRoute.snapshot.queryParams);
      //   queryParams.lId = lego.legoId;
      //   queryParams.pId=lego.parentId;
      //   queryParams.lLvl=lego.legoLevel;
      //   queryParams.pos=lego.position;
      //   queryParams.mode=lego.cType
      //   this.ModuleService.setselectedModel(queryParams);
      //  this.router.navigate(['.'], { queryParams: queryParams });
    }
  }
  createModel() {
    if (this.model_name == "" || this.model_name == null || this.model_name == undefined) {
      var errorMessage = "Enter Model Name"
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: 'Error', detail: errorMessage });
      this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;
    }
    var req = {
      CompanyId: this.userinfo.CompanyId,
      EmployeeId: this.userinfo.EmployeeId,
      ModelName: this.model_name
    };
    this.UPModelService.createModel(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.model_name = null;
                this.getModelList(result);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
                //this.setModelList();
              }
            }
            else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
              return false;
            }

          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })

    this.modal_dialog = false
  }

  deleteModel() {
    this.ConfirmationService.confirm({
      message: 'Do you want to delete this Model?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        var selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
        var companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
        if (selectedModel == companyinfo.DfMdls) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Default Model Cannot be Deleted." });
          return false;
        }
        var req = {
          CompanyId: this.userinfo.CompanyId,
          EmployeeId: this.userinfo.EmployeeId,
          LegoId: selectedModel,

        };
        this.messageService.clear();
        this.UPModelService.deleteModel(req)
          .then(res => {
            if (res) {
              var value = res.message;
              var msg = "";
              var errorType = "";
              var msgsummary = "";
              switch (value) {
                case '1':
                  msg = "Model deleted successfully!.";
                  errorType = "success";
                  msgsummary = "Success";
                  break;
                case '2':
                  msg = "Company Should have Minimum One Model!.";
                  errorType = "info";
                  msgsummary = "Info";
                  break;
                case '3':
                  msg = "Permission Denied!.";
                  errorType = "error";
                  msgsummary = "Error";
                  break;
                case '4':
                  msg = "Model Not Exists!.";
                  errorType = "error";
                  msgsummary = "Error";
                  break;
                case '5':
                  msg = "List not found!.";
                  errorType = "error";
                  msgsummary = "Error";
                  break;
                default:
                  msg = "Something went wrong.Please try again!."
                  errorType = "error";
                  msgsummary = "Error";
                  break;
              }
              if (!_.isEmpty(res)) {
                if (res.status == 1) {
                  var result = res.result;
                  if (result != null) {
                    this.model_name = null;
                    if (value == 1) {
                      this.ModuleService.setselectedModel(result);
                      this.getModelList(result);
                      this.openModel(result);
                    }
                  }
                }
              }
              this.messageService.add({ severity: errorType, summary: msgsummary, detail: msg });
            }
          }, error => {
            //console.log("Error Happend");

          })

      },
      reject: () => {
      }
    });

  }

  replica() {
    //alert(this.router.url);
    //this.router.navigate([this.router.url]);
    //window.open( this.router.url);
    var url = document.URL;
    var params = "";
    params = 'width=' + screen.width;
    params += ', height=' + screen.height;
    params += ', top=0, left=0'
    params += ', fullscreen=yes';
    window.open(url, 'IntelliModz', params);
    // window.open(this.getUrl('#' + this.router.url), '_blank')
  }
  EmployeeRedirect() {
    var moduleList = this.ModuleService.moduleList;
    var employeeLego = _.find(moduleList, (li) => {
      return (li.type == "E");
    });
    if (!_.isEmpty(employeeLego)) {
      this.ModuleService.redirecttoSelectedModule(employeeLego);
    }
  }

  DocumentRedirect() {
    var moduleList = this.ModuleService.moduleList;
    var documentLego = _.find(moduleList, (li) => {
      return (li.type == "D");
    });
    if (!_.isEmpty(documentLego)) {
      this.ModuleService.redirecttoSelectedModule(documentLego);
    }
  }

  private getLink(link): any[] {
    if (!_.isArray(link)) {
      link = [link]
    }

    return link
  }

  private getUrl(link): string {
    let url = ''

    if (_.isArray(link)) {
      url = link[0]

      if (link[1]) {
        url += '?' + JSON.stringify(link[1])
      }
    } else {
      url = link
    }

    return url
  }
  onSelectTab(event, pinmodule) {
    if (event) {
      console.log(event);
    }
  }
  navigateRoute(path, param) {
    if (path == "/preference") {
      this.pinmodule_active = false;
    }
    else {
      this.pinmodule_active = true;
    }
    // var newparams = _.clone(this.globalSelectedModule.params);
    // newparams.t = param;    
    // this.router.navigate([path], { queryParams: newparams });
    var lId, lLvl, pos, mode;
    // this.router.routerState.root.queryParams.subscribe((params: Params) => {
    //   this.queryparams.lId = params['lId'];
    //   this.queryparams.pId = params['pId'];
    //   this.queryparams.lLvl = params['lLvl'];
    //   this.queryparams.pos = params['pos'];
    //   this.queryparams.mode = params['mode'];
    this.CommonAppService.checkPinmodule();
    // });
    var refparam: any = {};
    if (!_.isEmpty(this.SelectedModule)) {
      if (this.SelectedModule.referenceLegoId > 0) {
        var tempLego = this.ModuleService.findChildModules(this.ModuleService.treeModules, null, this.SelectedModule.referenceLegoId);
        if (!_.isEmpty(tempLego)) {
          refparam.lId = tempLego.legoId;
          refparam.lLvl = tempLego.legoLevel;
          refparam.mode = tempLego.mode;
          refparam.pId = tempLego.pId;
          refparam.pos = tempLego.pos;
        }
      }
    }
    // var par;
    // this.queryparams.lId =lId;this.queryparams.lLvl =lLvl;this.queryparams.pos = pos;par.mode = mode; 
    if (path == '/search') {
      if (this.searchstring == null || this.searchstring == undefined || this.searchstring == "") {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Enter the text or id For search." });
        return false;
      }
      this.queryparams.str = this.searchstring;
      var newparams: any = {};
      if (!_.isEmpty(this.SelectedModule)) {
        newparams.params = this.SelectedModule.params;
      }
      else {
        newparams = this.globalSelectedModule;
      }
      newparams.params.t = param;
      newparams.params.str = this.searchstring;
      if (!_.isEmpty(this.SelectedModule)) {
        if (this.SelectedModule.referenceLegoId > 0) {
          _.merge(newparams.params, refparam);
        }
      }
      if (window.location.hash.indexOf("workflow") > 0 && this.isIE11 && this.queryparams.t == "tasks" && path.indexOf('workflow') < 0) {
        this.IERedirectRequired = true;
      }
      else {
        this.IERedirectRequired = false;
      }
      this.ngZone.run(() => {
        this.router.navigate([path], { queryParams: newparams.params });
      });
      // if(this.IERedirectRequired == true && this.isIE11){
      //   console.log("IERedirectRequired");
      //   setTimeout(() => {
      //     location.reload();
      //   }, 1000);
      // }

      return;
    }

    if (this.SelectedModule == undefined) {
      var newparams = this.queryparams;
      newparams.t = param;
      // if(this.SelectedModule.referenceLegoId > 0){
      //   _.merge(newparams, refparam);
      // }
      this.router.navigate([path], { queryParams: newparams });
    }
    else {
      var newparams: any = {};
      if (!_.isEmpty(this.SelectedModule)) {
        newparams.params = this.SelectedModule.params;
      }
      else {
        newparams = this.globalSelectedModule;
      }
      if (this.queryparams.mode == 'T') {
        //var newparams = this.globalSelectedModule;
        newparams.params.t = param;
        if (!_.isEmpty(this.SelectedModule)) {
          if (this.SelectedModule.referenceLegoId > 0) {
            _.merge(newparams.params, refparam);
          }
        }
        this.router.navigate([path], { queryParams: newparams.params });
      }
      else {
        //var newparams = _.clone(this.globalSelectedModule.params);        
        newparams.params.t = param;
        if (!_.isEmpty(this.SelectedModule)) {
          if (this.SelectedModule.referenceLegoId > 0) {
            _.merge(newparams.params, refparam);
          }
        }
        this.router.navigate([path], { queryParams: newparams.params });
      }
    }


  }

  // assignActity(type: string): void {
  //   //var newwindow = window.open('/src/assets/Intellimodule_User_Manual.pdf');

  //    window.open('/src/assets/Intellimodule_User_Manual.pdf');

  // }

  Assessmentmenu() {
    var lId, lLvl, pos, mode;
    // this.router.routerState.root.queryParams.subscribe((params: Params) => {
    //   this.queryparams.lId = params['lId'];
    //   this.queryparams.pId = params['pId'];
    //   this.queryparams.lLvl = params['lLvl'];
    //   this.queryparams.pos = params['pos'];
    //   this.queryparams.mode = params['mode'];
    //   this.queryparams.t = params['t'];
    //   if (this.queryparams.mode == "E") {
    //     this.detailsDefaultRedirection = "stab_details_processinfo";
    //   }
    //   else {
    //     this.detailsDefaultRedirection = "stab_details_uemplist";
    //   }
    //   this.hideOnEmployeeNavigation();
    // });
    if (this.queryparams.mode == "E") {
      this.detailsDefaultRedirection = "stab_details_processinfo";
      this.assessment_sub_tab.Strength = "Areas Needing Improvement";
      this.assessment_sub_tab.Weaknesses = "Achievement of Goals";
      this.assessment_sub_tab.Opportunities = "Performance Objectives";
      this.assessment_sub_tab.Threats = "Peer Feedback";

      this.details_sub_tab.stab_details_processinfo = "Employee Information";
      this.details_sub_tab.stab_details_uemplist = " Employee List";
      this.details_sub_tab.stab_details_managefiltertags = "Manage Filter Tags";
      this.details_sub_tab.stab_details_changelogs = "Change Log";
      this.details_sub_tab.stab_details_submchangelogs = "Job Description";
      this.details_sub_tab.stab_details_accessrights = "Competencies and Skills";
    }
    else {
      this.detailsDefaultRedirection = "stab_details_uemplist";
      this.assessment_sub_tab.Strength = "Strength";
      this.assessment_sub_tab.Weaknesses = "Weaknesses";
      this.assessment_sub_tab.Opportunities = "Opportunities";
      this.assessment_sub_tab.Threats = "Threats";

      this.details_sub_tab.stab_details_processinfo = "Process Information";
      this.details_sub_tab.stab_details_uemplist = " Unit Employee List";
      this.details_sub_tab.stab_details_managefiltertags = "Manage Filter Tags";
      this.details_sub_tab.stab_details_changelogs = "Change Log";
      this.details_sub_tab.stab_details_submchangelogs = "Submodule Change Log";
      this.details_sub_tab.stab_details_accessrights = "Access Rights";
    }
    this.hideOnEmployeeNavigation();
  }
  public getcpDefaultValue() {
    this.CommonAppService.getCpDefaults({}).then((res) => {
      if (res.status == 1) {
        this.cpDefaultValue = res.result;
        this.inactiveTimeoutValue = res.result.upTimeout || 30;
      }
      //console.log("cpDefaultValue", res);
    });
  }
  public handleInactivityCallback() {
    this.ConfirmationService.confirm({
      header: "Your session has expired",
      message: 'Your session has expired. Do you want extend the session time?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

      },
      reject: () => {
        this.nextTick(() => {
          $("#app_main_container").html("");
          this.CommonAppService.logOut("");
        });
      }
    });

    // $("#session_expireId").show();
    // setTimeout(e => {
    //   $("#app_main_container").html("");
    //   this.CommonAppService.logOut("");
    // }, 6000);

    // Sign out current user or display specific message regarding inactivity
    //this.ScreenBlocked = true;
    //Automatically logout the application
    // this.CommonAppService.logOut("");
    // this.router.navigate(['/user-login']);
  }
  public redirectToLogin() {
    this.CommonAppService.logOut("");
    this.router.navigate(['/user-login']);
  }
  public SavePinmodule(pinmoduleElement) {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var req = {
      moduleId: this.selectedModuleId,
      modelId: this.selectedModelId,
      employeeId: (this.employeeId != null && this.employeeId != undefined) ? this.employeeId : 0,
      companyId: (this.companyId != null && this.companyId != undefined) ? this.companyId : 0,
      pinModuleUrl: location.href,
    };
    if (!_.isEmpty(req)) {
      this.messageService.clear();
      var errorMsg = "";
      var errorstate = "";

      this.CommonAppService.saveUpdatePinmodule(req)
        .then(data => {
          switch (data.message) {
            case "1":
              errorstate = "success";
              errorMsg = "Pin module saved successful.";
              break;
            case "2":
              errorstate = "success";
              errorMsg = "Module Unpined successfully.";
              break;
            case "3":
              errorstate = "error";
              errorMsg = "Pin module saved failed.";
              break;
            case "4":
              errorstate = "error";
              errorMsg = "Somthing went to wrong!";
              break;
            default:
              break;
          }
          if (data.status == 1) {
            if (data.message == "1") {
              pinmoduleElement.click();
            }
          }
          this.messageService.add({ severity: errorstate, summary: errorstate, detail: errorMsg });
        });
    }
  }

  openChatPanel() {
    if (!this.loadChatComponent) {
      this.loadChatComponent = true;
    }
    this.chatbar_display = true;
  }
  initChatServices() {
    this.DbGroupService.init();
    // setTimeout(() => {
    //   var req = {
    //     toId: this.employeeId,
    //     messageType: 0
    //   };
    //   this.DbGroupService.getunreadPvtMsgCount(req)
    //     .then((res: any) => {
    //       if (res.status == 1) {
    //         console.log("unread count", res);
    //         //unreadMsgCount
    //         this.unreadPvtMsgCountData = res.result;
    //         this.formatUnreadCount();
    //       }
    //     }, error => {
    //       console.log("Error Happend");

    //     });
    // }, 3000);
    this.nextTick(() => {
      var req = {
        toId: this.employeeId,
        messageType: 0
      };
      this.DbGroupService.getunreadPvtMsgCount(req)
        .then((res: any) => {
          if (res.status == 1) {
            console.log("unread count", res);
            //unreadMsgCount
            this.unreadPvtMsgCountData = res.result;
            this.formatUnreadCount();
          }
        }, error => {
          console.log("Error Happend");

        });
    });
  }
  formatUnreadCount() {
    var ucount = _.sumBy(this.unreadPvtMsgCountData, function (o) { return o.unreadcount; }) || 0;
    if (ucount > 0) {
      this.unreadMsgCount = ucount
      //this.cd.detach();
      // setTimeout(() => {
      //   if (this.cd !== null &&
      //     this.cd !== undefined &&
      //     !(this.cd["ChangeDetectorRef"])) {
      //     this.cd.detectChanges();
      //   }
      // }, 250);
      this.nextTick(() => {
        if (this.cd !== null &&
          this.cd !== undefined &&
          !(this.cd["ChangeDetectorRef"])) {
          this.cd.detectChanges();
        }
      });
    }
    else {
      this.unreadMsgCount = 0;
    }
  }
  formatSingleUnreadCount(countData) {
    var user = _.find(this.unreadPvtMsgCountData, function (o) { return o.fromId == countData.fromId; });
    if (!_.isEmpty(user)) {
      user.unreadcount += 1;
      //this.cd.detach();
      // setTimeout(() => {
      //   if (this.cd !== null &&
      //     this.cd !== undefined &&
      //     !(this.cd["ChangeDetectorRef"])) {
      //     this.cd.detectChanges();
      //   }
      // }, 250);
    }
    else {
      this.unreadMsgCount = 0;
    }
  }
  hideOnEmployeeNavigation() {
    //     $("#main_tab_holder").show();
    //     $("#stab_details_processinfo").show();
    //     $("#stab_details_managefiltertags").show();
    //     $("#stab_details_changelogs").show();
    //     $("#stab_details_submchangelogs").show();
    //     $("#stab_details_accessrights").show();
    if (!_.isEmpty(this.moduleTabset)) {
      if (this.moduleTabset.tabs.length > 0) {
        if (this.queryparams['mode'] == "E") {
          if (this.queryparams['t'] != "stab_details_uemplist") {
            this.moduleTabset.tabs[0].disabled = true;
            this.moduleTabset.tabs[1].disabled = true;
            this.moduleTabset.tabs[2].disabled = true;
            // this.moduleTabset.tabs[3].disabled=true;
            this.moduleTabset.tabs[9].disabled = false;
            var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
            var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
            if (this.userinfo.EmployeeId == selectedempId || this.userinfo.EmployeeId == managerId) {
              this.moduleTabset.tabs[9].disabled = false;
              if (this.userinfo.EmployeeId == selectedempId) {
                this.changelogPermission = true;
              }
              else
                this.changelogPermission = false;
            }
            else {
              this.moduleTabset.tabs[9].disabled = true;
              this.changelogPermission = false;
            }
          }
          else {
            this.moduleTabset.tabs[0].disabled = false;
            this.moduleTabset.tabs[1].disabled = false;
            this.moduleTabset.tabs[2].disabled = false;
            this.moduleTabset.tabs[9].disabled = true;
            this.moduleTabset.tabs[3].disabled = false;
            this.changelogPermission = false;
          }
          $('body').removeClass('sidebar-fixed');
          $("#customsidebar").addClass("d-none");
          $("#sidemenuHolder").addClass("d-none");
          $("#pinmodule_tag").hide();
        }
        else if (this.queryparams['mode'] == "D") {
          $("#pinmodule_tag").hide();
          this.changelogPermission = false;
        }
        else {
          $("#main_tab_holder").show();
          this.moduleTabset.tabs[0].disabled = false;
          this.moduleTabset.tabs[1].disabled = false;
          this.moduleTabset.tabs[2].disabled = false;
          this.moduleTabset.tabs[9].disabled = true;
          this.moduleTabset.tabs[3].disabled = false;
          this.changelogPermission = true;
          $('body').addClass('sidebar-fixed');
          $("#customsidebar").removeClass("d-none");
          $("#sidemenuHolder").removeClass("d-none");
          $("#pinmodule_tag").show();
        }
      }
    }

  }

  Exit_processInfo() {
    // $('body').addClass('sidebar-fixed');
    // $("#customsidebar").removeClass("d-none");
    this.router.navigate(['/home']);
  }
}
