import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AppConstant } from '../../../../app.constant';
import { LocalStorageService } from '../../../../shared/local-storage.service';
import { DetailsService } from '../../../../services/appservices/userpanelservices/details.service';
import * as _ from 'lodash';
import { FilterTagService } from '../../../../services/appservices/userpanelservices/filtertag.service';
import { CommonAppService } from '../../../../services/appservices/common-app.service';
@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  private _subscriptions = new Subscription();
  public queryparams: any = [];
  public show_manager_dialog: boolean = false;
  public show_subordinates_dialog: boolean = false;
  unit_emp_list: any = [];
  subordinateslist: any = [];
  userinfo: any = [];
  rmanagerSelection: true;
  selectedEmployeeId;
  selectedReportingManager: any = {
    employeeId: "",
    employeeName: "",
    eMail: "",
    address1: "",
    phoneNo: ""
  };
  subordindate_emp_list: any = [];
  rsubordindateSelection: true;
  selectedReportingSubordinate: any = {
    employeeId: "",
    employeeName: "",
    eMail: "",
    address1: "",
    phoneNo: ""
  }
  empfiltertag: any = [];
  selectedModuleId = 0;
  constructor(private router: Router, private LocalStorageService: LocalStorageService, private DetailsService: DetailsService, private FilterTagService: FilterTagService, public CommonAppService: CommonAppService) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedEmployeeId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
  }
  ngOnInit() {
    this.subscribeOninit();
    this.UnitEmployeeList();
    this.EmployeefilterTagList()
  }
  ngAfterViewInit() {
    this.showHideMenu();
  }
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
    this.showHideMenu();
  }
  ngOnDestroy() {

  }
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
    var inner_res_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 60);
    var tabcontent_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 10);
    setTimeout(() => {
      $("#reporting-pg").css("height", tabcontent_h + "px");
    }, 500);
  }
  showownerlist(rmanagerSelection) {
    this.rmanagerSelection = rmanagerSelection;
    this.show_manager_dialog = true;
  }
  deleteSubordinates(event) {
    if (event.subordinateDetailId != null && event.subordinateDetailId != undefined) {
      var req = {
        companyId: this.userinfo.CompanyId,
        employeeId: this.selectedEmployeeId,
        subordinateDetailId: event.subordinateDetailId,
        employeeLegoId: this.selectedModuleId,
        options: 3
      }
      if (!_.isEmpty(req)) {
        this.crudReportingInfo(req);
      }
    }
  }
  subscribeOninit() {
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.showHideMenu();
      this.CommonAppService.checkPinmodule();
      //this.UnitEmployeeList();
    }));
  }
  UnitEmployeeList() {
    //this.MessageService.clear();
    // if (this.queryparams.mode != 'E') {
    //   if (this.checkrights.detailsRights == 'Readonly') {
    //     this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
    //     return false;
    //   }
    // }
    var req = {
      employeeId: this.selectedEmployeeId,
      companyId: this.userinfo.CompanyId,
      options: 1
    };

    this.DetailsService.getReportingList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.unit_emp_list = res.result.employeeInfos;
              this.subordindate_emp_list = _.cloneDeep(res.result.employeeInfos);
              var manageId = _.clone(this.selectedEmployeeId);
              this.subordinateslist = res.result.employeeSubordinateInfos;
              if (!_.isEmpty(res.result.employeeManagerInfos)) {
                manageId = res.result.employeeManagerInfos[0].employeeId;
                // this.selectedReportingManager = res.result.employeeManagerInfos[0];
              }
              var emp = _.find(this.unit_emp_list, (emp) => {
                return (emp.employeeId == manageId)
              });
              if (!_.isEmpty(emp)) {
                this.selectedReportingManager = emp;
                //this.selectedReportingSubordinate = emp;
              }
              if (!_.isEmpty(this.subordinateslist)) {
                var subordId = this.subordinateslist[0].employeeId;
                var emp = _.find(this.unit_emp_list, (emp) => {
                  return (emp.employeeId == subordId)
                });
                if (!_.isEmpty(emp)) {
                  this.selectedReportingSubordinate = emp;
                }
                // this.selectedReportingManager = res.result.employeeManagerInfos[0];
              }
            }
            else {
              this.unit_emp_list = [];
              return false;
            }

          }
        }
      }, error => {
        //console.log("Error Happend");

      })
  }
  crudReportingInfo(req) {
    this.DetailsService.crudReportingInfo(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              if (req.options == 1) {
                var emp = _.find(this.unit_emp_list, (emp) => {
                  return (emp.employeeId == res.result.managerId)
                });
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID, res.result.managerId);
                if (!_.isEmpty(emp)) {
                  this.selectedReportingManager = emp;
                }
              }
              if (req.options == 2 || req.options == 3) {
                this.subordinateslist = res.result.employeeSubordinateInfos;
                if (res.result.employeeSubordinateInfos.length > 0) {
                  var subordId = res.result.employeeSubordinateInfos[0].subordinateId;
                  var emp = _.find(this.unit_emp_list, (emp) => {
                    return (emp.employeeId == subordId)
                  });
                  if (!_.isEmpty(emp)) {
                    this.selectedReportingSubordinate = emp;
                  }
                }
              }
            }
          }
        }
      });
  }
  onSelectEmployee(event) {
    this.selectedReportingManager = event.data;
    this.show_manager_dialog = false;
    if (this.rmanagerSelection == true) {
      var req = {
        companyId: this.userinfo.CompanyId,
        managerId: this.selectedReportingManager.employeeId,
        employeeId: this.selectedEmployeeId,
        employeeLegoId: this.selectedModuleId,
        options: 1
      }
      if (!_.isEmpty(req)) {
        this.crudReportingInfo(req);
      }
    }

  }
  showHideMenu(open?) {
    open = this.queryparams.mode == 'E' ? 1 : 0
    if (open) {
      $('body').removeClass('sidebar-fixed');
      $("#customsidebar").addClass("d-none");
      $("#sidemenuHolder").addClass("d-none");
      $("#pinmodule_tag").hide();
    }
    if (!open) {
      $('body').addClass('sidebar-fixed');
      $("#customsidebar").removeClass("d-none");
      $("#sidemenuHolder").removeClass("d-none");
      $("#pinmodule_tag").show();
    }
  }
  showsubordinateslist(rsubordindateSelection) {
    this.rsubordindateSelection = rsubordindateSelection;
    this.show_subordinates_dialog = true;
  }
  onSelectSubordinate(event) {
    this.selectedReportingSubordinate = event.data;
    this.show_subordinates_dialog = false;
    if (this.rsubordindateSelection == true) {
      var req = {
        companyId: this.userinfo.CompanyId,
        subordinateId: this.selectedReportingSubordinate.employeeId,
        employeeId: this.selectedEmployeeId,
        employeeLegoId: this.selectedModuleId,
        //SubordinateDetailId: 0,
        options: 2
      }
      if (!_.isEmpty(req)) {
        this.crudReportingInfo(req);
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
  View_filterInfo(empid) {
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID, empid);
    // this.jobdesc = _.find(this.unit_emp_list_clone, (d) => {
    //   return d.employeeId == empid;
    // })

    //this.value = "Employee Information";
    var querystring = "stab_details_processinfo";
    var newparams = this.queryparams;
    newparams.t = querystring;
    this.router.navigate(["/details"], { queryParams: newparams });
    //this.activateModuleTabs(this.querystring);
  }
  view_unitEmployees() {
    var querystring = "stab_details_uemplist";
    var newparams = this.queryparams;
    newparams.t = querystring;
    this.router.navigate(["/details"], { queryParams: newparams });
  }
}
