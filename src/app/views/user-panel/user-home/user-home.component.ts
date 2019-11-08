import { Component, OnInit,OnDestroy } from '@angular/core';
import { Router , ActivatedRoute, Params} from '@angular/router';
import { ModuleService } from '../../../services/module.services';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../../../shared/local-storage.service';
import { AppConstant } from '../../../app.constant';
import * as _ from 'lodash';
@Component({
  selector   : 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls  : [
    './user-home.component.scss',
    '../../../../assets/css/user-home.css'
    ]
})

export class UserHomeComponent implements OnInit,OnDestroy {
  subscription: Subscription;
  oneAtATime: boolean = true;
  public modelList: any ={};
  public globalSelectedModule;
  queryparams:any = {};
  selectedModuleId : any;
  preferenceSettings : any;
  private _subscriptions = new Subscription();
  RedirectToDefaultTab:boolean=false;
  constructor(private router: Router, public ModuleService: ModuleService,
    private LocalStorageService: LocalStorageService) { 
      this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
      this.preferenceSettings = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    //var item = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.LEGOINFO);
    this.ModuleService.setModules();
    if(this.router.url.indexOf("init") <= 0)
    {
      this.RedirectToDefaultTab=true;
    }
    setTimeout(()=>{  
      // this.getTreeModules();
    },1000) 
    
      
  }
  setSelectedModule(item)
  {
    if(!_.isEmpty(item))
    {
    this.ModuleService.setSelectedModule(item[0]);
    }
    else{
      this.ModuleService.setModules();
    }
  }
  getTreeModules() {
    
    this.modelList = this.ModuleService.getTreeModules();
    if(this.modelList != undefined && this.modelList != null && !_.isEmpty(this.modelList))
    {
     // this.setSelectedModule(this.modelList)
    }
   
   
  }
  ngOnInit() {
    this._subscriptions.add(this.ModuleService.getModuleUpdates().subscribe(count => {
      this.getTreeModules();
    }));
    this._subscriptions.add(  this.router.routerState.root.queryParams.subscribe((params: Params) => {
      if(this.preferenceSettings.defaultTab != null && this.preferenceSettings.defaultTab != undefined && this.preferenceSettings.defaultTab != 0)
      {
        // if(params.initMode == "init")
        // {
          this.ModuleService.preferenceTabRedirection(true);
        // }
      }
    })); 
  }
  ngOnDestroy() {
    console.log("Component will be destroyed");
    this._subscriptions.unsubscribe();
  }
  isCollapsed: boolean = false;

  collapsed(event: any): void {
    // console.log(event);
  }

  expanded(event: any): void {
    // console.log(event);
  }

  navigateRoute(path, param){
    this.ModuleService.navigateRoute(path);
  //   var newparams = _.clone(this.modelList[0].params);
  //   newparams.t = param;    
  //   //this.router.navigate([path], { queryParams: newparams });
  // var selectedmodule = this.ModuleService.findChildModules(this.modelList,null,this.selectedModuleId);
  //   this.router.routerState.root.queryParams.subscribe((params: Params) => {
  //     this.queryparams.lId = params['lId'];
  //     this.queryparams.pId = params['pId'];
  //     this.queryparams.lLvl = params['lLvl'];
  //     this.queryparams.pos = params['pos'];
  //     this.queryparams.mode = params['mode'];
  //     this.queryparams.t = params['t'];      
  //   }); 
  //   if(! _.isEmpty(selectedmodule))
  //   {
  //     this.queryparams.lId = selectedmodule.legoId;
  //     this.queryparams.pId = selectedmodule.parentId;
  //     this.queryparams.lLvl = selectedmodule.legoLevel;
  //     this.queryparams.pos = selectedmodule.position;
  //     this.queryparams.mode = selectedmodule.type;
  //     this.queryparams.t = newparams.t;  
  //   }  

  //   //this.ModuleService.setModuleRights(newparams.lId);
  //   if(this.queryparams.lId == undefined || this.queryparams.t == undefined || this.queryparams.t == undefined)
  //   {
  //     this.router.navigate([path], { queryParams: newparams });
  //   }
  //   else{
  //     this.queryparams.t = newparams.t;
  //     this.router.navigate([path], { queryParams: this.queryparams });
  //   }
  }

}
