import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';
@Injectable()
export class UPAssessmentService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  upassessmentbase : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.upassessmentbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.ASSESSMENT.BASE;
   }
   public getAllAssessment(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upassessmentbase + "/GetAll" , data)
      .then(data => {
        return data;
      });
  } 

  public AddUpdateAssessment(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upassessmentbase + "/AddUpdate" , data)
      .then(data => {
        return data;
      });
  }
  
  public EmployeeList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upassessmentbase + "/EmployeeList" , data)
      .then(data => {
        return data;
      });
  }
  
  public getAllPerformanceReviewer(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upassessmentbase + "/PerformReviewList" , data)
      .then(data => {
        return data;
      });
  }
  
  public SaveReviewer(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upassessmentbase + "/SaveReviewer" , data)
      .then(data => {
        return data;
      });
  }

  public DeleteReviewer(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upassessmentbase + "/DeleteReviewer" , data)
      .then(data => {
        return data;
      });
  } 
}
