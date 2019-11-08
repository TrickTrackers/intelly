import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';

import { CommonAppService } from '../../../services/appservices/common-app.service';
import { MasterService } from '../../../services/master.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { LocalStorageService } from '../../../shared/local-storage.service';

import * as _ from 'lodash';
import * as $ from 'jquery';
import { AppConstant } from '../../../app.constant';
import * as moment from 'moment';
import { Router , ActivatedRoute, Params} from '@angular/router';
import { ModuleService } from '../../../services/module.services';
import { UPModelService } from '../../../services/appservices/userpanelservices/upmodel.service';
import { Subscription } from 'rxjs/Subscription';
import {OverlayPanel} from 'primeng/overlaypanel';

@Component({
  selector: 'app-bookmark-page',
  templateUrl: './bookmark-page.component.html',
  styleUrls: ['./bookmark-page.component.scss']
})

export class BookmarkPageComponent implements OnInit , AfterViewInit{
  private _subscriptions = new Subscription();
  @ViewChild('bookmarkpage') private elementRef: ElementRef;
  userinfo: any =[];
  bookmark: any =[];
  bookmark_description:any;
  selectedModule : any;
  selectedModuleId : any;
  selectedModelId : any;
  constructor(
    private MasterService: MasterService, private MessageService: MessageService, private ModuleService: ModuleService,
    private CommonAppService: CommonAppService, private LocalStorageService: LocalStorageService,
    private router: Router, private UPModelService : UPModelService) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    
    this.GetBookmark();

  }
  
  ngOnInit() {
    this.selectedModule = this.ModuleService.selectedTreeModules;
    this._subscriptions.add(
      this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
        if (updates.treeModules) {
          this.selectedModule = updates.treeModules;
        }
      }));
  }
  ngAfterViewInit() {
    console.log("bookmark")
  }

  // ngAfterViewChecked() {
  //   // var querystring;
  //   // this.router.routerState.root.queryParams.subscribe((params: Params) => {
  //   // });
  //   //this.activateModuleTabs(this.querystring);
  // }
  bookmarkEvent(event, overlaypanel: OverlayPanel){
    this.GetBookmark();
    overlaypanel.toggle(event);
  }
  bookmarkHomePage() { ;  
    this.router.navigate(['/home']);  
  }
  bookmarkPage(boomark) {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    if(boomark.modelId != this.selectedModelId && boomark.modelId != 0 && boomark.modelId != null && boomark.modelId != undefined)
    {
      this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel,boomark.modelId);
      this.ModuleService.setModules();
      setTimeout(() => {
        this.redirecttoSelectedModule(boomark);
      },3000);
    }
    else
    {
      this.redirecttoSelectedModule(boomark);
    }
   // this.router.navigateByUrl(b.link); 
  }
  redirecttoSelectedModule(boomark)
  {
    
    var treemodules = this.ModuleService.getTreeModules();
    if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
      if (treemodules.length > 0) {
        var treenodes = _.cloneDeep(treemodules);
        var m = this.ModuleService.findChildModules(treenodes, null, boomark.moduleId);
        if(! _.isEmpty(m))
        {
          this.ModuleService.setSelectedModule(m);
          //return this.ModuleService.redirecttoSelectedModule(m);
        }
      }
    }
    this.router.navigateByUrl(boomark.link);
  }
  addBookmark(){
    var lId;
    // this.router.routerState.root.queryParams.subscribe((params: Params) => {
    //    lId = params['lId'];
      
    // });
    // if(this.bookmark_description == undefined || this.bookmark_description == null || this.bookmark_description == ''){
    //   this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Description Needed." });  
    //   return;
    // }
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var req = {
      ModuleId : this.selectedModuleId,
      ModelId : this.selectedModelId,
      Description : this.bookmark_description,
      CompanyId : this.userinfo.CompanyId,
      Link : this.router.url,
      DateTime : moment().format('DD/MM/YYYY ,hh:mm a').toString()
    };
    
    this.UPModelService.AddBookmark(req)
    .then(res => {        
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            var result = res.result;
            if (result != null) {
              this.bookmark_description = '';
              this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Bookmark Add  Successfully." });  
              this.GetBookmark();
            }
          }
          else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
            return false;
          }
          
        }
        else {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
          return false;
        }
      }
    }, error => {
      //console.log("Error Happend");

    })
    
  }

  GetBookmark(){
   
    var req = {     
      CompanyId : this.userinfo.CompanyId
    };
    
    this.UPModelService.GetBookmark(req)
    .then(res => {        
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.bookmark = res.result;            
          }
          else {
            this.bookmark = res.result;  
            //this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
            return false;
          }
          
        }
        else {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
          return false;
        }
      }
    }, error => {
      //console.log("Error Happend");

    })
    
  }

  removeBookmark(book){
   
    var req = {     
      CompanyId : book.companyId,
      BookmarkId : book.bookmarkId,
      ModuleId : book.moduleId
    };
    
    this.UPModelService.removeBookmark(req)
    .then(res => {        
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.GetBookmark(); 
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: 'Bookmark removed successfully' });                    
          }
          else {
            //this.GetBookmark();
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
            return false;
          }
          
        }
        else {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
          return false;
        }
      }
    }, error => {
      //console.log("Error Happend");

    })
    
  }
}
