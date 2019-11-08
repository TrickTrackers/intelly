import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { CommonAppService } from './common-app.service'
import { AppConstant } from '../../app.constant';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/observable';

@Injectable()
export class NotificationService {
  appSettings: any = appSettings;
  api_url: string;
  appendpoint: string;
  notificationbase: string;
  
  public dotnetDateFormat = AppConstant.API_CONFIG.DATE.dotnetDateFormat;
  public displayFormat = AppConstant.API_CONFIG.DATE.displayFormat;
  public apiFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  preferenceSettings: any = {};
  private ganttChangesSubject = new Subject<any>();
  constructor(private httpService: CommonHttpService, private LocalStorageService: LocalStorageService, private commonAppService: CommonAppService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.notificationbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.NOTIFICATION.BASE;    
  } 
  

  public sendNotification(data: any): Promise<any> {
    return this.httpService.globalPostService(this.notificationbase + "/SendTextMsg", data)
      .then(data => {
        return data;
      });
  }
}
