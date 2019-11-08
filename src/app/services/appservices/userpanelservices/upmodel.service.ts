import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';
@Injectable()
export class UPModelService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  upmodelbase : string;
  bookmarkbase : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.upmodelbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.UPMODEL.BASE;  
    this.bookmarkbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.BOOKMARK.BASE;
   }
   public getAllParent(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upmodelbase + "/GetAll" , data)
      .then(data => {
        return data;
      });
  } 

  public createModel(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upmodelbase + "/CreateModel" , data)
      .then(data => {
        return data;
      });
  } 

  public deleteModel(data: any): Promise<any> {
    return this.httpService.globalPostService(this.upmodelbase + "/DeleteModel" , data)
      .then(data => {
        return data;
      });
  } 

  public AddBookmark(data: any): Promise<any> {
    return this.httpService.globalPostService(this.bookmarkbase + "/AddBookmark" , data)
      .then(data => {
        return data;
      });
  } 
  
  public GetBookmark(data: any): Promise<any> {
    return this.httpService.globalPostService(this.bookmarkbase + "/GetAll" , data)
      .then(data => {
        return data;
      });
  } 
  
  public removeBookmark(data: any): Promise<any> {
    return this.httpService.globalPostService(this.bookmarkbase + "/RemoveBookmark" , data)
      .then(data => {
        return data;
      });
  } 

}
