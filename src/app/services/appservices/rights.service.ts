import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AppConstant } from '../../app.constant';
@Injectable()
export class RightsService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  rightsbase : string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.rightsbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.RIGHTS.BASE; 
   }
   public getAll(data: any): Promise<any> {
    return this.httpService.globalPostService(this.rightsbase + "/Get" , data)
      .then(data => {
        return data;
      });

  } 
  public GetGroupDefaultLego(data: any): Promise<any> {
    return this.httpService.globalPostService(this.rightsbase + "/GroupDefaultLegos" , data)
      .then(data => {
        return data;
      });
  }   
  public getGroupOwners(data: any): Promise<any> {
    return this.httpService.globalPostService(this.rightsbase + "/GroupOwners" , data)
      .then(data => {
        return data;
      });

  }   
  public Add(data: any): Promise<any> {
    return this.httpService.globalPostService(this.rightsbase + "/AddGroup" , data)
      .then(data => {
        return data;
      });
  }

  // public Update(data: any): Promise<any> {
  //   return this.httpService.globalPostService(this.rightsbase + "/Update" , data)
  //     .then(data => {     
  //       return data;
  //     });
  // }

  public Update(data: any): Promise<any> {
    return this.httpService.globalPostService(this.rightsbase + "/UpdateRights" , data)
      .then(data => {     
        return data;
      });
  }

public delete(data: any): Promise<any> {
  return this.httpService.globalPostService(this.rightsbase + "/Delete" , data)
    .then(data => {     
      return data;
    });
}

public EnableRights(data: any): Promise<any> {
  return this.httpService.globalPostService(this.rightsbase + "/EnableRights" , data)
    .then(data => {     
      return data;
    });
}

// public getModule(data: any): Promise<any> {
//   return this.httpService.globalGetServiceByUrl(this.rightsbase + "/Lego" , data)
//     .then(data => {
//       return data;
//     });

// }  
// public getGroupUsers(data: any): Promise<any> {
//   return this.httpService.globalPostService(this.rightsbase + "/GroupUsers" , data)
//     .then(data => {
//       return data;
//     });

// } 

// public AllGroup(data: any): Promise<any> {
//   return this.httpService.globalPostService(this.rightsbase + "/AllGroup" , data)
//     .then(data => {
//       return data;
//     });
// } 

}
