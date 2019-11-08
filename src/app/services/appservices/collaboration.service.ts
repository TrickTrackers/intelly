import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AppConstant } from '../../app.constant';
@Injectable()
export class CollaborationService {
  appSettings: any = appSettings;
  api_url: string;
  appendpoint: string;
  collaborationbase: string;

  constructor(private httpService: CommonHttpService, private commonHttpService: CommonHttpService, private localStorageService: LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.collaborationbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.COLLABORATION.BASE;
  }
  public AddUpdateNotes(data: any): Promise<any> {
    return this.httpService.globalPostService(this.collaborationbase + "/AddUpdateNotes", data)
      .then(data => {
        return data;
      });
  }
}
