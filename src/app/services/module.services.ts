import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { MasterGroupService } from '../services/appservices/master-group.service';
import { LocalStorageService } from '../shared/local-storage.service';
import { AppConstant } from '../app.constant';
import { UPModelService } from '../services/appservices/userpanelservices/upmodel.service';
import { SubmoduleService } from '../services/submodule.service';
import { CommonUtilityService } from '../services/common-utility.service';
import { Router } from '@angular/router';
import { Params } from '@angular/router';
/**
 * central module service
 * @export
 * @class ModuleService
 */
@Injectable()
export class ModuleService {
  /**
   * subcription subject for module updates
   * @private
   * @memberof ModuleService
   */
  private subject = new Subject<any>();
  /**
   * subcription subject for model changes
   * @memberof ModuleService
   */
  public subjectModel = new Subject<any>();
  /**
   * subcription subject for model selection
   * @memberof ModuleService
   */
  public subjectSelectedModel = new Subject<any>();
  /**
   * subscription subject for external module updates
   * @memberof ModuleService
   */
  public subjectExternalModUpdates = new Subject<any>();
  /**
   * subcription subject for module selection
   * @memberof ModuleService
   */
  public subjectSelectedModule = new Subject<any>(); // subject subcription for selected module change event

  private companyinfo: any;
  private tempnewModule = {
    name: 'New Module',
    url: '/user/home?module=Employees&moduleid=2&lvl=1',
    icon: 'icon-puzzle',
    children: [
      {
        name: 'Submodule 1',
        url: '/user/home?module=Submodule 1&moduleid=3&lvl=2',
        icon: 'icon-puzzle'
      },
      {
        name: 'Submodule 2',
        url: '/user/home?module=Submodule 2&moduleid=4&lvl=2',
        icon: 'icon-puzzle'
      }
    ]
  };
  /**
   * module list which travel accross the app
   * @memberof ModuleService
   */
  public moduleList = [];
  /**
   * module tree structure - travel accross the app
   * @memberof ModuleService
   */
  public treeModules = [];
  /**
   * selected tree module - first level
   * @type *
   * @memberof ModuleService
   */
  public selectedTreeModules: any;
  /**
   * selected model
   * @type *
   * @memberof ModuleService
   */
  public selectedModel: any;
  public modelList = [];

  public rightsList = [];//rights
  public subjectRights = new Subject<any>();// rights subscription
  public zoomsize = 85;
  userinfo: any = {};
  public selectedModuleId;
  preferenceSettings: any;
  tempExternalModuleChanges: any = {};
  tempTreeModules: any = {};
  temporgFlatten: any = [];
  tempmodifiedFlatten: any = [];
  isIE11: boolean = false;
  /**
   * Creates an instance of ModuleService.
   * @param  {MessageService} messageService show success error messages
   * @param  {MasterGroupService} MasterGroupService master group services to connect api server
   * @param  {LocalStorageService} LocalStorageService local storage services
   * @param  {UPModelService} UPModelService model services
   * @param  {SubmoduleService} SubmoduleService submdoule services to connect api server
   * @param  {Router} Router 
   * @memberof ModuleService
   */
  constructor(private messageService: MessageService, public MasterGroupService: MasterGroupService,
    private LocalStorageService: LocalStorageService, private UPModelService: UPModelService, public SubmoduleService: SubmoduleService,
    public Router: Router, private CommonUtilityService: CommonUtilityService) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.isIE11 = this.CommonUtilityService.isIE11Browser();
  }
  /**
   * get all child modules of selected model
   * @return 
   * @memberof ModuleService
   */
  public setModules() {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var req = {
      "CompanyId": this.userinfo.CompanyId,
      "modelId": this.selectedModel
    };
    //this.selectedModuleDetails = [];
    return this.SubmoduleService.GetAllLegos(req)
      .then((res) => {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.moduleList = res.result;
            this.treeModules = this.unflattenEntities(this.moduleList);
            // this.formatTreeStructure();
            this.sendModuleUpdates();
            this.setModuleRights(this.selectedModuleId);
          }
        }
      });
  }
  public renameUpdates(logoItem){
    var item = _.find(this.moduleList,(l)=>{
      return (l.legoId == logoItem.legoId)
    })
    if(! _.isEmpty(item)){
      item.label = logoItem.legoName;
      item.legoName=logoItem.legoName;
      this.treeModules = this.unflattenEntities(this.moduleList);
      this.sendModuleUpdates();
    }
  }
  /**
   * set selected module from external compoents
   * @param  {any} result input of external data
   * @return {void}@memberof ModuleService
   */
  public externalSetModules(result) {
    this.moduleList = result;
    this.treeModules = this.unflattenEntities(this.moduleList);
    // this.formatTreeStructure();
    this.sendModuleUpdates();
    this.setModuleRights(this.selectedModuleId);
  }
  /**
   * get module data from master module list
   * @param  {any} legoId legoid
   * @return 
   * @memberof ModuleService
   */
  public getModule(legoId) {
    return _.find(this.moduleList, (d) => {
      return (d.legoId == legoId)
    });
  }
  /**
   * set selected module from other component and call next of subscription
   * @param  {any} item selelcted module data
   * @return 
   * @memberof ModuleService
   */
  public setSelectedModule(item) {
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.legoId);
    this.selectedTreeModules = item;

    this.sendSelectedModuleUpdates();
    this.setModuleRights(item.legoId);
    return this.findChildModules(this.treeModules, item);
    // this.sendCount();
  }
  /**
   * get selected module of this service from other component or service
   * @param  {any} item module data
   * @return 
   * @memberof ModuleService
   */
  public getSelectedModule(item) {
    return this.findChildModules(this.treeModules, item);
    // this.sendCount();
  }

  /**
   * get tree structed module list
   * @return 
   * @memberof ModuleService
   */
  getTreeModules() {
    if (this.treeModules.length > 0) {
      this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
      let idx = _.findIndex(this.treeModules, (d) => {
        return (d.legoId == this.selectedModel)
      });
      this.selectedTreeModules = this.treeModules[idx];
      return [this.treeModules[idx]];
    }
    else {
      this.setModules();
    }
  }

  /**
   * call next of subject,and send updates to subcription
   * @return {void}@memberof ModuleService
   */
  public sendModuleUpdates() {
    this.subject.next({
      treeModules: this.treeModules
    });
  }
  /**
   * call next and send updates to subcription.send event to subject subcriber Next 
   * @return {void}@memberof ModuleService
   */
  public sendSelectedModuleUpdates() { // send event to subject subcriber Next 
    this.subjectSelectedModule.next({
      treeModules: this.selectedTreeModules
    });
  }
  /**
   * obserbe selectmodule will oberb from subriber component ( inside of OnInit)
   * @return Observable<any> 
   * @memberof ModuleService
   */
  getSelectedModuleUpdates(): Observable<any> { // obserbe selectmodule will oberb from subriber component ( inside of OnInit)
    return this.subjectSelectedModule.asObservable();
  }
  /**
   * obserbe selectmodule will oberb from subriber component
   * @return Observable<any> 
   * @memberof ModuleService
   */
  getModuleUpdates(): Observable<any> {
    return this.subject.asObservable();
  }
  /**
   * obserbe expternal updates will oberb from subriber component ( inside of OnInit)
   * @return Observable<any> 
   * @memberof ModuleService
   */
  getModuleExternalUpdates(): Observable<any> {
    return this.subjectExternalModUpdates.asObservable();
  }
  /**
   * travese child to model
   * @param  {any} req module detals
   * @return 
   * @memberof ModuleService
   */
  getChildrenToModel(req) {
    return this.SubmoduleService.getChildrenToModel(req);
  }
  /**
   * add new module
   * @param  {any} item  module data
   * @return 
   * @memberof ModuleService
   */
  addModule(item) {
    return this.SubmoduleService.AddLego(item);
    // let nItem = _.clone(this.tempnewModule);
    // var randomS = Math.random().toString(36).substring(2, 3) + Math.random().toString(36).substring(2, 3);
    // nItem.name = "New Module " + randomS;
    // // this.moduleItems.unshift(nItem);
    // // this.sendCount();
    // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Module added successfully.' });
  }

  removeItem(index) {
    // this.moduleItems.splice(index, 1);
    // this.sendCount();
  }
  /**
   * travse modules
   * @param  {any} innermodules module serive models
   * @param  {any} moduleid 
   * @return {void}@memberof ModuleService
   */
  loopModules(innermodules, moduleid) {
    var f = _.find(innermodules => {
      if (innermodules.mid == moduleid) {
        return;
      }
      else if (!_.isEmpty(innermodules.children)) {
        return this.loopModules(innermodules.children, moduleid);
      }
    });
  }
  /**
   * convert number to alphapets - a,b,c,aa,etc
   * @param  {any} num number
   * @return 
   * @memberof ModuleService
   */
  numberToAlphapets(num) {
    var s = '', t;
    //  var num = position - 1;
    while (num > 0) {
      t = (num - 1) % 26;
      s = String.fromCharCode(65 + t) + s;
      num = (num - t) / 26 | 0;
    }
    return s || '';
  }
  /**
   * set zoom size based on module zoom value
   * @param  {any} zoomSize 
   * @return {void}@memberof ModuleService
   */
  setZoomSize(zoomSize) {
    this.zoomsize = (zoomSize == "100" || zoomSize == "1") ? 85 :
      (zoomSize == "2") ? 87 :
        (zoomSize == "3") ? 90 :
          (zoomSize == "4") ? 100 :
            (zoomSize == "5") ? 165 : 85;
  }
  /**
   * format lego like param,url ewtc
   * @param  {any} mappedElem module details
   * @return 
   * @memberof ModuleService
   */
  formatLego(mappedElem) {
    mappedElem['children'] = [];
    var p_icon = (mappedElem.type == "T") ? "enterprise.png" :
      (mappedElem.type == "E") ? "employees.png" :
        (mappedElem.type == "D") ? "folder.png" :
          (mappedElem.type == "O") ? "organization.png" :
            (mappedElem.type == "P") ? "process.png" : "empty.png";
    mappedElem.label = mappedElem.legoName;
    mappedElem.icon = p_icon;
    mappedElem.url = "&lId=" + mappedElem.legoId + "&pId=" + mappedElem.parentId + "&lLvl=" + mappedElem.legoLevel + "&pos=" + mappedElem.position;
    mappedElem.params = {
      "lId": mappedElem.legoId,
      "pId": mappedElem.parentId,
      "lLvl": mappedElem.legoLevel,
      "pos": mappedElem.position,
      "mode": mappedElem.type
    }
    mappedElem.expanded = true;
    mappedElem.draggable = true;
    mappedElem.droppable = true;
    mappedElem.disabled = false;
    mappedElem.partialSelected = false;
    mappedElem.isTooltipEnabled = false;
    mappedElem.tooltipLegoName = this.shortenText(mappedElem.legoName, (this.zoomsize - 65), '...', false, mappedElem);
    mappedElem.alphaOrder = this.numberToAlphapets(mappedElem.position);
    // If the element is not at the root level, add it to its parent array of children.
    return mappedElem;
  }
  /**
   * convert flatten array to tree 
   * @param  {any} arr array value
   * @return 
   * @memberof ModuleService
   */
  unflattenEntities(arr) {
    this.setZoomSize(this.userinfo.zoomSize);
    var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem: any;
    // First map the nodes of the array to an object -> create a hash table.
    //_.sortBy(arr, ['legoId']);
    var recursiveChildCount = function (recureMap, mElem) {
      if (!_.isEmpty(recureMap[mElem['parentId']])) {
        recureMap[mElem['parentId']].childCount += 1;
        var innermappedElem = recureMap[mElem['parentId']];
        if (innermappedElem.parentId) {
          recursiveChildCount(recureMap, innermappedElem);
        }
      }
    }
    for (var i = 0; i < arr.length; i++) {
      arrElem = arr[i];
      mappedArr[arrElem.legoId] = arrElem;
      mappedArr[arrElem.legoId]['children'] = [];
      mappedArr[arrElem.legoId]['childCount'] = 0;
    }
    for (var legoId in mappedArr) {
      if (mappedArr.hasOwnProperty(legoId)) {
        mappedElem = mappedArr[legoId];
        if (mappedElem.icon == null || mappedElem.icon == "") {
          var p_icon = (mappedElem.type == "T") ? "enterprise.png" :
            (mappedElem.type == "E") ? "employees.png" :
              (mappedElem.type == "D") ? "folder.png" :
                (mappedElem.type == "O") ? "organization.png" :
                  (mappedElem.type == "P") ? "process.png" : "empty.png";
          mappedElem.icon = p_icon;
        }
        mappedElem.label = mappedElem.legoName;
        var isRefString = "&isRef=false";
        if (mappedElem.referenceLegoId > 0) {
          isRefString = "&isRef=true&Rid=" + mappedElem.legoId + "&Oid=" + mappedElem.referenceLegoId;
        }
        mappedElem.url = "&lId=" + mappedElem.legoId + "&pId=" + mappedElem.parentId + "&lLvl=" + mappedElem.legoLevel + "&pos=" + mappedElem.position + isRefString;
        mappedElem.params = {
          "lId": mappedElem.legoId,
          "pId": mappedElem.parentId,
          "lLvl": mappedElem.legoLevel,
          "pos": mappedElem.position,
          "mode": mappedElem.type,
          "isRef": false
        }
        if (mappedElem.referenceLegoId > 0) {
          mappedElem.params.isRef = true;
          mappedElem.params.Rid = mappedElem.legoId;
          mappedElem.params.Oid = mappedElem.referenceLegoId;
        }
        mappedElem.expanded = true;
        mappedElem.draggable = true;
        mappedElem.droppable = true;
        mappedElem.disabled = false;
        mappedElem.partialSelected = false;
        mappedElem.isTooltipEnabled = false;
        mappedElem.tooltipLegoName = this.shortenText(mappedElem.legoName, (this.zoomsize - 65), '...', false, mappedElem);
        mappedElem.alphaOrder = this.numberToAlphapets(mappedElem.position);
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentId) {
          if (!_.isEmpty(mappedArr[mappedElem['parentId']])) {
            // recursiveChildCount(mappedArr, mappedElem);
            mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
            // _.sortBy(mappedArr[mappedElem['parentId']]['children'], ['position']);
            mappedArr[mappedElem['parentId']]['children'].sort(function (a, b) {
              return ((a.position - b.position));
            });
          }

          // if(mappedArr[mappedElem['parentId']]['legoId'] == 3)
          // {
          // }
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          // mappedElem.childCount = children.length;
          tree.push(mappedElem);
        }
      }
    }

    return tree;
  }
  /**
   * shorten text based on max lenght
   * @param  {any} text target text
   * @param  {any} maxLength max length of target
   * @param  {any} delimiter delimeter of shorten
   * @param  {any} overflow css property
   * @param  {any} [module] module data
   * @return 
   * @memberof ModuleService
   */
  shortenText(text, maxLength, delimiter, overflow, module?) {
    delimiter = delimiter || "&hellip;";
    overflow = overflow || false;
    var ret = text;
    if (ret.length > maxLength) {
      var breakpoint = overflow ? maxLength + ret.substr(maxLength).indexOf("") : ret.substr(0, maxLength).lastIndexOf("");
      ret = ret.substr(0, breakpoint) + delimiter;
      module.isTooltipEnabled = false;
    }
    else {
      module.isTooltipEnabled = true;
    }
    return ret;
  }
  /**
   * get current module lsit
   * @return 
   * @memberof ModuleService
   */
  getModelList() {
    return this.modelList;
  }

  /**
   * set current module
   * @return 
   * @memberof ModuleService
   */
  setModelList() {
    var Company = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    return this.UPModelService.getAllParent(Company.CompanyId)
      .then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var result = res.result;
              if (result) {
                this.modelList = result;
                this.sendModelUpdates();
              }
            }

          }
        }
      })
  }
  /**
   * set global selected model
   * @param  {any} item model d ata
   * @return {void}@memberof ModuleService
   */
  setselectedModel(item) {
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel, item.legoId);
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.legoId);
    this.selectedModel = item.legoId;
    // this.getTreeModules();
    setTimeout(() => {
      this.setModules();
    }, 10);

    //  this.sendModuleUpdates();
  }
  /**
   * get breadcrumb data based on selected module and module list traverse.
   * @return 
   * @memberof ModuleService
   */
  getBreadcrumb() {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var selectedModuleId = this.selectedModuleId;
    if (this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule)) {
      selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId);
    }
    return this.traversechildToParent(this.moduleList, selectedModuleId);
  }
  /**
   * send module update to subcriptions
   * @return {void}@memberof ModuleService
   */
  public sendModelUpdates() {
    this.subjectModel.next({
      modelList: this.modelList
    });
  }

  /**
   * travnse tree module to find particular module
   * @param  {*} tree tree data
   * @param  {*} findnote specific object value
   * @param  {any} [lLegoid] legoId
   * @return 
   * @memberof ModuleService
   */
  findChildModules(tree: any, findnote: any, lLegoid?) {
    var i = 0, found;
    var legoId = (lLegoid == undefined || lLegoid == null) ? findnote.legoId : lLegoid;
    for (; i < tree.length; i++) {
      if (tree[i].legoId === legoId) {
        return tree[i];
      } else if (_.isArray(tree[i].children)) {
        found = this.findChildModules(tree[i].children, findnote, lLegoid);
        if (found) {
          return found;
        }
      }
    }
    // return result;
  }
  /**
   * traverse tree and find parent of target
   * @param  {*} tree 
   * @param  {*} findnote 
   * @param  {any} [lLegoid] 
   * @return 
   * @memberof ModuleService
   */
  findParentModule(tree: any, findnote: any, lLegoid?) {
    return _.find(tree, (data) => {
      return (findnote.parentId == data.legoId)
    });
  }
  /**
   * travense split to junk - looping
   * @param  {*} tree 
   * @param  {*} findnote 
   * @return {void}@memberof ModuleService
   */
  traverseSplit(tree: any, findnote: any) {
    _.forIn(tree, function (val, key) {
      if (_.isArray(val)) {
        val.forEach(function (el) {
          if (_.isObject(el)) {
            this.traverseSplit(el);
          }
        });
      }
      if (_.isObject(key)) {
        this.traverseSplit(tree[key]);
      }
    });
  }
  /**
   * travese child to parent
   * @param  {any} tree tree data
   * @param  {any} legoId legoid
   * @return 
   * @memberof ModuleService
   */
  traversechildToParent(tree, legoId) {
    var b_array = [];
    var node = _.find(tree, (data) => {
      return (legoId == data.legoId)
    });
    if (!_.isEmpty(node)) {
      b_array.push(node);
      while (node.parentId > 0) {
        if (!_.isEmpty(node)) {
          node = this.findParentModule(tree, node);
          b_array.unshift(node);
        }
      }
    }

    return b_array;
  }

  /**
   * get module rights for selected module
   * @param  {any} legoId 
   * @return 
   * @memberof ModuleService
   */
  public setModuleRights(legoId) {
    //this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.legoId);
    //this.selectedTreeModules = item;

    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedModel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var SelectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var req = {
      CompanyId: this.userinfo.CompanyId,
      EmployeeId: this.userinfo.EmployeeId,
      // LegoId: legoId
      LegoId: SelectedModuleId
    };
    //this.selectedModuleDetails = [];
    return this.SubmoduleService.GetModuleRights(req)
      .then((res) => {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.rightsList = res.result[0];
            this.checkRefModRights();
            this.sendRightsUpdates();
          }
        }
      });
  }
  /**
   * check reference module and their orginal rights
   * @return {void}@memberof ModuleService
   */
  public checkRefModRights() {
    var isRef = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule);
    if (isRef) {
      this.rightsList["assessmentRights"] = (this.rightsList["assessmentRights"] == "Unrestricted") ? "Readonly" : this.rightsList["assessmentRights"];
      this.rightsList["collaborationRights"] = (this.rightsList["collaborationRights"] == "Unrestricted") ? "Readonly" : this.rightsList["collaborationRights"];
      this.rightsList["connectionRights"] = (this.rightsList["connectionRights"] == "Unrestricted") ? "Readonly" : this.rightsList["connectionRights"];
      this.rightsList["detailsRights"] = (this.rightsList["detailsRights"] == "Unrestricted") ? "Readonly" : this.rightsList["detailsRights"];
      this.rightsList["documentRights"] = (this.rightsList["documentRights"] == "Unrestricted") ? "Readonly" : this.rightsList["documentRights"];
      this.rightsList["modelRights"] = (this.rightsList["modelRights"] == "Unrestricted") ? "Readonly" : this.rightsList["modelRights"];
      this.rightsList["moduleRights"] = (this.rightsList["moduleRights"] == "Unrestricted") ? "Readonly" : this.rightsList["moduleRights"];
      this.rightsList["performanceRights"] = (this.rightsList["performanceRights"] == "Unrestricted") ? "Readonly" : this.rightsList["performanceRights"];
      this.rightsList["planRights"] = (this.rightsList["planRights"] == "Unrestricted") ? "Readonly" : this.rightsList["planRights"];
      this.rightsList["workflowRights"] = (this.rightsList["workflowRights"] == "Unrestricted") ? "Readonly" : this.rightsList["workflowRights"];
    }
  }
  /**
   * get current module rights
   * @return 
   * @memberof ModuleService
   */
  public getModuleRights() {
    return this.rightsList;
  }
  /**
   * check current selected module is ref module
   * @return 
   * @memberof ModuleService
   */
  public checkIsRefmodule() {
    var isRefModule = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule) || false;
    if (isRefModule) {
      $("#gotooriginal_tag").show();
    }
    return isRefModule;
  }


  /**
   * send selected module rights to subcriptions
   * @return Observable<any> 
   * @memberof ModuleService
   */
  public getModuleRightsUpdate(): Observable<any> {
    return this.subjectRights.asObservable();
    //return this.rightsList;
  }

  /**
   * send selected module rights to subcriptions
   * @return {void}@memberof ModuleService
   */
  public sendRightsUpdates() {
    this.subjectRights.next({
      rightsList: this.rightsList
    });
  }
  public getIconList() {

  }
  /**
   * redirect to selected module and send module updates to subscriptions
   * @param  {*} item 
   * @return 
   * @memberof ModuleService
   */
  redirecttoSelectedModule(item: any) {
    if (!_.isEmpty(item)) {
      // this.ModuleService.setSelectedModule(item);
      this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.legoId);
      if (item.referenceLegoId > 0) {
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.referenceLegoId);
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule, true);
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId, item.legoId);
      }
      else {
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule, false);
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId, 0);

      }
      this.setModules();
      var querystring;
      this.Router.routerState.root.queryParams.subscribe((params: Params) => {
        querystring = params['t'];
      })
      if (item.params.mode == 'E') {
        let urlTree = this.Router.parseUrl(this.Router.url);
        var newparams: any = _.clone(item.params);
        newparams.t = "stab_details_uemplist";
        this.Router.navigate(['/details'], {
          queryParams: newparams
        });
        $("#main_tab_container").show();
        //$("#main_tab_container").hide();
        //return;
      }
      else if (item.params.mode != 'D' && (querystring == 'stab_document_folder'
        || querystring == 'stab_document_Add' || querystring == 'stab_document_link')) {
        let urlTree = this.Router.parseUrl(this.Router.url);
        var newparams = _.clone(item.params);
        newparams.t = "stab_view_document";
        this.Router.navigate(['/documents'], {
          queryParams: newparams
        });

        $("#main_tab_container").show();
        //return;
      }
      else if (item.params.mode == 'D') {
        let urlTree = this.Router.parseUrl(this.Router.url);
        var newparams = _.clone(item.params);
        newparams.t = "stab_view_document";
        this.Router.navigate(['/documents'], {
          queryParams: newparams
        });
        $("#main_tab_container").hide();
        this.activateModuleTabs(newparams);
        //return;
      }
      else {
        $("#main_tab_container").show();
        // dynamic change router value
        let urlTree = this.Router.parseUrl(this.Router.url);
        // urlTree.queryParams= item.params;
        if (item.referenceLegoId > 0) {
          var tempLego = this.findChildModules(this.treeModules, null, item.referenceLegoId);
          if (!_.isEmpty(tempLego)) {
            item.params.lId = tempLego.legoId;
            item.params.lLvl = tempLego.legoLevel;
            item.params.mode = tempLego.mode;
            item.params.pId = tempLego.pId;
            item.params.pos = tempLego.pos;
            item.isRef = true;
            item.Rid = item.legoId;
            item.Oid = item.referenceLegoId;
          }
        }
        _.merge(urlTree.queryParams, item.params);
        this.Router.navigateByUrl(urlTree);
      }
    }
    return false;
  }

  /**
   * same as redirect to selected module ,used in submodule component
   * @param  {any} item module data
   * @return 
   * @memberof ModuleService
   */
  redirecttoSubModule(item) {
    if (!_.isEmpty(item)) {
      // this.ModuleService.setSelectedModule(item);

      if (item.params.mode == 'E' || item.params.mode == 'D') {

        this.setselectedModelforEmp(item);
        $("#main_tab_container").show();
        //return;
      }
      else {
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.legoId);
        this.setModules();
        var querystring;
        this.Router.routerState.root.queryParams.subscribe((params: Params) => {
          querystring = params['t'];
        })
        if (item.referenceLegoId > 0) {
          this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.referenceLegoId);
          this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule, true);
          this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId, item.legoId);
        }
        else {
          this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule, false);
          this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId, 0);

        }

        let urlTree = this.Router.parseUrl(this.Router.url);
        var newparams = _.clone(item.params);
        newparams.t = "submodules";
        if (item.referenceLegoId > 0) {
          var tempLego = this.findChildModules(this.treeModules, null, item.referenceLegoId);
          if (!_.isEmpty(tempLego)) {
            newparams.lId = tempLego.legoId;
            newparams.lLvl = tempLego.legoLevel;
            newparams.mode = tempLego.mode;
            newparams.pId = tempLego.pId;
            newparams.pos = tempLego.pos;
          }
        }
        this.Router.navigate(['/submodule'], {
          queryParams: newparams
        });
        $("#main_tab_container").show();
      }

    }
    return false;
  }

  /**
   * set selected module for employee module
   * @param  {any} item employee module details
   * @return {void}@memberof ModuleService
   */
  setselectedModelforEmp(item) {
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel, item.parentId);
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.parentId);
    this.selectedModel = item.parentId;
    // this.getTreeModules();
    setTimeout(() => {
      this.setModules();
    }, 10);
    $("#main_tab_container").show();
    //  this.sendModuleUpdates();
  }

  /**
   * convert array to tree for document modules
   * @param  {any} includedModules 
   * @return 
   * @memberof ModuleService
   */
  unflattenEntitiesDoc(includedModules) {
    var arr = this.moduleList;
    var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem: any;
    // First map the nodes of the array to an object -> create a hash table.
    //_.sortBy(arr, ['legoId']);
    for (var i = 0; i < arr.length; i++) {

      arrElem = arr[i];
      mappedArr[arrElem.legoId] = arrElem;
      mappedArr[arrElem.legoId]['children'] = [];
      // if(arrElem.cType != 'E' && arrElem.cType != 'D' && arrElem.cType != null)
      // {

      // }
    }
    for (var legoId in mappedArr) {
      if (mappedArr.hasOwnProperty(legoId)) {
        mappedElem = mappedArr[legoId];
        var p_icon = (mappedElem.type == "T") ? "enterprise.png" :
          (mappedElem.type == "E") ? "employees.png" :
            (mappedElem.type == "D") ? "folder.png" :
              (mappedElem.type == "O") ? "organization.png" :
                (mappedElem.type == "P") ? "process.png" : "empty.png";
        mappedElem.label = mappedElem.legoName;
        mappedElem.icon = p_icon;
        mappedElem.url = "&lId=" + mappedElem.legoId + "&pId=" + mappedElem.parentId + "&lLvl=" + mappedElem.legoLevel + "&pos=" + mappedElem.position;
        mappedElem.params = {
          "lId": mappedElem.legoId,
          "pId": mappedElem.parentId,
          "lLvl": mappedElem.legoLevel,
          "pos": mappedElem.position,
          "mode": mappedElem.type
        }
        mappedElem.expanded = true;
        mappedElem.draggable = true;
        mappedElem.droppable = true;
        mappedElem.disabled = false;
        // mappedElem.isCheck = true;
        //  mappedElem.selectable = true;
        // mappedElem.selected = true;
        //  mappedElem.partialSelected = true;
        mappedElem.alphaOrder = this.numberToAlphapets(mappedElem.position);
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentId) {
          var isSelected = _.filter(includedModules, (l) => {
            return (l.legoId == mappedElem.legoId)
          })
          if (!_.isEmpty(isSelected)) {
            //mappedElem.isCheck = true;
            //mappedElem.selectable = true;
            //mappedElem.selected = true;
            mappedElem.partialSelected = true;
            mappedElem.isSelected = true;
          }
          else {
            //mappedElem.isCheck = false;
            //mappedElem.selectable = true;
            //mappedElem.selected = false;
            mappedElem.partialSelected = false;
            mappedElem.isSelected = false;
          }
          mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
          // _.sortBy(mappedArr[mappedElem['parentId']]['children'], ['position']);
          mappedArr[mappedElem['parentId']]['children'].sort(function (a, b) {
            return ((a.position - b.position));
          });
          // if(mappedArr[mappedElem['parentId']]['legoId'] == 3)
          // {
          // }
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          // mappedElem.childCount = children.length;
          mappedElem.partialSelected = false;
          mappedElem.isSelected = false;
          tree.push(mappedElem);
        }
      }
    }

    return tree;
  }


  /**
   * onvert array to tree for document modules 1
   * @param  {any} includedModules 
   * @return 
   * @memberof ModuleService
   */
  unflattenEntitiesDoc1(includedModules) {
    var arr = this.moduleList;
    var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem: any;
    // First map the nodes of the array to an object -> create a hash table.
    //_.sortBy(arr, ['legoId']);
    for (var i = 0; i < arr.length; i++) {

      arrElem = arr[i];
      mappedArr[arrElem.legoId] = arrElem;
      mappedArr[arrElem.legoId]['children'] = [];

    }
    for (var legoId in mappedArr) {
      if (mappedArr.hasOwnProperty(legoId)) {
        mappedElem = mappedArr[legoId];
        var p_icon = (mappedElem.type == "T") ? "enterprise.png" :
          (mappedElem.type == "E") ? "employees.png" :
            (mappedElem.type == "D") ? "folder.png" :
              (mappedElem.type == "O") ? "organization.png" :
                (mappedElem.type == "P") ? "process.png" : "empty.png";
        mappedElem.label = mappedElem.legoName;
        mappedElem.icon = p_icon;
        mappedElem.url = "&lId=" + mappedElem.legoId + "&pId=" + mappedElem.parentId + "&lLvl=" + mappedElem.legoLevel + "&pos=" + mappedElem.position;
        mappedElem.params = {
          "lId": mappedElem.legoId,
          "pId": mappedElem.parentId,
          "lLvl": mappedElem.legoLevel,
          "pos": mappedElem.position,
          "mode": mappedElem.type
        }
        mappedElem.expanded = true;
        mappedElem.draggable = true;
        mappedElem.droppable = true;
        mappedElem.disabled = false;

        mappedElem.alphaOrder = this.numberToAlphapets(mappedElem.position);
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentId) {
          var isSelected = _.filter(includedModules, (l) => {
            return (l.legoId == mappedElem.legoId)
          })
          if (!_.isEmpty(isSelected)) {
            //mappedElem.isCheck = true;
            //mappedElem.selectable = true;
            //mappedElem.selected = true;
            mappedElem.partialSelected = true;
            mappedElem.isSelected = true;
            mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
            mappedArr[mappedElem['parentId']]['children'].sort(function (a, b) {
              return ((a.position - b.position));
            });
          }
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          // mappedElem.childCount = children.length;
          tree.push(mappedElem);
        }
      }
    }

    return tree;
  }
  /**
   * tree traverse and set zoom size 
   * @param  {any} treeObj tree oject
   * @param  {any} zoomSize zoom size
   * @return {void}@memberof ModuleService
   */
  treeTravese(treeObj, zoomSize) {
    this.setZoomSize(zoomSize);
    var _self = this;
    var recurse = (current, depth) => {
      var children = current.children;
      if (!children) return; //handle text nodes
      for (var i = 0, len = children.length; i < len; i++) {
        recurse(children[i], depth + 1);
      }
      current.isTooltipEnabled = false;
      current.tooltipLegoName = this.shortenText(current.legoName, (this.zoomsize - 65), '...', false, current);
    }
    recurse(treeObj, 0);
    // for (let k in treeObj) {
    //   if (treeObj[k] && typeof treeObj[k] === 'object') {
    //     this.treeTravese(treeObj[k]);
    //   } else {
    //     // Do something with obj[k]
    //   }
    // }
  }
  /**
   * navigate to tabs like submodule,workflow,connection etc,.
   * @param  {any} path 
   * @return {void}@memberof ModuleService
   */
  navigateRoute(path, fromHome?) {
    var tab_param = "";
    switch (path) {
      case 'submodule':
        tab_param = "submodules";
        break;
      case 'workflow':
        tab_param = (this.preferenceSettings.isBoardDefault == false) ? "tasks" : "boards";
        // if (fromHome == true) {//&& this.isIE11 == true
        //   tab_param = "submodules";
        // }
        break;
      case 'documents':
        tab_param = "stab_view_document";
        break;
      case 'strategy':
        tab_param = "stab_strategy_summary";
        break;
      case 'assessment':
        tab_param = "stab_assessment_summary";
        break;
      case 'performance':
        tab_param = "stab_performance_metrics";
        break;
      case 'connections':
        tab_param = "connections";
        break;
      case 'details':
        //tab_param = "stab_details_processinfo";
        tab_param = "stab_details_uemplist";
        break;
      case 'collaboration':
        tab_param = "stab_collaboration_notes";
        break;

    }
    path = "/" + path;


    if (!_.isEmpty(this.selectedTreeModules)) {
      if (this.selectedTreeModules.legoId != this.preferenceSettings.defaultModule) {
        var treemodules = this.getTreeModules();
        var m = this.findChildModules(treemodules, null, this.preferenceSettings.defaultModule);
        if (!_.isEmpty(m)) {
          this.setSelectedModule(m);
        }
        else {
          this.setSelectedModule(this.selectedTreeModules);
        }
      }
      else {
        this.setSelectedModule(this.selectedTreeModules);
      }
      var newparams = _.clone(this.selectedTreeModules.params);
      newparams.t = tab_param;
      this.Router.navigate([path], { queryParams: newparams });
    }
    else {
      this.rescursiveRedirection(tab_param, path);
    }

    var queryparams: any = {};
    //this.router.navigate([path], { queryParams: newparams });
    // var selectedmodule = this.findChildModules(this.selectedTreeModules, null, this.selectedModuleId);
    // if (!_.isEmpty(selectedmodule)) {
    //   queryparams.lId = selectedmodule.legoId;
    //   queryparams.pId = selectedmodule.parentId;
    //   queryparams.lLvl = selectedmodule.legoLevel;
    //   queryparams.pos = selectedmodule.position;
    //   queryparams.mode = selectedmodule.type;
    //   queryparams.t = newparams.t;
    // }

    //this.ModuleService.setModuleRights(newparams.lId);


    // if (newparams.lId == undefined || newparams.pId == undefined || newparams.t == undefined) {
    //   this.Router.navigate([path], { queryParams: newparams });
    // }
    // else {
    //   queryparams.t = newparams.t;
    //   this.Router.navigate([path], { queryParams: queryparams });
    // }
  }
  /**
   * if selectedtreemodule is empty,recursively redirection will occur.
   * @param  {any} tab_param targeted tab
   * @param  {any} path 
   * @return {void}@memberof ModuleService
   */
  rescursiveRedirection(tab_param, path) {
    setTimeout(() => {
      if (!_.isEmpty(this.selectedTreeModules)) {
        var newparams = _.clone(this.selectedTreeModules.params);
        newparams.t = tab_param;
        this.Router.navigate([path], { queryParams: newparams });
      }
      else {
        this.rescursiveRedirection(tab_param, path);
      }

    }, 1000);
  }
  /**
   * redirection from login to preference setting home page
   * @return {void}@memberof ModuleService
   */
  preferenceTabRedirection(fromHome?) {
    this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    var path = "submodule";
    if (this.preferenceSettings.defaultTab != null && this.preferenceSettings.defaultTab != undefined && this.preferenceSettings.defaultTab != 0) {
      switch (this.preferenceSettings.defaultTab) {
        case 1:
          path = "submodule";
          break;
        case 2:
          path = "workflow";
          // if (fromHome == true) {//&& this.isIE11 == true
          //   path = "submodule";
          // }
          break;
        case 3:
          path = "connections";
          break;
        case 4:
          path = "documents";
          break;
        case 5:
          path = "collaboration";
          break;
        case 6:
          path = "strategy";
          break;
        case 7:
          path = "assessment";
          break;
        case 8:
          path = "performance";
          break;
        case 9:
          path = "details";
          break;
      }
    }
    this.navigateRoute(path, fromHome);
  }
  /**
   * activate tab based on url param values
   * @param  {*} queryParamsObject url query object
   * @return {void}@memberof ModuleService
   */
  public activateModuleTabs(queryParamsObject: any) {
    var querystring = queryParamsObject['t'];
    var allQuerystring = queryParamsObject;

    if (allQuerystring['ispin'] == true) {
    }
    var activeTab = (querystring == 'submodules') ? 0 :
      (querystring == 'tasks' || querystring == 'boards') ? 1 :
        (querystring == "connections") ? 2 :
          (querystring == "stab_document_link" || querystring == 'stab_document_Add' || querystring == 'stab_view_document' || querystring == 'stab_document_folder') ? 3 :
            (querystring == "stab_strategy_summary" || querystring == 'stab_strategy_mission' || querystring == 'stab_strategy_vision'
              || querystring == 'stab_strategy_strategy' || querystring == 'stab_strategy_goals') ? 4 :
              (querystring == "stab_assessment_summary" || querystring == "stab_assessment_strength" || querystring == "tab_assessment" || querystring == "stab_assessment_reviewer"
                || querystring == 'stab_assessment_weakness' || querystring == 'stab_assessment_opportunities' || querystring == "stab_assessment_threats" || querystring == "stab_assesment_threats") ? 5 :
                (querystring == 'stab_performance_metrics' || querystring == 'stab_performance_strategyexe' || querystring == 'performance') ? 6 :
                  //(querystring == "stab_collaboration_forum" || querystring == "stab_collaboration_notes") ? 7 :
                  (querystring == "stab_collaboration_notes" || querystring == "stab_collaboration_module") ? 7 :
                    (querystring == "stab_details_uemplist" || querystring == "stab_details_processinfo" || querystring == "tab_details"
                      || querystring == "stab_details_managefiltertags" || querystring == "stab_details_changelogs"
                      || querystring == "stab_details_submchangelogs" || querystring == "stab_details_accessrights") ? 8 : -1;
    if ((activeTab > -1)) {
      this.activateTabs(activeTab);
    }
    // this.activeTab = (activeTab > -1) ? activeTab : 9;
    // if (this.moduleTabset.tabs) {
    //   if (this.moduleTabset.tabs.length > 0) {
    //     _.forEach(this.moduleTabset.tabs, (t) => {
    //       // t.active = false;
    //       $("#" + t.id + "-link").removeClass("active");
    //       $("#" + t.id + "-link").parent(".nav-item").removeClass("active");
    //     });
    //     if (activeTab > -1) {
    //       $("#" + this.moduleTabset.tabs[activeTab].id + "-link").addClass("active");
    //       $("#" + this.moduleTabset.tabs[activeTab].id + "-link").parent(".nav-item").addClass("active");
    //       this.moduleTabset.tabs[activeTab].active = true;
    //     }

    //   }
    // }

    //this.moduleTabset.tabs[activeTab].active = true;
  }
  /**
   * activate tab selection
   * @param  {any} activeTab 
   * @return {void}@memberof ModuleService
   */
  activateTabs(activeTab) {
    setTimeout(() => {
      $("#main_tab_container " + " ul li ").each(function (index) {
        $(this).removeClass("active");
      });
      $("#main_tab_container " + " ul li > a.nav-link ").each(function (index) {
        $(this).removeClass("active");
      });
      if ($("#main_tab_container " + " ul li > a.nav-link ").length > 0) {
        var element = $("#main_tab_container " + " ul li > a.nav-link ")[activeTab];
        $(element).addClass("active");
      }
      else
        this.activateTabs(activeTab);

    }, 1000);
  }
  /**
   * send external module changes from submodule and reflect to other tree module usages like sidebar.
   * @param  {any} modulechang actual module changes
   * @param  {any} [LegoUpdation] lego updated details
   * @return {void}@memberof ModuleService
   */
  setExternalModuleChanges(modulechang, LegoUpdation?) {
    this.tempTreeModules = [];
    this.tempExternalModuleChanges = [];
    this.tempExternalModuleChanges = modulechang;
    if (LegoUpdation.statementType == "Rename" && LegoUpdation) {
      this.updateReferenceModuleRenames(this.treeModules, LegoUpdation.lego);
    }
    if (this.treeModules.length > 0) {
      this.tempTreeModules = this.findChildModules(this.treeModules, null, this.tempExternalModuleChanges.legoId);
      if (!_.isEmpty(this.tempTreeModules)) {

        //   if (this.treeModules[0].legoLevel == this.tempExternalModuleChanges.legoLevel) {
        //    // this.treeModules[0] = this.tempExternalModuleChanges;
        // _.each(this.treeModules[0].children, (item, idx) => {
        //   var updatedItem = _.find(this.tempExternalModuleChanges.children, (mi) => {
        //     return (mi.legoId == item.legoId);
        //   });
        //   if (!_.isEmpty(updatedItem)) {
        //     this.treeModules[0].children[idx] = updatedItem;
        //   }
        // })
        //     }
        // else{
        //   //this.tempTreeModules
        //   //tempExternalModuleChanges
        //  // this.tempTreeModules = _.cloneDeep(this.treeModules);
        //   this.ExternalupdateChildModules(this.treeModules, this.tempExternalModuleChanges);
        //  // this.treeModules= _.cloneDeep(this.tempTreeModules);
        // }
        //   else {
        this.temporgFlatten = [];
        this.tempmodifiedFlatten = [];
        var tree = _.cloneDeep(this.treeModules);
        this.treeToFlatten(tree[0], "children", "legoId", this.temporgFlatten);
        this.treeToFlatten(this.tempExternalModuleChanges, "children", "legoId", this.tempmodifiedFlatten);
        if (_.isArray(this.temporgFlatten) && _.isArray(this.tempmodifiedFlatten)) {
          _.each(this.tempmodifiedFlatten, (mi) => {
            var orgidx = _.findIndex(this.temporgFlatten, (oi) => {
              return (oi.legoId == mi.legoId)
            });
            if (orgidx > -1) {
              this.temporgFlatten[orgidx] = _.clone(mi);
            }
            else if (mi.legoId > 0) {
              this.temporgFlatten.push(mi);
            }
          });
        }
        if (LegoUpdation.statementType == "SDelete") {
          var lego = LegoUpdation.lego
          var idx = _.findIndex(this.temporgFlatten, (i) => {
            return (lego.legoId == i.legoId)
          });
          this.temporgFlatten.splice(idx, 1);
        }
        tree[0].children = [];
        this.temporgFlatten.unshift(tree[0]);
        this.moduleList = this.temporgFlatten;
        this.treeModules = this.unflattenEntities(this.temporgFlatten);
        //  }
        this.subjectExternalModUpdates.next({
          treeModules: this.treeModules
        });
      }
    }

  }

  /**
   * external child module updates and relect to other usages
   * @param  {*} tree tree module
   * @param  {any} modulechanges module changes
   * @return 
   * @memberof ModuleService
   */
  ExternalupdateChildModules(tree: any, modulechanges) {
    var i = 0, found;
    var legoId = modulechanges.legoId;
    for (; i < tree.length; i++) {
      if (tree[i].legoId === legoId) {
        return tree[i];
      } else if (_.isArray(tree[i].children)) {
        found = this.ExternalupdateChildModules(tree[i].children, modulechanges);
        if (found) {
          found = this.tempExternalModuleChanges;
          return found;
        }
      }
    }
    return tree;
  }
  /**
   * convert tree data to flatten array
   * @param  {any} tree tree data
   * @param  {any} key flatten by key value
   * @param  {any} idKey flatten id
   * @param  {any} collection out put array collection
   * @return 
   * @memberof ModuleService
   */
  treeToFlatten(tree, key, idKey, collection) {
    if (_.isEmpty(tree)) return;
    if (!tree[key] || tree[key].length === 0) return;
    for (var i = 0; i < tree[key].length; i++) {
      var child = tree[key][i];
      if (child[idKey] >= 0) {
        //  collection[child[idKey]] = child;
        collection.push(child);
      }
      this.treeToFlatten(child, key, idKey, collection);
    }
    return;
  }
  /**
   * extract object from tree
   * @param  {any} arr array
   * @param  {any} key key
   * @return 
   * @memberof ModuleService
   */
  extractObjectFromTree(arr, key) {
    var formatedArr = [];
    if (_.isArray(arr)) {
      _.each(arr, (d) => {
        formatedArr.push(d[key]);
      });
    }
    return formatedArr;
  }
  /**
   * get current legos
   * @param  {any} [legoId] legoid
   * @return 
   * @memberof ModuleService
   */
  getCurrentLegos(legoId?) {
    var selectedModuleId = (legoId != null && legoId != undefined) ? legoId : this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    var currentmodules = this.findChildModules(this.treeModules, null, selectedModuleId);
    var flattenArr = [];
    this.treeToFlatten(currentmodules, "children", "legoId", flattenArr);
    return this.extractObjectFromTree(flattenArr, "legoId")
  }
  /**
   * inject external updates to tree 
   * @param  {any} legoId 
   * @param  {any} mode 
   * @param  {any} updateGroups 
   * @return 
   * @memberof ModuleService
   */
  updateTreeObjects(legoId, mode, updateGroups) {
    // var groups = _.groupBy(updateGroups,(d)=>{
    //   return d.legoId
    // })
    var tree = _.cloneDeep(this.findChildModules(this.treeModules, null, legoId));
    var flattenArr = [];
    this.treeToFlatten(tree, "children", "legoId", flattenArr);
    flattenArr = _.remove(flattenArr, (a: any) => {
      return (a.cType != 'E' && a.cType != 'D' && a.cType != null);
    });
    var parentLego = _.clone(tree);
    parentLego.children = [];
    parentLego.parentId = 0;
    flattenArr.push(parentLego);

    return this.FeatureunflattenEntities(flattenArr, mode, updateGroups) || [];
  }
  /**
   * externally unflatten service - convert array to treee
   * @param  {any} arr 
   * @param  {any} mode 
   * @param  {any} updateGroups 
   * @return 
   * @memberof ModuleService
   */
  FeatureunflattenEntities(arr, mode, updateGroups) {
    var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem: any;
    // _.each(groups,function(v,k){ console.log(v,k) })
    // First map the nodes of the array to an object -> create a hash table.
    //_.sortBy(arr, ['legoId']);
    var recursiveChildCount = function (recureMap, mElem) {
      if (!_.isEmpty(recureMap[mElem['parentId']])) {
        recureMap[mElem['parentId']].legoCount += 1;
        var innermappedElem = recureMap[mElem['parentId']];
        if (innermappedElem.parentId) {
          recursiveChildCount(recureMap, innermappedElem);
        }
      }
    }
    for (var i = 0; i < arr.length; i++) {
      arrElem = arr[i];
      mappedArr[arrElem.legoId] = arrElem;
      mappedArr[arrElem.legoId]['children'] = [];
      mappedArr[arrElem.legoId]['childCount'] = 0;
    }
    for (var legoId in mappedArr) {
      if (mappedArr.hasOwnProperty(legoId)) {
        mappedElem = mappedArr[legoId];
        mappedElem.legoCount = 0;
        mappedElem.type = "Folder";
        var externalCount = 0;
        mappedElem.externalCount = 0;
        mappedElem.actual = "";
        mappedElem.metric = "";
        mappedElem.target = "";
        if (mode == "performanceChange" && mappedElem.parentId != 0) {
          var metrics = _.filter(updateGroups, (m) => {
            return (m.legoId == legoId)
          });
          if (!_.isEmpty(metrics)) {
            mappedElem.externalCount = metrics.length;

            _.each(metrics, (met) => {
              mappedElem['children'].push(met);
            });

          }
        }
        else if (mode == "documentChange" && mappedElem.parentId != 0) {
          var documents = _.filter(updateGroups, (d) => {
            return (d.legoId == legoId)
          });
          if (!_.isEmpty(documents)) {
            mappedElem.externalCount = documents.length;

            _.each(documents, (doc) => {
              mappedElem['children'].push(doc);
            });

          }
        }

        else if (mode == "reportChange" && mappedElem.parentId != 0) {
          var reports = _.filter(updateGroups, (d) => {
            return (d.legoId == legoId)
          });
          if (!_.isEmpty(reports)) {
            reports[0].tempId = legoId;
            reports[0].tempmodcount = reports[0].subModuleCount;
            // reports[0].tempmodname = reports[0].sub_ModuleName;     
            mappedElem.externalCount = reports.length;

            _.each(reports, (doc) => {
              mappedElem['children'].push(doc);
            });

          }
        }

        else if (mode == "reportChange" && mappedElem.parentId == 0) {
          var reports = _.filter(updateGroups, (d) => {
            return (d.legoId == legoId)
          });
          if (!_.isEmpty(reports)) {
            reports[0].tempId = legoId;
            reports[0].tempmodcount = reports[0].subModuleCount;
            // reports[0].tempmodname = reports[0].sub_ModuleName; 
            mappedElem.externalCount = reports.length;

            _.each(reports, (doc) => {
              mappedElem['children'].push(doc);
            });

          }
        }

        if (mode == "performanceChange") {
          mappedElem.path = " [ #Submodules " + mappedElem.legoCount + " / #Metrics  " + mappedElem.externalCount + " ]";
        }
        else if (mode == "documentChange") {
          mappedElem.path = " [ #Submodules " + mappedElem.legoCount + " / #Documents  " + mappedElem.externalCount + " ]";
        }
        else if (mode == "reportChange") {
          mappedElem.path = " [ #Submodules " + mappedElem.legoCount + " / #Documents  " + mappedElem.externalCount + " ]";
        }
        mappedElem.expanded = true;
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentId) {
          if (!_.isEmpty(mappedArr[mappedElem['parentId']])) {
            recursiveChildCount(mappedArr, mappedElem);
            if (mode == "performanceChange") {
              mappedArr[mappedElem['parentId']].path = " [ #Submodules " + mappedArr[mappedElem['parentId']].legoCount + " / #Metrics  " + mappedArr[mappedElem['parentId']].externalCount + " ]";
            }
            else if (mode == "documentChange") {
              mappedArr[mappedElem['parentId']].path = " [ #Submodules " + mappedArr[mappedElem['parentId']].legoCount + " / #Documents  " + mappedArr[mappedElem['parentId']].externalCount + " ]";
            }
            else if (mode == "reportChange") {
              mappedArr[mappedElem['parentId']].path = " [ #Submodules " + mappedArr[mappedElem['parentId']].legoCount + " / #Reports  " + mappedArr[mappedElem['parentId']].externalCount + " ]";
            }
            mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
            // _.sortBy(mappedArr[mappedElem['parentId']]['children'], ['position']);
            // mappedArr[mappedElem['parentId']]['children'].sort(function (a, b) {
            //   return ((a.position - b.position));
            // });
          }

          // if(mappedArr[mappedElem['parentId']]['legoId'] == 3)
          // {
          // }
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          // mappedElem.childCount = children.length;
          tree.push(mappedElem);
        }
      }

    }


    return tree;
  }

  /**
   * update child count if children of parent module get updated.
   * @param  {*} tree 
   * @return 
   * @memberof ModuleService
   */
  updateChildCount(tree: any) {
    var i = 0, found;
    for (; i < tree.length; i++) {
      tree[i].childCount = 0;
      if (_.isArray(tree[i].children)) {
        var tempArr = [];
        var iLimit = 0;
        var dupIdx = _.findIndex(tree[i].children, (d) => {
          return (d.legoId < 0)
        });
        if (dupIdx > -1) {
          iLimit = 1;
        }
        if (tree[i].children.length > iLimit) {
          this.treeToFlatten(tree[i], "children", "legoId", tempArr);
        }
        tree[i].childCount = tempArr.length;
        found = this.updateChildCount(tree[i].children);
        // if (found) {
        //   return found;
        // }
      }
      else return;
    }
    // return result;
  }

  /**
   * get parent to child path
   * @param  {any} legoId legoid
   * @return 
   * @memberof ModuleService
   */
  getparenttochildpath(legoId) {
    this.selectedModuleId = legoId;
    return this.traversechildToParent(this.moduleList, this.selectedModuleId);
  }
  updateReferenceModuleRenames(tree, orgLego) {
    _.forEach(tree, (val, key) => {
      console.log(key, val);
      if (val.referenceLegoId == orgLego.legoId) {
        val.legoName = orgLego.legoName;
        val.tooltipLegoName = this.shortenText(orgLego.legoName, (this.zoomsize - 65), '...', false, val);
      }
      if (_.isArray(val.children)) {
        if (val.children.length > 0) {
          this.updateReferenceModuleRenames(val.children, orgLego);
        }
      }
    });
  }
}