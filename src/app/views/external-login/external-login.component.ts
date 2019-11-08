import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonAppService } from '../../services/appservices/common-app.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AppConstant } from '../../app.constant'; 3
import { Spinkit } from '../../ng-http-loader/spinkits';
import * as _ from 'lodash';
import { DbGroupService } from '../../services/appservices/dbChatService';

@Component({
  selector: 'app-external-login',
  templateUrl: './external-login.component.html',
  styleUrls: ['./external-login.component.scss']
})
export class ExternalLoginComponent implements OnInit {
  public spinkit = Spinkit;
  queryparams: any = {};
  constructor(private commonAppService: CommonAppService, private LocalStorageService: LocalStorageService, private messageService: MessageService,
    private router: Router, private ActivatedRoute: ActivatedRoute, private DbGroupService: DbGroupService) { }

  ngOnInit() {
    this.ActivatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.u != undefined && queryParams.u != null && queryParams.p != undefined && queryParams.p != null && queryParams.iscpmp != undefined && queryParams.iscpmp != null) {
        var externallogindata = {
          username: queryParams.u,
          password: queryParams.p,
          pinId: null,
          isPin: false,
          isCpMp: true,
        }
        if (!_.isEmpty(externallogindata)) {
          this.upLoginMethod(externallogindata)
        }
      };
    })
  }
  public upLoginMethod(req) {
    this.commonAppService.upLogin(req, "up_user")
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result) {
                var userinfo = result.userinfo;
                // var legoinfo = result.group_info.group_info;
                var companyinfo = result.group_info.company_info[0];
                var preferenceSettings = result.group_info.prefer_info[0];
                var emp_info = result.group_info.emp_info[0];
                userinfo.displayName = userinfo.given_name;
                userinfo.username = emp_info.UserName;
                if (result.group_info.emp_info) {
                  var employeeInfo: any = result.group_info.emp_info[0];
                  userinfo.displayName = employeeInfo.FirstName + " " + employeeInfo.LastName;
                }
                //  userinfo.username = this.upLoginForm.controls['username'].value;
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO, userinfo);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO, companyinfo);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel, companyinfo.DfMdls);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, companyinfo.DfMdls);
                if (userinfo.role == "up_general" || userinfo.role == "up_user" || userinfo.role == "up_manager") {
                  if (!_.isEmpty(preferenceSettings)) {
                    this.commonAppService.configurePreferenceSettings(preferenceSettings);
                  }
                  if (preferenceSettings.defaultTab != null && preferenceSettings.defaultTab != undefined && preferenceSettings.defaultTab != 0) {
                    this.queryparams.initMode = 'init';
                    this.router.navigate(['/home'], { queryParams: this.queryparams });
                   // this.DbGroupService.init();
                  }
                  else {
                    this.router.navigate(['/home'], { queryParams: this.queryparams });
                    //this.DbGroupService.init();
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


}
