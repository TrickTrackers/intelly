import { Injectable } from '@angular/core';
import { CommonHttpService } from '../../shared/common-http.service';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service'; 
import * as _ from 'lodash';
import { AppConstant } from '../../app.constant';
/**
 * 
 * @export
 * @class PerformanceService
 */
@Injectable()
export class PerformanceService {
  /**
   * assign the basic application configuration
   * @type *
   * @memberof PerformanceService
   */
  appSettings: any = appSettings;
  /**
   * assign the api url path
   * @type string
   * @memberof PerformanceService
   */
  api_url: string;
  /**
   * assign api accesspoint
   * @type string
   * @memberof PerformanceService
   */
  appendpoint: string;
  /**
   * assign preformance base path / controller name to access the api
   * @type string
   * @memberof PerformanceService
   */
  preformancebase: string;

  /**
   * Creates an instance of PerformanceService.
   * @param  {CommonHttpService} httpService add http service
   * @param  {CommonHttpService} commonHttpService common http service
   * @param  {LocalStorageService} localStorageService loacal storage service
   * @memberof PerformanceService
   */
  constructor(private httpService: CommonHttpService, private commonHttpService: CommonHttpService, private localStorageService: LocalStorageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.preformancebase = this.appendpoint + AppConstant.API_CONFIG.API_URL.PERFORMANCE.BASE;
  }
   
  /**
   * get metrics data from api
   * @param  {*} data pass the paramenter values for api
   * @return Promise<any> 
   * @memberof PerformanceService
   */
  public getList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preformancebase + "/GetList", data)
      .then(data => {
        return data;
      });
  }
  /**
   * insert,update and delete metrics call api method
   * @param  {*} data pass the paramenter values for api
   * @return Promise<any> respone data
   * @memberof PerformanceService
   */
  public crudMetricsInfo(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preformancebase + "/CRUDMetricsInfo", data)
      .then(data => {
        return data;
      });
  }
  /**
   * 
   * @param  {any} arr pass the paramenter values to make tree structure
   * @return tree module with metric data configuration
   * @memberof PerformanceService
   */
  public submoduleUnflattenEntities(arr) {
    var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem: any;
    for (var i = 0; i < arr.length; i++) {
      arrElem = arr[i];
      if (arrElem.isMetrics == 0) {
        mappedArr[arrElem.legoId] = arrElem;
      }
      mappedArr[arrElem.legoId]['children'] = [];
    }
    for (var legoId in mappedArr) {
      if (mappedArr.hasOwnProperty(legoId)) {
        mappedElem = mappedArr[legoId];
        var newArrElem;

        for (var j = 0; j < arr.length; j++) {
          newArrElem = arr[j];
          if (newArrElem.legoId == legoId && newArrElem.isMetrics == 1) {
            mappedArr[legoId]['children'].push(newArrElem);
          }
        }
        mappedElem.type = "Folder";
        mappedElem.path = " [ #Submodules " + mappedElem.legoCount + " / #Metrics  " + mappedElem.metricsCount + " ]";
        mappedElem.expanded = true;
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentId) {
          if (mappedArr[mappedElem['parentId']] == undefined) {
             tree.push(mappedElem);          
          }
          else {
            mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
            mappedArr[mappedElem['parentId']]['children'].sort(function (a, b) {
              return ((a.position > b.position));
            });            
          }         
        }
        else {
          tree.push(mappedElem);
        }
      }
    }
    return tree;
  }

  /**
   * get stategy data from api
   * @param  {*} data 
   * @return Promise<any> respone data
   * @memberof PerformanceService
   */
  public getStategyList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preformancebase + "/GetStategyExection", data)
      .then(data => {
        return data;
      });
  }
  /**
   * insert,update and delete stategy exection call api method
   * @param  {*} data pass the paramenter values for api
   * @return Promise<any> respone data
   * @memberof PerformanceService
   */
  public updateStategyExection(data: any): Promise<any> {
    return this.httpService.globalPostService(this.preformancebase + "/UpdateStategyExection", data)
      .then(data => {
        return data;
      });
  }
}
