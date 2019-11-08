import { Component, ElementRef, OnInit, ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MasterService } from '../../../../services/master.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { WorkflowService } from '../../../../services/appservices/workflow.service';
import { LocalStorageService } from '../../../../shared/local-storage.service';
import { AppConstant } from '../../../../app.constant';
import "dhtmlx-gantt"; 
import "../../../../../assets/js/api.js" ;
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import { ModuleService } from '../../../../services/module.services';
import * as moment from 'moment';

/**
 * display tasks in gantt view
 * @export
 * @class GanttchartComponent
 * @implements OnInit
 * @implements OnChanges
 * @implements OnDestroy
 */
@Component({
  selector: 'app-ganttchart',
  templateUrl: './ganttchart.component.html',
  styleUrls: ['./ganttchart.component.css']
})

export class GanttchartComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * get html elementRef and properties
   * @type ElementRef
   * @memberof GanttchartComponent
   */
  @ViewChild("gantt_here") ganttContainer: ElementRef;
  /**
   * get the changes form other component 
   * @type *
   * @memberof GanttchartComponent
   */
  @Input() ganttExternalChanges: any = {
    selectedboardId: 0,
    selectedTab: 'Task',
    selectedFilterTask: 'All Tasks'
  };

  /**
   * assign the selected module Id
   * @type *
   * @memberof GanttchartComponent
   */
  selectedModuleId: any;
  /**
   * assign the selected board Id
   * @type *
   * @memberof GanttchartComponent
   */
  BoardId: any
  /**
   * assign the selected tab
   * @type *
   * @memberof GanttchartComponent
   */
  selectedTab: any;
  /**
   * assign the Filter Task
   * @type *
   * @memberof GanttchartComponent
   */
  selectedFilterTask: any;
  /**
   * assign the request parameters
   * @type *
   * @memberof GanttchartComponent
   */
  ganttReq: any;
  /**
   * assign the user information 
   * @type *
   * @memberof GanttchartComponent
   */
  userinfo: any;
  /**
   * assign the employee id
   * @type *
   * @memberof GanttchartComponent
   */
  employeeId: any;
  /**
   * assign the rights
   * @type *
   * @memberof GanttchartComponent
   */
  checkrights: any = [];
  /**
   * assign the rights
   * @type boolean
   * @memberof GanttchartComponent
   */
  hasRights: boolean = false;
  /**
   * declare the Subscription for get the information from another forms
   * @private
   * @memberof GanttchartComponent
   */
  private _subscriptions = new Subscription();
  /**
   * assign the selected module is reference module or not
   * @memberof GanttchartComponent
   */
  public isRefModule = false;
  preferenceSetting: any = [];
  date_format: string = "%d-%m-%Y";
  error_display = false;
  Gantt_scaleOptions = 1;
  /**
   * Creates an instance of GanttchartComponent.
   * @param  {WorkflowService} WorkflowService workflow manipulation api calls
   * @param  {MessageService} messageService  display warning error messages
   * @param  {MasterService} MasterService   utility functions
   * @param  {LocalStorageService} LocalStorageService localstorage serice 
   * @param  {ModuleService} ModuleService common module services
   * @memberof GanttchartComponent
   */
  constructor(private WorkflowService: WorkflowService, private messageService: MessageService,
    private MasterService: MasterService, private LocalStorageService: LocalStorageService, private ModuleService: ModuleService) {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.isRefModule = this.ModuleService.checkIsRefmodule();
    if (this.userinfo != undefined && this.userinfo != null) {
      this.employeeId = parseInt(this.userinfo.EmployeeId);
    }
    this.preferenceSetting = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.Gantt_scaleOptions = (this.preferenceSetting.ganttScale != null && this.preferenceSetting.ganttScale != undefined ? this.preferenceSetting.ganttScale.toString() : "1");
    this.subscribeOninit();
  }
  /**
   * ganttChart angular initialization here 
   * @return {void}@memberof GanttchartComponent
   */
  ngOnInit() {
    this.date_format = this.setDateFormat();
    this.ganttChartConfig();
    this.ganttCharEvents();
  }
  /**
   * component will be destroyed
   * @return {void}@memberof GanttchartComponent
   */
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
  /**
   * get gantt chart external changes
   * @param  {SimpleChanges} changes 
   * @return {void}@memberof GanttchartComponent
   */
  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    for (let propName in changes) {
      let change = changes[propName];
      if (propName == "ganttExternalChanges" && propName != undefined) {
        var item = change.currentValue;
        this.BoardId = item.selectedboardId;
        this.selectedTab = item.selectedTab;
        this.selectedFilterTask = item.selectedFilterTask;
        this.loadGantt();
      }
    }
  }

  /**
   * subscribe events which should be destroy after hide element
   * @return {void}@memberof GanttchartComponent
   */
  subscribeOninit() {
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
   * check the user rights
   * @return {void}@memberof GanttchartComponent
   */
  checkRights() {
    this.checkrights = this.ModuleService.getModuleRights();
  }
  /**
   * Get gantt chart data  parameter initialization code here
   * @return {void}@memberof GanttchartComponent
   */
  loadGantt() {
    if (this.selectedTab != undefined && this.selectedTab != null) {
      if (this.selectedTab == "tasks") {
        if (this.selectedFilterTask != undefined && this.selectedFilterTask != null && this.selectedFilterTask != "") {
          switch (this.selectedFilterTask) {
            case 'All Tasks':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 1
              }
              break;
            case 'Pending':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 2
              }
              break;
            case 'Completed':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 3
              }
              break;
            case 'Archived':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 4
              }
              break;
            case 'My Tasks':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                employeeId: (this.employeeId != undefined && this.employeeId != null ? this.employeeId : 0),
                options: 5
              }
              break;
            default:
              break;
          }
        }
      }
      else if (this.selectedTab == "boards") {
        if (this.selectedFilterTask != undefined && this.selectedFilterTask != null && this.selectedFilterTask != "") {
          this.selectedFilterTask = (this.selectedFilterTask == 'My Tasks' ? 'All Tasks' : this.selectedFilterTask);
          switch (this.selectedFilterTask) {
            case 'All Tasks':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 6
              }
              break;
            case 'Pending':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 7
              }
              break;
            case 'Completed':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 8
              }
              break;
            case 'Archived':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 9
              }
              break;
            case 'My Tasks':
              this.ganttReq = {
                legoId: this.selectedModuleId,
                b_id: this.BoardId,
                options: 10
              }
              break;
            default:
              break;
          }
        }
      }
      // call the method to bind the gantt chart records form database here
      if (!_.isEmpty(this.ganttReq)) {
        this.loadGanttData(this.ganttReq);
      }
    }
  }
  /**
   * ganttChart configuration here 
   * @return {void}@memberof GanttchartComponent
   */
  ganttChartConfig() {

    /* <-- ganttChart Columns configuration here --> */
    gantt.config.columns = [
      { name: "text", label: "Task name", tree: true, width: 255, resize: true },
      { name: "start_date", label: "Start date", align: "center", width: 120, resize: true },
      { name: "end_date", label: "End date", align: "center", width: 120, resize: true },
      // { name: "users", label: "Responsible", align: "center", width: 200, resize: true },
      // {
      //   name: "priority", label: "Priority", width: 100, align: "center", template: (obj) => {
      //     if (obj.priority == 1) {
      //       return "High";
      //     }
      //     else if (obj.priority == 2) {
      //       return "Medium";
      //     }
      //     else if (obj.priority == 3) {
      //       return "Low";
      //     }
      //     else if (obj.priority == 4) {
      //       return "None";
      //     }
      //     else {
      //       return ""
      //     }
      //   }
      // }
    ];
    /* <-- ganttChart grid configuration here --> */
    //gantt.config.date_grid = "%Y-%m-%d";//"%d-%m-%Y";
    // gantt.config.xml_date = "%d-%m-%Y";
    // var date_format = this.setDateFormat('');
    gantt.config.layout = {
      css: "gantt_container",
      cols: [
        {
          width: 500,
          min_width: 100,
          rows: [
            { view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" },

            // horizontal scrollbar for the grid
            { view: "scrollbar", id: "gridScroll", group: "horizontal" }]
        },
        { resizer: true, width: 1 },
        {
          rows: [
            { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },

            // horizontal scrollbar for the timeline
            { view: "scrollbar", id: "scrollHor", group: "horizontal" }]
        },
        { view: "scrollbar", id: "scrollVer" }
      ]
    };


    gantt.config.fit_tasks = true;
    gantt.config.date_grid = this.date_format;
    gantt.templates.grid_date_format = function (date) {
      return gantt.date.date_to_str(gantt.config.date_grid)(date);
    };
    gantt.config.grid_resize = true;
    //gantt.config.grid_resizer_column_attribute = "gridresizer";
    gantt.config.sort = false;

    /* <-- ganttChart drag configuration here --> */
    gantt.config.drag_links = false;
    gantt.config.drag_move = false;
    gantt.config.drag_progress = false;
    gantt.config.drag_resize = true;

    /* <-- ganttChart details configuration here --> */
    gantt.config.details_on_dblclick = false;
    gantt.config.details_on_create = false;

    /* <-- ganttChart scroll configuration here --> */
    gantt.config.initial_scroll = true;
    gantt.config.preserve_scroll = true;
    gantt.config.scroll_on_click = true;

    /* <-- ganttChart initialization here --> */
    gantt.init(this.ganttContainer.nativeElement);

  }
  /**
   * gantt chart eachTask expend option code here
   * @return {void}@memberof GanttchartComponent
   */
  onEachTaskOpen() {
    gantt.eachTask((task) => {
      task.$open = true;
    });
    gantt.render();
  }
  /**
   * gantt chart eachTask close code here
   * @return {void}@memberof GanttchartComponent
   */
  onEachTaskClose() {
    gantt.eachTask((task) => {
      task.$open = false;
    });
    gantt.render();
  }
  /**
   * get ganttChart data from api and bind data code here
   * @param  {any} req request parameter for api
   * @return {void}@memberof GanttchartComponent
   */
  loadGanttData(req) {
    this.preferenceSetting = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.messageService.clear();
    this.WorkflowService.getGanttInfo(req).then((res) => {
      if (res) {
        if (res.status == 1) {
          let data = res.result;
          if (!_.isEmpty(data)) {
            gantt.clearAll();
            console.log(data);
            gantt.parse({ data });
            if (this.preferenceSetting.isGanttExpand == 1) {
              this.onEachTaskOpen();
            }
            else {
              this.onEachTaskClose();
            }
            var ganttScale = (this.preferenceSetting.ganttScale != null && this.preferenceSetting.ganttScale != undefined && this.preferenceSetting.ganttScale != "" ? this.preferenceSetting.ganttScale.toString() : "1");
            this.setScaleConfig(ganttScale);

          }
          else {
            gantt.clearAll();
          }
        }
        else {
          gantt.clearAll();
          this.error_display = true;
          // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Tasks must be included (right click on the Task Title and select "Add to Gantt Chart".'+
          // ' </br> Cards need a Start and End date in order to be included (click on Properties)' });
        }
      }
    }).catch(e => {
      gantt.clearAll();
      console.error("Record(s) not found", e);
    });
  }

  /**
   * ganttChart event/methods here
   * @return {void}@memberof GanttchartComponent
   */
  ganttCharEvents() {
    // ganttChart onBeforeTaskDrag event/methods here 
    gantt.attachEvent("onBeforeTaskDrag", (id, mode, e) => {
      this.messageService.clear();
      if (this.checkrights.workflowRights == 'Readonly' && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
      //any custom logic here
      var parent = gantt.getParent(id);
      if (parent != "0") {
        return true;
      }
      else {
        return false;
      }
    });

    // ganttChart onAfterTaskDrag event/methods here
    gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {
      this.messageService.clear();
      if (this.checkrights.workflowRights == 'Readonly' && !this.isRefModule) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
      e.preventDefault = true;
      e.cancelBubble = true;
      //any custom logic here
      var task = gantt.getTask(id)
      var formatFunc = gantt.date.date_to_str("%Y-%m-%d");
      var startdate = formatFunc(task.start_date);
      var enddate = formatFunc(task.end_date);
      //assign the value for update data 
      var request = {
        legoId: this.ganttReq.legoId,
        b_id: this.ganttReq.b_id,
        options: this.ganttReq.options,
        id: id,
        start_date: startdate,
        end_date: enddate,
        qryoptions: 1
      }
      // call the update start and end date method
      this.updateStartandEndDate(request);
      this.WorkflowService.setGanttChanges(request);
    });

  }
  /**
   * update task start and end date code here / gantt chart update method here
   * @param  {any} request request from api
   * @return {void}@memberof GanttchartComponent
   */
  updateStartandEndDate(request) {
    this.WorkflowService.UpdateGanttInfo(request).then((response) => {
      if (response) {
        if (response.status == 1) {
          let data = response.result;
          console.log(data);
          if (!_.isEmpty(data)) {
            gantt.parse({ data });
            gantt.refreshData();
            if (this.preferenceSetting.isGanttExpand == 1) {
              this.onEachTaskOpen();
            }
            else {
              this.onEachTaskClose();
            }
          }
          else {

          }
        }
      }
    }).catch(e => {
      console.error("Gantt update failed.", e);
    });
  }

  setDateFormat() {
    this.preferenceSetting = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    var date_Format = this.preferenceSetting.date_Format;
    if (date_Format == 'MM/DD/YY') {
      date_Format = '%m/%d/%y';
    }
    else if (date_Format == 'dddd, DD-MM-YYYY') {
      date_Format = '%D, %d-%m-%Y';
    }
    else if (date_Format == 'YY/MM/DD') {
      date_Format = '%y/%m/%d';
    }
    else if (date_Format == 'YYYY-MM-DD') {
      date_Format = '%Y-%m-%d';
    }
    else if (date_Format == 'YYYY/MM/DD') {
      date_Format = '%Y/%m/%d';
    }
    else if (date_Format == 'DD-MM-YYYY') {
      date_Format = '%d-%m-%Y';
    }
    else if (date_Format == 'dddd, DD MMMM YYYY') {
      date_Format = '%D, %d %M %Y';
    }
    else if (date_Format == 'MM/DD/YYYY') {
      date_Format = '%m/%d/%Y';
    }
    return date_Format;
  }

  onchangeScale() {
    var value = this.Gantt_scaleOptions;
    this.setScaleConfig(value);
  }

  setScaleConfig(value) {
    switch (value) {
      case "1":
        gantt.config.scale_unit = "day";
        gantt.config.step = 1;
        gantt.config.date_scale = "%d-%M";
        gantt.config.subscales = [];
        gantt.config.scale_height = 27;
        gantt.templates.date_scale = null;
        break;
      case "2":
        var weekScaleTemplate = function (date) {
          var dateToStr = gantt.date.date_to_str("%d %M");
          var startDate = gantt.date.week_start(new Date(date));
          var endDate = gantt.date.add(gantt.date.add(startDate, 1, "week"), -1, "day");
          return dateToStr(startDate) + " - " + dateToStr(endDate);
        };

        gantt.config.scale_unit = "week";
        gantt.config.step = 1;
        gantt.templates.date_scale = weekScaleTemplate;
        gantt.config.min_column_width = 100;
        gantt.config.subscales = [
          // { unit: "day", step: 1, date: "%D" }
        ];
        gantt.config.scale_height = 30;
        break;
      case "3":
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F";
        gantt.config.subscales = [
          // { unit: "day", step: 1, date: "%j, %D" } 
        ];
        gantt.config.scale_height = 30;
        gantt.templates.date_scale = null;
        break;
      case "4":
        gantt.config.scale_unit = "month";
        gantt.config.step = 1;
        gantt.config.date_scale = "%M";

        gantt.config.scale_height = 50;
        gantt.templates.date_scale = null;

        gantt.config.subscales = [
          {
            unit: "quarter", step: 1, template: function (date) {
              var dateToStr = gantt.date.date_to_str("%M");
              var endDate = gantt.date.add(gantt.date.add(date, 3, "month"), -1, "day");
              return dateToStr(date) + " - " + dateToStr(endDate);
            }
          }
        ];
        break;
      case "5":
        gantt.config.scale_unit = "year";
        gantt.config.step = 1;
        gantt.config.date_scale = "%Y";
        gantt.config.min_column_width = 50;

        gantt.config.scale_height = 50;
        gantt.templates.date_scale = null;


        gantt.config.subscales = [
          { unit: "month", step: 1, date: "%M" }
        ];
        break;
    }
    gantt.render();
  }
  exportGanttTo(opt) {
    switch (opt) {
      case "1":
        gantt.exportToPNG({
          name: "exportganttchart.png"
          // header:"<h1>My company</h1>",
          // footer:"<h4>Bottom line</h4>",
          // locale:"en",
          // start:"01-04-2013",
          // end:"11-04-2013",
          //skin:"skyblue" 
          // data:{ },
          // server:"https://myapp.com/myexport/gantt",
          // raw:true
        });
        break;
      case "2":
        //gantt.exportToPDF({ name: "exportganttchart.pdf" });
        gantt.exportToPDF({ 
          name: "exportganttchart.pdf" ,
          // header:"<h1>My company</h1>",
          // footer:"<h4>Bottom line</h4>",
          // locale:"en",
          // skin:"skyblue",
          // server:"https://myapp.com/myexport/gantt",
          // data: this.clone_ganttData,
          // skin:'material',
          // header:'<link rel="stylesheet" href="//dhtmlx.com/docs/products/dhtmlxGantt/common/customstyles.css" type="text/css">',
          raw:false
        });
        // this.print();
        break;
      case "3":
        gantt.exportToExcel({ name: "exportganttchart.xls" });
        break;
      case "4":
        gantt.exportToICal({ name: "exportganttchart.ical" });
        break;
      case "5":
        gantt.exportToJSON({ name: "exportganttchart.json" });
        break;
      case "6":
        gantt.exportToMSProject({ skip_circular_links: false });
        break;
    }
  }

  print()
  {
    var data = {
      "data": [
      { "id": 1, "text": "Office itinerancy", "type": "project", "start_date": "02-04-2017 00:00", "duration": 17, "progress": 0.4, "owner_id": "5", "parent": 0},
      { "id": 2, "text": "Office facing", "type": "project", "start_date": "02-04-2017 00:00", "duration": 8, "progress": 0.6, "owner_id": "5", "parent": "1"},
      { "id": 3, "text": "Furniture installation", "type": "project", "start_date": "11-04-2017 00:00", "duration": 8, "parent": "1", "progress": 0.6, "owner_id": "5"},
      { "id": 4, "text": "The employee relocation", "type": "project", "start_date": "13-04-2017 00:00", "duration": 5, "parent": "1", "progress": 0.5, "owner_id": "5", "priority":3},
      { "id": 5, "text": "Interior office", "type": "task", "start_date": "03-04-2017 00:00", "duration": 7, "parent": "2", "progress": 0.6, "owner_id": "6", "priority":1},
      { "id": 6, "text": "Air conditioners check", "type": "task", "start_date": "03-04-2017 00:00", "duration": 7, "parent": "2", "progress": 0.6, "owner_id": "7", "priority":2},
      { "id": 7, "text": "Workplaces preparation", "type": "task", "start_date": "12-04-2017 00:00", "duration": 8, "parent": "3", "progress": 0.6, "owner_id": "10"},
      { "id": 8, "text": "Preparing workplaces", "type": "task", "start_date": "14-04-2017 00:00", "duration": 5, "parent": "4", "progress": 0.5, "owner_id": "9", "priority":1},
      { "id": 9, "text": "Workplaces importation", "type": "task", "start_date": "21-04-2017 00:00", "duration": 4, "parent": "4", "progress": 0.5, "owner_id": "7"},
      { "id": 10, "text": "Workplaces exportation", "type": "task", "start_date": "27-04-2017 00:00", "duration": 3, "parent": "4", "progress": 0.5, "owner_id": "8", "priority":2},
      { "id": 11, "text": "Product launch", "type": "project", "progress": 0.6, "start_date": "02-04-2017 00:00", "duration": 13, "owner_id": "5", "parent": 0},
      { "id": 12, "text": "Perform Initial testing", "type": "task", "start_date": "03-04-2017 00:00", "duration": 5, "parent": "11", "progress": 1, "owner_id": "7"},
      { "id": 13, "text": "Development", "type": "project", "start_date": "03-04-2017 00:00", "duration": 11, "parent": "11", "progress": 0.5, "owner_id": "5"},
      { "id": 14, "text": "Analysis", "type": "task", "start_date": "03-04-2017 00:00", "duration": 6, "parent": "11", "progress": 0.8, "owner_id": "5"},
      { "id": 15, "text": "Design", "type": "project", "start_date": "03-04-2017 00:00", "duration": 5, "parent": "11", "progress": 0.2, "owner_id": "5"},
      { "id": 16, "text": "Documentation creation", "type": "task", "start_date": "03-04-2017 00:00", "duration": 7, "parent": "11", "progress": 0, "owner_id": "7", "priority":1},
      { "id": 17, "text": "Develop System", "type": "task", "start_date": "03-04-2017 00:00", "duration": 2, "parent": "13", "progress": 1, "owner_id": "8", "priority":2},
      { "id": 25, "text": "Beta Release", "type": "milestone", "start_date": "06-04-2017 00:00", "parent": "13", "progress": 0, "owner_id": "5", "duration": 0},
      { "id": 18, "text": "Integrate System", "type": "task", "start_date": "10-04-2017 00:00", "duration": 2, "parent": "13", "progress": 0.8, "owner_id": "6", "priority":3},
      { "id": 19, "text": "Test", "type": "task", "start_date": "13-04-2017 00:00", "duration": 4, "parent": "13", "progress": 0.2, "owner_id": "6"},
      { "id": 20, "text": "Marketing", "type": "task", "start_date": "13-04-2017 00:00", "duration": 4, "parent": "13", "progress": 0, "owner_id": "8", "priority":1},
      { "id": 21, "text": "Design database", "type": "task", "start_date": "03-04-2017 00:00", "duration": 4, "parent": "15", "progress": 0.5, "owner_id": "6"},
      { "id": 22, "text": "Software design", "type": "task", "start_date": "03-04-2017 00:00", "duration": 4, "parent": "15", "progress": 0.1, "owner_id": "8", "priority":1},
      { "id": 23, "text": "Interface setup", "type": "task", "start_date": "03-04-2017 00:00", "duration": 5, "parent": "15", "progress": 0, "owner_id": "8", "priority":1},
      { "id": 24, "text": "Release v1.0", "type": "milestone", "start_date": "20-06-2017 00:00", "parent": "11", "progress": 0, "owner_id": "5", "duration": 0}
    
      ],
      "links": [
    
      { "id": "2", "source": "2", "target": "3", "type": "0" },
      { "id": "3", "source": "3", "target": "4", "type": "0" },
      { "id": "7", "source": "8", "target": "9", "type": "0" },
      { "id": "8", "source": "9", "target": "10", "type": "0" },
      { "id": "16", "source": "17", "target": "25", "type": "0" },
      { "id": "17", "source": "18", "target": "19", "type": "0" },
      { "id": "18", "source": "19", "target": "20", "type": "0" },
      { "id": "22", "source": "13", "target": "24", "type": "0" },
      { "id": "23", "source": "25", "target": "18", "type": "0" }
    
      ]
    }
    gantt.config.open_tree_initially = true;
    gantt.config.autosize = "xy";
    gantt.exportToPDF({
      format: "A4",
      zoom: 1,
      skin:'material',
      raw:false,
      data: data
    });
  }

}