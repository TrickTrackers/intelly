import { Component, OnInit, ViewChild, AfterViewChecked, AfterViewInit, ElementRef, ChangeDetectorRef,OnDestroy } from '@angular/core';
import { SortablejsOptions } from '../../../drag-drop/sortablejs-options';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { ContextMenu } from 'primeng/contextmenu';
import { ModuleService } from '../../../services/module.services';
import { ConfirmationService } from 'primeng/api';

import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { WorkflowService } from '../../../services/appservices/workflow.service';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { AppConstant } from '../../../app.constant';
import { boardListProto } from './workflow.proto';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { CommonAppService } from '../../../services/appservices/common-app.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subscription } from 'rxjs/Subscription';
import * as Handsontable from 'handsontable';
import { ExcelService } from '../../../services/appservices/excel.service';
/**
 * workflow component - containts takslist,board list,gantt chart option
 * @export
 * @class WorkflowComponent
 * @implements OnInit
 * @implements AfterViewChecked
 * @implements AfterViewInit
 */
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss', './ng2-select.css'],
  providers: [ConfirmationService]
})
export class WorkflowComponent implements OnInit, AfterViewChecked, AfterViewInit,OnDestroy {
  private _subscriptions = new Subscription();
  @ViewChild("gantt_here") ganttContainer: ElementRef;
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  @ViewChild(ContextMenu) public contextMenu: ContextMenu;
  ganttExternalChanges: any = {
    selectedboardId: 0,
    selectedTab: '',
    selectedFilterTask: ''
  };
  public heightRendered=false;
  checkrights: any = [];
  hasRights: boolean = false;
  operationalRights: string = "Readonly"; // avaiable rights: "Unrestricted" "Readonly"
  public disableBasicMenu = false;
  showTab: boolean = false;
  showTaskListTab: boolean = false;
  showTaskTab: boolean = true;
  showWorkflowTaskTab: boolean = false;
  setBoardName: string = "";
  showGanttchartTab: boolean = false;
  showTaskListexcelTab: boolean = false;
  ganttChart_display: boolean = false;
  spreadsheet_display: boolean = false;
  data: any[];
  clone_excel_task: any[];
  private colHeaders: string[];
  private columns: any[];
  private options_setting: any = {};
  index: number = 0;
  show_new_board: boolean = false;
  boardList: any = [];
  addtasklist_display: any;
  isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 || false;
  worflowtabs: any[] = [
    { title: 'Tasks', 'active': true, 'customClass': 'custom_tabs', 'removable': false, 'id': 'tab_task' },
    { title: 'Boards', 'active': false, 'customClass': 'custom_tabs', 'removable': false, 'id': 'tab_board' },
    { title: 'Gantt Chart', 'active': false, 'customClass': 'custom_tabs', 'removable': false, 'id': 'tab_gantt' }
  ];
  /**
   * 
   * @type SortablejsOptions  for drag and drop options
   * @memberof WorkflowComponent
   */
  SortableBoardoptions: SortablejsOptions = {
    group: {
      name: "board",
      // pull: "clone",
      put: true,
      revertClone: true
    },
    sort: true,
    forceFallback: this.isFirefox,
    animation: 100,
    AutoscrollSpeed: 15,
    scroll: true,
    scrollSensitivity: 100,
    scrollSpeed: 50,
    draggable: '.st_draggable',
    dragRootContainerId: '#drag_rootContainer',
    onEnd: (event) => {
      console.log('end drag:', event);
      this.moveBoard(event.newIndex, event.oldIndex);
      // var from = $(event.from).data("sectionvalue");
      // var to = $(event.to).data("sectionvalue");
      // var item = $(event.item).data("sectionvalue");
      // var ni = event.newIndex;
      // var oi = event.oldIndex;
    },
  };
  selectedModuleId: any;
  tab_name;
  model: any = {};
  tag: any = [{ value: "ABC", id: "1" },
  { value: "test", id: "2" },
  { value: "test1", id: "3" },
  { value: "test2", id: "4" },
  ];

  info;
  userinfo: any;
  preferenceSettings: any;
  board_title: string = '';
  companyId: any;
  employeeId: any;
  selectedBoard: any;
  selectedTab: any;
  tempselectedTab: any;
  selectedBoardId: number;
  selectedFilterTask: any;
  boarddelete_confirm = false;
  queryparams: any = { t: null };
  public isRefModule = false;
  top_taskmenu: any;
  top_taskmenufilter: any;
  selectedtop_taskmenu: any;
  isIE11:boolean=false;
  /**
   * Creates an instance of WorkflowComponent.
   * @param  {LocalStorageService} LocalStorageService 
   * @param  {NameService} nameService 
   * @param  {NgZone} zone 
   * @param  {ModuleService} ModuleService 
   * @param  {WorkflowService} WorkflowService 
   * @param  {CommonUtilityService} CommonUtilityService 
   * @param  {ConfirmationService} confirmationService 
   * @param  {CommonAppService} commonAppService 
   * @param  {Router} router 
   * @param  {ActivatedRoute} ActivatedRoute 
   * @param  {ChangeDetectorRef} cd 
   * @param  {MessageService} messageService 
   * @memberof WorkflowComponent
   */
  constructor(private LocalStorageService: LocalStorageService,
    private ModuleService: ModuleService, private WorkflowService: WorkflowService, private CommonUtilityService: CommonUtilityService,
    private confirmationService: ConfirmationService, private commonAppService: CommonAppService, private router: Router, private ActivatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef, private messageService: MessageService, private excelService: ExcelService) {
    this.isRefModule = this.ModuleService.checkIsRefmodule();
    this.isIE11 = this.CommonUtilityService.isIE11Browser();
    // this.loadBoardList();

    this.initialize();
    this.subscribeOninit();
  }
  /**
   * 
   * @return {void}@memberof WorkflowComponent
   */
  /**
   * initialize the co
   * @return {void}@memberof WorkflowComponent
   */
  initialize() {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    if (this.userinfo != undefined && this.userinfo != null) {
      this.companyId = parseInt(this.userinfo.CompanyId);
      this.employeeId = parseInt(this.userinfo.EmployeeId);
    }


  }
  /**
   * load the board list based on the selected module
   * @return {void}@memberof WorkflowComponent
   */
  loadBoardList() {
    var req = {
      options: 4,
      legoId: this.selectedModuleId,

    };
    this.getBoardData(req, 4);
  }
  /**
   * subscribe module change updates and router changes
   * @return {void}@memberof WorkflowComponent
   */
  subscribeOninit() {
    this._subscriptions.add(
      this.router.routerState.root.queryParams.subscribe((params: Params) => {
        this.showTab = false;
        this.showTaskTab = false;
        this.showWorkflowTaskTab = false;
        this.showGanttchartTab = false;
        this.showTaskListexcelTab = false;
        this.queryparams.t = params['t'];
        this.queryparams.mode = params['mode'];
        this.queryparams.lLvl = params['lLvl'];
        this.commonAppService.checkPinmodule();
        // var req = {
        //   options: 4,
        //   legoId: this.selectedModuleId,

        // };
        // this.getBoardData(req, 4);
        this.navigateTabs(this.queryparams.t);
      }));
    this._subscriptions.add(
      this.ModuleService.getModuleUpdates().subscribe(updates => {
        this.showTaskTab = false;
        this.showTab = false;
        this.showWorkflowTaskTab = false;
        this.showGanttchartTab = false;
        this.showTaskListexcelTab = false;
        this.initialize();

        setTimeout(() => {
          this.navigateTabs(this.queryparams.t);
          // this.router.navigate(['/submodule'], { queryParams: newparams });
        }, 1000);
      }));
    this._subscriptions.add(
      this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
        this.showTaskTab = false;
        this.showTab = false;
        this.showWorkflowTaskTab = false;
        this.showGanttchartTab = false;
        this.showTaskListexcelTab = false;
        this.initialize();

        setTimeout(() => {
          this.navigateTabs(this.queryparams.t);
          setTimeout(() => {
            if (this.cd !== null &&
              this.cd !== undefined &&
              !(this.cd["ChangeDetectorRef"])) {
              // - this.cd.detectChanges();
            }
          }, 250);
          //  this.navigateTabs(this.queryparams.t);
          // this.router.navigate(['/submodule'], { queryParams: newparams });
        }, 1000);
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
   * disable drag board by removing sortable draggable class
   * @param  {any} event 
   * @return {void}@memberof WorkflowComponent
   */
  disableDrag(event) {
    $(event.target).parents('.board_card').addClass('disable_drag');
    //console.log("event drag");
  }
  /**
   * get board data based on the navigation
   * @param  {any} req 
   * @param  {any} options 
   * @return {void}@memberof WorkflowComponent
   */
  getBoardData(req, options) {
    req.employeeId = this.employeeId;
    this.WorkflowService.getBoardList(req).then((res: any) => {
      if (res) {
        this.boardList = [];
        if (res.status == 1) {
          if (!_.isEmpty(res.result)) {
            this.boardList = res.result;
          }
          this.board_title = '';
          this.show_new_board = false;
          this.formatBoardData();
        }
      }
    });
  }
  /**
   * get board details
   * @param  {any} req request params
   * @param  {any} options option  add - 1,update - 2,remove -4
   * @return {void}@memberof WorkflowComponent
   */
  BoardDetails(req, options) {
    req.employeeId = this.employeeId;
    this.WorkflowService.updateBoard(req).then((res: any) => {
      if (res) {
        if (!_.isEmpty(res)) {
          var msgseverity = "";
          var msgsummary = "";
          var msgdetail = "";
          switch (res.message) {
            case '1':
              msgseverity = "success";
              msgsummary = "Success";
              msgdetail = "Board saved successfully.";
              break;
            case '2':
              msgseverity = "success";
              msgsummary = "Success";
              msgdetail = "Board name updated successfully.";
              break;
            case '3':
              msgseverity = "error";
              msgsummary = "Error";
              msgdetail = "Board name is already exists.";
              break;
            case '4':
              msgseverity = "success";
              msgsummary = "Success";
              msgdetail = "Board deleted successfully.";
              break;

            case '5':
              msgseverity = "success";
              msgsummary = "Success";
              msgdetail = "Board position updated successfully.";
              break;
            default:
              msgseverity = "error";
              msgsummary = "Error";
              msgdetail = "Something want wrong. Please try again.";
              break;
          }
          if (res.status == 1) {
            this.loadBoardList();
            // if (!_.isEmpty(res.result)) {
            //   this.boardList = res.result;
            // }
          }
          this.messageService.clear();
          this.messageService.add({ severity: msgseverity, summary: msgsummary, detail: msgdetail });
          this.board_title = '';
          this.show_new_board = false;
          this.formatBoardData();
        }
        else {
          this.messageService.clear();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Something want wrong. Please try again." });
          return false;
        }
      }
    });
  }
  /**
   * format board - iseditable and isnew board
   * @return {void}@memberof WorkflowComponent
   */
  formatBoardData() {
    this.boardList = _.map(this.boardList, (board) => {
      board.isnew = false;
      board.iseditable = false;
      return board;
    });
  }
  /**
   * drag and drop board based on index
   * @param  {any} newindex - newindex of boards
   * @param  {any} oldindex - old index of boards 
   * @return {void}@memberof WorkflowComponent
   */
  moveBoard(newindex, oldindex) {
    console.log("new move index: ", newindex);
    this.selectedBoard = this.boardList[newindex];
    var req = {
      options: 5,
      legoId: this.selectedModuleId,
      position: newindex + 1,
      b_id: this.selectedBoard.b_id

    };
    this.BoardDetails(req, 4);
  }
  /**
   * add board - if board with flag isnew
   * @return 
   * @memberof WorkflowComponent
   */
  addBoard() {
    this.messageService.clear();
    if (this.checkrights.workflowRights == 'Readonly' && !this.isRefModule) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
      return false;
    }
    if (this.isRefModule) {
      return false;
    }
    var item = _.clone(boardListProto);
    this.boardList.push(item);
    this.setElementAutoHeight(null);
    item.b_id = this.CommonUtilityService.IDGenerator(5, 'n');
    item.isnew = true;
    item.iseditable = true;
    item.employeeId = this.employeeId;
    item.legoId = this.selectedModuleId;
    setTimeout(() => {
      if ($("#renameboardlist_" + item.b_id).length > 0) {
        $("#renameboardlist_" + item.b_id).focus();
      }
    }, 100)
  }
  /**
   * rename board
   * @param  {any} board  board request details
   * @return 
   * @memberof WorkflowComponent
   */
  renameBoard(board) {
    this.messageService.clear();
    if (this.checkrights.workflowRights == 'Readonly' && !this.isRefModule) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
      return false;
    }
    if (this.isRefModule) {
      return false;
    }
    board.iseditable = true;
    board.isnew = false;
    setTimeout(() => {
      if ($("#renameboardlist_" + board.b_id).length > 0) {
        $("#renameboardlist_" + board.b_id).focus();
      }
    }, 100)
  }
  /**
   * delete board 
   * @param  {any} board board details like board id etc
   * @return 
   * @memberof WorkflowComponent
   */
  deleteBoard(board) {
    this.messageService.clear();
    if (this.checkrights.workflowRights == 'Readonly' && !this.isRefModule) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
      return false;
    }
    if (this.isRefModule) {
      return false;
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var req = {
          'companyId': this.companyId,
          'employeeid': this.employeeId,
          'legoid': this.selectedModuleId,
          'board_title': board.board_title,
          'b_id': board.b_id,
          options: 3,
        };
        this.BoardDetails(req, 3);
      }
    });
    //  this.boarddelete_confirm=true;

  }
  /**
   * update board
   * @param  {any} item selected board
   * @param  {any} [event] selected board with drag event
   * @return 
   * @memberof WorkflowComponent
   */
  updateBoard(item, event?) {
    var options;
    if (item.isnew) {
      options = 1;
    }
    else {
      options = 2;
    }
    item.employeeId = this.employeeId;
    item.legoId = this.selectedModuleId;
    if (item.board_title == "") {
      if (item.isnew) {
        var index = _.findIndex(this.boardList, (board) => {
          return (board.b_id == item.b_id)
        });
        this.boardList.splice(index, 1)
      }
      return false;
    }
    else {
      item.options = options;
      this.BoardDetails(item, options);
    }
    if (event != undefined && event != null) {
      $(event.target).parents('.board_card').removeClass('disable_drag');
    }
  }
  /**
   * update tab navigation while workflow tab change
   * @param  {any} tab navigation tab property
   * @return {void}@memberof WorkflowComponent
   */
  updateTabNavigation(tab) {
    let params = _.cloneDeep(this.ActivatedRoute.snapshot.queryParams);
    let urlTree = this.router.parseUrl(this.router.url);
    if (_.trim(tab) != _.trim(params.t) || (tab == 'boards' && this.showWorkflowTaskTab == true) || (tab == 'boards' && this.showWorkflowTaskTab == true)) {
      params.t = tab;
      _.merge(urlTree.queryParams, params);
      this.router.navigateByUrl(urlTree);
      this.showTab = false;
      this.showTaskTab = false;
      this.showWorkflowTaskTab = false;
      this.showGanttchartTab = false;
      this.showTaskListexcelTab = false;
      this.showTaskListTab = false;
      this.showTaskTab = false;
      if (tab == 'boards') {
        this.loadBoardList();
        this.navigateTabs(this.queryparams.t);
      }

    }

  }
  /**
   * remove tab active class by all
   * @return {void}@memberof WorkflowComponent
   */
  removeTabselected() {
    $("#workflow_task_tab").removeClass("active");
    $("#workflow_task_tab" + " a").removeClass("active");
    $("#workflow_board_tab").removeClass("active");
    $("#workflow_board_tab" + " a").removeClass("active");
    $("#workflow_boardtask_tab").removeClass("active");
    $("#workflow_boardtask_tab" + " a").removeClass("active");
    $("#workflow_ganttchart_tab").removeClass("active");
    $("#workflow_ganttchart_tab" + " a").removeClass("active");
  }
  /**
   * navigate tab to selected for tasks,board and gantt chart.
   * @param  {any} tab tab properties
   * @param  {any} [gantt_here] optional whether its to gantt tab
   * @return {void}@memberof WorkflowComponent
   */
  navigateTabs(tab, gantt_here?) {
    this.removeTabselected();
    this.ganttExternalChanges.selectedTab = tab;
    switch (tab) {
      case 'tasks':
        this.showTab = false;
        this.showTaskTab = false;
        this.showWorkflowTaskTab = false;
        this.showGanttchartTab = false;
        this.showTaskListexcelTab = false;
        this.showTaskListTab = true;
        this.showTaskTab = true;
        $("#workflow_task_tab").addClass("active");
        this.setElementAutoHeight(null);
        break;
      case 'boards':
        this.showTaskTab = false;
        this.showWorkflowTaskTab = false;
        this.showTaskListTab = false;
        this.showGanttchartTab = false;
        this.showTaskListexcelTab = false;
        this.showTab = true;
        this.loadBoardList();
        $("#workflow_board_tab").addClass("active");
        break;
      default:
        break;
    }
  }
  /**
   * show gantt chart popup and select gantt chart tab
   * @return 
   * @memberof WorkflowComponent
   */
  showGanttChart() {
    if (this.hasRights == true) {


      this.selectedTab = "";
      this.selectedTab = this.tempselectedTab;
      this.selectedFilterTask = this.selectedFilterTask;
      this.spreadsheet_display = false;
      this.ganttChart_display = true;

      this.showGanttchartTab = true;
      $("#workflow_task_tab").removeClass("active");
      $("#workflow_task_tab" + " a").removeClass("active");
      $("#workflow_board_tab").removeClass("active");
      $("#workflow_board_tab" + " a").removeClass("active");
      $("#workflow_boardtask_tab").removeClass("active");
      $("#workflow_boardtask_tab" + " a").removeClass("active");
      $("#workflow_ganttchart_tab").addClass("active");
    }
    else return false;
  }

  loadSpreadsheet(filter?) {
    var selectedTab = this.queryparams.t;
    var selectedFilter = ((filter != undefined && filter != null) ? filter : this.selectedFilterTask);
    var selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var xlsReq = {
      LegoId: selectedModuleId,
      BoardId: (this.selectedBoardId != undefined && this.selectedBoardId != null ? this.selectedBoardId : 0),
      EmployeeId: this.userinfo.EmployeeId,
      Options: 1,
    };
    var filtermenu = this.top_taskmenu;
    this.top_taskmenufilter = filtermenu;
    this.selectedtop_taskmenu = _.filter(this.top_taskmenufilter, (d) => {
      return (d.label == selectedFilter);
    });
    this.selectedtop_taskmenu = this.selectedtop_taskmenu[0];
    if (selectedTab == "tasks") {
      // if(this.showTaskTab == true){
      if (selectedFilter != undefined && selectedFilter != null && selectedFilter != "") {
        switch (selectedFilter) {
          case 'All Tasks':
            xlsReq.Options = 1;
            break;
          case 'Pending':
            xlsReq.Options = 2;
            break;
          case 'Completed':
            xlsReq.Options = 3;
            break;
          case 'Archived':
            xlsReq.Options = 4;
            break;
          case 'My Tasks':
            xlsReq.Options = 5;
            break;
          default:
            break;
        }
      }
    }
    else if (selectedTab == "boards") {
      this.top_taskmenufilter = _.filter(filtermenu, (d) => {
        return (d.label != 'My Tasks');
      });
      selectedFilter = (selectedFilter == undefined ? "All Tasks" : selectedFilter);
      if (selectedFilter != undefined && selectedFilter != null && selectedFilter != "") {
        selectedFilter = (selectedFilter == 'My Tasks' ? 'All Tasks' : selectedFilter);
        switch (selectedFilter) {
          case 'All Tasks':
            xlsReq.Options = 6;
            break;
          case 'Pending':
            xlsReq.Options = 7;
            break;
          case 'Completed':
            xlsReq.Options = 8;
            break;
          case 'Archived':
            xlsReq.Options = 9;
            break;
          case 'My Tasks':
            xlsReq.Options = 6;
            break;
          default:
            break;
        }
      }
    }
    this.showTaskList(xlsReq)
  }

  showTaskList(req) {
    if (this.hasRights == true) {
      this.selectedTab = "";
      this.selectedTab = this.tempselectedTab;
      this.selectedFilterTask = this.selectedFilterTask;
      this.ganttChart_display = false;
      this.spreadsheet_display = true;

      // this.showGanttchartTab = true;
      this.showTaskListexcelTab = true;
      $("#workflow_task_tab").removeClass("active");
      $("#workflow_task_tab" + " a").removeClass("active");
      $("#workflow_board_tab").removeClass("active");
      $("#workflow_board_tab" + " a").removeClass("active");
      $("#workflow_boardtask_tab").removeClass("active");
      $("#workflow_boardtask_tab" + " a").removeClass("active");
      $("#workflow_ganttchart_tab" + " a").removeClass("active");
      $("#workflow_tasklist_tab").addClass("active");
      // var filtermenu = this.top_taskmenu;
      // this.top_taskmenufilter = filtermenu;
      // var selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
      // var req = {
      //   LegoId: selectedModuleId,
      //   BoardId: this.selectedBoardId,
      //   Options: 1
      // };
      // if (this.showWorkflowTaskTab == true) {
      //   // req.Options = 2;
      //   this.top_taskmenufilter = _.filter(filtermenu, (d) => {
      //     return (d.label != 'My Tasks');
      //   });
      // }
      this.WorkflowService.GetSpreadSheet(req)
        .then(res => {
          if (res) {
            if (!_.isEmpty(res)) {
              if (res.status == 1) {
                var data = res.result;
                // var taskname = _.forEach(data, (t)=>{
                //   if(t.priority == "")
                //   {
                //     t.taskName = t.name;
                //     t.name = "";
                //   }
                //   else{
                //     t.taskName = "";
                //   }
                //   return t;
                // })
                this.clone_excel_task = _.cloneDeep(data);
                // this.selectedtop_taskmenu = _.filter(this.top_taskmenufilter, (d) => {
                //   return (d.label == this.selectedFilterTask);
                // });
                // this.selectedtop_taskmenu = this.selectedtop_taskmenu[0];
                console.log(this.selectedFilterTask);
                this.bindSpreadSheet(this.clone_excel_task);
                // this.Filter_tasklist(this.selectedFilterTask)
                // this.bindSpreadSheet(data);
              }
              else {
                this.data = [];
              }

            }
            else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
              return false;
            }
          }
        }, error => {
        })

    }
    else return false;
  }

  closeTaskList_excel() {
    if (this.showTaskTab === true) {
      $("#workflow_task_tab").addClass("active");
    }
    else if (this.showTab === true) {
      $("#workflow_board_tab").addClass("active");
    }
    else if (this.showWorkflowTaskTab === true) {
      $("#workflow_boardtask_tab").addClass("active");
    }
    else if (this.showGanttchartTab === true) {
      $("#workflow_ganttchart_tab").addClass("active");
    }
    $("#workflow_tasklist_tab").removeClass("active");
    $("#workflow_tasklist_tab" + " a").removeClass("active");
  }

  /**
   * hide gantt chart popup and unselect gantt tab
   * @return {void}@memberof WorkflowComponent
   */
  closeGantChart() {
    if (this.showTaskTab === true) {
      $("#workflow_task_tab").addClass("active");
    }
    else if (this.showTab === true) {
      $("#workflow_board_tab").addClass("active");
    }
    else if (this.showWorkflowTaskTab === true) {
      $("#workflow_boardtask_tab").addClass("active");
    }
    $("#workflow_ganttchart_tab").removeClass("active");
    $("#workflow_ganttchart_tab" + " a").removeClass("active");
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.cd.detach();
    $("#workflow-pg").html("").remove();
    $("app-workflow").remove();
  }
  /**
   * context menu items
   * @return {void}@memberof WorkflowComponent
   */
  ngOnInit() {
    //this.info = this.nameService.info;
    //this.tab_name = this.info.name;
    //let tab_name ;//= JSON.stringify(this.info)
    //this.nameService.getMessage().subscribe(message => { this.tab_name = this.tab_name ; });
    // this.zone.run(() => {
    //   this.tab_name = JSON.parse(localStorage.getItem('tab_value'));
    //         //alert(this.tab_name)
    //         if(this.tab_name == 'tasks'){
    //           this.showTab = false;
    //           this.showTaskTab = true;
    //         }
    //         else{
    //           this.showTab = true;
    //           this.showTaskTab = false;

    //         }
    //   console.log('I am running inside a zone');
    // });

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
    this.selectedtop_taskmenu = this.top_taskmenu[0];
  }
  /**
   * while select tab,active the tab selection
   * @param  {any} tabz tab compo
   * @param  {any} index tab index
   * @return {void}@memberof WorkflowComponent
   */
  onSelectTab(tabz, index) {
    tabz.active = true
    console.log(event);
  }
  /**
   * deselect tab
   * @param  {any} tabz tab component
   * @param  {any} index tab index
   * @return {void}@memberof WorkflowComponent
   */
  deselectTab(tabz, index) {
    tabz.active = true
    console.log(event);
  }
  /**
   * show board dialog
   * @return {void}@memberof WorkflowComponent
   */
  showDialog_boards() {
    this.show_new_board = true;
  }

  /**
   * edit board,show input text box
   * @param  {any} event 
   * @return {void}@memberof WorkflowComponent
   */
  board_edit(event) {

    this.show_new_board = true;
  }
  /**
   * show board delete confirmation box
   * @param  {any} event 
   * @return {void}@memberof WorkflowComponent
   */
  board_delete(event) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete?',
      accept: () => {
        //Actual logic to perform a confirmation
      }
    });
  }

  /**
   * set selected board,board task will be based on this
   * @param  {any} board board details
   * @param  {any} tab selected tab details
   * @param  {any} event board selection event of prime compo events
   * @return {void}@memberof WorkflowComponent
   */
  setBoard(board, tab, event) {
    if (!$(event.target).hasClass('edit_board') && !$(event.target).hasClass('delete_board') && !$(event.target).hasClass('ui-inputtext')) {
      this.showTab = false;
      this.showTaskTab = false;
      this.showTaskListTab = false;
      this.showWorkflowTaskTab = true;
      this.setBoardName = board.board_title;
      this.selectedBoard = board;
      this.selectedBoardId = board.b_id;
      this.ganttExternalChanges.selectedboardId = this.selectedBoardId;
    }
  }
  /**
   * tab change event of primeng tab component,selected tab index
   * @param  {any} event 
   * @return {void}@memberof WorkflowComponent
   */
  onTabChange(event) {

    if (event.index === 1) {
      this.showTab = true;
    }
    else {
      this.showTab = false;
    }
  }
  /**
   * set auto heights of the panel on after component view checked
   * @param  {*} event load event
   * @return {void}@memberof WorkflowComponent
   */
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + 2
    );

    //  sub tabs class: sub_tab_container
    var h = res_h - ($("#workflow-pg .nav-tabs").innerHeight() + 25);
    if ($("body").hasClass("pinmodule")) {
      h += 110;
    }
    // $("#taskcomp-pg .custom_scrollpane").css("height", h + "px");
    if (!isNaN(h)) {
      // $("#workflow-pg .tab-content").each(function( index ) {
      //   $( this ).css("height", h + "px");
      // });
      $("#workflow-pg .board_scrollbar").css("height", (h - 5) + "px");
      $("#restricted_display").css("height", (h - 5) + "px");
    }
  }
  /**
   * active tab selection based on the preference settings or param values,used in screen refresh
   * @return {void}@memberof WorkflowComponent
   */
  ngAfterViewInit() {
    // if(this.isIE11){
     // this.setElementAutoHeight(null);
    // }
    // 
    // this.activateModuleTabs();
    this.ModuleService.activateModuleTabs(this.queryparams);
  }
  triggerboardAutoHeight(last){
    // if(this.heightRendered == false && last == true){
    //   this.heightRendered = true;
    //   this.setElementAutoHeight(null)
    // }
  }
  /**
   * 
   * @return {void}@memberof WorkflowComponent
   */
  ngAfterViewChecked() {
    // if(! this.isIE11){
     this.setElementAutoHeight(null);
    // }
  }
  /**
   * set task filter options
   * @param  {any} event 
   * @return {void}@memberof WorkflowComponent
   */
  onFilterTasks(event) {
    this.selectedFilterTask = event;
    this.ganttExternalChanges.selectedFilterTask = event;
  }
  /**
   * check workflow rights for this selected module
   * @return {void}@memberof WorkflowComponent
   */
  checkRights() {
    this.checkrights = this.ModuleService.getModuleRights();
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.mode == 'E') {
        this.hasRights = true;
      }
      else if (this.queryparams.mode != 'E' && this.checkrights.workflowRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
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
  /**
   * check rights - Readonly,Restricted and UnRestricted
   * @param  {any} [showMessage] option value whether shows the alter message or not.
   * @return 
   * @memberof WorkflowComponent
   */
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
  bindSpreadSheet(sheetdata: any) {
    var speardSheetHeight = ($(".fullWidthpopup").innerHeight() - 110)
    this.options_setting = {
      height: (speardSheetHeight != NaN && speardSheetHeight != 0 ? speardSheetHeight : 450),
      rowHeaders: true,
      stretchH: 'all',
      // columnSorting: true,
      contextMenu: true,
      // colHeaders: true,
      // contextMenu: [
      //   'row_above', 'row_below', 'remove_row'
      // ],
      className: 'htLeft htMiddle',
      // readOnly: true

    };
    //'Parent',
    this.colHeaders = ['Task Name', 'Card Name', 'Start Date', 'End Date', 'Responsible', 'Priority', '% Complete', 'Labels', 'Board Name', 'Status'];
    this.data = sheetdata;
    var isParent = false;
    this.columns = [
      // {data: 'id', type: 'numeric', renderer:
      // function textRenderer(instance, td, row, col, prop, value, cellProperties,th) {
      //   Handsontable.renderers.TextRenderer.apply(this, arguments);

      //   if (value == 0 ) {
      //     // col[1].cellProperties.className = 'htLeft';
      //     // cellProperties.className = 'htLeft';

      //   }
      //   else {
      //     // col[1].cellProperties.className = 'htLeft';
      //   }
      //   td.style.display = 'none';
      //   th.style.display = 'none';
      // }},
      //  {
      //   data: 'parent', type: 'numeric', renderer:
      //     function textRenderer(instance, td, row, col, prop, value, cellProperties) {
      //       Handsontable.renderers.TextRenderer.apply(this, arguments);
      //       if (value == 0) {
      //         isParent = true;
      //       }
      //       else {
      //         isParent = false;
      //       }
      //     }
      // },
      { data: 'taskName', type: 'text' },
      {
        data: 'name', type: 'text', renderer:
          function textRenderer(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
            // if (isParent == true) {
            //   cellProperties.className = 'alnleft htLeft htMiddle';
            //   td.style.color = 'blue';
            //   td.style.fontWeight = 'bold';
            //   // td.style.className = 'alnleft';
            // }
            // else {
            //   cellProperties.className = 'htRight htMiddle'
            // }
          }
      },

      { data: 'startDate', type: 'date', dateFormat: 'MM/DD/YYYY' },
      { data: 'endDate', type: 'date', dateFormat: 'MM/DD/YYYY' },
      { data: 'responsible', type: 'text' },
      { data: 'priority', type: 'text' },
      {
        data: 'complete', type: 'numeric'
        // , numericFormat: { pattern: '0.00%' }, renderer:
        //   function percentRenderer(instance, td, row, col, prop, value, cellProperties) {
        //     Handsontable.renderers.NumericRenderer.apply(this, arguments);
        //     // td.style.color = (value < 0) ? 'red' : 'green';
        //   }
      },
      { data: 'labels', type: 'text' },
      // {data: 'Labels', type: 'numeric', numericFormat: { pattern: '0,0.00[0000]' }},
      // {data: 6, type: 'numeric', numericFormat: { pattern: '0,0.00[0000]' }}
      { data: 'boardName', type: 'text' },
      { data: 'status', type: 'text' },
    ];

    // var container = document.getElementById('example1');
    // var hot1 = new Handsontable(container, {
    //   data: this.data,
    //   colWidths: 100,
    //   rowHeaders: true,
    //   colHeaders: true,
    //   contextMenu: true,
    //   // mergeCells: [
    //   //   {row: 1, col: 1, rowspan: 3, colspan: 3},
    //   //   {row: 3, col: 4, rowspan: 2, colspan: 2}
    //   // ],
    //   className: "htCenter",
    //   cell: [
    //     {row: 0, col: 0, className: "htRight"},
    //     {row: 1, col: 1, className: "htLeft htMiddle"},
    //     {row: 3, col: 4, className: "htLeft htBottom"}
    //   ],
    //   afterSetCellMeta: function (row, col, key, val) {
    //     console.log("cell meta changed", row, col, key, val);
    //   }
    // });

  }


  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.data, 'sample');
    this.excelService.exportAsExcelFile(this.data, 'TaskListReport');
  }

  Filter_tasklist(event) {
    var value = event;
    this.loadSpreadsheet(value);
    // if (value == 'All Tasks') {
    //   // _.forEach(this.clone_excel_task, (c)=>{
    //   //   if(c.status != '')
    //   //   {
    //   //     c.name = "  "+ ""+"" + c.name; 
    //   //   }

    //   // })
    //   this.bindSpreadSheet(this.clone_excel_task);
    // }
    // else {
    //   var filter = _.filter(this.clone_excel_task, (d) => {
    //     return (d.status == event)
    //   });
    //   this.bindSpreadSheet(filter);
    // }
  }
  trackByBoardListFn(index,item){
    return item.b_id;
  }
}

