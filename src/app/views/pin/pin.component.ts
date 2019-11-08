import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonAppService } from '../../services/appservices/common-app.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AppConstant } from '../../app.constant';
import { Spinkit } from '../../ng-http-loader/spinkits';
import * as _ from 'lodash';
import * as CryptoJS from 'crypto-js';
import { DbGroupService } from '../../services/appservices/dbChatService';
/**
 * User can login using pinmodule (desktop shortcut)
 * @export
 * @class PinComponent
 * @implements OnInit
 */
@Component({
  selector: 'app-pin',
  templateUrl: './pin.component.html',
  styleUrls: ['./pin.component.scss']
})
export class PinComponent implements OnInit {
  /**
   * declare Spinkit loader
   * @memberof PinComponent
   */
  public spinkit = Spinkit;
  /**
   * assign if dialog box open or not
   * @type boolean
   * @memberof PinComponent
   */
  display: boolean = false;
  /**
   * assign preference settings datas
   * @type *
   * @memberof PinComponent
   */
  preferenceSettings: any;

  activePinUrl: string = "";
  /**
   * Creates an instance of PinComponent.
   * @param  {CommonAppService} commonAppService common module services
   * @param  {LocalStorageService} LocalStorageService localstorage service 
   * @param  {MessageService} messageService  display warning error messages
   * @param  {Router} router configure the router 
   * @param  {ActivatedRoute} ActivatedRoute configure the router
   * @memberof PinComponent 
   */
  constructor(private commonAppService: CommonAppService, private LocalStorageService: LocalStorageService, private messageService: MessageService,
    private router: Router, private ActivatedRoute: ActivatedRoute, public readonly DbGroupService: DbGroupService) { }

  /**
   * pin component initialization 
   * @return {void}@memberof PinComponent
   */
  ngOnInit() {
    this.ActivatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.uname != undefined && queryParams.uname != null && queryParams.upwd != undefined && queryParams.upwd != null && queryParams.pinid != undefined && queryParams.pinid != null) {
        var isReLogin: boolean = false;
        var pinlogindata = {
          username: queryParams.uname,
          password: queryParams.upwd,
          pinId: queryParams.pinid,
          isPin: true,
          isCpMp: false,
          isReLogin: isReLogin,
        }
        if (!_.isEmpty(queryParams.relogin)) {
          pinlogindata.username = this.commonAppService.decryptdata(queryParams.uname);
          pinlogindata.password = this.commonAppService.decryptdata(queryParams.upwd);
          pinlogindata.isReLogin = true
        }
        if (!_.isEmpty(pinlogindata)) {
          this.checkMouduleActive(pinlogindata)
        }
      };
    })
  }
  /**
   * login method call the api
   * @param  {any} req request the 
   * @return {void}@memberof PinComponent
   */
  public upLoginMethod(req) {
    this.commonAppService.upLogin(req, "up_user")
      .then(res => {
        //console.log("login response", res);
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              // this.DbGroupService.init();
              var result = res.result;
              if (result) {
                var userinfo = result.userinfo;
                // var legoinfo = result.group_info.group_info;
                var companyinfo = result.group_info.company_info[0];
                var preferenceSettings = result.group_info.prefer_info[0];
                var emp_info = result.group_info.emp_info[0];
                userinfo.displayName = userinfo.given_name;
                var pinUrl = (emp_info.pinUrl != undefined && emp_info.pinUrl != null && emp_info.pinUrl != "") ? emp_info.pinUrl : null;
                userinfo.username = result.group_info.emp_info[0].UserName;
                if (result.group_info.emp_info) {
                  var employeeInfo: any = result.group_info.emp_info[0];
                  userinfo.displayName = employeeInfo.FirstName + " " + employeeInfo.LastName;
                }
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO, userinfo);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO, companyinfo);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel, companyinfo.DfMdls);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, companyinfo.DfMdls);
                if (userinfo.role == "up_general" || userinfo.role == "up_user" || userinfo.role == "up_manager") {
                  if (req.isPin == true) {
                    if (!_.isEmpty(pinUrl)) {
                      // call to store the PreferenceSettings code here
                      if (!_.isEmpty(preferenceSettings)) {
                        this.commonAppService.configurePreferenceSettings(preferenceSettings);
                      }
                      this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
                      var decoredURL = this.commonAppService.serializeURLParams(pinUrl);

                      var defaultTab = this.preferenceTabName();
                      var t_param = this.preferenceTabParam(defaultTab);
                      // var tab = "/submodule";
                      // var newqueryparams = {
                      //   lId: '80522',
                      //   pId: '80517',
                      //   lLvl: '1',
                      //   pos: '2',
                      //   mode: 'T',
                      //   t: 'submodules',
                      // }
                      //decoredURL.params.lId

                      decoredURL.params.t = t_param;

                      // console.log(`default tab:` + defaultTab);
                      // console.log(`queryParams:` + decoredURL.params);
                      this.router.navigate([defaultTab], { queryParams: decoredURL.params });
                      //this.DbGroupService.init();
                    }
                  }
                }
                else {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: "you are not authorized" });
                }
              }
            }
            else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: "Incorrect Username/Password." });
              return false;
            }
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");
      });
  }
  /**
   * checking the current pin module is active or not
   * @param  {any} req request from api
   * @return {void}@memberof PinComponent
   */
  public checkMouduleActive(req) {
    var pinlogindata = _.cloneDeep(req);
    var pinreq = {
      encryPinId: req.pinId
    }
    this.commonAppService.getMouduleStatus(pinreq)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              if (res.result) {
                var moduleStatus = res.result[0].isDeleted
                if (moduleStatus != null && moduleStatus != undefined && moduleStatus == false) {
                  $("body").addClass('pinmodule');
                  //clear all localstorage datas 
                  this.LocalStorageService.clearAllItem();
                  this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.ISPIN, true);
                  this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.PINID, req.pinId);
                  this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.PINMODULEID, res.result[0].moduleId);
                  this.upLoginMethod(pinlogindata);
                }
                else {
                  this.display = true;
                  // this.messageService.add({ severity: 'error', summary: 'Error', detail: "The module has been deleted." });
                  // setTimeout(function () {
                  // this.router.navigate(['/user-login']);
                  // }, 100); 
                }
              }
            }
            else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: "Pin module status failed." });
              return false;
            }
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
            return false;
          }
        }
      }, error => {
        //console.log("Error Happend");
      });
  }
  /**
   * close the current acitve tab in browser.
   * @return {void}@memberof PinComponent
   */
  closeCurrentTab() {
    window.open('', '_self').close();
  }

  preferenceTabName() {
    var path = "submodule";
    if (this.preferenceSettings.defaultTab != null && this.preferenceSettings.defaultTab != undefined && this.preferenceSettings.defaultTab != 0) {
      switch (this.preferenceSettings.defaultTab) {
        case 1:
          path = "submodule";
          break;
        case 2:
          path = "workflow";
          break;
        case 3:
          path = "connections";
          break;
        case 4:
          path = "documents";
          break;
        case 5:
          path = "collaboration";
          break;
        case 6:
          path = "strategy";
          break;
        case 7:
          path = "assessment";
          break;
        case 8:
          path = "performance";
          break;
        case 9:
          path = "details";
          break;
      }
    }
    return path;
  }
  preferenceTabParam(path) {
    var tab_param = "submodules";
    switch (path) {
      case 'submodule':
        tab_param = "submodules";
        break;
      case 'workflow':
        tab_param = (this.preferenceSettings.isBoardDefault == false) ? "tasks" : "boards";
        break;
      case 'documents':
        tab_param = "stab_view_document";
        break;
      case 'strategy':
        tab_param = "stab_strategy_summary";
        break;
      case 'assessment':
        tab_param = "stab_assessment_summary";
        break;
      case 'performance':
        tab_param = "stab_performance_metrics";
        break;
      case 'connections':
        tab_param = "connections";
        break;
      case 'details':
        //tab_param = "stab_details_processinfo";
        tab_param = "stab_details_uemplist";
        break;
      case 'collaboration':
        tab_param = "stab_collaboration_notes";
        break;
    }
    return tab_param;
  }
}
