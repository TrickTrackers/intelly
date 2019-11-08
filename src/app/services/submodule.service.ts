import { Injectable } from '@angular/core';
import { CommonHttpService } from '../shared/common-http.service';
import { AppConstant } from '../app.constant';
import { LocalStorageService } from '../shared/local-storage.service';
import * as appSettings from '../../assets/constant.json';
@Injectable()
export class SubmoduleService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  legobase : string;
  upmodelbase: string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) { 
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.legobase = this.appendpoint + AppConstant.API_CONFIG.API_URL.LEGO.BASE; 

    this.upmodelbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.UPMODEL.BASE; 
  }
  public AddLego(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/Add" , data)
      .then(data => {
        return data;
      });
  } 
  public getChildrenToModel(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/getChildrenToModel" , data)
      .then(data => {
        return data;
      });
  }
  
  public GetAllLegos(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/GetAllLegos" , data)
      .then(data => {
        return data;
      });
  }
  public getModelChildren(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/GetModelChildren" , data)
      .then(data => {
        return data;
      });
  }
  public getChildren(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/GetChildren" , data)
      .then(data => {
        return data;
      });
  } 

  
  public GetModuleRights(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upmodelbase + "/CheckRights" , data)
      .then(data => {
        return data;
      });
  }
  public GetDirectoryIconList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/GetDirectoryIconList" , data)
      .then(data => {
        return data;
      });
  }
  public setLegoIcons(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/setLegoIcons" , data)
      .then(data => {
        return data;
      });
  }
  public changeLegoIcons(data: any): Promise<any> {
    return this.httpService.globalPostService(this.legobase + "/changeLegoIcons" , data)
      .then(data => {
        return data;
      });
  }
}


