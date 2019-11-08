import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormArray, ValidatorFn, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { MenuItem } from 'primeng/api';
import * as $ from 'jquery';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

import { MessageService } from 'primeng/components/common/messageservice';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { AppConstant } from '../../../app.constant';
import { FilterTagService } from '../../../services/appservices/userpanelservices/filtertag.service';
import { DetailsService } from '../../../services/appservices/userpanelservices/details.service';
import { ConfirmationService } from 'primeng/api';
import { component_config } from '../../../_config';
import * as moment from 'moment';
import { ListModuleModel1 } from '../../../views/user-panel/sub-module/list.moduleModel';
import { ModuleService } from '../../../services/module.services';
import { Subject } from 'rxjs/Subject';

import { CommonAppService } from '../../../services/appservices/common-app.service';
import { MasterService } from '../../../services/master.service';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import * as appSettings from '../../../../assets/constant.json';
import { EmployeeService } from '../../../services/appservices/employee.service';
import { Input } from '@angular/compiler/src/core';
import { DataTable } from 'primeng/components/datatable/datatable';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  private _subscriptions = new Subscription();
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  @ViewChild('addTag') foc_text: ElementRef;
  @ViewChild('input') myInputVariable: ElementRef;
  @ViewChild("ckeditor") ckeditor: any;
  @ViewChild(DataTable) dataTableComponent: DataTable;
  @ViewChild(Table) pTableComponent: Table;
  appSettings: any = appSettings;
  api_url = "";
  photoPath = "";
  oneAtATime: boolean = true;
  modal: any;
  btn: any;
  span: any;
  display: boolean = false;
  config;
  test: boolean = false;
  value: string = "Details";
  items: MenuItem[];
  show_user_rights: boolean = false;
  show_group_rights: boolean = false;
  group_rights: boolean = false;
  selected1: boolean = false;
  public querystring;
  rights: any;
  public queryparams: any = [];
  userinfo: any = [];
  selectedModel = 0;
  details_sub_tab: any = {};

  //////// FILTER TAG //////////
  filter_dialog: boolean = false;
  filter: any;
  filtertag: any = [];
  filtertag_temp: any = [];
  tagName: any;
  filter_dialog_header: any;
  process_info: any = {};
  filtertag_test: any = [];
  empfiltertag: any = [];
  ////////// TAB CHANGE LOG ////////
  tabchangelog_list: any = [];
  modulechangelog_list: any = [];
  modulechangelog_list_temp: any = [];
  public dotnetDateFormat = AppConstant.API_CONFIG.DATE.dotnetDateFormat;
  public date_dispayformat: any = [];
  public treeModules = [];
  /////// UNIT EMPLOYEE LIST /////////////////
  unit_emp_list: any = [];
  employee_list: any = [];
  tempselectedparticipated = [];
  temp_participatedEmployees = [];
  jobdesc: any = [];
  jobdesc_temp: any = [];
  show_owner_dialog: boolean = false;
  selectedowner = [];
  subscription: Subscription;
  public ModuleTreeItems: ListModuleModel1[] = [];
  ModuleTreeItems1: ListModuleModel1[] = [];
  public ModuleTreeItems_popup: any = [];
  private subject = new Subject<any>();
  private emp_info: any = {};
  empCategoryList: any = [];
  empCategoryListDropdown: any;
  empshow: boolean = true;

  /////////////ACCESS RIGHTS//////////////
  group_list: any = [];
  groupAccess_list: any = [];
  clone_groupAccess_list: any = [];
  selectedMenu: any = 'Module Rights';
  readonly: any;
  unrestricted: any;
  restricted: any;
  selectedTab: any = 'Module Rights';
  selectedgroup: any = [];
  userAccess_list: any = [];
  tempselectedgroup = [];
  rightsIdName: any;
  rightsTableName: any;

  tempparticipatedemp: any = [];
  alreadyExistUser: any = [];

  options = ['ID', 'Name'];
  selected;

  tabrights: any = [];
  emp_info_temp: any = {};
  unit_emp_list_clone: any = [];

  subscription1: Subscription;
  userPhoto: any;
  photosizeLimit = 102400;//102 kb
  photoDimLimit = 600;//600 pixels 

  ////EMPLOYEE INFO////
  stateList: any = [];
  employeeFormErrorObj: any = {};
  employeeForm: FormGroup;
  blockSpecial: RegExp = /^[^<>*!]+$/;
  allownumberalphaspance: RegExp = /^[\w\s]+$/;
  alphawithspance: RegExp = /^[a-zA-Z ]*$/;
  private paramsSubscription: Subscription;
  checkrights: any = [];
  hasRights: boolean = true;
  hasReadOnly: boolean = true;
  selectedstateSuggestion: any;
  istabvisible: boolean = true;
  public isRefModule = false;
  grouprights: string = "UnRestricted";
  emp_filter_txt = "";
  constructor(private router: Router, private LocalStorageService: LocalStorageService, public ModuleService: ModuleService, private formBuilder: FormBuilder
    , private MessageService: MessageService, private FilterTagService: FilterTagService, private confirmationService: ConfirmationService
    , private DetailsService: DetailsService, private CommonAppService: CommonAppService, private MasterService: MasterService, private cd: ChangeDetectorRef
    , private _DomSanitizationService: DomSanitizer, private EmployeeService: EmployeeService) {
    this.config = component_config.cktool_config_full;
    this.MessageService.clear();
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    this.isRefModule = this.ModuleService.checkIsRefmodule();
    this.api_url = this.appSettings.API_ENDPOINT;
    this.photoPath = this.api_url + AppConstant.API_CONFIG.API_URL.photoPath;
    this.photosizeLimit = AppConstant.API_CONFIG.API_URL.photosizeLimit;
    this.photoDimLimit = AppConstant.API_CONFIG.API_URL.photoDimLimit;
    this.getStateList();
    if (this.empCategoryList.length == 0) {
      this.getEmpCategoryList();
    }

    this.initializeFormData();
    this.subscribeOninit();
    var lId, lLvl, pos, mode;
    this.getTreeModules();
    //this.activateModuleTabs(this.queryparams.t);
    //this.filterTagList();
    //this.GetTabChangeLog();
    //this.UnitEmployeeList(); 
    //this.getProcessInfo();  
    this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this._subscriptions.add(
      this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
        this.date_dispayformat.date_Format = preferencesettings.date_Format;
        if (this.queryparams.t == "stab_details_changelogs") {
          this.GetTabChangeLog('Tabchangelog');
        }
        else if (this.queryparams.t == "stab_details_submchangelogs") {
          if (this.queryparams.t != 'E') {
            this.GetTabChangeLog('Modulechangelog');
          }
        }
      }));
  }
  subscribeOninit() {
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.hideOnEmployeeNavigation();
      this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.CommonAppService.checkPinmodule();

      if (params['mode'] == "E" || params['mode'] == "D") {
        $("#pinmodule_tag").hide();
      }
      else {
        $("#pinmodule_tag").show();
      }
      //this.UnitEmployeeList();
      this.detailsmenu();
      this.showHideMenu(open);
      //this.getProcessInfo();
      if (params['t'] == "stab_details_uemplist") {
        if (params['mode'] == 'E') {
          this.UnitEmployeeList();
          this.EmployeefilterTagList();
          $("#main_viewpoint").removeAttr("style");
          //this.istabvisible = false;
          $("#main_tab_container").show();
        }
        else {
          this.UnitEmployeeList();
          $("#main_tab_container").show();
          this.istabvisible = true;
        }
        //$("#main_tab_container").hide();
        $("#main_tab_container").show();
      }
      // else if (params['mode'] != 'E' && params['t'] == "stab_details_uemplist") {
      //   //this.getProcessInfo();
      //   //if (this.unit_emp_list.length == 0) {
      //     this.UnitEmployeeList();
      //   //}
      //   //this.filterTagList();
      //   $("#main_tab_container").show();
      // }
      else if (params['t'] == "stab_details_processinfo") {
        if (params['mode'] != 'E') {
          //this.UnitEmployeeList();
          this.getProcessInfo();
          //$("#main_tab_container").hide();
        }
        else {
          this.UnitEmployeeList();
          $("#main_tab_container").show();
        }
        this.istabvisible = true;
        $("#main_tab_container").show();
      }

      else if (params['t'] == "stab_details_accessrights") {
        if (params['mode'] != 'E') {
          this.getAllRights('TblModelRights', 'ModelRightsId');
          this.rightsIdName = 'ModelRightsId';
          this.rightsTableName = 'TblModelRights';
          this.items = [
            { icon: 'fa fa-angle-right', label: 'Module Rights', title: 'ModuleRights' },
            { icon: 'fa fa-angle-right', label: 'SubModule Tab Rights', title: 'ModuleRights' },
            { icon: 'fa fa-angle-right', label: 'Workflow Tab Rights', title: 'WorkflowRights' },
            { icon: 'fa fa-angle-right', label: 'Connection Tab Rights', title: 'ConnectionRights' },
            { icon: 'fa fa-angle-right', label: 'Documents Tab Rights', title: 'DocumentRights' },
            { icon: 'fa fa-angle-right', label: 'Strategy Tab Rights', title: 'StrategyRights' },
            { icon: 'fa fa-angle-right', label: 'Assessment Tab Rights', title: 'AssessmentRights' },
            { icon: 'fa fa-angle-right', label: 'Performance Tab Rights', title: 'PerformanceRights' },
            { icon: 'fa fa-angle-right', label: 'Collaboration Tab Rights', title: 'CollaborationRights' },
            { icon: 'fa fa-angle-right', label: 'Details Tab Rights', title: 'DetailsRights' },
          ];
          this.selectedMenu = this.items[0];
          //this.selectedMenu = this.items[0];
          $("#main_tab_container").show();
        }
        else {
          $("#main_tab_container").show();
        }
        this.istabvisible = true;
        $("#main_tab_container").show();
      }
      else if (params['t'] == "stab_details_changelogs") {
        this.GetTabChangeLog('Tabchangelog');
        $("#main_tab_container").show();
        this.istabvisible = true;
      }
      else if (params['t'] == "stab_details_submchangelogs") {
        this.istabvisible = true;
        if (params['mode'] != 'E') {
          this.GetTabChangeLog('Modulechangelog');
          $("#main_tab_container").show();
        }
        else {
          //$("#main_tab_container").hide();
          $("#main_tab_container").show();
        }
        // else{
        //   this.UnitEmployeeList();
        // }
        //$("#main_tab_container").show();
        this.istabvisible = true;
      }
      else if (params['t'] == "stab_details_managefiltertags") {
        if (params['mode'] != 'E') {
          $("#main_tab_container").show();
        }
        else {
          //$("#main_tab_container").hide();
          // $('#empname').remove();
          // $(".breadscrumb_mainMod_title2").append("<span id='empname' class='breadscrumb_mainMod_title2' style='float:right'> "+">>" + selectedEmpname + '</span>');

          $("#main_tab_container").show();
        }
        this.filterTagList();
        this.istabvisible = true;
      }
      else {
        $("#main_tab_container").show();
        this.istabvisible = true;
      }
      this.activateModuleTabs(this.queryparams.t);
    }));
    this.subscription = this.ModuleService.getModuleUpdates().subscribe(updates => {
      this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      this.getTreeModules();
    });
    this.subscription = this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
      this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      if (updates.treeModules) {

        this.ModuleTreeItems = null;

        if (updates.treeModules.cType == 'D') {

          this.ModuleTreeItems = _.cloneDeep(updates.treeModules);
        }
        this.filterTagList();
      }
    });
  }
  onSelect(data: TabDirective): void {
    //this.value = this.details_sub_tab[this.queryparams.t];
    this.value = data.heading;
    // this.dataTableComponent.reset();
    // this.pTableComponent.reset();

    if (this.value == undefined || this.value == null) {
      // this.value = data['currentTarget'].id;
      this.querystring = data['currentTarget'].id;
    }
    else {
      this.querystring = data.id;
      this.resetTable();
    }

    //this.querystring = this.queryparams.t;
    if (this.querystring == undefined || this.querystring == null) {
      this.querystring = "stab_details_processinfo";

    }
    var newparams = this.queryparams;
    newparams.t = this.querystring;
    if (newparams.mode == 'E' && newparams.t == 'stab_details_uemplist') {
      //this.istabvisible = false;
      this.istabvisible = true;
    }
    else {
      this.istabvisible = true;
    }
    this.router.navigate(["/details"], { queryParams: newparams });
    //setTimeout(() => this.activateModuleTabs(this.querystring), 250);
    this.activateModuleTabs(this.querystring);

  }
  // ngOnDestroy() {
  //   //console.log("Component will be destroyed");
  //   this.paramsSubscription.unsubscribe();
  // }

  resetTable() {
    this.dataTableComponent.reset();
    this.pTableComponent.reset();
    $("#test_txt").val("");
    $("#test_txt").focus();
    this.emp_filter_txt = "";
  }
  checkRights() {
    this.checkrights = this.ModuleService.getModuleRights();
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.mode == 'E') {
        this.hasRights = true;
      }
      else if (this.queryparams.mode != 'E' && (this.checkrights.detailsRights != 'Restricted' && this.checkrights.modelRights != 'Restricted')) {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
    }

    //console.log("rights check", this.checkrights)
  }

  ngOnInit() {
    this.initSubscribe();
    var selectedempid = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
    if (selectedempid != this.userinfo.EmployeeId && managerId != this.userinfo.EmployeeId) {
      //this.empshow = false;
      this.hasReadOnly = false;
    }
    else {
      //this.empshow = true;
      this.hasReadOnly = true;
    }
  }
  initSubscribe() {
    this._subscriptions.add(
      this.ModuleService.getModuleRightsUpdate().subscribe(rights => {
        this.checkrights = rights;
        this.isRefModule = this.ModuleService.checkIsRefmodule();
        this.checkRights();
      })
    );
    this.checkrights = this.ModuleService.getModuleRights();
    this.checkRights();
  }
  ngOnDestroy() {
    //console.log("Component will be destroyed");
    //this.paramsSubscription.unsubscribe();
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }

  showDialog() {
    this.tempselectedparticipated = this.unit_emp_list;
    this.temp_participatedEmployees = _.cloneDeep(this.unit_emp_list);
    this.resetTable();
    this.getAllEmployee('emplist');
  }
  setPhoto(photo) {
    var icon_img = (photo == null || photo == "") ? 'no-image.png' : photo;
    //this.userPhoto = this._DomSanitizationService.bypassSecurityTrustResourceUrl(this.photoPath + icon_img);
    //this.myInputVariable.nativeElement.value = "";
  }

  // ngOnInit() {

  //   //this.activateModuleTabs('test');


  //   // this.items = [
  //   //   { icon: 'fa fa-angle-right', label: 'Module Rights', title: 'ModuleRights' }, { icon: 'fa fa-angle-right', label: 'Module Tab Rights', title: 'ModuleRights' }, { icon: 'fa fa-angle-right', label: 'Strategy Tab Rights', title: 'StrategyRights' },
  //   //   { icon: 'fa fa-angle-right', label: 'Workflow Tab Rights', title: 'WorkflowRights' }, { icon: 'fa fa-angle-right', label: 'Documents Tab Rights', title: 'DocumentRights' },
  //   //   { icon: 'fa fa-angle-right', label: 'Assessment Tab Rights', title: 'AssessmentRights' }, { icon: 'fa fa-angle-right', label: 'Performance Tab Rights', title: 'PerformanceRights' }, { icon: 'fa fa-angle-right', label: 'Details Tab Rights', title: 'DetailsRights' },
  //   //   { icon: 'fa fa-angle-right', label: 'Connection Tab Rights', title: 'ConnectionRights' }, { icon: 'fa fa-angle-right', label: ' Collaboration Tab Rights', title: 'CollaborationRights' },

  //   // ];
  //   // this.selectedMenu = this.items[0];
  // }
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + 2
    );
    if ($("body").hasClass("pinmodule")) {
      res_h += 96;
    }
    //  sub tabs class: sub_tab_container
    var inner_res_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 60);
    var tabcontent_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 10);

    $('.main_ckeditor .cke_inner > .cke_contents').each(function () {
      var ck_res_h = inner_res_h - 75;
      $(this).css("height", ck_res_h + "px");
    });
    $("#details-pg .tab-content").css("height", (tabcontent_h) + "px");
    $("#details-pg .child_tabcontent").each(function () {
      $(this).css("height", (tabcontent_h - 25) + "px");
    });
    var innertable = ((tabcontent_h) || 500);
    $("#changelog_table .ui-datatable-scrollable-body").css("max-height", (innertable - 120 || 500) + "px");
    $("#submodule_changelog .ui-datatable-scrollable-body").css("max-height", (innertable - 120 || 500) + "px");
    $("#submodule_changelog .ui-tree.ui-widget").css({ "max-height": (innertable - 120 || 500) + "px", "overflow": "auto", "width": "95%" });
    $("#details_uemplist .ui-table-scrollable-body").css({ "max-height": (innertable - 180 || 500) + "px", "overflow": "auto", "width": "100%" });



  }

  detailsmenu() {
    if (this.queryparams.mode == 'E') {
      this.details_sub_tab.stab_details_processinfo = "Employee Information";
      this.details_sub_tab.stab_details_uemplist = "Employee List";
      this.details_sub_tab.stab_details_managefiltertags = "Manage Filter Tags";
      this.details_sub_tab.stab_details_changelogs = "Change Log";
      this.details_sub_tab.stab_details_submchangelogs = "Job Description";
      this.details_sub_tab.stab_details_accessrights = "Competencies and Skills";
    }
    else {
      this.details_sub_tab.stab_details_processinfo = "Process Information";
      this.details_sub_tab.stab_details_uemplist = "Employee List";
      this.details_sub_tab.stab_details_managefiltertags = "Manage Filter Tags";
      this.details_sub_tab.stab_details_changelogs = "Change Log";
      this.details_sub_tab.stab_details_submchangelogs = "Submodule Change Log";
      this.details_sub_tab.stab_details_accessrights = "Access Rights";
    }
    //this.activateModuleTabs(this.queryparams.t);
  }

  ///////////////  FILTER TAG START ////////////////////////

  filterTagList() {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.MessageService.clear();
    var empId, assignedId;

    if (this.queryparams.mode != 'E') {
      empId = 0;
      assignedId = 0;
    }
    else {
      empId = this.userinfo.EmployeeId;
      //assignedId = localStorage.getItem("imodzUP-empinfoid");
      assignedId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    }
    var req = {
      EmpId: empId,
      ownerId: this.userinfo.EmployeeId,
      CompanyId: this.userinfo.CompanyId,
      LegoTagType: this.queryparams.mode,
      ModelId: this.selectedModel,
      LegoId: this.queryparams.lId,
      assignedId: assignedId
    };
    this.FilterTagService.GetFilterTag(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              //this.filtertag = res.result.filterList;
              var result = res.result;
              this.filtertag = result.filterList;
              var filterModel = result.filterModel;
              if (this.queryparams.mode == 'E') {
                this.filtertag_test = this.filtertag;
                this.filtertag_test = _.forEach(this.filtertag, (f) => {
                  _.forEach(filterModel, (m) => {
                    if (f.legoTagId == m.legoTagId && m.assignedId == assignedId) {
                      f.tagSelect = m.tagSelect;
                      f.empId = m.empId;
                      f.legoId = m.legoId;
                      return f;
                    }
                  })
                })
                console.log("filter tag result", this.filtertag_test);
                this.filtertag = this.filtertag_test;
              }
              else {
                var m1 = _.forEach(this.filtertag, (f) => {
                  _.forEach(filterModel, (m) => {
                    if (f.legoTagId == m.legoTagId && m.legoId == this.queryparams.lId) {
                      f.tagSelect = m.tagSelect;
                      f.empId = m.empId;
                      f.legoId = m.legoId;
                    }
                    else {
                      //f.tagSelect = false;
                      f.empId = empId;
                      f.legoId = this.queryparams.lId;
                    }
                    return f;
                  })

                })
              }


            }
            else {
              //this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
              this.filtertag = [];
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }


  showFilter_Dialog(add) {
    this.MessageService.clear();

    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.tagName = null;
    this.filter = add;
    this.filter_dialog_header = "Add Filter Tag";
    this.filter_dialog = true;
    setTimeout(() => {
      $("#addTag").focus();
    }, 200);
  }

  showFilter_Dialog_edit(editTag, update) {
    this.MessageService.clear();
    setTimeout(() => {
      $("#addTag").focus();
    }, 200);
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.filter_dialog_header = "Edit Filter Tag";
    this.filter = update;
    this.tagName = editTag.legoTag;
    this.filtertag_temp = editTag;
    this.filter_dialog = true;
  }

  isCheckedTag(editTag, update) {

    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.filterTagList();
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    //this.MessageService.clear();
    this.filter = update;
    this.filtertag_temp = editTag;
    this.filtertag_temp.legoId = this.queryparams.lId;
    this.filtertag_temp.modelId = this.selectedModel;
    this.AddUpdateFiltertags(editTag.legoTag);
  }

  // FilterModules(filter) {
  //   //console.log("filter: ", filter);
  //   this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, filter.legoId);
  //   var selectedmodel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
  //   if (selectedmodel != filter.modelId) {
  //     this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel, filter.modelId);
  //     this.ModuleService.setModules();
  //   }
  //   else {
  //     var item = this.ModuleService.getModule(filter.legoId);
  //     //this.changeModule(item);
  //   }

  // }

  AddUpdateFiltertags(tagName) {
    this.MessageService.clear();
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (tagName == undefined || tagName == null || tagName == "") {
      this.MessageService.add({ severity: 'error', summary: 'Info', detail: "Please Enter Filter Tag Name" });
      return;
    }
    var empId, assignedId;
    if (this.filtertag_temp.empId == undefined || this.filtertag_temp.empId == null) {
      this.filtertag_temp.empId = 0;
    }
    if (this.queryparams.mode != 'E') {
      empId = 0;
      assignedId = 0;
    }
    else {
      empId = this.userinfo.EmployeeId;
      //assignedId = localStorage.getItem("imodzUP-empinfoid");
      assignedId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    }
    var UserId = this.userinfo.EmployeeId;
    var req = {};
    if (this.filter == 'Add') {
      req = {
        EmpId: empId,
        ownerId: this.userinfo.EmployeeId,
        CompanyId: this.userinfo.CompanyId,
        LegoTagType: this.queryparams.mode,
        Position: 0,
        LegoId: this.queryparams.lId,
        ModelId: this.selectedModel,
        LegoTag: tagName,
        TagSelect: 0,
        LegoTagDesc: '',
        LegoTagId: 0,
        UserId: UserId,
        assignedId: assignedId
      };
    }
    else if (this.filter == 'update') {
      this.filtertag_temp.legoTag = tagName;
      req = {
        TagId: this.filtertag_temp.tagId,
        //EmpId: this.filtertag_temp.empId,
        ownerId: this.userinfo.EmployeeId,
        EmpId: empId,
        CompanyId: this.filtertag_temp.companyId,
        LegoTagType: this.filtertag_temp.legoTagType,
        Position: this.filtertag_temp.position,
        LegoId: this.filtertag_temp.legoId,
        ModelId: this.filtertag_temp.modelId,
        LegoTag: this.filtertag_temp.legoTag,
        TagSelect: this.filtertag_temp.tagSelect,
        LegoTagDesc: this.filtertag_temp.legoTagDesc,
        LegoTagId: this.filtertag_temp.legoTagId,
        UserId: UserId,
        assignedId: assignedId
      };
    }

    this.FilterTagService.AddUpdateFilterTag(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              this.filtertag = result.filterList;
              var filterModel = result.filterModel;
              if (this.queryparams.mode == 'E') {
                this.filtertag_test = this.filtertag;
                this.filtertag_test = _.forEach(this.filtertag, (f) => {
                  _.forEach(filterModel, (m) => {
                    if (f.legoTagId == m.legoTagId && m.assignedId == assignedId) {
                      f.tagSelect = m.tagSelect;
                      f.empId = m.empId;
                      f.legoId = m.legoId;
                      return f;
                    }
                  })
                })
                console.log("filter tag result", this.filtertag_test);
                this.filtertag = this.filtertag_test;
              }
              else {
                var m1 = _.forEach(this.filtertag, (f) => {
                  _.forEach(filterModel, (m) => {
                    if (f.legoTagId == m.legoTagId && m.legoId == this.queryparams.lId) {
                      f.tagSelect = m.tagSelect;
                      f.empId = m.empId;
                      f.legoId = m.legoId;
                    }
                    else {
                      //f.tagSelect = false;
                      f.empId = empId;
                      f.legoId = this.queryparams.lId;
                    }
                    return f;
                  })

                })
              }

              this.tagName = null;
              this.filter_dialog = false;
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
              this.filter_dialog = false;
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })

    //this.filter_dialog = false;
  }

  delete_filter(tag) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var empId, assignedId;
    if (this.queryparams.mode != 'E') {
      empId = 0;
      assignedId = 0;
    }
    else {
      empId = this.userinfo.EmployeeId;
      //assignedId = localStorage.getItem("imodzUP-empinfoid");
      assignedId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var req = {
          TagId: tag.tagId,
          EmpId: tag.empId,
          CompanyId: tag.companyId,
          LegoTagType: this.queryparams.mode,
          Position: tag.position,
          LegoId: tag.legoId,
          LegoTag: tag.legoTag,
          TagSelect: tag.tagSelect,
          LegoTagId: tag.legoTagId,
          ModelId: this.selectedModel,
          UserId: this.userinfo.EmployeeId,
          assignedId: assignedId
        };
        this.FilterTagService.DeleteFilterTag(req)
          .then(res => {
            if (res) {
              if (!_.isEmpty(res)) {
                if (res.status == 1) {
                  var result = res.result;
                  this.filtertag = result.filterList;
                  var filterModel = result.filterModel;
                  //this.filtertag = _.merge(this.filtertag, filterModel)
                  //console.log("Merge ", this.filtertag);
                  // var m1 = _.forEach(this.filtertag, (f) => {
                  //   _.forEach(filterModel, (m) => {
                  //     if (f.legoTagId == m.legoTagId && m.legoId == this.queryparams.lId) {
                  //       f.tagSelect = m.tagSelect;
                  //       f.empId = m.empId;
                  //       f.legoId = m.legoId;
                  //     }
                  //     else {
                  //       //f.tagSelect = false;
                  //       f.empId = empId;
                  //       f.legoId = this.queryparams.lId;
                  //     }
                  //     return f;
                  //   })

                  // })
                  if (this.queryparams.mode == 'E') {
                    this.filtertag_test = this.filtertag;
                    this.filtertag_test = _.forEach(this.filtertag, (f) => {
                      _.forEach(filterModel, (m) => {
                        if (f.legoTagId == m.legoTagId && m.assignedId == assignedId) {
                          f.tagSelect = m.tagSelect;
                          f.empId = m.empId;
                          f.legoId = m.legoId;
                          return f;
                        }
                      })
                    })
                    console.log("filter tag result", this.filtertag_test);
                    this.filtertag = this.filtertag_test;
                  }
                  else {
                    var m1 = _.forEach(this.filtertag, (f) => {
                      _.forEach(filterModel, (m) => {
                        if (f.legoTagId == m.legoTagId && m.legoId == this.queryparams.lId) {
                          f.tagSelect = m.tagSelect;
                          f.empId = m.empId;
                          f.legoId = m.legoId;
                        }
                        else {
                          //f.tagSelect = false;
                          f.empId = empId;
                          f.legoId = this.queryparams.lId;
                        }
                        return f;
                      })

                    })
                  }
                  this.tagName = null;
                  this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Deleted Successfully" });
                }
                else {
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                  return false;
                }

              }
              else {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
                return false;
              }
            }
          }, error => {
            //console.log("Error Happend");

          })
      },
      reject: () => {
        //this.msgs = [{ severity: 'info', summary: 'Rejected', detail: 'You have rejected' }];
      }
    });
  }

  ///////////////  FILTER TAG END ////////////////////////

  showDialog_user_rights() {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    // this.show_group_rights = false;
    // this.show_user_rights = true;
    // this.display = false;
    // this.show_owner_dialog = false;

    //this.tempselectedparticipated = this.unit_emp_list;
    //this.temp_participatedEmployees = _.cloneDeep(this.unit_emp_list);
   // this.getAllEmployee('group');
    this.getRightsUserList();
  }

  add_user_rights(tempparticipatedemp) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    // var NewlyAdded = _.filter(this.tempparticipatedemp, (d) => {
    //   var exist = _.find(this.userAccess_list, (d1) => {
    //     return (d1.employeeId != this.rightsIdName)
    //   });
    //   return (!_.isEmpty(exist))
    // });
    // _.forEach(this.tempparticipatedemp, (g) => {
    //   if (g.rightsId == undefined || g.rightsId == null) {
    //     g.rightsId = null;
    //     g.legoId = this.queryparams.lId;
    //     g.tab_Name = this.selectedMenu.title;
    //     g.rightsAdd = "Y";
    //     g.rightsEdit = "Y";
    //     g.rightsView = "Y";
    //     g.rightsDelete = "Y";
    //     g.unrestricted = "unrestricted";
    //   }

    // });
    var NewlyAdded = _.filter(this.tempparticipatedemp, (d) => {
      var exist = _.find(this.userAccess_list, (d1) => {
        return (d1.employeeId == d.employeeId)
      });
      return (_.isEmpty(exist))
    });
    var removedEmp = _.filter(this.userAccess_list, (d) => {
      var exist = _.find(this.tempparticipatedemp, (d1) => {
        return (d1.employeeId == d.employeeId && d.employeeId > 0)
      });
      return (_.isEmpty(exist))
    });
    if (!_.isEmpty(NewlyAdded)) {
      _.forEach(NewlyAdded, (em) => {
        var rights = {
          "rightsId": null,
          "legoId": this.queryparams.lId,
          "employeeId": em.employeeId,
          "rightsView": "N",
          "rightsAdd": "N",
          "rightsEdit": "N",
          "rightsDelete": "N",
          "restricted": "Restricted",
          "unrestricted": null, "readonly": null, "condition": null, "tblName": null,
          "rightsIdName": null,
          "companyId": null,
          "firstName": em.firstName,
          "lastName": em.lastName,
          "sav_flag": 0
        }
        this.userAccess_list.push(rights);
      });
    }
    this.userAccess_list = _.filter(this.userAccess_list, (d) => {
      var exist = _.find(removedEmp, (d1) => {
        return (d1.employeeId == d.employeeId && d.employeeId > 0)
      });
      return (_.isEmpty(exist))
    });
    // this.userAccess_list = _.uniqBy(this.tempparticipatedemp, function (e) {
    //   return e.employeeId;
    // });

    this.show_user_rights = false;
  }
  onChange(selected1, c) {
    this.selected1 = selected1;
    this.rights = c;

  }
  showDialog_group_rights(type) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (type == 'User') {
      //this.getUser(type)
    }
    else if (type == 'Group') {
      this.getGroupList(type);
    }
    //this.show_user_rights = false;
    //this.show_group_rights = true;
  }

  ngAfterViewInit() {
    // this.setElementAutoHeight(null);
    //this.activateModuleTabs("hasvalue");

    this.ModuleService.activateModuleTabs(this.queryparams);
    this.activateModuleTabs(this.queryparams.t);
    setTimeout(() => {
      if (this.cd !== null &&
        this.cd !== undefined &&
        !(this.cd["ChangeDetectorRef"])) {
        this.cd.detectChanges();
      }
    }, 250);
    //this.subscribeOninit()
    this.showHideMenu();

  }
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
    if (this.queryparams.mode == 'E') {
      //$("#main_tab_container").hide();
      this.hideOnEmployeeNavigation();
    }
    // if (this.queryparams.t == 'stab_details_uemplist' && this.queryparams.mode == 'E') {
    //   $("#main_tab_container").hide();
    // }
    else {
      $("#main_tab_container").show();
    }

    //this.activateModuleTabs(this.queryparams.t);
    // var querystring;
    // this.paramsSubscription.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
    //   this.querystring = params['t'];
    //   querystring = params['mode'];
    // }));

    // if (this.queryparams.t != 'stab_details_uemplist' && this.queryparams.mode == 'E') {
    //   $("#main_tab_container").show();
    // }
    // if (this.queryparams.t == 'stab_details_uemplist' && this.queryparams.mode == 'E') {
    //   $("#main_tab_container").hide();
    // }
    // else {
    //   $("#main_tab_container").show();
    // }

    // this.activateModuleTabs(this.queryparams.t);
    this.hideChangelogTab();
  }

  activateModuleTabs(hasvalue) {
    this.querystring = hasvalue;
    if (this.modulesubTabset) {
      // var activeTab = (this.querystring == 'stab_details_processinfo') ? 0 :
      //   (this.querystring == 'stab_details_uemplist') ? 1 :
      var activeTab = (this.querystring == 'stab_details_uemplist') ? 0 :
        (this.querystring == 'stab_details_processinfo') ? 1 :
          (this.querystring == "stab_details_managefiltertags") ? 2 :
            (this.querystring == "stab_details_changelogs") ? 3 :
              (this.querystring == "stab_details_submchangelogs") ? 4 :
                (this.querystring == "stab_details_accessrights") ? 5 : 0;

      if (this.modulesubTabset.tabs) {
        if (this.modulesubTabset.tabs.length > 0) {
          _.forEach(this.modulesubTabset.tabs, (t) => {
            // t.active = false;
            $("#" + t.id + "-link").removeClass("active");
            $("#" + t.id + "-link").parent(".nav-item").removeClass("active");
          });
          if (this.querystring == "stab_details_processinfo") {
            $("#stab_details_processinfo-link").addClass("active");
            $("#stab_details_processinfo-link").parent(".nav-item").addClass("active");
            if (this.queryparams.mode == 'E') {
              this.value = "Employee Information";
              this.queryparams.t = "stab_details_processinfo";
              if (this.modulesubTabset.tabs[activeTab] != undefined) {
                this.modulesubTabset.tabs[activeTab].active = true;
              }
            }
            else {
              // this.modulesubTabset.tabs[1].active = true;
              // this.value = this.modulesubTabset.tabs[1].heading;
              // this.queryparams.t = this.modulesubTabset.tabs[activeTab].id;
              $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").addClass("active");
              $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").parent(".nav-item").addClass("active");
              this.modulesubTabset.tabs[activeTab].active = true;
              this.value = this.modulesubTabset.tabs[activeTab].heading;
              this.queryparams.t = this.modulesubTabset.tabs[activeTab].id;
            }

          }
          else {
            if (this.modulesubTabset.tabs[activeTab]) {
              $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").addClass("active");
              $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").parent(".nav-item").addClass("active");
              this.modulesubTabset.tabs[activeTab].active = true;
              this.value = this.modulesubTabset.tabs[activeTab].heading;
              this.queryparams.t = this.modulesubTabset.tabs[activeTab].id;
              this.istabvisible = true;
            }

          }
          //this.router.navigate(["/details"], { queryParams: this.queryparams });
        }
      }
    }

    //this.modulesubTabset.tabs[activeTab].active = true;
  }

  ///////////////  TAB CHANGE LOG START ////////////////////////

  GetTabChangeLog(statementType) {
    var UserId;
    if (this.queryparams.mode == 'E') {
      UserId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    }
    else {
      UserId = this.userinfo.EmployeeId;
    }
    this.MessageService.clear();
    var req = {
      UserId: UserId,
      CompanyId: this.userinfo.CompanyId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: statementType
    };

    this.DetailsService.GetTabChangeLog(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {

              // _.forEach(res.result, (d) => {
              //   //d.dateTime = (d.dateTime != null && d.dateTime != "") ? moment(d.dateTime).format(this.dotnetDateFormat) : '';
              //   d.dateTime = (d.dateTime != null && d.dateTime != "") ? moment(d.dateTime).format(this.fulldatetimeformat) : '';
              // });
              if (statementType == 'Modulechangelog') {
                this.modulechangelog_list_temp = res.result;
                _.forEach(this.modulechangelog_list_temp, (m) => {
                  m.dateTime = moment(m.dateTime).format(this.date_dispayformat.date_Format);
                });

                var legoid = this.queryparams.lId;
                var parentid = this.queryparams.pId;

                var filterlog_list = _.cloneDeep(this.modulechangelog_list_temp);
                this.modulechangelog_list = _.cloneDeep(this.modulechangelog_list_temp);
                if (parentid == 0) {
                  this.modulechangelog_list_temp = filterlog_list;
                  this.modulechangelog_list = _.cloneDeep(this.modulechangelog_list_temp);
                  return;
                }
                if (parentid != 0) {
                  this.modulechangelog_list_temp = _.filter(filterlog_list, (f) => {
                    return (f.parentId == legoid)
                  })
                }
                else {
                  this.modulechangelog_list_temp = _.filter(filterlog_list, (f) => {
                    return (f.legoId == legoid)
                  })
                }

                this.modulechangelog_list = _.cloneDeep(this.modulechangelog_list_temp);
              }
              if (statementType == 'Tabchangelog') {
                this.tabchangelog_list = res.result;
                _.forEach(this.tabchangelog_list, (t) => {
                  t.dateTime = moment(t.dateTime).format(this.date_dispayformat.date_Format)
                })
              }

            }
            else {
              //this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
              this.tabchangelog_list = [];
              this.modulechangelog_list = [];
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  ///////////////  TAB CHANGE LOG END ////////////////////////

  ///////////////  UNIT EMPLOYEE LIST START ////////////////////////
  UnitEmployeeList() {
    //this.MessageService.clear();
    // if (this.queryparams.mode != 'E') {
    //   if (this.checkrights.detailsRights == 'Readonly') {
    //     this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
    //     return false;
    //   }
    // }
    var req = {
      UserId: this.userinfo.EmployeeId,
      CompanyId: this.userinfo.CompanyId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId
    };

    this.DetailsService.UnitEmployeeList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.unit_emp_list = res.result;
              this.unit_emp_list_clone = _.clone(this.unit_emp_list);

              // this.jobdesc = _.find(this.unit_emp_list, (d) => {
              //   return d.employeeId == this.userinfo.EmployeeId;
              // });
              // if(this.jobdesc == undefined || this.jobdesc == null)
              // {
              //   this.jobdesc = [];
              // }
              // this.jobdesc_temp = _.clone(this.jobdesc);
              //this.employeeInfo(this.jobdesc_temp)
              if (this.queryparams.t == "stab_details_processinfo" && this.queryparams.mode != 'E') {

                // this.employeeInfo(this.jobdesc_temp)
                //  this.userPhoto=this.jobdesc_temp.photo;
                //this.setPhoto(this.jobdesc_temp.photo);
              }
              else if (this.queryparams.t == "stab_details_processinfo" && this.queryparams.mode == 'E') {
                var m = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
                //var m = localStorage.getItem('imodzUP-empinfoid');
                if (m == null || m == undefined) {
                  m = this.userinfo.EmployeeId;
                }
                _.forEach(this.unit_emp_list, (d) => {
                  if (d.chkAddress == null || d.chkAddress == undefined || d.chkAddress == "") {
                    d.chkAddress = false;
                  }
                  // else if(d.chkAddress == "true"){
                  //   d.chkAddress = true;
                  // }
                  // else{
                  //   d.chkAddress = false;
                  // }
                })
                this.jobdesc = _.find(this.unit_emp_list, (d) => {
                  return d.employeeId == m;
                });

                this.jobdesc_temp = _.clone(this.jobdesc);
                var req1 = {
                  EmployeeId: this.jobdesc.employeeId,
                  CompanyId: this.userinfo.CompanyId,
                  Photo: this.jobdesc.photo
                };
                this.DetailsService.getUserPhotos(req1).then(res => {
                  if (res) {
                    if (res.status == 1) {
                      this.userPhoto = "data:image/png;base64," + res.result;

                    }
                    else {
                      var icon_img = (this.jobdesc.photo == null || this.jobdesc.photo == "") ? 'no-image.png' : this.jobdesc.photo;
                      this.userPhoto = this._DomSanitizationService.bypassSecurityTrustResourceUrl(this.photoPath + icon_img);
                    }

                  }
                });
                // var selectedempname = ">>" + this.jobdesc_temp.firstName + " " + this.jobdesc_temp.lastName;
                // $('#empname').remove();
                // $(".breadscrumb_mainMod_title2").append("<span id='empname' class='breadscrumb_mainMod_title2' style='float:right'> "+">>" + this.jobdesc_temp.firstName + " " + this.jobdesc_temp.lastName + '</span>');
                //  $("#empname").text(this.jobdesc_temp.firstName);
                var selectedEmpname = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SELCTEDEMPNAME);
                $("#empname").text(selectedEmpname);

                this.employeeInfo(this.jobdesc);
                this.setPhoto(this.jobdesc.photo);
              }
            }
            else {
              this.unit_emp_list = [];
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }
  getRightsUserList() {
    var req = {
      LegoId: this.queryparams.lId,
      CompanyId: this.userinfo.CompanyId, 
      EmployeeId: this.userinfo.EmployeeId
    };
    this.MessageService.clear();
    this.DetailsService.GetUserList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) { 
              this.employee_list = res.result;
              this.show_group_rights = false;
              this.show_user_rights = true;
              this.display = false;
              this.show_owner_dialog = false;
              var tempSelectedEmp = _.filter(this.employee_list, (e) => {
                return !_.isEmpty(_.find(this.userAccess_list, (r_emp) => {
                  return (r_emp.employeeId == e.employeeId)
                }));
              });

              this.tempparticipatedemp = _.cloneDeep(tempSelectedEmp);
            }
            else {
              this.employee_list = [];
              this.show_owner_dialog = false;
              this.display = false;
              this.show_user_rights = false;
              this.show_group_rights = false;
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })

  }
  getAllEmployee(mode) {
    // if (this.employee_list.length != 0) {
    //   this.employee_list = _.filter(this.employee_list, (e) => {
    //     return (e.employeeId != this.userinfo.EmployeeId);
    //   })
    //   this.show_group_rights = false;
    //   this.show_user_rights = true;
    //   this.display = false;
    //   this.show_owner_dialog = false;
    //   return false;
    // }
    this.MessageService.clear();
    var req = {
      UserId: this.userinfo.EmployeeId,
      CompanyId: this.userinfo.CompanyId,
      Type: 'E',
      LegoId: this.queryparams.lId
    };

    this.DetailsService.UnitEmployeeList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.employee_list = res.result;
              if (mode == 'owner') {
                this.show_owner_dialog = true;
                this.display = false;
                this.show_user_rights = false;
                this.show_group_rights = false;
              }
              if (mode == 'group') {
                // debugger;
                this.employee_list = _.filter(this.employee_list, (e) => {
                  return (e.employeeId != this.userinfo.EmployeeId);
                })
                this.show_group_rights = false;
                this.show_user_rights = true;
                this.display = false;
                this.show_owner_dialog = false;
                var tempSelectedEmp = _.filter(this.employee_list, (e) => {
                  return !_.isEmpty(_.find(this.userAccess_list, (r_emp) => {
                    return (r_emp.employeeId == e.employeeId)
                  }));
                });
                // var tempSelectedEmp=_.filter(this.userAccess_list,(e)=>{
                //   return (e.employeeId > 0)
                // });
                this.tempparticipatedemp = _.cloneDeep(tempSelectedEmp);
              }
              // else {
              //   this.display = true;
              //   this.show_user_rights = false;
              // }
              if (mode == 'emplist') {
                this.display = true;
                this.show_owner_dialog = false;
                this.show_user_rights = false;
                this.show_group_rights = false;
              }

            }
            else {
              this.employee_list = [];
              this.show_owner_dialog = false;
              this.display = false;
              this.show_user_rights = false;
              this.show_group_rights = false;
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  SaveTempEmployee(tempselectedparticipated) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (tempselectedparticipated == null || tempselectedparticipated == "" || tempselectedparticipated == undefined) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please Select the Employee in the List." });
      return false;
    }
    var alreadyexist = _.omitBy(tempselectedparticipated, (d) => {
      var exist = _.find(this.temp_participatedEmployees, (d1) => {
        return (d1.employeeId == d.employeeId)
      });
      return (!_.isEmpty(exist))
    });

    var NewlyAdded = _.filter(alreadyexist, (d) => {
      var exist = _.find(tempselectedparticipated, (d1) => {
        return (d1.employeeId == d.employeeId)
      });
      return (!_.isEmpty(exist))
    });

    if (NewlyAdded.length > 0) {
      tempselectedparticipated = _.forEach(NewlyAdded, (emp) => {
        emp.legoId = this.queryparams.lId;
        emp.position = 1;
      });
    }
    else {
      tempselectedparticipated = _.forEach(tempselectedparticipated, (emp) => {
        emp.legoId = this.queryparams.lId;
        emp.position = 1;
      });
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Select the Employee(s) which are not included in employee details table." });
      return false;
    }

    var req = {
      "OrganizationEmp": tempselectedparticipated
    };

    this.DetailsService.AddUnitEmployeeList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.UnitEmployeeList();
              this.display = false;
              this.resetTable();
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Added." });
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Employee Already Added." });
              //this.employee_list = [];
              //this.display = false;
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  delete_Unit_Emp(unit_emp) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var req = {
      CompanyId: this.userinfo.CompanyId,
      EmployeeId: unit_emp.employeeId,
      LegoId: this.queryparams.lId
    };
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.DetailsService.DeleteUnitEmployee(req)
          .then(res => {
            if (res) {
              if (!_.isEmpty(res)) {
                if (res.status == 1) {
                  this.unit_emp_list = res.result;
                  this.tempselectedparticipated = this.unit_emp_list;
                  this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Deleted Successfully." });
                }
                else {
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Deletion Failed." });
                  this.unit_emp_list = res.result;
                  return false;
                }

              }
              else {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
                return false;
              }
            }
          }, error => {
            //console.log("Error Happend");

          })
      }
    })

  }
  ///////////////  UNIT EMPLOYEE LIST END ////////////////////////

  //////UPDATE JOB DESCRIPTION //////////////
  updateJobDesc(jobdesc) {
    this.MessageService.clear();
    // if (this.queryparams.mode != 'E') {
    //   if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
    //     this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
    //     return false;
    //   }
    //   if(this.isRefModule){
    //     return false;
    //   }      
    // } 
    //var EmpId = localStorage.getItem("imodzUP-empinfoid");
    var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
    if (selectedempId != this.userinfo.EmployeeId || this.userinfo.EmployeeId == managerId) {
      this.jobdesc = this.jobdesc_temp;
      // if (!this.isRefModule) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
      // }
      return false;
    }
    if (jobdesc.skillSet == this.jobdesc_temp.skillSet && jobdesc.jobDesc == this.jobdesc_temp.jobDesc) {
      return;
    }
    var req = {
      EmployeeId: selectedempId,
      CompanyId: this.userinfo.CompanyId,
      SkillSet: jobdesc.skillSet,
      JobDesc: jobdesc.jobDesc
    };

    this.DetailsService.UpdateJobDesc(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.unit_emp_list = res.result;
              this.jobdesc = _.find(this.unit_emp_list, (d) => {
                return d.employeeId == this.userinfo.EmployeeId;
              })
              this.jobdesc_temp = _.clone(this.jobdesc);
              this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SELCTEDEMPNAME, this.jobdesc.firstName);
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Updated." });
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Failed." });
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  /////// UPDATE LEGO /////////////
  UpdateLego(process_info) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (this.queryparams.mode == 'E') {
      process_info.ownerId = process_info.employeeId;
    }
    var req = {
      OwnerId: process_info.ownerId,
      CompanyId: this.userinfo.CompanyId,
      Scope: process_info.scope,
      Definition: process_info.definition,
      LegoId: process_info.legoId,
      LegoName: process_info.legoName
    };

    this.DetailsService.UpdateLego(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              //this.getProcessInfo();
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Updated." });
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Failed." });
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }


  ////////////PROCESS INFORMATION TAB START //////////////////////
  getProcessInfo() {
    this.MessageService.clear();
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    var req = {
      EmployeeId: this.userinfo.EmployeeId,
      CompanyId: this.userinfo.CompanyId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId
    };

    this.DetailsService.GetProcessInfo(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.process_info = res.result[0];
            }
            else {
              this.process_info = [];
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  showownerlist() {
    this.getAllEmployee('owner');
    //this.show_owner_dialog = true;
  }

  closeDialog() {
    this.show_owner_dialog = false;
    this.display = false;
  }

  addOwner(selectedowner) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (selectedowner == null || selectedowner == "" || selectedowner == undefined) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please Select any One of the ownerlist." });
      return false;
    }
    this.process_info.ownerId = selectedowner.employeeId;
    this.process_info.firstName = selectedowner.firstName;
    this.process_info.email = selectedowner.email;
    this.process_info.permanentPhoneNo = selectedowner.permanentPhoneNo;
    this.process_info.permanentAddress1 = selectedowner.permanentAddress1;
    this.process_info.title = selectedowner.title;
    this.process_info.companyId = selectedowner.companyId;
    this.show_owner_dialog = false;
    this.display = false;
    this.UpdateLego(this.process_info)
  }
  ////////////PROCESS INFORMATION TAB END //////////////////////
  ///////////// SUB-MODULE CHANGE LOG START ////////////////////

  getTreeModules() {
    var selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var treemodules = this.ModuleService.getTreeModules();
    if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
      if (treemodules.length > 0) {
        var treenodes = _.cloneDeep(treemodules);
        var m = this.ModuleService.findChildModules(treenodes, null, selectedModuleId);
        this.ModuleTreeItems = m;
        //var temp_id = treenodes[0].legoId;
        //var tree = this.ModuleService.findChildModules(treenodes, null, temp_id);
        this.ModuleTreeItems_popup = [this.FilterDocumentEMployeeModules(m)];
        this.ModuleTreeItems_popup = this.ModuleTreeItems_popup[0];
      }
    }
  }
  FilterDocumentEMployeeModules(module) {
    var nodes = _.cloneDeep(module);
    if (nodes.children.length > 0) {
      nodes.children = _.remove(nodes.children, (TreeItems: any) => {
        return (TreeItems.cType != 'E' && TreeItems.cType != 'D' && TreeItems.cType != null);
      });
    }
    return nodes;
  }

  ///////////// SUB-MODULE CHANGE LOG END ////////////////////

  ///////////// Employee INFORMATION START //////////////////
  employeeInfo(emp_info) {
    this.istabvisible = true;
    //this.empshow = true;
    //this.MessageService.clear();
    if (emp_info == undefined || emp_info == null) {
      emp_info.employeeId = this.userinfo.EmployeeId;
      emp_info.managerId = this.userinfo.EmployeeId;

    }

    //this.LocalStorageService.addItem("empinfoid", emp_info.employeeId);
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID, emp_info.employeeId);
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID, emp_info.managerId);
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SELCTEDEMPNAME, emp_info.firstName);
    if (emp_info.employeeId == this.userinfo.EmployeeId) {
      this.empshow = true;
      this.hasReadOnly = true;


    }
    else if (emp_info.managerId == this.userinfo.EmployeeId) {
      this.empshow = false;
      this.hasReadOnly = true;
    }
    else {
      this.empshow = false;
      this.hasReadOnly = false;
    }
    // 
    // if (emp_info.employeeId != this.userinfo.EmployeeId) {
    //   this.MessageService.add({ severity: 'error', summary: 'Error', detail: "This page can only be accessed by the Employee Owner, all others are restricted." });
    //   return false;
    // }
    // else
    {
      // $("#stab_details_processinfo").removeClass("nav-item5");
      // $("#stab_details_uemplist").removeClass("nav-item5");
      this.employeeForm.reset();
      this.emp_info = emp_info;
      this.assignToEditFormObj();
      //this.emp_info.chkAddress.patchValue(false, { emitEvent: true });
      this.value = "Employee Information";
      this.querystring = "stab_details_processinfo";
      var newparams = this.queryparams;
      newparams.t = this.querystring;
      this.router.navigate(["/details"], { queryParams: newparams });
      this.activateModuleTabs(this.querystring);

    }

  }

  View_filterInfo(empid) {
    this.MessageService.clear();
    //this.LocalStorageService.addItem("empinfoid", empid)
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID, empid);
    this.jobdesc = _.find(this.unit_emp_list_clone, (d) => {
      return d.employeeId == empid;
    })
    // $("#stab_details_processinfo").removeClass("nav-item5");
    // $("#stab_details_uemplist").removeClass("nav-item5");
    // this.employeeForm.reset();
    // this.emp_info = this.jobdesc;
    // this.assignToEditFormObj();

    this.value = "Employee Information";
    this.querystring = "stab_details_processinfo";
    var newparams = this.queryparams;
    newparams.t = this.querystring;
    this.router.navigate(["/details"], { queryParams: newparams });
    this.activateModuleTabs(this.querystring);
  }

  getEmpCategoryList() {
    this.CommonAppService.getEmpCategoryAll("")
      .then((res) => {
        this.empCategoryList = res;
        this.empCategoryListDropdown = this.MasterService.formatDataforDropdown("categoryName", this.empCategoryList, "Select Category", "categoryId");
      });
  }

  hidetab() {
    if (this.queryparams.mode == 'E' && this.queryparams.t == 'stab_details_uemplist') {
      return false;
    }
    else {
      return true;
    }
  }


  ////////////GET GROUP LIST//////////////////////
  getGroupList(mode) {
    var req = {
      CompanyId: this.userinfo.CompanyId
    };

    this.DetailsService.GetGroupList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.group_list = res.result;
              if (!_.isEmpty(this.groupAccess_list)) {
                if (!_.isEmpty(this.group_list)) {
                  // this.selectedgroup = _.find(this.group_list, (g) => {
                  //   if (g.groupId == this.groupAccess_list.groupId) {
                  //     return g;
                  //   }
                  // })



                  this.selectedgroup = _.filter(this.group_list, (g) => {
                    var gp = _.find(this.groupAccess_list, (g1) => {
                      if (g1.groupId == g.groupId) {
                        return g1;
                        // g.legoId = g1.legoId;
                        // g.restricted = g1.restricted;
                        // g.unrestricted = g1.unrestricted;
                        // g.readonly = g1.readonly;
                      }

                    });
                    return (!_.isEmpty(gp));
                  });
                  // this.selectedgroup = _.cloneDeep(this.groupAccess_list);
                }
              }



              //if (mode == 'Group') {
              this.show_group_rights = true;
              this.display = false;
              this.show_owner_dialog = false;
              this.show_user_rights = false;
              //}
            }
            else {
              this.group_list = [];
              //this.display = false;
              this.show_group_rights = true;
              this.display = false;
              this.show_owner_dialog = false;
              this.show_user_rights = false;
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  addToGroup(selectedgroup) {

    // var NewlyAdded = _.filter(this.selectedgroup, (d) => {
    //   var exist = _.find(this.groupAccess_list, (d1) => {
    //     return (d1.groupId != d.groupId)
    //   });

    //   return (!_.isEmpty(exist))
    // });
    if (!_.isEmpty(this.selectedgroup)) {
      var newselectedgroup = _.cloneDeep(this.selectedgroup)

      this.groupAccess_list = _.filter(newselectedgroup, function (e) {
        e.unrestricted = e.unrestricted == "True" ? "UnRestricted" : null;
        e.restricted = e.restricted == "True" ? "Restricted" : null;
        e.readonly = e.readonly == "True" ? "ReadOnly" : null;
        return e.groupId;
      });
    }
    else {
      this.groupAccess_list = [];
    }
    this.show_group_rights = false;

    // this.MessageService.clear();
    // if (!_.isEmpty(this.selectedgroup)) {
    //   this.groupAccess_list = [];
    //   this.grouprights = (this.selectedgroup.unrestricted == "True") ? "UnRestricted" : (this.selectedgroup.restricted == "True") ? "Restricted"
    //     : (this.selectedgroup.readonly == "True") ? "ReadOnly" : "UnRestricted";
    //   this.groupAccess_list.push(this.selectedgroup);
    //   this.show_group_rights = false;
    // }
    // else {
    //   this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please select group rights." });
    //   return false;
    // }

  }

  menu_select(selectedMenu) {
    var tblname = selectedMenu.label;
    var filter_rights;
    this.selectedTab = selectedMenu.label;
    var rightsname;
    switch (tblname) {
      case "Module Rights":
        tblname = "TblModelRights";
        rightsname = "ModelRightsId";
        break;
      case "Module Tab Rights":
        tblname = "TblModuleRights";
        rightsname = "ModuleRightsId";
        break;
      case "Strategy Tab Rights":
        tblname = "TblPlanRights";
        rightsname = "PlanRightsId";
        break;
      case "Workflow Tab Rights":
        tblname = "TblWorkflowRights";
        rightsname = "WorkflowRightsId";
        break;
      case "Documents Tab Rights":
        tblname = "TblDocumentRights";
        rightsname = "DocumentRightsId";
        break;
      case "Assessment Tab Rights":
        tblname = "TblAssessmentRights";
        rightsname = "AssessmentRightsId";

        break;
      case "Performance Tab Rights":
        tblname = "TblPerformanceRights";
        rightsname = "PerformanceRightsId";
        break;
      case "Details Tab Rights":
        tblname = "TblDetailRights";
        rightsname = "DetailRightsId";
        break;
      case "Connection Tab Rights":
        tblname = "TblConnectionRights";
        rightsname = "ConnectionRightsId";
        break;

      case "Collaboration Tab Rights":
        tblname = "TblCollaborationRights";
        rightsname = "CollaborationRightsId";
        break;
      default:
        tblname = "TblModelRights";
        rightsname = "ModelRightsId";
        break;
    }
    this.rightsIdName = rightsname;
    this.rightsTableName = tblname;
    this.getAllRights(tblname, rightsname);
  }

  ////////////GET UserRights LIST//////////////////////
  getAllRights(tblname, rightsname) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    if (tblname == undefined || tblname == null || rightsname == undefined || rightsname == null) {
      return false;
    }
    var req = {
      LegoId: this.queryparams.lId,
      TblName: tblname,
      RightsIdName: rightsname,
      CompanyId: this.userinfo.CompanyId,
      EmployeeId: this.userinfo.EmployeeId

    };

    this.DetailsService.GetAllRights(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) { 
              this.userAccess_list = res.result.userRights;
              this.groupAccess_list = res.result.groupRights;
              this.tempparticipatedemp = _.cloneDeep(this.userAccess_list);
              this.alreadyExistUser = _.cloneDeep(this.userAccess_list);
              this.selectedgroup = _.cloneDeep(this.groupAccess_list);
              if (!_.isEmpty(this.groupAccess_list)) {
                _.forEach(this.groupAccess_list, function (item, index) {
                  item.unrestricted = item.unrestricted == "True" ? "UnRestricted" : null;
                  item.restricted = item.restricted == "True" ? "Restricted" : null;
                  item.readonly = item.readonly == "True" ? "ReadOnly" : null;
                });
              }
              else {
                this.groupAccess_list = [];
              }
            }
            else {
              this.userAccess_list = [];
              this.groupAccess_list = [];
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  saveGroupRights(tempselecteduser) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.detailsRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    // tempselectedgroup = _.forEach(this.groupAccess_list, (g) => {
    //   g.legoId = this.queryparams.lId;
    //   g.tab_Name = this.selectedMenu.title;
    //   if (g.restricted == "") {
    //     g.rightsAdd = "N";
    //     g.rightsEdit = "N";
    //     g.rightsView = "N";
    //     g.rightsDelete = "N";
    //     g.restricted = "";
    //   }
    //   else if (g.unrestricted == "") {
    //     g.rightsAdd = "Y";
    //     g.rightsEdit = "Y";
    //     g.rightsView = "Y";
    //     g.rightsDelete = "Y";
    //     g.unrestricted = "";
    //   }
    //   else if (g.readonly == "") {
    //     g.rightsAdd = "N";
    //     g.rightsEdit = "N";
    //     g.rightsView = "Y";
    //     g.rightsDelete = "N";
    //     g.readonly = "";
    //   }

    // })

    tempselecteduser = _.forEach(this.userAccess_list, (g) => {
      g.legoId = this.queryparams.lId;
      g.tab_Name = this.selectedMenu.title;
      g.sav_flag = 1;
      if (g.restricted == "") {
        g.rightsAdd = "N";
        g.rightsEdit = "N";
        g.rightsView = "N";
        g.rightsDelete = "N";
        g.restricted = "";
      }
      else if (g.unrestricted == "") {
        g.rightsAdd = "Y";
        g.rightsEdit = "Y";
        g.rightsView = "Y";
        g.rightsDelete = "Y";
        g.unrestricted = "";
      }
      else if (g.readonly == "") {
        g.rightsAdd = "N";
        g.rightsEdit = "N";
        g.rightsView = "Y";
        g.rightsDelete = "N";
        g.readonly = "";
      }
    })

    // var updatedgroup = _.filter(this.groupAccess_list, (n) => {
    //   return (n.gid != null)
    // });
    // var newlyAdded = _.filter(this.groupAccess_list, (n) => {
    //   return (n.groupModuleTabId == null || n.groupModuleTabId == undefined || n.groupModuleTabId == "")
    // })

    // _.forEach(updatedgroup, (n) => {
    //   n.sav_flag = 1;
    // })

    // _.forEach(newlyAdded, (n) => {
    //   n.delFlag = 'N';
    //   n.sav_flag = 0;
    // });

    if (tempselecteduser.length == 0) {
      return false;
    }
    var req = {
      // "GroupRights": this.groupAccess_list,
      "UserRights": tempselecteduser,
      "groupRightsLists": this.groupAccess_list,
      RightsIdName: this.rightsIdName,
      TblName: this.rightsTableName,
      LegoId: this.queryparams.lId,
      CompanyId: this.userinfo.CompanyId,
    };

    this.DetailsService.SaveTabRights(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.userAccess_list = res.result.userRights;
              this.groupAccess_list = res.result.groupRights;
              this.tempparticipatedemp = _.cloneDeep(this.userAccess_list);
              this.alreadyExistUser = _.cloneDeep(this.userAccess_list);
              this.selectedgroup = _.cloneDeep(this.groupAccess_list);
              if (!_.isEmpty(this.groupAccess_list)) {
                // this.selectedgroup = _.cloneDeep(this.groupAccess_list);
                _.forEach(this.groupAccess_list, function (item, index) {
                  item.unrestricted = item.unrestricted == "True" ? "UnRestricted" : null;
                  item.restricted = item.restricted == "True" ? "Restricted" : null;
                  item.readonly = item.readonly == "True" ? "ReadOnly" : null;
                });
              }
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Saved." });
              this.ModuleService.setModuleRights(this.queryparams.lId);
            }
            else {
              this.userAccess_list = [];
              this.groupAccess_list = [];
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Rights Added Failed." });
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  setAccess1(data, mode) {
    switch (mode) {
      case "unrestricted":
        data.unrestricted = "unrestricted";
        data.restricted = null;
        data.readonly = null;
        break;
      case "restricted":
        data.unrestricted = null;
        data.restricted = "restricted";
        data.readonly = null;
        break;
      case "readonly":
        data.unrestricted = null;
        data.restricted = null;
        data.readonly = "readonly";
        break;
      default:
        data.unrestricted = "unrestricted";
        data.restricted = null;
        data.readonly = null;
    }
  }

  reorderMetricList(event) {

    var position = event.dropIndex + 1;
    var item = this.unit_emp_list[event.dropIndex];
    if (event.dropIndex > event.dragIndex) {
      position = event.dropIndex;
      var item = this.unit_emp_list[event.dropIndex - 1];
    }
    // _.forEach(this.unit_emp_list, function (item, index) {
    //   item.position = index + 1;
    // });

    //this.crudMetricsTab(this.performanceModel);
  }

  UpdatePosition(unit_emp_list) {
    this.MessageService.clear();
    //console.log('Position', unit_emp_list)
    var selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var update_position = _.forEach(unit_emp_list, function (item, index) {
      item.position = index + 1;
      item.legoId = selectedModuleId;
    });

    var req = {
      "OrganizationEmp": update_position,
      CompanyId: this.userinfo.CompanyId,
      EmpId: this.userinfo.EmployeeId,
      LegoId: this.queryparams.lId
    };

    this.DetailsService.updatePosition_unitList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Saved." });
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Save Failed." });
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  reorderFilterList(event) {
    var position = event.dropIndex + 1;
    var item = this.filtertag[event.dropIndex];
    if (event.dropIndex > event.dragIndex) {
      position = event.dropIndex;
      var item = this.filtertag[event.dropIndex - 1];
    }

    this.updatefilter_position(this.filtertag)
  }


  updatefilter_position(dragList) {
    _.forEach(dragList, function (item, index) {
      item.position = index + 1;
    });

    ////console.log(dragList);

    var filterlist = [];
    _.forEach(dragList, (dList) => {
      filterlist.push({
        "EmpId": this.userinfo.EmployeeId,
        "Position": dList.position,
        "TagId": dList.tagId,
        "CompanyId": dList.companyId,
        "LegoId": this.queryparams.lId,
        "LegoTagId": dList.legoTagId
      });
    });
    var req = {
      "FilterModel": filterlist,
    }
    this.FilterTagService.UpdateFilterPosition(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                //this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Added Successfully" });
                this.filterTagList();

              }
            }
            else {

              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }

  nodeSelect(event) {

    var legoid = event.node.legoId;
    var parentid = event.node.parentId;
    var filterlog_list = _.cloneDeep(this.modulechangelog_list_temp);
    if (parentid == 0) {
      this.modulechangelog_list = filterlog_list;
      return;
    }
    if (event.node.children.length > 0) {
      this.modulechangelog_list = _.filter(filterlog_list, (f) => {
        return (f.parentId == legoid || f.legoId == legoid)
      })
    }
    else {
      this.modulechangelog_list = _.filter(filterlog_list, (f) => {
        return (f.legoId == legoid)
      })
    }

  }

  imageValidation(file) {
    var rValue = {
      valid: false,
      message: ""
    };
    var filename = file.name;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if (!allowedExtensions.exec(filename)) {
      rValue.message = "Please upload file having extensions .jpeg/.jpg/.png/.gif only.";
      rValue.valid = false;
    }
    else if (file.size > this.photosizeLimit) {
      rValue.message = "Image size should be less than 100 KB.";
      rValue.valid = false;
    }
    else {
      rValue.valid = true;
    }
    return rValue;
  }
  uploadfile(req, inputElement) {
    this.DetailsService.setUserPhotos(req).then(res => {
      //console.log("login response", res);
      if (res) {
        if (res.status == 1) {
          //  this.userPhoto = res.result.fileName;
          //this.setPhoto(res.result.fileName);
          var potos = res.result;
          this.userPhoto = "data:image/png;base64," + potos;
          this.MessageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        }
        else {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        }
      }
    });
  }
  public uploadProfilePhoto(inputElement) {
    var emp_info = this.employeeForm.getRawValue();
    if (emp_info.employeeId != this.userinfo.EmployeeId) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "This page can only be accessed by the Employee Owner, all others are restricted." });
      this.myInputVariable.nativeElement.value = "";
      return false;
    }
    var files = inputElement.files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      // let img = document.createElement('img');
      // img.src = window.URL.createObjectURL(file);
      let reader = new FileReader();
      reader.addEventListener('load', (event: any) => {
        var i = new Image();
        i.src = event.target.result;
        i.onload = (prop: any) => {
          var src = prop.srcElement;
          if (src.width > this.photoDimLimit || src.height > this.photoDimLimit) {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Image width and height should be less than 600 pixels." });
            this.myInputVariable.nativeElement.value = "";
          }
          else {
            var filevalid: any = this.imageValidation(file);
            if (filevalid.valid) {
              var formData = new FormData();
              formData.append(file.name, file);
              formData.append("employeeId", (this.userinfo.EmployeeId != null && this.userinfo.EmployeeId != undefined) ? this.userinfo.EmployeeId : null);
              formData.append("companyId", (this.userinfo.CompanyId != null && this.userinfo.CompanyId != undefined) ? this.userinfo.CompanyId : null);
              this.uploadfile(formData, inputElement);
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: filevalid.message });
            }
          }
        };

        // inputElement.files=[];
      }, false);

      reader.readAsDataURL(file);
    }
  }

  //////////////SAVE EMPLOYEE INFORMATION/////////////////
  getStateList() {
    this.MasterService.loadStateList().then((res) => {
      this.stateList = res;
    });
  }

  checkboxChanged(event) {
    var mapobject = {
      'permanentAddress1': 'communicationAddress1',
      'permanentAddress2': 'communicationAddress2',
      'permanentState': 'communicationState',
      'permanentCity': 'communicationCity',
      'permanentZipcode': 'communicationZipcode',
      'permanentPhoneNo': 'communicationPhoneNo',
      'email': 'communicationEmail'
    };
    //this.employeeForm.controls['chkAddress'].setValue(event.target.checked);
    var formdata = this.employeeForm.getRawValue();
    if (event.target.checked == true) {
      if (formdata.permanentState.name == null || formdata.permanentState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.permanentState.toLowerCase());
        });
        if (state.length == 0) {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Permanent State Name is not valid." });
          event.target.checked = false;
          this.employeeForm.controls['chkAddress'].setValue("false");
          return false;
        }
        else {

          formdata.permanentState = state[0];
          this.employeeForm.controls['chkAddress'].setValue("true");
          this.employeeForm.controls["permanentState"].setValue(state[0]);
        }
      }
      this.MasterService.sameasMappingData(this.employeeForm, mapobject);
      this.employeeForm.controls['chkAddress'].setValue("true");
    }
    else {
      this.employeeForm.controls["communicationAddress1"].setValue(null);
      this.employeeForm.controls["communicationAddress2"].setValue(null);
      this.employeeForm.controls["communicationState"].setValue(null);
      this.employeeForm.controls["communicationCity"].setValue(null);
      this.employeeForm.controls["communicationZipcode"].setValue(null);
      this.employeeForm.controls["communicationPhoneNo"].setValue(null);
      this.employeeForm.controls["communicationEmail"].setValue(null);
      this.employeeForm.controls['chkAddress'].setValue("false");
    }
  }

  buildFormErrorobject() {
    this.employeeFormErrorObj = {
      firstName: { required: "First Name can not be empty.", },
      permanentAddress1: { required: "Address 1 can not be empty", },
      permanentCity: { required: "City Name can not be empty", },
      permanentState: { required: "Please select State.", },
      permanentZipcode: { required: "Please enter zip code.", maxlength: "Zip code allows maximum 6 digits.", },
      permanentPhoneNo: { required: "Phone number can not be empty", },
      email: { required: "Email can not be empty", },
      communicationAddress1: { required: "Communication Address 1 can not be empty", },
      communicationCity: { required: "Communication City can not be empty", },
      communicationState: { required: "Communication State can not be empty", },
      communicationZipcode: { required: "Communication Zip code can not be empty", maxlength: "Communication Zip code allows maximum 6 digits.", },
      communicationPhoneNo: { required: "Communication Phone Number can not be empty", },
      communicationEmail: { required: "Communicational Email ID can not be empty", },
      userName: { required: "User Name can not be empty", minlength: "User Name required minimum 6 characters.", },
      password: { required: "Password can not be empty", minlength: "Password required minimum 6 characters.", },
      confirmpassword: { required: "Confirm Password can not be empty", minlength: "Confirm Password required minimum 6 characters.", },
      active: { required: "Please select employee status.", },
      unitId: { required: "Please select Unit section.", },
      categoryId: { required: "Please select Employee Category.", },
      // dateOfJoin: { required: "Please select Joining Date.", },
      // jobDesc: { required: "Please enter employee's Notes/Job description.", },
    }
  }


  initializeFormData() {
    this.buildFormobject();
    this.buildFormErrorobject();
  }

  buildFormobject() {
    this.employeeForm = this.formBuilder.group(
      {
        employeeId: new FormControl(''),
        firstName: new FormControl('', { validators: Validators.required }),
        lastName: new FormControl('', { validators: Validators.required }),
        permanentAddress1: new FormControl('', { validators: Validators.required }),
        permanentAddress2: new FormControl(''),
        permanentCity: new FormControl('', { validators: Validators.required }),
        permanentState: new FormControl('', { validators: Validators.required }),
        permanentZipcode: new FormControl('', { validators: Validators.required }),
        permanentPhoneNo: new FormControl('', { validators: Validators.required }),
        email: new FormControl('', { validators: Validators.required }),
        chkAddress: new FormControl(''),
        communicationAddress1: new FormControl('', { validators: Validators.required }),
        communicationAddress2: new FormControl(''),
        communicationCity: new FormControl('', { validators: Validators.required }),
        communicationState: new FormControl('', { validators: Validators.required }),
        communicationZipcode: new FormControl('', { validators: Validators.required }),
        communicationPhoneNo: new FormControl('', { validators: Validators.required }),
        communicationEmail: new FormControl('', { validators: Validators.required }),
        companyId: new FormControl(this.userinfo.CompanyId),
        unitId: new FormControl('General', { validators: Validators.required }),
        categoryId: new FormControl('', { validators: Validators.required }),
        //dateOfJoin: new FormControl('', { validators: Validators.required }),
        dateOfResign: new FormControl(''),
        userName: new FormControl('', { validators: Validators.required }),
        password: new FormControl('', { validators: Validators.required }),
        oldpassword: new FormControl(''),
        confirmpassword: new FormControl(''),
        remarks: new FormControl(''),
        active: new FormControl('', { validators: Validators.required }),
        // jobDesc: new FormControl('', { validators: Validators.required }),
        skillSet: new FormControl(''),
        title: new FormControl(this.emp_info.title),
        zoomSize: new FormControl(100),
        defaultModule: new FormControl(''),
        defaultTab: new FormControl(''),
        userId: new FormControl(this.emp_info.userId),
      }
    );
  }

  assignToEditFormObj() {

    var self = this;
    if (this.emp_info) {
      var formData = this.emp_info;
      this.employeeForm = this.MasterService.mappingFormData(this.employeeForm, this.emp_info);

      setTimeout(() => {
        var selectedcState = _.find(this.stateList, (data) => {
          return (this.emp_info.communicationState == data.value)
        });
        var selectedpState = _.find(this.stateList, (data) => {
          return (this.emp_info.permanentState == data.value)
        });
        if (selectedcState) {
          this.employeeForm.controls['communicationState'].patchValue(selectedcState, { emitEvent: true });
        }
        if (selectedpState) {
          this.employeeForm.controls['permanentState'].patchValue(selectedpState, { emitEvent: true });
        }
      }, 1000);
      this.employeeForm.controls['oldpassword'].patchValue(this.emp_info.password, { emitEvent: true });
      this.employeeForm.controls['confirmpassword'].patchValue(this.emp_info.password, { emitEvent: true });
      this.employeeForm.controls['chkAddress'].patchValue(this.emp_info.chkAddress, { emitEvent: true });

    }
  }

  save_Employee() {
    var formdata = this.employeeForm.getRawValue();
    //console.log("Confirm Password", formdata.confirmpassword);
    formdata.userName = formdata.userName.trim();
    formdata.confirmpassword = _.trim(formdata.confirmpassword);
    formdata.password = _.trim(formdata.password);
    formdata.oldpassword = _.trim(formdata.oldpassword);
    this.employeeForm.controls['confirmpassword'].patchValue(formdata.confirmpassword, { emitEvent: true });
    this.employeeForm.controls['password'].patchValue(formdata.password, { emitEvent: true });
    if (formdata.employeeId != this.userinfo.EmployeeId) {
      var errorMessage1 = "This page can only be accessed by the Employee Owner, all others are restricted.";
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage1 });
      return false;
    }
    if (this.employeeForm.status == "INVALID") {
      var errorMessage = this.MasterService.getFormErrorMessage(this.employeeForm, this.employeeFormErrorObj);
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;
    }
    else {
      var externalvalid = true;
      var externalvalidMessage = "";
      //saveChanges   
      formdata.userName = _.trim(formdata.userName);
      formdata.password = _.trim(formdata.password);

      if (formdata.permanentState.name == null || formdata.permanentState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.permanentState.toLowerCase());
        });
        if (state.length == 0) {
          externalvalid = false;
          externalvalidMessage = "Permanent State Name is not valid.";
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: externalvalidMessage });
          return false;
        }
        else {
          // _.keyBy(state, 'name')
          formdata.permanentState = state[0];
          this.employeeForm.controls["permanentState"].setValue(state[0]);
        }
      }
      if (formdata.communicationState.name == null || formdata.communicationState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.communicationState.toLowerCase());
        });
        if (state.length == 0) {
          externalvalid = false;
          externalvalidMessage = "Communication State Name is not valid.";
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: externalvalidMessage });
          return false;
        }
        else {
          // _.keyBy(state, 'name')
          formdata.communicationState = state[0];
          this.employeeForm.controls["communicationState"].setValue(state[0]);
        }
      }

      formdata.confirmpassword = _.trim(formdata.confirmpassword);
      if (formdata.userName == '') {
        externalvalid = false;
        externalvalidMessage = 'User Name can not be empty.';
      }
      if (formdata.password == '') {
        externalvalid = false;
        externalvalidMessage = 'Password can not be empty.';
      }
      if (formdata.permanentState) {
        if (formdata.permanentState.value == null) {
          externalvalid = false;
          externalvalidMessage = "Please select permanent state.";
        }
        else
          formdata.permanentState = formdata.permanentState.value;
      }
      else {
        externalvalid = false;
        externalvalidMessage = "Please select permanent state.";
      }
      if (formdata.communicationState) {
        if (formdata.communicationState.value == null) {
          externalvalid = false;
          externalvalidMessage = "Please select communication state.";
        }
        else
          formdata.communicationState = formdata.communicationState.value;
      }
      else {
        externalvalid = false;
        externalvalidMessage = "Please select communication state.";
      }

      if (formdata.confirmpassword == null || formdata.confirmpassword == undefined || formdata.confirmpassword == "") {
        externalvalid = false;
        externalvalidMessage = "Confirm Password can not be empty.";
      }
      else if (formdata.confirmpassword != formdata.password) {
        externalvalid = false;
        externalvalidMessage = "Password does not match the confirm password.";
      }

      if (!externalvalid) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: externalvalidMessage });
        return false;
      }
      else {
        if (formdata.permanentAddress1 != formdata.communicationAddress1 || formdata.permanentAddress2 != formdata.communicationAddress2 ||
          formdata.permanentState != formdata.communicationState || formdata.permanentCity != formdata.communicationCity
          || formdata.permanentZipcode != formdata.communicationZipcode || formdata.permanentPhoneNo != formdata.communicationPhoneNo
          || formdata.email != formdata.communicationEmail) {
          formdata.chkAddress = 'false';
        }
        this.confirmationService.confirm({
          message: 'Are you sure that you want to proceed?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {

            if (formdata.oldpassword != formdata.password) {
              if (formdata.confirmpassword != formdata.password) {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Password does not match the confirm password." });
                return false;
              }
            }
            this.EmployeeService.updateChanges(formdata)
              .then((res) => {
                if (res.status != 0) {

                  this.UnitEmployeeList();
                  this.MessageService.add({ severity: 'success', summary: 'Success', detail: res.message });
                }
                else {
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
              });

          },
          reject: () => {
          }
        });

      }
    }
  }


  EmployeefilterTagList() {
    var modelid = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var req = {
      EmpId: this.userinfo.EmployeeId,
      ownerId: this.userinfo.EmployeeId,
      CompanyId: this.userinfo.CompanyId,
      ModelId: modelid,
      StatementType: "EmployeeFilters"
    };

    this.FilterTagService.EmpFilterOperation(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.empfiltertag = res.result;
              let tags: any[] = _.groupBy(res.result, (s) => {
                return s.legoTagId;
              });
              this.empfiltertag = _.map(tags, (t) => {
                var filteredTag = _.filter(t, (f) => {
                  return (f.tagSelect == true || f.tagSelect == 1);
                })
                var tag = {
                  legoTagId: t[0].legoTagId,
                  legoTag: t[0].legoTag,
                  legoTagDesc: t[0].legoTagDesc,
                  moduleTag: filteredTag
                }
                return tag;
              });
              if (tags.length > 0) {

              }

            }
            else {
              //this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
              this.empfiltertag = [];
              return false;
            }

          }

        }
      }, error => {

      })
  }

  filterResponsibilityMultiple(event) {
    let query = event.query;
    this.selectedstateSuggestion = this.filterResponsibilitry(query, this.stateList);
  }
  filterResponsibilitry(query, resonsibilities: any[]): any[] {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered: any[] = [];
    for (let i = 0; i < resonsibilities.length; i++) {
      let responsibility = resonsibilities[i];
      if (responsibility.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(responsibility);
      }
    }
    return filtered;
  }

  checkState(flag) {
    this.MessageService.clear();
    var formdata = this.employeeForm.getRawValue();

    //$("#addTag").focus();

    if (flag == 1) {
      if (formdata.permanentState.name == null || formdata.permanentState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.permanentState.toLowerCase());
        });
        if (state.length == 0) {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Permanent State Name is not valid." });
          return false;
        }
        else {
          // _.keyBy(state, 'name')
          formdata.permanentState = state[0];
          this.employeeForm.controls["permanentState"].setValue(state[0]);
        }
      }
    }
    else if (flag == 2) {
      if (formdata.communicationState.name == null || formdata.communicationState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.communicationState.toLowerCase());
        });
        if (state.length == 0) {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Communication State Name is not valid." });
          return false;
        }
        else {
          // _.keyBy(state, 'name')
          formdata.communicationState = state[0];
          this.employeeForm.controls["communicationState"].setValue(state[0]);
        }
      }
    }
  }

  onReady(event: any): void {

    if (this.ckeditor) {
      this.ckeditor = event.editor;
      //this.ckeditor.innerValue = this.jobdesc.jobDesc;
      //var editor = event.editor.instances.editor1;
      this.ckeditor.focusManager.focus();

    }
  }

  Exit_processInfo() {
    // $('body').addClass('sidebar-fixed');
    // $("#customsidebar").removeClass("d-none");
    this.router.navigate(['/home']);
  }

  showHideMenu(open?) {
    open = this.queryparams.mode == 'E' ? 1 : 0
    if (open) {
      $('body').removeClass('sidebar-fixed');
      $("#customsidebar").addClass("d-none");
      $("#sidemenuHolder").addClass("d-none");

      $("#pinmodule_tag").hide();
    };
    if (!open) {
      $('body').addClass('sidebar-fixed');
      $("#customsidebar").removeClass("d-none");
      $("#sidemenuHolder").removeClass("d-none");
      $("#pinmodule_tag").show();
    }
  }
  hideOnEmployeeNavigation() {
    if (this.queryparams['mode'] == "E") {
      if (this.queryparams['t'] == "stab_details_uemplist") {
        $("#main_tab_holder").hide();
        this.modulesubTabset.tabs[1].disabled = true;
        this.modulesubTabset.tabs[2].disabled = true;
        this.modulesubTabset.tabs[3].disabled = true;
        this.modulesubTabset.tabs[4].disabled = true;
        this.modulesubTabset.tabs[5].disabled = true;
        // $("#stab_details_processinfo-link").parent("li").hide();
        // $("#stab_details_managefiltertags-link").parent("li").hide();
        // $("#stab_details_changelogs-link").parent("li").hide();
        // $("#stab_details_submchangelogs-link").parent("li").hide();
        // $("#stab_details_accessrights-link").parent("li").hide();
      }
      else {
        $("#main_tab_holder").show();
        this.modulesubTabset.tabs[1].disabled = false;
        this.modulesubTabset.tabs[2].disabled = false;
        this.modulesubTabset.tabs[3].disabled = false;
        this.modulesubTabset.tabs[4].disabled = false;
        this.modulesubTabset.tabs[5].disabled = false;
      }
    }
  }
  hideChangelogTab() {
    if (this.queryparams.mode == 'E') {
      var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
      if (this.userinfo.EmployeeId != selectedempId) {
        this.modulesubTabset.tabs[3].disabled = true;
      }
      else {
        this.modulesubTabset.tabs[3].disabled = false;
      }
      if (this.queryparams.t == 'stab_details_uemplist') {
        this.modulesubTabset.tabs[3].disabled = true;
      }
    }
  }

  closeOrg_dialog() {
    this.display = false;
    this.resetTable();
  }

}
