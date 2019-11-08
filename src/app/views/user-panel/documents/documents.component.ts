import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { component_config } from '../../../_config';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { MasterService } from '../../../services/master.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { Router, Params } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { DocumentService } from '../../../services/appservices/userpanelservices/document.service';
import { ModuleService } from '../../../services/module.services';
import { ListModuleModel } from '../../../views/user-panel/sub-module/list.moduleModel';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { ContextMenu } from 'primeng/contextmenu';
import { ConfirmationService } from 'primeng/api';
import value from '*.json';
import * as moment from 'moment';
import 'rxjs/Rx';
import { Table } from 'primeng/table';
import { CommonAppService } from '../../../services/appservices/common-app.service';

import { DataTable } from 'primeng/components/datatable/datatable';
/**
 * Document Page
 * @export
 * @class DocumentsComponent
 * @implements OnInit
 * @implements AfterViewInit
 * @implements AfterViewChecked
 * @implements OnDestroy
 */
@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})

export class DocumentsComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  /**
   * Tabs Component
   * @type TabsetComponent
   * @memberof DocumentsComponent
   */
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  /**
   * Initialize Context menu for add, rename delete folders 
   * @type ContextMenu
   * @memberof DocumentsComponent
   */
  @ViewChild(ContextMenu) public contextMenu: ContextMenu;
  @ViewChild('file') myInput: ElementRef;
  @ViewChild('foldername') inputfocus: ElementRef;
  //@ViewChild('dt') private table: Table;
  @ViewChild(DataTable) dataTableComponent: DataTable;
  @ViewChild(Table) pTableComponent: Table;

  documentList_table: string = "300px";
  confirm: boolean = false;
  value: string = "Company";
  treeItemNode: any = {};
  selectednode: any;
  display: boolean = false;
  edit_document_popup: boolean = false;
  //selectedTreeItem: any;
  display_linkdocument = false;
  display_access_popup = false;
  show_user_popup = false;
  selectedModuleIds: any;
  config;
  document_access: {};
  subscription: Subscription;
  doc_filter_txt = "";
  lnkdoc_filter_txt = "";
  /**
   * Declared for subscribe and unsubcribe
   * @private
   * @memberof DocumentsComponent
   */
  private _subscriptions = new Subscription();
  public queryparams: any = [];
  public querystring;
  userinfo: any = [];
  companyinfo: any = [];
  //formData = new FormData();
  addDocument: any = {};
  edit_document: any = {};
  documentlist: any = [];
  link_documentlist: any = [];
  temp_documentlist: any = [];
  clone_temp_documentlist: any = [];
  clone_temp_documentlist1: any = [];
  clone_temp_lnkdocumentlist: any = [];
  clone_temp_moduledocs: any = [];
  employeelist: any = [];
  temp_employeelist: any = [];
  temp_nonparticipatedUsers = [];
  tempselectedparticipated = [];
  versiondropdown: any = [];
  /**
   * Tree Structure for Module levels
   * @type ListModuleModel[]
   * @memberof DocumentsComponent
   */
  public ModuleTreeItems: ListModuleModel[] = [];
  /**
   * Initialize selected module 
   * @type ListModuleModel
   * @memberof DocumentsComponent
   */
  public selectedFile: ListModuleModel;
  addfolder_dialog: boolean = false;
  editfolder_dialog: boolean = false;
  foldername: any;
  folderDetails: any = [];
  parentDetails: any = [];
  currentLegoLevel: number = 0;
  currentParent;
  treeview_module: boolean = false;
  /**
   * initialized for treeitems in popup
   * @type *
   * @memberof DocumentsComponent
   */
  public ModuleTreeItems_popup: any = [];
  selectednodeModule: any = [];
  selectedLinkModuleItems: any = [];
  clone_selectedLinkModuleItems: any = [];
  readonly: any;
  unrestricted: any;
  restricted: any;
  temp_doc: any = [];
  upresult: any = [];
  moduledoclist: any = [];
  selectedModuleId: any;
  selectedModelId: any;
  /**
   * Assign Date format
   * @memberof DocumentsComponent
   */
  //public dotnetDateFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  public dateformat: any = [];

  /**
   * Date format and hide weeknumbers in calendar 
   * @memberof DocumentsComponent
   */
  public bsConfig = {
    dateInputFormat: AppConstant.API_CONFIG.DATE.apiFormat,
    showWeekNumbers: false
  };
  checkrights: any = [];
  hasRights: boolean = true;
  hasReadOnly: boolean = false;
  treeSubmoduleDocument: any = [];
  treeSubmoduleDocument_temp: any = [];
  contextMenuFile = [
    {
      label: "Delete file", icon: "fa-delete",
      command: (event) => {
      }
    }
  ];

  /**
   * Initialize Context menu for folder
   * @memberof DocumentsComponent
   */
  contextMenuFolder = [
    {
      label: "Delete folder", icon: "fa-delete",
      command: (event) => {
      }
    }
  ];

  @ViewChild("cmFile") cmFile: ContextMenu;
  @ViewChild("cmFolder") cmFolder: ContextMenu;

  /**
   * Right click Menu Action (Add folder, Rename folder, Delete Folder)
   * @memberof DocumentsComponent
   */
  sidebarRightMenuActions = [

    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-folder-open"></i>
        </span>
        <span class="context-title">Add Folder</span>`;
      },
      click: (event) => {
        if (event.item[1] != null) {
          this.parentDetails = event.item[1];
          this.folderDetails = _.clone(event.item[1]);
          this.folderDetails.legoName = "";
          this.addfolder_dialog = true;
          $(function () {
            $("#addfolder1").focus();
          });
        }
        else {
          console.log("click event", event.item[1])
        }

      },
      enabled: () => {
        return true;
      },
      visible: (event) => {
        return true;
        //  return (this.selectedFile.type == "D");
      },
      divider: () => {
        return false;
      }
    },

    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-folder-open"></i>
        </span>
        <span class="context-title">Rename</span>`;
      },
      click: (event) => {
        this.parentDetails = event.item[1];
        this.folderDetails = _.clone(this.parentDetails);
        this.folderDetails.legoName = "";
        this.editfolder_dialog = true;
        $(function () {
          $("#editfolder1").focus();
        });
      },
      enabled: () => {
        return true;
      },
      visible: (event) => {
        return ((event[1].type == "D") && event[1].legoLevel > 1);
      },
      divider: () => {
        return false;
      }
    },

    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-folder-open"></i>
        </span>
        <span class="context-title">Delete Folder</span>`;
      },
      click: (event) => {
        this.parentDetails = event.item[1];
        this.deleteFolder(this.parentDetails);
        return;
      },
      enabled: (event) => {
        return true;
      },
      visible: (event) => {
        return ((event[1].type == "D") && event[1].legoLevel > 1);
        //return true;
      },
      divider: (event) => {
        return false;
      }
    }
  ];

  isNavVisible = true;
  doccount: any;
  isdoucmentMode = false;
  public isRefModule = false;
  /**
   * Creates an instance of DocumentsComponent.
   * @param  {LocalStorageService} LocalStorageService - Get or Set data in local storage
   * @param  {Router} router - Get or Set parameters in router
   * @param  {MasterService} MasterService - Set dropdown Values
   * @param  {MessageService} MessageService - Display Success or Error Message
   * @param  {ModuleService} ModuleService - Get or Set Module tree structure
   * @param  {ChangeDetectorRef} cd - Idebtify Change detection
   * @param  {DocumentService} DocumentService - Post or get Data Using documentservice
   * @param  {ContextMenuService} contextMenuService - Context menu service 
   * @param  {ConfirmationService} confirmationService - Display popup before delete
   * @memberof DocumentsComponent
   */
  constructor(private LocalStorageService: LocalStorageService, private router: Router, private CommonAppService: CommonAppService
    , private MasterService: MasterService, private MessageService: MessageService, public ModuleService: ModuleService
    , private cd: ChangeDetectorRef, private DocumentService: DocumentService
    , private contextMenuService: ContextMenuService, private confirmationService: ConfirmationService) {
    this.config = component_config.cktool_config_full;
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
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
      if (this.queryparams.mode == 'D' && this.queryparams.lLvl == 1) {
        $("#main_tab_container").hide();
        this.isNavVisible = true;
        this.isdoucmentMode = true;
      }
      else if (this.queryparams.mode == 'D' && this.queryparams.lLvl > 1) {
        $("#main_tab_container").hide();
        this.isNavVisible = false;
        $("#stab_document_Add").addClass("hide_tab");
        this.isdoucmentMode = true;
      }
      else {
        $("#main_tab_container").show();
        this.isNavVisible = true;
        this.isdoucmentMode = false;
      }
    }));
    this.dateformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.bsConfig = {
      dateInputFormat: this.dateformat.date_Format,
      showWeekNumbers: false
    };
    this.activateModuleTabs(this.queryparams.t);
    this.getTreeModules();

    this._subscriptions.add(this.ModuleService.getModuleUpdates().subscribe(updates => {
      this.getTreeModules();
    }));
    this._subscriptions.add(this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
      if (updates.treeModules) {
        this.ModuleTreeItems = null;
        if (updates.treeModules.cType == 'D') {

          this.ModuleTreeItems = _.cloneDeep(updates.treeModules);
        }
        else if (updates.treeModules.cType != 'E' && updates.treeModules.cType != 'D' && updates.treeModules.cType != null) {

          this.ModuleTreeItems_popup = [_.cloneDeep(updates.treeModules)];
        }

      }
    }));

    this._subscriptions.add(router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        //this.getDocumentList();
      }
    }));

  }

  /**
   * Selected Tab 
   * @param  {TabDirective} data - selected tab Info
   * @return {void}@memberof DocumentsComponent
   */
  onSelect(data: TabDirective): void {
    //this.value = data.heading;
    this.value = data.heading;
    this.querystring = data.id;
    var newparams = this.queryparams;
    newparams.t = this.querystring;
    this.router.navigate(["/documents"], { queryParams: newparams });
    this.activateModuleTabs(this.querystring);
  }
  /**
   * Check For Access Rights
   * @return {void}@memberof DocumentsComponent
   */
  checkRights() {
    this.hasRights = false;
    this.checkrights = this.ModuleService.getModuleRights();
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
      }
      else if ((this.queryparams.mode == 'D' && this.queryparams.lLvl == 1)) {
        this.hasRights = true;
        this.hasReadOnly = false;
      }
      else if (this.checkrights.documentRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
    }
  }

  /**
   * Initialize on View
   * @return {void}@memberof DocumentsComponent
   */
  ngOnInit() {
    this.initSubscribe();
    this._subscriptions.add(
      this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
        this.dateformat.date_Format = preferencesettings.date_Format;
        this.bsConfig = {
          dateInputFormat: this.dateformat.date_Format,
          showWeekNumbers: false
        };
        this.getDocumentList();
      }));
  }
  /**
   * Get Tab access Rights 
   * @return {void}@memberof DocumentsComponent
   */
  initSubscribe() {
    this._subscriptions.add(
      this.ModuleService.getModuleRightsUpdate().subscribe(rights => {
        this.checkrights = rights;
        this.checkRights();
        this.isRefModule = this.ModuleService.checkIsRefmodule();
      })
    );
    this._subscriptions.add(this.DocumentService.getFileMoveUpdates().subscribe(data => {
      // this.cartcount = count;
      console.log("file move updates", data);
    }));
    this.checkrights = this.ModuleService.getModuleRights();
    this.checkRights();
  }
  /**
   * Component will destroy on page leave
   * @return {void}@memberof DocumentsComponent
   */
  ngOnDestroy() {
    console.log("Component will be destroyed");
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }
  /**
   * Dispaly Add document Popup
   * @return 
   * @memberof DocumentsComponent
   */
  showDialog() {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E' && (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    else if (this.queryparams.mode == 'E') {
      var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
      var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
      if (this.userinfo.EmployeeId == selectedempId) {
        // this.display = true;
      }
      else if (this.userinfo.EmployeeId == managerId) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      else {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
    }

    var newparams = this.queryparams;
    newparams.t = 'stab_document_Add';
    this.queryparams.t = 'stab_document_Add';
    this.router.navigate(["/documents"], { queryParams: newparams });
    //this.activateModuleTabs('stab_document_link');
    this.ModuleService.activateModuleTabs(this.queryparams);
    this.resetTable(this.pTableComponent);
    this.display = true;
  }

  // descendantsAllSelected(node): boolean {
  //   _.find(this.selectednodeModule, (s) => {
  //     return (node.legoId == s.legoId)
  //   })
  //   return node;
  // }

  /**
   * Display selected document in popup for Edit. and get tree for model list
   * @param  {any} edit_document - selected document data
   * @return 
   * @memberof DocumentsComponent
   */
  edit_Dialog(edit_document) {
    //edit_document = moment(edit_document.docDate).format(this.dateformat.date_Format);
    this.MessageService.clear();
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectednodeModule = [];
    this.selectedLinkModuleItems = [];
    this.edit_document = edit_document;
    if (this.queryparams.mode != 'E' && (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Restricted' || this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not Having Permission" });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (this.queryparams.mode == 'E') {
      var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
      var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
      if (this.userinfo.EmployeeId == selectedempId) {
        // this.display = true;
      }
      else if (this.userinfo.EmployeeId == managerId) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      else {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
    }
    // else
    {
      //this.edit_document_popup = true;
      var req = {
        DocumentId: edit_document.documentId,
        LegoId: edit_document.legoId,
        EmpId: edit_document.empId,
        CompanyId: edit_document.companyId,
        Version: edit_document.version,
        LinkDoc: edit_document.linkDoc,
        UserId: this.userinfo.EmployeeId
      };
      this.DocumentService.GetModuleDocList(req).then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            this.moduledoclist = [];
            if (res.status == 1) {
              var modulelist = res.result;
              this.moduledoclist = _.cloneDeep(modulelist);
              var treemodules = this.ModuleService.getTreeModules();
              if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
                if (treemodules.length > 0) {
                  var treenodes = _.cloneDeep(treemodules);
                  if (modulelist.length > 0) {
                    _.each(modulelist, (l) => {
                      var m: any = this.ModuleService.findChildModules(treenodes, null, l.legoId);
                      if (!_.isEmpty(m)) {
                        m.partialSelected = false;
                        m.draggable = false;
                        this.selectedLinkModuleItems.push(m.legoId);
                      }
                    });
                    this.selectedLinkModuleItems = [...this.selectedLinkModuleItems];
                    this.clone_selectedLinkModuleItems = _.cloneDeep(this.selectedLinkModuleItems)

                  }

                }
              }
              this.edit_document_popup = true;
            }
            else if (res.status == 2) {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not Having Permission" });
            }
            else {
              this.selectednodeModule = [];
              this.edit_document_popup = true;
            }

          }
        }
      });

    }

  }

  /**
   * Disply Confirmation Dialog Before delete 
   * @param  {any} doc - Selected Document Data
   * @return 
   * @memberof DocumentsComponent
   */
  Deleteconfirm(doc) {
    this.MessageService.clear();
    this.temp_doc = doc;
    //this.confirm = true;
    if (this.queryparams.mode != 'E' && (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    if (this.queryparams.mode == 'E') {
      var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
      var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
      if (this.userinfo.EmployeeId == selectedempId) {
        // this.display = true;
      }
      else if (this.userinfo.EmployeeId == managerId) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      else {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
    }
    this.deleteDocument(doc);

  }
  /**
   * Display Employee List for Adding Document Access Rights
   * @param  {any} c 
   * @return 
   * @memberof DocumentsComponent
   */
  access_popup(c) {
    if (this.queryparams.mode != 'E' || (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.document_access = c;
    this.EmployeeList(c.documentId);
  }

  /**
   * Set Auto Height for View page
   * @param  {*} event 
   * @return {void}@memberof DocumentsComponent
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
    $("#document-pg .tab-content").css("height", (tabcontent_h) + "px");
    $("#document-pg .child_tabcontent").each(function () {
      $(this).css("height", (tabcontent_h - 25) + "px");
    });
    if (this.isdoucmentMode) {
      var searchresult_table = ((tabcontent_h - 135) || 300);
      $("#documentList_table .ui-table-scrollable-body").css("max-height", searchresult_table + "px");
    }
    else {
      $("#documentList_table .ui-table-scrollable-body").css("max-height", (tabcontent_h / 2) - 90 + "px");
    }

  }
  /**
   * Hide/Show tabs based on query params mode 
   * @return {void}@memberof DocumentsComponent
   */
  ngAfterViewInit() {
    $("#foldername").focus();
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.querystring = params['t'];
      this.CommonAppService.checkPinmodule();
      if (this.queryparams.mode == 'D') {
        $("#main_tab_container").hide();
      }
      else {
        $("#main_tab_container").show();
      }
      if ((params['mode'] == 'D' || params['mode'] == 'E' || params['mode'] == 'S' || params['mode'] == 'T' || params['mode'] == 'O' || params['mode'] == 'P')
        && (params['t'] == "stab_view_document" || params['t'] == "stab_document_Add" || params['t'] == "stab_document_link")) {

        setTimeout(() => {

          this.getDocumentList();

          // Added By Saravanan J
          this.modulesubTabset.tabs[0].active = true;
          if (params['t'] == "stab_document_Add") { this.showDialog(); }
          else if (params['t'] == "stab_document_link") { this.displaylinkdocument(); }

        }, 500);
      }
      this.activateModuleTabs(this.querystring);
    }));
    this.ModuleService.activateModuleTabs(this.queryparams);
    //this.getDocumentList();
  }
  /**
   * Set auto height on change detection
   * @return {void}@memberof DocumentsComponent
   */
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
    //     setTimeout(() => {
    //   if ( this.cd !== null &&
    //     this.cd !== undefined &&
    //     !(this.cd["ChangeDetectorRef"]) ) {
    //         this.cd.detectChanges();
    // }
    // },250);
  }

  /**
   * Set selected tab as active tab
   * @param  {any} hasvalue - tabId
   * @return {void}@memberof DocumentsComponent
   */
  activateModuleTabs(hasvalue) {
    this.querystring = hasvalue;
    if (this.modulesubTabset) {
      var activeTab = (this.querystring == 'stab_view_document') ? 0 :
        (this.querystring == "stab_document_Add") ? 1 :
          (this.querystring == "stab_document_link") ? 2 :
            (this.querystring == 'stab_document_folder') ? 3 : 0;

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
          if (this.value == null || this.value == undefined) {
            this.value = this.modulesubTabset.tabs[2].heading;
            this.queryparams.t = this.modulesubTabset.tabs[2].id;
          }

          if (this.queryparams.mode != 'D') {
            $("#main_tab_container").show();
          }
          else {
            $("#main_tab_container").hide();
          }

        }
      }
    }
  }
  //////////GET DOCUMENT LIST START///////////
  /**
   * Get Document List
   * @return {void}@memberof DocumentsComponent
   */
  getDocumentList() {
    var legos;
    var newlego = this.ModuleService.getCurrentLegos();
    if (!_.isEmpty(newlego)) {
      legos = _.join(newlego, ',');
    }
    else {
      legos = this.selectedModuleId;
    }
    var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
    var req = {
      CompanyId: this.userinfo.CompanyId,
      LegoId: this.queryparams.lId,
      Type: this.queryparams.mode,
      Level: this.queryparams.lLvl,
      StatementType: 'Select',
      currentLegos: legos,
      EmpId: selectedempId
    };

    this.DocumentService.GetDocument(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              //this.documentlist = res.result;
              var doclist = res.result.document_list;
              this.clone_temp_documentlist1 = _.cloneDeep(doclist);
              _.forEach(doclist, (d) => {
                d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
              });
              if (this.queryparams.mode == 'D' && this.queryparams.lLvl == 1) {
                this.documentlist = _.uniqBy(res.result.document_list, function (e) {
                  return e.linkDoc;
                });

              }
              else {
                //this.documentlist = res.result.document_list;
                this.documentlist = doclist;
              }
              var doctype;
              var spltType = "";
              var _getType;
              _.forEach(this.documentlist, (d) => {
                //d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
                //d.docDate = moment(d.docDate).format(this.dateformat.date_Format);
                doctype = d.linkDoc.split(".");

                _getType = doctype;
                spltType = _getType[1];
                if (spltType.toLowerCase() == "txt" || spltType.toLowerCase() == "json")
                  d.doctype = "fa fa-file-text fa-lg";
                else if (spltType.toLowerCase() == "pdf")
                  d.doctype = "fa fa-folder fa-lg";
                else if (spltType.toLowerCase() == "doc" || spltType.toLowerCase() == "docx")
                  d.doctype = "fa fa-file-word-o fa-lg";
                else if (spltType.toLowerCase() == "xls" || spltType.toLowerCase() == "xlsx")
                  d.doctype = "fa fa-file-excel-o fa-lg";
                else if (spltType.toLowerCase() == "ppt" || spltType.toLowerCase() == "pptx")
                  d.doctype = "fa fa-file-powerpoint-o fa-lg";
                else if (spltType.toLowerCase() == "png" || spltType.toLowerCase() == "jpg")
                  d.doctype = "fa fa-file-image-o fa-lg";
                else
                  d.doctype = "fa fa-arrows-alt fa-lg";
              });
              this.temp_documentlist = this.documentlist;
              this.clone_temp_documentlist = _.cloneDeep(this.temp_documentlist);
              this.clone_temp_moduledocs = _.cloneDeep(doclist)
              this.treeSubmoduleDocument_temp = res.result.treeStructure || [];
              if (!_.isEmpty(this.treeSubmoduleDocument_temp)) {
                _.forEach(this.treeSubmoduleDocument_temp, (t) => {
                  t.docDate = moment(t.docDate).format(this.dateformat.date_Format);
                })
              }
              this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
              this.treeSubmoduleDocument = this.ModuleService.updateTreeObjects(this.selectedModuleId, "documentChange", this.treeSubmoduleDocument_temp);


            }
            else {
              this.documentlist = [];
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
   * Get all Document Against the company 
   * @return {void}@memberof DocumentsComponent
   */
  getAllDocumentList() {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.link_documentlist = [];
    var req = {
      CompanyId: this.userinfo.CompanyId,
      LegoId: this.queryparams.lId,
      Type: this.queryparams.mode,
      Level: this.queryparams.lLvl,
      StatementType: 'Select'
    };

    this.DocumentService.GetAllDocument(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              var doclist = result.documentlist;
              _.forEach(doclist, (d) => {
                d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
              });
              this.link_documentlist = _.uniqBy(result.document_list, function (e) {
                return e.documentId;
              });
              this.temp_documentlist = _.filter(this.link_documentlist, (d) => {
                var exist = _.find(this.clone_temp_documentlist, (d1) => {
                  return (d1.documentId == d.documentId)
                });
                return (!_.isEmpty(exist))
              })
              this.clone_temp_moduledocs = _.cloneDeep(doclist)
              this.clone_temp_documentlist = _.cloneDeep(this.temp_documentlist);
              var temp_doc = result.treeStructure;
            }

            else {
              this.link_documentlist = [];
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
   * Get Link Document List 
   * @return {void}@memberof DocumentsComponent
   */
  getLinkDocumentList() {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    var req = {
      CompanyId: this.userinfo.CompanyId,
      LegoId: this.queryparams.lId,
      Type: this.queryparams.mode,
      Level: this.queryparams.lLvl,
      StatementType: 'GetAllDocument',
      EmpId : this.userinfo.EmployeeId,

    };

    this.DocumentService.GetLinkDocument(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              // this.link_documentlist = _.uniqBy(res.result, function (e) {
              //   return e.documentId;
              // });
              this.temp_documentlist = _.filter(this.link_documentlist, (d) => {
                var exist = _.find(this.clone_temp_documentlist, (d1) => {
                  return (d1.documentId == d.documentId)
                });
                return (!_.isEmpty(exist))
              })
              var filter_doc = _.omitBy(this.link_documentlist, (d) => {
                var exist = _.filter(this.temp_documentlist, (d1) => {
                  return (d1.documentId == d.documentId)
                });
                return (!_.isEmpty(exist))
              });
              this.link_documentlist = _.values(filter_doc);
              this.link_documentlist = _.uniqBy(res.result, function (e) {
                return e.linkDoc;
              });
              this.clone_temp_documentlist = _.cloneDeep(this.temp_documentlist);
              var result = res.result;
              this.clone_temp_lnkdocumentlist = _.cloneDeep(result);
            }

            else {
              this.link_documentlist = [];
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
   * Set Version In DropDownn
   * @param  {any} number - document count
   * @param  {any} data - document data
   * @return 
   * @memberof DocumentsComponent
   */
  createRange(number, data) {
    var items: number[] = [];
    this.doccount = _.cloneDeep(data.version);
    for (var i = 1; i <= number; i++) {
      items.push(i);
    }
    var items1: number[] = [];
    items = _.find(this.clone_temp_documentlist1, (c) => {
      if (c.linkDoc == data.linkDoc) {
        items1.push(c.version)
      }
    });
    items = items;
    var array = _.sortBy(items1, function (num) {
      return num;
    });
    return array.reverse()
  }

  /**
   * Download Selected File 
   * @param  {any} c 
   * @param  {any} option 
   * @return 
   * @memberof DocumentsComponent
   */
  downloadFile(c, option) {
    if (option == 1) {
      c.legoId = c.moduleId;
    }
    if (this.queryparams.mode != 'E' || (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {

        var rights = "Readonly";
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.DOCUMENTACCESSRIGHTS, rights);
      }
      else {
        var rights = "Unrestricted";
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.DOCUMENTACCESSRIGHTS, rights);
      }
      if (this.isRefModule) {
        return false;
      }

    }
    this.DocumentService.downloadFile(c);
  }

  /**
   * Get Modules Tree structure
   * @return {void}@memberof DocumentsComponent
   */
  getTreeModules() {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var treemodules = this.ModuleService.getTreeModules();
    if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
      if (treemodules.length > 0) {
        var treenodes = _.cloneDeep(treemodules);
        var m = this.ModuleService.findChildModules(treenodes, null, this.selectedModuleId);
        this.ModuleTreeItems = m;
        this.treeItemNode = m;
        var temp_id = treenodes[0].legoId;
        var tree = this.ModuleService.findChildModules(treenodes, null, temp_id);
      }
    }
    var selectedmodelid = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var treemodules = this.ModuleService.getTreeModules();
    if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
      if (treemodules.length > 0) {
        var treenodes = _.cloneDeep(treemodules);
        var m = this.ModuleService.findChildModules(treenodes, null, selectedmodelid);
        this.ModuleTreeItems_popup = [this.FilterDocumentEMployeeModules(m)];
        this.ModuleTreeItems_popup = this.ModuleTreeItems_popup[0];
      }
    }
  }
  /**
   * Removes Employee and Document Library Module
   * @param  {any} module - selected module data
   * @return 
   * @memberof DocumentsComponent
   */
  FilterDocumentEMployeeModules(module) {
    var nodes = _.cloneDeep(module);
    if (nodes.children.length > 0) {
      nodes.children = _.remove(nodes.children, (TreeItems: any) => {
        return (TreeItems.cType != 'E' && TreeItems.cType != 'D' && TreeItems.cType != null);
      });
    }
    return nodes;
  }


  /**
   * Add New Folder in document folder tools
   * @param  {any} newfolder - folder name
   * @return 
   * @memberof DocumentsComponent
   */
  addNewFolder(newfolder) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    //this.folderDetails
    this.MessageService.clear();
    if (newfolder.legoName == null || newfolder.legoName == undefined || newfolder.legoName == "") {
      this.MessageService.clear();
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Folder name required." });
      return false;
    }
    this.currentLegoLevel = this.parentDetails.legoLevel;
    newfolder.parentId = this.parentDetails.legoId;
    newfolder.ownerId = parseInt(this.userinfo.EmployeeId);
    newfolder.userId = this.userinfo.sub;
    newfolder.legolevel = this.parentDetails.legoLevel + 1;
    newfolder.children = [];
    if (this.ModuleTreeItems['children'].length == 0) {
      newfolder.legoLevel = this.ModuleTreeItems['legoLevel'] + 2;
    }
    if (newfolder.parent != null || newfolder.parent != undefined) {
      newfolder.parent = "";
    }
    newfolder.params = "";
    var selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var legoupdation = {
      parentLego: null,
      currentLego: newfolder,
      lego: newfolder,
      currentLegoLevel: this.currentLegoLevel,
      statementType: 'Add',
      selectedModelId: selectedModelId
    };
    this.ModuleService.addModule(legoupdation).then(res => {
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Folder Created Successfuly." });
            this.ModuleService.setModules().then((res) => {
              console.log("call back module service:", res);
            });
            this.addfolder_dialog = false;
          }

        }
      }
    });
  }

  /**
   * Set Rename Folder
   * @param  {any} parentDetails - Selected folder data
   * @return 
   * @memberof DocumentsComponent
   */
  editFolder(parentDetails) {
    this.MessageService.clear();
    if (parentDetails.legoName == null || parentDetails.legoName == undefined || parentDetails.legoName == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Folder name required." });
      return false;
    }
    this.parentDetails.legoName = parentDetails.legoName;
    this.parentDetails.children = [];

    if (this.parentDetails.parent != null || this.parentDetails.parent != undefined) {
      this.parentDetails.parent = "";
    }
    this.parentDetails.params = "";
    var selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var legoupdation = {
      parentLego: this.parentDetails,
      currentLego: this.parentDetails,
      lego: this.parentDetails,
      currentLegoLevel: this.currentLegoLevel,
      statementType: 'Rename',
      statementFlag: 'Updated',
      selectedModelId: selectedModelId
    };
    this.ModuleService.addModule(legoupdation).then(res => {
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Updated Successfuly." });
            this.ModuleService.setModules().then((res) => {
            });
            this.editfolder_dialog = false;
          }

        }
      }
    });
  }

  /**
   * Revert the Modified data on cancel
   * @return {void}@memberof DocumentsComponent
   */
  revert_cancelDialog() {
    this.getTreeModules();
    this.editfolder_dialog = false;
    this.addfolder_dialog = false;
  }

  /**
   * Delete folder 
   * @param  {any} event - selected Folder data
   * @return {void}@memberof DocumentsComponent
   */
  deleteFolder(event) {
    this.confirmationService.confirm({
      message: 'The Selected Folder and ALL Sub-Folders will be Deleted. Are sure you want to continue?',
      accept: () => {
        this.parentDetails.delFlag = 'Y';
        this.parentDetails.children = [];
        if (this.parentDetails.parent != null || this.parentDetails.parent != undefined) {
          this.parentDetails.parent = "";
        }
        this.parentDetails.params = "";
        var legoupdation = {
          parentLego: this.parentDetails,
          currentLego: this.parentDetails,
          lego: this.parentDetails,
          currentLegoLevel: this.currentLegoLevel,
          statementType: 'SDelete',
          statementFlag: 'Deleted'
        };
        this.ModuleService.addModule(legoupdation).then(res => {
          if (res) {
            if (!_.isEmpty(res)) {
              if (res.status == 1) {
                this.ModuleService.setModules().then((res) => {
                });
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Folder Deleted Successfuly." });

              }

            }
          }
        });

      }
    });
  }
  //////EMPLOYEEE LIST//////////////
  /**
   * Get Employee List for set access rights
   * @param  {any} doc_id - selected document id
   * @return {void}@memberof DocumentsComponent
   */
  EmployeeList(doc_id) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
    this.MessageService.clear();
    var req = {
      CompanyId: this.companyinfo.CompanyId,
      DocumentId: doc_id,
      EmployeeId: this.userinfo.EmployeeId
    };
    this.DocumentService.getEmpList(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.employeelist = res.result;
              this.employeelist = _.forEach(this.employeelist, (e) => {
                if (e.documentAccessRights == null || e.documentAccessRights == undefined) {
                  e.documentAccessRights = 'Unrestricted';
                }
                if (e.documentAccessRights == 'Unrestricted') {
                  e.unrestricted = "unrestricted";
                  e.readonly = "false";
                  e.restricted = "false";
                }
                else if (e.documentAccessRights == 'Restricted') {
                  e.restricted = "restricted";
                  e.readonly = "false";
                  e.unrestricted = "false";
                }
                else if (e.documentAccessRights == 'Readonly') {
                  e.readonly = "readonly";
                  e.restricted = "false";
                  e.unrestricted = "false";
                }
              })
              this.temp_nonparticipatedUsers = this.employeelist;
              this.tempselectedparticipated = this.temp_nonparticipatedUsers;
              this.temp_employeelist = _.cloneDeep(this.employeelist);
              this.show_user_popup = true;
            }
            else if (res.status == 2) {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not Having Permission." });
              this.show_user_popup = false;
            }
            else {
              this.show_user_popup = true;
              this.employeelist = [];
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
   * Display Employee list Popup
   * @return 
   * @memberof DocumentsComponent
   */
  Show_emp_dialog() {
    if (this.queryparams.mode != 'E' || (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.show_user_popup = true;
  }



  /**
   * Set Document Access Rights for Selected Employee 
   * @param  {any} emp - Selected Employee List
   * @param  {any} mode - selected_user
   * @return 
   * @memberof DocumentsComponent
   */
  AddEmployee_access(emp, mode) {
    if (emp.length == 0) {
      return false;
    }
    var doc = this.document_access;
    _.forEach(emp, (emp) => {
      emp.companyId = doc['documentId'];
    });
    var req = {
      "DocAccess": emp,
      Mode: mode
    };
    this.DocumentService.documentAccess(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Added" });
              this.show_user_popup = false;
              this.tempselectedparticipated = [];
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Failed" });
              this.show_user_popup = false;
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
   * Display Link Document List In popup
   * @return 
   * @memberof DocumentsComponent
   */
  displaylinkdocument() {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E' && (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    else if (this.queryparams.mode == 'E') {
      var selectedempId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
      var managerId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPMANAGERID);
      if (this.userinfo.EmployeeId == selectedempId) {
        // this.display = true;
      }
      else if (this.userinfo.EmployeeId == managerId) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      else {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
    }
    this.getLinkDocumentList();

    var newparams = this.queryparams;
    newparams.t = 'stab_document_link';
    this.queryparams.t = 'stab_document_link';
    //this.router.navigate(["/documents"], { queryParams: newparams });

    this.activateModuleTabs('stab_document_link');

    this.display_linkdocument = true;
  }
  /**
   * Save Selected Link Document From List
   * @param  {any} temp_documentlist - selected Document List
   * @return 
   * @memberof DocumentsComponent
   */
  saveLinkDocument(temp_documentlist) {
    this.MessageService.clear();
    if (temp_documentlist.length == 0) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Select Minimum one Document." });
      return false;
    }
    var alreadyexist = _.filter(temp_documentlist, (d) => {
      var exist = _.find(this.clone_temp_documentlist, (d1) => {
        return (d1.documentId == d.documentId)
      });
      return (!_.isEmpty(exist))
    });
    var NewlyAdded, remove;
    NewlyAdded = _.omitBy(temp_documentlist, (m) => {
      return (!_.isEmpty(_.find(this.clone_temp_documentlist, (c) => {
        return (c.documentId == m.documentId)
      })))
    });
    remove = _.omitBy(this.clone_temp_documentlist, (d) => {
      var exist = _.find(temp_documentlist, (d1) => {
        return (d1.documentId == d.documentId)
      });
      return (!_.isEmpty(exist))
    });
    if (alreadyexist.length == 0) {
      NewlyAdded = temp_documentlist;
    }
    _.forEach(NewlyAdded, (NewlyAdded) => {
      NewlyAdded.legoId = this.queryparams.lId;
    });
    _.forEach(remove, (remove) => {
      remove.legoId = this.queryparams.lId;
    });
    if (remove == null || remove == undefined || remove == "" || NewlyAdded == null || NewlyAdded == undefined || NewlyAdded == "") {
      _.forEach(temp_documentlist, (temp_documentlist) => {
        temp_documentlist.legoId = this.queryparams.lId;
      });

    }
    var newDoc = _.values(NewlyAdded);
    var removeDoc = _.values(remove);
    var req = {
      "NewlyAdded": newDoc,
      "Removed": removeDoc,
      Type : this.queryparams.mode,
      EmpId : this.userinfo.EmployeeId,
      CompanyId : this.userinfo.CompanyId
    };
    this.DocumentService.SaveLinkDocument(req)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Updated" });
              this.display_linkdocument = false;
              this.getDocumentList();
              this.resetTable(this.pTableComponent);
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Failed" });
              this.display_linkdocument = false;
              this.resetTable(this.pTableComponent);
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
      this.activateModuleTabs('stab_view_document');
  }

  /**
   * Set Access rights add, edit,view, delete to restricted , readonly and Unrestricted mode
   * @param  {any} data 
   * @param  {any} mode 
   * @return {void}@memberof DocumentsComponent
   */
  setAccess(data, mode) {
    if (mode == 'unrestricted') {
      this.unrestricted = "true";
      data.unrestricted = "true";
      data.restricted = "false";
      data.readonly = "false";
    }
    else if (mode == 'restricted') {
      this.restricted = "true";
      data.unrestricted = "false";
      data.restricted = "true";
      data.readonly = "false";
    }
    else if (mode == 'readonly') {
      this.readonly = "true";
      data.unrestricted = "false";
      data.restricted = "false";
      data.readonly = "true";
    }
    //console.log("selection list", data)
  }

  /**
   * Delete Document in two ways one for module level and other from document library
   * @param  {*} doc - selected document data
   * @return {void}@memberof DocumentsComponent
   */
  deleteDocument(doc: any) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    var StatementType;
    var msg;
    var empid;
    if (this.queryparams.mode == 'E') {
      empid = doc.empId;
    }
    else {
      empid = this.userinfo.EmployeeId;
    }
    if (this.queryparams.mode == 'D' && this.queryparams.lLvl == 1) {
      msg = "Are you sure You want To delete";
      StatementType = "DeleteDocumentLibrary";
    }
    // else if (this.queryparams.mode == 'E') {
    //   msg = "Are you sure You want To delete";
    //   StatementType = "DeleteDocument";
    // }
    else {
      msg = "Removing this file from this module will remove it only from the documents Tab. the file will not be deleted and will continue to be available through the Main Document Library Folder";
      StatementType = "DeleteDocument";
    }
    this.confirmationService.confirm({
      message: msg,
      accept: () => {
        var legos;
        var newlego = this.ModuleService.getCurrentLegos();
        if (!_.isEmpty(newlego)) {
          legos = _.join(newlego, ',');
        }
        else {
          legos = this.selectedModuleId;
        }
        var req = {
          DocumentId: doc.documentId,
          // LegoId: doc.legoId,
          LegoId: this.queryparams.lId,
          Type: this.queryparams.mode,
          Level: this.queryparams.lLvl,
          EmpId: empid,
          CompanyId: doc.companyId,
          StatementType: StatementType,
          UserId: this.userinfo.EmployeeId,
          currentLegos: legos
        };
        this.DocumentService.DeleteDocument(req).then(res => {
          if (res) {
            if (!_.isEmpty(res)) {
              if (res.status == 1) {
                var doclist = res.result.document_list;
                this.clone_temp_documentlist1 = _.cloneDeep(doclist);
                _.forEach(doclist, (d) => {
                  d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
                });
                if (this.queryparams.mode == 'D' && this.queryparams.lLvl == 1) {
                  this.documentlist = _.uniqBy(res.result.document_list, function (e) {
                    return e.linkDoc;
                  });
                }
                else {
                  //this.documentlist = res.result.document_list;
                  this.documentlist = doclist;
                }
                var doctype;
                var spltType = "";
                var _getType;
                _.forEach(this.documentlist, (d) => {
                  d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
                  doctype = d.linkDoc.split(".");

                  _getType = doctype;
                  spltType = _getType[1];
                  if (spltType.toLowerCase() == "txt" || spltType.toLowerCase() == "json")
                    d.doctype = "fa fa-file-text fa-lg";
                  else if (spltType.toLowerCase() == "pdf")
                    d.doctype = "fa fa-folder fa-lg";
                  else if (spltType.toLowerCase() == "doc" || spltType.toLowerCase() == "docx")
                    d.doctype = "fa fa-file-word-o fa-lg";
                  else if (spltType.toLowerCase() == "xls" || spltType.toLowerCase() == "xlsx")
                    d.doctype = "fa fa-file-excel-o fa-lg";
                  else if (spltType.toLowerCase() == "ppt" || spltType.toLowerCase() == "pptx")
                    d.doctype = "fa fa-file-powerpoint-o fa-lg";
                  else if (spltType.toLowerCase() == "png" || spltType.toLowerCase() == "jpg")
                    d.doctype = "fa fa-file-image-o fa-lg";
                  else
                    d.doctype = "fa fa-arrows-alt fa-lg";
                });
                this.temp_documentlist = this.documentlist;
                this.clone_temp_documentlist = _.cloneDeep(this.temp_documentlist);
                this.clone_temp_moduledocs = _.cloneDeep(doclist)
                if (!_.isEmpty(res.result.treeStructure)) {
                  this.treeSubmoduleDocument_temp = res.result.treeStructure || [];
                  if (!_.isEmpty(this.treeSubmoduleDocument_temp)) {
                    _.forEach(this.treeSubmoduleDocument_temp, (t) => {
                      t.docDate = moment(t.docDate).format(this.dateformat.date_Format);
                    })
                  }
                  this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
                  this.treeSubmoduleDocument = this.ModuleService.updateTreeObjects(this.selectedModuleId, "documentChange", this.treeSubmoduleDocument_temp);

                }
                this.edit_document_popup = false;
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Deleted" });
              }
              else {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having Permission." });
              }

            }
          }
        });

      }
    });
  }

  /**
   * Edit Document details 
   * @param  {any} doc - selected document data
   * @param  {any} selectedLinkModuleItems - selected tree modules which are to be linked or removed
   * @return 
   * @memberof DocumentsComponent
   */
  editDocument(doc, selectedLinkModuleItems) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.MessageService.clear();
    if (this.queryparams.mode != 'E' || (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var StatementType;
    var msg;
    var empid;
    var alreadyexist; var removed;
    let NewlyAdded; var added = "";
    var deleted = "";
    if (doc.title == undefined || doc.title == null || doc.title == '') {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Description Required" });
      return;
    }
    if (doc.docDate == undefined || doc.docDate == null || doc.docDate == '') {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please Select the Date" });
      return;
    }
    if (this.queryparams.mode == 'D' && this.queryparams.lLvl == 1) {
      alreadyexist = _.omitBy(this.clone_selectedLinkModuleItems, (m) => {
        return (!_.isEmpty(_.find(selectedLinkModuleItems, (c) => {
          return (c == m)
        })))
      });
      NewlyAdded = _.omitBy(selectedLinkModuleItems, (d) => {
        var exist = _.omitBy(this.clone_selectedLinkModuleItems, (d1) => {
          return (d1 != d)
        });
        return (!_.isEmpty(exist))
      });
      removed = _.omitBy(this.clone_selectedLinkModuleItems, (d) => {
        var exist = _.omitBy(selectedLinkModuleItems, (d1) => {
          return (d1 != d)
        });
        return (!_.isEmpty(exist))
      });

      _.each(NewlyAdded, function (val, i) {
        if (val != undefined)
          added += +val + ",";
      })
      _.each(removed, function (val, i) {
        if (val != undefined)
          deleted += +val + ",";
      })

      doc.StatementType = "AddUpdateTreeDoc";
    }
    else {
      doc.StatementType = "AddUpdateDocument";
    }
    //return;

    if (this.queryparams.mode == 'E') {
      empid = doc.empId;
    }
    else {
      empid = 0
    }
    doc.docDate = (doc.docDate != null && doc.docDate != "") ? moment(doc.docDate).format(AppConstant.API_CONFIG.DATE.apiFormat) : '';

    doc.UserId = "this.userinfo.EmployeeId";
    doc.Type = this.queryparams.mode;
    doc.Level = this.queryparams.lLvl;
    var legos;
    var newlego = this.ModuleService.getCurrentLegos();
    if (!_.isEmpty(newlego)) {
      legos = _.join(newlego, ',');
    }
    else {
      legos = this.selectedModuleId;
    }
    var req_obj = {
      NewlyAdded: added,
      Removed: deleted,
      DocumentId: doc.documentId,
      //LegoId: doc.legoId,
      LegoId: this.queryparams.lId,
      Type: this.queryparams.mode,
      Level: this.queryparams.lLvl,
      EmpId: empid,
      CompanyId: doc.companyId,
      StatementType: doc.StatementType,
      DocDate: doc.docDate,
      Title: doc.title,
      Comments: doc.comments,
      LinkDoc: doc.linkDoc,
      UserId: this.userinfo.EmployeeId,
      Version: doc.version,
      currentLegos: legos
    };
    this.DocumentService.EditDocumentTree(req_obj).then(res => {
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            var doclist = res.result.document_list;
            this.clone_temp_documentlist1 = _.cloneDeep(doclist);
            _.forEach(doclist, (d) => {
              d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
            });
            if (this.queryparams.mode == 'D' && this.queryparams.lLvl == 1) {
              this.documentlist = _.uniqBy(res.result.document_list, function (e) {
                return e.linkDoc;
              });
            }
            else {
              //this.documentlist = res.result.document_list;
              this.documentlist = doclist;
            }
            var doctype;
            var spltType = "";
            var _getType;
            _.forEach(this.documentlist, (d) => {
              d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
              doctype = d.linkDoc.split(".");

              _getType = doctype;
              spltType = _getType[1];
              if (spltType.toLowerCase() == "txt" || spltType.toLowerCase() == "json")
                d.doctype = "fa fa-file-text fa-lg";
              else if (spltType.toLowerCase() == "pdf")
                d.doctype = "fa fa-folder fa-lg";
              else if (spltType.toLowerCase() == "doc" || spltType.toLowerCase() == "docx")
                d.doctype = "fa fa-file-word-o fa-lg";
              else if (spltType.toLowerCase() == "xls" || spltType.toLowerCase() == "xlsx")
                d.doctype = "fa fa-file-excel-o fa-lg";
              else if (spltType.toLowerCase() == "ppt" || spltType.toLowerCase() == "pptx")
                d.doctype = "fa fa-file-powerpoint-o fa-lg";
              else if (spltType.toLowerCase() == "png" || spltType.toLowerCase() == "jpg")
                d.doctype = "fa fa-file-image-o fa-lg";
              else
                d.doctype = "fa fa-arrows-alt fa-lg";
            });
            this.temp_documentlist = this.documentlist;
            this.clone_temp_documentlist = _.cloneDeep(this.temp_documentlist);
            this.clone_temp_moduledocs = _.cloneDeep(doclist)
            if (!_.isEmpty(res.result.treeStructure)) {
              this.treeSubmoduleDocument_temp = res.result.treeStructure || [];
              if (!_.isEmpty(this.treeSubmoduleDocument_temp)) {
                _.forEach(this.treeSubmoduleDocument_temp, (t) => {
                  t.docDate = moment(t.docDate).format(this.dateformat.date_Format);
                })
              }
              this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
              this.treeSubmoduleDocument = this.ModuleService.updateTreeObjects(this.selectedModuleId, "documentChange", this.treeSubmoduleDocument_temp);

            }
            this.edit_document_popup = false;
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Updated" });
          }
          else {
            this.edit_document_popup = false;
            this.documentlist = [];
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Updation Failed" });

          }
        }
        else {
          this.edit_document_popup = false;
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
          return false;
        }
      }
      else {
        this.edit_document_popup = false;
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went Wrong Please try again." });
      }
    });
  }
  /**
   * Document Upload send data to Add-document.component.ts 
   * @param  {any} op - file Data
   * @return 
   * @memberof DocumentsComponent
   */
  uploadDocumentEvent(op) {
    if (this.queryparams.mode != 'E' || (this.queryparams.mode != 'D' && this.queryparams.lLvl != 1)) {
      if ((this.checkrights.documentRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.addDocument = op.adddocument;
    var files = op.file
    let selectednodeModule = op.selectednodeModule;
    this.getDocumentList();
    this.resetTable(this.pTableComponent);

  }

  closeModelEvent(pop) {
    this.addDocument = null;
    this.display = false;

    var newparams = this.queryparams;
    newparams.t = 'stab_view_document';
    this.queryparams.t = 'stab_view_document';
    this.router.navigate(["/documents"], { queryParams: newparams });
    //this.activateModuleTabs('stab_document_link');
    this.ModuleService.activateModuleTabs(this.queryparams);
    this.display = false;
    this.resetTable(this.pTableComponent);
  }

  // SavereferenceDoc() {
  //   var req = {
  //     //"NewlyAdded": newDoc,
  //   };
  //   this.DocumentService.SaveLinkDocument(req)
  //     .then(res => {
  //       if (res) {
  //         if (!_.isEmpty(res)) {
  //           if (res.status == 1) {
  //             this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Added" });
  //             this.display_linkdocument = false;
  //             this.getDocumentList();
  //             //this.documentlist = temp_documentlist;
  //           }
  //           else {
  //             this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Failed" });
  //             this.display_linkdocument = false;
  //           }
  //         }
  //         else {
  //           this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
  //           return false;
  //         }
  //       }
  //     }, error => {
  //       console.log("Error Happend");

  //     })
  // }
  /**
   * Check Child Modules 
   * @param  {any} TreeItems - module data 
   * @return 
   * @memberof DocumentsComponent
   */
  checkChildExist(TreeItems) {
    var exist = false;
    if (!_.isEmpty(TreeItems)) {
      if (TreeItems.children.length > 0) {
        exist = true;
      }
    }
    return exist;
  }
  /**
   * Toggle or Expand tree 
   * @param  {any} TreeItems - selected tree items
   * @param  {any} $event -
   * @return {void}@memberof DocumentsComponent
   */
  toggleExpandCollapse(TreeItems, $event) {
    if (TreeItems.expanded == true) {
      TreeItems.expanded = false;
    } else {
      TreeItems.expanded = true;
    }
  }

  /**
   * Get Document Based on Selected version from dropdown
   * @param  {any} rowData - selected version data
   * @param  {any} index - index value of selected version
   * @param  {any} version - selected version
   * @return {void}@memberof DocumentsComponent
   */
  versionChange(rowData, index, version) {
    var vdoc = _.cloneDeep(this.clone_temp_moduledocs);
    rowData = _.filter(vdoc, (d) => {
      return (d.version == rowData.version && d.linkDoc == rowData.linkDoc);
    });
    var doctype;
    var spltType = "";
    var _getType;
    _.forEach(rowData, (d) => {
      d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';
      doctype = d.linkDoc.split(".");
      _getType = doctype;
      spltType = _getType[1];
      if (spltType.toLowerCase() == "txt" || spltType.toLowerCase() == "json")
        d.doctype = "fa fa-file-text fa-lg";
      else if (spltType.toLowerCase() == "pdf")
        d.doctype = "fa fa-folder fa-lg";
      else if (spltType.toLowerCase() == "doc" || spltType.toLowerCase() == "docx")
        d.doctype = "fa fa-file-word-o fa-lg";
      else if (spltType.toLowerCase() == "xls" || spltType.toLowerCase() == "xlsx")
        d.doctype = "fa fa-file-excel-o fa-lg";
      else if (spltType.toLowerCase() == "ppt" || spltType.toLowerCase() == "pptx")
        d.doctype = "fa fa-file-powerpoint-o fa-lg";
      else if (spltType.toLowerCase() == "png" || spltType.toLowerCase() == "jpg")
        d.doctype = "fa fa-file-image-o fa-lg";
      else
        d.doctype = "fa fa-arrows-alt fa-lg";
    });
    if (!_.isEmpty(rowData)) {
      this.documentlist[index] = rowData[0];
    }
    else {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "File Does not Exist" });
    }
  }
  /**
   * Checks comment is added or not
   * @param  {any} rowData 
   * @return 
   * @memberof DocumentsComponent
   */
  checkIsComments(rowData) {
    return (rowData.comments == '' || rowData.comments == undefined || rowData.comments == null) ? true : false;
  }
  /**
   * Drag over event 
   * @param  {any} ev - event data
   * @return {void}@memberof DocumentsComponent
   */
  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * Drag selected document from document page 
   * @param  {any} ev - drag event data
   * @param  {any} rowData - selected data
   * @return {void}@memberof DocumentsComponent
   */
  drag(ev, rowData) {
    var fileItem = JSON.stringify(rowData);
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData("text/plain", fileItem);
    ev.dataTransfer.setDragImage(ev.target, 0, 0);
    this.cd.detach();
    console.log("drag", fileItem)
  }

  /**
   * Drop selected document Event
   * @param  {any} ev - drop event data
   * @return {void}@memberof DocumentsComponent
   */
  drop(ev) {
    ev.preventDefault();
  }

  /**
   * drag end event
   * @param  {any} ev - event data
   * @return {void}@memberof DocumentsComponent
   */
  dragend(ev) {
    console.log("drag end", ev);
  }

  /**
   * Exit from Document library page
   * @return {void}@memberof DocumentsComponent
   */
  Exit_document() {
    this.router.navigate(['/home']);
  }

  revertDocument_onCancel() {
    this.getDocumentList();
    //this.documentlist = this.clone_temp_documentlist;
    this.edit_document_popup = false;
  }

  closeLinkDocument_Dialog() {
    var newparams = this.queryparams;
    newparams.t = 'stab_view_document';
    this.queryparams.t = 'stab_view_document';
    this.router.navigate(["/documents"], { queryParams: newparams });
    this.activateModuleTabs('stab_view_document');
    //this.ModuleService.activateModuleTabs(this.queryparams);
    this.resetTable(this.pTableComponent);
    this.display_linkdocument = false;
  }
  resetTable(ptable, filter?) {
    ptable.reset();
    // this.dataTableComponent.reset();
    this.doc_filter_txt = "";
    this.lnkdoc_filter_txt = "";
    this.pTableComponent.reset();
    if (filter == '1') {
      $("#pop_filter").focus();
    }
    else {
      $("#doc_filter").focus();
    }


  }

  GetLnkDocVersion(number, data) {
    var items: number[] = [];
    this.doccount = _.cloneDeep(data.version);
    for (var i = 1; i <= number; i++) {
      items.push(i);
    }
    var items1: number[] = [];
    items = _.find(this.clone_temp_lnkdocumentlist, (c) => {
      if (c.linkDoc == data.linkDoc) {
        items1.push(c.version)
      }
    });
    items = items;
    var array = _.sortBy(items1, function (num) {
      return num;
    });
    return array.reverse()
  }

  LnkDoc_versionChange(rowData, index, version) {
    var vdoc = _.cloneDeep(this.clone_temp_lnkdocumentlist);
    rowData = _.filter(vdoc, (d) => {
      return (d.version == rowData.version && d.linkDoc == rowData.linkDoc);
    });
    _.forEach(rowData, (d) => {
      d.docDate = (d.docDate != null && d.docDate != "") ? moment(d.docDate).format(this.dateformat.date_Format) : '';

    });
    if (!_.isEmpty(rowData)) {
      this.link_documentlist[index] = rowData[0];
    }
    else {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "File Does not Exist" });
    }
  }
}
