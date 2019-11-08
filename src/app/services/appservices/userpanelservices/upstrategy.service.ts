import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';
@Injectable()
export class UPStrategyService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  upplanbase : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.upplanbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.STRATEGY.BASE;
   }
   public getAllPlanMVS(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/GetAllPlan" , data)
      .then(data => {
        return data;
      });
  } 

  public AddUpdatePlanMVS(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/AddUpdatePlan" , data)
      .then(data => {
        return data;
      });
  }
    
  public AddUpdateStrategy(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/AddUpdateStrategy" , data)
      .then(data => {
        return data;
      });
  }
  
  public getAllStrategy(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/GetAllStrategy" , data)
      .then(data => {
        return data;
      });
  }

  public DeleteStrategy(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/DeleteStrategy" , data)
      .then(data => {
        return data;
      });
  }

  public getAllGoals(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/GetAllGoals" , data)
      .then(data => {
        return data;
      });
  } 

  public AddPlanGoals(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/AddPlanGoals" , data)
      .then(data => {
        return data;
      });
  } 

  public UpdatePosition(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/UpdatePosition" , data)
      .then(data => {
        return data;
      });
  } 

  public UpdatePlanGoals(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/UpdatePlanGoals" , data)
      .then(data => {
        return data;
      });
  } 
  
  public DeletePlanGoals(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upplanbase + "/DeletePlanGoals" , data)
      .then(data => {
        return data;
      });
  } 
  
}
