import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AppConstant } from '../../app.constant';
@Injectable()
export class MessagesService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  messagesbase : string;
  cpDefaultUrl : string;
  cpDefaultUpdateUrl : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.messagesbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.MESSAGES.BASE; 
    //this.cpDefaultUrl = this.appendpoint + AppConstant.API_CONFIG.API_URL.MESSAGES.CPDEFAULT; 
    //this.cpDefaultUpdateUrl = this.appendpoint + AppConstant.API_CONFIG.API_URL.MESSAGES.CPDEFAULT; 
   }
   public getAll(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.messagesbase , data)
      .then(data => {
        return data;
      });
  }
  public getCpDefault(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.cpDefaultUrl , data)
      .then(data => {
        return data;
      });
  }
  
  public updateChanges(data: any): Promise<any> {
    return this.httpService.globalPostService(this.messagesbase , data)
      .then(data => {     
        return data;
      });
  }

}
