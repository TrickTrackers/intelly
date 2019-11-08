import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';


@Injectable()
export class UPPreferenceService {
  appSettings: any = appSettings;
  api_url: string;
  appendpoint: string;
  preferencebase: string;
  smsbase: string;
  companyMsgSettingsUrl: string;
  constructor(private httpService: CommonHttpService, private LocalStorageService: LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.preferencebase = this.appendpoint + AppConstant.API_CONFIG.API_URL.BOOKMARK.BASE;
    this.smsbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.SMS.BASE;
    this.companyMsgSettingsUrl = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMPANY.BASE;
  }
  public updatePreference(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preferencebase + "/UpdatePreferences", data)
      .then(data => {
        return data;
      });
  }
  public sendmessage(data: any): Promise<any> {
    return this.httpService.globalPostService(this.smsbase + "/SendEmail", data)
      .then(data => {
        return data;
      });
  }

  public GetCompanyLables(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preferencebase + "/GetCompanyLables", data)
      .then(data => {
        return data;
      });
  }

  public addupdatecmplabel(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preferencebase + "/AddUpdateCompanyLabel", data)
      .then(data => {
        return data;
      });

  }

  public DeleteLabel(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preferencebase + "/DeleteCompanyLabel", data)
      .then(data => {
        return data;
      });
  }
  public getMessageSettings(data: any): Promise<any> {
    return this.httpService.globalPostService(this.companyMsgSettingsUrl + "/GetCompanyDefaultSettings", data)
      .then(data => {
        return data;
      })
      .catch(error => {
        return error;
      })
  }
}
