import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import { AppConstant } from '../../app.constant';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/observable';
import { MessageService } from 'primeng/components/common/messageservice';
import * as CryptoJS from 'crypto-js';
@Injectable()
export class CommonAppService {
  appSettings: any = appSettings;
  api_url: string;
  appendpoint: string;
  statusbase: string;
  paytypebase: string;
  accountbase: string;
  registerurl: string;
  loginurl: string;
  userinfourl: string;
  logouturl: string;
  uploginurl: string;
  upRefreshToken: string;
  empcategorybase: string;
  queryparams: any = {};
  feesdetailsurl: string;
  CpAgreementurl: string;
  CpPaymentTypeurl: string;
  CpCardTypeurl: string;
  CompanyRegistrationurl: string;
  RegisterEmployeeurl: string;
  upForgotPwdurl: string;
  upResetPwdurl: string;
  CpDefaulturl: string;
  pinmodluebase: string;
  IspinLogin: boolean;
  pinId: any;
  pinModuleId: any;
  private preferenceSubject = new Subject<any>();
  public displayFormat = AppConstant.API_CONFIG.DATE.displayFormat;
  public apiFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  key: string = AppConstant.ENCRYPTDECRIYPTKEY;
  constructor(private httpService: CommonHttpService, private LocalStorageService: LocalStorageService,
    private Router: Router, private MessageService: MessageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.statusbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMMON.StatusList;
    this.empcategorybase = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMMON.EmpCategoryList;
    this.paytypebase = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMMON.CpPayTypeList;
    this.accountbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.account.BASE;
    this.registerurl = this.accountbase + AppConstant.API_CONFIG.API_URL.account.REGISTER;
    this.loginurl = this.api_url + AppConstant.API_CONFIG.M_CONNECT_URL + AppConstant.API_CONFIG.API_URL.UP_Login;
    this.userinfourl = this.api_url + AppConstant.API_CONFIG.M_CONNECT_URL + AppConstant.API_CONFIG.API_URL.UP_userinfo;
    this.logouturl = this.accountbase + AppConstant.API_CONFIG.API_URL.account.LOGOUT;
    this.uploginurl = this.accountbase + AppConstant.API_CONFIG.API_URL.account.LOGIN;
    this.upRefreshToken = this.accountbase + AppConstant.API_CONFIG.API_URL.account.REFRESHTOKEN;
    this.feesdetailsurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.CPFEESDETAILS.BASE;
    this.CpAgreementurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.CPAGREEMENT.BASE;
    this.CpPaymentTypeurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.CPPAYMENTTYPE.BASE;
    this.CpCardTypeurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.CPCARDTYPE.BASE;
    this.CompanyRegistrationurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.account.BASE;
    this.RegisterEmployeeurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.account.BASE;
    this.upForgotPwdurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.account.BASE;
    this.upResetPwdurl = this.appendpoint + AppConstant.API_CONFIG.API_URL.account.BASE;
    this.CpDefaulturl = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMPANY.CPDEFAULT;
    this.pinmodluebase = this.appendpoint + AppConstant.API_CONFIG.API_URL.PINMODULE.BASE;
  }
  public Login(data, role): Promise<any> {
    let formData: FormData = new FormData();
    formData.append('grant_type', AppConstant.API_CONFIG.IDENTITY_CONFIG.GRAND_TYPE);
    formData.append('username', data.controls["username"].value);
    formData.append('password', data.controls["password"].value);
    formData.append('scope', AppConstant.API_CONFIG.IDENTITY_CONFIG.SCOPE);
    formData.append('client_id', AppConstant.API_CONFIG.IDENTITY_CONFIG.CLIENTID);
    formData.append('client_secret', AppConstant.API_CONFIG.IDENTITY_CONFIG.CLIENTSECRET);
    formData.append('l_t', "U");
    return this.httpService.globalPostService(this.api_url + AppConstant.API_CONFIG.M_CONNECT_URL + AppConstant.API_CONFIG.API_URL.UP_Login, formData)
      .then((data: any) => {
        if (data != null) {
          if (data.access_token != null) {
            // this.LocalStorageService.clearAllItem();

            //remove
            this.LocalStorageService.removeAllExtItems();
            // remove
            this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN, data.access_token);
            this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_TYPE, data.token_type);
            this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_EXPIRES, data.expires_in);
            this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.ROLE, role);
            //this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.IS_ACTINGCP, false);
            this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO, "{}");
            this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.IS_ACTINGUP, false);
          }
        }
        return data;
      });
  }

  public refreshToken(): Promise<any> {
    var authToken: any = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN);
    var userinfo: any = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    if (!_.isEmpty(userinfo)) {
      let formData = {
        grant_type: AppConstant.API_CONFIG.IDENTITY_CONFIG.GRAND_TYPE,
        username: userinfo.username,
        password: "",
        pinId: 0,
        isPin: false,
        isCpMp: false,
        isReLogin: false,
        scope: AppConstant.API_CONFIG.IDENTITY_CONFIG.SCOPE,
        client_id: AppConstant.API_CONFIG.IDENTITY_CONFIG.CLIENTID,
        client_secret: AppConstant.API_CONFIG.IDENTITY_CONFIG.CLIENTSECRET,
        l_t: "U"
      };
      return this.httpService.globalPostService(this.upRefreshToken, formData)
        .then((resData: any) => {
          if (resData != null) {
            if (resData.result != null) {
              var token = resData.result;
              if (token) {
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN, token.access_token);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_TYPE, token.token_type);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_EXPIRES, token.expires_in);
              }
            }
          }
          return resData;
        });
    }
  }
  public upLogin(data, role): Promise<any> {
    let formData = {
      grant_type: AppConstant.API_CONFIG.IDENTITY_CONFIG.GRAND_TYPE,
      username: data.username,
      password: data.password,
      pinId: data.pinId,
      isPin: data.isPin,
      isCpMp: data.isCpMp,
      isReLogin: (data.isReLogin != undefined && data.isReLogin != null ? data.isReLogin : false),
      scope: AppConstant.API_CONFIG.IDENTITY_CONFIG.SCOPE,
      client_id: AppConstant.API_CONFIG.IDENTITY_CONFIG.CLIENTID,
      client_secret: AppConstant.API_CONFIG.IDENTITY_CONFIG.CLIENTSECRET,
      l_t: "U"
    };
    return this.httpService.globalPostService(this.uploginurl, formData)
      .then((resData: any) => {
        if (resData != null) {
          if (resData.result != null) {
            // this.LocalStorageService.clearAllItem();
            var token = resData.result.tokenobj;
            //remove
            if (token) {
              this.LocalStorageService.removeAllExtItems();
              // remove
              this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN, token.access_token);
              this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_TYPE, token.token_type);
              this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_EXPIRES, token.expires_in);
              this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.ROLE, role);
              //this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.IS_ACTINGCP, false);
              this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO, "{}");
              this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.IS_ACTINGUP, false);

            }

          }
        }
        return resData;
      });
  }

  public LoginCpToMp() {

    // this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN, data.access_token);
    // this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_TYPE, data.token_type);
    // this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_EXPIRES, data.expires_in);
    // this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.ROLE, role);
    // this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.IS_ACTINGCP, false);

  }
  public getUserInfo(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.userinfourl, data)
      .then(data => {
        return data;
      });
  }
  public getCpFeesDetails(data: any): Promise<any> {
    return this.httpService.globalGetService(this.feesdetailsurl, data)
      .then(data => {
        return data;
      });
  }

  public cpCompanyRegistration(data: any): Promise<any> {
    return this.httpService.globalPostService(this.CompanyRegistrationurl + "/registercompany", data) // + "/registercompany"
      .then(data => {
        return data;
      });
  }

  public findUserNameAndEmail(data: any): Promise<any> {
    return this.httpService.globalPostService(this.CompanyRegistrationurl + "/findUserNameAndEmail", data) // + "/registercompany"
      .then(data => {
        return data;
      });
  }
  public RegisterEmployee(data: any): Promise<any> {
    return this.httpService.globalPostService(this.RegisterEmployeeurl + "/registeremployee", data)
      .then(data => {
        return data;
      });
  }

  public getCompanyID(data: any): Promise<any> {
    return this.httpService.globalPostService(this.CompanyRegistrationurl + "/gecompanydetails", data)
      .then(data => {
        return data;
      });
  }

  public getAll(data: any): Promise<any> {
    return this.httpService.globalGetService(this.CpAgreementurl + "/GetAll", data)
      .then(data => {
        return data;
      });
  }

  public upForgotPwd(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upForgotPwdurl + "/forgotPwd", data)
      .then(data => {
        return data;
      });
  }
  public upResetPwd(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upResetPwdurl + "/resetPassword", data)
      .then(data => {
        return data;
      });
  }

  public getPaymentType(data: any): Promise<any> {
    return this.httpService.globalGetService(this.CpPaymentTypeurl, data)
      .then(data => {

        return data;
      });
  }

  public getCPCardTypes(data: any): Promise<any> {
    return this.httpService.globalGetService(this.CpCardTypeurl, data)
      .then(data => {

        return data;
      });
  }

  public logOut(data: any): Promise<any> {
    $("#session_expireId").hide();
    var userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.IspinLogin = _.cloneDeep(this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.ISPIN));
    this.pinId = _.cloneDeep(this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PINID));
    this.pinModuleId = _.cloneDeep(this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PINMODULEID));
    var employeeId = 0;
    if (userinfo != undefined && userinfo != null) {
      employeeId = parseInt(userinfo.EmployeeId);
    }
    return this.httpService.globalGetServiceByUrl(this.logouturl, employeeId)
      .then(data => {
        // return data;
        this.makeSessionOut();
      });

  }
  public makeSessionOut() {
    var role = _.clone(this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.ROLE));
    // this.LocalStorageService.clearAllItem();
    this.LocalStorageService.removeAllExtItems();
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.ISPIN, this.IspinLogin);
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.PINID, this.pinId);
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.PINMODULEID, this.pinModuleId);
    if (this.Router.url.indexOf("/master/") >= 0) {
      this.Router.navigate(['mp-login']);
    }
    else if (this.Router.url.indexOf("/controls/") >= 0) {
      this.Router.navigate(['cp-login']);
    }
    else {
      var lId, lLvl, pos, mode;
      this.Router.routerState.root.queryParams.subscribe((params: Params) => {
        this.queryparams.lId = params['lId'];
        this.queryparams.pId = params['pId'];
        this.queryparams.lLvl = params['lLvl'];
        this.queryparams.pos = params['pos'];
        this.queryparams.mode = params['mode'];
        this.queryparams.t = params['t'];
      });
      this.Router.navigate(['user-login'], { queryParams: this.queryparams });
    }

    // switch (role) {
    //   case "cp_user": {
    //     this.Router.navigate(['cp-login']);
    //     break;
    //   }
    //   case "mp_user": {
    //     this.Router.navigate(['mp-login']);
    //     break;
    //   }
    //   default: {
    //     this.Router.navigate(['mp-login']);
    //     break;
    //   }
    // }
    return false;
  }
  // get status list
  public getStatusAll(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.statusbase, data)
      .then(data => {
        return data;
      });
  }
  public getEmpCategoryAll(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.empcategorybase, data)
      .then(data => {
        return data;
      });
  }
  public getPaytypeAll(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.paytypebase, data)
      .then(data => {
        return data;
      });
  }
  public getCpDefaults(data: any): Promise<any> {
    return this.httpService.globalPostService(this.CpDefaulturl + "/getCpDefaultValue", data)
      .then(data => {
        return data;
      });
  }
  // reference https://github.com/jigneshkhatri/primeng-treenode-preselect/blob/master/treeNodes.component.ts
  checkNode(nodes, str: string[], selectedNodes) {
    for (let i = 0; i < nodes.length; i++) {
      if ((!(nodes[i].children.length > 0))) {
        for (let j = 0; j < nodes[i].children.length; j++) {
          if (str.includes(nodes[i].children[j].id)) {
            if (!selectedNodes.includes(nodes[i].children[j])) {
              selectedNodes.push(nodes[i].children[j]);
            }
          }
        }
      }
      if (nodes[i].leaf) {
        return;
      }
      this.checkNode(nodes[i].children, str, selectedNodes);
      let count = nodes[i].children.length;
      let c = 0;
      for (let j = 0; j < nodes[i].children.length; j++) {
        if (selectedNodes.includes(nodes[i].children[j])) {
          c++;
        }
        if (nodes[i].children[j].partialSelected) nodes[i].partialSelected = true;
      }
      if (c == 0) { }
      else if (c == count) {
        nodes[i].partialSelected = false;
        if (!selectedNodes.includes(nodes[i])) {
          selectedNodes.push(nodes[i]);
        }
      }
      else {
        nodes[i].partialSelected = true;
      }
    }
  }
  //Automatically calculate the percentage for given sub_tasks
  public getCompletePercentage(startdate: any, enddate: any) { // format should be --> YYYY-MM-DD
    var percentage = 0;
    if (startdate != null && startdate != undefined && startdate != "" && startdate != "Invalid date"
      && enddate != null && enddate != undefined && enddate != "" && enddate != "Invalid date") {
      var currentdate = moment(Date.now());
      startdate = moment(startdate);
      enddate = moment(enddate);
      var actualworkdays = Math.floor(moment.duration(currentdate.diff(startdate)).asDays());
      var workdays = Math.floor(moment.duration(enddate.diff(startdate)).asDays());
      if (workdays > 0) {
        percentage = Math.floor(((actualworkdays / workdays) * 100));
        percentage = (percentage < 100) ? percentage : 100;
      }
      if (startdate.toString() == enddate.toString()) {
        percentage = 100;
      }
    }
    return percentage;
  }
  // configure Preference Settings and store the localstorage method code here.
  public configurePreferenceSettings(preferenceData: any) {
    var preferenceSettings: any = {
      defaultMouseClick: (preferenceData.defaultMouseClick == 1) ? true : false,
      displayMenu: (preferenceData.displayMenu == 1) ? true : false,
      defaultDocAccess: (preferenceData.defaultDocAccess != null && preferenceData.defaultDocAccess != undefined) ? preferenceData.defaultDocAccess : 0,
      docAccessType: (preferenceData.docAccessType == 1) ? true : false,
      languageDefault: "english",
      isPriority: (preferenceData.isPriority == 1) ? true : false,
      isBoardDefault: (preferenceData.isBoardDefault == 1) ? true : false,
      taskDefaultFilter: (preferenceData.taskDefaultFilter != null && preferenceData.taskDefaultFilter != undefined) ? preferenceData.taskDefaultFilter : 1,
      defaultModel: (preferenceData.defaultModel != null && preferenceData.defaultModel != undefined) ? preferenceData.defaultModel : 0,
      defaultModule: (preferenceData.defaultModule != null && preferenceData.defaultModule != undefined) ? preferenceData.defaultModule : 0,
      defaultTab: (preferenceData.defaultTab != null && preferenceData.defaultTab != undefined) ? preferenceData.defaultTab : 0,
      date_Format: (preferenceData.date_Format != null && preferenceData.date_Format != undefined) ? preferenceData.date_Format : 'MM/DD/YYYY',
      labelId: (preferenceData.labelId != null && preferenceData.labelId != undefined) ? preferenceData.labelId : 0,

      ganttScale: (preferenceData.ganttScale != null && preferenceData.ganttScale != undefined && preferenceData.ganttScale != "" ? preferenceData.ganttScale : 1),
      isGanttExpand: (preferenceData.isGanttExpand != null && preferenceData.isGanttExpand != undefined && preferenceData.isGanttExpand != "" ? preferenceData.isGanttExpand : 0),
      isEnableText: (preferenceData.isEnableText != null && preferenceData.isEnableText != undefined ? preferenceData.isEnableText : false),
      isEnableEmail: (preferenceData.isEnableEmail != null && preferenceData.isEnableEmail != undefined ? preferenceData.isEnableEmail : false)
    };
    if (preferenceSettings.defaultModel != 0) {
      this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel, preferenceSettings.defaultModel);
    }
    if (preferenceSettings.defaultModule != 0) {
      this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, preferenceSettings.defaultModule);
    }
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS, preferenceSettings);
    this.setPreferenceSettings(preferenceSettings);
  }
  setPreferenceSettings(preferenceChanges: any): void {
    this.preferenceSubject.next(preferenceChanges);
  }
  getPreferenceSettings(): Observable<any> {
    return this.preferenceSubject.asObservable();
  }
  serializeURLParams(url: string) {
    let response = {
      hashvalue: '',
      params: {}
    }
    let result: any = {};
    if (url.indexOf("?") == -1)
      return (result);
    var hashPairs = url.split("?")[0].split('/');
    if (hashPairs.length > 0) {
      response.hashvalue = hashPairs[hashPairs.length - 1];
    }
    var pairs = url.split("?")[1].split('&');
    _.forEach(pairs, (pairvalue: any) => {
      pairvalue = pairvalue.split('=');
      var name = decodeURI(pairvalue[0])
      var value = decodeURI(pairvalue[1])
      if (name.length) {
        if (result[name] !== undefined) {
          if (!result[name].push) {
            result[name] = [result[name]];
          }
          result[name].push(value || '');
        } else {
          result[name] = value || '';
        }
      }

    });
    response.params = result;
    return (response)
  }
  //Save pinmodule details.
  public saveUpdatePinmodule(data: any): Promise<any> {
    return this.httpService.globalPostService(this.pinmodluebase + "/SaveUpdatePinmodule", data)
      .then(data => {
        return data;
      });
  }

  //Save pinmodule details.
  public getMouduleStatus(data: any): Promise<any> {
    return this.httpService.globalPostService(this.pinmodluebase + "/GetModuleStatus", data)
      .then(data => {
        return data;
      });
  }
  public detechBrowserCompatibility() {
    var objappVersion = navigator.appVersion;
    var objAgent = navigator.userAgent;
    var objbrowserName = navigator.appName;
    var objfullVersion = '' + parseFloat(navigator.appVersion);
    var objBrMajorVersion = parseInt(navigator.appVersion, 10);
    var objOffsetName, objOffsetVersion, ix;
    // In Chrome /Opera|OPR\//
    if (((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) && (objAgent.indexOf("Opera") == -1) && (objAgent.indexOf("OPR") == -1)) {
      objbrowserName = "Chrome";
      objfullVersion = objAgent.substring(objOffsetVersion + 7);
    } // In Microsoft internet explorer
    else if ((objOffsetVersion = objAgent.indexOf("MSIE ")) != -1 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      objbrowserName = "Microsoft Internet Explorer";
      objfullVersion = objAgent.substring(objOffsetVersion + 5);
    }
    // In Firefox 
    else if ((objOffsetVersion = objAgent.indexOf("Firefox")) != -1) {
      var res = objAgent.split("/");
      if (res.length) {
        objBrMajorVersion = parseInt(res[res.length - 1]);
      }
      objbrowserName = "Firefox";
    }
    // In Opera 
    else if ((objAgent.indexOf("Opera") == -1) || (objAgent.indexOf("OPR") == -1)) {
      objbrowserName = "Opera";
      objOffsetVersion = objAgent.match(/Opera|OPR\//).index
      objfullVersion = objAgent.substring(objOffsetVersion + 4, objOffsetVersion + 8)
    }
    // In Safari 
    else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
      objbrowserName = "Safari";
      objfullVersion = objAgent.substring(objOffsetVersion + 7);
      if ((objOffsetVersion = objAgent.indexOf("Version")) != -1)
        objfullVersion = objAgent.substring(objOffsetVersion + 8);
    }
    // For other browser "name/version" is at the end of userAgent
    else if ((objOffsetName = objAgent.lastIndexOf(' ') + 1) < (objOffsetVersion = objAgent.lastIndexOf('/'))) {
      objbrowserName = objAgent.substring(objOffsetName, objOffsetVersion);
      objfullVersion = objAgent.substring(objOffsetVersion + 1);
      if (objbrowserName.toLowerCase() == objbrowserName.toUpperCase()) {
        objbrowserName = navigator.appName;
      }
    }
    // trimming the fullVersion string at semicolon/space if present
    if ((ix = objfullVersion.indexOf(";")) != -1)
      objfullVersion = objfullVersion.substring(0, ix);
    if ((ix = objfullVersion.indexOf(" ")) != -1)
      objfullVersion = objfullVersion.substring(0, ix);
    if (objbrowserName != "Firefox")
      objBrMajorVersion = parseInt('' + objfullVersion, 10);
    if (isNaN(objBrMajorVersion)) {
      objfullVersion = '' + parseFloat(navigator.appVersion);
      objBrMajorVersion = parseInt(navigator.appVersion, 10);
    }
    if ((objAgent.indexOf("Edge")) != -1) {
      objbrowserName = "Edge";
    }
    var browserUncomportable = false;
    var message = `The browser version being used is not supported.  You can continue using Intellimodz, but please be aware that there are features which may
     not work as expected.  We recommend you upgrade your browser to a supported version. 
     See Help for the listing of supported browsers`;
    switch (objbrowserName) {
      case "Chrome":
        if (objBrMajorVersion < 72) {
          browserUncomportable = true;
        }
        break;
      case "Microsoft Internet Explorer":
        var msie = objAgent.indexOf("MSIE ");
        var rv = -1;
        var version = 0;
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
        {
          if (isNaN(parseInt(objAgent.substring(msie + 5, objAgent.indexOf(".", msie))))) {
            //For IE 11 >
            if (navigator.appName == 'Netscape') {
              var ua = navigator.userAgent;
              var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
              if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1);
                objBrMajorVersion = rv;
              }
            }
            else {
              alert('otherbrowser');
            }
          }
          else {
            //For < IE11
            objBrMajorVersion = parseInt(objAgent.substring(msie + 5, objAgent.indexOf(".", msie)));
          }
        }
        if (objBrMajorVersion < 11) {
          browserUncomportable = true;
        }
        break;
      case "Firefox":
        if (objBrMajorVersion < 35) {
          browserUncomportable = true;
        }

        break;
      case "Opera":
        if (objBrMajorVersion < 50) {
          browserUncomportable = true;
        }
        break;
      case "Safari":
        if (objBrMajorVersion < 12) {
          browserUncomportable = true;
        }
        break;
      case "Edge":

        break;
      default:
        message = `The browser being used is not supported.  You can continue using Intellimodz,
       but please be aware that there are features which may not work as expected.  We recommend you use a supported browser. 
        See Help for the listing of supported browsers`;
        browserUncomportable = true;
        break;
    }
    // if (browserUncomportable) {
    //   setTimeout(() => {
    //     this.MessageService.add({ severity: 'error', summary: 'Error', detail: message });
    //   }, 1000);
    // }    
    console.log('' + 'Browser name = ' + objbrowserName, 'Full version = ' + objfullVersion + '<br>' + 'Major version = ' + objBrMajorVersion + '<br>' + 'navigator.appName = ' + navigator.appName + '<br>' + 'navigator.userAgent = ' + navigator.userAgent + '<br>')
    return browserUncomportable;
  }
  encryptdata(data, key?) {
    let encrypt = null
    if (data != undefined && data != null) {
      encrypt = CryptoJS.AES.encrypt(data.trim(), this.key).toString();
    }
    return encrypt;
  }
  decryptdata(data, key?) {
    let decrypt = null
    if (data != undefined && data != null) {
      decrypt = CryptoJS.AES.decrypt(data.trim(), this.key).toString(CryptoJS.enc.Utf8);
    }
    return decrypt;
  }
  checkPinmodule() {
    var ispin = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.ISPIN);
    ispin = ((ispin != null && ispin != undefined) ? ispin : false);
    if (ispin == true) {
      $("body").addClass('pinmodule');
    }
    else {
      $("body").removeClass('pinmodule');
    }
  }

}
