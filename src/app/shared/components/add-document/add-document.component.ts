import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { component_config } from '../../../_config';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { MasterService } from '../../../services/master.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NavigationStart, NavigationEnd, NavigationError, NavigationCancel, RoutesRecognized } from '@angular/router';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { DocumentService } from '../../../services/appservices/userpanelservices/document.service';
import { ModuleService } from '../../../services/module.services';
import { ListModuleModel } from '../../../views/user-panel/sub-module/list.moduleModel';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { ContextMenu } from 'primeng/contextmenu';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { ConfirmationService } from 'primeng/api';
import value from '*.json';
import * as moment from 'moment';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-add-document',
  templateUrl: './add-document.component.html',
  styleUrls: ['./add-document.component.css']
})

export class AddDocumentComponent implements OnInit {

  @Output() addFileOutput: EventEmitter<any> = new EventEmitter();
  @Output() exitOutput: EventEmitter<any> = new EventEmitter();
  @ViewChild('file') myInputVariable: ElementRef;
  uploadResult: any;
  treenodtreeItems: TreeNode[];
  treeItemNode: any = {};
  config;
  document_access: {};
  subscription: Subscription;
  public queryparams: any = [];
  public querystring;
  userinfo: any = [];
  companyinfo: any = [];
  formData = new FormData();
  addDocument: any = {};
  edit_document: any = {};
  documentlist: any = [];
  link_documentlist: any = [];
  temp_documentlist: any = [];
  clone_temp_documentlist: any = [];
  public ModuleTreeItems: ListModuleModel[] = [];
  addfolder_dialog: boolean = false;
  public ModuleTreeItems_popup: any = [];
  selectednodeModule: ListModuleModel[] = [];
  selectedLinkModuleItems : any =[];
  public dotnetDateFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  public bsConfig = {
    dateInputFormat: AppConstant.API_CONFIG.DATE.apiFormat,
    showWeekNumbers: false
  };
  constructor(private LocalStorageService: LocalStorageService, private router: Router, private CommonUtilityService: CommonUtilityService
    , private MasterService: MasterService, private MessageService: MessageService, public ModuleService: ModuleService
    , private cd: ChangeDetectorRef, private http: HttpClient, private DocumentService: DocumentService
    , private contextMenuService: ContextMenuService, private confirmationService: ConfirmationService) {

    this.config = component_config.cktool_config_full;
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
    //console.log("COMPANYINFO", this.companyinfo)

    this.addDocument.docDate = moment(Date.now()).format(this.dotnetDateFormat)

    var lId, lLvl, pos, mode;
    this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
    });

    //this.getAllDocumentList();
    this.getTreeModules();
    this.subscription = this.ModuleService.getModuleUpdates().subscribe(updates => {
      //console.log("Module updates(submodulepage):", updates);
      this.getTreeModules();
    });
    this.subscription = this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
      if (updates.treeModules) {
        this.ModuleTreeItems = null;
        if (updates.treeModules.cType == 'D') {
          this.ModuleTreeItems = _.cloneDeep(updates.treeModules);
        }
        else if (updates.treeModules.cType != 'E' && updates.treeModules.cType != 'D' && updates.treeModules.cType != null) {

          this.ModuleTreeItems_popup = [_.cloneDeep(updates.treeModules)];
        }
      }
    });
  }

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
    $("#document-pg .tab-content").css("height", (tabcontent_h) + "px");
    $("#document-pg .child_tabcontent").each(function () {
      $(this).css("height", (tabcontent_h - 25) + "px");
    });

  }

  ngOnInit() {

  }
  getTreeModules() {
    var selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var treemodules = this.ModuleService.getTreeModules();
    if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
      if (treemodules.length > 0) {
        var treenodes = _.cloneDeep(treemodules);
        var m = this.ModuleService.findChildModules(treenodes, null, selectedModuleId);
        this.ModuleTreeItems = m;
        this.treeItemNode = m;
        //console.log("Module Tree(submodulepage):", this.ModuleTreeItems);
        var temp_id = treenodes[0].legoId;
        var tree = this.ModuleService.findChildModules(treenodes, null, temp_id);
        this.ModuleTreeItems_popup = tree;
      }
    }
    var selectedmodelid = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var treemodules = this.ModuleService.getTreeModules();
    if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
      if (treemodules.length > 0) {
        var treenodes = _.cloneDeep(treemodules);
        var m = this.ModuleService.findChildModules(treenodes, null, selectedmodelid);
        //this.ModuleTreeItems = _.cloneDeep(treemodules);
        this.ModuleTreeItems_popup = [this.FilterDocumentEMployeeModules(m)];
        this.ModuleTreeItems_popup = this.ModuleTreeItems_popup[0];
      }
    }
  } 
  FilterDocumentEMployeeModules(module) {
    var nodes = _.cloneDeep(module);
    if (nodes.children.length > 0) {
      nodes.children = _.remove(nodes.children, (TreeItems: any) => {
        return (TreeItems.cType != 'E' && TreeItems.cType != 'D' && TreeItems.cType != null);
      });
    }
    return nodes;
  }
  Docupload(files, addDocument, selectednodeModule) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
    let uploadReq: any;
    var response = {
      status: 0,
      message: "Error",
      result: {}
    };
    //console.log('document', addDocument)
    if (files.length === 0) {
      response.status = 0;
      response.message = "Choose File/Document for upload";
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: response.message });
      return response;
    }
    if (addDocument.title == undefined || addDocument.title == null || addDocument.title == '') {
      response.status = 0;
      response.message = "Description Required";
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: response.message });
      return response;
    }
    if (addDocument.docDate == undefined || addDocument.docDate == null || addDocument.docDate == '') {
      response.status = 0;
      response.message = "Please Select the Date";
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: response.message });
      return response;
    }
    // if (addDocument.comments == undefined || addDocument.comments == null || addDocument.comments == '') {
    //   response.status = 0;
    //   response.message = "Comments Required";
    //   this.MessageService.add({ severity: 'error', summary: 'Error', detail: response.message });
    //   return response;
    // }


    var formData = new FormData();
    for (let file of files) {
      formData.append(file.name, file);
    }
    //formData.append(files[0].name, files[0]);
    //console.log("form data ", formData)
    //console.log("Files", files[0])
    if (addDocument.isCheck == undefined || addDocument.isCheck == null) {
      addDocument.isCheck = false;
    }
    //console.log("tree details", addDocument)
    addDocument.docDate = (addDocument.docDate != null && addDocument.docDate != "") ? moment(addDocument.docDate).format(this.dotnetDateFormat) : '';
    var legos = "";
    _.each(this.selectedLinkModuleItems, (l) => {
      legos += l + ","
    });
    if(addDocument.comments == null || addDocument.comments == undefined)
    {
      addDocument.comments = "";
    }
    formData.append('Title', addDocument.title);
    formData.append('Comments', addDocument.comments);
    formData.append('Date', addDocument.docDate);
    formData.append('LegoId', this.queryparams.lId);
    formData.append('CompanyId', this.userinfo.CompanyId);
    formData.append('EmpId', this.userinfo.EmployeeId);
    formData.append('UserId', this.userinfo.EmployeeId);
    formData.append('isCheck', addDocument.isCheck);
    formData.append('Type', this.queryparams.mode);
    formData.append('selectednodeModule', legos);
    formData.append('access_token', this.companyinfo.access_token);
    formData.append('service_userName', this.companyinfo.service_userName);
    formData.append('service_password', this.companyinfo.service_password);
    formData.append('share_point_url', this.companyinfo.share_point_url);
    // formData.append('service_userName', " intellimodule@intelli12.onmicrosoft.com");
    // formData.append('service_password', "Intelli123");
    // formData.append('share_point_url', "https://intelli12.sharepoint.com/sites/intellimodule");

    //this.companyinfo.Service = 'Google Drive';
    //this.companyinfo.Service = 'IntelliModz';
    //this.companyinfo.Service = 'DropBox';
    //this.companyinfo.Service = 'Share Point'; 
    //this.companyinfo.Service = 'OneDrive'; 

    switch (this.companyinfo.Service) {
      case "Share Point":
        this.DocumentService.SharepointUpload(formData) // This for Share Point Document Upload
          .then(res => {
            if (res) {
              if (!_.isEmpty(res)) {
                this.uploadResult = res;
                var msgseverity = "";
                var msgsummary = "";
                var msgdetail = "";
                switch (this.uploadResult.message) {
                  case '1':
                    msgseverity = "success";
                    msgsummary = "Success";
                    msgdetail = "File uploaded successfully.";
                    break;
                  case '2':
                    msgseverity = "error";
                    msgsummary = "Error";
                    msgdetail = "Filename already exist. Please check the version or change filename and then upload.";
                    break;
                  case '3':
                    msgseverity = "error";
                    msgsummary = "Error";
                    msgdetail = "You have no parent Logo/ module.";
                    break;
                  case '4':
                    msgseverity = "error";
                    msgsummary = "Error";
                    msgdetail = "Invalid storage path.";
                    break;
                  case '5':
                    msgseverity = "error";
                    msgsummary = "Error";
                    msgdetail = "Something went wrong. Please try again.";
                    break;
                  default:
                  msgseverity = "error";
                    msgsummary = "Error";
                    msgdetail = this.uploadResult.message;
                    break;
                }
                if (this.uploadResult.status == 1) {
                  if (this.uploadResult.result != null) {
                    this.closeModal(files, selectednodeModule);
                    this.addFileOutput.emit(this.uploadResult);
                  }
                }
                this.MessageService.clear();
                this.MessageService.add({ severity: msgseverity, summary: msgsummary, detail: msgdetail });
              }
              else {
                this.MessageService.clear();
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong. Please try again." });
                return false;
              }
            }
          }, error => {
            //console.log("Error Happend");

          })
        break;
      case "Google Drive":
        //this.uploadResult = this.DocumentService.GDriveUpload(formData);// This for Google Drive Document Upload
        this.DocumentService.GDriveUpload(formData)
          .then(res => {
            if (res) {
              if (!_.isEmpty(res)) {
                this.uploadResult = res;
                if (this.uploadResult.status == 1) {
                  if (this.uploadResult.result == "Exist") {
                    this.MessageService.add({ severity: 'error', summary: 'Error', detail: "FileName Already Exist, Please Check For New Version or Change fileName And Upload" });
                  }
                  else if (this.uploadResult.result != null) {
                    this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Uploaded" });
                    this.closeModal(files, selectednodeModule);
                    this.addFileOutput.emit(this.uploadResult);
                  }
                  //this.versiondropdown = this.MasterService.formatDataforDropdown("version", this.documentlist, "Select version");
                }
                else {
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: this.uploadResult.message });
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
        break;
      case "OneDrive":
        //this.uploadResult  = this.DocumentService.OneDriveUpload(formData); // This for One Drive Document Upload
        this.DocumentService.OneDriveUpload(formData)
          .then(res => {
            if (res) {
              if (!_.isEmpty(res)) {
                this.uploadResult = res;
                if (this.uploadResult.status == 1) {
                  if (this.uploadResult.result == "Exist") {
                    this.MessageService.add({ severity: 'error', summary: 'Error', detail: "FileName Already Exist, Please Check For New Version or Change fileName And Upload" });
                  }
                  else if (this.uploadResult.result != null) {
                    this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Uploaded" });
                    this.closeModal(files, selectednodeModule);
                    this.addFileOutput.emit(this.uploadResult);
                  }
                  //this.versiondropdown = this.MasterService.formatDataforDropdown("version", this.documentlist, "Select version");
                }
                else {
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: this.uploadResult.message });
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
        break;
      case "DropBox":
        this.DocumentService.DropBoxUpload(formData) // This for Share Point Document Upload
          .then(res => {
            if (res) {
              if (!_.isEmpty(res)) {
                this.uploadResult = res;
                if (this.uploadResult.status == 1) {
                  if (this.uploadResult.result == "Exist") {
                    this.MessageService.add({ severity: 'error', summary: 'Error', detail: "FileName Already Exist, Please Check For New Version or Change fileName And Upload" });
                  }
                  else if (this.uploadResult.result != null) {
                    this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Uploaded" });
                    this.closeModal(files, selectednodeModule);
                    this.addFileOutput.emit(this.uploadResult);
                  }
                  //this.versiondropdown = this.MasterService.formatDataforDropdown("version", this.documentlist, "Select version");
                }
                else {
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: this.uploadResult.message });
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
        break;

      default:
        if (formData != null && formData != undefined) {
          this.DocumentService.UploadDocument(formData)
            .then(res => {
              if (res) {
                if (!_.isEmpty(res)) {
                  this.uploadResult = res;
                  var msgseverity = "";
                  var msgsummary = "";
                  var msgdetail = "";
                  switch (this.uploadResult.message) {
                    case '1':
                      msgseverity = "success";
                      msgsummary = "Success";
                      msgdetail = "File uploaded successfully.";
                      break;
                    case '2':
                      msgseverity = "error";
                      msgsummary = "Error";
                      msgdetail = "Filename already exist. Please check the version or change filename and then upload.";
                      break;
                    case '3':
                      msgseverity = "error";
                      msgsummary = "Error";
                      msgdetail = "You have no parent Logo/ module.";
                      break;
                    case '4':
                      msgseverity = "error";
                      msgsummary = "Error";
                      msgdetail = "Invalid storage path.";
                      break;
                    case '5':
                      msgseverity = "error";
                      msgsummary = "Error";
                      msgdetail = "Something went wrong. Please try again.";
                      break;
                    default:
                    msgseverity = "error";
                      msgsummary = "Error";
                      msgdetail = this.uploadResult.message;
                      break;
                  }
                  if (this.uploadResult.status == 1) {
                    if (this.uploadResult.result != null) {
                      this.closeModal(files, selectednodeModule);
                      this.addFileOutput.emit(this.uploadResult);
                    }
                  }
                  this.MessageService.clear();
                  this.MessageService.add({ severity: msgseverity, summary: msgsummary, detail: msgdetail });
                }
                else {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong. Please try again." });
                  return false;
                }
              }
            }, error => {
              //console.log("Error Happend"); 
            })
        }
        break;
    }
  }
  closeModal(file, selectednodeModule) {
    var op = {
      file: null,
      adddocument: {},
      display: false,
      "selectednodeModule": selectednodeModule
    };
    this.addDocument = {};
    //this.exitOutput.emit(false);
    this.myInputVariable.nativeElement.value = "";
    this.exitOutput.emit(op);
  }
  public checkChildExist(TreeItems) {
    var exist = false;
    if (!_.isEmpty(TreeItems)) {
      if (TreeItems.children.length > 0) {
        exist = true;
      }
    }
    return exist;
  }
  public toggleExpandCollapse(TreeItems, $event) {
    if (TreeItems.expanded == true) {
      TreeItems.expanded = false;
    } else {
      TreeItems.expanded = true;
    }
  }
}
