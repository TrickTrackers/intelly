import { Component, OnInit, ViewChild, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { component_config } from '../../../_config';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { CollaborationService } from '../../../services/appservices/collaboration.service';
import { AppConstant } from '../../../app.constant';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ModuleService } from '../../../services/module.services';
import { MessageService } from 'primeng/components/common/messageservice';
import { userInfo } from 'os';
import { CommonAppService } from '../../../services/appservices/common-app.service';
@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss']
})
export class CollaborationComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modulesubTabset') modulesubTabset: TabsetComponent;
  @ViewChild("ckeditor") ckeditor: any;
  RequestNotes: any = {
    legoId: 0,
    notes: "",
    options: 0
  };
  Notes: any = "";
  clone_notes = "";
  display: boolean = false;
  addForum: boolean = false;
  config;
  public queryparams: any = [];
  public querystring: any = [];
  value: string = "Notes";
  userinfo: any = [];
  //paramsSubscription: Subscription;
  private paramsSubscription = new Subscription();
  hasRights: boolean = true;
  checkrights: any = [];
  public isRefModule = false;
  constructor(private collaborationService: CollaborationService, private localStorageService: LocalStorageService
    , private router: Router, public ModuleService: ModuleService, private MessageService: MessageService,public CommonAppService:CommonAppService) {
    this.RequestNotes.legoId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    //this.config = {removePlugins : 'elementspath,save,font,clipboard,source,newpage,preview,templates,maximize,showblocks,image,flash,table,about,others,insert,forms,mode,print,smiley,specialchar,iframe,spellchecker,selection,find,PageBreak,div'};
    this.config = component_config.cktool_config_full;
    this.userinfo = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.isRefModule = this.ModuleService.checkIsRefmodule();
    this.paramsSubscription.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      this.CommonAppService.checkPinmodule();
      if (params['t'] == 'stab_collaboration_notes') {
        this.RequestNotes.legoId = this.queryparams.lId;
        this.RequestNotes.options = 1

        if (this.queryparams.mode == 'E') {
          this.RequestNotes.options = 3;
          this.RequestNotes.employeeId = parseInt(this.userinfo.EmployeeId);
        }
        else {
          this.RequestNotes.employeeId = 0;
        }
        this.getNotesData(this.RequestNotes);
      }

    }));
    this.activateModuleTabs(this.queryparams.t);
  }
  onSelectTab(event) {
    if (event.heading == "Module Owner") {
      window.open('mailto:ts@blake.com?Subject=hello', 'email');
      //console.log();
    }
    return false;
    // document.location = "mailto:"+email+"?subject="+subject+"&body="+emailBody;
  }
  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
  ngOnInit() {
    this.initSubscribe();
    this.config = component_config.cktool_config_full;
  }
  ngAfterViewInit() {
    // this.setElementAutoHeight(null);
    this.ModuleService.activateModuleTabs(this.queryparams);
  }
  checkRights() {
    this.checkrights = this.ModuleService.getModuleRights();
    if (!_.isEmpty(this.checkrights)) {
      if (this.queryparams.mode == 'E') {
        var selectedempId = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.EMPINFOID);
        if (this.userinfo.EmployeeId != selectedempId) {
          this.hasRights = false;
        } 
      }
      else if (this.queryparams.mode != 'E' && this.checkrights.collaborationRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
        this.hasRights = true;
      }
      else {
        this.hasRights = false;
      }
    }

    //console.log("rights check", this.checkrights)
  }


  initSubscribe() {
    this.paramsSubscription.add(
      this.ModuleService.getModuleRightsUpdate().subscribe(rights => {
        this.checkrights = rights;
        this.isRefModule = this.ModuleService.checkIsRefmodule();
        this.checkRights();
      })
    );
    this.checkrights = this.ModuleService.getModuleRights();
    this.checkRights();
  }


  showDialog() {
    this.display = true;
  }
  addGoalDialog() {
    this.addForum = true;
  }


  onTabChange(event) {
    if (event.index == 2) {
      location.href = "mailto:blake10@blake.com";
    }
    // //console.log(event);
  }
  onSelect(data: TabDirective): void {
    this.value = data.heading;
    if (this.value == "Module Owner") {
      window.open('mailto:ts@blake.com?Subject=hello', 'email');
      //console.log();
    }
    this.querystring = data.id;
    var newparams = this.queryparams;
    newparams.t = this.querystring;

    //setTimeout(() => this.ckeditor.focus(), 250);
    this.activateModuleTabs(this.querystring);
  }
  openmail(event: any) {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if (this.checkrights.collaborationRights == 'Restricted' || this.checkrights.modelRights == 'Restricted') {
        this.hasRights = false;
        return false;
      }
      else if ((this.checkrights.collaborationRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        return false;
      }
      if (this.isRefModule) {
        return false;
      }
    }
    //console.log(this.modulesubTabset);
    location.href = "mailto:blake10@blake.com";
    window.event.preventDefault();
    event.deselect;
  }
  setElementAutoHeight(event: any) {
    var res_h = $(window).height() - ($('.app-header').innerHeight()
      + $('.app-footer').innerHeight()
      + $('.breadcrumb_container').innerHeight()
      + $('#main_tab_container > .nav-tabs').innerHeight()
      + 2
    );
    if ($("body").hasClass("pinmodule")) {
      res_h += 98;
    }
    //  sub tabs class: sub_tab_container
    var inner_res_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 60);
    var tabcontent_h = res_h - ($('.sub_tab_container > .nav-tabs').innerHeight() + 10);
    $('.main_ckeditor .cke_inner > .cke_contents').each(function () {
      var ck_res_h = inner_res_h - 75;
      $(this).css("height", ck_res_h + "px");
    });
    $("#collaboration-pg .tab-content").css("height", (tabcontent_h) + "px");

  }
  ngAfterViewChecked() {
    this.setElementAutoHeight(null);
  }

  // get the note from database code here
  // onReady(event: any): void {
  //   if (this.ckeditor) {
  //     this.ckeditor = event.editor;
  //     // this.RequestNotes.options = 1
  //     // this.getNotesData(this.RequestNotes);
  //   }
  // }
  onReady(event: any): void {
    // this.RequestNotes.options = 1
    // this.getNotesData(this.RequestNotes);
    if (this.ckeditor) {
      this.ckeditor = event.editor;
      setTimeout(() => event.editor.focus(), 1000);

      //this.getAssessment();
    }
  }
  // add or update the note code here
  addUpdateNotes() {
    this.MessageService.clear();
    if (this.queryparams.mode != 'E') {
      if ((this.checkrights.collaborationRights == 'Readonly' || this.checkrights.modelRights == 'Readonly') && !this.isRefModule) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
        this.Notes = this.clone_notes;
        return false;
      }
    }

    if (this.clone_notes != this.Notes) {
      this.RequestNotes.notes = this.Notes;
      this.RequestNotes.options = 2

      if (this.queryparams.mode == 'E') {
        this.RequestNotes.options = 4;
        this.RequestNotes.employeeId = parseInt(this.userinfo.EmployeeId);
      }
      else {
        this.RequestNotes.employeeId = 0;
      }

      this.getNotesData(this.RequestNotes);
    }
  }
  // call the api method to get the note or add or update code here
  getNotesData(req: any) {
    this.MessageService.clear();
    this.collaborationService.AddUpdateNotes(req)
      .then(data => {
        if (data.status == 1) {
          if (!_.isEmpty(data.result)) {
            this.Notes = data.result[0].notes;
            if (this.Notes == null)
              this.Notes = "";
            this.clone_notes = _.cloneDeep(this.Notes);
          }
          else {
            this.Notes = "";
            this.clone_notes = "";
          }
        }
        else {
          this.Notes = "";
          this.clone_notes = "";
        }
      });
  }

  activateModuleTabs(hasvalue) {
    this.querystring = hasvalue;

    if (this.modulesubTabset) {
      var activeTab = (this.querystring == 'stab_collaboration_notes') ? 0 :
        (this.querystring == 'stab_strategy_mission') ? 1 : 0;

      if (this.modulesubTabset.tabs) {
        if (this.modulesubTabset.tabs.length > 0) {
          _.forEach(this.modulesubTabset.tabs, (t) => {
            // t.active = false;
            $("#" + t.id + "-link").removeClass("active");
            $("#" + t.id + "-link").parent(".nav-item").removeClass("active");
          });
          $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").addClass("active");
          $("#" + this.modulesubTabset.tabs[activeTab].id + "-link").parent(".nav-item").addClass("active");
          this.modulesubTabset.tabs[activeTab].active = true;
          this.value = this.modulesubTabset.tabs[activeTab].heading;
          this.queryparams.t = this.modulesubTabset.tabs[activeTab].id;
        }
      }
    }
  }
}
