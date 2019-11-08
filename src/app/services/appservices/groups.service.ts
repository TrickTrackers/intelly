import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AppConstant } from '../../app.constant';
@Injectable()
export class GroupService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  groupbase : string;
  employeebase1 : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.groupbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.GROUP.BASE;
    //this.employeebase1 = this.appendpoint + AppConstant.API_CONFIG.API_URL.EMPLOYEE.BASE + "/Add";  
   }
   public getAll(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/Get" , data)
      .then(data => {
        return data;
      });

  } 
  public GetGroupDefaultLego(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/GroupDefaultLegos" , data)
      .then(data => {
        return data;
      });
  }   
  public getGroupOwners(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/GroupOwners" , data)
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

  // public Update(data: any): Promise<any> {
  //   return this.httpService.globalPostService(this.groupbase + "/Update" , data)
  //     .then(data => {     
  //       return data;
  //     });
  // }
  
  public Update(data: any): Promise<any> {
      return this.httpService.globalPostService(this.groupbase + "/UpdateGroup" , data)
        .then(data => {     
          return data;
        });
    }

  public delete(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/Delete" , data)
      .then(data => {     
        return data;
      });
  }
  // public getModule(data: any): Promise<any> {
  //   return this.httpService.globalGetServiceByUrl(this.groupbase + "/Lego" , data)
  //     .then(data => {
  //       return data;
  //     });

  // }
  public getModule(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/Lego" , data)
      .then(data => {
        return data;
      });

  }  
  public getDefaultLegos(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/DefaultLegos" , data)
    .then(data => {
      return data;
    });
  } 
  public getGroupUsers(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/GroupUsers" , data)
      .then(data => {
        return data;
      });

  } 

  public AllGroup(data: any): Promise<any> {
    return this.httpService.globalPostService(this.groupbase + "/AllGroup" , data)
      .then(data => {
        return data;
      });
  } 

}
