import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';
@Injectable()
export class FilterTagService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  filtertagbase : string;
  searchbase : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.filtertagbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.BOOKMARK.BASE;
    this.searchbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.OVERALLSEARCH.BASE;
   }
  
  public GetFilterTag(data: any): Promise<any> {
    return this.httpService.globalPostService(this.filtertagbase + "/GetFilterTag" , data)
      .then(data => {
        return data;
      });
  } 
  public FilterOperation(data: any): Promise<any> {
    return this.httpService.globalPostService(this.filtertagbase + "/FilterOperation" , data)
      .then(data => {
        return data;
      });
  } 
  
  public AddUpdateFilterTag(data: any): Promise<any> {
    return this.httpService.globalPostService(this.filtertagbase + "/AddUpdateFilterTag" , data)
      .then(data => {
        return data;
      });
  }   

  public DeleteFilterTag(data: any): Promise<any> {
    return this.httpService.globalPostService(this.filtertagbase + "/DeleteFilterTag" , data)
      .then(data => {
        return data;
      });
  }  

  public search_service(data: any): Promise<any> {
    return this.httpService.globalPostService(this.searchbase + "/OverallSearch" , data)
      .then(data => {
        return data;
      });
  } 
  
  public GetOwnerList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.searchbase + "/GetOwnerList" , data)
      .then(data => {
        return data;
      });
  } 

  public FilterSearch(data: any): Promise<any> {
    return this.httpService.globalPostService(this.searchbase + "/FilterSearch" , data)
      .then(data => {
        return data;
      });
  } 

  public UpdateFilterPosition(data: any): Promise<any> {
    return this.httpService.globalPostService(this.filtertagbase + "/UpdateFilterPosition" , data)
      .then(data => {
        return data;
      });
  } 

  public EmpFilterOperation(data: any): Promise<any> {
    return this.httpService.globalPostService(this.filtertagbase + "/EmpFilterOperation" , data)
      .then(data => {
        return data;
      });
  } 

}
