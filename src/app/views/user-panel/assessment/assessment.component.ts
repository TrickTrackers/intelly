import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { component_config } from '../../../_config';
import { ModuleService } from '../../../services/module.services';
import { UPAssessmentService } from '../../../services/appservices/userpanelservices/upassessment.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { Router, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { CommonAppService } from '../../../services/appservices/common-app.service';
/**
 * Used to GET , add, update, delete strength, weakness, Threats, opportunity
 * @export
 * @class AssessmentComponent
 * @implements OnInit
 * @implements AfterViewInit
 * @implements AfterViewChecked
 * @implements OnDestroy
 */
@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  @ViewChild("ckeditor") ckeditor: any;
  display: boolean = false;
  viewgoal: boolean = false;
  addgoal: boolean = false;
  config;
  value: string = "Summary";
  assessment: any = {};
  assessment_cont: any = {};

  tabheading: any = {};
  legolevel: any;
  /**
   * Initialize object for subscription
   * @private
   * @memberof AssessmentComponent
   */
  private _subscriptions = new Subscription();
  public queryparams: any = [];
  public querystring;
  userinfo: any = [];
  /**
   * Declare assessment data temp
   * @type *
   * @memberof AssessmentComponent
   */
  public assessment_temp: any = {};
  performanceStatus: boolean = false;
  employeelist_display: boolean = false;
  employeelist: any = [];
  tempselectedparticipated: any = [];
  temp_nonselectedparticipated: any = [];
  checkrights: any = [];
  hasRights: boolean = true;
  /**
   * Performance Data Initialized
   * @type *
   * @memberof AssessmentComponent
   */
  PerformanceInfo: any = {
    legoId: 0,
    companyId: 0,
    ownerId: 0,
    employeeId: 0,
    performanceId: 0,
    options: 0,
    addPPerformanceReviewers: [],
  }
  vaildMsgType: number = 0;
  public isRefModule = false;
  public refreshEditor = false;
  /**
   * Creates an instance of AssessmentComponent.
   * @param  {LocalStorageService} LocalStorageService - Get or Set Local Storage Data 
   * @param  {Router} router - Router Navigation and Get router Params
   * @param  {MessageService} MessageService - Display success or error message
   * @param  {UPAssessmentService} UPAssessmentService - service to post or get data
   * @param  {ChangeDetectorRef} cd - change detection 
   * @param  {ModuleService} ModuleService - get rights data
   * @memberof AssessmentComponent
   */
  constructor(private LocalStorageService: LocalStorageService, private router: Router, private MessageService: MessageService
    , private UPAssessmentService: UPAssessmentService, private cd: ChangeDetectorRef, public ModuleService: ModuleService,public CommonAppService:CommonAppService) {
    this.config = component_config.cktool_config_full;
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    if (!_.isEmpty(this.userinfo)) {
      this.PerformanceInfo.companyId = ((this.userinfo.CompanyId != null && this.userinfo.CompanyId != undefined && this.userinfo.CompanyId != "") ? this.userinfo.CompanyId : null);
      this.PerformanceInfo.employeeId = ((this.userinfo.EmployeeId != null && this.userinfo.EmployeeId != undefined && this.userinfo.EmployeeId != "") ? this.userinfo.EmployeeId : null);
      this.PerformanceInfo.ownerId = ((this.userinfo.EmployeeId != null && this.userinfo.EmployeeId != undefined && this.userinfo.EmployeeId != "") ? this.userinfo.EmployeeId : null);
    }
    //this.legolevel = 2;
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
      this.Assessmentmenu();
      this.getAssessment();
      this.activateModuleTabs(this.queryparams.t);
    }));
    this.Assessmentmenu();
  }
  /**
   * Check Rights For Assessment Tab
   * @return {void}@memberof AssessmentComponent
   */
  checkRights() {
    this.hasRights = false;
    this.checkrights = this.ModuleService.getModuleRights();
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.mode == 'E') {
        var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
        var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
        if (this.userinfo.EmployeeId == selectedempId || this.userinfo.EmployeeId == managerId) {
          this.hasRights = true;
        }
      }
      else if (this.queryparams.mode != 'E' && this.checkrights.assessmentRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
      this.Assessmentmenu();
    }
  }

  /**
   * Set Tab Names Based on Employee Or Module
   * @return {void}@memberof AssessmentComponent
   */
  Assessmentmenu() {
    this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
    });
    if (this.queryparams.mode == 'E') {
      this.tabheading.Strength = "Areas Needing Improvement";
      this.tabheading.Weaknesses = "Achievement of Goals";
      this.tabheading.Opportunities = "Performance Objectives";
      this.tabheading.Threats = "Peer Feedback";
      this.performanceStatus = true;
    }
    else {
      this.tabheading.Strength = "Strength";
      this.tabheading.Weaknesses = "Weaknesses";
      this.tabheading.Opportunities = "Opportunities";
      this.tabheading.Threats = "Threats";
      this.performanceStatus = false;
    }
  }
  /**
   * Destroy the Component on Page Leave
   * @return {void}@memberof AssessmentComponent
   */
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }
  /**
   * Intialize data
   * @return {void}@memberof AssessmentComponent
   */
  ngOnInit() {
    this.initSubscribe();
  }
  /**
   * Check For Module Rights on Update
   * @return {void}@memberof AssessmentComponent
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
   * Get Strength, Weakness, Opportunity and Threats Data for Module
   * @return {void}@memberof AssessmentComponent
   */
  getAssessment() {
    var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    var req = {
      EmpId: selectedempId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: 'Select'
    };
    this.refreshEditor = false;
    this.UPAssessmentService.getAllAssessment(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (!_.isEmpty(res.result)) {
                this.assessment.strength = (res.result.assess_list[0].Strength == null) ? "" : res.result.assess_list[0].Strength;
                this.assessment.weakness = (res.result.assess_list[0].Weakness == null) ? "" : res.result.assess_list[0].Weakness;
                this.assessment.opportunity = (res.result.assess_list[0].Opportunity == null) ? "" : res.result.assess_list[0].Opportunity;
                this.assessment.threat = (res.result.assess_list[0].Threat == null) ? "" : res.result.assess_list[0].Threat;
                this.assessment.assessmentId = res.result.assess_list[0].AssessmentId;
                this.assessment.empId = res.result.assess_list[0].EmpId;
                this.assessment.legoId = res.result.assess_list[0].LegoId;
                this.assessment_temp = _.clone(this.assessment);
              }
              else {
                this.assessment.strength = "";
                this.assessment.weakness = "";
                this.assessment.opportunity = "";
                this.assessment.threat = "";
                this.assessment_temp = _.clone(this.assessment);
              }

              
            }
            else {
              this.assessment.strength = "";
              this.assessment.weakness = "";
              this.assessment.opportunity = "";
              this.assessment.threat = "";
              this.assessment_temp = _.clone(this.assessment);
            }
          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
        this.refreshEditor = true;
      }, error => {

      })
  }

  /**
   * Get Router Params For Selected Module
   * @return {void}@memberof AssessmentComponent
   */
  getModeLevel() {
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
    }));
  }

  /**
   * Add / update Strength, Weakness, Opportunity and Threats
   * @param  {any} StatementType - AddUpdateStrength, AddUpdateWeakness, AddUpdateOpportunity and AddUpdateThreats
   * @param  {any} tabtype - Strength, Weakness, Opportunity and Threats
   * @return 
   * @memberof AssessmentComponent
   */
  AddUpdateAssessment(StatementType, tabtype) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E' || (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.assessmentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {

        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        this.assessment.strength = this.assessment_temp.strength;
        this.assessment.weakness = this.assessment_temp.weakness;
        this.assessment.opportunity = this.assessment_temp.opportunity;
        this.assessment.threat = this.assessment_temp.threat;

        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    
    if (this.assessment.strength == undefined && this.assessment.weakness == undefined
      && this.assessment.opportunity == undefined && this.assessment.threat == undefined) {
      return;
    }
    if (this.assessment.assessmentId == undefined) {
      this.assessment.assessmentId = 0;

    }

    if (this.queryparams.mode == 'E') {
      if (tabtype == 'Strength') {
        tabtype = 'Areas Needing Improvement';
      }
      else if (tabtype == 'Weaknessess') {
        tabtype = 'Achievement of Goals';
      }
      else if (tabtype == 'Opportunities') {
        tabtype = 'Performance Objectives';
      }
      else if (tabtype == 'Threats') {
        tabtype = 'Peer Feedback';
      }
    }
    var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    // var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
    if (this.assessment.empId == null || this.assessment.empId == undefined || this.assessment.empId == ""
      || this.assessment.empId == 0) {
        if(this.queryparams.mode == 'E')
        {
          this.assessment.ownerId = selectedempId;
          this.assessment.empId = selectedempId;
        }
        else
        {
          this.assessment.ownerId = 0;
          this.assessment.empId = 0;
        }
      
    }
    else {
      this.assessment.ownerId = selectedempId;
      this.assessment.empId = selectedempId;
    }

    var req = {
      AssessmentId: this.assessment.assessmentId,
      EmpId: this.assessment.empId,
      Type: this.queryparams.mode,
      LegoId: this.queryparams.lId,
      StatementType: StatementType,
      Strength: this.assessment.strength,
      Weakness: this.assessment.weakness,
      Opportunity: this.assessment.opportunity,
      Threat: this.assessment.threat,
      CompanyId: this.userinfo.CompanyId,
      Tabtype: "'" + tabtype + "'",
      OwnerId: this.assessment.ownerId
    };

    this.UPAssessmentService.AddUpdateAssessment(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result != null) {
                // this.getAssessment();
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

  /**
   * Set Selected Tab Data
   * @param  {TabDirective} data - Tab Details
   * @return {void}@memberof AssessmentComponent
   */
  onSelect(data: TabDirective): void {
    // if(this.queryparams.mode == 'E')
    // {
    //   if(this.value == 'Strengh')
    // }
    this.value = data.heading;
    this.querystring = data.id;
    var newparams = this.queryparams;
    newparams.t = this.querystring;
    this.router.navigate(["/assessment"], { queryParams: newparams });
    this.activateModuleTabs(this.querystring);
    if (this.value == "Performance Reviewer") {
      this.getPerformanceReviewer();
    }
    setTimeout(() => {
      $("#txtstrength").focus();
    }, 200);
  }

  /**
   * Set Auto Height For Assessment Page
   * @param  {*} event - 
   * @return {void}@memberof AssessmentComponent
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

    $('.main_ckeditor .cke_inner > .cke_contents').each(function () {
      var ck_res_h = inner_res_h - 75;
      $(this).css("height", ck_res_h + "px");
    });
    $("#assessment-pg .tab-content").css("height", (tabcontent_h) + "px");
    $("#assessment-pg .child_tabcontent").each(function () {
      $(this).css("height", (tabcontent_h - 25) + "px");
    });

  }
  /**
   * Initialize Views 
   * @return {void}@memberof AssessmentComponent
   */
  ngAfterViewInit() {
    this.setElementAutoHeight(null);
    this.ModuleService.activateModuleTabs(this.queryparams);
    this.activateModuleTabs(this.queryparams.t);
          setTimeout(() => {
        if ( this.cd !== null &&
          this.cd !== undefined &&
          !(this.cd["ChangeDetectorRef"]) ) {
              this.cd.detectChanges();
      }
      },250);

  }
  /**
   * Component views have been checked on cahnge detection
   * @return {void}@memberof AssessmentComponent
   */
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
  }

  /**
   * Set to Activate Selected Tabs
   * @param  {any} hasvalue - Tab Name (strength, Weakness, summary etc.)
   * @return {void}@memberof AssessmentComponent
   */
  activateModuleTabs(hasvalue) {
    this.querystring = hasvalue;

    if (this.modulesubTabset) {
      var activeTab = (this.querystring == 'stab_assessment_summary') ? 0 :
        (this.querystring == 'stab_assessment_strength') ? 1 :
          (this.querystring == "stab_assessment_weakness") ? 2 :
            (this.querystring == "stab_assessment_opportunities") ? 3 :
              (this.querystring == "stab_assessment_threats") ? 4 :
                (this.querystring == "stab_assessment_reviewer") ? 5 : 0;

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
   * Display Reviewer Popup
   * @return {void}@memberof AssessmentComponent
   */
  showDialog_Reviewer() {
    this.employeelist_display = true;
  }

  /**
   * Close Reviewer Popup
   * @return {void}@memberof AssessmentComponent
   */
  hideDialog_Reviewer() {
    this.employeelist_display = false;
  }

  /**
   * Get Performance Reviewer Data
   * @return {void}@memberof AssessmentComponent
   */
  getPerformanceReviewer() {
    this.PerformanceInfo.options = 1;
    this.PerformanceInfo.legoId = this.queryparams.lId;
    if (!_.isEmpty(this.PerformanceInfo)) {
      this.UPAssessmentService.getAllPerformanceReviewer(this.PerformanceInfo)
        .then(res => {
          if (res) {
            if (!_.isEmpty(res)) {
              if (res.status == 1) {
                var result = res.result;
                if (!_.isEmpty(result)) {
                  this.employeelist = result.employeeLists;
                  this.tempselectedparticipated = result.performanceReviewerLists;
                  this.mapperformanceReviewer();
                }
              }
              else {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "List not Found!." });
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
  }

  /**
   * Map For Performance Reviewer data
   * @return {void}@memberof AssessmentComponent
   */
  mapperformanceReviewer() {
    this.temp_nonselectedparticipated = _.filter(this.employeelist, (r) => {
      return (!_.isEmpty(_.find(this.tempselectedparticipated, (c) => {
        return (c.employeeId == r.employeeId)
      })))
    });
  }

  /**
   * Save Performance Reviewer Data
   * @return {void}@memberof AssessmentComponent
   */
  SavePerformanceReviewers() {
    var deleteReview = _.omitBy(this.tempselectedparticipated, (m) => {
      return (!_.isEmpty(_.find(this.temp_nonselectedparticipated, (c) => {
        return (c.employeeId == m.employeeId)
      })))
    });
    var addedReview = _.filter(this.temp_nonselectedparticipated, (m) => {
      return (_.isEmpty(_.find(this.tempselectedparticipated, (c) => {
        return (c.employeeId == m.employeeId)
      })))
    });
    var filterdeleteReview = _.filter(this.employeelist, (m) => {
      return (!_.isEmpty(_.find(deleteReview, (c) => {
        return (c.employeeId == m.employeeId)
      })));
    })
    if (!_.isEmpty(filterdeleteReview)) {
      _.map(filterdeleteReview, (m) => {
        m.isDeleted = 1;
      });
    }
    if (!_.isEmpty(addedReview)) {
      _.map(addedReview, (m) => {
        m.isDeleted = 0;
      });
    }
    var finalReview = (!_.isEmpty(filterdeleteReview) && !_.isEmpty(addedReview) ? _.union(filterdeleteReview, addedReview) : !_.isEmpty(filterdeleteReview) ? filterdeleteReview : !_.isEmpty(addedReview) ? addedReview : null);
    if (!_.isEmpty(finalReview)) {
      this.PerformanceInfo.options = 1;
      this.PerformanceInfo.legoId = this.queryparams.lId;
      this.PerformanceInfo.addPerformanceReviewers = finalReview;
      if (!_.isEmpty(this.PerformanceInfo)) {
        this.vaildMsgType = 1;
        this.crudPerformanceReviewers(this.PerformanceInfo);
      }
    }
    this.hideDialog_Reviewer();
  }

  /**
   * Delete Selected Employee Reviewer Data
   * @param  {any} selectedemployee - Selected Employee Data
   * @return {void}@memberof AssessmentComponent
   */
  deleteReviewer(selectedemployee) {
    this.PerformanceInfo.options = 2;
    this.PerformanceInfo.legoId = this.queryparams.lId;
    this.PerformanceInfo.performanceId = selectedemployee.performanceId;
    if (!_.isEmpty(this.PerformanceInfo)) {
      if (selectedemployee.performanceId != null && selectedemployee.performanceId != undefined && selectedemployee.performanceId != "") {
        this.vaildMsgType = 2;
        this.crudPerformanceReviewers(this.PerformanceInfo);
      }
    }
  }

  /**
   * Add, Update , Delete Performance Reviewers Data
   * @param  {any} PerformanceInfo - Performance Reviewer Data for selected Employee
   * @return {void}@memberof AssessmentComponent
   */
  crudPerformanceReviewers(PerformanceInfo) {
    if (!_.isEmpty(PerformanceInfo)) {
      this.UPAssessmentService.SaveReviewer(PerformanceInfo)
        .then(res => {
          if (res) {
            if (!_.isEmpty(res)) {
              var msg = "";
              switch (this.vaildMsgType) {
                case 1:
                  msg = "Performance reviewer saved successful!"
                  break;
                case 2:
                  msg = "Performance reviewer deleted successful!"
                  break;
                default:
                  break;
              }
              if (res.status == 1) {
                var result = res.result;
                if (result != null) {
                  this.employeelist = result.employeeLists;
                  this.tempselectedparticipated = result.performanceReviewerLists;
                  this.mapperformanceReviewer();
                  this.MessageService.add({ severity: 'success', summary: 'Success', detail: msg });
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
  }

  /**
   * Initialize Editor
   * @return {void}@memberof AssessmentComponent
   */
  onReady(): void {
    if (this.ckeditor) {
      //this.getAssessment();
    }
  }

}
