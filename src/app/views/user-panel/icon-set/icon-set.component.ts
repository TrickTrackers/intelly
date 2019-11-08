import { Component, OnInit, Input , Output,EventEmitter} from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { SubmoduleService } from '../../../services/submodule.service';
import { ModuleService } from '../../../services/module.services';
import { DomSanitizer } from "@angular/platform-browser";
import { AppConstant } from '../../../app.constant';
import * as appSettings from '../../../../assets/constant.json';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Rx';
@Component({
  selector: 'app-icon-set',
  templateUrl: './icon-set.component.html',
  styleUrls: ['./icon-set.component.css']
})
export class IconSetComponent implements OnInit {
  @Input() selectedModule = null; 
  @Output() iconChanged: EventEmitter<any> = new EventEmitter();
  appSettings: any = appSettings;
  iconList: any[];
  api_url = "";
  iconPath = "";
  selectedIcon: any;
  uploadedicon: any[];
  url: string = "";
  userInfo: any;
  selectedModuleId: any;
  iconFileSIze = 20480;
  iconDimLimit = 100;
  constructor(public ModuleService: ModuleService, public SubmoduleService: SubmoduleService, private _DomSanitizationService: DomSanitizer,
    public LocalStorageService: LocalStorageService, private MessageService: MessageService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.iconPath = this.api_url + AppConstant.API_CONFIG.API_URL.iconPath;
    //this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.userInfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.iconFileSIze = AppConstant.API_CONFIG.API_URL.iconsizeLimit;
    this.iconDimLimit = AppConstant.API_CONFIG.API_URL.iconDimLimit;
    this.getIconList();
  }

  ngOnInit() {
  }
  getIconList() {
    this.SubmoduleService.GetDirectoryIconList({}).then(res => {
      //console.log("login response", res);
      if (res) {
        if (res.status == 1) {
          // this.iconList = res.result;
          this.iconList = _.map(res.result, (i) => {
            var icon = {
              label: i,
              value: i
            }
            return icon;
          });
        }
      }
    });
  }

  public inputChange(inputElement) {
    var files = inputElement.files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      let img = document.createElement('img');
      img.src = window.URL.createObjectURL(file);
      let reader = new FileReader();
      reader.addEventListener('load', (event: any) => {
        var i = new Image();
        i.src = event.target.result;
        i.onload = (prop: any) => {
          var src = prop.srcElement;
          if (src.width > this.iconDimLimit || src.height > this.iconDimLimit) {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Image width and height should be less than 100 pixels." });
          }
          else {
            var filevalid: any = this.imageValidation(file);
            if (filevalid.valid) {
              var formData = new FormData();
              formData.append(file.name, file);
              formData.append("legoId", this.selectedModule);
              this.uploadfile(formData, inputElement);
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: filevalid.message });
            }
          }
        };

        // inputElement.files=[];
      }, false);

      reader.readAsDataURL(file);
    }
  }
  uploadfile(req, inputElement) {
    this.SubmoduleService.setLegoIcons(req).then(res => {
      //console.log("login response", res);
      if (res) {
        if (res.status == 1) {
          var icon = {
            label: res.result.fileName,
            value: res.result.fileName
          }
          this.iconList.unshift(icon);
          this.selectedIcon = icon;
          this.iconList = [...this.iconList];
        }
      }
    });
  }
  imageValidation(file) {
    var rValue = {
      valid: false,
      message: ""
    };
    var filename = file.name;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if (!allowedExtensions.exec(filename)) {
      rValue.message = "Please upload file having extensions .jpeg/.jpg/.png/.gif only.";
      rValue.valid = false;
    }
    else if (file.size > this.iconFileSIze) {
      rValue.message = "Image size should be less than 4 KB.";
      rValue.valid = false;
    }
    else {
      rValue.valid = true;
    }
    return rValue;
  }

  iconChange() {
    if (this.selectedIcon.value != undefined && this.selectedIcon.value != null && this.selectedIcon.value != "") {
      var req = {
        LegoId: this.selectedModule ,
        icon: this.selectedIcon.value       
      }
      if (!_.isEmpty(req)) {
        this.SubmoduleService.changeLegoIcons(req).then(res => {
          //console.log("login response", res);
          if (res) {
            if (res.status == 1) {
              this.ModuleService.setModules();
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Icon change sucessfull!." });
              this.iconChanged.emit(false);
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Icon change Faild!." });
            }
          }
          else {

          }
        });
      }
    }
    else {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please select one icon" });
    }
  }
}
