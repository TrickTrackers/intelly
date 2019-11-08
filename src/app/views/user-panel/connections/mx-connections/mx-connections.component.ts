import { Component, OnInit, AfterViewChecked, OnDestroy, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as _ from 'lodash';
import { ConnectionsService } from '../../../../services/appservices/connections.service';
import { AppConstant } from '../../../../app.constant';
import { LocalStorageService } from '../../../../shared/local-storage.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { MessageService } from 'primeng/components/common/messageservice';
import { ModuleService } from '../../../../services/module.services';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { CommonAppService } from '../../../../services/appservices/common-app.service';
import * as moment from 'moment';
@Component({
  selector: 'app-mx-connections',
  templateUrl: './mx-connections.component.html',
  styleUrls: ['./mx-connections.component.css']
})
export class MxConnectionsComponent implements OnInit, AfterViewChecked, OnDestroy, AfterViewInit {
  mxeditor_url: SafeResourceUrl;
  mxviewer_url: SafeResourceUrl;
  operationalRights: string = "Readonly"; // avaiable rights: "Unrestricted" "Readonly"
  selectedModelId: any;
  selectedModuleId: any;
  userinfo: any;
  companyId: any;
  employeeId: any;
  graphEditable: boolean = false;
  fullview_display: boolean = false;
  confirmdelete_display: boolean = false;
  drawingname = "New Connection";
  connectionList: any = [];
  showiframe_popup = false;
  iframe_popup_url: any = "";
  private _subscriptions = new Subscription();
  checkrights: any = [];
  queryparams: any = [];
  hasRights: boolean;
  temp_connectionName = "";
  public isRefModule = false;
  public date_dispayformat: any = [];

  constructor(public sanitizer: DomSanitizer, public LocalStorageService: LocalStorageService, public ConnectionsService: ConnectionsService,
    public ConfirmationService: ConfirmationService, private MessageService: MessageService
    , public ModuleService: ModuleService, private router: Router, private CommonAppService: CommonAppService) {
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.isRefModule = this.ModuleService.checkIsRefmodule();
    if (this.userinfo != undefined && this.userinfo != null) {
      this.companyId = parseInt(this.userinfo.CompanyId);
      this.employeeId = parseInt(this.userinfo.EmployeeId);
    }
    this.date_dispayformat = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.initSubscribe();
    this._subscriptions.add(
      this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
        this.date_dispayformat.date_Format = preferencesettings.date_Format;
        this.getConnectionList();
      }));
    window.addEventListener("storage", this.handleStorageEvent);
  }
  private handleStorageEvent = (event: StorageEvent): void => {
    var newdrawingname = sessionStorage.getItem("connetionName");
    if (!event.key.startsWith("connetionName") || newdrawingname == "") {
      return;
    }
    if (this.drawingname != newdrawingname && newdrawingname != "") {
      this.drawingname = newdrawingname;
      sessionStorage.setItem("connetionName", "");
    }

  }
  getConnectionList() {
    this.connectionList = [];
    var req = {
      legoId: this.selectedModuleId,
      employeeId: this.employeeId,
      options: 1
    };
    this.ConnectionsService.Common(req).then((res: any) => {
      if (res) {
        if (res.status) {
          this.formatConnections(res.result);
        }
      }
    });
  }
  formatConnections(connectionslist) {
    var xmlbaseurl = AppConstant.API_ENDPOINT + AppConstant.FILE_LOCATION.Connection + "/" + this.selectedModelId + "/" + this.selectedModuleId;
    var htmlbaseurl = AppConstant.API_ENDPOINT + AppConstant.FILE_LOCATION.ConnectionFilesPath + "/" + this.selectedModelId + "/" + this.selectedModuleId;
    this.connectionList = _.map(connectionslist, (connections: any) => {
      connections.xmlurl = this.sanitizer.bypassSecurityTrustResourceUrl(xmlbaseurl + '/' + connections.connection_name + ".xml");
      connections.htmlurl = this.sanitizer.bypassSecurityTrustResourceUrl(htmlbaseurl + "/" + connections.connection_name + ".html");
      return connections;
    });
    _.forEach(this.connectionList, (c) => {
      c.createddate = moment(c.createddate).format(this.date_dispayformat.date_Format);
    })
  }
  edit_chart(connection) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.connectionRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var url = "assets/mxgraph/examples/grapheditor/www/index.html?Mode=E&ModelId=" + this.selectedModelId + "&L1=&View=&TempId=&c_mode=E&name=" +
      connection.connection_name + "&con_id=" + connection.con_id;
    this.mxeditor_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.graphEditable = true;
    this.drawingname = connection.connection_name;
  }
  close_editorGraph() {
    var changed: any = sessionStorage.getItem("isgraphchanged");
    if (changed == 1 || changed == true) {
      this.ConfirmationService.confirm({
        message: 'Are you sure that you want to exit without Save?',
        accept: () => {
          this.graphEditable = false;
          this.getConnectionList();
        },
        reject: () => {

        }
      });
    }
    else {
      this.graphEditable = false;
      this.getConnectionList();
    }


  }

  ope_chart(d) {
    this.drawingname = d.title;
    this.fullview_display = true;
  }

  checkRights() {
    this.checkrights = this.ModuleService.getModuleRights();
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.lId == 'E') {
        this.hasRights = true;
      }
      else if (this.queryparams.mode != 'E' && this.checkrights.connectionRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
      if (!_.isEmpty(this.checkrights)) {
        if (this.checkrights.modelRights != 'Unrestricted') {
          this.operationalRights = this.checkrights.modelRights;
        }
        else {
          this.operationalRights = (this.checkrights.connectionRights == "Readonly" || this.checkrights.modelRights == "Readonly") ? "Readonly" : this.checkrights.connectionRights;
        }

        //   this.operationalRights = this.checkrights["moduleRights"];
      }

      //  this.operationalRights = this.checkrights["connectionRights"];
    }
  }

  ngOnInit() {
    this.initSubscribe();
  }
  ngAfterViewInit() {
    this.ModuleService.activateModuleTabs(this.queryparams);
  }
  initSubscribe() {
    this._subscriptions.add(
      this.ModuleService.getModuleRightsUpdate().subscribe(rights => {
        this.checkrights = rights;
        this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
        this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
        this.checkRights();
        this.isRefModule = this.ModuleService.checkIsRefmodule();
        this.getConnectionList();
      })
    );
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.CommonAppService.checkPinmodule();
      this.getConnectionList();
    }));

    this.checkrights = this.ModuleService.getModuleRights();
    this.checkRights();
  }
  ngOnDestroy() {
    console.log("Component will be destroyed");
    this._subscriptions.unsubscribe();
  }

  AddNewDoc() {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.connectionRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    var url = "assets/mxgraph/examples/grapheditor/www/index.html?Mode=&ModelId=" + this.selectedModelId + "&L1=&View=&TempId=&c_mode=N&name=New File&con_id=0";
    this.mxeditor_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.graphEditable = true;
    this.drawingname = "New Connection";
  }
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + 2
    );
    if ($("body").hasClass("pinmodule")) {
      res_h += 110;
    }
    //  sub tabs class: sub_tab_container
    // var h = res_h - ( $("#connection-pg .custom_menubar").innerHeight() + 20 );
    $("#connection-pg .custom_scrollpane").css("height", (res_h - 25) + "px");
  }
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
    // var newdrawingname = sessionStorage.getItem("connetionName");
    // if (this.drawingname != newdrawingname && newdrawingname != "") {
    //   this.drawingname = newdrawingname;
    //   sessionStorage.setItem("connetionName", "");
    // }
  }
  deleteConnection(Connection) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.connectionRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    this.ConfirmationService.confirm({
      message: 'Are you sure that you want to delete this connection?',
      accept: () => {
        var req = Connection;
        req.options = 6;
        req.modelId = this.selectedModelId;
        this.ConnectionsService.DeleteConnection(req).then((res: any) => {
          if (res) {
            if (res.status == 1) {
              var index = _.findIndex(this.connectionList, (c) => {
                return (c.con_id == Connection.con_id);
              });
              this.connectionList.splice(index, 1);
            }
          }
        });
      },
      reject: () => {

      }
    });
  }
  getIFrameSanitize(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  display_fullscreen(connection) {
    this.iframe_popup_url = connection.htmlurl;
    this.temp_connectionName = connection.connection_name;
    this.showiframe_popup = true;
  }
  bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
      result += String.fromCharCode(parseInt(array[i], 2));
    }
    return result;
  }
  hideLoader() {
    $("#iframe_loader").hide();
  }
  getSafeUrl(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
