import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { AppConstant } from '../../app.constant';
import { LocalStorageService } from '../../shared/local-storage.service';
@Injectable()
export class CompanyService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  companybase : string;
  cpDefaultUrl : string;
  cpDefaultUpdateUrl : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.companybase = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMPANY.BASE; 
    this.cpDefaultUrl = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMPANY.CPDEFAULT; 
    this.cpDefaultUpdateUrl = this.appendpoint + AppConstant.API_CONFIG.API_URL.COMPANY.CPDEFAULT; 
   }
   public getAll(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.companybase , data)
      .then(data => {
        return data;
      });
  }
  public getStorageList(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.companybase +"/GetServices" , data)
      .then(data => {
        return data;
      });
  }
  public getById(data: any): Promise<any> {
    return this.httpService.globalPostService(this.companybase +"/GetById", data)
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
  public updateCpDefault(data: any): Promise<any> {
    return this.httpService.globalPostService(this.cpDefaultUrl , data)
      .then(data => {
        return data;
      });
  }

  public updateChanges(data: any): Promise<any> {
    
    return this.httpService.globalPostService(this.companybase + "/Update" , data)
      .then(data => {     
        return data;
      });
  }

}
