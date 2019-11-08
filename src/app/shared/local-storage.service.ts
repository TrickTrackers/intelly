import { Injectable } from '@angular/core';
import { AppConstant } from '../app.constant';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
//import { CommonAppService } from '../services/appservices/common-app.service';//
import * as _ from 'lodash';

@Injectable()
export class LocalStorageService {
  prefix: string = AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX;
  private userSessionAdded = new Subject<String>();

  constructor() { }

  addItem(key: string, item: any, notify = false) {
    var olddata = localStorage.getItem(this.prefix + key);
    if (olddata != null) {
      localStorage.removeItem(this.prefix + key)
    }
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
    if (notify) {
      this.userSessionAdded.next(item);
    }
  }
  addExtItem(prefix:string,key: string, item: any, notify = false) {
    var olddata = localStorage.getItem(prefix + key);
    if (olddata != null) {
      localStorage.removeItem(prefix + key)
    }
    localStorage.setItem(prefix + key, JSON.stringify(item));
    if (notify) {
      this.userSessionAdded.next(item);
    }
  }
  removeExtItem(prefix:string,key: string) {
    localStorage.removeItem(prefix + key);
  }
  removeAllExtItems()
  {
    this.removeExtItem(AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX, AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN);
    this.removeExtItem(AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX, AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_TYPE);
    this.removeExtItem(AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX, AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_EXPIRES);
    this.removeExtItem(AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX_MP, AppConstant.API_CONFIG.LOCALSTORAGE.ROLE);
    this.removeExtItem(AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX, AppConstant.API_CONFIG.LOCALSTORAGE.IS_ACTINGUP);
    this.removeExtItem(AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX, AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.removeExtItem(AppConstant.API_CONFIG.LOCALSTORAGE.STR_PREFIX_UP, AppConstant.API_CONFIG.LOCALSTORAGE.ROLE);

  }
  getItem(key: string) {
    var item = localStorage.getItem(this.prefix + key);
    try {
      return JSON.parse(item);
    } catch (error) {
      return item;
    }
  }

  removeItem(key: string) {
    localStorage.removeItem(this.prefix + key);
  }

  clearAllItem() {
    localStorage.clear();
  }

  getUserSessionData(): Observable<any> {
    return this.userSessionAdded.asObservable();
  }
  logout() {
    // this.CommonAppService.logOut("")
    //   .then((res) => {
    //     this.makeSessionOut();
    //   });

  }

}