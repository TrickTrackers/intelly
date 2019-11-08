import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { CommonAppService } from './common-app.service'
import { AppConstant } from '../../app.constant';
import * as _ from 'lodash';
import * as $ from 'jquery';
import * as moment from 'moment';
@Injectable()
export class ConnectionsService {
  appSettings: any = appSettings;
  api_url: string;
  appendpoint: string;
  connectionssbase: string;

  public dotnetDateFormat = AppConstant.API_CONFIG.DATE.dotnetDateFormat;
  public displayFormat = AppConstant.API_CONFIG.DATE.displayFormat;
  public apiFormat = AppConstant.API_CONFIG.DATE.apiFormat;
  constructor(private httpService: CommonHttpService, private LocalStorageService: LocalStorageService, private commonAppService: CommonAppService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.connectionssbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.CONNECTIONS.BASE;
    
  }
  public Common(data: any): Promise<any> {
    return this.httpService.globalPostService(this.connectionssbase + "/Common", data)
      .then(data => {
        return data;
      });
  }
  public DeleteConnection(data: any): Promise<any> {
    return this.httpService.globalPostService(this.connectionssbase + "/DeleteConnection", data)
      .then(data => {
        return data;
      });
  }
  public GetHtmlDocumentFile(data: any): Promise<any> {
    return this.httpService.globalPostService(this.connectionssbase + "/GetHtmlDoc", data)
      .then(data => {
        return data;
      });
  }
}
