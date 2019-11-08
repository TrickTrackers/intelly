import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { CommonAppService } from './common-app.service'
import { AppConstant } from '../../app.constant';
import * as _ from 'lodash';
import * as $ from 'jquery';
import * as moment from 'moment';
import { workflowSubTaskProto } from '../../views/user-panel/workflow/workflow.proto';
import { promise } from '../../../../node_modules/@types/selenium-webdriver';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/observable';
import { DomSanitizer } from "@angular/platform-browser";
@Injectable()
export class WorkflowService {
  appSettings: any = appSettings;
  api_url: string;
  appendpoint: string;
  workflowsbase: string;
  getbycompanyurl: string;
  employeebase: string;
  spreadsheetbase:string;
  public dotnetDateFormat = AppConstant.API_CONFIG.DATE.dotnetDateFormat;
  public displayFormat = AppConstant.API_CONFIG.DATE.displayFormat;
  public apiFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  preferenceSettings: any = {};
  private ganttChangesSubject = new Subject<any>();
  private date_dispayformat :any;
  constructor(private httpService: CommonHttpService, private LocalStorageService: LocalStorageService, private commonAppService: CommonAppService,private sanitizer: DomSanitizer) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.workflowsbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.WORKFLOW.BASE;
    this.employeebase = this.appendpoint + AppConstant.API_CONFIG.API_URL.EMPLOYEE.BASE;
    this.getbycompanyurl = this.employeebase + AppConstant.API_CONFIG.API_URL.EMPLOYEE.GETBYCOMPANY;
    this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.spreadsheetbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.SPREADSHEET.BASE;
    this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
  }
  public getList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/GetList", data)
      .then(data => {
        return data;
      });
  }
  public addTask(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/AddTask", data)
      .then(data => {
        return data;
      });
  }
  public updateTask(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/UpdateTask", data)
      .then(data => {
        return data;
      });
  }
  public updateResponsibility(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/updateResponsibility", data)
      .then(data => {
        return data;
      });
  }
  public addSubTask(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/AddSubTask", data)
      .then(data => {
        return data;
      });
  }
  public updateSubTask(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/UpdateSubTask", data)
      .then(data => {
        return data;
      });
  }
  public CheckList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/CheckList", data)
      .then(data => {
        return data;
      });
  }
  public getEmployeeList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/EmployeeList", data)
      .then(data => {
        return data;
      });

  }
  public TaskComments(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/TaskComments", data)
      .then(data => {
        return data;
      });
  }
  public getBoardList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/getBoardList", data)
      .then(data => {
        return data;
      });
  }
  public updateBoard(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/updateBoard", data)
      .then(data => {
        return data;
      });
  }
  public taskLinktoBoard(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/taskLinktoBoard", data)
      .then(data => {
        return data;
      });
  }
  public getBoardLinks(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/getBoardLinks", data)
      .then(data => {
        return data;
      });
  }
  public removeBoardLink(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/removeBoardLink", data)
      .then(data => {
        return data;
      });
  }

  public TaskDocuments(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/TaskDocuments", data)
      .then(data => {
        return data;
      });
  }
  getDueOn(item, event?) {
    var str = '';
    var duedate = '';
    if (!_.isEmpty(item)) {
      if (item.enddate != '' && item.enddate != null && item.enddate != undefined && item.enddate != "Invalid date") {
        var edate = moment(item.enddate);
        var now = moment();
        var st_cr = '';
        //duedate = moment(item.enddate).format(this.displayapiFormat)
        duedate = moment(item.enddate).format(this.date_dispayformat.date_Format);
        if (now < edate) {
          str = '<span>Due on ' + duedate + '</span>';
        }
        else {
          str = '<span style="color:red !important;" >Overdue by ' + duedate + '</span>';
        }
      }
    }
   return (event == 1) ? duedate : this.sanitizer.bypassSecurityTrustHtml(str);
  }
  public formatTaskList(org_tasklist, allcheckList, isBoardTask,labelList ?) {
    var tasklist: any = [];
    this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    var workflostOrderBy = (this.preferenceSettings.isPriority == undefined || this.preferenceSettings == null) ? "position" :
      (this.preferenceSettings.isPriority == true) ? 'priority' : "position"; // priority,position

    var headtree = _.groupBy(org_tasklist, (d: any) => {
      return d.wrk_id;
    });
    _.forEach(headtree, (headvalue: any, f_key: any) => {
      //console.log("HeadValue", headvalue);
      var color = (headvalue[0]['color'] != null && headvalue[0]['color'] != '') ? headvalue[0]['color'] : '#fafafa';

      var c = _.cloneDeep(headvalue);
      var activetasks = 0;

      var children = _.map(c, (childvalue: any) => {
        var status = (childvalue._status != null && childvalue._status != '') ? childvalue._status : 0;
        var complete_per = (childvalue.complete_per != null && childvalue.complete_per != '') ? childvalue.complete_per : 0;
        var color = (status == 1) ? '#27b6ba' : '#a2a0a0';
        var label = (childvalue.label != null && childvalue.label != '') ? childvalue.label : 'none';
        var priority = (childvalue.priority != null && childvalue.priority != '') ? childvalue.priority : 4;
        if (status == 0) {
          activetasks = activetasks + 1;
        }
        childvalue.startdate = (childvalue.startdate != null && childvalue.startdate != "") ? moment(childvalue.startdate).format(this.apiFormat) : null;
        //childvalue.t_created_date = (childvalue.t_created_date != null && childvalue.t_created_date != "") ? moment(childvalue.t_created_date).format(this.apiFormat) : null;
        childvalue.t_created_date = (childvalue.t_created_date != null && childvalue.t_created_date != "") ? moment(childvalue.t_created_date).format(this.date_dispayformat.date_Format) : null;
        childvalue.enddate = (childvalue.enddate != null && childvalue.enddate != "") ? moment(childvalue.enddate).format(this.apiFormat) : null;
        // childvalue.startdate = (childvalue.startdate != null && childvalue.startdate != "") ? moment(childvalue.startdate).format(this.preferenceSettings.date_Format) : null;
        // childvalue.enddate = (childvalue.enddate != null && childvalue.enddate != "") ? moment(childvalue.enddate).format(this.preferenceSettings.date_Format) : null;
        
        childvalue.color = color;
        childvalue.label = label;
        childvalue.label_list=[];
        if(! _.isEmpty(labelList)){
          childvalue.label_list = _.filter(labelList, (d) => {
          return (d.workFlowId == childvalue.workFlowId)
        });
        }
        // var color_lists = _.split(label, ',');
        // _.each(color_lists, (r) => {
        //   var color  = { 
        //     name: r,
        //     isnew : false
        //    };
        //   childvalue.color_list.push(color);
        // });
        // assign labels and their color
        // checkList = _.filter(allcheckList, (d) => {
        //   return (d.taskid == childvalue.workFlowId)
        // });
        childvalue.priority = priority;
        childvalue._status = status;
        childvalue.complete_per = complete_per;
        if (headvalue[0].isAutoCompletePer == 1) {
          childvalue.complete_per = this.commonAppService.getCompletePercentage(childvalue.startdate, childvalue.enddate);
        }
        var date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
        childvalue.completeddateStr="";
        if (childvalue.completeddate != '' && childvalue.completeddate != null && childvalue.completeddate != undefined) {
          //str = 'Completed on  ' + moment(item.completeddate).format(this.displayapiFormat)
          childvalue.completeddateStr = 'Completed on ' + moment(childvalue.completeddate).format(date_dispayformat.date_Format)
        }
        childvalue.getDueOn = this.getDueOn(childvalue);
        childvalue.responsibilities = [];
        childvalue.responsibilities = this.listToAray(childvalue.responsibility, ',')
        var checkList = [];
        checkList = _.filter(allcheckList, (d) => {
          return (d.taskid == childvalue.workFlowId)
        });
        if (checkList.length > 0) {
          _.orderBy(checkList, ['position'], ['asc']);
          checkList.sort((a, b) => {
            return ((a.position - b.position));
          });
        }
        childvalue.checkList = checkList;
        childvalue.commentsList = [];
        childvalue.iseditable = false;
        childvalue.isnew = false;
        return childvalue;
      });

      // children = _.filter(children,(d)=>{
      //   return (d.workFlowId != 0)
      // })
      _.orderBy(children, [workflostOrderBy], ['asc']);
      children.sort((a, b) => {
        return ((a[workflostOrderBy] - b[workflostOrderBy]));
      });
      if (children[0].workFlowId != 0) {
        var dummy = _.clone(workflowSubTaskProto);
        var position = children[children.length - 1].position;
        dummy.workFlowId = 0;
        dummy.position = position + 1;
        children.splice(children.length, 0, dummy);
      }
      var expand_status = 0;
      var count_expanded = _.countBy(children, (c) => {
        return (c.expand_status_st > 0 && c.workFlowId != 0);
      });
      expand_status = (count_expanded.true > 0) ? 1 : 0;
      var h_tree: any = {
        "wrk_id": headvalue[0]['wrk_id'],
        "list_title": headvalue[0]['list_title'],
        "wrk_pos": headvalue[0]['wrk_pos'],
        "wrk_old_pos": headvalue[0]['wrk_pos'],
        "ar_sec": headvalue[0]['ar_sec'],
        // "status": status,
        "legoId": headvalue[0]['legoId'],
        "isGantt": headvalue[0]['isGantt'],
        "color": color,
        "children": children,
        "isAutoCompletePer": headvalue[0]['isAutoCompletePer'],
        'activetasks': activetasks,
        't_createdby_name': headvalue[0]['t_createdby_name'],
        "t_createdby" :  headvalue[0]['t_createdby'],
        "expand_status": expand_status,
        "iseditable": false,
        "isnew": false
      };
      if (isBoardTask == 1) {
        h_tree.taskorder = headvalue[0]['taskorder'];
      }
      tasklist.push(h_tree);
    });

    tasklist.sort((a, b) => {
      if (isBoardTask == 1) {
        return ((a.taskorder - b.taskorder));
      }
      else {
        return ((a.wrk_pos - b.wrk_pos));
      }
    });
    // _.sortBy(tasklist, ['wrk_pos']);
    //_.orderBy(tasklist, ['wrk_pos'], ['asc']);
    return tasklist;
  }
  public listToAray(fullString, separator) {
    var fullArray = [];

    if (fullString !== undefined) {
      if (fullString.indexOf(separator) == -1) {
        fullArray.push(fullString);
      } else {
        fullArray = fullString.split(separator);
      }
    }
    _.remove(fullArray, (d) => {
      return (d.trim() == "")
    });
    return fullArray;
  }

  //Gantt service method here
  //Gantt get data service method here
  public getGanttInfo(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/getGanttChart", data)
      .then(data => {
        return data;
      });
  }
  //Gantt update data service method here
  public UpdateGanttInfo(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/updateGanttChart", data)
      .then(data => {
        return data;
      });
  }
  public setGanttChanges(ganttChanges: any): void {
    this.ganttChangesSubject.next(ganttChanges);
  }
  public getGanttChanges(): Observable<any> {
    return this.ganttChangesSubject.asObservable();
  }

  public addupdatecmplabel(data: any): Promise<any> {
    return this.httpService.globalPostService(this.workflowsbase + "/AddUpdateCompanyLabel", data)
      .then(data => {
        return data;
      });
  }
  public GetLabelList(data:any):Promise<any>{
    return this.httpService.globalPostService(this.workflowsbase + "/GetLabelList",data)
    .then(data =>{
      return data;
    });
  }
  public AddUpdateWorkFlowLabel(data:any):Promise<any>{
    return this.httpService.globalPostService(this.workflowsbase + "/AddUpdateWorkFlowLabel",data)
    .then(data =>{
      return data;
    });
  }

  public GetSpreadSheet(data: any): Promise<any> {
    return this.httpService.globalPostService(this.spreadsheetbase + "/GetList", data)
      .then(data => {
        return data;
      });
  }
}
