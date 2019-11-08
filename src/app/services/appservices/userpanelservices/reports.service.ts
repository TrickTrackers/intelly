import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';
@Injectable()
export class ReportsService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  Reportbase : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.Reportbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.REPORTS.BASE;
   }
  
  public GetModuleReports(data: any): Promise<any> {
    return this.httpService.globalPostService(this.Reportbase + "/GetModuleReports" , data)
      .then(data => {
        return data;
      });
  } 
  
  public GetTaskReports(data: any): Promise<any> {
    return this.httpService.globalPostService(this.Reportbase + "/GetTaskReports" , data)
      .then(data => {
        return data;
      });
  }   

  public GetResponseReports(data: any): Promise<any> {
    return this.httpService.globalPostService(this.Reportbase + "/GetResponseReports" , data)
      .then(data => {
        return data;
      });
  }   

}
