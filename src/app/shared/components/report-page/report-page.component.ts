import { Component, OnInit, Output, Input, EventEmitter, HostListener, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';

import { CommonAppService } from '../../../services/appservices/common-app.service';
import { MasterService } from '../../../services/master.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { LocalStorageService } from '../../../shared/local-storage.service';

import * as _ from 'lodash';
import * as $ from 'jquery';
import { AppConstant } from '../../../app.constant';
import * as moment from 'moment';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ModuleService } from '../../../services/module.services';
import { ReportsService } from '../../../services/appservices/userpanelservices/reports.service';


@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss']
})

export class ReportPageComponent implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('reportpage') private elementRef: ElementRef;
  userinfo: any = [];
  companyId: any;
  employeeId: any;
  module_report_dialog: boolean = false;
  task_report_dialog: boolean = false;
  module_report_list: any = [];
  task_report_list: any = [];
  response_report_list: any = [];
  response_report_dialog: boolean = false;
  public date_dispayformat: any = [];
  rowGroupMetadata: any;
  constructor(
    private MasterService: MasterService, private MessageService: MessageService, private ReportsService: ReportsService,
    private CommonAppService: CommonAppService, private LocalStorageService: LocalStorageService,
    private router: Router, public ModuleService: ModuleService) {

    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    if (this.userinfo != undefined && this.userinfo != null) {
      this.companyId = parseInt(this.userinfo.CompanyId);
      this.employeeId = parseInt(this.userinfo.EmployeeId);
    }
    this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);

  }

  ngOnInit() {

  }
  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
    var querystring;
    this.router.routerState.root.queryParams.subscribe((params: Params) => {
    });
    //this.activateModuleTabs(this.querystring);
  }

  show_module_dialog() {
    var selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var req = {
      companyId: this.companyId,
      modelId: selectedModelId,
      employeeId: this.employeeId
    };
    this.ReportsService.GetModuleReports(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.module_report_list = res.result;
              this.module_report_dialog = true;

              //////////////////////////////////
              var selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel)
              _.forEach(this.module_report_list, (r)=>{
                r.legoId = r.moduleId;
                r.isMetrics = 1;
                r.tempId = "";
                r.tempmodcount = "";
                r.tempmodname = "";
                return r;
              });

              this.module_report_list = this.ModuleService.updateTreeObjects(selectedModelId, "reportChange", this.module_report_list);
              
              
              //////////////////////


              //this.MessageService.add({ severity: 'success', summary: 'Success', detail: res.message });    
            }
            else {
              this.module_report_list = res.result;
              this.module_report_dialog = true;
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
    setTimeout(() => {
      $("#btnprintMymodule").focus();
    }, 100);
  }
  

  moduleReport(id) {
    var createtable = "";
    createtable += '' + '<style type="text/css">'
      + 'table , tr, th, td {'
      + 'border:1px solid #000;'
      + 'border-collapse: collapse;'
      + 'table-layout: auto;'
      + '}'
      + '</style>'
      + "<h3 align='center'>My Report</h1>"
      + "<table id='tbl_MyReport'>"
      + "<thead>"
      + "<tr>"
      + "<th style='width:10%; text-align:center'>Module ID</th>"
      + "<th style='width:15%; text-align:center'>Module Name</th>"
      + "<th style='width:10%; text-align:center'>No. of SubModule</th>"
      + "<th style='width:15%; text-align:center'>SubModule Name</th>"
      + "<th style='width:10%; text-align:center'>No. of Tasks</th>"
      + "<th style='width:15%; text-align:center'>Task Name</th>"
      + "<th style='width:10%; text-align:center'>No. of Docments</th>"
      + "<th style='width:15%; text-align:center'>Document Title</th>"
      + "</tr>"
      + "</thead>";
    +"<tbody>";
    if (this.module_report_list.length > 0) {
      for (var i = 0; i < this.module_report_list.length; i++) {
        createtable += "<tr>"
          + "<td align='center' style='width:10%;'> " + this.module_report_list[i].moduleId + " </td>"
          + "<td align='left' style='width:15%;'>" + (this.module_report_list[i].moduleName || '') + "</td>"
          + "<td align='center' style='width:10%;'>" + this.module_report_list[i].subModuleCount + "</td>"
          + "<td align='left' style='width:15%;'>" + (this.module_report_list[i].sub_ModuleName || '') + "</td>"
          + "<td align='center' style='width:10%;'>" + this.module_report_list[i].taskListCount + "</td>"
          + "<td align='left' style='width:15%;'>" + (this.module_report_list[i].taskName || '') + "</td>"
          + "<td align='center' style='width:10%;'>" + this.module_report_list[i].docmentCount + "</td>"
          + "<td align='left' style='width:15%;'>" + (this.module_report_list[i].documentTitle || '') + "</td>"
          + "</tr>";
      }
    }
    else {
      createtable += "<tr><td colspan='10' align='center'>No data(s) are found</td><tr>";
    }
    createtable += "</tbody>" + "</table><p align='center'>&raquo;&nbsp; www.intellimodz.com &nbsp;&laquo;</p>";
    const printContent = document.getElementById(id);
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    //WindowPrt.document.write(printContent.innerHTML);
    WindowPrt.document.write(createtable);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }


  show_task_dialog() {
    var req = {
      employeeId: this.employeeId
    };

    this.ReportsService.GetTaskReports(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.task_report_list = res.result;
              this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
              _.forEach(this.task_report_list, (t) => {

                t.startDate = (t.startDate != null && t.startDate != "" && t.startDate != "Invalid date") ? moment(t.startDate).format(this.date_dispayformat.date_Format) : null;
                t.endDate = (t.endDate != null && t.endDate != "" && t.endDate != "Invalid date") ? moment(t.endDate).format(this.date_dispayformat.date_Format) : null;
                //t.startDate = moment(t.startDate).format(this.date_dispayformat.date_Format);
                // t.endDate = new Date(t.endDate);
                // t.endDate = moment(t.endDate).format(this.date_dispayformat.date_Format);
                //t.startDate = (t.startDate != null && t.startDate != "" && t.startDate != "Invalid date") ? moment(t.startDate).format(this.date_dispayformat.date_Format) : null;
                //t.endDate = (t.endDate != null && t.endDate != "" && t.endDate != "Invalid date") ? moment(t.endDate).format(this.date_dispayformat.date_Format) : null;
              });

              this.task_report_dialog = true;
              //this.MessageService.add({ severity: 'success', summary: 'Success', detail: res.message });    
            }
            else {
              this.task_report_list = res.result;
              this.task_report_dialog = true;
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
    setTimeout(() => {
      $("#btnprintTask").focus();
    }, 100);
  }

  show_response_dialog() {
    var req = {
      employeeId: this.employeeId
    };

    this.ReportsService.GetResponseReports(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.response_report_list = res.result;
              this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
              _.forEach(this.response_report_list, (t) => {
                t.startDate = (t.startDate != null && t.startDate != "" && t.startDate != "Invalid date") ? moment(t.startDate).format(this.date_dispayformat.date_Format) : null;
                t.endDate = (t.endDate != null && t.endDate != "" && t.endDate != "Invalid date") ? moment(t.endDate).format(this.date_dispayformat.date_Format) : null;
              });
              this.response_report_dialog = true;
              //this.MessageService.add({ severity: 'success', summary: 'Success', detail: res.message });    
            }
            else {
              this.response_report_list = res.result;
              this.response_report_dialog = true;
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
    setTimeout(() => {
      $("#btnprintMytask").focus();
    }, 100);

  }

  ResponsibilityReport(id) {
    var createtable = "";
    createtable += '' + '<style type="text/css">'
      + 'table , tr, th, td {'
      + 'border:1px solid #000;'
      + 'border-collapse: collapse;'
      + 'table-layout: auto;'
      + '}'
      + '</style>'
      + "<h3 align='center'>My Responsibility Report</h1>"
      + "<table id='tbl_MyResponeReport'>"
      + "<thead>"
      + "<tr>"
      + "<th style='width:18%; text-align:center'>Task Name</th>"
      + "<th style='width:18%; text-align:center'>SubTask Name</th>"
      + "<th style='width:18%; text-align:center'>Comments</th>"
      + "<th style='width:14%; text-align:center'>File Name</th>"
      + "<th style='width:6%; text-align:center'>Start Date</th>"
      + "<th style='width:6%; text-align:center'>End Date</th>"
      + "<th style='width:20%; text-align:center'>Responsibility Users</th>"
      + "</tr>"
      + "</thead>";
    +"<tbody>";
    if (this.response_report_list.length > 0) {
      for (var i = 0; i < this.response_report_list.length; i++) {
        createtable += "<tr>"
          + "<td align='center' style='width:18%;'> " + (this.response_report_list[i].taskName || '') + " </td>"
          + "<td align='left' style='width:18%;'>" + (this.response_report_list[i].subTaskName || '') + "</td>"
          + "<td align='center' style='width:18%;'>" + (this.response_report_list[i].comments || '') + "</td>"
          + "<td align='left' style='width:14%;'>" + (this.response_report_list[i].fileName || '') + "</td>"
          + "<td align='center' style='width:6%;'>" + (this.response_report_list[i].startDate || '') + "</td>"
          + "<td align='left' style='width:6%;'>" + (this.response_report_list[i].endDate || '') + "</td>"
          + "<td align='center' style='width:20%;'>" + (this.response_report_list[i].responsibilityUser || '') + "</td>"
          + "</tr>";
      }
    }
    else {
      createtable += "<tr><td colspan='10' align='center'>No data(s) are found</td><tr>";
    }
    createtable += "</tbody>" + "</table><p align='center'>&raquo;&nbsp; www.intellimodz.com &nbsp;&laquo;</p>";
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    //WindowPrt.document.write(printContent.innerHTML);
    WindowPrt.document.write(createtable);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }

  taskReport(id) {
    var createtable = "";
    createtable += '' + '<style type="text/css">'
      + 'table , tr, th, td {'
      + 'border:1px solid #000;'
      + 'border-collapse: collapse;'
      + 'table-layout: auto;'
      + '}'
      + '</style>'
      + "<h3 align='center'>My Task Report</h1>"
      + "<table id='tbl_MyTaskReport'>"
      + "<thead>"
      + "<tr>"
      + "<th style='width:18%; text-align:center'>Task Name</th>"
      + "<th style='width:18%; text-align:center'>SubTask Name</th>"
      + "<th style='width:18%; text-align:center'>Comments</th>"
      + "<th style='width:14%; text-align:center'>File Name</th>"
      + "<th style='width:6%; text-align:center'>Start Date</th>"
      + "<th style='width:6%; text-align:center'>End Date</th>"
      + "<th style='width:20%; text-align:center'>Responsibility Users</th>"
      + "</tr>"
      + "</thead>";
    +"<tbody>";
    if (this.task_report_list.length > 0) {
      for (var i = 0; i < this.task_report_list.length; i++) {
        createtable += "<tr>"
          + "<td align='center' style='width:18%;'> " + (this.task_report_list[i].taskName || '') + " </td>"
          + "<td align='left' style='width:18%;'>" + (this.task_report_list[i].subTaskName || '') + "</td>"
          + "<td align='center' style='width:18%;'>" + (this.task_report_list[i].comments || '') + "</td>"
          + "<td align='left' style='width:14%;'>" + (this.task_report_list[i].fileName || '') + "</td>"
          + "<td align='center' style='width:6%;'>" + (this.task_report_list[i].startDate || '') + "</td>"
          + "<td align='left' style='width:6%;'>" + (this.task_report_list[i].endDate || '') + "</td>"
          + "<td align='center' style='width:20%;'>" + (this.task_report_list[i].responsibilityUser || '') + "</td>"
          + "</tr>";
      }
    }
    else {
      createtable += "<tr><td colspan='10' align='center'>No data(s) are found</td><tr>";
    }
    createtable += "</tbody>" + "</table><p align='center'>&raquo;&nbsp; www.intellimodz.com &nbsp;&laquo;</p>";
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    //WindowPrt.document.write(printContent.innerHTML);
    WindowPrt.document.write(createtable);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }
  getTableHeight() {
    var h = ($(window).height() - $(window).height() * 0.3) - 25;
    return h + "px";
  }
}
