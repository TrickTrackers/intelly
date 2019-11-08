import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { component_config } from '../../../_config';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { ChangeDetectorRef } from '@angular/core';
import { MasterService } from '../../../services/master.service';
import { UPStrategyService } from '../../../services/appservices/userpanelservices/upstrategy.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { Router, Params, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { ConfirmationService } from 'primeng/api';
import * as moment from 'moment';
import { ModuleService } from '../../../services/module.services';
import { CKEditorComponent } from 'ngx-ckeditor';
import 'rxjs/add/operator/pairwise';
import { CommonAppService } from '../../../services/appservices/common-app.service';
/**
 * Used to add, update, delete mission, vision, strategy,goals
 * @export
 * @class StrategyComponent
 * @implements OnInit
 * @implements AfterViewInit
 * @implements AfterViewChecked
 * @implements OnDestroy
 */
@Component({
  selector: 'app-strategy',
  templateUrl: './strategy.component.html',
  styleUrls: ['./strategy.component.scss']
})
export class StrategyComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  @ViewChild("ckeditor") ckeditor: any;
  @ViewChild("ckeditor1") ckeditor1: any;
  @ViewChild("ckeditor") ckeditor2: CKEditorComponent;
  value: string = "Details";
  display: boolean = false;
  visit: boolean = false;
  viewgoal: boolean = false;
  addgoal_dialog: boolean = false;
  confirm: boolean = false;
  config;
  planMVS: any = {};
  planMVS_temp: any = {};
  userinfo: any = [];
  plan_strategy: any = [];
  strategyValue: any;
  editStrategyDialog: boolean = false;
  editStrategy: any = {};
  /**
   * Assign router parameter
   * @type *
   * @memberof StrategyComponent
   */
  public queryparams: any = [];
  public querystring: any = [];
  goals: any = [];
  goalsAdd: any = {};
  strategyListDropdown: any;
  minDate: any;
  dragList: any = [];
  dragList_temp = [];
  edit_goals: any = [];
  //date_dispayformat = AppConstant.API_CONFIG.DATE.apiFormat;
  date_dispayformat: any = [];
  returnedArray: string[];
  selectedItem: any;
  public legoid_temp: any;
  hasRights: boolean = true;
  hasReadOnly: boolean = false;
  checkrights: any = [];
  paramsSubscription: Subscription;
  /**
   * Date Format for Calendar
   * @memberof StrategyComponent
   */
  public bsConfig = {
    //dateInputFormat: AppConstant.API_CONFIG.DATE.apiFormat,
    dateInputFormat: this.date_dispayformat.date_Format,
    showWeekNumbers: false
  };
  /**
   * Subscription for add / unsubscribe
   * @private
   * @memberof StrategyComponent
   */
  private _subscriptions = new Subscription();
  public isRefModule = false;

  /**
   * Creates an instance of StrategyComponent.
   * @param  {LocalStorageService} LocalStorageService - storing and getting local storage values
   * @param  {Router} router - used to get the query params
   * @param  {MessageService} MessageService - display success and error messages 
   * @param  {UPStrategyService} UPStrategyService - post and get data from strategy service
   * @param  {ChangeDetectorRef} cd - change detection
   * @param  {ConfirmationService} confirmationService - perform action based on confirmation
   * @param  {MasterService} MasterService - mapping data
   * @param  {ModuleService} ModuleService - get the value based on Lego
   * @param  {ConfirmationService} confirmationService_strategy - perform delete action for strategy deletion
   * @memberof StrategyComponent
   */
  constructor(private LocalStorageService: LocalStorageService, private router: Router, private MessageService: MessageService
    , private UPStrategyService: UPStrategyService, private cd: ChangeDetectorRef, private CommonAppService: CommonAppService
    , private confirmationService: ConfirmationService, private MasterService: MasterService, public ModuleService: ModuleService, private confirmationService_strategy: ConfirmationService, ) {
    // this.config = component_config.cktool_config_full;
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.isRefModule = this.ModuleService.checkIsRefmodule();


    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.queryparams.isRef = params['isRef'];
      this.CommonAppService.checkPinmodule();
      if (params['t'] == "stab_strategy_strategy" || params['t'] == "stab_strategy_goals") {
        this.getPlanStrategy();
        this.getPlanGoals();
      }

      else {
        this.getPlanStrategy();
        this.getPlanGoals();
        this.getPlanMVS();
      }
      this.activateModuleTabs(this.queryparams.t);
      this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
      this.bsConfig = {
        dateInputFormat: this.date_dispayformat.date_Format,
        showWeekNumbers: false
      };
    }));
    this.MessageService.clear();
    // var selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    // this.legoid_temp = _.clone(selectedModuleId);
    this.minDate = new Date();
    this._subscriptions.add(
      this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
        this.date_dispayformat.date_Format = preferencesettings.date_Format;
        this.bsConfig = {
          dateInputFormat: this.date_dispayformat.date_Format,
          showWeekNumbers: false
        };
        this.getPlanGoals();
      }));
  }

  /**
   * check rights for strategy
   * @return {void}@memberof StrategyComponent
   */
  checkRights() {
    this.checkrights = this.ModuleService.getModuleRights();
    this.hasReadOnly = false;
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.mode == 'E') {
        var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
        var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
        if (this.userinfo.EmployeeId == selectedempId) {
          this.hasRights = true;
        }
        else if (this.userinfo.EmployeeId == managerId) {
          this.hasRights = true;
          this.hasReadOnly = true;
        }
        else {
          this.hasRights = false;
          this.hasReadOnly = false;
        }
      }
      else if (this.queryparams.mode != 'E' && this.checkrights.planRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
    }
  }

  /**
   * initialize component 
   * @return {void}@memberof StrategyComponent
   */
  ngOnInit() {
    this.config = component_config.cktool_config_full;
    this.initSubscribe();
  }
  /**
   * getting page rights 
   * @return {void}@memberof StrategyComponent
   */
  initSubscribe() {
    this._subscriptions.add(
      this.ModuleService.getModuleRightsUpdate().subscribe(rights => {
        this.checkrights = rights;
        this.checkRights();
        this.isRefModule = this.ModuleService.checkIsRefmodule();
      })
    );
    this.checkrights = this.ModuleService.getModuleRights();
    this.checkRights();
  }
  /**
   * Destroy component on redirection
   * @return {void}@memberof StrategyComponent
   */
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }

  /**
   * Display strategy modal popup
   * @return 
   * @memberof StrategyComponent
   */
  showDialog() {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.strategyValue = [];
    this.display = true;
    setTimeout(() => {
      $("#addstrategy").focus();
    }, 200);
  }
  // viewDialog() {
  //   this.visit = true;
  // }

  /**
   * Add goal modal popup
   * @return 
   * @memberof StrategyComponent
   */
  addGoalDialog() {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.display = false;
    this.viewgoal = false;
    this.visit = false;
    this.goalsAdd = [];
    this.addgoal_dialog = true;
    this.goalsAdd.deadLine = new Date();
    setTimeout(() => {
      $("#example").focus();
    }, 200);
  }
  /**
   * delete stratergy data
   * @param  {any} item selected strategy
   * @return 
   * @memberof StrategyComponent
   */
  DeleteStrategy(item) {
    //this.confirm = true;
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.confirmationService_strategy.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        //Actual logic to perform a confirmation
        this.DeletePlanStrategy('Delete', "'Strategy'", item);
      }
    });
  }

  /**
   * Tab navigation
   * @param  {TabDirective} data - selected tab details 
   * @return {void}@memberof StrategyComponent
   */
  onSelect(data: TabDirective): void {
    this.value = data.heading;

    // if (this.value == "Mission") {
    //   this.AddUpdatePlanMVS('AddUpdateVision', 'Vision')
    //   setTimeout(() => { $("#mission").focus() }, 200);
    // }
    // else if (this.value == "Vision") {
    //   this.AddUpdatePlanMVS('AddUpdateVision', 'Mission')
    //   $("#vision").focus();
    //   $('.cke_wysiwyg_frame').contents().find('body.cke_show_borders').focus();
    // }
    this.querystring = data.id;
    var newparams = this.queryparams;
    newparams.t = this.querystring;
    setTimeout(() => {
      this.router.navigate(["/strategy"], { queryParams: newparams });
      this.activateModuleTabs(this.querystring);
    }, 500);
    // this.router.navigate(["/strategy"], { queryParams: newparams });
    // this.activateModuleTabs(this.querystring);
  }
  /**
   * setting auto height for strategy page
   * @param  {*} event 
   * @return {void}@memberof StrategyComponent
   */
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
    if (!isNaN(inner_res_h)) {
      $('.main_ckeditor .cke_inner > .cke_contents').each(function () {
        var ck_res_h = inner_res_h - 75;
        $(this).css("height", ck_res_h + "px");
      });
      $("#strategy-pg .tab-content").css("height", (tabcontent_h) + "px");

      $("#strategy-pg .child_tabcontent").each(function () {
        $(this).css("height", (tabcontent_h - 25) + "px");
      });
    }
  }
  /**
   * Component data has been initialized
   * @return {void}@memberof StrategyComponent
   */
  ngAfterViewInit() {
    this.ModuleService.activateModuleTabs(this.queryparams);
    this.activateModuleTabs(this.queryparams.t);
    setTimeout(() => {
      if (this.cd !== null &&
        this.cd !== undefined &&
        !(this.cd["ChangeDetectorRef"])) {
        this.cd.detectChanges();
      }
    }, 250);
  }
  /**
   * Component views have been checked
   * @return {void}@memberof StrategyComponent
   */
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
  }

  /**
   * Getting mission, vision data
   * @return {void}@memberof StrategyComponent
   */
  getPlanMVS() {
    var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    var req = {
      EmpId: selectedempId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: 'Select'
    };

    this.UPStrategyService.getAllPlanMVS(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.planMVS = res.result[0];
              if (this.planMVS.mission == null) {
                this.planMVS.mission = "";
              }
              if (this.planMVS.vision == null) {
                this.planMVS.vision = "";
              }
              this.planMVS_temp = _.clone(this.planMVS);
              this.legoid_temp = _.clone(this.queryparams.lId);
            }
            else {
              this.planMVS.mission = "";
              this.planMVS.vision = "";
              this.planMVS_temp = "";
              this.legoid_temp = _.clone(this.queryparams.lId)
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        console.log("Error Happend");

      })
  }

  /**
   * Activating selected tab
   * @param  {any} hasvalue - tab name
   * @return {void}@memberof StrategyComponent
   */
  activateModuleTabs(hasvalue) {
    this.querystring = hasvalue;

    if (this.modulesubTabset) {
      var activeTab = (this.querystring == 'stab_strategy_summary') ? 0 :
        (this.querystring == 'stab_strategy_mission') ? 1 :
          (this.querystring == "stab_strategy_vision") ? 2 :
            (this.querystring == "stab_strategy_strategy") ? 3 :
              (this.querystring == "stab_strategy_goals") ? 4 : 0;

      if (this.modulesubTabset.tabs) {
        if (this.modulesubTabset.tabs.length > 0) {
          _.forEach(this.modulesubTabset.tabs, (t) => {
            // t.active = false;
            $("#" + t.id + "-link").removeClass("active");
            $("#" + t.id + "-link").parent(".nav-item").removeClass("active");
          });
          $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").addClass("active");
          $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").parent(".nav-item").addClass("active");
          this.modulesubTabset.tabs[activeTab].active = true;
          this.value = this.modulesubTabset.tabs[activeTab].heading;
          this.queryparams.t = this.modulesubTabset.tabs[activeTab].id;
        }
      }
    }
  }

  /**
   * Getting current router params
   * @return {void}@memberof StrategyComponent
   */
  getModeLevel() {
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.queryparams.isPin = params['isPin'];
    }));
  }


  /**
   * Add update Mission, vision data
   * @param  {any} StatementType - Mission or Vision
   * @param  {any} tabtype - Add update Mission, Vision based on TabType
   * @return 
   * @memberof StrategyComponent
   */
  AddUpdatePlanMVS(StatementType, tabtype) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        this.planMVS.mission = this.planMVS_temp.mission;
        this.planMVS.vision = this.planMVS_temp.vision;
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }

    if (this.hasReadOnly == true) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });

      this.planMVS.mission = (this.planMVS_temp.mission != undefined && this.planMVS_temp.mission != null ? this.planMVS_temp.mission : "");
      this.planMVS.vision = (this.planMVS_temp.vision != undefined && this.planMVS_temp.vision != null ? this.planMVS_temp.vision : "");
      return false;
    }

    this.getModeLevel();
    if (tabtype == 'Vision') {
      if (this.planMVS_temp.vision == this.planMVS.vision) {
        return false;
      }
    }
    else if (tabtype == 'Mission') {
      if (this.planMVS_temp.mission == this.planMVS.mission) {
        return false;
      }
    }
    if (this.planMVS.planDetailId == undefined) {
      this.planMVS.planDetailId = 0;
    }
    var legoid;

    if (this.planMVS.planDetailId == 0) {
      this.planMVS.ownerId = this.userinfo.EmployeeId;
      if (this.legoid_temp == this.queryparams.lId) {
        legoid = this.queryparams.lId;
      }
      else {
        legoid = this.legoid_temp;
      }
    }
    else {
      this.planMVS.ownerId = this.userinfo.EmployeeId;
      legoid = this.planMVS.legoId;
    }

    var req = {
      PlanDetailId: this.planMVS.planDetailId,
      EmpId: this.userinfo.EmployeeId,
      Type: this.queryparams.mode,
      //LegoId: this.queryparams.lId,
      LegoId: legoid,
      StatementType: StatementType,
      Mission: this.planMVS.mission,
      Vision: this.planMVS.vision,
      Comments_Mission: this.planMVS.comments_Mission,
      Comments_Vision: this.planMVS.comments_Vision,
      CompanyId: this.userinfo.CompanyId,
      Tabtype: "'" + tabtype + "'",
      OwnerId: this.planMVS.ownerId
    };

    this.UPStrategyService.AddUpdatePlanMVS(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.getPlanMVS();
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
        console.log("Error Happend");

      })
  }

  //////////// STRATEGY ADD UPDATE DELETE STARTS/////////////

  /**
   * Add strategy Data
   * @param  {any} StatementType - strategy Type (Add strategy)
   * @param  {any} tabtype - strategy Tab
   * @param  {any} strategyValue - strategy data
   * @return 
   * @memberof StrategyComponent
   */
  AddPlanStrategy(StatementType, tabtype, strategyValue) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.getModeLevel();
    if (this.plan_strategy.strategyId == undefined) {
      this.plan_strategy.strategyId = 0;
    }
    var stra_val;
    stra_val = strategyValue.replace(/<[^>]*>/g, '');
    stra_val = stra_val.replace(/\&nbsp;/g, '');
    stra_val = stra_val.trim();
    if (stra_val == null || stra_val == undefined || stra_val == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please Enter Strategy." });
      return;
    }

    var req = {
      StrategyId: this.plan_strategy.strategyId,
      EmpId: this.userinfo.EmployeeId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: StatementType,
      Strategy_Value: strategyValue,
      Comments_Strategy: this.plan_strategy.comments_Strategy,
      Position: this.plan_strategy.position,
      CompanyId: this.userinfo.CompanyId,
      Tabtype: "'" + tabtype + "'",
      OwnerId: this.userinfo.EmployeeId
    };

    this.UPStrategyService.AddUpdateStrategy(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.getPlanStrategy();
                this.strategyValue = null;
                this.display = false;
                this.editStrategyDialog = false;
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Added Successfully" });
              }
            }
            else {
              this.display = false;
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Creation Failed." });
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        console.log("Error Happend");

      })
  }

  /**
   * Revert stratergy data on cancel
   * @return {void}@memberof StrategyComponent
   */
  cancelUpdateStrategy() {
    this.getPlanStrategy();
    this.editStrategyDialog = false;
  }


  /**
   * Update Strategy Data
   * @param  {any} StatementType - Strategy addupdate Type
   * @param  {any} tabtype - strategy Tab
   * @param  {any} strategyValue - strategy data for Updation
   * @return 
   * @memberof StrategyComponent
   */
  UpdatePlanStrategy(StatementType, tabtype, strategyValue) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var stra_val;
    stra_val = strategyValue.strategy_Value.replace(/<[^>]*>/g, '');
    stra_val = stra_val.replace(/\&nbsp;/g, '');
    stra_val = stra_val.trim();
    if (stra_val == null || stra_val == undefined || stra_val == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please Enter Strategy." });
      this.plan_strategy = this.plan_strategy;
      return;
    }
    this.getModeLevel();

    var req = {
      StrategyId: strategyValue.strategyId,
      EmpId: this.userinfo.EmployeeId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: StatementType,
      Strategy_Value: strategyValue.strategy_Value,
      Comments_Strategy: strategyValue.comments_Strategy,
      Position: strategyValue.position,
      CompanyId: this.userinfo.CompanyId,
      Tabtype: "'" + tabtype + "'",
      OwnerId: strategyValue.empId
    };

    this.UPStrategyService.AddUpdateStrategy(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.getPlanStrategy();
                this.strategyValue = null;
                this.display = false;
                this.editStrategyDialog = false;
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Updated Successfully" });
              }
            }
            else {
              this.display = false;
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Updation Failed." });
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {

      })
  }

  /**
   * Delete Strategy Data
   * @param  {any} StatementType - Delete strategy
   * @param  {any} tabtype - strategy Tab
   * @param  {any} strategyValue - Strategy Data
   * @return 
   * @memberof StrategyComponent
   */
  DeletePlanStrategy(StatementType, tabtype, strategyValue) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.getModeLevel();
    var req = {
      StrategyId: strategyValue.strategyId,
      EmpId: strategyValue.empId,
      LegoId: this.queryparams.lId,
      StatementType: StatementType,
      CompanyId: this.userinfo.CompanyId,
      OwnerId: strategyValue.empId
    };

    this.UPStrategyService.DeleteStrategy(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.getPlanStrategy();
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully deleted." });
              }
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
        console.log("Error Happend");

      })
  }

  /**
   * Get Startegy Data
   * @return {void}@memberof StrategyComponent
   */
  getPlanStrategy() {
    var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    var req = {
      EmpId: selectedempId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: 'Select'
    };

    this.UPStrategyService.getAllStrategy(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.plan_strategy = res.result;
              var plan_strategydropdown = res.result;
              _.forEach(plan_strategydropdown, function (item) {
                item.strategy_Value = item.strategy_Value.replace(/<[^>]*>/g, '');
              });

              this.strategyListDropdown = this.MasterService.formatDataforDropdown("strategy_Value", plan_strategydropdown, "Select Strategy");

            }
            else {
              this.plan_strategy = [];
              this.strategyListDropdown = this.MasterService.formatDataforDropdown("strategy_Value", plan_strategydropdown, "Select Strategy");
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {


      })
  }

  /**
   * Edit Strategy Popu
   * @param  {any} strategy - Selected Strategy Data
   * @return 
   * @memberof StrategyComponent
   */
  editStrategy_dialog(strategy) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.editStrategy = strategy
    this.editStrategyDialog = true;
    setTimeout(() => {
      $("#txtstrategy").focus();
    }, 200);
  }
  //////////// STRATEGY ADD UPDATE DELETE END/////////////


  ////////////////GOALS TAB STARTS//////////////
  /**
   * Get Goals Data
   * @return {void}@memberof StrategyComponent
   */
  getPlanGoals() {
    var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    var req = {
      EmpId: selectedempId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: 'Select'
    };

    this.UPStrategyService.getAllGoals(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.goals = res.result;
              this.goals = _.forEach(this.goals, (g) => {
                g.deadLine = moment(g.deadLine).format(this.date_dispayformat.date_Format)
              })

              this.dragList_temp = _.clone(this.goals);
            }
            else {
              this.goals = [];
              this.dragList_temp = [];
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
      })
  }


  /**
   * Add Goals Data
   * @param  {any} goalsAdd - Goals Data 
   * @return 
   * @memberof StrategyComponent
   */
  addGoals(goalsAdd) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.getModeLevel();
    var strategyId;
    var strategy_Value;
    var position;
    if (goalsAdd.strategy != undefined || goalsAdd.strategy != null) {
      //goalsAdd.strategy.position = 0;
      position = goalsAdd.strategy.position;
    }
    else {
      position = 0;
    }

    if (goalsAdd.goals == null || goalsAdd.goals == undefined || goalsAdd.goals == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Goals Field Required." });
      return false;
    }

    else if (goalsAdd.deadLine == null || goalsAdd.deadLine == undefined || goalsAdd.deadLine == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "DeadLine Field Required." });
      return false;
    }

    if (goalsAdd.strategy == null || goalsAdd.strategy == undefined || goalsAdd.strategy == "") {
      strategyId = 0;
      strategy_Value = "";
    }
    else {
      strategyId = goalsAdd.strategy.strategyId;
      strategy_Value = goalsAdd.strategy.strategy_Value;
    }
    goalsAdd.deadLine = moment(goalsAdd.deadLine).format(AppConstant.API_CONFIG.DATE.apiFormat);
    var req = {
      GoalsId: 0,
      StrategyId: strategyId,
      EmpId: this.userinfo.EmployeeId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: 'AddUpdateGoals',
      Strategy: strategy_Value,
      Goals: goalsAdd.goals,
      DeadLine: goalsAdd.deadLine,
      Position: position,
      CompanyId: this.userinfo.CompanyId,
      Tabtype: "'Goals'",
      OwnerId: this.userinfo.EmployeeId
    };

    this.UPStrategyService.AddPlanGoals(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Added Successfully" });
                this.getPlanGoals();
                this.strategyValue = null;
                this.addgoal_dialog = false;
                this.editStrategyDialog = false;
                this.goalsAdd = [];
              }
            }
            else {
              this.addgoal_dialog = false;
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
        console.log("Error Happend");

      })
  }


  /**
   * Goals Table Drag and Drop Position 
   * @param  {any} event - Drag and Drop Index 
   * @return {void}@memberof StrategyComponent
   */
  reorderGoalsList(event) {
    var position = event.dropIndex + 1;
    var item = this.goals[event.dropIndex];
    if (event.dropIndex > event.dragIndex) {
      position = event.dropIndex;
      var item = this.goals[event.dropIndex - 1];
    }

    this.update_position(this.goals)
  }


  /**
   * Update Drag and Drop Position For Goals Table
   * @param  {any} dragList - Drag And Dropped Goals Data
   * @return 
   * @memberof StrategyComponent
   */
  update_position(dragList) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        this.getPlanGoals();
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    _.forEach(dragList, function (item, index) {
      item.position = index + 1;
    });
    this.dragList_temp = _.clone(this.dragList);
    if (this.dragList_temp == dragList) {

    }
    var goallist = [];
    _.forEach(dragList, (dList) => {
      goallist.push({
        "EmpId": dList.empId,
        "Position": dList.position,
        "GoalsId": dList.goalsId,
        "CompanyId": this.userinfo.CompanyId,
        "EMpId": this.userinfo.EmployeeId,
        "LegoId": this.queryparams.lId
      });
    });
    var req = {
      "GoalsModel": goallist,
      CompanyId: this.userinfo.CompanyId,
      EmpId: this.userinfo.EmployeeId,
      LegoId: this.queryparams.lId
    }
    this.UPStrategyService.UpdatePosition(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.getPlanGoals();
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
        console.log("Error Happend");

      })
  }

  /**
   * Edit Goals Modal Popup
   * @param  {any} goal - Selected Goals Data
   * @return 
   * @memberof StrategyComponent
   */
  EditGoal_Dialog(goal) {

    //goal.deadLine = moment(goal.deadLine).format(this.date_dispayformat.date_Format);
    var edit_goa = goal;
    var deadLine = moment(goal.deadLine.toDateString).format(this.bsConfig.dateInputFormat);
    goal = _.filter(this.dragList_temp, (d) => {
      return (d.goalsId == goal.goalsId)
    })

    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        this.getPlanGoals();
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }

    setTimeout(() => {
      $("#example1").focus();
    }, 200);

    this.viewgoal = true;

    //edit_goa.deadLine = moment(edit_goa.deadLine).format(this.date_dispayformat.date_Format);
    var stra_val = _.forEach(this.strategyListDropdown, (d) => { });
    stra_val = _.filter(stra_val, (t) => {
      return (t.label != 'Select Strategy');
    })
    stra_val = _.filter(stra_val, (d) => {
      return (d.value.strategyId == edit_goa.strategyId);
    })
    if (stra_val.length == 0) {
      edit_goa.strategy1 = "";
    }
    else {
      edit_goa.strategy1 = stra_val[0].value;
    }
    this.edit_goals = edit_goa;
    this.selectedItem = edit_goa.strategy;
    goal.strategy = edit_goa.strategy1.strategy_Value;
    goal.strategyId = edit_goa.strategy1.strategyId;
  }

  /**
   * Revert Modified Goals Data On Cancel
   * @return {void}@memberof StrategyComponent
   */
  updategoalCancel() {
    this.getPlanGoals();
    this.viewgoal = false;
  }

  /**
   * Update Goals Data
   * @param  {any} edit_goals - Selected Goals Data
   * @return 
   * @memberof StrategyComponent
   */
  updateGoals(edit_goals) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        this.getPlanGoals();
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var strategy;
    var strategyId;
    if (edit_goals.strategy1 == null || edit_goals.strategy1 == undefined || edit_goals.strategy1 == "") {

      strategy = "";
      strategyId = 0;
    }
    else {
      strategy = edit_goals.strategy1.strategy_Value;
      strategyId = edit_goals.strategy1.strategyId;
    }
    edit_goals.strategy = strategy;
    edit_goals.strategyId = strategyId;
    if (edit_goals.deadLine == null || edit_goals.deadLine == undefined || edit_goals.deadLine == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "DeadLine Field Required." });
      return false;
    }
    else if (edit_goals.goals == null || edit_goals.goals == undefined || edit_goals.goals == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Goals Field Required." });
      return false;
    }
    if (edit_goals.empId == null || edit_goals.empId == undefined || edit_goals.empId == "") {
      edit_goals.empId = this.userinfo.EmployeeId;
    }
    edit_goals.deadLine = moment(edit_goals.deadLine).format(AppConstant.API_CONFIG.DATE.apiFormat);
    var req = {
      GoalsId: edit_goals.goalsId,
      StrategyId: strategyId,
      EmpId: edit_goals.empId,
      StatementType: 'AddUpdateGoals',
      LegoId: edit_goals.legoId,
      Strategy: strategy,
      Goals: edit_goals.goals,
      DeadLine: edit_goals.deadLine,
      CompanyId: this.userinfo.CompanyId,
      Tabtype: "'Goals'",
      OwnerId: this.userinfo.EmployeeId
    };

    this.UPStrategyService.UpdatePlanGoals(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Updated Successfully" });
                this.getPlanGoals();
                this.viewgoal = false;
              }
            }
            else {
              this.viewgoal = false;
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Failed." });
              return false;
            }

          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            this.viewgoal = false;
            return false;
          }
        }
      }, error => {
        console.log("Error Happend");

      })
  }

  /**
   * Delete Goals In Table
   * @param  {any} goals - Selected Goals Data
   * @return 
   * @memberof StrategyComponent
   */
  DeleteGoals(goals) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        if (goals.empId == null || goals.empId == undefined) {
          goals.empId = this.userinfo.EmployeeId;
        }

        var req = {
          GoalsId: goals.goalsId,
          EmpId: goals.empId,
          LegoId: this.queryparams.lId,
          StatementType: 'Delete',
          CompanyId: this.userinfo.CompanyId,
          OwnerId: goals.empId
        };

        this.UPStrategyService.DeletePlanGoals(req)
          .then(res => {
            if (res) {
              if (!_.isEmpty(res)) {
                if (res.status == 1) {
                  this.getPlanGoals();
                  this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Deleted Successfully." });

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
            console.log("Error Happend");

          })
      }
    });
  }

  /**
   * Editor Ready Event
   * @param  {any} event - ckeditor event
   * @return {void}@memberof StrategyComponent
   */
  onReady(event): void {
    if (this.ckeditor) {
    }
  }

  ////////////////GOALS TAB END//////////////
  /**
   * Add Update Mission vision strategy Before Component Destroy
   * @param  {any} StatementType - Mission or Vision
   * @param  {any} tabtype - Mission or Vision
   * @return 
   * @memberof StrategyComponent
   */
  AddUpdatePlanMVS_beforeDestroy(StatementType, tabtype) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.planRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });

        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.getModeLevel();
    if (this.planMVS.planDetailId == undefined) {
      this.planMVS.planDetailId = 0;
    }

    if (this.planMVS.planDetailId == 0) {
      this.planMVS.ownerId = this.userinfo.EmployeeId;
    }
    else {
      //this.planMVS.ownerId = this.planMVS.empId;
      this.planMVS.ownerId = this.userinfo.EmployeeId;
    }
    var legoid;
    if (this.legoid_temp == this.queryparams.lId) {
      legoid = this.queryparams.lId;
    }
    else {
      legoid = this.legoid_temp;
    }
    var req = {
      PlanDetailId: this.planMVS.planDetailId,
      EmpId: this.userinfo.EmployeeId,
      Type: this.queryparams.mode,
      // LegoId: this.queryparams.lId,
      LegoId: legoid,
      StatementType: StatementType,
      Mission: this.planMVS.mission,
      Vision: this.planMVS.vision,
      Comments_Mission: this.planMVS.comments_Mission,
      Comments_Vision: this.planMVS.comments_Vision,
      CompanyId: this.userinfo.CompanyId,
      Tabtype: "'" + tabtype + "'",
      OwnerId: this.planMVS.ownerId
    };

    this.UPStrategyService.AddUpdatePlanMVS(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
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
        console.log("Error Happend");

      })
  }

}
