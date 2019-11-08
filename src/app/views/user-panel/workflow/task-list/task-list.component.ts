import { Component, OnInit, ViewChild, ViewChildren, EventEmitter, Output, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, AfterViewInit, AfterViewChecked, OnDestroy, ChangeDetectorRef, NgZone, HostListener, AfterContentInit } from '@angular/core';
import { SortablejsOptions } from '../../../../drag-drop/sortablejs-options';
import * as _ from 'lodash';
import { Router, Params } from '@angular/router';
import * as moment from 'moment';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/api';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { AppConstant } from '../../../../app.constant';
import { LocalStorageService } from '../../../../shared/local-storage.service';
import { ModuleService } from '../../../../services/module.services';
import { MasterService } from '../../../../services/master.service';
import { component_config } from '../../../../_config';
import { WorkflowService } from '../../../../services/appservices/workflow.service';
import { CommonUtilityService } from '../../../../services/common-utility.service';
import { workflowCheckListProto, workflowSubTaskProto, workflowTaskProto } from '../workflow.proto';
import { DomSanitizer } from "@angular/platform-browser";
import { CommonAppService } from '../../../../services/appservices/common-app.service';
import { Subscription } from 'rxjs/Subscription';
import { DocumentService } from '../../../../services/appservices/userpanelservices/document.service';
import { DbGroupService } from '../../../../services/appservices/dbChatService';
//import { ColorPicker } from "primeng/colorpicker"
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../../../services/appservices/notification.service';

/**
 * task list component
 * @export
 * @class TaskListComponent
 * @implements OnChanges
 * @implements OnInit
 * @implements AfterViewChecked
 * @implements OnDestroy
 */
@Component({
  selector: 'app-task-list',
  // changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit, AfterViewChecked, AfterContentInit {
  @Input() addtasklist_input;
  @Input() isBoardTask;
  @Input() selectedBoard: any = null;
  @Input() selectedBoardId: number;
  @Input() selectedTaskProperties: any;
  @Output() selectedFilterTask: EventEmitter<any> = new EventEmitter();
  @ViewChildren('taskListTemplateChild') taskListTemplateChild: any;
  public heightRendered = false;
  public displayMediumFormat = AppConstant.API_CONFIG.ANG_DATE.displayMediumFormat;
  public displayapiFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  public dotnetDateFormat = AppConstant.API_CONFIG.DATE.displayFormat;
  public dotnetFullDateFormat = AppConstant.API_CONFIG.DATE.dotnetFullDateFormat;
  checkrights: any = [];
  hasRights: boolean = false;
  operationalRights: string = "Readonly"; // avaiable rights: "Unrestricted" "Readonly"
  public linktoboard_display = false;
  buttonText = "Link";
  isOptional: boolean = false;
  public newactivated = false;
  public show_linkto_board = false;
  queryparams: any = {};
  // context menu 
  public disableBasicMenu = false;
  public selectedPriority = null;
  public selectedFilterOption: any;
  public comment_box = '';
  public selectedComment: any = null;
  // public ModuleItems: any = [];
  public selectedModules: any;
  public selectTaskList: any;
  public isIE11: boolean = true;
  public bsConfig = {
    dateInputFormat: this.displayapiFormat,
    showWeekNumbers: false
  };
  public date_dispayformat: any = [];
  public labelId: any;
  getTasklistOptions = 2;
  private _subscriptions = new Subscription();
  public config = component_config.cktool_config_comment;
  copyorlinktoboard = 'L';
  copyorlinktoboardTitle = 'Link to Board';
  minDate: any;
  tempcheckList: any = [];
  tempcheckListUpdated: boolean = false;
  IEAutoheightCount = 0;
  private resolvedPromise = typeof Promise == 'undefined' ? null : Promise.resolve();
  nextTick = this.resolvedPromise ? function (fn) { this.resolvedPromise.then(fn); } : function (fn) { setTimeout(fn); };
  @ViewChild('basicMenu') public basicMenu: ContextMenuComponent;
  @ViewChild('enableAndVisible') public enableAndVisible: ContextMenuComponent;
  @ViewChild('withFunctions') public withFunctions: ContextMenuComponent;
  lastTaskElement: 0;
  //@ViewChild('labelPicker') labelPicker: ColorPicker;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setautoheightWdith();
  }
  // context menu 
  isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 || false;
  taskDragOptions: SortablejsOptions = {
    group: {
      name: "tasks",
      // pull: "clone",
      put: true,
      revertClone: true
    },
    sort: true,
    forceFallback: this.isFirefox,
    animation: 100,
    supportPointer: (!this.checkisMobileDevice()),
    AutoscrollSpeed: 50,
    scroll: (!this.checkisMobileDevice()),
    scrollSensitivity: 100,
    showArrowNavigator: true,
    // chosenClass: 'tasklist-chosen',
    scrollSpeed: 10,
    draggable: '.t_draggable',
    dragRootContainerId: '#drag_rootContainer',
    onEnd: (event) => {
      // console.log('end drag:', event);
      if (event.newIndex != event.oldIndex) {
        this.moveTask(event.newIndex, event.oldIndex);
      }
      // var from = $(event.from).data("sectionvalue");
      // var to = $(event.to).data("sectionvalue");
      // var item = $(event.item).data("sectionvalue");
      // var ni = event.newIndex;
      // var oi = event.oldIndex;
      this.hideScrollArrow();
    },
    onAdd: (event) => {
      this.hideScrollArrow();
    },
    onChoose: (event) => {
      this.hideScrollArrow();
    },
    onUnchoose: (event) => {
      this.hideScrollArrow();
    },
    onAddOriginal: (event) => {
      this.hideScrollArrow();
    }
  };
  boardDragOptions: SortablejsOptions = {
    group: {
      name: "boardDrag",
      // pull: "clone",
      put: true,
      revertClone: true
    },
    sort: true,
    supportPointer: (!this.checkisMobileDevice()),
    forceFallback: this.isFirefox,
    animation: 100,
    AutoscrollSpeed: 50,
    scroll: (!this.checkisMobileDevice()),
    scrollSensitivity: 100,
    chosenClass: 'tasklist-chosen',
    scrollSpeed: 50,
    onEnd: (event) => {

    },
  };
  chkOptions: SortablejsOptions = {
    group: {
      name: "chklist",
      // pull: "clone",
      put: true,
      revertClone: true
    },
    sort: true,
    forceFallback: this.isFirefox,
    chosenClass: 'checklist-chosen',
    draggable: '.draggable',
    animation: 100,
    scroll: (!this.checkisMobileDevice()),
    scrollSensitivity: 100,
    showArrowNavigator: true,
    supportPointer: (!this.checkisMobileDevice()),
    scrollSpeed: 100,
    onEnd: (event) => {
      // console.log(event);
      this.reorderCheckList(event);
    },
    onChoose: (event) => {

    },
  };
  stOptions: SortablejsOptions = {
    group: {
      name: "mysubtasks",
      // pull: "clone",
      put: true,
      revertClone: true
    },
    sort: true,
    supportPointer: (!this.checkisMobileDevice()),
    forceFallback: this.isFirefox,
    animation: 100,
    AutoscrollSpeed: 50,
    scroll: (!this.checkisMobileDevice()),
    scrollSensitivity: 100,
    showArrowNavigator: true,
    scrollSpeed: 100,
    draggable: '.st_draggable',
    dragRootContainerId: '#drag_rootContainer',
    onEnd: (event) => {
      // console.log("sub task drag event", event);
      this.moveSubTasks(event);
      this.hideScrollArrow();
    },
    onUpdate: (event: any) => {
      // console.log("sub task drag update event", event);

    },
    onAdd: (event) => {
      this.hideScrollArrow();
      // this.moveSubTasks(event);
    },
    onChoose: (event) => {
      this.hideScrollArrow();
    },
    onUnchoose: (event) => {
      this.hideScrollArrow();
    },

    onAddOriginal: (event) => {
      // this.moveSubTasks(event);
      this.hideScrollArrow();
    }
  };
  boardPosition: SortablejsOptions = {
    group: 'boardPosition',
    draggable: '.draggable',
    onEnd: (event) => {
      // console.log("drag event", event)
    },
  };
  taskSet1: any = [];
  addtask_display: boolean = false;
  addtasklist_display: boolean = false;
  display_taskresources: boolean = false;
  selectedparenttask: any;
  selectedtask: any;
  subtask_default: any = [{
    "label": "New card",
    "status": -1
  }];
  top_taskmenu: any;
  selectedtop_taskmenu: any;
  selectedTaskCount: any = {
    allTaskCount: 0,
    pendingTaskCount: 0,
    completedTaskCount: 0,
    archivedTaskCount: 0,
    myTaskCount: 0
  };
  task_responsibilities: SelectItem[];
  label_colors: any = [];
  multi_colors: any = [];
  header_bgcolor: any = [];
  task_priority: any = [];
  selectedTask_priority: any = { label: 'High', value: "High" };
  selectedResponsibities: any = [];
  selectedResponsibilitySuggestion: any;
  taskcompleted_value: number = 40;
  taskcheckList: any = [];
  addcardTooltip_content: any = "Click here to <b>Add New Card </b>";
  sidebartab_index = 0;
  Adddocument_display = false;
  display_linkdocument = false;
  confirmdelete_display = false;
  task_label_editable: boolean;

  company_label: any = [];//Label Company
  selectedItemsLabel: any = [];
  cmpLabelListDropdown: any;//Label Company
  preferencecolor_list: any = [];
  preferencecompanylabel: any;

  Addcompanylabel_display = false; // label company popup
  company_label_temp: any = [];
  labelTitle: any;
  newlabelColor: any;
  cmp_toggle: boolean = false;
  selectedlabel: any;
  //added
  userinfo: any = {};
  companyId: any;
  employeeId: any;
  selectedModuleId: any;
  taskList: any = [];
  workflowCount: any;
  BoardTaskLinkList: any = [];
  selectedColor = '';
  checklist_name = '';
  selectedcheckList: any;
  boardList: any;
  tempboardList: any;
  linktoboardOrderList: any;
  tempselectedTask: any;
  selectedBoardForLink: any;
  tempselectedLinkOrder: number;
  tempselectedtaskOrder: any;
  tempsubTaskTitle = "";
  doc_cols = [
    { field: 'docName', header: 'Document Name' },
  ];
  tempLinkDocument = [];
  selectedtempLinkDocument = [];
  tempTooltip = ``;
  public mainRightMenuActions = [
    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-pencil"></i>
        </span>
        <span class="context-title">Rename</span>`;
      },
      click: (event) => { this.contextmenuExecute(event, 1) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        return `<span class="context-icon">
          <i class="fa fa-trash"></i>
      </span>
      <span class="context-title">Delete</span>`;
      },
      click: (event) => { this.contextmenuExecute(event, 2) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        return `<span class="context-icon">
        <i class="fa fa-copy"></i>
    </span>
    <span class="context-title">Copy</span>`;
      },
      click: (event) => { this.contextmenuExecute(event, 3) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        var archive_tasks = `<span class="context-icon">
        <i class="fa fa-archive"></i>
     </span>
    <span class="context-title">Archive this Section</span>`;
        var unarchive_tasks = `<span class="context-icon">
        <i class="fa fa-archive"></i>
      </span>
      <span class="context-title">Unarchive this Section</span>
      <i class="fa fa-close" style="color:red;" ></i>`;
        return ((item.ar_sec == 0) ? archive_tasks : unarchive_tasks);
      },
      click: (event) => { this.contextmenuExecute(event, 4) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        return `<span class="context-icon">
      <i class="fa fa-arrows-alt"></i>
  </span>
  <span class="context-title"> Link to Board</span>`;
      },
      click: (event) => { this.contextmenuExecute(event, 5) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        return `<span class="context-icon">
      <i class="fa fa-compress"></i>
  </span>
  <span class="context-title">Collapse All</span>`;
      },
      click: (event) => { this.contextmenuExecute(event, 7) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        return `<span class="context-icon">
      <i class="fa fa-expand"></i>
  </span>
  <span class="context-title">Expand All</span>`;
      },
      click: (event) => { this.contextmenuExecute(event, 6) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        var html = `<span class="context-icon">
        <i class="fa fa-percent"></i>
    </span>
    <span class="context-title">Auto Completion</span> `;
        if (item.isAutoCompletePer == 1) {
          html += `<i class="fa fa-close pull-right" style="float: right;padding: 4px 0px;color: #f3b3b3;;" ></i>`;
        }
        return html;
      },
      click: (event) => { this.contextmenuExecute(event, 12) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    },

    {
      html: (item) => {
        var gant_s = `<span class="context-icon">
    <i class="fa fa-bar-chart"></i>
</span>
<span class="context-title">Remove - Gantt chart</span>
<i class="fa fa-close" style="color:red;" ></i>`;
        var gant_n = `<span class="context-icon">
    <i class="fa fa-bar-chart"></i>
</span>
<span class="context-title">Add to Gantt chart</span>
<i class="fa fa-plus ></i>`;
        return ((item.isGantt == 0 || item.isGantt == undefined || item.isGantt == null) ? gant_n : gant_s);
      },
      click: (event) => { this.contextmenuExecute(event, 8) },
      enabled: (item) => {
        return (this.operationalRights == 'Unrestricted') ? true : false;
      },
      visible: (item) => true,
    }
  ];
  isPriority: boolean = false;
  boardLinkNames: any = [];
  public isRefModule = false;
  toggle: boolean = false;
  searchElementId: string;
  isOverallSearch: boolean = false;
  /**
   * Creates an instance of TaskListComponent.
   * @param  {Router} router router changes
   * @param  {MessageService} messageService show success error messages
   * @param  {ContextMenuService} contextMenuService righclick context menu services
   * @param  {LocalStorageService} LocalStorageService set,remove localstorage values
   * @param  {ModuleService} ModuleService module services
   * @param  {WorkflowService} WorkflowService workflow data services
   * @param  {CommonUtilityService} CommonUtilityService common utility services
   * @param  {DomSanitizer} sanitizer dom sanitizer events
   * @param  {MasterService} MasterService master services
   * @param  {CommonAppService} CommonAppService common app services
   * @param  {DocumentService} DocumentService document services
   * @param  {ChangeDetectorRef} cd change detection
   * @memberof TaskListComponent task list component for view child action
   * @param  {ConfirmationService} confirmationService confirmation dialog box service 
   */
  constructor(private router: Router, private messageService: MessageService, private contextMenuService: ContextMenuService, private LocalStorageService: LocalStorageService,
    private ModuleService: ModuleService, private WorkflowService: WorkflowService, private CommonUtilityService: CommonUtilityService, private sanitizer: DomSanitizer,
    private MasterService: MasterService, private CommonAppService: CommonAppService, private DocumentService: DocumentService, private cd: ChangeDetectorRef,
    private DbGroupService: DbGroupService, private confirmationService: ConfirmationService, private ngZone: NgZone, private NotificationService: NotificationService) {
    //   cd.detach();
    // setInterval(() => {
    //   this.cd.detectChanges();
    // }, 3000);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.isRefModule = this.ModuleService.checkIsRefmodule();
    if (this.userinfo != undefined && this.userinfo != null) {
      this.companyId = parseInt(this.userinfo.CompanyId);
      this.employeeId = parseInt(this.userinfo.EmployeeId);
    }
    this.isIE11 = this.CommonUtilityService.isIE11Browser();
    // this.getModuleItems();
    // label colors
    this.label_colors = [
      // { name: 'green', hex: '#008000', rgb: '' },
      // { name: 'blue', hex: '#0000ff', rgb: '' },
      // { name: 'aliceblue', hex: '#f0f8ff', rgb: '' },
      // { name: 'turquoise', hex: '#40e0d0', rgb: '' },
      // { name: 'lightgreen', hex: '#90ee90', rgb: '' },
      // { name: 'darkgreen', hex: 'darkgreen', rgb: '' },
      { name: 'orange', hex: '#ffa500', rgb: '' },
      { name: 'red', hex: '#ff0000', rgb: '' },
      { name: 'darkred', hex: '#8b0000', rgb: '' },
      { name: 'gray', hex: '#808080', rgb: '' },
      { name: 'darkgray', hex: '#a9a9a9', rgb: '' },
      { name: 'purple', hex: '#800080', rgb: '' },
    ];
    this.header_bgcolor = [
      { name: 'green', hex: '#7bd148', rgb: '' },
      { name: 'Light green', hex: '#7ae7bf', rgb: '' },
      { name: 'Bold green', hex: '#51b749', rgb: '' },
      { name: 'blue', hex: '#a4bdfc', rgb: '' },
      { name: 'Bold blue', hex: '#5484ed', rgb: '' },
      { name: 'Turquoise', hex: '#46d6db', rgb: '' },
      { name: 'white', hex: '#fafafa', rgb: '' },

      // { name: 'orange', hex: '#ffa500', rgb: '' },
      // { name: 'red', hex: '#ff0000', rgb: '' },
      // { name: 'darkred', hex: '#8b0000', rgb: '' },
      // { name: 'gray', hex: '#808080', rgb: '' },
      // { name: 'darkgray', hex: '#a9a9a9', rgb: '' },
      // { name: 'purple', hex: '#800080', rgb: '' },
    ];
    this.task_priority = [
      { label: 'High', value: 1 },
      { label: 'Medium', value: 2 },
      { label: 'Low', value: 3 },
      { label: 'None', value: 4 },

    ];
    this.selectedPriority = 0;
    // if(this.whereFrom == 'B') 
    // {

    // } 
    this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.bsConfig = {
      dateInputFormat: this.date_dispayformat.date_Format,
      showWeekNumbers: false
    };
  }
  /**
   * filter tasks
   * @param  {any} event 
   * @return {void}@memberof TaskListComponent
   */
  FilterTasks(event) {
    this.selectedFilterTask.emit(event.value.title);
    this.getTaskList(event.value.option);
  }
  /**
   * get board details
   * @return {void}@memberof TaskListComponent
   */
  getBoardList() {
    var req = {
      options: 4,
      legoId: this.selectedModuleId,

    };
    this.WorkflowService.updateBoard(req).then((res: any) => {
      if (res) {
        if (res.status) {
          this.boardList = this.MasterService.formatDataforDropdown("board_title", res.result, "Select Board");
        }
      }
    });
  }
  /**
   * get board links to task list
   * @param  {any} event selected board event
   * @return {void}@memberof TaskListComponent
   */
  getBoardTaskLinkList(event) {

    if (event.value != undefined && event.value != null) {
      this.selectedBoardForLink = event.value;
      this.BoardTaskLinkList = [];
      var req = {
        "b_id": this.selectedBoardForLink.b_id,
        "Options": 1
      };//BoardTaskLinkList
      this.WorkflowService.taskLinktoBoard(req).then((res: any) => {
        if (res) {
          if (res.status) {
            if (res.result != null) {
              this.BoardTaskLinkList = res.result;
            }
          }
          var selected_link = _.find(this.BoardTaskLinkList, (data) => {
            return (this.tempselectedTask.wrk_id == data.wrk_id)
          });
          if (_.isEmpty(selected_link) && this.copyorlinktoboard != "C") {
            var taskorder = (this.BoardTaskLinkList == null) ? 1 : (this.BoardTaskLinkList.length + 1);
            this.tempselectedLinkOrder = taskorder;
            var insertdata = {
              'LinkID': 0,
              'b_id': this.selectedBoardForLink.b_id,
              'taskorder': taskorder,
              'legoid': this.selectedModuleId, // this.selectedBoardForLink.legoid,
              'wrk_id': this.tempselectedTask.wrk_id,
              'list_title': this.tempselectedTask.list_title,
              'board_title': this.selectedBoardForLink.board_title
            };
            this.BoardTaskLinkList.push(insertdata);
            this.tempselectedtaskOrder = insertdata;
            // console.log("board task link: ", this.BoardTaskLinkList);
            this.BoardTaskLinkList.sort((a, b) => {
              return ((a.taskorder - b.taskorder));
            });

          }
          if (this.copyorlinktoboard == "C") {
            var taskorder = (this.BoardTaskLinkList == null) ? 1 : (this.BoardTaskLinkList.length + 1);
            this.tempselectedLinkOrder = taskorder;
            var insertdata = {
              'LinkID': 0,
              'b_id': this.selectedBoardForLink.b_id,
              'taskorder': taskorder,
              'legoid': this.selectedModuleId, // this.selectedBoardForLink.legoid,
              'wrk_id': this.tempselectedTask.wrk_id,
              'list_title': this.tempselectedTask.list_title,
              'board_title': this.selectedBoardForLink.board_title
            };
            this.BoardTaskLinkList.push(insertdata);
            this.tempselectedtaskOrder = insertdata;
            //console.log("board task link: ", this.BoardTaskLinkList);
            this.BoardTaskLinkList.sort((a, b) => {
              return ((a.taskorder - b.taskorder));
            });
          }
        }
      });
    }

  }
  /**
   * add links to board
   * @param  {any} task selected task details
   * @param  {any} orderindex selected task index in task list
   * @return {void}@memberof TaskListComponent
   */
  setLinkOrder(task, orderindex) {
    this.tempselectedLinkOrder = orderindex + 1;
  }
  /**
   * update task link to board
   * @return {void}@memberof TaskListComponent
   */
  UpdateLinkBoard() {
    this.messageService.clear();
    var isValid = true;
    var req: any = {
      "LinkID": 0,
      "b_id": 0,
      "taskorder": 0,
      "legoid": this.selectedModuleId, // this.tempselectedTask.legoId,
      'wrk_id': this.tempselectedTask.wrk_id,
      'employeeId': this.userinfo.EmployeeId,
      'board_title': null,
      'list_title': null,
      'Options': 2
    };
    var selected_link = _.find(this.BoardTaskLinkList, (data) => {
      return (this.tempselectedTask.wrk_id == data.wrk_id)
    });

    this.BoardTaskLinkList = [];

    if (!_.isEmpty(selected_link)) {
      req.LinkID = selected_link.LinkID;
      req.board_title = selected_link.board_title;
      req.list_title = selected_link.list_title;
    }
    if (!_.isEmpty(this.selectedBoardForLink)) {
      req.b_id = this.selectedBoardForLink.b_id;
    }
    if (!_.isEmpty(this.tempselectedtaskOrder)) {
      req.taskorder = this.tempselectedtaskOrder.taskorder;
    }

    if (this.copyorlinktoboard == "C") {
      if (req.b_id == 0) {
        req.Options = 6;
      }
      else {
        req.Options = 3;
      }
    }
    else {
      if (req.b_id == 0) {
        isValid = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select board.' });
        this.linktoboard_display = true;
        return false;
      }
    }
    if (isValid) {
      this.WorkflowService.taskLinktoBoard(req).then((res: any) => {
        if (res) {
          this.selectedBoardForLink = null;
          this.tempselectedtaskOrder = null;
          this.BoardTaskLinkList = [];
          this.tempselectedTask = null;
          this.linktoboard_display = false;
          if (this.copyorlinktoboard == "C") {
            this.getTaskList(this.getTasklistOptions);
          }
        }
      });
      //console.log("order list: ", this.BoardTaskLinkList);
    }
  }
  /**
   * get check list based on the selected module
   * @param  {any} option 
   * @return {void}@memberof TaskListComponent
   */
  getTaskList(option) { // get check list based on the selected module
    this.getTasklistOptions = this.selectedFilterOption.option;
    // this.getTasklistOptions = option;
    var req: any = {
      "employeeId": this.employeeId,
      "modelId": this.selectedModuleId,
      // "Options": option,
      "Options": this.getTasklistOptions,
      "isBoardTask": this.isBoardTask,
      "companyId": this.companyId
    };
    if (this.isBoardTask == 1) {
      req.b_id = this.selectedBoardId;
    }
    // with sample data
    // var req = {
    //   "employeeId": 23,
    //   "modelId": 50260,
    //   "Options": 1
    // };
    this.WorkflowService.getList(req).then((res: any) => {
      if (res) {
        if (res.status) {
          var tasklist = res.result.workflowList;
          var checkList = res.result.taskCheckList;
          var labelList = res.result.workFlowLabels;
          this.workflowCount = res.result.taskcounts[0];
          this.selectedTaskCount = res.result.workflowCount;
          //var company_label = res.result.companyLabels;
          //this.company_label = res.result.companyLabels;
          // var preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
          // this.labelId = preference.labelId;
          // this.preferencecolor_list = [];
          // if (this.labelId != 0 && !_.isEmpty(company_label)) {
          //   var companylabel_list = _.find(company_label, (c) => {
          //     return (c.labelId == this.labelId);
          //   });
          //   var selectedcolor = companylabel_list.labelColor;
          //   var color_lists = _.split(selectedcolor, ',');
          //   _.each(color_lists, (r) => {
          //     var color = {
          //       name: r,
          //       //isnew: false
          //     };
          //     this.preferencecolor_list.push(color);
          //   });
          //   this.preferencecompanylabel = companylabel_list.labelTitle;
          // }
          // this.cmpLabelListDropdown = this.MasterService.formatDataforDropdown("labelTitle", this.company_label, "Select Label", "labelColor");

          this.updateWorkflowCounts();
          this.taskList = this.WorkflowService.formatTaskList(tasklist, checkList, this.isBoardTask, labelList);
          //console.log("workflowCOunt: ", this.workflowCount);
          this.setautoheightWdith();
        }
        else {
          this.taskList = [];
        }
      }
    });
  }

  // getModuleItems() {
  //   var md = this.ModuleService.getTreeModules();item
  //   if(md != null && md != undefined && !_.isEmpty(md))
  //       {
  //           this.ModuleItems = md[0].children;
  //       }
  // }

  /**
   * update task count in filter dropdown
   * @return {void}@memberof TaskListComponent
   */
  updateWorkflowCounts() {
    if (this.workflowCount != null) {
      _.map(this.top_taskmenu, (d) => {
        if (this.workflowCount[d.value.key] != undefined && this.workflowCount[d.value.key] != null) {
          d.value.count = this.workflowCount[d.value.key];
        }
        return d;
      });
      if (this.isBoardTask == 1) { //
        _.remove(this.top_taskmenu, (m) => {
          return (m.value.key == "myTaskCount")
        });
      }
    }
    else {
      _.map(this.top_taskmenu, (d) => {
        d.value.count = 0;
        return d;
      });
    }

  }

  //  context menu start
  /**
   * ng changes - show/hide add task botton
   * @param  {SimpleChanges} changes 
   * @return {void}@memberof TaskListComponent
   */
  public ngOnChanges(changes: SimpleChanges): void {
    //console.log('OnChanges');
    //console.log(JSON.stringify(changes));
    for (let propName in changes) {
      let change = changes[propName];
      if (propName == "addtasklist_input") {
        if (change.currentValue == "1") {
          this.addtasklist_display = true;
        }

      }
      //console.log("changes", change);
    }
  }
  /**
   * on context menu selection,show/hide menu items
   * @param  {MouseEvent} $event 
   * @param  {*} item 
   * @return {void}@memberof TaskListComponent
   */
  public onContextMenu($event: MouseEvent, item: any): void {
    this.contextMenuService.show.next({ event: $event, item: item });
    $event.preventDefault();
  }


  /**
   * select color list events
   * @param  {any} event select color list events
   * @param  {any} color selected color
   * @return {void}@memberof TaskListComponent
   */
  selectListColor(event: any, color) {
    this.selectedColor = color.hex;
  }
  // context menu end
  /**
   * context menu event and options
   * @param  {any} event selected context menu event
   * @param  {any} option selected context menu item
   * @return {void}@memberof TaskListComponent
   */
  contextmenuExecute(event, option) {
    //console.log('color picker context menu: ', event);
    var item = event.item;
    this.tempboardList = _.cloneDeep(this.boardList);
    switch (option) {
      case 1:
        this.RenameTaskList(event.item);
        break;
      case 2:
        this.confirmationService.confirm({
          header: "Delete",
          message: 'Are you sure you want to Delete this Task?',
          accept: () => {
            this.updateTask(event.item, 2);
          }
        });
        break;
      case 3:
        this.copyorlinktoboard = "C";
        this.copyorlinktoboardTitle = "Copy a task list...";
        this.buttonText = "Paste";
        this.isOptional = true;
        this.selectedBoardForLink = null;
        this.tempselectedtaskOrder = null;
        this.BoardTaskLinkList = [];
        this.tempselectedTask = event.item;
        this.linktoboard_display = true;
        break;
      case 4:
        item.ar_sec = (item.ar_sec == 0) ? 1 : 0;
        this.updateTask(item, 4);
        break;
      case 5:
        this.copyorlinktoboard = "L";
        this.copyorlinktoboardTitle = "Link to Board"
        this.buttonText = "Link";
        this.isOptional = false;
        this.selectedBoardForLink = null;
        this.tempselectedtaskOrder = null;
        this.BoardTaskLinkList = [];
        this.tempselectedTask = event.item;
        this.linktoboard_display = true;
        this.getLinkedBoardList();
        break;
      case 6:
        item.expand_status = 0; //collapse
        this.afterCollpased(item);
        break;
      case 7:
        item.expand_status = 1; //expand
        this.afterCollpased(item);
        break;
      case 8:
        item.isGantt = (item.isGantt == 0 || item.isGantt == undefined || item.isGantt == null) ? 1 : 0;
        this.updateTask(item, 8);
        break;
      case 9:
        var item = event.item;
        item.color = this.selectedColor;
        this.updateTask(item, 9);
        break;
      case 12:
        item.isAutoCompletePer = (item.isAutoCompletePer == 1) ? 0 : 1;
        this.updateTask(item, 12);
        break;
      default:
        break;
    }
    // 
  }
  /**
   * get link of task in board
   * @return {void}@memberof TaskListComponent
   */
  getLinkedBoardList() {
    var req = {
      legoId: this.selectedModuleId,
      wrk_id: this.tempselectedTask.wrk_id,
      options: 4
    };
    this.WorkflowService.getBoardLinks(req).then((res: any) => {
      //console.log("linked list", res);
      if (res.status == 1) {
        this.boardLinkNames = res.result;
        this.removeBoardLinkList(this.tempboardList, this.boardLinkNames);
      }

    });
  }
  /**
   * remove link list from board
   * @param  {any} tempboardList 
   * @param  {any} existingData 
   * @return {void}@memberof TaskListComponent
   */
  removeBoardLinkList(tempboardList, existingData) {
    this.tempboardList = _.filter(tempboardList, (d) => {
      var val = d.value;
      if (val == null)
        return false;
      else {
        return _.isEmpty(_.find(existingData, (ex) => {
          return (ex.b_id == val.b_id)
        }));
      }

    });
  }
  /**
   *  remove link from board
   * @param  {any} data 
   * @return {void}@memberof TaskListComponent
   */
  removeBoardLink(data) {
    //console.log(this.taskList);
    var req = {
      legoId: this.selectedModuleId,
      wrk_id: this.tempselectedTask.wrk_id,
      LinkID: data.linkID,
      options: 5
    };

    this.WorkflowService.removeBoardLink(req).then((res: any) => {
      //console.log("linked list", res);
      if (res.status == 1) {
        if (this.isBoardTask == 1) {
          var currenttasklist = _.cloneDeep(this.taskList);
          this.taskList = _.filter(currenttasklist, (r) => {
            return r.wrk_id != this.tempselectedTask.wrk_id;
          })
        }
        this.boardLinkNames = res.result;
        this.removeBoardLinkList(this.boardList, this.boardLinkNames);
      }

    });
  }
  /**
   * add empty task 
   * @return {void}@memberof TaskListComponent
   */
  addTaskList() {
    this.taskcheckList.push({ id: 0, 'name': '' });
  }
  /**
   * oninit task list event
   * @return {void}@memberof TaskListComponent
   */
  ngOnInit() {
    this.config = component_config.cktool_config_comment;
    var defaultFliterOption = 1;
    var preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    if (!_.isEmpty(preference)) {
      // this.setTaskDefaultFilter(preference.taskDefaultFilter);
      defaultFliterOption = (preference.taskDefaultFilter == undefined || preference.taskDefaultFilter == null) ? 1 : preference.taskDefaultFilter;
      this.isPriority = (preference.isPriority == undefined || preference.isPriority == null) ? false : (preference.isPriority == true) ? true : false;
      this.labelId = (preference.labelId == undefined || preference.labelId == null) ? preference.labelId : 0;
    }

    this._subscriptions.add(
      this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
        this.setSelectedFilter(preferencesettings.taskDefaultFilter);
        this.isPriority = (preferencesettings.isPriority == undefined || preferencesettings.isPriority == null) ? false : (preferencesettings.isPriority == true) ? true : false;
        this.date_dispayformat.date_Format = preferencesettings.date_Format;
        this.labelId = preferencesettings.labelId;
        this.bsConfig = {
          dateInputFormat: this.date_dispayformat.date_Format,
          showWeekNumbers: false
        };
        if (!_.isEmpty(this.selectedtask) && this.selectedtask != undefined) {
          var reqdata = {
            'workFlowId': this.selectedtask.workFlowId,
            'legoId': this.selectedModuleId,
            'employeeId': this.employeeId,
            'companyId': this.companyId,
            'options': 1
          };
          this.GetLabelList(reqdata);
        }


      }));
    this._subscriptions.add(
      this.WorkflowService.getGanttChanges().subscribe((ganttChanges) => {
        //console.log(ganttChanges);
        var data = this.taskList
        _.filter(this.taskList, function (task) {
          _.find(task.children, function (subtask) {
            if (subtask.workFlowId == ganttChanges.id) {
              subtask.startdate = ganttChanges.start_date;
              subtask.enddate = ganttChanges.end_date;
            }

          });
        });

        //console.log(data);
      }));
    this.top_taskmenu = [
      {
        label: 'All Tasks',
        value: {
          title: 'All Tasks',
          option: 1,
          count: 0,
          key: 'allTaskCount'
        }
      },
      {
        label: 'Pending',
        value: {
          title: 'Pending',
          option: 2,
          count: 0,
          key: 'pendingTaskCount'
        }
      },
      {
        label: 'Completed',
        value: {
          title: 'Completed',
          option: 3,
          count: 0,
          key: 'completedTaskCount'
        }
      },
      {
        label: 'Archived',
        value: {
          title: 'Archived',
          option: 4,
          count: 0,
          key: 'archivedTaskCount'
        }
      },
      {
        label: 'My Tasks',
        value: {
          title: 'My Tasks',
          option: 5,
          count: 0,
          key: 'myTaskCount'
        }
      }
    ];
    this.oninitSubscribe();
    this.setSelectedFilter(defaultFliterOption);
    this.getBoardList();
  }
  /**
   * set selected filter,based on this will show task - inprogress,completed,pending,etc
   * @param  {any} defaultFliterOption 
   * @return {void}@memberof TaskListComponent
   */
  setSelectedFilter(defaultFliterOption) {
    defaultFliterOption = (this.isOverallSearch == true ? 5 : defaultFliterOption)
    defaultFliterOption = (this.isBoardTask == 1 && defaultFliterOption == 5) ? 1 : defaultFliterOption; 

    var item = _.find(this.top_taskmenu, (d) => {
      return (d.value.option == defaultFliterOption)
    });
    if (!_.isEmpty(item)) {
      this.selectedFilterOption = item.value;
      this.selectedFilterTask.emit(item.value.title);
    }
    this.getTaskList(defaultFliterOption);
  }
  /**
   * destroy all subscribes and events
   * @return {void}@memberof TaskListComponent
   */
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    $("#taskcomp-container").html("").remove();
    //console.log("destroyed removed");
  }
  /**
   * initialize the subscriptions
   * @return {void}@memberof TaskListComponent
   */
  oninitSubscribe() {
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.CommonAppService.checkPinmodule();
      if (this.queryparams.t == 'tasks') {
        if (params['tId'] != undefined && params['sId'] != undefined) {
          this.searchElementId = (params['tId'] != "0" ? 'searchtask_' + params['tId'] : 'searchsubtask_' + params['sId']);
          this.isOverallSearch = true;
        }
      }
    }));
    this._subscriptions.add(
      this.ModuleService.getModuleUpdates().subscribe((updates: any) => {
        // this.cartcount = count;
        //console.log("Module updates(workflow page):", updates);
        // this.getTreeModules();
        if (updates.treeModules) {
          // this._subscriptions.unsubscribe();
          // this.ngOnInit();
        }
      })
    );
    this._subscriptions.add(
      this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
        this.taskList = [];
        this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
        this._subscriptions.unsubscribe();
        // setTimeout(() => {
        //   this.ngOnInit();
        //   //  this.navigateTabs(this.queryparams.t);
        //   // this.router.navigate(['/submodule'], { queryParams: newparams });
        // }, 1000);
        this.nextTick(() => {
          this.ngOnInit();
          // your code
        });
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
   * set default filter selection based on preferrence settings
   * @param  {any} option 
   * @return {void}@memberof TaskListComponent
   */
  setTaskDefaultFilter(option) {
    switch (option) {
      case 1:
        this.selectedtop_taskmenu = {
          label: 'All Tasks',
          value: {
            title: 'All Tasks',
            option: 1,
            count: this.selectedTaskCount.allTaskCount,
            key: 'allTaskCount'
          }
        };
        break;
      case 2:
        this.selectedtop_taskmenu = {
          label: 'Pending',
          value: {
            title: 'Pending',
            option: 2,
            count: this.selectedTaskCount.pendingTaskCount,
            key: 'pendingTaskCount'
          }
        };
        break;
      case 3:
        this.selectedtop_taskmenu = {
          label: 'Completed',
          value: {
            title: 'Completed',
            option: 3,
            count: this.selectedTaskCount.completedTaskCount,
            key: 'completedTaskCount'
          }
        };
        break;
      case 4:
        this.selectedtop_taskmenu = {
          label: 'Archived',
          value: {
            title: 'Archived',
            option: 4,
            count: this.selectedTaskCount.archivedTaskCount,
            key: 'archivedTaskCount'
          }
        };
        break;
      case 5:
        this.selectedtop_taskmenu = {
          label: 'My Tasks',
          value: {
            title: 'My Tasks',
            option: 5,
            count: this.selectedTaskCount.myTaskCount,
            key: 'myTaskCount'
          }
        };
        break;
      default:
        break;
    }
    this.selectedFilterTask.emit(this.selectedtop_taskmenu.value.title);
    this.getTaskList(this.selectedtop_taskmenu.value.option);
  };
  /**
   * display add task inputbox and panel
   * @param  {any} event 
   * @param  {any} item 
   * @return {void}@memberof TaskListComponent
   */
  DisplayAddTask(event, item) {
    this.addtask_display = true;
    this.selectedtask = item;
  }
  /**
   * add main tasks
   * @return {void}@memberof TaskListComponent
   */
  AddMainTask() {
    // this.addtasklist_display = true;
    if (this.newactivated == false) {
      this.newactivated = true;
      var newtask = _.cloneDeep(workflowTaskProto);
      newtask.position = (this.taskList.length > 0) ? this.taskList.length : 1;
      newtask.list_title = "";
      newtask.iseditable = true;
      newtask.isnew = true;
      newtask.wrk_id = this.CommonUtilityService.IDGenerator(5, 'n');
      if (this.isBoardTask == 1) {
        newtask.isBoardTask = 1;

      }
      newtask.children[0].parent_id = newtask.wrk_id;
      this.taskList.push(newtask);
      this.setautoheightWdith();
      this.RenameTaskList(newtask);
    }

  }
  /**
   * add/update sub tasks
   * @param  {any} workitem 
   * @return {void}@memberof TaskListComponent
   */

  addnewSubTask(workitem) {
    if (this.AddUpdateCheckRights()) {
      var newsubtask = _.cloneDeep(workflowSubTaskProto);
      newsubtask.steps = '';
      newsubtask.legoId = this.selectedModuleId;
      newsubtask.iseditable = true;
      newsubtask.isnew = true;
      newsubtask.parent_id = workitem.wrk_id;
      newsubtask.workFlowId = this.CommonUtilityService.IDGenerator(5, 'n');
      var preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
      this.labelId = preference.labelId;
      this.preferencecolor_list = [];
      if (this.labelId != 0 && !_.isEmpty(this.company_label)) {
        var companylabel_list = _.find(this.company_label, (c) => {
          return (c.labelId == this.labelId);
        });
        var selectedcolor = companylabel_list.labelColor;
        // var color_lists = _.split(selectedcolor, ',');
        // _.each(color_lists, (r) => {
        //   var color = {
        //     name: r,
        //     //isnew: false
        //   };
        //   this.preferencecolor_list.push(color);
        // });
        this.preferencecompanylabel = companylabel_list.labelTitle;
      }
      if (!_.isEmpty(this.preferencecolor_list)) {
        newsubtask.color_list = this.preferencecolor_list;
      }
      var emptyCard = workitem.children[workitem.children.length - 1];
      if (!_.isEmpty(emptyCard)) {
        if (emptyCard.workFlowId == 0) {
          workitem.children.splice(workitem.children.length - 1, 0, newsubtask);
        }
        else {
          workitem.children.push(newsubtask);
        }
      }
      else {
        workitem.children.push(newsubtask);
      }
      this.RenameSubTask(newsubtask);
    }
  }
  /**
   * add main task
   * @param  {*} txt_task 
   * @return {void}@memberof TaskListComponent
   */
  AddTask(txt_task: any) {
    //console.log(txt_task);
    var n_task = {
      'label': (txt_task.value != "") ? txt_task.value : "Sub task1",
      'status': 0,
      "progress": 10,
      "collpased": 1,
      "createdby": "blake 10",
    }
    this.selectedtask.children.unshift(n_task);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Sub task added successfully.' });
    this.addtask_display = false;
  }
  /**
   * push actual task after successfull
   * @param  {*} tasklistname 
   * @return {void}@memberof TaskListComponent
   */
  AddTaskList(tasklistname: any) {
    var n_task = {
      'label': (tasklistname.value != "") ? tasklistname.value : "Sub task1",
      'status': 0,
      "createdby": "blake 10",
      "collpased": 1,
      'children': [{}]
    }
    this.taskSet1.push(n_task);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Task List added successfully.' });
    this.addtasklist_display = false;
  }

  /**
   * show sub task properties
   * @param  {any} tasklist selected main task
   * @param  {any} taskitem selected sub task item
   * @param  {any} tab for auto select the tab - properties,comments and documents
   * @param  {any} $event click event - unused
   * @return {void}@memberof TaskListComponent
   */
  opentaskresources(tasklist, taskitem, tab, $event) {
    this.ngZone.runOutsideAngular(() => {
      this.openResources(tasklist, taskitem, tab, $event);
    });
  }
  openResources(tasklist, taskitem, tab, $event) {
    this.selectedlabel = [];//newly added 16-04-2019
    this.selectedparenttask = tasklist;
    this.selectedtask = taskitem;
    this.task_label_editable = false;
    $("#selectedtask_steps_container").hide();
    this.sidebartab_index = tab;
    this.display_taskresources = true;
    this.tempcheckList = _.cloneDeep(this.selectedtask.checkList);
    this.tempcheckListUpdated = false;
    $("#checklist_name").val("");
    this.minDate = new Date(moment(this.selectedtask.t_created_date, this.date_dispayformat.date_Format).format('YYYY-MM-DD[T]HH:mm:ss'));
    //this.minDate = new Date((this.selectedtask.t_created_date != null && this.selectedtask.t_created_date != "" && this.selectedtask.t_created_date != "Invalid date") ? moment(this.selectedtask.t_created_date).format('llll') : null);
    //this.minDate = new Date((this.selectedtask.t_created_date != null && this.selectedtask.t_created_date != "" && this.selectedtask.t_created_date != "Invalid date") ? moment(this.selectedtask.t_created_date).format(this.date_dispayformat.date_Format) : null);

    this.selectedPriority = taskitem.priority;
    this.checklist_name = '';
    this.comment_box = '';
    this.selectedComment = null;
    this.selectedResponsibities = [];

    //this.selectedtask.t_created_date = moment(this.selectedtask.t_created_date).format(this.date_dispayformat.date_Format);
    this.selectedtask.startdate = moment(this.selectedtask.startdate).format(this.date_dispayformat.date_Format);
    // if(this.selectedtask.enddate != null && this.selectedtask.enddate != undefined && this.selectedtask.enddate != "")
    // {
    this.selectedtask.enddate = (this.selectedtask.enddate != null && this.selectedtask.enddate != "" && this.selectedtask.enddate != "Invalid date") ? moment(this.selectedtask.enddate).format(this.date_dispayformat.date_Format) : null;
    //}   

    this.updateComments({ 'task_id': this.selectedtask.workFlowId }, 1);
    var resp_req = {
      'workFlowId': this.selectedtask.workFlowId,
      'LegoId': this.selectedModuleId,
      'employeeId': this.employeeId,
      'userId': this.employeeId,
      'option': 3
    };
    this.updateResponsibility(resp_req, 3);
    var docreq = {
      TaskId: this.selectedtask.workFlowId,
      companyId: this.companyId,
      options: 1
    };
    this.updateTaskDocuments(docreq, 1);

    var reqdata = {
      'workFlowId': this.selectedtask.workFlowId,
      'legoId': this.selectedModuleId,
      'employeeId': this.employeeId,
      'companyId': this.companyId,
      'options': 1
    };
    this.GetLabelList(reqdata);
  }

  /**
   * toggle the task either collpase or expanded state
   * @param  {any} subtask 
   * @return 
   * @memberof TaskListComponent
   */
  checktaskstatus(subtask) {
    var collapsed = false;
    if (subtask.workFlowId != 0) {
      if (subtask.expand_status_st == 1) {
        collapsed = false;
      }
      else {
        collapsed = true;
      }
    }
    return collapsed;
  }
  /**
   * update collased state of task
   * @param  {any} item 
   * @return {void}@memberof TaskListComponent
   */
  afterCollpased(item) {
    if (item.expand_status == 1) {
      if (!_.isEmpty(item.children)) {
        if (this.AddUpdateCheckRights()) {
          this.updateTask(item, 6);
        }
        _.forEach(item.children, function (l) {
          l.expand_status_st = 0;
        });
      }
      item.expand_status = 0;
    }
    else if (item.expand_status == 0) {
      if (!_.isEmpty(item.children)) {
        if (this.AddUpdateCheckRights()) {
          this.updateTask(item, 7);
        }
        _.forEach(item.children, function (l) {
          l.expand_status_st = 1;
        });
      }
      item.children = [...item.children];
      item.expand_status = 1;
    }

    // //console.log("collapse item",item);
    // event.collapsed = false;
  }
  /**
   * rename task-  show input box
   * @param  {any} item 
   * @return {void}@memberof TaskListComponent
   */
  RenameSubTask(item) {
    if (this.AddUpdateCheckRights()) {
      item.iseditable = true;
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          var selectedCardId = $("#renamesubtask_" + item.workFlowId);
          if (selectedCardId.length > 0) {
            var e = selectedCardId[0];
            e.scrollIntoView(true);
            selectedCardId.parents(".ui-panel-titlebar").children('.ui-panel-titlebar-toggler').hide();
            $("#renamesubtask_" + item.workFlowId).focus();
          }
        }, 100);
      });

      this.tempsubTaskTitle = item.steps;
    }
  }
  /**
   * prepate rename sub task - show/hide input box
   * @return {void}@memberof TaskListComponent
   */
  panelRenameSubtask() {
    if (this.AddUpdateCheckRights()) {
      // this.task_label_editable=true;
      this.task_label_editable = true;
      $("#selectedtask_steps_container").show();
      // setTimeout(() => {
      //   $("#selectedtask_steps").val(this.selectedtask.steps);
      // }, 500);
      this.nextTick(() => {
        $("#selectedtask_steps").val(this.selectedtask.steps);
      });
    }
  }
  /**
   * rename and focus to input box
   * @param  {any} item selected sub task
   * @return {void}@memberof TaskListComponent
   */
  RenameTaskList(item) {
    if (this.AddUpdateCheckRights()) {
      item.iseditable = true;
      this.ngZone.runOutsideAngular(() => {
        // setTimeout(() => {
        //   if ($("#renametasklist_" + item.wrk_id).length > 0) {
        //     if (item.isnew) {
        //       var e = $("#panel_end")[0];
        //       //e.scrollIntoView(true);
        //     }

        //     $("#renametasklist_" + item.wrk_id).focus();
        //   }
        // }, 100);
        this.nextTick(() => {
          if ($("#renametasklist_" + item.wrk_id).length > 0) {
            if (item.isnew) {
              var e = $("#panel_end")[0];
              //e.scrollIntoView(true);
            }
            setTimeout(() => {
              $("#renametasklist_" + item.wrk_id).focus();
            }, 100);

          }
        });
      });
    }
  }
  /**
   * close rename option - hide inputbox
   * @param  {any} item selected item
   * @param  {any} forceToclose close by click on other element
   * @param  {any} [event] click event
   * @return {void}@memberof TaskListComponent
   */
  closeRenameTaskList(item, forceToclose, event?) {
    if (!forceToclose) {
      item.list_title = _.trim(item.list_title);
      if (item.list_title != "") {
        item.iseditable = false;
        this.newactivated = false;
        if (item.isnew) {
          this.createTask(item);
        }
        else {
          this.updateTask(item, 1);
        }
      }
      else {
        if (item.isnew) {
          item.iseditable = false;
          var wrk_idx = _.findIndex(this.taskList, (t) => {
            return (t.wrk_id == item.wrk_id);
          });

          this.taskList.splice(wrk_idx, 1);
          this.newactivated = false;
          //   setTimeout(() => {

          // },100
          //);
        }
        else {
          item.iseditable = true;
          // item.iseditable = false;
          this.RenameTaskList(item);
          //  var messageService: any = this.messageService;
          this.messageService.clear();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Task title is required." });

        }

        // return false;
      }

    }
    else {
      item.iseditable = false;
      this.newactivated = false;
    }
    if (event != undefined && event != null) {
      $(event.target).parents('.drag_items').removeClass('disable_drag');
    }
  }
  popupCloseRenameSubTask(item, parentItem, forceToclose, event?) {
    this.task_label_editable = false;
    item.steps = $("#selectedtask_steps").val();
    $("#selectedtask_steps_container").hide();
    this.closeRenameSubTask(item, parentItem, false);
  }
  /**
   * close rename sub task - hide input box
   * @param  {any} item selected sub task
   * @param  {any} parentItem selected main task
   * @param  {any} forceToclose close rename by click on other element
   * @param  {any} [event] click event
   * @return 
   * @memberof TaskListComponent
   */
  closeRenameSubTask(item, parentItem, forceToclose, event?) {
    if (!forceToclose) {
      item.steps = _.trim(item.steps);
      var selectedCardId = $("#renamesubtask_" + item.workFlowId);
      if (item.steps != "") {
        item.iseditable = false;
        selectedCardId.parents(".ui-panel-titlebar").children('.ui-panel-titlebar-toggler').show();
        this.newactivated = false;
        var colornames = [];
        _.forEach(item.color_list, (s) => {
          return colornames.push(s.name);
        });
        item.label = _.join(colornames, ',');

        if (item.isnew) {
          this.createSubTask(item, parentItem);
        }
        else {
          this.updateSubTask(item, 3);
        }

      }
      else {
        if (item.isnew) {
          var index = _.findIndex(parentItem.children, (w) => {
            return (item.workFlowId == w.workFlowId)
          });
          if (index > -1) {
            parentItem.children.splice(index, 1);
          }
        }
        else {
          item.steps = this.tempsubTaskTitle;
          item.iseditable = false;
        }
        // this.messageService.add({ severity: 'error', summary: 'Error', detail: "Sun Task name is required." });
        // this.RenameSubTask(item);
        return false;
      }

    }
    else {
      item.iseditable = false;
      this.newactivated = false;
    }
    if (event != undefined && event != null) {
      $(event.target).parents('.sub_taskitems').removeClass('disable_drag');
    }
  }
  /**
   * create task - connect to api serive
   * @param  {any} item request value
   * @return {void}@memberof TaskListComponent
   */
  createTask(item) {
    var wrk_id = item.wrk_id;
    var isGantt = item.isGantt;
    if (item.isnew) {
      wrk_id = 0;
      isGantt = 1;

    }
    var position = (this.taskList.length > 0) ? this.taskList.length : 1;
    var req: any = {
      "employeeId": this.employeeId,
      "companyId": this.companyId,
      "wrk_id": wrk_id,
      "list_title": _.trim(item.list_title),
      "titleType": 'task',
      "position": 1,
      "legoid": this.selectedModuleId,
      "createdby": this.employeeId,
      "b_id": 0,
      "created_date": "",
      "ar_sec": 0,
      "b_position": 0,
      "color": "#f0f3f5",
      "IsGantt": isGantt,
      "options": 1
    };
    if (this.isBoardTask == 1) {
      req.options = 2;
      req.b_id = this.selectedBoardId;
      //  req.b_position = this.taskList.length + 1;
      req.taskorder = this.taskList.length + 1;
    }
    this.WorkflowService.addTask(req).then((res: any) => {
      if (res) {
        if (res.status) {
          if (!_.isEmpty(res.result)) {
            if (res.result.workflowTasks.length > 0) {
              var data = res.result.workflowTasks[0]
              item.wrk_id = data.wrk_id;
              item.list_title = data.list_title;
              item.wrk_pos = data.position;
              item.position = data.position;
              item.isGantt = data.isGantt;
              item.t_createdby_name = data.t_createdby_name;
              var sdate = data.startdate;
              if (item.isnew) {
                this.addnewSubTask(item);
              }
              item.isnew = false;
              item.iseditable = false;
              this.newactivated = false;
              //console.log("Task added", res);
              this.updateTaskListAfter(item);
            }

            this.workflowCount = res.result.taskcounts[0];
            this.selectedTaskCount = this.workflowCount;
            this.updateWorkflowCounts();
          }

        }


      }
    });
  }
  /**
   * update task
   * @param  {any} item selected item
   * @param  {any} option 1-update title,2 - delete task,4 - update ar_sec,6 - task expand state,7 - task collapse state,
   * 8 - set isgantt true or false, 9 - set task color, 10 - update task position , 11 - update task order in list, 12 - set is auto complete percentage true/false,
   * @return {void}@memberof TaskListComponent
   */
  updateTask(item, option) {
    var wrk_id = item.wrk_id;
    if (item.isnew) {
      wrk_id = 0;
    }
    var req: any = {
      "employeeId": this.employeeId,
      "companyId": this.companyId,
      "wrk_id": wrk_id,
      "list_title": _.trim(item.list_title),
      "position": item.wrk_pos,
      "old_position": item.wrk_old_pos,
      "ar_sec": item.ar_sec,
      "legoId": this.selectedModuleId,
      "createdby": this.employeeId,
      "b_id": item.b_id,
      "b_position": item.b_position,
      "color": item.color,
      "IsGantt": item.isGantt,
      "isAutoCompletePer": item.isAutoCompletePer,
      "options": option
    };
    if (this.isBoardTask == 1) {
      req.taskorder = item.taskorder;
      req.old_taskorder = item.old_taskorder;
      req.b_id = (this.selectedBoardId != null && this.selectedBoardId != undefined && this.selectedBoardId != 0) ? this.selectedBoardId : 0;
    }
    this.WorkflowService.updateTask(req).then((res: any) => {
      if (res) {
        if (res.status) {
          if (!_.isEmpty(res.result)) {
            if (res.result.workflowTasks.length > 0) {
              var data = res.result.workflowTasks[0]
              item.wrk_id = data.wrk_id;
              item.list_title = data.list_title;
              item.position = data.wrk_pos;
              item.b_position = data.b_position;
              item.color = data.color;
              item.isAutoCompletePer = data.isAutoCompletePer;
              item.isnew = false;
              item.iseditable = false;
              this.newactivated = false;
              this.selectedColor = '';
              //console.log("Task added", res);
              if (option == 12) {
                this.calcPercentageMultiple(item);
              }
            }
            this.updateTaskListAfter(item);
            this.workflowCount = res.result.taskcounts[0];
            this.selectedTaskCount = this.workflowCount;
            this.updateWorkflowCounts();
          }
        }
        if (option == 2) {
          this.DbGroupService.taskResponsibilitesUpdated();
          this.getTaskList(1);
        }
      }
    });
  }
  /**
   * update client side data of task after actual updation
   * @param  {any} item selecte item
   * @return {void}@memberof TaskListComponent
   */
  updateTaskListAfter(item) {
    var index = _.findIndex(this.taskList, (d) => {
      return (item.wrk_id == d.wrk_id)
    })
    switch (this.selectedFilterOption.option) {
      case 1:

        break;
      case 2:
        if ((item.ar_sec == 0 && item._status == 1)) {
          // this.taskList.splice(index, 1);
          var isInprogress = _.findIndex(this.taskList[index].children, (t) => {
            return (t.workFlowId == item.workFlowId)
          })
          if (isInprogress >= 0) {
            this.taskList[index].children.splice(isInprogress, 1);
          }
          var nomoreInporgress: any[] = _.filter(this.taskList[index].children, (t) => {
            return (t._status == 0 && t.workFlowId > 0)
          })
          if (nomoreInporgress.length == 0) {
            this.taskList.splice(index, 1);
          }
        }
        if (item.ar_sec == 1) {
          this.taskList.splice(index, 1);
        }
        break;
      case 3:
        if ((item.ar_sec == 0 && item._status == 0)) {
          var isInprogress = _.findIndex(this.taskList[index].children, (t) => {
            return (t.workFlowId == item.workFlowId)
          })
          if (isInprogress >= 0) {
            this.taskList[index].children.splice(isInprogress, 1);
          }
          var nomoreCompleted: any[] = _.filter(this.taskList[index].children, (t) => {
            return (t._status == 1 && t.workFlowId > 0)
          })
          if (nomoreCompleted.length == 0) {
            this.taskList.splice(index, 1);
          }
        }
        if (item.ar_sec == 1) {
          this.taskList.splice(index, 1);
        }
        break;
      case 4:
        if (item.ar_sec == 0) {
          this.taskList.splice(index, 1);
        }
        break;
      case 5:

        break;
      default:
        break;
    }

  }
  /**
   * create actual task add/update - connect to workflow services
   * @param  {any} item 
   * @param  {any} parentItem 
   * @return {void}@memberof TaskListComponent
   */
  createSubTask(item: any, parentItem) {
    var wrkflow_id = item.workFlowId;
    if (item.isnew) {
      wrkflow_id = 0;
    }
    var boardId = 0
    if (this.isBoardTask == 1) {
      boardId = this.selectedBoardId;
    }
    var position = (parentItem.children.length > 0) ? parentItem.children.length : 1;
    var req = {
      "employeeId": this.employeeId,
      "companyId": this.companyId,
      "workFlowId": wrkflow_id,
      "steps": item.steps,
      "position": position,
      "titleType": 'task',
      'parent_id': item.parent_id,
      "legoid": this.selectedModuleId,
      "b_id": boardId,
      "label": item.label
    };
    this.WorkflowService.addSubTask(req).then((res: any) => {
      if (res) {
        if (res.status) {
          if (!_.isEmpty(res.result)) {
            if (res.result.workflowList.length > 0) {
              if ($("#card_" + item.workFlowId).length > 0) {
                var e = $("#card_" + item.workFlowId)[0];
                e.scrollIntoView(true);
              }
              var data = res.result.workflowList[0];
              item.workFlowId = data.workFlowId;
              item.steps = data.steps;
              item.position = data.position;
              item.isnew = false;
              item.iseditable = false;
              item.wrk_id = data.parent_id;
              item.list_title = parentItem.list_title;
              item.t_created_date = data.t_created_date;
              item.s_createdby_name = data.s_createdby_name;
              item.t_createdby = data.t_createdby;
              var sdate = data.startdate;
              item.responsibilities = [];
              item.responsibilities = this.WorkflowService.listToAray(data.responsibility, ',');
              item.responsibilityCount = item.responsibilities.length;
              item.startdate = (sdate != null && sdate != "" && sdate != "Invalid date") ? moment(sdate).format(this.displayapiFormat) : null;
              // this.newactivated = false;
              //this.addnewSubTask(item);
              //console.log("Task added", res);
              item.label_list = [];
              if (!_.isEmpty(res.result.workFlowLabels)) {
                item.label_list = res.result.workFlowLabels;
              }

              this.updateTaskListAfter(item);

              /// sending text and email notices

              var req_notices = {
                ModuleId: this.selectedModuleId,
                CompanyId: this.companyId,
                EmployeeId: this.employeeId,
                Task: parentItem.list_title,
                Card: data.steps
              };
              this.NotificationService.sendNotification(req_notices).then((res: any) => {
                //console.log("result text", res.status);
              });

            }
            this.workflowCount = res.result.taskcounts[0];
            this.selectedTaskCount = this.workflowCount;
            this.updateWorkflowCounts();
            this.DbGroupService.taskResponsibilitesUpdated("taskAdded");
          }
        }
      }
    });
  }
  /**
   * update tasks - actual connect to workflow services
   * @param  {any} item seleted item
   * @param  {any} option  1 - change status completed or inprogress, 2 - change expand statsu collpased or expanded state, 3 -  change task name, 4 - change start date and end date
   * 5 - change color , 6 - change color, 7 - completed percentage, 8 - move sub task,9 - move sub task
    * @return {void}@memberof TaskListComponent
   */
  updateSubTask(item, option) {
    var _status = (item._status == true || item._status == 1) ? 1 : 0; //var endDate  = moment(this.selectedtask.enddate);
    var startdate = (item.startdate != null && item.startdate != "" && item.startdate != "Invalid date") ? moment(item.startdate).format(this.dotnetFullDateFormat) : '';
    var enddate = (item.enddate != null && item.enddate != "" && item.enddate != "Invalid date") ? moment(item.enddate).format(this.dotnetFullDateFormat) : '';
    var b_id = 0;
    if (this.isBoardTask == 1) {
      var b_id = this.selectedBoardId;
    }

    var req = {
      "workFlowId": item.workFlowId,
      "_status": _status,
      "expand_status_st": item.expand_status_st,
      "steps": item.steps,
      "position": item.position,
      "parent_id": item.parent_id,
      "legoid": this.selectedModuleId,
      "old_parent_id": item.old_parent_id,
      "startdate": startdate,
      "enddate": enddate,
      "label": item.label,
      "priority": item.priority,
      "complete_per": item.complete_per,
      "completedby": this.employeeId,
      "b_id": b_id,
      "options": option
    };
    this.WorkflowService.updateSubTask(req).then((res: any) => {
      if (res) {
        if (res.status) {
          if (!_.isEmpty(res.result)) {
            if (res.result.workflowList.length > 0) {
              var data = res.result.workflowList[0];
              item._status = data._status;
              item.expand_status_st = data.expand_status_st;
              item.steps = data.steps;
              item.label = (data.label != null && data.label != '') ? data.label : 'none';
              item.completeddate = (data.completeddate != null && data.completeddate != '') ? data.completeddate : '';
              item.priority = (data.priority != null && data.priority != '') ? data.priority : 0;
              item.complete_per = (data.complete_per != null && data.complete_per != '') ? data.complete_per : 0;
              item.wrk_id = data.wrk_id;
              item.parent_id = data.wrk_id;
              item.isnew = false;
              item.iseditable = false;
              //console.log("Sub Task updated", res);
              this.updateTaskListAfter(item);
            }
            this.workflowCount = res.result.taskcounts[0];
            this.selectedTaskCount = this.workflowCount;
            this.updateWorkflowCounts();
            if (option == 8) {
              this.reorderDummyNode(item);
            }
          }
        }
        if (option == 9) {
          var index = _.findIndex(this.selectedparenttask.children, (s) => {
            return (s.workFlowId == item.workFlowId)
          });
          if (index > -1) {
            this.selectedparenttask.children.splice(index, 1);
          }
        }
        // if (option == 6) {
        //   this.getTaskList(this.getTasklistOptions);
        // }
        if (option == 4) {
          item.getDueOn = this.getDueOn(item);
        }
        if (item.isAutoCompletePer == 1) {
          this.calculatePercentageComp(item);
        }
        if (option == 1) {
          if (item.completeddate != '' && item.completeddate != null && item.completeddate != undefined) {
            item.completeddateStr = this.getCompletedOn(item);//'Completed on ' + moment(childvalue.completeddate).format(date_dispayformat.date_Format)
          }
        }
        // item.getDueOn = this.getDueOn(childvalue);
        // }
      }
    });
  }
  /**
   * load sub task comments on move-hover
   * @param  {any} subtask mouse hovered sub tasks
   * @param  {any} isLooped check it is first time load
   * @return {void}@memberof TaskListComponent
   */
  getCommentTooltip(subtask, isLooped) {
    this.selectedtask = subtask;
    var str = "";
    if (subtask.commentsList != undefined && subtask.commentsList != null && subtask.commentsList.length > 0) {
      str += `<ul class="assignee_list">`;
      _.forEach(subtask.commentsList, (comments) => {
        var stra_val = comments.comments.replace(/<[^>]*>/g, '');
        stra_val = stra_val.replace(/\&nbsp;/g, '');
        stra_val = stra_val.trim();
        str += `<li><span><i class="fa fa-user"></i>` + comments.createdby_name + `</span>`;
        // str += `<div>` + comments.comments + `</div></li>`;
        str += `<div>` + stra_val + `</div></li>`;
      });
      str += `</ul>`;
    }
    else {
      if (subtask.commentsListInitialized == undefined) {
        subtask.commentsListInitialized = true;
        if (isLooped == false) {
          this.updateComments({ 'task_id': subtask.workFlowId }, 1);
          this.ngZone.runOutsideAngular(() => {
            // setTimeout(() => {
            //   this.getCommentTooltip(subtask, true);
            // }, 1000);
            this.nextTick(() => {
              this.getCommentTooltip(subtask, true);
            });
          });

        }
      }
    }
    this.tempTooltip = str;
  }
  /**
   * update check list
   * @param  {any} item selected sub tasks
   * @param  {any} option  1- get all check list of selected sub task, 2 - add new check list,3 - update check list,4 - rename,5 - delete , 6 - update position
   * @return {void}@memberof TaskListComponent
   */
  updateCheckList(item, option) {
    this.tempcheckListUpdated = true;
    var error_message = '';
    if (option == 2) {
      error_message = 'Check list insertion failed.';
    }
    error_message = (option == 2) ? 'Check list insertion failed.' : (option == 3) ? 'Status updation failed.' : 'Updation Failed';
    item.options = option;
    this.WorkflowService.CheckList(item).then((res: any) => {
      if (res) {
        if (res.status == 1) {
          if (res.result != null) {
            var updatedItem = res.result[0];
            if (option == 2) {
              this.tempcheckList.push(updatedItem);
            }
            else if (option == 6) {
              this.tempcheckList = res.result;
            }
            else {
              item = updatedItem;
            }
            $("#checklist_name").val("");
            // item.status = updatedItem.status;
            // item.chkname= updatedItem.chkname;
          }
          if (option == 5) {
            _.remove(this.tempcheckList, (d) => {
              return (d.task_chkid == item.task_chkid)
            })
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Check List " + item.chkname + " successfully removed" });
          }
          if (!_.isEmpty(this.selectedtask)) {
            this.selectedtask.taskCount = (this.tempcheckList != null && this.tempcheckList != undefined ? this.tempcheckList.length : 0);
          }
          this.cd.detectChanges();
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error_message });
        }
      }
    });
  }
  /**
   * update comments
   * @param  {any} item selected sub tasks and comments 
   * @param  {any} option 1 - get all , 2 - add,4 - delete,3- update 
   * @return 
   * @memberof TaskListComponent
   */
  updateComments(item, option) {
    this.messageService.clear();
    if ((option == 2 || option == 3) && (item.comments == '' || item.comments == null)) {
      return false;
    }
    var error_message = '';
    switch (option) {
      case 2:
        error_message = 'Comments saved';
        break;
      case 3:
        error_message = 'Comments updated';
        break;
      case 4:
        error_message = 'Comments deleted';
        break;
      default:
        error_message = '';
        break;
    }
    item.options = option;
    this.WorkflowService.TaskComments(item).then((res: any) => {
      if (res) {
        var resultAr = [];
        if (res.status == 1) {
          resultAr = res.result;
          if (error_message != '') {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: error_message + ' successfully.' });
          }
        }
        else {
          if (error_message != '') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error_message + ' failed.' });
          }
        }
        this.selectedtask.commentsList = resultAr;
        this.selectedComment = null;
        this.comment_box = "";
        this.selectedtask.commentsCount = this.selectedtask.commentsList.length;
      }
    });
  }
  /**
   * get sub task completion date
   * @param  {any} item  selected sub task
   * @return 
   * @memberof TaskListComponent
   */
  getCompletedOn(item) {
    var str = '';
    var date = item.completeddate;
    if (!_.isEmpty(item)) {
      if (item.completeddate != '' && item.completeddate != null && item.completeddate != undefined) {
        //str = 'Completed on  ' + moment(item.completeddate).format(this.displayapiFormat)
        str = 'Completed on ' + moment(date).format(this.date_dispayformat.date_Format)
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml(str);
  }
  /**
   * get due - inprogress or over-due
   * @param  {any} item selected sub task
   * @param  {any} [event] selected event
   * @return 
   * @memberof TaskListComponent
   */
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
  /**
   * drag and drop task in task list
   * @param  {any} newindex new index in task list
   * @param  {any} oldindex old index in task list
   * @return {void}@memberof TaskListComponent
   */
  moveTask(newindex, oldindex) {
    var o_position = oldindex + 1;
    var n_position = newindex + 1;
    newindex = (this.taskList.length == newindex) ? (this.taskList.length - 1) : newindex;
    var item = this.taskList[newindex];
    item.wrk_pos = n_position;
    item.wrk_old_pos = o_position;
    var option = 10;
    if (this.isBoardTask == 1) {
      item.taskorder = n_position;
      item.old_taskorder = o_position;
      item.board_id = this.selectedBoardId;
      option = 11;
    }
    this.updateTask(item, option);
  }
  /**
   * drag and drop sub task 
   * @param  {any} event selection event
   * @return {void}@memberof TaskListComponent
   */
  moveSubTasks(event) {
    var from_parent = $(event.from).data('wrkid');
    var to_parent = $(event.to).data('wrkid');


    // if (!_.isEmpty(p_item)) {

    if (from_parent == to_parent) // same parent
    {
      var p_item = _.find(this.taskList, (p) => {
        return (p.wrk_id == from_parent)
      });
      var item = p_item.children[event.newIndex];
      item.old_parent_id = from_parent;
      item.position = event.newIndex + 1;
      // if (event.newIndex == 0) {
      //   item.position = 1;
      // }
      // else {
      //   var prev_item = p_item.children[event.newIndex - 1];
      //   item.position = prev_item.position + 1;
      // }
      this.updateSubTask(item, 8);
    }
    else {
      var dp_item = _.find(this.taskList, (p) => {
        return (p.wrk_id == to_parent)
      });
      var item = dp_item.children[event.newIndex];
      var prev_item = dp_item.children[event.newIndex - 1];
      item.parent_id = to_parent;
      item.old_parent_id = from_parent;
      item.position = event.newIndex + 1;
      // if (event.newIndex == 0) {
      //   item.position = 1;
      // }
      // else {
      //   var prev_item = dp_item.children[event.newIndex - 1];
      //   item.position = prev_item.position + 1;
      // }
      if (!_.isEmpty(prev_item)) {
        if (prev_item.workFlowId == 0) {
          item.position = 1;
        }
      }
      this.updateSubTask(item, 8);
    }
    // }

  }
  /**
   * change task status
   * @param  {any} status 
   * @param  {any} item 
   * @return {void}@memberof TaskListComponent
   */
  changeTaskStatus(status, item) {
    this.updateSubTask(item, 1);
    //console.log("change status", status);
  }
  /**
   * make it collapsed
   * @param  {any} event selected event
   * @param  {any} item selected task
   * @return {void}@memberof TaskListComponent
   */
  ExpandCollapseSubtask(event, item,panelcolor_ul) {
    //console.log("change collpase state", event);
    if (event.originalEvent.fromState != "void" && item.workFlowId != 0) {
      if((event.collapsed == true)){
        item.expand_status_st =0;
        $("#panelcolorul_" + item.workFlowId).addClass("panelcolor_collapsed");
      }
      else{
        item.expand_status_st =1;
        $("#panelcolorul_" + item.workFlowId).removeClass("panelcolor_collapsed");
      }
      
      // if (!this.isIE11) {
      this.updateSubTask(item, 2);
      // }
    }
  }
  /**
   * delete sub task
   * @return {void}@memberof TaskListComponent
   */
  deleteSubTask() {
    this.updateSubTask(this.selectedtask, 9);
    this.confirmdelete_display = false
  }
  /**
   * set auto height of the panel
   * @param  {*} event 
   * @return {void}@memberof TaskListComponent
   */
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + $("#workflow_tab_navigation").innerHeight()
      + 2
    );

    //  sub tabs class: sub_tab_container
    var h = res_h - 50;
    if ($("body").hasClass("pinmodule")) {
      h += 105;
    }
    if (!isNaN(h)) {
      // $("#taskcomp-pg .custom_scrollpane").css("height", h + "px");
      $(".workflow_container .taskSet1").css("height", h + "px");
    }
  }
  /**
   * validate start and end date - auto adjustment process
   * @param  {any} selecteddate selected task start/end date
   * @param  {any} Flag flag for is start or end date
   * @param  {any} compareFlag compare flag
   * @param  {any} createdDate auto adjust of end date
   * @return {void}@memberof TaskListComponent
   */
  onStartDateChange(selecteddate, Flag, compareFlag, createdDate) {
    //selecteddate = moment(selecteddate).format(this.date_dispayformat.date_Format);
    if (selecteddate != null && selecteddate != 'Invalid Date' && selecteddate != undefined) {

      this.selectedtask[Flag] = (this.selectedtask[Flag] != null && this.selectedtask[Flag] != undefined && this.selectedtask[Flag] != "Invalid date") ? this.selectedtask[Flag] : null;

      var currentDate = moment(selecteddate);
      var valid = true;
      var sdate: any = moment(this.selectedtask[Flag]);
      var m: any = moment(selecteddate);
      if (m.isSame(sdate)) {
        valid = false;
      }
      else {
        this.selectedtask[Flag] = m._d;
      }
      if (this.selectedtask[compareFlag] != null && this.selectedtask[compareFlag] != "" && valid) {
        var compareDate: any = moment(this.selectedtask[compareFlag]);
        var selectedItemDate: any = moment(this.selectedtask[Flag]);
        var itemCreatedDate: any = moment(this.minDate);
        if (compareDate.isValid()) {
          var comparevalid = true;
          var er_label = "";
          var alteredDate: any;
          if (Flag == 'startdate') {
            if (selectedItemDate > compareDate) {
              comparevalid = false;
              alteredDate = currentDate.add(1, 'days');
            }

            //    er_label = "Start date should be less than end date.";
          }
          else if (Flag == 'enddate') {

            if (selectedItemDate < compareDate) {
              comparevalid = false;
              if (itemCreatedDate >= selectedItemDate) {
                alteredDate = currentDate
              }
              else {
                alteredDate = currentDate.add(-1, 'days');
              }
            }
          }
          if (!comparevalid) {
            // setTimeout(() => {
            this.selectedtask[compareFlag] = alteredDate._d;

            // }, 200);
            // this.messageService.add({ severity: 'error', summary: 'Error', detail: er_label });
            //  return false;
          }
        }
      }
      if (valid) {

        this.updateSubTask(this.selectedtask, 4);
      }
      //console.log(selecteddate);
    }
  }
  /**
   * auto compelete of percentage claculation
   * @param  {any} selectedItem 
   * @return {void}@memberof TaskListComponent
   */
  calculatePercentageComp(selectedItem) {
    selectedItem.complete_per = this.CommonAppService.getCompletePercentage(selectedItem.startdate, selectedItem.enddate);
  }
  /**
   * auto compelete of percentage claculation
   * @param  {any} wrklist 
   * @return {void}@memberof TaskListComponent
   */
  calcPercentageMultiple(wrklist) {
    if (wrklist.isAutoCompletePer == 1) {
      _.forEach(wrklist.children, (item) => {
        this.calculatePercentageComp(item);
      });
    }
  }
  /**
   * validate start date end date  based on end date selection
   * @param  {any} selecteddate selected end date
   * @return {void}@memberof TaskListComponent
   */
  onEndDateChange(selecteddate) {
    if (selecteddate != null) {
      var endDate = moment(selecteddate);
      if (this.selectedtask.startdate != null && this.selectedtask.startdate != "") {
        var startdate = moment(this.selectedtask.startdate);
        if (startdate.isAfter(endDate)) {
          this.updateSubTask(this.selectedtask, 4);
        }
        else {

        }
      }
      else {
        this.updateSubTask(this.selectedtask, 4);
      }
      //console.log(selecteddate);
    }

  }
  /**
   * add sub task color
   * @param  {any} color color value
   * @return {void}@memberof TaskListComponent
   */
  addSubtaskColor() {
    // this.selectedtask.colors = color;    
    //this.labelPicker.togglePanel();
    //this.multi_colors.push({name:color});
    //this.selectedtask.color_list.push(color);
    //this.selectedtask.color_list = [];
    // this.selectedtask.color_list = ","; 
    // if (color != null && color != undefined && color != "") {    

    var selectedlabel;
    if (!_.isEmpty(this.company_label)) {
      selectedlabel = _.find(this.company_label, (c) => {
        return (c.labelColor == this.selectedtask.label)
      });
    }
    if (!_.isEmpty(selectedlabel)) {
      var labelid = selectedlabel.labelId;
      var labelcolor = this.selectedtask.label;
    }
    else {
      //this.Addcompanylabel_display = true;
      // this.addNewlbl_popup();
      return false;
    }



    var colorObj = {
      name: "#ddd",
      isnew: true
    }
    this.selectedtask.color_list.push(colorObj);
    this.toggle = true;
    // var colornames = [];
    // _.forEach(this.selectedtask.color_list, (s) => {
    //   return colornames.push(s.name);
    // });
    // this.selectedtask.label = _.join(colornames, ',');
    //this.labelPicker.onInputClick();

    // if (this.selectedtask.label != null && this.selectedtask.label != undefined && this.selectedtask.label != "") {
    //   this.updateSubTask(this.selectedtask, 5);
    // }
    // }
  }
  /**
   * change Priority - high,medium,etc
   * @param  {any} event 
   * @return {void}@memberof TaskListComponent
   */
  changePriority(event) {
    this.selectedtask.priority = event.value;
    this.updateSubTask(this.selectedtask, 6)
    //console.log("change priority: ", event);
  }
  /**
   * change completion percenage
   * @param  {any} event 
   * @return {void}@memberof TaskListComponent
   */
  changeCompletedPercent(event) {
    //console.log("change completed percentage: ", event);
    this.selectedtask.complete_per = event.value;
    this.updateSubTask(this.selectedtask, 7)
  }
  /**
   * add check list
   * @return {void}@memberof TaskListComponent
   */
  addCheckList(checklist_name) {

    if (this.operationalRights == 'Unrestricted') {
      var checklist_name = $("#checklist_name").val()
      if (checklist_name != "") {
        var item = _.cloneDeep(workflowCheckListProto);
        item.employeeId = this.employeeId;
        item.companyId = this.companyId;
        item.taskid = this.selectedtask.workFlowId;
        item.chkname = checklist_name;
        item.status = 0;
        item.createdby = this.employeeId;
        item.position = this.tempcheckList.length + 1;
        item.options = 2;
        this.updateCheckList(item, 2);
      }
    }
  }
  /**
   * update check list whether its completed or inprogress
   * @param  {any} checklist selected checklist
   * @param  {any} event selected event
   * @return {void}@memberof TaskListComponent
   */
  changechecklistStatus(checklist, event) {
    if (event == true) {
      checklist.status = 1;
      checklist.completedby = this.employeeId;
    }
    else {
      checklist.status = 0;
      checklist.completedby = 0;
    }
    this.updateCheckList(checklist, 3);
    //console.log("check list change status: ", event)
  }
  /**
   * rename check list
   * @param  {any} event selected primeng event
   * @param  {any} data slected check lsit
   * @param  {any} [inplaceElement] compoment event
   * @return {void}@memberof TaskListComponent
   */
  renameCheckList(event, data, inplaceElement?) {
    // inplaceElement.active = false
    data.options = 4;
    this.updateCheckList(data, 4);
    // if (event.field == "chkname") {
    //   event.data.options = 4;
    //   this.updateCheckList(event.data, 4);
    // }
    // //console.log("check list rename: ", event)
  }
  /**
   * remove check list
   * @param  {any} item  selected check list
   * @param  {any} list check list
   * @return {void}@memberof TaskListComponent
   */
  removeCheckList(item, list) {
    item.options = 5;
    this.selectedtask = list;
    this.updateCheckList(item, 5);
  }
  /**
   * reorder check list position
   * @param  {any} event reorder event
   * @return {void}@memberof TaskListComponent
   */
  reorderCheckList(event) {
    var old_postion = event.oldIndex + 1;
    var position = event.newIndex + 1;
    var item = this.tempcheckList[event.newIndex];
    // if (event.newIndex > event.oldIndex) {
    //   position = event.newIndex;
    //   item = this.selectedtask.checkList[event.newIndex - 1];
    // }

    item.position = position;
    item.old_position = old_postion;
    this.updateCheckList(item, 6);
    //console.log("check list reorder", event);
  }
  /**
   * remove draggle class
   * @param  {any} event drag event
   * @param  {any} parentDragClass parent drag element class
   * @return {void}@memberof TaskListComponent
   */
  disableDrag(event, parentDragClass) {
    $(event.target).parents(parentDragClass).addClass('disable_drag');
    //console.log("event drag");
    // event.preventDefault(true);
  }
  /**
   * add comments
   * @return {void}@memberof TaskListComponent
   */
  addTaskComment() {
    if (this.comment_box != "") {
      var item = this.selectedComment;
      if (this.selectedComment == null) {
        item = {
          'task_id': this.selectedtask.workFlowId,
          'comments': this.comment_box,
          'createdby': this.employeeId,
          'options': 2
        }
        this.updateComments(item, 2);
      }
      else {
        item.options = 3;
        item.comments = this.comment_box;
        this.updateComments(item, 3);
      }
    }
  }
  /**
   * update sub task comments
   * @param  {any} item 
   * @return {void}@memberof TaskListComponent
   */
  selectToupdateComment(item) {
    this.selectedComment = item;
    this.comment_box = this.selectedComment.comments
    // item.option=3;
    // this.updateComments(item,3);
  }
  /**
   * delete comments
   * @param  {any} item 
   * @return {void}@memberof TaskListComponent
   */
  deleteComment(item) {
    this.updateComments(item, 4);
  }
  /**
   * clear comment
   * @return {void}@memberof TaskListComponent
   */
  ClearTaskComment() {
    this.comment_box = "";
    this.selectedComment = null;
  }
  ngAfterViewInit() {
    // this.cdr.detach();
    // if (this.isIE11) {
    // this.setElementAutoHeight(null);
    // }

    // console.log("afterview init", $("#taskcomp-pg #taskcomp-topdropdown"));
    // $("#taskcomp-topdropdown").css('top', ($("#workflow_tab_navigation").offset().top - $("#taskcomp-pg").height() - 23));  

    // var tabHeight =($("#tab_workflow").height() < 0 ? 0:$("#tab_workflow").height());
    var h: any = ($('.breadcrumb_container').height() + $('.inside_modules ').height() + $(".app-header").height() + 2);
    if ($("body").hasClass("pinmodule")) {
      h = h - 140;
    }
    $("#taskcomp-topdropdown").css('top', h);
  }
  triggerAutoHeight(count) {
    if (this.heightRendered == false && count == true) {
      this.heightRendered = true;
      this.setautoheightWdith();
      //console.log("last count reached", count);
    }
  }
  setautoheightWdith() {
    this.ngZone.runOutsideAngular(() => {
      // if (!this.isIE11) {
      this.setElementAutoHeight(null);
      var w = 250;
      if ($('.workflow_container .workflow_task ').length > 0) {
        var e = $('.workflow_container .workflow_task ')[0];
        w = $(e).width();
      }
      if (this.taskList.length > 0) {
        w += (this.taskList.length) * w + 210;
      }
      $('.workflow_container .taskSet1').css('width', w + 'px')

      // var h: any = ($('.breadcrumb_container').height() + $('.inside_modules ').height() + $("#tab_workflow").height() + $(".app-header").height() + 12);
      // if ($("body").hasClass("pinmodule")) {
      //   h = h - 96;
      // }
      // $("#taskcomp-topdropdown").css('top', h);

      ////sub task height for label list////////
      var lbl = $('#subtask_container').innerHeight();
      $('#label_container').css('max-height', lbl + 'px');
      var taskcomp_h: any = ($('.breadcrumb_container').height() + $('.inside_modules ').height() + $(".app-header").height() + 2);
      if ($("body").hasClass("pinmodule")) {
        taskcomp_h = taskcomp_h - $('.breadcrumb_container').height();
      }
      $("#taskcomp-topdropdown").css('top', taskcomp_h);
      // }
    });
    this.searchFocusItem();
  }
  /**
   * set auto height of panel
   * @return {void}@memberof TaskListComponent
   */
  ngAfterViewChecked() {
    // this.taskListTemplateChild.changes.subscribe(t => {
    //  this.setautoheightWdith();
    // });

  }

  /**
   * auto complete responsibilities
   * @param  {any} event 
   * @return {void}@memberof TaskListComponent
   */
  filterResponsibilityMultiple(event) {
    let query = event.query;
    var req = {
      CompanyId: this.companyId,
      EmployeeName: query,
      WorkFlowId: this.selectedtask.workFlowId
    };
    this.WorkflowService.getEmployeeList(req).then((res: any) => {
      if (res.status == 1) {
        res.result = (res.result == null) ? [] : res.result;
        this.selectedResponsibilitySuggestion = res.result;
        // this.selectedResponsibilitySuggestion = this.filterResponsibilitry(query, res.result);
      }
      else {
        this.selectedResponsibilitySuggestion = [];
      }
    });
    // this.countryService.getCountries().then(countries => {
    //     this.filteredCountriesMultiple = this.filterCountry(query, countries);
    // });
  }
  filterResponsibilitry(query, resonsibilities: any[]): any[] {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered: any[] = [];
    for (let i = 0; i < resonsibilities.length; i++) {
      let responsibility = resonsibilities[i];
      if (responsibility.employeeName.toLowerCase().indexOf(query.toLowerCase()) > -1) {
        filtered.push(responsibility);
      }
    }
    return filtered;
  }
  onUnSelectResponsibility(event) {
    var employee = event;
    if (event.userResponsibilityId != 0) {
      if (this.selectedtask.t_createdby == this.employeeId) {
        //console.log(event);
        var resp_req = {
          'UserResponsibilityId': event.userResponsibilityId,
          'workFlowId': this.selectedtask.workFlowId,
          'legoId': this.selectedModuleId,
          'employeeId': event.employeeId,
          'userId': this.employeeId,
          'option': 2
        };
        this.updateResponsibility(resp_req, 1);
      }
      else {
        this.ngZone.runOutsideAngular(() => {
          // setTimeout(() => {
          //   this.selectedResponsibities.unshift(employee);
          // }, 1000);
          this.nextTick(() => {
            this.selectedResponsibities.unshift(employee);
          });
        });

        this.messageService.add({ severity: 'error', summary: 'Error', detail: "The task owner only can delete the responsibility users." });
        return false;
      }
    }
  }
  onSelectResponsibility(event) {
    var al_exist = _.find(this.selectedResponsibities, (res) => {
      return (res.employeeId == event.employeeId && res.userResponsibilityId != 0)
    });
    if (_.isEmpty(al_exist)) {
      //console.log(event);
      var resp_req = {
        'workFlowId': this.selectedtask.workFlowId,
        'legoId': this.selectedModuleId,
        'employeeId': event.employeeId,
        'userId': this.employeeId,
        'option': 1
      };
      this.updateResponsibility(resp_req, 1);
    }
    else {
      event = al_exist;
    }
    return false;
  }
  updateResponsibility(req, option) { // 1 - add,2 remove,3 get
    this.WorkflowService.updateResponsibility(req).then((res: any) => {
      if (res.status == 1) {
        this.selectedtask.responsibilities = [];
        this.selectedtask.responsibility = ",";
        var updatedEmployeeRes: any;
        _.each(res.result, (r) => {
          this.selectedtask.responsibilities.push(r.employeeName);
          if (r.employeeId == req.employeeId && req.option == 1) {
            updatedEmployeeRes = r;
          }
          //  this.selectedtask.responsibility += r.employeeName + ",";
        });
        this.selectedtask.responsibilityCount = this.selectedtask.responsibilities.length;
        if (option == 1 && !_.isEmpty(updatedEmployeeRes)) {
          // this.selectedtask.responsibilities
          var data = res.result;

          var item = _.find(this.selectedResponsibities, (res) => {
            return (res.employeeId == updatedEmployeeRes.employeeId)
          });
          if (!_.isEmpty(item)) {
            item.userResponsibilityId = updatedEmployeeRes.userResponsibilityId;
          }
          var companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
          // var txtContent = "Hi " + updatedEmployeeRes.employeeName +", Workflow Task " + this.selectedtask.list_title + ">>" + this.selectedtask.steps +" have been assigned from " + companyinfo.company;
          // updatedEmployeeRes.permanentPhoneNo = (updatedEmployeeRes.permanentPhoneNo != null || updatedEmployeeRes.permanentPhoneNo != undefined ? updatedEmployeeRes.permanentPhoneNo.replace(/\D+/g, '') : 0);
          // companyinfo.TextNotices = (companyinfo.TextNotices != null || companyinfo.TextNotices != undefined ? companyinfo.TextNotices.replace(/\D+/g, '') : 0);
          // var moduleName = $(".breadscrumb_mainMod_title2").get()[0].innerText;
          // var req_notices = {
          //   // message : txtContent,
          //   reciever: updatedEmployeeRes.permanentPhoneNo,
          //   companyId: companyinfo.CompanyId,
          //   companyName: companyinfo.Company,
          //   employeeId: updatedEmployeeRes.employeeId,
          //   FirstName: "",
          //   LastName: "",
          //   sender: companyinfo.TextNotices,
          //   module: moduleName,
          //   task: this.selectedtask.list_title,
          //   card: this.selectedtask.steps,
          //   recieverEmail: updatedEmployeeRes.email,
          //   emailId: companyinfo.EmailNotices
          // };
          var req_notices = {
            ModuleId: this.selectedModuleId,
            CompanyId: companyinfo.CompanyId,
            EmployeeId: updatedEmployeeRes.employeeId,
            Task: this.selectedtask.list_title,
            Card: this.selectedtask.steps
          };
          this.NotificationService.sendNotification(req_notices).then((res: any) => {
            //console.log("result text", res.status);
          });
        }
        if (option == 2) {
          // this.selectedtask.responsibilities

          var data = res.result;
          var item = _.find(this.selectedResponsibities, (res) => {
            return (res.employeeId == data.employeeId)
          });
          if (!_.isEmpty(item)) {
            item.userResponsibilityId = data.userResponsibilityId;
          }
        }
        if (option == 3) {
          this.selectedResponsibities = res.result;
        }
        /*  // send chat notification to others responsibility - dont remove
        // if (option == 1) {
        //   var taskdata = {
        //     workFlowId: req.workFlowId,
        //     employeeId: req.employeeId,
        //   }
        //   this.DbGroupService.taskNotification(taskdata, true);
        // }
        // this.cd.detectChanges();
        // this.DbGroupService.taskResponsibilitesUpdated("responsibilityUpdated");
        */
      }
    });
  }
  updateTaskDocuments(req, option) {
    this.WorkflowService.TaskDocuments(req).then((res: any) => {
      var resultAr = [];
      if (res.status == 1) {
        resultAr = res.result;
      }
      this.selectedtask.docList = resultAr;
      this.selectedtask.documentsCount = this.selectedtask.docList.length;
      if (option == 5) {
        this.display_linkdocument = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Added ." });
      }
      if (option == 3) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Deleted Successfully ." });
      }
    });
  }
  removeDoc(doc) {
    var req = {
      taskId: this.selectedtask.workFlowId,
      docListId: doc.docListId,
      options: 3
    };
    this.updateTaskDocuments(req, 3);
  }
  showAddDoc() {
    this.Adddocument_display = true;
  }
  showAddLink() {
    this.display_linkdocument = true;
  }
  uploadDocumentEvent(event: any) {
    //console.log("upload event: ", event);
    if (event.status == 1) {
      if (event.result != null) {
        var req = {
          taskId: this.selectedtask.workFlowId,
          documentId: event.result.documentId,
          options: 2
        };
        this.updateTaskDocuments(req, 2);
      }
    }
    this.Adddocument_display = false;
  }
  hideAddDoc(event) {
    this.Adddocument_display = false;
  }
  showExcluedDocuments() {
    this.tempLinkDocument = [];
    this.selectedtempLinkDocument = [];
    var req = {
      taskId: this.selectedtask.workFlowId,
      companyId: this.companyId,
      options: 4
    };
    this.WorkflowService.TaskDocuments(req).then((res: any) => {
      var resultAr = [];
      if (res.status == 1) {
        this.display_linkdocument = true;
        this.tempLinkDocument = res.result;
      }
    });
  }
  AddDocLink() {
    if (this.selectedtempLinkDocument.length > 0) {
      var temp = _.map(_.cloneDeep(this.selectedtempLinkDocument), (d) => {
        return d.documentId;
      });
      var str = _.join(temp, '-').toString();
      //console.log(str);
      var req = {
        documentIds: str,
        taskId: this.selectedtask.workFlowId,
        options: 5
      };
      this.updateTaskDocuments(req, 5);
    }
  }
  checkRights() {
    this.checkrights = this.ModuleService.getModuleRights();
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.mode != 'E' || (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
        this.hasRights = true;
      }
      else if (this.checkrights.workflowRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
    }
    if (!_.isEmpty(this.checkrights)) {
      if (this.checkrights.modelRights != 'Unrestricted') {
        this.operationalRights = this.checkrights.modelRights;
      }
      else
        this.operationalRights = this.checkrights["workflowRights"];
    }
  }
  AddUpdateCheckRights(showMessage?) {
    var permission = false;
    this.messageService.clear();
    if ((this.operationalRights == 'Readonly' || this.operationalRights == 'Restricted' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
      if (showMessage == true) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
      }
      permission = false;
    }
    else if (this.operationalRights == "Unrestricted") {
      permission = true;
    }
    else permission = false;
    return permission;
  }
  downloadDocument(doc) {
    this.DocumentService.downloadFile(doc);
  }
  getResponsibilitiesCount(responsibilities) {
    return (responsibilities.length > 0) ? (responsibilities.length) : 0;
  }

  /**
   * get all workflow label details
   * @param  {any} req 
   * @return {void}@memberof TaskListComponent
   */
  GetLabelList(req) {
    this.WorkflowService.GetLabelList(req).then((res: any) => {
      if (res.status == 1) {
        if (!_.isEmpty(res.result)) {
          this.company_label = res.result.companyLabels;
          _.forEach(this.company_label, (c, index) => {
            if (c.createdBy == 0) {
              c.labelgroup = "Company Labels";
            }
            else {
              c.labelgroup = "Personal Labels";
            }
          })
          this.selectedItemsLabel = res.result.workFlowLabels;
          //var newemployeelabel = this.selectedItemsLabel;
          // var newcompanylabel = this.company_label
          // _.map(newcompanylabel, (o) => {
          //   o.neworder = 0;
          // });
          // _.map(newemployeelabel, (e) => {
          //   e.neworder = 1;
          // });




          if (!_.isEmpty(this.selectedItemsLabel)) {
            var newlabels = [];
            this.selectedlabel = _.filter(this.company_label, (o) => {
              var newdata = _.find(this.selectedItemsLabel, (n) => {
                // return o.labelId == n.labelId
                if (o.labelId == n.labelId) {
                  o.selected = true;
                  return o;
                }
                else {
                  o.selected = false;
                }

              });

              return newdata;
            });
            _.each(this.selectedlabel, (s) => {
              newlabels.push(s.labelId)
            })
            this.selectedlabel = newlabels;
            // console.log(newlabels);

          }
          else {
            this.selectedlabel = [];
          }

          // _.forEach(this.selectedlabel, (s)=>{
          //   if(s.createdBy == 0)
          //   {
          //     s.labelgroup = "Company Labels";
          //   }
          //   else{
          //     s.labelgroup = "Personal Labels";
          //   }
          // })
          // var newlabels = _.groupBy(this.selectedlabel, 'labelgroup');
          // // newlabels= _.groupBy(newlabels, 'neworder');
          // console.log(newlabels);


          this.selectedtask.label_list = res.result.workFlowLabels;
        }
      }
    });
  }

  changeMultiselectLabel(event) {
    var m = this.selectedlabel;
    var NewlyAdded = _.omitBy(event, (d) => {
      var exist = _.omitBy(this.selectedlabel, (d1) => {
        return (d1 != d)
      });
      return (!_.isEmpty(exist))
    });

    var Removed = _.omitBy(this.selectedlabel, (d) => {
      var exist = _.omitBy(event, (d1) => {
        return (d1 != d)
      });
      return (!_.isEmpty(exist))
    });
    Removed = _.values(Removed);
    NewlyAdded = _.values(NewlyAdded);
    if (!_.isEmpty(NewlyAdded)) {
      this.changeWorkFlowLabel(NewlyAdded[0]);
    }
    else {
      this.changeWorkFlowLabel(Removed[0]);
    }
    // console.log(NewlyAdded);
    // console.log(Removed);
  }

  /**
   * open new label dialog box
   * @return {void}@memberof TaskListComponent
   */
  // openlabeldialog() {
  //   if (this.AddUpdateCheckRights()) {
  //     this.labelTitle = "";
  //     this.newlabelColor = "#ddd"
  //     this.Addcompanylabel_display = true;
  //   }
  // }

  /**
   * change label color
   * @param  {any} event get current label color
   * @return {void}@memberof TaskListComponent
   */
  // onChangelabelColor(event) {
  //   if (this.AddUpdateCheckRights()) {
  //     this.newlabelColor = (event != "" && event != null && event != undefined ? event : "#ddd");
  //   }
  // }

  /**
   * save workflow label 
   * @return 
   * @memberof TaskListComponent
   */
  // saveWorkFlowLabel() {
  //   if (this.AddUpdateCheckRights()) {
  //     var isValid = true;
  //     if (this.labelTitle == "" || this.labelTitle == null || this.labelTitle == undefined) {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter valid title.' });
  //       isValid = false
  //       return false;
  //     }
  //     else if (this.newlabelColor == "" || this.newlabelColor == null || this.newlabelColor == undefined) {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter label color.' });
  //       isValid = false
  //     }
  //     // var color = _.filter(this.company_label, (c)=>{
  //     //         return (c.labelColor == this.newlabelColor)
  //     // });
  //     // if(color != null && color != undefined)
  //     // {
  //     //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Selected Color Already Exists.' });
  //     //   isValid = false
  //     // }
  //     if (isValid) {
  //       var req = {
  //         legoId: this.selectedModuleId,
  //         companyId: this.userinfo.CompanyId,
  //         employeeId: this.userinfo.EmployeeId,
  //         workFlowId: this.selectedtask.workFlowId,
  //         labelId: 0,
  //         labelTitle: this.labelTitle.trim(),
  //         labelColor: this.newlabelColor,
  //         options: 2
  //       };
  //       this.AddUpdateWorkFlowLabel(req);

  //     }
  //     else {
  //       return false;
  //     }
  //   }
  // }

  /**
   * add or remove label color
   * @param  {any} event get current or selected label color id
   * @return {void}@memberof TaskListComponent
   */
  changeWorkFlowLabel(event) {
    if (this.AddUpdateCheckRights()) {
      // console.log(event);
      //if (event.itemValue != null && event.itemValue != undefined) {
      if (event != null && event != undefined) {
        var req: any = {
          legoId: this.selectedModuleId,
          companyId: this.userinfo.CompanyId,
          employeeId: this.userinfo.EmployeeId,
          workFlowId: this.selectedtask.workFlowId,
          //labelId: event.itemValue.labelId,
          labelId: event,
          labelTitle: null,
          labelColor: null,
          options: 1
        }
        this.AddUpdateWorkFlowLabel(req);
      }
    }
  }

  /**
   * call the api service
   * @param  {any} req 
   * @return {void}@memberof TaskListComponent
   */
  AddUpdateWorkFlowLabel(req) {
    if (this.AddUpdateCheckRights()) {
      this.messageService.clear();
      this.WorkflowService.AddUpdateWorkFlowLabel(req).then((res: any) => {
        var msg = "", errormsg = "";
        switch (res.message) {
          case "1":
            msg = "Label added successfully";
            errormsg = "success";
            break;
          case "2":
            msg = "Label removed successfully";
            errormsg = "success";
            break;
          case "3":
            msg = "company label added successfully";
            errormsg = "success";
            break;
          case "4":
            msg = "Label name already exists";
            errormsg = "error";
            break;
          case "5":
            msg = "WorkFlow Label not found.";
            errormsg = "error";
            break;
          case "6":
            msg = "Something wents wrong!.";
            errormsg = "error";
            break;
          default:
            msg = "Something wents wrong!."
            errormsg = "error";
            break;
        }
        if (res.status == 1) {
          if (!_.isEmpty(res.result)) {
            this.company_label = res.result.companyLabels;
            this.selectedItemsLabel = res.result.workFlowLabels;
            _.forEach(this.company_label, (c) => {
              if (c.createdBy == 0) {
                c.labelgroup = "Company Labels";
              }
              else {
                c.labelgroup = "Personal Labels";
              }
            })
            if (!_.isEmpty(this.selectedItemsLabel)) {
              // this.selectedlabel = _.filter(this.company_label, (o) => {
              //   var newdata = _.find(this.selectedItemsLabel, (n) => {
              //     return o.labelId == n.labelId
              //   });
              //   return newdata;
              // });


              var newlabels = [];
              this.selectedlabel = _.filter(this.company_label, (o) => {
                var newdata = _.find(this.selectedItemsLabel, (n) => {
                  //return o.labelId == n.labelId
                  if (o.labelId == n.labelId) {
                    o.selected = true;
                    return o;
                  }
                  else {
                    o.selected = false;
                  }

                });
                return newdata;
              });
              _.each(this.selectedlabel, (s) => {
                newlabels.push(s.labelId)
              })
              this.selectedlabel = newlabels;
            }
            else {
              this.selectedlabel = [];
            }
            this.selectedtask.label_list = res.result.workFlowLabels;
          }
        }
        if (errormsg != "") {
          this.messageService.add({ severity: errormsg, summary: _.upperFirst(errormsg), detail: msg });
        }
        this.Addcompanylabel_display = (errormsg == "error" ? true : false);
      });
    }
  }

  navigatePreference() {
    var prefer = this.router.url + "&prefer=label";
    this.router.navigateByUrl(prefer);
  }
  hideScrollArrow() {
    // $("#floatingarrow_left").hide();
    // $("#floatingarrow_right").hide();
    // $("#floatingarrow_up").hide();
    // $("#floatingarrow_down").hide();
  }
  checkisMobileDevice() {
    var isMob = this.CommonUtilityService.isMobileDevice();
    return isMob;
  }
  getDummyheight(element: any) {
    var calcHeight = 0;
    var maxHeight = this.maxHeight($(".workflow_task"));
    if ($(element).height() != maxHeight) {
      var nearHeight = 0;
      var nearavail = $(element).parent().find(".workflow_task") || [];
      if (nearavail.length > 0) {
        var nel: any = $(element).parent().find(".workflow_task")[0];
        nearHeight = $(nel).height();
      }

      return (maxHeight - nearHeight - 20)
    }
    return calcHeight;
    // console.log(element);
  }
  maxHeight(elems) {
    return Math.max.apply(null, elems.map(function () {
      return $(this).height();
    }).get());
  }
  checkChildExist(calrlist) {
    if (calrlist.length > 1)
      return false;
    else if (calrlist.length == 1) {
      return (calrlist[0].workFlowId == 0) ? true : false;
    }
    return false;
  }
  reorderDummyNode(subtasks) {
    var orgIndex = _.findIndex(this.taskList, (d) => {
      return (d.wrk_id == subtasks.wrk_id)
    });
    if (orgIndex > -1) {
      var dummyIndex = _.findIndex(this.taskList[orgIndex].children, (c) => {
        return (c.workFlowId == 0)
      });
      if (dummyIndex > -1) {
        var dummyData = this.prepareDummyTask(this.taskList[orgIndex]);
        this.taskList[orgIndex].children.splice(dummyIndex, 1);
        this.taskList[orgIndex].children.push(_.cloneDeep(dummyData));
      }
    }
  }
  prepareDummyTask(workitem) {
    var newsubtask = _.cloneDeep(workflowSubTaskProto);
    newsubtask.steps = '';
    newsubtask.legoId = this.selectedModuleId;
    newsubtask.iseditable = false;
    newsubtask.isnew = false;
    newsubtask.parent_id = workitem.wrk_id;
    newsubtask.wrk_id = workitem.wrk_id;
    newsubtask.workFlowId = 0;
    return newsubtask;
  }
  //trackBy: trackByTasksFn;
  trackByTasksFn(index, item) {
    return item.wrk_id;
  }
  trackByCardFn(index, item) {
    return item.workFlowId;
  }
  trackByLabelFn(index, item) {
    return item.labelId;
  }
  trackBycheckListFn(index, item) {
    return item.task_chkid;
  }
  trackByResponsibilityFn(index, item) {
    return item.userResponsibilityId;
  }
  onHideTaskResource() {
    if (this.tempcheckListUpdated == true) {
      this.selectedtask.checkList = _.cloneDeep(this.tempcheckList);
      this.tempcheckListUpdated = false;
    }
    this.display_taskresources = false;
  }
  ngAfterContentInit() {

  }
  searchFocusItem() {
    setTimeout(() => {
      if (this.searchElementId != null && this.searchElementId != undefined && this.searchElementId != "") {
        let element = document.getElementById(this.searchElementId);
        if (!_.isEmpty(element)) {
          element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          this.searchElementId = "";
          this.isOverallSearch = false;
        }
      }
    }, 500);
  }
}
