import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AppConstant } from '../../app.constant';
@Injectable()
export class EmployeeService {
  appSettings : any = appSettings;
  api_url :string;
  appendpoint : string;
  employeebase : string;
  employeebase1 : string;
  getbycompanyurl : string;
  employeregister: string;
  constructor(private httpService: CommonHttpService,private LocalStorageService : LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.employeebase = this.appendpoint + AppConstant.API_CONFIG.API_URL.EMPLOYEE.BASE;
    this.getbycompanyurl =  this.employeebase + AppConstant.API_CONFIG.API_URL.EMPLOYEE.GETBYCOMPANY;
    this.employeregister = this.appendpoint + AppConstant.API_CONFIG.API_URL.account.BASE;
   }
   public getAll(data: any): Promise<any> {
    return this.httpService.globalGetServiceByUrl(this.employeebase , data)
      .then(data => {
        return data;
      });

  }  
  public getByCompany(data: any): Promise<any> {
    return this.httpService.globalPostService(this.getbycompanyurl , data)
      .then(data => {
        return data;
      });

  } 
  // public saveChanges(data: any): Promise<any> {
  //   return this.httpService.globalPostService(this.employeebase + "/Add" , data)
  //     .then(data => {
  //       return data;
  //     });
  // }

  public saveChanges(data: any): Promise<any> {
    return this.httpService.globalPostService(this.employeregister + "/registeremployee" , data)
      .then(data => {
        return data;
      });
  }

  public updateChanges(data: any): Promise<any> {
    return this.httpService.globalPostService(this.employeebase + "/Update" , data)
      .then(data => {     
        return data;
      });
  }

  public delete(data: any): Promise<any> {
    return this.httpService.globalPostService(this.employeebase + "/DeleteEmployee" , data)
      .then(data => {     
        return data;
      });
  }

}
