import { Component, OnInit, Output, Input, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { CommonAppService } from '../../../../app/services/appservices/common-app.service';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { AppConstant } from '../../../app.constant';
import { UPPreferenceService } from '../../../services/appservices/userpanelservices/preference.service';
import { ModuleService } from '../../../services/module.services';
import { MasterService } from '../../../services/master.service';
import * as moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
@Component({
  selector: 'app-preference-menu',
  templateUrl: './preference-menu.component.html',
  styleUrls: ['./preference-menu.component.css']
})

export class PreferenceMenuComponent implements OnInit {
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  preferencesettings: any = [];
  defaultModelHierarchy: any = [];
  userinfo: any = [];
  preference: any = [];
  modal_dialog: boolean = false;
  display: boolean = false;
  module_levels: any = [];
  displayModuleLevel: boolean = false;
  preferenceSettingModel: any = {
    employeeId: null,
    defaultMouseClick: null,
    displayMenu: null,
    defaultDocAccess: null,
    docAccessType: null,
    isPriority: null,
    isBoardDefault: null,
    taskDefaultFilter: null,
    defaultModel: null,
    defaultModule: null,
    defaultTab: null,
    options: null,
    date_Format: null,
    labelId: 0,
    ganttScale: 1,
    isGanttExpand: 0,
    isEnableText: false,
    isEnableEmail: false
  };
  selectedLanguage = 'en';
  public selectedModuleId: any;
  public selectedModelId: any;
  queryparams: any = [];
  dateformatList: any = [];
  date_description: any;
  dateformatList_temp: any = [];
  colors = {
    name: " #cc33ff",
    isnew: true
  }
  company_label: any = [];//Label Company
  cmpLabelListDropdown: any;//Label Company
  company_label_clone: any = [];//Label Company
  selectedcolor_list: any = [];//selected color list
  new_color_list: any;
  selectedColor_temp: any;
  Addcompanylabel_dialog = false;
  cmp_toggle: boolean = false;
  companylabel_temp: any;
  labelTitle: any;
  label_popupheader: any = {
    title: "Add Label",
    labelId: 0,
    option: 4
  };
  editFlag: boolean = false;
  labelUser: any = 0;
  customdata = [{
    label: "Company Labels",
    items: null
  },
  {
    label: "Personal Labels",
    items: null
  }
  ];
  private _subscriptions = new Subscription();
  value: any = "General";
  isShowTextMsg: boolean = false;
  isShowEmailMsg: boolean = false;
  constructor(private MessageService: MessageService, private LocalStorageService: LocalStorageService, private ModuleService: ModuleService,
    private UPPreferenceService: UPPreferenceService, private commonAppService: CommonAppService, private Router: Router
    , private ActivatedRoute: ActivatedRoute, private MasterService: MasterService
    , private confirmationService: ConfirmationService, private cd: ChangeDetectorRef) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    if (this.userinfo != undefined && this.userinfo != null) {
      this.preferenceSettingModel.employeeId = parseInt(this.userinfo.EmployeeId);
    }
    this.preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);

    this.preference.ganttScale = (this.preference.ganttScale != null && this.preference.ganttScale != undefined ? this.preference.ganttScale.toString() : "1");

    this.dateformatList_temp.name = this.preference.date_Format;
    this.preference.isGanttExpand = (this.preference.isGanttExpand != null && this.preference.isGanttExpand != undefined && this.preference.isGanttExpand == 1 ? true : false);
    this.date_description = new Date();
    this.date_description = moment(this.date_description).format(this.preference.date_Format);
    this.getDateFormatList();
    this.getSelectedDefaultModuleTree();
    this._subscriptions.add(this.Router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.prefer = params['prefer'];
      if (this.queryparams.prefer != undefined && this.queryparams.prefer != null && this.queryparams.prefer != "") {
        this.showDialog();

      }

    }));

  }
  setGoogleLanguage() {
    //console.log(this.selectedLanguage);
    //this.localStorage.setItem(this.selectedLanguage);
    this.LocalStorageService.addItem("lang", this.selectedLanguage);
    // googtrans(en|ta)
    var queryParams: any = _.clone(this.ActivatedRoute.snapshot.queryParams);
    queryParams.lang = "googtrans(en|" + this.selectedLanguage + ")";
    //  this.Router.navigate(['.'], { queryParams: queryParams });
    window.location.href = window.location.href + "&" + "googtrans(en|" + this.selectedLanguage + ")";
    location.reload();
  }
  ngOnInit() {
  }
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }
  showDialog() {
    this.preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    this.preference.ganttScale = (this.preference.ganttScale != null && this.preference.ganttScale != undefined ? this.preference.ganttScale.toString() : "1");
    this.getCompanyLabels();
    this.modal_dialog = false;
    if (this.queryparams.prefer != undefined && this.queryparams.prefer != null && this.queryparams.prefer != "") {
      this.modulesubTabset.tabs[4].active = true;
    }
    else {
      this.modulesubTabset.tabs[0].active = true;
    }
    this.display = true;
  }
  close_preference() {
    this.display = false;
    this.Router.navigate([], { queryParams: { prefer: null }, queryParamsHandling: 'merge' });
  }


  // // set external changes to emit the perference settings changes code here
  getPreferenceExternalChanges() {
    this.commonAppService.getPreferenceSettings().subscribe((preferencesettings: any) => {
      this.preferencesettings = preferencesettings;
    });
  }
  // update preference settings changes code here
  updatePreferenceSettings() {
    this.preference.isGanttExpand = (this.preference.isGanttExpand != null && this.preference.isGanttExpand != undefined && this.preference.isGanttExpand == true ? 1 : 0);
    this.preferenceSettingModel.defaultMouseClick = (this.preference.defaultMouseClick != null && this.preference.defaultMouseClick != undefined && this.preference.defaultMouseClick == true ? 1 : 0);
    this.preferenceSettingModel.displayMenu = (this.preference.displayMenu != null && this.preference.displayMenu != undefined && this.preference.displayMenu == true ? 1 : 0);
    this.preferenceSettingModel.defaultDocAccess = (this.preference.defaultDocAccess != null && this.preference.defaultDocAccess != undefined && this.preference.defaultDocAccess == 1 ? 1 : 0);
    this.preferenceSettingModel.docAccessType = (this.preference.docAccessType != null && this.preference.docAccessType != undefined && this.preference.docAccessType == true ? 1 : 0);
    this.preferenceSettingModel.isPriority = (this.preference.isPriority != null && this.preference.isPriority != undefined && this.preference.isPriority == true ? 1 : 0);
    this.preferenceSettingModel.isBoardDefault = (this.preference.isBoardDefault != null && this.preference.isBoardDefault != undefined && this.preference.isBoardDefault == true ? 1 : 0);
    this.preferenceSettingModel.taskDefaultFilter = (this.preference.taskDefaultFilter != null && this.preference.taskDefaultFilter != undefined && this.preference.taskDefaultFilter != "" ? this.preference.taskDefaultFilter : 1);
    this.preferenceSettingModel.defaultModel = (this.preferenceSettingModel.defaultModel != null && this.preferenceSettingModel.defaultModel != undefined && this.preferenceSettingModel.defaultModel != "" ? this.preferenceSettingModel.defaultModel : this.preference.defaultModel);
    this.preferenceSettingModel.defaultModule = (this.preferenceSettingModel.defaultModule != null && this.preferenceSettingModel.defaultModule != undefined && this.preferenceSettingModel.defaultModule != "" ? this.preferenceSettingModel.defaultModule : this.preference.defaultModule);
    this.preferenceSettingModel.defaultTab = (this.preference.defaultTab != null && this.preference.defaultTab != undefined && this.preference.defaultTab != "" ? this.preference.defaultTab : 1);
    this.preferenceSettingModel.labelId = (this.preference.labelId != null && this.preference.labelId != undefined && this.preference.labelId != "" ? this.preference.labelId : 0);
    this.preferenceSettingModel.ganttScale = (this.preference.ganttScale != null && this.preference.ganttScale != undefined && this.preference.ganttScale != "" ? this.preference.ganttScale : 1);
    this.preferenceSettingModel.isGanttExpand = (this.preference.isGanttExpand != null && this.preference.isGanttExpand != undefined && this.preference.isGanttExpand != "" ? this.preference.isGanttExpand : 0);
    this.preferenceSettingModel.isEnableText = (this.preference.isEnableText != null && this.preference.isEnableText != undefined ? this.preference.isEnableText : false);
    this.preferenceSettingModel.isEnableEmail = (this.preference.isEnableEmail != null && this.preference.isEnableEmail != undefined ? this.preference.isEnableEmail : false);
    this.preferenceSettingModel.options = 1;

    this.preferenceSettingModel.date_Format = (this.dateformatList_temp.name != null && this.dateformatList_temp.name != undefined && this.dateformatList_temp.name != "" ? this.dateformatList_temp.name : 'MM/DD/YYYY');
    var getDate = new Date();
    this.date_description = moment(getDate).format(this.preferenceSettingModel.date_Format);
    //this.date_description = this.dateformatList_temp.name.description;
    $("#main_viewpoint").removeAttr("style");
    if (!_.isEmpty(this.preferenceSettingModel)) {
      this.UPPreferenceService.updatePreference(this.preferenceSettingModel)
        .then(res => {
          if (res) {
            if (!_.isEmpty(res)) {
              if (res.status == 1) {
                var result = res.result;
                if (result != null) {
                  this.preference = res.result[0];
                  if (!_.isEmpty(this.preference)) {
                    this.commonAppService.configurePreferenceSettings(this.preference);
                    this.getPreferenceExternalChanges();
                    this.getSelectedDefaultModuleTree();
                  }
                }
              }
              else {
                //this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                return false;
              }
            }
            else {
              //this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
              return false;
            }
          }
        },
          error => {
            //console.log("Error Happend");
          });
    }
  }
  setDefaultModelModule() {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    //console.log(this.preference);
    this.preferenceSettingModel.defaultModel = this.selectedModelId;
    this.preferenceSettingModel.defaultModule = this.selectedModuleId;
    this.updatePreferenceSettings();
    // this.module_levels = this.ModuleService.getBreadcrumb();
    this.displayModuleLevel = true;

  }
  revertDefaultModelModule() {
    this.preferenceSettingModel.defaultModel = this.preference.defaultModel;
    this.preferenceSettingModel.defaultModule = this.preference.defaultModule;
    this.displayModuleLevel = false;
  }
  getSelectedDefaultModuleTree() {
    this.defaultModelHierarchy = [];
    var defaultModule = this.preference.defaultModule;
    if (defaultModule != 0) {
      var req = {
        legoId: defaultModule
      };
      this.ModuleService.getChildrenToModel(req).then(res => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              this.defaultModelHierarchy = res.result;
              this.displayModuleLevel = true;
            }
          }
        }
      });
    }

  }

  getDateFormatList() {
    this.MasterService.loadDateFormatList().then((res) => {
      this.dateformatList = res;
      var dateformat = _.filter(this.dateformatList, (d) => {
        return (d.name == this.dateformatList_temp.name);
      });

      this.dateformatList_temp = dateformat[0];
      this.date_description = new Date();
      this.date_description = moment(this.date_description).format(this.dateformatList_temp.name);//this.dateformatList_temp.description;
    });
  }

  getCompanyLabels() { // get company label list 
    var m = this.preference.labelId;
    this.preference.labelId = 0;
    var req: any = {
      "companyId": this.userinfo.CompanyId,
      "createdBy": this.userinfo.EmployeeId,
      "options": 3
    };

    this.UPPreferenceService.GetCompanyLables(req).then((res: any) => {
      if (res) {
        if (res.status) {
          var label_list = res.result;
          this.company_label = res.result;
          this.company_label_clone = _.cloneDeep(this.company_label);
          this.cmpLabelListDropdown = this.MasterService.formatDataforDropdown("labelTitle", this.company_label, "Select Label", "labelId");

        }
        else {
          this.company_label = [];
          this.cmpLabelListDropdown = this.MasterService.formatDataforDropdown("labelTitle", this.company_label, "Select Label", "labelId");
        }
      }
    });
  }



  selectedDropdownlabel(label, option) {
    this.selectedcolor_list = [];
    var color_label = _.find(this.company_label, (c) => {
      return c.labelId == label;
      //return c.labelColor == label;
    });
    if (color_label == undefined || color_label == null) {
      this.selectedcolor_list = [];
      this.labelUser = 0;
    }
    else {
      this.labelUser = color_label.createdBy;
      var selectedcolor = color_label.labelColor;
      var color_lists = _.split(selectedcolor, ',');
      _.each(color_lists, (r) => {
        var color = {
          name: r,
          isnew: false
        };
        this.selectedcolor_list.push(color);
      });
    }

    // if (option == 2) {
    //   this.updatePreferenceSettings();
    // }
  }

  addNewlbl_popup()//newly added
  {
    this.label_popupheader = [];
    this.new_color_list = [];
    //this.clear_cmplables();
    var colorObj = {
      name: "#ddd",
      isnew: false
    }
    this.new_color_list.push(colorObj);
    this.labelTitle = null;
    this.label_popupheader.title = "Add Label";
    this.label_popupheader.labelId = 0;
    this.label_popupheader.option = 4;
    this.Addcompanylabel_dialog = true;
  }

  addCompanyColor() {
    var colorObj = {
      name: "#ddd",
      isnew: true
    }
    this.new_color_list.push(colorObj);
    this.cmp_toggle = true;
  }

  onChangeCmpColor($event, index, color: any, colorelement: any) {
    //console.log(color)
    this.new_color_list[index].name = $event;
    this.new_color_list[index].isnew = false;
    var colornames = [];
    _.forEach(this.new_color_list, (s) => {
      return colornames.push(s.name);
    });
    this.companylabel_temp = _.join(colornames, ',');
  }

  AddUpdateLabels(labelTitle, selectedlabel) {
    this.MessageService.clear();
    if (labelTitle == "" || labelTitle == null || labelTitle == undefined) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter valid title.' });
      return false;
    }
    var newlabel = labelTitle.trim();
    var isExist = _.find(this.company_label, (c) => {
      return (c.labelTitle.trim() == newlabel)
    });

    if (isExist != undefined || isExist != null) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Label Tiltle already Exists.' });
      return false;
    }
    var temp_color = this.new_color_list[0].name;
    var isColor = _.find(this.company_label, (c) => {
      return (c.labelColor == temp_color)
    });
    if (isColor != undefined || isColor != null) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'selected color already Exists.' });
      return false;
    }

    // if (this.new_color_list.length <= 1) {
    //   this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'add minimum two colors.' });
    //   return false;
    // }

    var colornames = [];
    _.forEach(this.new_color_list, (s) => {
      return colornames.push(s.name);
    });
    var labelColor = _.join(colornames, ',');
    var req = {
      // companyId: this.userinfo.CompanyId,
      // createdBy: this.userinfo.EmployeeId,
      // labelTitle: labelTitle,
      // labelColor: labelColor,
      // Options: 4

      companyId: this.userinfo.CompanyId,
      createdBy: this.userinfo.EmployeeId,
      labelTitle: labelTitle,
      labelColor: labelColor,
      labelId: selectedlabel.labelId,
      Options: selectedlabel.option
    };
    this.UPPreferenceService.addupdatecmplabel(req).then((res: any) => {
      if (res) {
        if (res.status) {
          if (!_.isEmpty(res.result)) {
            var label_list = res.result;
            this.company_label = res.result;
            this.company_label_clone = _.cloneDeep(this.company_label);
            this.cmpLabelListDropdown = this.MasterService.formatDataforDropdown("labelTitle", this.company_label, "Select Label", "labelId");
            var newlabel = _.find(this.company_label, (c) => {
              return (c.labelTitle == labelTitle)
            });
            this.preference.labelId = newlabel.labelId;
            this.updatePreferenceSettings();
            this.selectedcolor_list = [];
            var selectedcolor = newlabel.labelColor;
            var color_lists = _.split(selectedcolor, ',');
            _.each(color_lists, (r) => {
              var color = {
                name: r,
                isnew: false
              };
              this.selectedcolor_list.push(color);
            });
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully Added.' });
            this.Addcompanylabel_dialog = false;
          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Failed.' });
          }
        }
      }
    });
  }

  editlbl_popup(selectedcolor, labelId)//newly added
  {
    this.Addcompanylabel_dialog = false;
    this.label_popupheader = [];
    this.new_color_list = [];
    //this.selectedColor_temp = selectedcolor;
    var isColor = _.find(this.company_label, (c) => {
      return (c.labelId == labelId)
    });
    var colorObj = {
      name: isColor.labelColor,
      isnew: false
    }
    this.new_color_list.push(colorObj);
    var color_label = _.find(this.company_label, (c) => {
      return c.labelId == labelId;
    });
    this.labelTitle = color_label.labelTitle;
    this.label_popupheader.createdBy = color_label.createdBy;
    this.label_popupheader.title = "Edit Label";
    this.label_popupheader.labelId = color_label.labelId;
    this.label_popupheader.option = 5;
    if (this.userinfo.EmployeeId == color_label.createdBy) {
      this.Addcompanylabel_dialog = true;
    }
    else {

      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Not Having Permission.' });
    }

  }

  UpdateLabels(labelTitle, selectedlabel) {
    this.MessageService.clear();
    if (labelTitle == "" || labelTitle == null || labelTitle == undefined) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter valid title.' });
      return false;
    }
    var newlabel = labelTitle.trim();
    var isExist = _.find(this.company_label, (c) => {
      return (c.labelTitle.trim() == newlabel && c.labelId != selectedlabel.labelId)
    });

    if (isExist != undefined || isExist != null) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Label Tiltle already Exists.' });
      return false;
    }
    var temp_color = this.new_color_list[0].name;
    var isColor = _.find(this.company_label, (c) => {
      return (c.labelColor == temp_color && c.labelId != selectedlabel.labelId)
    });
    if (isColor != undefined || isColor != null) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'selected color already Exists.' });
      return false;
    }
    var colornames = [];
    _.forEach(this.new_color_list, (s) => {
      return colornames.push(s.name);
    });
    var labelColor = _.join(colornames, ',');
    var req = {
      companyId: this.userinfo.CompanyId,
      createdBy: this.userinfo.EmployeeId,
      labelTitle: labelTitle,
      labelColor: labelColor,
      labelId: selectedlabel.labelId,
      Options: selectedlabel.option,
      modifiedBy: this.userinfo.EmployeeId
    };
    this.UPPreferenceService.addupdatecmplabel(req).then((res: any) => {
      if (res) {
        if (res.status) {
          if (!_.isEmpty(res.result)) {
            var label_list = res.result;
            this.company_label = res.result;
            this.company_label_clone = _.cloneDeep(this.company_label);
            this.cmpLabelListDropdown = this.MasterService.formatDataforDropdown("labelTitle", this.company_label, "Select Label", "labelId");
            var newlabel = _.find(this.company_label, (c) => {
              return (c.labelTitle == labelTitle)
            });
            this.preference.labelId = newlabel.labelId;
            this.updatePreferenceSettings();
            this.selectedcolor_list = [];
            var selectedcolor = newlabel.labelColor;
            var color_lists = _.split(selectedcolor, ',');
            _.each(color_lists, (r) => {
              var color = {
                name: r,
                isnew: false
              };
              this.selectedcolor_list.push(color);
            });
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully Updated.' });
            this.Addcompanylabel_dialog = false;
          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Updation Failed.' });
          }
        }
      }
    });
  }

  DeleteLabel(labelId) {
    this.MessageService.clear();
    this.new_color_list = [];
    var isColor = _.find(this.company_label, (c) => {
      return (c.labelId == labelId)
    });
    var colorObj = {
      name: isColor.labelColor,
      isnew: false
    }
    this.new_color_list.push(colorObj);
    var color_label = _.find(this.company_label, (c) => {
      return c.labelId == labelId;
    });

    if (this.userinfo.EmployeeId != color_label.createdBy) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Not Having Permission.' });
      return false;
    }

    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {

        var req = {
          companyId: color_label.companyId,
          createdBy: color_label.createdBy,
          labelId: color_label.labelId,
          Options: 6,
        };

        this.UPPreferenceService.DeleteLabel(req)
          .then(res => {
            if (res) {
              if (res.status == 1) {
                if (!_.isEmpty(res.result)) {
                  var label_list = res.result;
                  this.company_label = res.result;
                  this.company_label_clone = _.cloneDeep(this.company_label);
                  this.cmpLabelListDropdown = this.MasterService.formatDataforDropdown("labelTitle", this.company_label, "Select Label", "labelId");
                  this.preference.labelId = 0;
                  this.updatePreferenceSettings();
                  this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully Deleted.' });
                  this.Addcompanylabel_dialog = false;
                }
                else {
                  this.company_label = [];
                  this.company_label_clone = _.cloneDeep(this.company_label);
                  this.cmpLabelListDropdown = this.MasterService.formatDataforDropdown("labelTitle", this.company_label, "Select Label", "labelId");
                  this.preference.labelId = 0;
                  this.updatePreferenceSettings();
                  this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully Deleted.' });
                  this.Addcompanylabel_dialog = false;
                }
              }
              else {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'Deletion Failed.' });
              }
            }
          }, error => {
            console.log("Error Happend");

          })
      }
    });
  }
  onSelectTab(event) {
    var req = {
      CompanyId: this.userinfo.CompanyId,
      Options: 1
    }
    if (event.heading == "Messaging") {
      this.UPPreferenceService.getMessageSettings(req)
        .then((res) => {
          if (!_.isEmpty(res)) {
            if (res.status = 1) {
              if (res.result != null) {
                console.log(res.result);
                this.isShowTextMsg = res.result.isEnableText;
                this.isShowEmailMsg = res.result.isEnableEmail;
              }
            }
          }
        })
        .catch((error) => {
          // console.log(error)
        })

    }
  }
}
