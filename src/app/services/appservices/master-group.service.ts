import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AppConstant } from '../../app.constant';
@Injectable()
export class MasterGroupService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  groupbase : string;
  employeebase1 : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) { 
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.groupbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.MASTERGROUP.BASE;
  }
  public GetAll(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/GetAll" , data)
      .then(data => {
        return data;
      });
  }
  public GetGroup(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/GetGroup" , data)
      .then(data => {
        return data;
      });
  }
  public Add(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/AddGroup" , data)
      .then(data => {
        return data;
      });
  }
  public Update(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/UpdateGroup" , data)
      .then(data => {
        return data;
      });
  }
  public Delete(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/DeleteGroup" , data)
      .then(data => {
        return data;
      });
  }
  public getModule(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/Getlegos" , data)
      .then(data => {
        return data;
      });
  } 
  public UpdateRights(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/UpdateRights" , data)
      .then(data => {     
        return data;
      });
  }
  public DeleteGroupMember(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/DeleteGroupMember" , data)
      .then(data => {     
        return data;
      });
  }
}
