import { Component, HostListener, ViewChild, HostBinding, OnDestroy, ChangeDetectorRef, OnInit, NgZone } from '@angular/core';
import { MenuService } from "../../services/menu.service";
import { ModuleService } from '../../services/module.services';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import * as _ from 'lodash';
import { PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import * as $ from 'jquery';
import { Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as appSettings from '../../../assets/constant.json';
import { LocalStorageService } from '../../shared/local-storage.service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { ConfirmationService } from 'primeng/api';
import { AppConstant } from '../../app.constant';
import { CommonAppService } from '../../services/appservices/common-app.service';
import { DomSanitizer } from "@angular/platform-browser";
import { MessageService } from 'primeng/components/common/messageservice';
import { DocumentService } from '../../services/appservices/userpanelservices/document.service';
@Component({
  selector: 'custom-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private resolvedPromise = typeof Promise == 'undefined' ? null : Promise.resolve();
  nextTick = this.resolvedPromise ? function(fn) { this.resolvedPromise.then(fn); } : function(fn) { setTimeout(fn); };
  appSettings: any = appSettings;
  api_url = "";
  subscription: Subscription;
  @ViewChild('sidebarRightMenu') public sidebarRightMenu: ContextMenuComponent;
  iconPath = "";
  resizevalue = 0;
  x = 100;
  oldX = 0;
  grabber = false;
  resizeWidth = 200;
  addfolder_dialog: boolean = false;
  editfolder_dialog: boolean = false;
  renamemodule_dialog : boolean=false;
  renamemodule_selectedModule : any;
  renamemodule_text="";
  foldername: any;
  folderDetails: any = [];
  parentDetails: any = [];
  currentLegoLevel: number = 0;
  currentParent;
  userinfo: any = {};
  localSelectedModule: any;
  icons_display: boolean = false;
  ownModuleSelected: boolean = false;
  sidebarRightMenuActions = [
    {
      html: (item) => {
        //console.log(item)
        return `<span class="context-icon">
            <i class="fa fa-folder-open"></i>
        </span>
        <span class="context-title">Rename</span>`;
      },
      click: (event) => {
        this.renamemodule_dialog=true;
        this.renamemodule_selectedModule = event.item[1];
        this.renamemodule_text = this.renamemodule_selectedModule.legoName;
        $(function () {
          $("#renamemodule_textbox").focus();
        });
        return;
      },
      enabled: (item) => {
        return true;
      },
      visible: (item) => {
        return ((item[1].type != "D"));
      },
      divider: (item) => {
        return false;
      }
    },
    {
      html: (item) => {
        //console.log(item)
        return `<span class="context-icon">
            <i class="fa fa-hand-rock-o"></i>
        </span>
        <span class="context-title">Select Icon</span>`;
      },
      click: (event) => {
        if (!_.isEmpty(event.item)) {
          //var parentnode = event.item[0];
          var currentnode = event.item[1];
          this.localSelectedModule = currentnode.legoId
          this.icons_display = true;
        }
      },
      enabled: (item) => {
        return true;
      },
      visible: (item) => {
        return true;
      },
      divider: (item) => {
        return false;
      }
    },
    {
      html: (item) => {
        //console.log(item)
        return `<span class="context-icon">
            <i class="fa fa-folder-open"></i>
        </span>
        <span class="context-title">Add Folder</span>`;
      },
      click: (event) => {
        //console.log("document folder cotext menu : ", event);
        //console.log("add folder : ", event.item);
        this.parentDetails = event.item[1];
        this.folderDetails = _.clone(this.parentDetails);
        this.folderDetails.legoName = "";

        //console.log("folder details : ", this.folderDetails);
        this.addfolder_dialog = true;

        $(function () {
          $("#addfolder").focus();
        });
        this.CommonModuleRightEvent('add', event);

        return;
      },
      enabled: (item) => {
        return true;
      },
      visible: (item) => {
        return (item[1].type == "D");
      },
      divider: (item) => {
        return false;
      }
    },

    {
      html: (item) => {
        //console.log(item)
        return `<span class="context-icon">
            <i class="fa fa-folder-open"></i>
        </span>
        <span class="context-title">Rename</span>`;
      },
      click: (event) => {
        this.parentDetails = event.item[1];
        this.folderDetails = _.clone(this.parentDetails);
        //console.log("rename folder", this.folderDetails)
        this.folderDetails.legoName = "";
        this.editfolder_dialog = true;
        this.CommonModuleRightEvent('add', event);
        $(function () {
          $("#editfolder").focus();
        });
        return;
      },
      enabled: (item) => {
        return true;
      },
      visible: (item) => {
        return ((item[1].type == "D") && item[1].legoLevel > 1);
      },
      divider: (item) => {
        return false;
      }
    },
   
    {
      html: (item) => {
        //console.log(item)
        return `<span class="context-icon">
            <i class="fa fa-folder-open"></i>
        </span>
        <span class="context-title">Delete Folder</span>`;
      },
      click: (event) => {
        this.parentDetails = event.item[1];
        this.deleteFolder(this.parentDetails);
        return;
      },
      enabled: (item) => {
        return true;
      },
      visible: (item) => {
        return ((item[1].type == "D") && item[1].legoLevel > 1);
      },
      divider: (item) => {
        return false;
      }
    }
  ];
  renameModule(){
    if(this.renamemodule_text != "" && this.renamemodule_selectedModule.legoName != this.renamemodule_text){
      this.renamemodule_selectedModule.label=this.renamemodule_text;
      this.renamemodule_selectedModule.legoName=this.renamemodule_text;
      var req: any = {
        lego: this.renamemodule_selectedModule,
        statementType: 'Rename',
        StatementFlag: 'Lego Name updated'
    };
    req.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);;
    this.ModuleService.addModule(req).then(res => {
      if (res) {
        if (res.status == 1) {
          this.ModuleService.renameUpdates(this.renamemodule_selectedModule);
        }
      }
      this.renamemodule_dialog=false;
    });
    }
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.grabber) {
      return;
    }
    if (this.resizeWidth >= 200) {
      this.resizer(event.clientX - this.oldX);
      this.oldX = event.clientX;
    } else {
      return;
    }
  }
  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.resizeWidth = 200;
    this.grabber = false;
  }
  DragResizeGrabber(event){
    console.log(event);
  }
  MouseUpResizeGrabber(event){
    this.resizeWidth = 200;
    this.grabber = false;
  }
  resizer(offsetX: number) {
    this.resizevalue += offsetX;
    var aw = $(window).width() / 2;
    this.resizevalue = (this.resizevalue < 0) ? 0 : (this.resizevalue > aw) ? aw : this.resizevalue;
    var rz = (200 + this.resizevalue);
    this.resizeWidth = rz;
    var elmentX: number = $("#sidemenuHolder .resize_grabber").offset().left;
    //console.log("resize value", this.resizevalue);
    var newval = rz.toString() + "px";
    //console.log("resize value", this.resizevalue);
    $('.app-body .main').css('margin-left', newval);
    $("#sidemenuHolder").css('width', newval);

  }


  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!$(event.target).hasClass('resize_grabber')) return;
    this.grabber = true;
    this.oldX = event.clientX;
  }



  public scrollConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
  };
  @ViewChild(PerfectScrollbarDirective) PerfectScrollbarDirective?: PerfectScrollbarDirective;
  public ModuleTreeItems: any = null;
  state: string = 'close';
  // @HostBinding('@toggleMenu') get toggleState() {
  //   return this.state;
  // }
  currenturl: any;
  selectedModuleId: any;
  isRefModule : boolean= false;
  refModuleId =0;
  displayMenu: boolean = false;
  FILE_DRAGDROPITEM = 'FILE_DRAGDROPITEM';
  private _subscriptions = new Subscription();
  public queryparams: any = [];
  constructor(private ms: MenuService, private ModuleService: ModuleService, private contextMenuService: ContextMenuService
    , private Router: Router, private LocalStorageService: LocalStorageService, private CommonUtilityService: CommonUtilityService
    , private confirmationService: ConfirmationService, private commonAppService: CommonAppService, private _DomSanitizationService: DomSanitizer
    , private router: Router,
    private MessageService: MessageService, private zone: NgZone, private DocumentService: DocumentService, private cd: ChangeDetectorRef, ) {
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.isRefModule = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule) || false;
    if(this.isRefModule == true){
      this.refModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId) || 0;
    }
    // let currenturl = this.Router.parseUrl(this.Router.url);
    // if (currenturl.queryParams instanceof Object) {
    //   if (currenturl.queryParams["lId"] != undefined) {
    //     this.selectedModuleId = parseInt(currenturl.queryParams["lId"]);
    //   }
    // }
    //     var newparams = _.clone(item.params);
    //     newparams.t = "stab_details_uemplist";
    //     this.router.navigate(['/details'], { queryParams: newparams });
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.api_url = this.appSettings.API_ENDPOINT;
    this.iconPath = this.api_url + AppConstant.API_CONFIG.API_URL.iconPath;
    if (this.userinfo != undefined && this.userinfo != null) {
      //this.companyId = parseInt(this.userinfo.CompanyId);
    }
    this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
      this.queryparams.lId = params['lId'];
      this.queryparams.pId = params['pId'];
      this.queryparams.lLvl = params['lLvl'];
      this.queryparams.pos = params['pos'];
      this.queryparams.mode = params['mode'];
      this.queryparams.t = params['t'];
      if(params['mode'] == "E" || params['mode'] == "D"){
        $("#pinmodule_tag").hide();
      }
      else{
        $("#pinmodule_tag").show();
      }
    }));

  }
  ngOnDestroy() {
    console.log("Component will be destroyed");
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }
  setSelectedModule(item) {
    this.ownModuleSelected = true;
   
    if(item.referenceLegoId > 0){
      this.isRefModule = true;
      this.refModuleId = item.legoId;
    }
    else{
      this.isRefModule = false;
      this.refModuleId = 0;
    }
    return this.ModuleService.redirecttoSelectedModule(item);
    
  }
  checkmenuVisible(event) {
    return true;
  }
  selectIcon(event) {

  }
  setSelectedsidebar(TreeItems){
    var selected=false;
    // console.log("lego: ",TreeItems);
    if((TreeItems.legoId == this.refModuleId) && this.isRefModule == true){
      selected =true;
    }
    if(selected == false){
      selected = (((TreeItems.legoId == this.selectedModuleId) && this.isRefModule == false))
    }
    return selected;
  }
  setIcon(TreeItem) {
    if (TreeItem.icon == null || TreeItem.icon == "") {
      var icon_img = 'empty.png';
      switch (TreeItem.cType) {
        case 'T':
          icon_img = 'enterprise.png';
          break;
        case 'D':
          icon_img = 'folder.png';
          break;
        case 'E':
          icon_img = 'employees.png';
          break;
        case 'P':
          icon_img = 'process.png';
          break;
        case 'O':
          icon_img = 'organization.png';
          break;
      }
    }
    else {
      icon_img = TreeItem.icon;
    }
    return this._DomSanitizationService.bypassSecurityTrustResourceUrl(this.iconPath + icon_img);
  }
  ngOnInit() {
    var preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    if (!_.isEmpty(preference)) {
      this.displayMenu = preference.displayMenu;
      this.showHideMenu(preference.displayMenu);
    }
    this.ms.getToggleMenu().subscribe((open: boolean) => {
      var isopen = (this.displayMenu == false && open == false) ? false : (this.displayMenu == true && open == true) ? true :
        (this.displayMenu == false && open == true) ? true : (this.displayMenu == true && open == false) ? false : true;
      this.showHideMenu(isopen);
    });
    this.commonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
      this.displayMenu = preferencesettings.displayMenu;
      this.showHideMenu(preferencesettings.displayMenu);
    });

    // get tree module selection/updates
    this._subscriptions.add(this.ModuleService.getModuleUpdates().subscribe(count => {
      // this.cartcount = count;  
      if( this.queryparams['isRef'] == false){
        this.isRefModule=false;
        this.refModuleId = 0;
      }
      else if( this.queryparams['isRef'] == true ){
        this.isRefModule=true;
        this.refModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId);
        //this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId);
        //console.log("updates");
      }
      // setTimeout(() => {
      //   this.scrollToselectedModule();
      // }, 1000);
      this.nextTick(()=> {
         this.scrollToselectedModule();   
      });
      if (this.queryparams.mode == 'D') {
        $("#lego_menu").hide();
        $("#doc_menu").show();
      }
      else {
        $("#lego_menu").show();
        $("#doc_menu").hide();
      }
      this.getTreeModules();
    }));
    this._subscriptions.add(this.ModuleService.getModuleExternalUpdates().subscribe(updates => {
      // this.cartcount = count;
      console.log("External updates", updates);
      this.getTreeModules();
    }));
    this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
      // this.cartcount = count;
      this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
      if( this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule) == true){
        this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId);
    }
      //console.log("updates");
      // setTimeout(() => {
      //   this.scrollToselectedModule();
      // }, 1000);
      this.nextTick(()=> {
         this.scrollToselectedModule();   
      });
    });
    this.getTreeModules();
  }
  // getTreeModules() {
  //   var ModuleTreeItems = this.ModuleService.getTreeModules();
  //   if (ModuleTreeItems.length > 0) {
  //     this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
  //     this.ModuleTreeItems = _.cloneDeep(ModuleTreeItems[0]);
  //     //console.log("side menu ", this.ModuleTreeItems);
  //   }
  // }
  showHideMenu(open) {
    if (open) {
      $('body').removeClass('sidebar-fixed');
      $("#customsidebar").addClass("d-none");
      $("#sidemenuHolder").addClass("d-none");      
    };
    if (!open) {
      $('body').addClass('sidebar-fixed');
      $("#customsidebar").removeClass("d-none");
      $("#sidemenuHolder").removeClass("d-none");
    }
  }
  public scrollToselectedModule(): void {
    setTimeout(() => {
      var qr = "li.sidebarmodule-listitem > .sidebarmodule_link_holder.active";
      var element = $(qr);
      var offset: any = $("li.sidebarmodule-listitem > .sidebarmodule_link_holder.active").offset();
      if (!_.isEmpty(offset)) {
        var y = $("li.sidebarmodule-listitem > .sidebarmodule_link_holder.active").offset().top || 25;
        offset.top = y / 2 + 30;
        var org_top = this.PerfectScrollbarDirective.elementRef.nativeElement.scrollTop + y - 50;
        //this.PerfectScrollbarDirective.scrollToTop(offset,500);
        this.PerfectScrollbarDirective.scrollToY(org_top, 500);
        //  this.PerfectScrollbarDirective.scrollToElement(qr,offset, 500);
      }
    }, 1500);
  }
  getTreeModules() {
    var ModuleTreeItems = this.ModuleService.getTreeModules();
    if (ModuleTreeItems.length > 0) {
      this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
      if (this.ownModuleSelected == false) {
        this.ModuleTreeItems = _.cloneDeep(ModuleTreeItems[0]);

      }
      this.ownModuleSelected = false;
      // setTimeout(() => {
      //   this.scrollToselectedModule();
      //   if (this.queryparams.mode == 'D') {
      //     $("#lego_menu").hide();
      //     $("#doc_menu").show();
      //   }
      //   else {
      //     $("#lego_menu").show();
      //     $("#doc_menu").hide();
      //   }
      // }, 1000);
      this.nextTick(()=> {
        this.scrollToselectedModule();
        if (this.queryparams.mode == 'D') {
          $("#lego_menu").hide();
          $("#doc_menu").show();
        }
        else {
          $("#lego_menu").show();
          $("#doc_menu").hide();
        }    
      });
      //console.log("side menu ", this.ModuleTreeItems);
    }
    //this.ModuleService.getTreeModules();
    
  }
  toggleExpandCollapse(TreeItems, $event) {
    if (TreeItems.expanded == true) {
      TreeItems.expanded = false;
    } else {
      TreeItems.expanded = true;
    }
  }
  checkChildExist(TreeItems) {
    var exist = false;
    this.zone.runOutsideAngular(() => {
      if (!_.isEmpty(TreeItems)) {
        if (TreeItems.children.length > 0) {
          exist = true;
        }
      }
    });

    return exist;
  }
  toggleMenu() {
    this.ms.setToggleMenu();
  }

  //////////////DOCUMENT LIBRARY STARTS/////////////////////

  addNewFolder(newfolder) {
    //this.folderDetails
    if (newfolder.legoName == null || newfolder.legoName == undefined || newfolder.legoName == "") {
      this.MessageService.clear();
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Folder name required." });
      return false;
    }
    this.MessageService.clear();
    this.currentLegoLevel = this.parentDetails.legoLevel;
    //console.log("new folder", newfolder)
    newfolder.parentId = this.parentDetails.legoId;
    newfolder.ownerId = parseInt(this.userinfo.EmployeeId);
    newfolder.userId = this.userinfo.sub;
    newfolder.legolevel = this.parentDetails.legoLevel + 1;
    //newfolder.legoId = this.CommonUtilityService.IDGenerator(8, 'n');
    newfolder.children = [];

    if (this.ModuleTreeItems['children'].length == 0) {
      newfolder.legoLevel = this.ModuleTreeItems['legoLevel'] + 2;
    }
    var selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var legoupdation = {
      parentLego: this.parentDetails,
      currentLego: newfolder,
      lego: newfolder,
      currentLegoLevel: this.currentLegoLevel,
      statementType: 'Add',
      selectedModelId: selectedModelId
    };
    this.ModuleService.addModule(legoupdation).then(res => {
      //console.log("login response", res);
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.ModuleService.setModules().then((res) => {
              //console.log("call back module service:", res);
              //  this.moduleItems =this.ModuleService.getTreeModules();
            });
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Folder Created Successfuly." });
            this.addfolder_dialog = false;
          }

        }
      }
    });
  }

  editFolder(parentDetails) {
    //this.folderDetails
    this.MessageService.clear();
    if (parentDetails.legoName == null || parentDetails.legoName == undefined || parentDetails.legoName == "") {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Folder name required." });
      return false;
    }
    this.parentDetails.legoName = parentDetails.legoName;
    var selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
    var legoupdation = {
      parentLego: this.parentDetails,
      currentLego: this.parentDetails,
      lego: this.parentDetails,
      currentLegoLevel: this.currentLegoLevel,
      selectedModelId: selectedModelId,
      statementType: 'Rename',
      statementFlag: 'Updated'
    };
    this.ModuleService.addModule(legoupdation).then(res => {
      //console.log("login response", res);
      if (res) {
        if (!_.isEmpty(res)) {
          if (res.status == 1) {
            this.ModuleService.setModules().then((res) => {
              //console.log("call back module service:", res);
              //  this.moduleItems =this.ModuleService.getTreeModules();
            });
            this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Updated Successfuly." });
            this.editfolder_dialog = false;
          }

        }
      }
    });
  }

  deleteFolder(event) {
    this.MessageService.clear();
    this.confirmationService.confirm({
      message: 'The Selected Folder and ALL Sub-Folders will be Deleted. Are sure you want to continue?',
      accept: () => {
        this.parentDetails.delFlag = 'Y';
        var selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
        var legoupdation = {
          parentLego: this.parentDetails,
          currentLego: this.parentDetails,
          lego: this.parentDetails,
          currentLegoLevel: this.currentLegoLevel,
          selectedModelId: selectedModelId,
          statementType: 'SDelete',
          statementFlag: 'Deleted'
        };
        this.ModuleService.addModule(legoupdation).then(res => {
          //console.log("login response", res);
          if (res) {
            if (!_.isEmpty(res)) {
              if (res.status == 1) {
                this.ModuleService.setModules().then((res) => {
                  //console.log("call back module service:", res);
                  //  this.moduleItems =this.ModuleService.getTreeModules();
                });
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Folder Deleted Successfuly." });
                //this.editfolder_dialog = false;
              }

            }
          }
        });
        //Actual logic to perform a confirmation
      },
      reject: () => {

      }
    });
  }

  revert_cancelDialog() {
    this.getTreeModules();
    this.editfolder_dialog = false;
    this.addfolder_dialog = false;
  }


  CommonModuleRightEvent(mode, event) {
    switch (mode) {
      case 'add':
        this.InsertCommonModule(event);
        break;
      // case 'past':
      //   this.pastModuleProcess(event, 'P');
      //   break;
      // case 'pastref':
      //   this.pastModuleProcess(event, 'PF');
      //   break;
    }

  }

  InsertCommonModule(event) {
    if (!_.isEmpty(event.item)) {
      var parentnode = event.item[0];
      var currentnode = event.item[1];
      var verticalAdd = event.item[2];
      var index = 0;
      var isFirstchild = false;
      index = _.findIndex(parentnode.children, (n) => {
        return (n.legoId == currentnode.legoId);
      });
      if (!verticalAdd) {
        if (parentnode.legoLevel == this.currentLegoLevel) {
          index = -1;
        }
      }
      if (parentnode.legoId == currentnode.legoId && parentnode.children.length == 1) {
        isFirstchild = true;
      }
      var newnode = _.cloneDeep(currentnode);
      newnode.legoId = this.CommonUtilityService.IDGenerator(8, 'n');
      newnode.legoName = "";
      newnode.isNew = true;
      newnode.children = [];
      newnode.renamable = true;
      newnode.position = index + 1;
      if (this.ModuleTreeItems['children'].length == 0) {
        newnode.legoLevel = this.ModuleTreeItems['legoLevel'] + 2;
      }

      if (parentnode.legoLevel == this.currentLegoLevel && !isFirstchild) {
        newnode.legoLevel = this.currentLegoLevel;
      }
      if (isFirstchild) {
        newnode.legoLevel = this.currentLegoLevel;
        newnode.position = 0;
        newnode.type = 'T';
        newnode.cType = 'T';
        newnode.draggable = true;
        newnode.droppable = true;
      }
      if (parentnode.legoLevel == this.currentLegoLevel && !verticalAdd) {
        this.currentParent = currentnode;
        newnode.parentId = currentnode.legoId;
        currentnode.children.splice(index + 1, 0, newnode);
      }
      else {
        this.currentParent = parentnode;
        newnode.parentId = parentnode.legoId;
        parentnode.children.splice(index + 1, 0, newnode);
      }
      // setTimeout(() => {
      //   if ($("#renamemodule_" + newnode.legoId).length > 0) {
      //     $("#renamemodule_" + newnode.legoId).focus();
      //   }
      // }, 100);
      this.nextTick(()=> {
         if ($("#renamemodule_" + newnode.legoId).length > 0) {
          $("#renamemodule_" + newnode.legoId).focus();
        }   
      });
    }
  }
  checkIsTooltipDisabled(treeItem) {
    return (treeItem.legoName.length > 20) ? false : true;
  }
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
  dropDocument(event, treeItem) {
    this.MessageService.clear();
    event.preventDefault();
    event.stopPropagation();
    this.cd.reattach();
    var data = event.dataTransfer.getData("text");
    if (data != "" && data != undefined) {
      var file = JSON.parse(data);
      var resData = {
        file: file,
        lego: treeItem
      };
      //this.DocumentService.FileMoveUpdates(resData);
      this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
      var req = {
        ModuleId: treeItem.legoId,
        DocumentId: file.documentId,
        EmpId: this.userinfo.EmployeeId,
        CompanyId: this.userinfo.CompanyId
      };
      this.DocumentService.DragDropDoc(req)
        .then(res => {
          if (res) {
            if (!_.isEmpty(res)) {
              if (res.status == 1) {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Already Exists." });
              }
              else if (res.status == 2) {
                this.MessageService.add({ severity: 'success', summary: 'Success', detail: "Successfully Moved." });
              }
              else {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "failed." });
              }
            }
            else {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Something went wrong.Please try again." });
              return false;
            }
          }
        }, error => {
          console.log("Error Happend");

        })
    }
    console.log("file dropped");
  }

  allowDocumentDrop(event) {
    event.preventDefault();
    // this.zone.runOutsideAngular(() => {
    //  // event.currentTarget.style.background = '#7f8082';
    //   window.document.addEventListener('drop', (event)=>{
    //     this.dropDocument(event);
    //   });
    // });
    // console.log(event.type);
    // event.cancelBubble=true;
    // event.stopPropagation(); 

  }
  dragLeave(event) {
    event.preventDefault();
  }
  //////////////DOCUMENT LIBRARY END/////////////////////

}
