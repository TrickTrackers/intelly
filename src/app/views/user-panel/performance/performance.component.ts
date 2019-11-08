import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { component_config } from '../../../_config';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { MasterService } from '../../../services/master.service';
import { PerformanceService } from '../../../services/appservices/performance.service';
import { AppConstant } from '../../../app.constant';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ModuleService } from '../../../services/module.services';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { CommonAppService } from '../../../services/appservices/common-app.service';

/**
 * add,edit,remove,view user performance informations 
 * @export
 * @class PerformanceComponent
 * @implements OnInit
 * @implements OnDestroy
 * @implements AfterViewInit
 * @implements AfterViewChecked
 */
@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})

export class PerformanceComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  /**
   * get html elementRef and properties
   * @type TabsetComponent
   * @memberof PerformanceComponent
   */
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  performanceMetricForm: FormGroup;
  performanceMetricFormErrorObj = {} as any;
  userinfo: any;
  mode: any;
  isSaveMetrics: boolean = true;
  validMessage: number = 0;
  metricsList: any = [];
  metricsReference: any = [];
  clone_metricsReference: any = [];
  bindReferenceMetricsLists: any = [];
  submoduleMetricsLists: any = [];
  treeSubmoduleMetrics: any = [];
  btnName: string = "";
  isOpen = false;
  /**
   * configure the date format
   * @memberof PerformanceComponent
   */
  public displayFormat = AppConstant.API_CONFIG.DATE.displayFormat;
  /**
   * configure the date format
   * @memberof PerformanceComponent
   */
  //public apiFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  public date_dispayformat: any = [];
  /**
   * request data model structure for perfomance details from api 
   * @memberof PerformanceComponent
   */
  performanceModel = {
    legoId: 0,
    companyId: 0,
    employeeId: 0,
    legoMetricsId: 0,
    metric: "",
    target: "",
    actual: "",
    comments: "",
    position: 0,
    pulledlegoid: 0,
    date: "",
    referenceMetricsLists: null,
    options: 0,
    selectedMode: 0,
    currentLegos: ""
  }
  /**
   * request data model structure for Stategy Exection details from api 
   * @memberof PerformanceComponent
   */
  StategyExectionModel = {
    legoId: 0,
    companyId: 0,
    employeeId: 0,
    planDetailId: 0,
    strategyId: 0,
    goalsId: 0,
    comments: "",
    options: 0,
    selectedMode: 0,
    goalsList: null
  }
  dialogHeaderName: string = "";
  commantsType: number = 0;
  NewComments: string = "";
  goalsList: any = [];
  clone_goalsList: any = [];
  strategyList: any = [];
  missionVisionList: any = [];
  /**
   * datepicker configuation here
   * @memberof PerformanceComponent
   */
  public bsConfig = {
    dateInputFormat: this.date_dispayformat.date_Format,
    showWeekNumbers: false
  };

  visiblePerformanceDialog: boolean = false;
  confirm: boolean = false;
  cols: any[];
  ref: any[];
  text: string;
  referencedisplay: boolean = false;

  config;
  test;
  value: string = "Metric";
  selectedMetrics: any = {};
  temp_selectedreferencelist: any = [];
  missionVisionData: any;
  org_selectedreferencelist: any = [];
  /**
   * declare the Subscription for get the information from another forms
   * @private
   * @memberof PerformanceComponent
   */
  private _subscriptions = new Subscription();
  checkrights: any = [];
  hasRights: boolean = true;
  public queryparams: any = [];
  public querystring: any = [];
  edit_comments: any;
  headerTitle: string = "";
  selectedMode: number = 1;
  selectedModuleId: any;
  public isRefModule = false;
  /**
   * Creates an instance of PerformanceComponent.
   * @param  {MasterService} masterService 
   * @param  {PerformanceService} performanceService 
   * @param  {LocalStorageService} localStorageService 
   * @param  {MessageService} messageService display warning error messages
   * @param  {FormBuilder} formBuilder configure the validation messages
   * @param  {ActivatedRoute} activatedRoute find current active route
   * @param  {ConfirmationService} confirmationService confirmation dialog box service 
   * @param  {ModuleService} ModuleService 
   * @param  {Router} router 
   * @param  {ChangeDetectorRef} cd 
   * @memberof PerformanceComponent
   */
  constructor(private masterService: MasterService, private performanceService: PerformanceService
    , private localStorageService: LocalStorageService, private messageService: MessageService, private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute, private confirmationService: ConfirmationService, private CommonAppService: CommonAppService
    , public ModuleService: ModuleService, private router: Router, private cd: ChangeDetectorRef) {
    this.selectedModuleId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.config = component_config.cktool_config_full;
    //this.performanceModel.legoId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.userinfo = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.isRefModule = this.ModuleService.checkIsRefmodule();
    if (this.userinfo != undefined && this.userinfo != null) {
      this.performanceModel.companyId = parseInt(this.userinfo.CompanyId);
      this.performanceModel.employeeId = parseInt(this.userinfo.EmployeeId);
    }
    // this._subscriptions.add(this.activatedRoute.queryParams
    //   .filter(params => params.mode)
    //   .subscribe(params => {
    //     this.mode = params.mode;
    //   }));
    // if (this.mode != null && this.mode != '') {
    //   this.performanceModel.selectedMode = (this.mode == 'T' || this.mode == 'S' || this.mode == 'O' || this.mode == 'P') ? 1 : (this.mode == 'E') ? 2 : 1; // 1 means T,S,O,P ; 2 means E  
    //   this.selectedMode = (this.mode == 'T' || this.mode == 'S' || this.mode == 'O' || this.mode == 'P') ? 1 : (this.mode == 'E') ? 2 : null; // 1 means T,S,O,P ; 2 means E 
    // } 

    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.mode = this.queryparams.mode;
      this.performanceModel.legoId = this.queryparams.lId;
      this.CommonAppService.checkPinmodule(); 
      if (this.mode != null && this.mode != '') {
        this.performanceModel.selectedMode = (this.mode == 'T' || this.mode == 'S' || this.mode == 'O' || this.mode == 'P') ? 1 : (this.mode == 'E') ? 2 : 1; // 1 means T,S,O,P ; 2 means E  
        this.selectedMode = (this.mode == 'T' || this.mode == 'S' || this.mode == 'O' || this.mode == 'P') ? 1 : (this.mode == 'E') ? 2 : null; // 1 means T,S,O,P ; 2 means E 
      }
      this.buildFormObject();
      this.buildFormErrorobject();
      this.date_dispayformat = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
      this.bsConfig = {
        dateInputFormat: this.date_dispayformat.date_Format,
        showWeekNumbers: false
      };  
      //this.getMetricList();
    }));

    this.activateModuleTabs(this.queryparams.t);
  }

  /**
   * check user rights
   * @return {void}@memberof PerformanceComponent
   */
  checkRights() {
    this.hasRights = false;
    this.checkrights = this.ModuleService.getModuleRights();
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.mode == 'E') {
        var selectedempId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
        var managerId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
        if (this.userinfo.EmployeeId == selectedempId || this.userinfo.EmployeeId == managerId) {
          this.hasRights = true;
        }
      }
      else if (this.queryparams.mode != 'E' && this.checkrights.performanceRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
    }
  }

  /**
   * performance components initialization here 
   * @return {void}@memberof PerformanceComponent
   */
  ngOnInit() {
    this.initSubscribe();
    // this.getMetricList();
    this._subscriptions.add(
      this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
        this.date_dispayformat.date_Format = preferencesettings.date_Format;
        this.bsConfig = {
          dateInputFormat: this.date_dispayformat.date_Format,
          showWeekNumbers: false
        };
        this.getMetricList();
      }));
  }
  /**
   *  subscribe events which should be destroy after hide element
   * @return {void}@memberof PerformanceComponent
   */
  initSubscribe() {
    this._subscriptions.add(this.ModuleService.getModuleUpdates().subscribe(updates => {
      // this.cartcount = count;
      this.getMetricList();
    }));
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
   * Destroy the performance component
   * @return {void}@memberof PerformanceComponent
   */
  ngOnDestroy() {
    //console.log("Component will be destroyed");
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }
  /**
   * Form grop and form control configuration code here
   * @return {void}@memberof PerformanceComponent
   */
  buildFormObject() {
    this.performanceMetricForm = this.formBuilder.group({
      legoMetricsId: new FormControl(0),
      metric: new FormControl('', { validators: Validators.required }),
      target: new FormControl('', { validators: Validators.required }),
      actual: new FormControl('', { validators: Validators.required }),
      date: new FormControl('', { validators: Validators.required })
    });
  }
  /**
   * add the required field validate error message code here
   * @return {void}@memberof PerformanceComponent
   */
  buildFormErrorobject() {
    this.performanceMetricFormErrorObj = {
      metric: { required: "Metric is required" },
      target: { required: "Target is required" },
      actual: { required: "Actual is required" },
      date: { required: "Date is required" }
    }
  }
  /**
   * Form action and validate the form submit event code here
   * @return 
   * @memberof PerformanceComponent
   */
  onMetricFormSubmit() {
    this.messageService.clear();
    if (this.performanceMetricForm.status == "INVALID") {
      var errorMessage = this.masterService.getFormErrorMessage(this.performanceMetricForm, this.performanceMetricFormErrorObj);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;
    }
    else {
      if (this.edit_comments == undefined || this.edit_comments == null || this.edit_comments == "") {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Comments is required" });
        return false;
      }
      else {
        var performanceFormData = this.performanceMetricForm.getRawValue();
        this.performanceModel.legoMetricsId = (performanceFormData.legoMetricsId != null && performanceFormData.legoMetricsId != "") ? performanceFormData.legoMetricsId : 0;
        this.performanceModel.metric = performanceFormData.metric;
        this.performanceModel.target = performanceFormData.target;
        this.performanceModel.actual = performanceFormData.actual;
        this.performanceModel.date = (performanceFormData.date != null && performanceFormData.date != "") ? moment(performanceFormData.date).format(AppConstant.API_CONFIG.DATE.apiFormat) : moment(new Date()).format(AppConstant.API_CONFIG.DATE.apiFormat);
        this.performanceModel.comments = this.edit_comments;
        if (this.selectedMode != null && this.selectedMode != undefined) {
          if (this.isSaveMetrics == true) {
            switch (this.selectedMode) {
              case 1:
                this.performanceModel.options = 1;
                break;
              case 2:
                this.performanceModel.options = 2;
                break;
              default:
                break;
            }
            this.validMessage = 1;
          }
          else {
            switch (this.selectedMode) {
              case 1:
                this.performanceModel.options = 3;
                break;
              case 2:
                this.performanceModel.options = 4;
                break;
              default:
                break;
            }
            this.validMessage = 2;
          }
          this.crudMetricsTab(this.performanceModel);
        }
      }
    }
  }
  /**
   * create,read update, delete functionality code here
   * @param  {*} req 
   * @return 
   * @memberof PerformanceComponent
   */
  crudMetricsTab(req: any) {
    this.messageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.messageService.clear();
    if (!_.isEmpty(req)) {
      var legos = this.ModuleService.getCurrentLegos();
      //console.log(legos);
      if (!_.isEmpty(legos)) {
        this.performanceModel.currentLegos = _.join(legos, ',');
      }
      else {
        this.performanceModel.currentLegos = this.selectedModuleId;
      }
      // if (this.performanceModel.currentLegos != "" && this.performanceModel.currentLegos != undefined && this.performanceModel.currentLegos != null) {
      var errorMsg = "";
      var errorstate = "";
      this.performanceService.crudMetricsInfo(req)
        .then(data => {
          if (data.status == 1) {
            // errorMsg = data.message;
            // errorstate = "success"
            this.hideAddPerformanceDialog();
            if (!_.isEmpty(data.result)) {
              this.metricsList = data.result.moduleMetrics;
              this.metricsReference = data.result.referenceMetrics;
              this.clone_metricsReference = _.cloneDeep(this.metricsReference);
              this.bindReferenceMetricsLists = data.result.referenceMetricsLists;
              this.submoduleMetricsLists = data.result.submoduleMetricsLists;
              // if (!_.isEmpty(this.submoduleMetricsLists)) {
              //   this.treeSubmoduleMetrics = this.performanceService.submoduleUnflattenEntities(this.submoduleMetricsLists)
              this.selectedModuleId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
              this.treeSubmoduleMetrics = this.ModuleService.updateTreeObjects(this.selectedModuleId, "performanceChange", this.submoduleMetricsLists);
              // }
              this.mapselectedReferenceMetrics();
            }
          }
          else {
            // errorstate = "error"
            // errorMsg = data.message;
            this.hideAddPerformanceDialog();
            if (!_.isEmpty(data.result)) {
              this.metricsList = data.result.moduleMetrics;
              this.metricsReference = data.result.referenceMetrics;
              this.clone_metricsReference = _.cloneDeep(this.metricsReference);
              this.bindReferenceMetricsLists = data.result.referenceMetricsLists;
              this.submoduleMetricsLists = data.result.submoduleMetricsLists;
              // if (!_.isEmpty(this.submoduleMetricsLists)) {
              //   this.treeSubmoduleMetrics = this.performanceService.submoduleUnflattenEntities(this.submoduleMetricsLists)
              this.selectedModuleId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
              this.treeSubmoduleMetrics = this.ModuleService.updateTreeObjects(this.selectedModuleId, "performanceChange", this.submoduleMetricsLists);
              // }
              this.mapselectedReferenceMetrics();
            }
          }
          if (data.message)
            switch (data.message) {
              case "1":
                errorMsg = "successful!.";
                errorstate = "success"
                break;
              case "2":
                errorMsg = "Can't to be add the metrics. Because currently selected module is reference module.";
                errorstate = "error"
                this.validMessage = 0;
                break;
              case "3":
                errorMsg = "failed!.";
                errorstate = "error"
                break;
              case "4":
                errorMsg = "List not found";
                errorstate = "error"
                this.validMessage = 0;
                break;
              case "5":
                errorMsg = "Something went wrong";
                errorstate = "error"
                this.validMessage = 0;
                break;
              default:
                errorMsg = "Something went wrong";
                errorstate = "error"
                this.validMessage = 0;
                break;

            }
          switch (this.validMessage) {
            case 1:
              errorMsg = "Saved " + errorMsg;
              break;
            case 2:
              errorMsg = "Updated " + errorMsg;
              break;
            case 3:
              errorMsg = "Deleted " + errorMsg;
              break;
            case 4:
              errorMsg = "Reordered " + errorMsg;
              break;
            default:
              errorMsg = errorMsg;
              break;
          }
          this.messageService.add({ severity: errorstate, summary: errorstate, detail: errorMsg });
        });
      // }
    }
  }
  /**
   * assign the parameter value for get data from api
   * @return {void}@memberof PerformanceComponent
   */
  getMetricList() {
    if (this.selectedMode != null && this.selectedMode != undefined) {
      var legos = this.ModuleService.getCurrentLegos();
      if (!_.isEmpty(legos)) {
        this.performanceModel.currentLegos = _.join(legos, ',');
      }
      else {
        this.performanceModel.currentLegos = this.selectedModuleId;
      }
      switch (this.selectedMode) {
        case 1:
          this.performanceModel.options = 1;
          break;
        case 2:
          this.performanceModel.options = 2;
          break;
        default:
          break;
      }
      if (this.performanceModel.options != null && this.performanceModel.options != undefined && this.performanceModel.options != 0) {
        this.getMetricslist(this.performanceModel);
      }
    }
  }
  // 
  /**
   * get the record from api call code here
   * @param  {*} req 
   * @return {void}@memberof PerformanceComponent
   */
  getMetricslist(req: any) {
    this.messageService.clear();
    if (!_.isEmpty(req)) {
      var errorMsg = "";
      var errorstate = "";
      this.performanceService.getList(req)
        .then(data => {
          if (data.status == 1) {
            if (!_.isEmpty(data.result)) {
              this.metricsList = data.result.moduleMetrics;
              this.metricsReference = data.result.referenceMetrics;
              this.clone_metricsReference = _.cloneDeep(this.metricsReference);
              this.bindReferenceMetricsLists = data.result.referenceMetricsLists;
              this.submoduleMetricsLists = data.result.submoduleMetricsLists || [];
              // if (!_.isEmpty(this.submoduleMetricsLists)) {
              this.selectedModuleId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
              this.treeSubmoduleMetrics = this.ModuleService.updateTreeObjects(this.selectedModuleId, "performanceChange", this.submoduleMetricsLists);
              // this.treeSubmoduleMetrics = this.performanceService.submoduleUnflattenEntities(this.submoduleMetricsLists)
              // }
              this.mapselectedReferenceMetrics();
              // this.temp_selectedreferencelist = _.cloneDeep(this.metricsReference);
              errorstate = "success"
              errorMsg = data.message;
            }
          }
          else {
            errorstate = "error"
            errorMsg = data.message;
          }
          //this.messageService.add({ severity: errorstate, summary: errorstate, detail: errorMsg });
        });
    }
  }
  /**
   * Map selectd reference metrics code here
   * @return {void}@memberof PerformanceComponent
   */
  mapselectedReferenceMetrics() {
    this.temp_selectedreferencelist = _.filter(this.bindReferenceMetricsLists, (r) => {
      return (!_.isEmpty(_.find(this.metricsReference, (c) => {
        return (c.legoMetricsId == r.legoMetricsId)
      })))
    });
  }
  /**
   * Edit the metric list items code here
   * @param  {any} event 
   * @return {void}@memberof PerformanceComponent
   */
  editMetricList(event) {
    if (!_.isEmpty(event)) {
      event.date = (event.date != null && event.date != "" && event.date != undefined) ? moment(event.date).format(this.date_dispayformat.date_Format) : moment(new Date()).format(this.date_dispayformat.date_Format);
      this.selectedMetrics = event;
      this.headerTitle = "Edit Performance Metric";
      this.showAddPerformanceDialog();
      this.isSaveMetrics = false;
      this.btnName = "Update";
      this.masterService.mappingFormData(this.performanceMetricForm, this.selectedMetrics);
      this.edit_comments = this.selectedMetrics.comments;
      //console.log(this.edit_comments);
    }
  }
  /**
   * Reorder the metric item position code here
   * @param  {any} event 
   * @return {void}@memberof PerformanceComponent
   */
  reorderMetricList(event) {
    var position = event.dropIndex + 1;
    var item = this.metricsList[event.dropIndex];
    if (event.dropIndex > event.dragIndex) {
      position = event.dropIndex;
      var item = this.metricsList[event.dropIndex - 1];
    }
    this.performanceModel.position = position;
    this.performanceModel.legoMetricsId = item.legoMetricsId;
    this.validMessage = 4;
    if (this.selectedMode != null && this.selectedMode != undefined) {
      switch (this.selectedMode) {
        case 1:
          this.performanceModel.options = 5;
          break;
        case 2:
          this.performanceModel.options = 6;
          break;
        default:
          break;
      }
      if (this.performanceModel.options != null && this.performanceModel.options != undefined && this.performanceModel.options != 0) {
        this.crudMetricsTab(this.performanceModel);
      }
    }
  }
  /**
   * detete the metric list code here 
   * @param  {any} event get the metric data and then assign the value
   * @return verify the user rights
   * @memberof PerformanceComponent
   */
  deleteMetricList(event) {
    this.messageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (event.legoMetricsId != null && event.legoMetricsId != undefined && event.legoMetricsId != "" && event.legoMetricsId != "0") {
      this.confirmationService.confirm({
        header: "Delete",
        message: 'Are you sure that you want to perform this action?',
        accept: () => {
          this.validMessage = 3;
          this.performanceModel.legoMetricsId = event.legoMetricsId;
          if (this.selectedMode != null && this.selectedMode != undefined) {
            switch (this.selectedMode) {
              case 1:
                this.performanceModel.options = 7;
                break;
              case 2:
                this.performanceModel.options = 8;
                break;
              default:
                break;
            }
            if (this.performanceModel.options != null && this.performanceModel.options != undefined && this.performanceModel.options != 0) {
              this.crudMetricsTab(this.performanceModel);
            }
          }
        }
      });
    }
  }
  /**
   * Edit the Reference Metric items code here
   * @param  {any} event 
   * @return {void}@memberof PerformanceComponent
   */
  editReferenceMetricList(event) {
    if (!_.isEmpty(event)) {
      this.selectedMetrics = event;
      this.headerTitle = "Edit Performance Metric";
      this.showAddPerformanceDialog();
      this.isSaveMetrics = false;
      this.btnName = "Update";
      this.masterService.mappingFormData(this.performanceMetricForm, this.selectedMetrics);
      this.edit_comments = this.selectedMetrics.comments;
    }
  }
  /**
   * Reorder the reference metric items code here
   * @param  {any} event 
   * @return {void}@memberof PerformanceComponent
   */
  reorderReferenceMetric(event) {
    var position = event.dropIndex + 1;
    var item = this.metricsReference[event.dropIndex];
    if (event.dropIndex > event.dragIndex) {
      position = event.dropIndex;
      var item = this.metricsReference[event.dropIndex - 1];
    }
    this.performanceModel.position = position;
    this.performanceModel.legoMetricsId = item.legoMetricsId;
    this.validMessage = 4; 
    if (this.selectedMode != null && this.selectedMode != undefined) {
      switch (this.selectedMode) {
        case 1:
          this.performanceModel.options = 11;
          break;
        case 2:
          this.performanceModel.options = 12;
          break;
        default:
          break;
      }
      if (this.performanceModel.options != null && this.performanceModel.options != undefined && this.performanceModel.options != 0) {
        this.crudMetricsTab(this.performanceModel);
      }
    }
  }
  /**
   * Delete the reference metric items code here
   * @param  {any} event 
   * @return 
   * @memberof PerformanceComponent
   */
  deleteReferenceMetricList(event) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (event.legoMetricsId != null && event.legoMetricsId != undefined && event.legoMetricsId != "" && event.legoMetricsId != "0") {
      this.confirmationService.confirm({
        header: "Delete",
        message: 'This will perminantly delete this metric. Are you sure you want to proceed?',
        accept: () => {
          this.validMessage = 3
          this.performanceModel.legoMetricsId = event.legoMetricsId;
          if (this.selectedMode != null && this.selectedMode != undefined) {
            switch (this.selectedMode) {
              case 1:
                this.performanceModel.options = 13;
                break;
              case 2:
                this.performanceModel.options = 14;
                break;
              default:
                break;
            }
            if (this.performanceModel.options != null && this.performanceModel.options != undefined && this.performanceModel.options != 0) {
              this.crudMetricsTab(this.performanceModel);
            }
          }
        }
      });
    }
  }
  /**
   * save the reference metrics items
   * @return {void}@memberof PerformanceComponent
   */
  saveReferenceMetrics() {
    var deleteMet = _.omitBy(this.metricsReference, (m) => {
      return (!_.isEmpty(_.find(this.temp_selectedreferencelist, (c) => {
        return (c.legoMetricsId == m.legoMetricsId)
      })))
    });
    var addedMet = _.filter(this.temp_selectedreferencelist, (m) => {
      return (_.isEmpty(_.find(this.metricsReference, (c) => {
        return (c.legoMetricsId == m.legoMetricsId)
      })))
    });
    var filterdeleteMet = _.filter(this.bindReferenceMetricsLists, (m) => {
      return (!_.isEmpty(_.find(deleteMet, (c) => {
        return (c.legoMetricsId == m.legoMetricsId)
      })));
    })
    if (!_.isEmpty(filterdeleteMet)) {
      _.map(filterdeleteMet, (m) => {
        m.isDeleted = 1;
      });
    }
    if (!_.isEmpty(addedMet)) {
      _.map(addedMet, (m) => {
        m.isDeleted = 0;
      });
    }
    var finalReferenceList = (!_.isEmpty(filterdeleteMet) && !_.isEmpty(addedMet) ? _.union(filterdeleteMet, addedMet) : !_.isEmpty(filterdeleteMet) ? filterdeleteMet : !_.isEmpty(addedMet) ? addedMet : null);

    if (!_.isEmpty(finalReferenceList)) {
      this.performanceModel.referenceMetricsLists = finalReferenceList;
      this.validMessage = 1
      if (this.selectedMode != null && this.selectedMode != undefined) {
        switch (this.selectedMode) {
          case 1:
            this.performanceModel.options = 9;
            break;
          case 2:
            this.performanceModel.options = 10;
            break;
          default:
            break;
        }
        if (this.performanceModel.options != null && this.performanceModel.options != undefined && this.performanceModel.options != 0) {
          this.crudMetricsTab(this.performanceModel);
        }
      }
    }
    this.referencedisplay = false
  }
  /**
   * open model dialog box and change button and header name configuration
   * @return {void}@memberof PerformanceComponent
   */
  AddPerformanceMetric() {
    this.headerTitle = "Add Performance Metric";
    this.btnName = "Add";
    this.edit_comments = "";
    this.isSaveMetrics = true;
    this.showAddPerformanceDialog();
  }
  /**
   * show the metics form code here
   * @return check the user rights 
   * @memberof PerformanceComponent
   */
  showAddPerformanceDialog() {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.performanceMetricForm.reset();
    this.visiblePerformanceDialog = true;
    setTimeout(() => {
      $("#txt_metric").focus();
    }, 10);
    this.performanceMetricForm.controls["date"].patchValue(moment(Date.now()).format(this.date_dispayformat.date_Format))
  }
  /**
   * hide the metics form/dialog box code here
   * @return {void}@memberof PerformanceComponent
   */
  hideAddPerformanceDialog() {
    this.performanceMetricForm.reset();
    this.visiblePerformanceDialog = false;
  }
  /**
   * show the add reference dialog window code here
   * @return check the user rights 
   * @memberof PerformanceComponent
   */
  getReferenceMetrics() {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.mapselectedReferenceMetrics();
    this.referencedisplay = true;
  }

  /**
   * get the stategy Exection data from api
   * @param  {*} req pass the paramenter values for api
   * @return {void}@memberof PerformanceComponent
   */
  getStategyExectionlist(req: any) {
    this.messageService.clear();
    if (!_.isEmpty(req)) {
      var errorMsg = "";
      var errorstate = "";
      this.performanceService.getStategyList(req)
        .then(data => {
          if (data.status == 1) {
            //console.log(data.result);
            this.goalsList = data.result.goalsList;
            this.clone_goalsList = _.cloneDeep(this.goalsList);
            this.strategyList = data.result.strategyList;
            //this.missionVisionList = data.result.mvsList;
            if (data.result.mvsList.length > 0) {
              this.missionVisionData = data.result.mvsList[0];
            }
            errorstate = "success"
            errorMsg = data.message;
          }
          else {
            errorstate = "error"
            errorMsg = data.message;
          }
          //this.messageService.add({ severity: errorstate, summary: errorstate, detail: errorMsg });
        });
    }
  }

  /**
   * create,read update, delete functionality code here
   * @param  {*} req pass the paramenter values for api
   * @return {void}@memberof PerformanceComponent
   */
  updateStategy(req: any) {
    this.messageService.clear();
    if (!_.isEmpty(req)) {
      var errorMsg = "";
      var errorstate = "";
      this.performanceService.updateStategyExection(req)
        .then(data => {
          if (data.status == 1) {
            this.goalsList = data.result.goalsList;
            this.clone_goalsList = _.cloneDeep(this.goalsList);
            this.strategyList = data.result.strategyList;
            if (data.result.mvsList.length > 0) {
              this.missionVisionData = data.result.mvsList[0];
            }

            errorMsg = data.message;
            errorstate = "success"
          }
          else {
            this.goalsList = data.result.goalsList;
            errorstate = "error"
            errorMsg = data.message;

          }
          switch (this.validMessage) {
            case 1:
              errorMsg = "Mission comments saved " + errorMsg;
              break;
            case 2:
              errorMsg = "Vision comments saved " + errorMsg;
              break;
            case 3:
              errorMsg = "Strategy comments saved " + errorMsg;
              break;
            case 4:
              errorMsg = "Goals comments saved " + errorMsg;
              break;
            case 5:
              errorMsg = "Goals percentage saved " + errorMsg;
              break;
            default:
              errorMsg = "";
              break;
          }
          this.messageService.add({ severity: errorstate, summary: errorstate, detail: errorMsg });
        });
    }
  }
  /**
   * save mission comments
   * @param  {any} item pass the paramenter values for api
   * @return check the user rights
   * @memberof PerformanceComponent
   */
  saveMissionComments(item) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.StategyExectionModel.comments = (item.commentsMission != null && item.commentsMission != undefined ? item.commentsMission : "");
    this.StategyExectionModel.planDetailId = (item.planDetailId != null && item.planDetailId != undefined && item.planDetailId != "") ? item.planDetailId : 0;
    this.StategyExectionModel.options = 1;
    this.validMessage = 1;
    if (this.StategyExectionModel.planDetailId != null && this.StategyExectionModel.planDetailId != 0 && this.StategyExectionModel.planDetailId != undefined) {
      this.updateStategy(this.StategyExectionModel);
    }
  }
  /**
   * save vission comments
   * @param  {any} item pass the paramenter values for api
   * @return check the user rights
   * @memberof PerformanceComponent
   */
  saveVisionComments(item) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.StategyExectionModel.comments = (item.commentsVision != null && item.commentsVision != undefined ? item.commentsVision : "");
    this.StategyExectionModel.planDetailId = (item.planDetailId != null && item.planDetailId != undefined && item.planDetailId != "") ? item.planDetailId : 0;
    this.StategyExectionModel.options = 2;
    this.validMessage = 2;
    if (this.StategyExectionModel.planDetailId != null && this.StategyExectionModel.planDetailId != 0 && this.StategyExectionModel.planDetailId != undefined) {
      this.updateStategy(this.StategyExectionModel);
    }
  }
  /**
   * save stategy comments
   * @param  {any} item pass the paramenter values for api
   * @return check the user rights
   * @memberof PerformanceComponent
   */
  saveStategyComments(item) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.StategyExectionModel.comments = (item.commentsStrategy != null && item.commentsStrategy != undefined ? item.commentsStrategy : "");
    this.StategyExectionModel.strategyId = (item.strategyId != null && item.strategyId != undefined && item.strategyId != "") ? item.strategyId : 0;
    this.StategyExectionModel.options = 3;
    this.validMessage = 3;
    if (this.StategyExectionModel.strategyId != null && this.StategyExectionModel.strategyId != 0 && this.StategyExectionModel.strategyId != undefined) {
      this.updateStategy(this.StategyExectionModel);
    }
  }
  /**
   * save goals comments
   * @param  {any} item pass the paramenter values for api
   * @return check the user rights
   * @memberof PerformanceComponent
   */
  saveGoalsComments(item) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.StategyExectionModel.comments = (item.comments != null && item.comments != undefined ? item.comments : "");
    this.StategyExectionModel.goalsId = (item.goalsId != null && item.goalsId != undefined && item.goalsId != "") ? item.goalsId : 0;
    this.StategyExectionModel.options = 4;
    this.validMessage = 4;
    if (this.StategyExectionModel.goalsId != null && this.StategyExectionModel.goalsId != 0 && this.StategyExectionModel.goalsId != undefined) {
      this.updateStategy(this.StategyExectionModel);
    }
  }
  /**
   * change update flag in goals items
   * @param  {any} event 
   * @return {void}@memberof PerformanceComponent
   */
  setUpdate(event) {
    if (!_.isEmpty(event)) {
      _.map(this.clone_goalsList, (m) => {
        if (m.goalsId == event.goalsId) {
          m.isUpdated = 1;
        }
      });
      this.saveGoalsPercentage();
    }
  }
  /**
   * save goals percentage.
   * @return check user rights
   * @memberof PerformanceComponent
   */
  saveGoalsPercentage() {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var updatedGoals = _.filter(this.clone_goalsList, (c) => {
      return (c.isUpdated == 1);
    });
    var finalupdatedGoals = _.filter(this.goalsList, (m) => {
      return (!_.isEmpty(_.find(updatedGoals, (c) => {
        if (m.percentage == "") {
          m.percentage = 0;
        }
        return (c.goalsId == m.goalsId)
      })));
    })
    if (!_.isEmpty(finalupdatedGoals)) {
      this.StategyExectionModel.goalsList = finalupdatedGoals;
      this.validMessage = 5;
      this.StategyExectionModel.options = 5;
      this.updateStategy(this.StategyExectionModel);
    }
  }
  /**
   * save the comments
   * @param  {any} item 
   * @return check the user rights
   * @memberof PerformanceComponent
   */
  saveComments(item) {
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.performanceRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.StategyExectionModel.comments = (item.comments != null && item.comments != undefined ? item.comments : "");
    this.StategyExectionModel.goalsId = (item.goalsId != null && item.goalsId != undefined && item.goalsId != "") ? item.goalsId : 0;
    switch (this.commantsType) {
      case 1:
        this.StategyExectionModel.options = 1;
        break;
      case 2:
        this.StategyExectionModel.options = 2;
        break;
      case 3:
        this.StategyExectionModel.options = 3;
        break;
      case 4:
        this.StategyExectionModel.options = 4;
        break;
      default:
        break;
    }
    // if (this.StategyExectionModel.goalsId != null && this.StategyExectionModel.goalsId != 0 && this.StategyExectionModel.goalsId != undefined) {
    //   this.updateStategy(this.StategyExectionModel);
    // } 
  }

  /**
   * change tab directive
   * @param  {TabDirective} data 
   * @return {void}@memberof PerformanceComponent
   */
  onSelect(data: TabDirective): void {
    this.querystring = data.id;
    var newparams = this.queryparams;
    newparams.t = this.querystring;
    this.router.navigate(["/performance"], { queryParams: newparams });
    //setTimeout(() => this.ckeditor.focus(), 250);
    this.activateModuleTabs(this.querystring);

    this.value = data.heading;
    if (data.heading != null && data.heading != "" && data.heading == "Strategy Execution") {
      this.StategyExectionModel.legoId = (this.performanceModel.legoId != null && this.performanceModel.legoId != 0) ? this.performanceModel.legoId : 0;
      this.StategyExectionModel.companyId = (this.performanceModel.companyId != null && this.performanceModel.companyId != 0) ? this.performanceModel.companyId : 0;
      this.StategyExectionModel.employeeId = (this.performanceModel.employeeId != null && this.performanceModel.employeeId != 0) ? this.performanceModel.employeeId : 0;
      if (this.mode != null && this.mode != '') {
        this.StategyExectionModel.selectedMode = (this.mode == 'T' || this.mode == 'S' || this.mode == 'O' || this.mode == 'P') ? 1 : (this.mode == 'E') ? 2 : null; // 1 means T,S,O,P ; 2 means E  
        this.StategyExectionModel.options = (this.mode == 'T' || this.mode == 'S' || this.mode == 'O' || this.mode == 'P') ? 1 : (this.mode == 'E') ? 2 : null; // 1 means T,S,O,P ; 2 means E 
      }
      if (this.StategyExectionModel.options != null && this.StategyExectionModel.options != 0 && this.StategyExectionModel.options != undefined
        && this.StategyExectionModel.selectedMode != null && this.StategyExectionModel.selectedMode != 0 && this.StategyExectionModel.selectedMode != undefined) {
        this.getStategyExectionlist(this.StategyExectionModel);
      }
    }
  }
  /**
   * set element auto height code here
   * @param  {*} event get element height
   * @return {void}@memberof PerformanceComponent
   */
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + 2
    );
    //  sub tabs class: sub_tab_container
    var res_h = res_h - 70;

    if ($("body").hasClass("pinmodule")) {
      res_h += 98;
    }
    if (!isNaN(res_h)) {
      $("#performance-pg .custom_scrollpane").css("height", res_h + "px");
    }
  }
  /**
   * additional initialization and call the metrics data
   * @return {void}@memberof PerformanceComponent
   */
  ngAfterViewInit() {
    // this.setElementAutoHeight(null);
    // var querystring;
    // this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
    //   this.querystring = params['t'];

    // }));
    // this.activateModuleTabs(this.querystring);
    this.ModuleService.activateModuleTabs(this.queryparams);
    setTimeout(() => {
      this.getMetricList();
    }, 1000);

  }
  /**
   * callback method that is invoked immediately after the default change detector has completed 
   * @return {void}@memberof PerformanceComponent
   */
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
    var querystring;
    // this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
    //   this.querystring = params['t'];

    // }));
    // this.activateModuleTabs(this.querystring);
      //     setTimeout(() => {
      //   if ( this.cd !== null &&
      //     this.cd !== undefined &&
      //     !(this.cd["ChangeDetectorRef"]) ) {
      //         this.cd.detectChanges();
      // }
      // },250);
  }

  /**
   * get and set selected tab from querystring value
   * @param  {any} hasvalue assign query string value
   * @return {void}@memberof PerformanceComponent
   */
  activateModuleTabs(hasvalue) {
    this.querystring = hasvalue;

    if (this.modulesubTabset) {
      var activeTab = (this.querystring == 'stab_performance_metrics') ? 0 :
        (this.querystring == 'stab_performance_strategyexe') ? 1 : 0;

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
   * show mission comments data
   * @param  {*} Missioncomment 
   * @param  {any} $event showing current event value
   * @return {void}@memberof PerformanceComponent
   */
  showMissionComments(Missioncomment: any, $event) {
    // $( ".ui-overlaypanel" ).each(function( index ) {
    //   $( this ).hide();
    // });
    Missioncomment.show($event);
  }
}



