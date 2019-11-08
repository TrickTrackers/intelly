import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';
@Injectable()
export class DetailsService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  detailsbase : string;
  
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.detailsbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.DETAILS.BASE; 
   }
  
  public GetTabChangeLog(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/GetTabChangeLog" , data)
      .then(data => {
        return data;
      });
  }  

  public UnitEmployeeList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/UnitEmployee" , data)
      .then(data => {
        return data;
      });
  }

  public AddUnitEmployeeList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/AddUnitEmployee" , data)
      .then(data => {
        return data;
      });
  }

  public updatePosition_unitList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/UpdateUnitEmployee" , data)
      .then(data => {
        return data;
      });
  }

  public DeleteUnitEmployee(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/DeleteUnitEmployee" , data)
      .then(data => {
        return data;
      });
  }

  public GetProcessInfo(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/GetProcessInfo" , data)
      .then(data => {
        return data;
      });
  }

  public UpdateJobDesc(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/UpdateJobDesc" , data)
      .then(data => {
        return data;
      });
  }

  public UpdateLego(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/UpdateLego" , data)
      .then(data => {
        return data;
      });
  }

  public GetGroupList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/GetGroupList" , data)
      .then(data => {
        return data;
      });
  }

  // public GetGroupRights(data: any): Promise<any> {
  //   return this.httpService.globalPostService(this.detailsbase + "/GetGroupRights" , data)
  //     .then(data => {
  //       return data;
  //     });
  // }

  public GetUserList(data: any): Promise<any>{
    return this.httpService.globalPostService(this.detailsbase + "/GetUserList" , data)
    .then(data => {
      return data;
    });
  }
  public GetAllRights(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/GetAllRights" , data)
      .then(data => {
        return data;
      });
  }

  public SaveTabRights(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/SaveTabRights" , data)
      .then(data => {
        return data;
      });
  }  
  public setUserPhotos(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/SaveUserPhotos" , data)
      .then(data => {
        return data;
      });
  }

  public getUserPhotos(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/GetUserPhotos" , data)
      .then(data => {
        return data;
      });
  }
  public getReportingList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/GetReportingList" , data)
      .then(data => {
        return data;
      });
  }
  public CRUDReportingInfo(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/CRUDReportingInfo" , data)
      .then(data => {
        return data;
      });
  }
  public crudReportingInfo(data: any): Promise<any> {
    return this.httpService.globalPostService(this.detailsbase + "/CRUDReportingInfo" , data)
      .then(data => {
        return data;
      });
  }
}
