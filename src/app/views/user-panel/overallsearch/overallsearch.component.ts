import { Component, OnInit, ViewChild, AfterViewChecked, OnDestroy, ViewChildren, AfterViewInit } from '@angular/core';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { AppConstant } from '../../../app.constant';
import * as _ from 'lodash';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterTagService } from '../../../services/appservices/userpanelservices/filtertag.service';
import { ModuleService } from '../../../services/module.services';
import { MasterService } from '../../../services/master.service';

import { DefaultLayoutComponent } from '../../../containers/default-layout/default-layout.component';
import { Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonAppService } from '../../../services/appservices/common-app.service';

/**
 * Search Page
 * @export
 * @class OverallSearchComponent
 * @implements OnInit - views are initialized
 * @implements OnDestroy - Destroy component on leave
 * @implements AfterViewInit- views are initialized after first change detection 
 */
@Component({
  selector: 'app-overallsearch',
  templateUrl: './overallsearch.component.html',
  styleUrls: ['./overallsearch.component.css']
})
export class OverallSearchComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('input') vc;
  userinfo: any = [];
  strategy: any = [];
  assessment: any = [];
  document: any = [];
  legoname: any = [];
  legolist: any = [];
  searchresult_table: string = "300px";
  ownerlist: any = [];
  ownerdropdownlist: any = [];
  brand: any = [{ "brand": "Strategy" }, { 'brand': 'Assessment' }, { 'brand': 'Document' }];
  search_list: any = [];
  path: any;
  modellist: any = [];
  moduledropdownlist: any = [];
  params: any = [];
  search_info: any = {};
  queryparams: any = [];
  querystring: any = [];
  paramsSubscription: Subscription;
  /**
   * Initialize Date Format and Remove week nubers in calendar control
   * @memberof OverallSearchComponent
   */
  public bsConfig = {
    dateInputFormat: AppConstant.API_CONFIG.DATE.apiFormat,
    showWeekNumbers: false
  };
  selectedModuleId: any;
  selectedModelId: any;
  legoslist: any;

  /**
   * Child Level parameter
   * @type *
   * @memberof OverallSearchComponent
   */
  public module_levels: any = [];
  public SelectedModule: any;
  /**
   * Creates an instance of OverallSearchComponent.
   * @param  {MessageService} MessageService - Display Success or Error Message
   * @param  {LocalStorageService} LocalStorageService - Get or Set Local storage value
   * @param  {FilterTagService} FilterTagService - Post and Get Data To Filter Tag Service
   * @param  {ModuleService} ModuleService - Get Module List
   * @param  {MasterService} MasterService - Set Module and Owner Dropdown
   * @param  {DefaultLayoutComponent} DefaultLayoutComponent - Getting text value from this component
   * @param  {Router} router - Getting Router params
   * @memberof OverallSearchComponent
   */
  constructor(private MessageService: MessageService, private LocalStorageService: LocalStorageService, private FilterTagService: FilterTagService
    , public ModuleService: ModuleService, private MasterService: MasterService, public DefaultLayoutComponent: DefaultLayoutComponent, public router: Router, public CommonAppService: CommonAppService) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    this.OwnerList();
    this.search_info.searchall = true; 
  }
  /**
   * Implements default initialize
   * @return {void}@memberof OverallSearchComponent
   */
  ngOnInit() {
  }
  /**
   * Loads Data has been initialized
   * @return {void}@memberof OverallSearchComponent
   */
  ngAfterViewInit() {
    this.paramsSubscription = this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.t = params['t'];
      this.queryparams.isRef = params['isRef'];
      this.queryparams.str = params['str'];
      this.querystring = params;
      this.CommonAppService.checkPinmodule();
      setTimeout(() => {
        if (this.queryparams.isRef == "true" || this.queryparams.isRef == true) {
          $("#gotooriginal_tag").hide();
        }
        if (this.queryparams.t == 'overallsearch') {
          this.search_info.searchstr = this.querystring["str"];
          this.GetAllSearch();
        }
      }, 800);

    });
    this.vc.first.nativeElement.focus();
  }

  /**
   * Destroy component on page leave
   * @return {void}@memberof OverallSearchComponent
   */
  ngOnDestroy() {
    if (this.queryparams.isRef == "true" || this.queryparams.isRef == true) {
      $("#gotooriginal_tag").show();
    }
    this.paramsSubscription.unsubscribe();
  }

  /**
   * setting auto height for search page
   * @param  {*} event 
   * @return {void}@memberof OverallSearchComponent
   */
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + 2
    );

    //  sub tabs class: sub_tab_container
    var inner_res_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 60);
    var tabcontent_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 10);
    $('.main_ckeditor .cke_inner > .cke_contents').each(function () {
      var ck_res_h = inner_res_h - 75;
      $(this).css("height", ck_res_h + "px");
    });
    $("#collaboration-pg .tab-content").css("height", (tabcontent_h) + "px");
    var searchresult_componentheight = $("#searchresult_component").height() || 0;
    var headerheight = $("#overallsearch-pg .searchresult_panelheader").height() || 50;
    var searchresult_table = ((tabcontent_h - searchresult_componentheight - headerheight - 90) || 300) + "px";
    $("#searchresult_table .ui-datatable-scrollable-body").css("max-height", searchresult_table);
  }
  /**
   * Component views have been checked
   * @return {void}@memberof OverallSearchComponent
   */
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
  }

  /**
   * Get Data for given Keyword on Page Load
   * @return {void}@memberof OverallSearchComponent
   */
  GetAllSearch() {
    var selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    this.search_info.searchstr = this.queryparams.str;
    this.DefaultLayoutComponent.searchstring = "";

    var req = {
      CompanyId: this.userinfo.CompanyId,
      Type: 'T',
      TabType: this.search_info.searchstr,
      StatementType: "FilterSearch",
      ModelId: this.selectedModelId
    };

    this.FilterTagService.FilterSearch(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              this.search_list = result,

                this.modellist = this.ModuleService.moduleList;
              _.forEach(this.search_list, (l) => {
                l.path = this.getBreadcrumbData(l.legoId);
                l.path = this.module_levels;
                return l;
              })
              this.moduledropdownlist = this.MasterService.formatDataforDropdown("legoName", this.modellist, "--ALL--");

            }
            else {
              this.modellist = this.ModuleService.moduleList;
              this.moduledropdownlist = this.MasterService.formatDataforDropdown("legoName", this.modellist, "--ALL--");
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
   * Get Employee List
   * @return {void}@memberof OverallSearchComponent
   */
  OwnerList() {
    var req = {
      CompanyId: this.userinfo.CompanyId
    };
    this.FilterTagService.GetOwnerList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.ownerlist = res.result;
              this.ownerdropdownlist = this.MasterService.formatDataforDropdown("userName", this.ownerlist, "--ALL--");
            }
            else {
              //this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
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
   * Get Search Based on Filters(Documenttitle, module name. etc..)
   * @param  {any} search_info - Selected data
   * @return 
   * @memberof OverallSearchComponent
   */
  GetFilterSearch(search_info) {

    var statementType;
    if ((search_info.todate != "") && (search_info.fromdate == "")) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Document From Date required" });
      return false;
    }
    if (search_info.searchall == true) {
      //statementType = "SearchAll";
      statementType = "FilterSearch";
      search_info.docid = false; search_info.doctitle = false;
      search_info.modulename = false; search_info.moduleid = false;
    }

    if (search_info.docid == true || search_info.doctitle == true) {
      statementType = "DocumentSearch";
    }
    if (search_info.modulename == true || search_info.moduleid == true) {
      statementType = "ModuleSearch";
    }

    var legoId = 0, empId;
    if (search_info.module == undefined || search_info.module == null) {
      legoId = this.selectedModelId;
      this.legolist = this.selectedModuleId;
    }
    else {
      legoId = search_info.module.legoId;
      //statementType = "ModuleSearch";
    }
    var selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);

    if (search_info.owner == undefined) {
      empId = 0;
    }
    else {
      empId = search_info.owner.employeeId;
    }
    if (search_info.moduleid == true) {
      var value = Number(search_info.searchstr);
      if (Math.floor(value) == value) {
        statementType = 'IdBaseModuleSearch';
      } else {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "please Enter module ID." });
        return false;
      }
    }
    if (search_info.docid == true) {
      var value = Number(search_info.searchstr);
      if (Math.floor(value) == value) {
        statementType = 'IdBaseDocumentSearch';
      } else {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "please Enter Document ID." });
        return false;
      }
    }
    if (statementType == null || statementType == undefined) {
      statementType = "FilterSearch";
      search_info.searchall = true;
    }
    var req = {
      LegoId: selectedModel,
      CompanyId: this.userinfo.CompanyId,
      Type: 'T',
      TabType: search_info.searchstr,
      StatementType: statementType,
      ModuleId: legoId,
      ToDate: search_info.todate,
      Fromdate: search_info.fromdate,
      //OwnerId : search_info.owner.employeeId
      OwnerId: empId,
      legolist: (this.legoslist != null && this.legolist != undefined && this.legolist != "" ? this.legolist : this.selectedModelId),
      ModelId: this.selectedModelId
    };

    this.FilterTagService.FilterSearch(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              this.search_list = result;
              this.modellist = this.ModuleService.moduleList;
              _.forEach(this.search_list, (l) => {
                l.path = this.getBreadcrumbData(l.legoId);
                l.path = this.module_levels;
                return l;
              })

              this.moduledropdownlist = this.MasterService.formatDataforDropdown("legoName", this.modellist, "--ALL--");
            }
            else {
              this.search_list = res.result;
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
   * Get Lego Levels
   * @param  {any} legoId - Selected LegoId 
   * @return {void}@memberof OverallSearchComponent
   */
  getBreadcrumbData(legoId) {
    var module_levels = this.ModuleService.getparenttochildpath(legoId);
    this.module_levels = _.cloneDeep(module_levels);
    this.SelectedModule = this.module_levels[this.module_levels.length - 1];
    var w = $("#navigation_breadcrumb").width();
    var l = this.module_levels.length;
    this.ellipsisBreadCrumb(w, l);
  }
  /**
   * Setting LegoLevels and Children 
   * @param  {any} w - width
   * @param  {any} l - Length of legolevels
   * @return {void}@memberof OverallSearchComponent
   */
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

  /**
   * Redirection To selected Module Tab
   * @param  {any} path - Data For Redirection
   * @return {void}@memberof OverallSearchComponent
   */
  navigateRoute(path) {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    if (path.parentId != this.selectedModelId && path.parentId != 0 && path.parentId != null && path.parentId != undefined) {

      this.ModuleService.setModules();
      setTimeout(() => {
        this.redirecttoSelectedModule(path);
      }, 3000);
    }
    else {
      this.redirecttoSelectedModule(path);
    }
  }

  /**
   * Redirection To selected data
   * @param  {any} path - Data For Redirection( from navigateRoute)
   * @return {void}@memberof OverallSearchComponent
   */
  redirecttoSelectedModule(path) {
    var treemodules = this.ModuleService.getTreeModules();
    if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
      if (treemodules.length > 0) {
        var treenodes = _.cloneDeep(treemodules);
        var m = this.ModuleService.findChildModules(treenodes, null, path.legoId);
        if (!_.isEmpty(m)) {
          this.ModuleService.setSelectedModule(m);
        }
      }
    }
    var newParam = '';
    if (path.flag == 'Workflow') {
      newParam = '&tId=' + path.taskId + '&sId=' + path.subTaskId
    }
    this.router.navigateByUrl(path.url + newParam);
  }

  /**
   * Uncheck All but Filter checkbox
   * @param  {any} obj - Selected 
   * @return {void}@memberof OverallSearchComponent
   */
  fnCheckLinksall(obj) {
    if (obj == true) {
      this.search_info.modulename = false;
      this.search_info.moduleid = false;
      this.search_info.doctitle = false;
      this.search_info.docid = false;
    }
  }
  /**
   * Uncheck All but Module name checkbox
   * @param  {any} obj - Modulename Checkbox value 
   * @return {void}@memberof OverallSearchComponent
   */
  fnCheckmodname(obj) {
    if (obj == true) {
      this.search_info.searchall = false;
      this.search_info.moduleid = false;
      this.search_info.doctitle = false;
      this.search_info.docid = false;
    }
  }
  /**
   * Uncheck All but ModuleID checkbox
   * @param  {any} obj - ModuleId Checkbox value  
   * @return {void}@memberof OverallSearchComponent
   */
  fnCheckmodid(obj) {
    if (obj == true) {
      this.search_info.searchall = false;
      this.search_info.modulename = false;
      this.search_info.doctitle = false;
      this.search_info.docid = false;
    }
  }
  /**
   * Uncheck All but DocumentId checkbox
   * @param  {any} obj - DocumentId Checkbox value  
   * @return {void}@memberof OverallSearchComponent
   */
  fnCheckdocid(obj) {
    if (obj == true) {
      this.search_info.searchall = false;
      this.search_info.modulename = false;
      this.search_info.doctitle = false;
      this.search_info.moduleid = false;
    }
  }
  /**
   * Uncheck All but DocumentTitle checkbox
   * @param  {any} obj - DocumentTitle Checkbox value  
   * @return {void}@memberof OverallSearchComponent
   */
  fnCheckdocname(obj) {
    if (obj == true) {
      this.search_info.searchall = false;
      this.search_info.modulename = false;
      this.search_info.moduleid = false;
      this.search_info.docid = false;
    }
  }

  /**
   * Selected Module Data From DropDown
   * @param  {any} child - child module Data
   * @return {void}
   * @memberof OverallSearchComponent
   */
  getlegos(child) {
    if (!_.isEmpty(child)) {
      var legoid = child.legoId;
      var legos = this.ModuleService.getCurrentLegos(legoid);
      if (!_.isEmpty(legos)) {
        this.legoslist = _.join(legos, ',');
      }
      else {
        this.legoslist = child.legoId;
      }
    }
    else {
      this.legoslist = null;
    }
    console.log(this.legoslist);
  }

  /**
   * Redirect to Default Module and Tab choose in preference setting
   * @return {void}@memberof OverallSearchComponent
   */
  Exit_search() {
    this.router.navigate(['/home']);
  }
}
