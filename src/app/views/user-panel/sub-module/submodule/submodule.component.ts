import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import {  MenuItem } from 'primeng/api';
import { SortablejsOptions } from '../../../../drag-drop/sortablejs-options';
import { ContextMenu } from 'primeng/contextmenu';
import { undoRedoMapperModel } from '../../models/submodules.model';
// import { Subscription } from 'rxjs';
import { ModuleService } from '../../../../services/module.services';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import * as _ from 'lodash';
import * as $ from 'jquery';
import { ConfirmationService } from 'primeng/api';
import { CommonUtilityService } from '../../../../services/common-utility.service';
import { LocalStorageService } from '../../../../shared/local-storage.service';
import { AppConstant } from '../../../../app.constant';
import { Tree } from 'primeng/tree';
import { FilterTagService } from '../../../../services/appservices/userpanelservices/filtertag.service';
import { Router, Params } from '@angular/router';
import { CommonAppService } from '../../../../services/appservices/common-app.service';
import { Subscription } from 'rxjs/Subscription';
import { MessageService } from 'primeng/components/common/messageservice';
/**
 * sub module - drag and drop components
 * @export
 * @class SubmodulesComponent
 * @implements OnInit
 * @implements AfterViewChecked
 * @implements AfterViewInit
 * @implements OnDestroy
 */
@Component({
    selector: 'app-submodule',
    templateUrl: './submodule.component.html',
    styleUrls: ['./submodule.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmodulesComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
    private _subscriptions = new Subscription();
    @ViewChild(ContextMenu) public contextMenu: ContextMenu;
    @ViewChild('submoduleRightMenu') public submoduleRightMenu: ContextMenuComponent;
    @ViewChild('treeComponent') treeComponent: Tree;
    isMobileDevice =false;
    scrollArrowViewSize = 200;
    scrollArrowTimer = null;
    nochildren = false;
    icons_display = false;
    checkrights: any = [];
    hasRights: boolean = false;
    operationalRights: string = "Readonly"; // avaiable rights: "Unrestricted" "Readonly"
    // subscription: Subscription;
    MenuBaritems: MenuItem[];
    disableUndo: boolean = true;
    disableRedo: boolean = true;
    undoRedoMapper: any = [];
    undoRedoCursor = -1;
    undoRedoIndex = -1;
    previousUndoRedoProcess: string;
    undoRedoMapperModel: undoRedoMapperModel;
    public ModuleItems: any = [];
    public ModuleTreeItems: any = [];
    public ModuleTreeStructureItems: any[] = [];
    tree_st_view: boolean = false;
    selectednode: any;
    public disableBasicMenu = false;
    userinfo: any = {};
    companyId: any;
    currentLegoLevel: number = 0;
    currentParent;
    tempSelectedLego = null;
    copiedLego = null;
    copyLego = null;
    copyRefLego = null;
    cutLego = null;
    cutRefLego = null;
    ZoomLevel = 'L';
    ZoomLevel_size = 85;
    filtertag: any = [];
    filtertagList: any = [];
    addModuleFlag = false;
    localSelectedModule: any;
    lastPosition: any = {
        left: 0,
        top: 0
    };
    //     @HostListener('mousemove', ['$event'])
    // @HostListener('dragover', ['$event'])    // don't declare this, as it is added dynamically
    // onDragOver(event) {
    //     //   event.preventDefault=true;
    //     //   event.cancelBubble=true;
    //     //  this.MouseMoveService.handleMousemove(false,event,150,null,$(".modules_container > .ModuleItems > li > .item-child")[0],
    //     //  $("#sidemenuHolder")[0].clientWidth,100);
    // }
    // dragMove(event) {
    // }
    //public globalSelectedModule: ListModuleModel[] = [];;
    isFirefox = !!navigator.userAgent.match(/firefox/i) || false;
    dragCurrentRect: any;
    dragCurrentTimer: any = [];
    dragoptions: SortablejsOptions = {
        group: {
            name: "test",
            pull: "clone",
            put: true,
            revertClone: false
        },
        sort: true,
        forceFallback: this.isFirefox,
        supportPointer : (! this.checkisMobileDevice()),
        //  fallbackTolerance : 1,
        //  fallbackOnBody : true,
        animation: 250,
        draggable: '.draggable',
        dragRootContainerId: '#drag_rootContainer',
        filter: 'input',
        preventOnFilter: false,
        showArrowNavigator: true,

        AutoscrollSpeed: 15,
        scroll: (!this.checkisMobileDevice()),
        scrollSensitivity: 250,
        scrollSpeed: 1000,
        dragoverBubble: true,
        onClone: (event) => {
            // $(event.item).hide();
        },
        onStart: (event) => {
            if (!this.checkValidDrag(event)) {
                $(event.item).trigger('click');
                // event.preventDefault = true
            }
        },
        setData: (dataTransfer, event) => {
            if ($(event).find("ul.module_level").length > 1) {
                // var img = document.createElement("img");
                // img.src = "assets/images/drag-ghosticon.gif";
                // dataTransfer.setDragImage(img, 0, 0);
            }


        },
        onEnd: (event) => {
            this.lastPosition.left = $('#drag_rootContainer').scrollLeft();
            this.lastPosition.top = $('#drag_rootContainer').scrollTop();
            this.clearTimeOutAll();
            if (this.AddUpdateCheckRights()) {
                var from = $(event.from).data("sectionvalue");
                var to = $(event.to).data("sectionvalue");
                var item = $(event.item).data("sectionvalue");
                item.icon = to.icon;/////////////28-02-2019 modifed
                // var treenodes = _.cloneDeep(this.ModuleTreeItems);
                // var fromLegoId = $(event.from).data("sectionvalue");
                // var from = this.ModuleService.findChildModules([treenodes], null, parseInt(fromLegoId));
                // var toLegoId = $(event.to).data("sectionvalue");
                // var to = this.ModuleService.findChildModules([treenodes], null, parseInt(toLegoId));
                var ni = event.newIndex;
                var oi = event.oldIndex;
                if (from != undefined && to != undefined) {
                    if (from.legoId == to.legoId) {
                        if (ni != oi) {
                            this.dragModuleProcess(event);
                            
                            setTimeout(() => {
                                event.to.click();
                                this.cd.detectChanges();
                                // var ul_idx = _.findIndex(event.to.children,function(idx){
                                //     return $( idx ).hasClass( "disabled" )
                                //  });
                                // if(ul_idx > -1){
                                //     if((event.to.children.length - 1) != ul_idx)
                                //     {
                                //         var cloneHtml=event.to.children[ul_idx];
                                //         event.to.children[ul_idx] = event.to.children[event.to.children.length];
                                //         event.to.children[event.to.children.length] = cloneHtml;
                                //        // event.to.children.splice(ul_idx,1);
                                //        // event.to.children.push(cloneHtml);
                                //     }
                                // }
                            }, 1000);
                            return false;
                        }
                        else {
                            this.ModuleTreeItems = _.cloneDeep(this.ModuleTreeItems);
                            
                            return false;
                        }
                    }
                    else {
                        this.dragModuleProcess(event);
                    }
                }
                else {
                    this.dragModuleProcess(event);
                }
                $(event.to).children('ul.module_level.ul_level_two').each(function (index) {
                    $(this).addClass("display_inlinetable");
                });
                setTimeout(() => {
                    $(event.to).children('ul.module_level.ul_level_two').each(function (index) {
                        $(this).removeClass("display_inlinetable");
                    });
                }, 1000);
                // $(event.to).children("ul.module_level").each(function( index ) {
                //     $( this ).css( "display", "table-cell" );
                //   });
                $("#floatingarrow_left").hide();
                $("#floatingarrow_right").hide();
                $("#floatingarrow_up").hide();
                $("#floatingarrow_down").hide();
            }

        },
        onUpdate: (event) => {
        },
        onAdd: (event) => {
            if ($(event.item).hasClass("temp_ui_nextlevel")) {
                if ($(event.item).hasClass("temp_ul_level_one")) {
                    $(event.item).removeClass('ul_level_two').addClass('ul_level_one')
                }
                $(event.item).removeClass('temp_ui_nextlevel');
                $(event.item).find('.item-child').show();
                $(event.item).find('li.level').removeClass("initial_width").removeClass('selectedDragItem').removeClass("selectedchildDragItem");;
            }
            $("#floatingarrow_left").hide();
            $("#floatingarrow_right").hide();
            $("#floatingarrow_up").hide();
            $("#floatingarrow_down").hide();
        },
        onRemove: (event) => {
        },
        onChoose: (event) => {
            this.dragCurrentRect = {};
            if ($(event.item).hasClass("ul_level_one")) {
                $(event.item).removeClass('ul_level_one').addClass('ul_level_two').addClass('temp_ul_level_one');
                $(event.item).find('.item-child').hide();

            }
            $(event.item).addClass('temp_ui_level');
            // var treenodes = _.cloneDeep(this.ModuleTreeItems);
            // var templegoId=event.item.dataset.sectionvalue;
            // var val: any = this.ModuleService.findChildModules([treenodes], null, parseInt(templegoId));
            var val: any = JSON.parse(event.item.dataset.sectionvalue);
            if (val.childCount != undefined && val.childCount != null) {
                if (val.childCount > 0) {
                    $(event.item).find('li.level').addClass("initial_width").addClass('selectedchildDragItem');
                }
            }
            $(event.item).find('li.level').addClass("initial_width").addClass('selectedDragItem');
            $("#floatingarrow_left").hide();
            $("#floatingarrow_right").hide();
            $("#floatingarrow_up").hide();
            $("#floatingarrow_down").hide();
        },
        onUnchoose: (event) => {
            this.clearTimeOutAll();
            if ($(event.item).hasClass("temp_ui_level")) {
                if ($(event.item).hasClass("temp_ul_level_one")) {
                    $(event.item).removeClass('ul_level_two').addClass('ul_level_one');
                }
                $(event.item).removeClass('temp_ui_level');
                $(event.item).find('.item-child').show();
                $(event.item).find('li.level').removeClass("initial_width").removeClass('selectedDragItem').removeClass("selectedchildDragItem");
            }
            $("#floatingarrow_left").hide();
            $("#floatingarrow_right").hide();
            $("#floatingarrow_up").hide();
            $("#floatingarrow_down").hide();
        },
        onAddOriginal: (event) => {
            if ($(event.item).hasClass("ul_level_one")) {
                $(event.item).removeClass('ul_level_one').addClass('ul_level_two').addClass('temp_ul_level_one');
                $(event.item).find('.item-child').hide();

            }
            $(event.item).addClass('temp_ui_nextlevel');
            // var treenodes = _.cloneDeep(this.ModuleTreeItems);
            // var templegoId=event.item.dataset.sectionvalue;
            // var val: any = this.ModuleService.findChildModules([treenodes], null, parseInt(templegoId));
            var val: any = JSON.parse(event.item.dataset.sectionvalue);
            if (val.childCount != undefined && val.childCount != null) {
                if (val.childCount > 0) {
                    $(event.item).find('li.level').addClass("initial_width").addClass('selectedchildDragItem');
                }
            }
            $(event.item).find('li.level').addClass("initial_width").addClass('selectedDragItem');
            $("#floatingarrow_left").hide();
            $("#floatingarrow_right").hide();
            $("#floatingarrow_up").hide();
            $("#floatingarrow_down").hide();
            // Get the viewport dimensions.
        },
        scrollFn: (offsetX: any, offsetY: any, originalEvent: any) => {
            // var org = originalEvent.target.getBoundingClientRect();
            // var drag_rootContainer = $('#drag_rootContainer')[0];
            // function bottomReached()
            // {
            //    return  ($(drag_rootContainer).scrollTop() + $(drag_rootContainer).innerHeight() >= drag_rootContainer.scrollHeight)
            // }
            // function topReached()
            // {
            //    return  ($(drag_rootContainer).scrollTop() + $(drag_rootContainer).innerHeight() >= drag_rootContainer.scrollHeight)
            // }
            // if (org.x == this.dragCurrentRect.x && org.y == this.dragCurrentRect.y && drag_rootContainer.scrollTop != 0 && !bottomReached() && !topReached()) {
            //     this.dragCurrentTimer.push(setTimeout(() => {
            //         if (org.x == this.dragCurrentRect.x && org.y == this.dragCurrentRect.y && !bottomReached() && drag_rootContainer.scrollTop != 0) {
            //             var rootRect = drag_rootContainer.getBoundingClientRect()
            //             if( this.dragCurrentRect.y < rootRect.height/2 && this.dragCurrentRect.y != rootRect.top && drag_rootContainer.scrollTop != 0) // top
            //             {
            //                 drag_rootContainer.scrollTop = drag_rootContainer.scrollTop - 10;
            //             }
            //             else if(this.dragCurrentRect.y > ( rootRect.height/2 + this.dragCurrentRect.height /2)  )
            //             {
            //                 drag_rootContainer.scrollTop = drag_rootContainer.scrollTop + 10;
            //             }
            //             else 
            //             this.clearTimeOutAll();
            //         }
            //         else 
            //         this.clearTimeOutAll();
            //     }, 1000));
            // }
            // else {
            //     this.dragCurrentRect = org;
            //     if (this.dragCurrentTimer) {
            //         this.clearTimeOutAll();
            //     }
            // }
        }
    };
    public mainmoduleRightMenuActions = [
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-open"></i>
            </span>
            <span class="context-title">Open</span>`;
            },
            click: (event) => { this.mainContextMenuEvent('open', event) },
            enabled: (item) => true,
            visible: (item) => {
                var visible = false;
                if (!_.isEmpty(item[1])) {
                    if (item[1].referenceLegoId == 0) {
                        visible = true;
                    }
                }
                return visible;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-rename"></i>
            </span>
            <span class="context-title">Rename</span>`;
            },
            click: (event) => {

                this.mainContextMenuEvent('Rename', event);
            },
            enabled: (item) => true,
            visible: (item) => {
                var visible = false;
                if (this.AddUpdateCheckRights()) {
                    if (!_.isEmpty(item[1])) {
                        if (item[1].referenceLegoId == 0) {
                            visible = true;
                        }
                    }
                }
                return visible;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-scissors"></i>
            </span>
            <span class="context-title">Cut</span>`;
            },
            click: (event) => { this.mainContextMenuEvent('cut', event) },
            enabled: (item) => true,
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-clipboard"></i>
            </span>
            <span class="context-title">Copy</span>`;
            },
            click: (event) => { this.mainContextMenuEvent('copy', event) },
            enabled: (item) => true,
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-trash"></i>
            </span>
            <span class="context-title">Delete</span>`;
            },
            click: (event) => { this.mainContextMenuEvent('delete', event) },
            enabled: (item) => true,
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-check"></i>
            </span>
            <span class="context-title">Select Icon</span>`;
            },
            click: (event) => { this.mainContextMenuEvent('selecticon', event) },
            enabled: (item) => true,
            visible: (item) => {
                var visible = false;
                if (this.AddUpdateCheckRights()) {
                    if (!_.isEmpty(item[1])) {
                        if (item[1].referenceLegoId == 0 && this.ModuleTreeItems['legoId'] == item[0].legoId) {
                            visible = true;
                        }
                    }
                }
                return visible;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-check"></i>
            </span>
            <span class="context-title">Go to Original</span>`;
            },
            click: (event) => { this.mainContextMenuEvent('gotoOriginal', event) },
            enabled: (item) => true,
            visible: (item) => {
                var visible = false;
                if (!_.isEmpty(item[1])) {
                    if (item[1].referenceLegoId > 0) {
                        visible = true;
                    }
                }
                return visible;
            },
        },
        {
            divider: true,
            visible: true,
        },
        {
            html: (event) => {
                var lavel = '<span class="context-title">Module Id -</span>';
                if (event.length > 1) {
                    lavel = '<span class="context-title">Module Id - ' + event[1].legoId + '</span>';
                }
                return lavel;
            },
            click: (event) => { },
            enabled: (item) => true,
            visible: (item) => {
                var visible = false;
                if (!_.isEmpty(item[1])) {
                    if (item[1].referenceLegoId == 0) {
                        visible = true;
                    }
                }
                return visible;
            },
        }
    ];
    public CommonModuleRightMenuActions = [
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-plus"></i>
            </span>
            <span class="context-title">Add New Module</span>`;
            },
            click: (event) => {
                this.CommonModuleRightEvent('add', event);
                return;
            },
            enabled: (item) => true,
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-clipboard"></i>
            </span>
            <span class="context-title">Paste</span>`;
            },
            click: (event) => { this.CommonModuleRightEvent('past', event) },
            enabled: (item) => {
                var enabled = false;
                if (!_.isEmpty(this.copyLego) || !_.isEmpty(this.copyRefLego) || !_.isEmpty(this.cutLego)) {
                    enabled = true;
                }
                return enabled;
            },
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-clipboard"></i>
            </span>
            <span class="context-title">Paste Reference</span>`;
            },
            click: (event) => { this.CommonModuleRightEvent('pastref', event) },
            enabled: (item) => {
                var enabled = false;
                if (!_.isEmpty(this.copyLego) || !_.isEmpty(this.copyRefLego)) {
                    enabled = true;
                }
                return enabled;
            },
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        }
    ];
    public FirstChildRightMenuActions = [
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-plus"></i>
            </span>
            <span class="context-title">Add New Module</span>`;
            },
            click: (event) => {
                $("#firstChildHolder").hide();
                this.addModuleonMain();
                return;
            },
            enabled: (item) => true,
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-clipboard"></i>
            </span>
            <span class="context-title">Paste</span>`;
            },
            click: (event) => { this.CommonModuleRightEvent('past', event) },
            enabled: (item) => {
                var enabled = false;
                if (!_.isEmpty(this.copyLego) || !_.isEmpty(this.copyRefLego) || !_.isEmpty(this.cutLego)) {
                    enabled = true;
                }
                return enabled;
            },
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        },
        {
            html: (item) => {
                return `<span class="context-icon">
                <i class="fa fa-clipboard"></i>
            </span>
            <span class="context-title">Paste Reference</span>`;
            },
            click: (event) => { this.CommonModuleRightEvent('pastref', event) },
            enabled: (item) => {
                var enabled = false;
                if (!_.isEmpty(this.copyLego) || !_.isEmpty(this.copyRefLego)) {
                    enabled = true;
                }
                return enabled;
            },
            visible: (item) => {
                return this.AddUpdateCheckRights() || false;
            },
        }
    ];

    selectedModuleId: any;
    selectedModelId: any;
    queryparams: any = {};
    defaultMouseClick: boolean = false;
    TreeContainerElement: any;
    TreeContainerElementclientX: any;
    TreeContainerElementclientY: any;
    /**
     * Creates an instance of SubmodulesComponent.
     * @param  {Router} router router module - angular
     * @param  {ModuleService} ModuleService module services
     * @param  {ContextMenuService} contextMenuService context menu services
     * @param  {ConfirmationService} confirmationService confirm dialog services
     * @param  {CommonUtilityService} CommonUtilityService utility services
     * @param  {LocalStorageService} LocalStorageService local storage services
     * @param  {SubmoduleService} SubmoduleService submodule services
     * @param  {TreeDragDropService} TreeDragDropService 
     * @param  {FilterTagService} FilterTagService 
     * @param  {CommonAppService} commonAppService 
     * @param  {MessageService} MessageService 
     * @param  {NgZone} zone 
     * @param  {ChangeDetectorRef} cd 
     * @memberof SubmodulesComponent
     */
    constructor(private router: Router, public ModuleService: ModuleService, private contextMenuService: ContextMenuService,
        private confirmationService: ConfirmationService, private CommonUtilityService: CommonUtilityService,
        private LocalStorageService: LocalStorageService, 
        private FilterTagService: FilterTagService, private commonAppService: CommonAppService, private MessageService: MessageService, private zone: NgZone, private cd: ChangeDetectorRef) {
        this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
        this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
        this.isMobileDevice=this.CommonUtilityService.isMobileDevice();
        this.getModuleItems();
        this.getTreeModules();
        this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
        if (this.userinfo != undefined && this.userinfo != null) {
            this.companyId = parseInt(this.userinfo.CompanyId);
        }
        Tree.prototype.allowDrop = (dragNode: any, dropNode: any, dragNodeScope: any): boolean => {
            var isValid = true;
            if (dropNode != null) {
                if (dropNode.legoLevel == this.currentLegoLevel) {
                    isValid = false;
                }
            }
            return isValid;
        }

        this.getfilterTagList();
    }

    /**
     * clear previous drag event
     * @return {void}@memberof SubmodulesComponent
     */
    clearTimeOutAll() {
        for (var i = 0; i < this.dragCurrentTimer.length; i++) {
            clearTimeout(this.dragCurrentTimer[i]);

            //clearTimeOutAll window.clearTimeout
        }
    }
    /**
     * check valid drag,valid element selection
     * @param  {any} event drag event
     * @return 
     * @memberof SubmodulesComponent
     */
    checkValidDrag(event) {
        var valid = true;
        // var item = parseInt($(event.item).data("sectionvalue")) || 0;
        var item = $(event.item).data("sectionvalue").legoId || 0;
        if (item != undefined && item != null) {
            if (item > 0) {
                return true;
            }
            else
                valid = false;
        }
        else {
            valid = false;
        }
        return valid;
    }

    /**
     * destroy event - unsubscribe event and subcriptions
     * @return {void}@memberof SubmodulesComponent
     */
    ngOnDestroy() {
        this._subscriptions.unsubscribe();
        this.cd.detach();
    }
    /**
     * component oninit method
     * @return {void}@memberof SubmodulesComponent
     */
    ngOnInit() {
        var preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
        if (!_.isEmpty(preference)) {
            this.defaultMouseClick = (preference.defaultMouseClick == undefined || preference.defaultMouseClick == null) ? false :
                (preference.defaultMouseClick == false) ? false : true
        }

        this.MenuBaritems = [
            {
                label: 'View',
                icon: 'fa-eye',
                items: [{
                    label: 'Rows',
                    icon: 'fa-navicon',
                    command: (event) => {
                        this.tree_st_view = false;
                    }
                },
                {
                    label: 'Outline',
                    icon: 'fa-pencil-square',
                    command: (event) => {

                        this.tree_st_view = true;
                        setTimeout(() => {
                            this.setElementAutoHeight(null, 'tree');
                        }, 1000);
                    }
                }
                ]
            },
            {
                label: 'Filter',
                icon: 'fa-filter',
                items: [
                    {
                        label: 'Test filter 1',
                        icon: 'fa-arrows-alt'
                    },
                    {
                        label: 'Test filter 1',
                        icon: 'fa-arrows-alt'
                    }
                ]
            }
            ,
            {
                label: 'Zoom',
                icon: 'fa-search-plus',
                items: [
                    {
                        label: 'small',
                        icon: 'fa-arrows-alt',
                        command: (event) => {
                            this.ZoomLevel = 'S';
                            this.ZoomLevel_size = 85;
                        }
                    },
                    {
                        label: 'Medium',
                        icon: 'fa-arrows-alt',
                        command: (event) => {
                            this.ZoomLevel = 'M';
                            this.ZoomLevel_size = 105;
                        }
                    },
                    {
                        label: 'Large',
                        icon: 'fa-arrows-alt',
                        command: (event) => {
                            this.ZoomLevel = 'L';
                            this.ZoomLevel_size = 125;
                        }
                    },
                    {
                        label: 'XLarge',
                        icon: 'fa-arrows-alt',
                        command: (event) => {
                            this.ZoomLevel = 'XL';
                            this.ZoomLevel_size = 145;
                        }
                    },
                    {
                        label: 'XXLarge',
                        icon: 'fa-arrows-alt',
                        command: (event) => {
                            this.ZoomLevel = 'XXL';
                            this.ZoomLevel_size = 165;
                        }
                    }
                ]
            },
            {
                label: 'Undo',
                icon: 'fa-mail-forward'
            },
            {
                label: 'Redo',
                icon: 'fa-mail-reply'
            },
            {
                label: 'Add Module',
                icon: 'fa-plus',
                command: (event) => {

                }
            }
        ];
        // update on module
        this.subscribeOninit();
        this.setZoomSize();
    }
    /**
     * manipulate zoom size
     * @return {void}@memberof SubmodulesComponent
     */
    setZoomSize() {
        this.ZoomLevel = (this.userinfo.zoomSize == "100" || this.userinfo.zoomSize == "1") ? "S" :
            (this.userinfo.zoomSize == "2") ? "M" :
                (this.userinfo.zoomSize == "3") ? "L" :
                    (this.userinfo.zoomSize == "4") ? "XL" :
                        (this.userinfo.zoomSize == "5") ? "XXL" : "S";
    }
    /**
     * initialize subcriptions
     * @return {void}@memberof SubmodulesComponent
     */
    subscribeOninit() {
        this._subscriptions.add(this.router.routerState.root.queryParams.subscribe((params: Params) => {
            this.queryparams.lId = params['lId'];
            this.queryparams.pId = params['pId'];
            this.queryparams.lLvl = params['lLvl'];
            this.queryparams.pos = params['pos'];
            this.queryparams.mode = params['mode'];
            this.queryparams.t = params['t'];
            this.commonAppService.checkPinmodule();
        }));
        this._subscriptions.add(
            this.ModuleService.getModuleRightsUpdate().subscribe(rights => {
                this.checkrights = rights;
                this.checkRights();
            })
        );
        this.checkrights = this.ModuleService.getModuleRights();
        this.checkRights();

        this._subscriptions.add(
            this.commonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
                this.defaultMouseClick = (preferencesettings.defaultMouseClick == undefined || preferencesettings.defaultMouseClick == null) ? false :
                    (preferencesettings.defaultMouseClick == false) ? false : true
            })
        );
        this._subscriptions.add(
            this.ModuleService.getModuleUpdates().subscribe(updates => {
                this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
                this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
                if( this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule) == true){
                    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId);
                }
                // this.cartcount = count;
                this.getTreeModules();
                this.getfilterTagList();
                // this.undoRedoMapper = [];
                // this.undoRedoCursor = -1;
                // this.undoRedoIndex = -1;
                // this.previousUndoRedoProcess="";
            }));
        this._subscriptions.add(
            this.ModuleService.getSelectedModuleUpdates().subscribe(updates => {
                // this.cartcount = count;
                if (updates.treeModules) {
                    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
                    this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
                    if( this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule) == true){
                        this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId);
                    }
                    //  var items = [null, updates.treeModules];
                    this.ModuleTreeItems = [];
                    // this.OpenModule({item : items});
                    // this.ModuleTreeItems = this.FilterDocumentEMployeeModules(_.cloneDeep(this.ModuleService.getSelectedModule(updates.treeModules)));
                    if (updates.treeModules.cType != 'E' && updates.treeModules.cType != 'D' && updates.treeModules.cType != null) {

                        this.ModuleTreeItems = _.cloneDeep(updates.treeModules);
                        this.currentLegoLevel = this.ModuleTreeItems['legoLevel'];
                        if (this.ModuleTreeItems['children'].length == 0) {
                            this.nochildren = true;
                            var dummmyNode = this.formatDummyNode(this.ModuleTreeItems)/// 28-02-2019 added
                            this.ModuleTreeItems.children.push(dummmyNode);/// 28-02-2019 added
                        }
                        else {
                            this.nochildren = false;
                        }
                    }
                    // this.undoRedoMapper = [];
                    // this.undoRedoCursor = -1;
                    // this.undoRedoIndex = -1;
                    // this.previousUndoRedoProcess="";
                }

            }));
        this._subscriptions.add(
            this.router.routerState.root.queryParams.subscribe((params: Params) => {

            }));
    }

    /**
     * update zoom size 
     * @param  {any} symbol 
     * @param  {any} size 
     * @return {void}@memberof SubmodulesComponent
     */
    zoomIn(symbol, size) {
        this.ZoomLevel = symbol;
        this.ZoomLevel_size = size;
        var size: any = (symbol == "S") ? 1 :
            (symbol == "M") ? 2 :
                (symbol == "L") ? 3 :
                    (symbol == "XL") ? 4 :
                        (symbol == "XXL") ? 5 : 1;
        var templego = {
            ParentId: size,
            OwnerId: this.userinfo.EmployeeId
        }
        var req: any = {
            lego: templego,
            statementType: 'zoomSize',
            StatementFlag: ''
        };
        this.updateModules(req);
        this.userinfo.zoomSize = size;
        this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO, this.userinfo);
        this.ModuleService.treeTravese(this.ModuleTreeItems, size);
    }
    /**
     * add first level module - cient side manipulate
     * @return {void}@memberof SubmodulesComponent
     */
    addModuleonMain() {
        if (this.addModuleFlag == false) {
            $("#firstChildHolder").hide();
            this.addModuleFlag = true;
            var leastnode: any = _.cloneDeep(this.ModuleTreeItems);
            var items = [];
            //var child = _.filter(leastnode.children,(d)=>{return(d.type == 'P' || d.type == 'O')})
            if (leastnode.children.length > 0) {
                if (this.ModuleTreeItems['children'].length == 1) {
                    if (this.ModuleTreeItems['children'][0].legoId < 0) {
                        leastnode.legoLevel = this.ModuleTreeItems['legoLevel'] + 2;
                        leastnode.position = 1;
                    }
                }
                else {
                    if (leastnode.children[leastnode.children.length - 1].type == "DM") {
                        leastnode = leastnode.children[leastnode.children.length - 2];
                    }
                    else {
                        leastnode = leastnode.children[leastnode.children.length - 1];
                    }

                }
            }
            else {
                leastnode.legoLevel = this.ModuleTreeItems['legoLevel'] + 2;
                delete leastnode.parent;
                leastnode.children = [];
            }
            leastnode.legoName = "";
            items.push(this.ModuleTreeItems);
            items.push(leastnode);
            items.push(true);
            var newreq = {
                event: null,
                item: items
            };
            this.InsertCommonModule(newreq);
        }
    }
    /**
     * add new empty module - client side maipulation
     * @param  {any} parentModule 
     * @param  {any} TreeItems 
     * @return {void}@memberof SubmodulesComponent
     */
    AddnewFromDummy(parentModule, TreeItems) {
        var leastnode: any = _.cloneDeep(parentModule);
        var items = [];
        //var child = _.filter(leastnode.children,(d)=>{return(d.type == 'P' || d.type == 'O')})
        if (leastnode.children.length > 1) {
            leastnode = leastnode.children[leastnode.children.length - 2];
        }
        else {
            delete leastnode.parent;
            leastnode.children = [];
        }
        items.push(parentModule);
        items.push(leastnode);
        items.push(true);
        var newreq = {
            event: null,
            item: items
        };
        this.InsertCommonModule(newreq);
    }
    /**
     * set data in DOM element property
     * @param  {any} item 
     * @param  {any} delchild 
     * @return 
     * @memberof SubmodulesComponent
     */
    setSectionValue(item, delchild) {
        var value: any = _.cloneDeep(item);
        value.children = [];
        if (value.parent != undefined) {
            delete value.parent;
        }
        // delete value.parent;
        // if (delchild) {
        //     value.children = [];
        // }
        // console.log("stringfy");
        return JSON.stringify(value);
    }
    /**
     * check it is dummy node or valid node
     * @param  {any} TreeItems 
     * @return 
     * @memberof SubmodulesComponent
     */
    checkFordummyNode(TreeItems) {
        var notDummy = false;
        if (!_.isEmpty(TreeItems)) {
            if (TreeItems.children && !(TreeItems.legoLevel >= (this.currentLegoLevel + 2))) {
                notDummy = true;
            }
        }
        return notDummy;
    }
    /**
     * add green blink on clik
     * @param  {*} event click event
     * @return {void}@memberof SubmodulesComponent
     */
    addBlink(event: any) {
        $(".blinkelement").each(function (index) {
            $(this).removeClass("blinkelement");
        });
        $(event.target).addClass("blinkelement");
    }

    /**
     * after view check,set auto height of the panel
     * @return {void}@memberof SubmodulesComponent
     */
    ngAfterViewChecked() {
        this.setElementAutoHeight(null);
    }

    /**
     * set auto element
     * @param  {*} event view check event
     * @param  {any} [mode] optional
     * @return {void}@memberof SubmodulesComponent
     */
    setElementAutoHeight(event: any, mode?) {
        var res_h = $(window).height() - ($('.app-header').innerHeight()
            + $('.app-footer').innerHeight()
            + $('.breadcrumb_container').innerHeight()
            + $('#main_tab_container > .nav-tabs').innerHeight()
            + 2
        );

        //  sub tabs class: sub_tab_container
        var firstChildHolderHeight = $(".firstChildHolder ").innerWidth() || 0;
        var h = res_h - ($("#submodule-pg .dropmenu_holder").innerHeight() + 20) - firstChildHolderHeight;
        if ($("body").hasClass("pinmodule")) {
            h += 95;
        }
        if (this.tree_st_view == true) {
            $('#ModuletreeElement').css("height", h + "px");
        }
        else {
            h += 8;
            $("#submodule-pg .modules_container").css("max-height", ( h ) + "px");
            $(".modules_container > .ModuleItems > li > .item-child").css("height", (h - 20) + "px");

            var scrollwith = $("#main_viewpoint").innerWidth() - 15;
            $(".modules_container > .ModuleItems > li > .item-child").css("width", (scrollwith - 20) + "px");
            $(".modules_container > .ModuleItems > li > .item-child").attr("id", "drag_rootContainer");
           // $()
            // $("#floatingarrow_left").css("left",$(".modules_container > .ModuleItems > li > .item-child").width());
            //  $("#floatingarrow_right").css("left",($(".modules_container > .ModuleItems > li > .item-child")[0].scrollWidth - 30) +"px" );
        }

    }
    /**
     * get tree module from central module service based on selected module
     * @return {void}@memberof SubmodulesComponent
     */
    getTreeModules() {
        this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
        if( this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule) == true){
            this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId);
        }
        var treemodules = this.ModuleService.getTreeModules();
        if (treemodules != null && treemodules != undefined && !_.isEmpty(treemodules)) {
            if (treemodules.length > 0) {
                var treenodes = _.cloneDeep(treemodules);
                var m = this.ModuleService.findChildModules(treenodes, null, this.selectedModuleId);
                this.ModuleTreeItems = this.FilterDocumentEMployeeModules(m);
                this.ModuleService.updateChildCount([this.ModuleTreeItems]);
                // if(treemodules[0].legoId == this.selectedModuleId)
                // {
                //     this.ModuleTreeItems = this.ModuleService.findChildModules(treenodes,null,this.selectedModuleId);
                // }
                // else
                // {
                //     this.ModuleTreeItems = this.FilterDocumentEMployeeModules(treenodes[0]);
                // }
                //  var ch_child = this.FilterDocumentEMployeeModules(this.ModuleTreeItems);
                if ((this.ModuleTreeItems['children'].length == 0) || (this.ModuleTreeItems['children'].length == 1 && this.ModuleTreeItems['children'][0].legoId < 0)) {
                    this.nochildren = true;
                }
                else {
                    this.nochildren = false;
                }
                this.currentLegoLevel = this.ModuleTreeItems['legoLevel'];
            }
        }

        //this.ModuleService.getTreeModules();
    }
    
    /**
     * get module item from cental module tree 
     * @return {void}@memberof SubmodulesComponent
     */
    getModuleItems() {
        var md = this.ModuleService.getTreeModules();
        if (md != null && md != undefined && !_.isEmpty(md)) {
            if (md[0] != null && md[0] != undefined && !_.isEmpty(md[0])) {
                this.ModuleItems = md[0].children;
            }
        }
    }
    CommonModuleRightEvent(mode, event) {
        switch (mode) {
            case 'add':
                this.InsertCommonModule(event);
                break;
            case 'past':
                this.pastModuleProcess(event, 'P');
                break;
            case 'pastref':
                this.pastModuleProcess(event, 'PF');
                break;
        }

    }
    /**
     * context menu options
     * @param  {any} mode selected option
     * @param  {any} event context menu event
     * @return {void}@memberof SubmodulesComponent
     */
    mainContextMenuEvent(mode, event) {
        switch (mode) {
            case 'open':
                this.OpenModule(event);
                break;
            case 'gotoOriginal':
                this.gotoOriginal(event);
                break;
            case 'delete':
                this.DeleteModule(event);
                break;
            case 'Rename':
                var undoreq = {
                    lego: _.cloneDeep(event.item[1]),
                    statementType: 'Rename'
                }
                this.updateUndoRedoMaps(undoreq, "b");
                this.showRename(event);
                break;
            case 'cut':
                this.cutModuleProcess(event);
                break;
            case 'copy':
                this.copyModuleProcess(event);
                break;
            case 'selecticon':
                this.localSelectedModule = event.item[1].legoId;
                this.icons_display = true;
                break;
        }
    }
    /**
     * sub module context menu options
     * @param  {any} mode selected menu option
     * @param  {any} event context menu event
     * @return {void}@memberof SubmodulesComponent
     */
    submoduleContextMenuEvent(mode, event) {
        switch (mode) {
            case 'open':
                this.OpenModule(event);
                break;
            case 'delete':
                this.DeleteModule(event);
                break;
            case 'Rename':
                this.showRename(event);
                break;
            case 'cut':
                break;
            case 'copy':
                break;
            case 'selecticon':
                break;

        }

    }
    /**
     * convert number to alpha orders link a,b,c,aa,ab,ac,etc
     * @param  {any} newnode 
     * @return 
     * @memberof SubmodulesComponent
     */
    getNewAlphaOrder(newnode) {
        return this.ModuleService.numberToAlphapets(newnode.position + 1);
    }
    /**
     * insert module
     * @param  {any} event drag event
     * @return {void}@memberof SubmodulesComponent
     */
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
            // if (currentnode < 0) {
            //     index = -1;
            // }
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
                if (currentnode.parentId == parentnode.legoId) {
                    newnode.legoLevel = currentnode.legoLevel + 1;
                }
                currentnode.children.splice(index + 1, 0, newnode);
            }
            // if (parentnode.legoLevel == this.currentLegoLevel && verticalAdd) {
            //     newnode.legoLevel = this.currentLegoLevel + 1;
            // }
            else {
                if (parentnode.legoLevel == this.currentLegoLevel && verticalAdd) {
                    newnode.legoLevel = this.currentLegoLevel + 1;
                }
                this.currentParent = parentnode;
                newnode.parentId = parentnode.legoId;
                parentnode.children.splice(index + 1, 0, newnode);
            }
            newnode.alphaOrder = this.ModuleService.numberToAlphapets(newnode.position);
            setTimeout(() => {
                if ($("#renamemodule_" + newnode.legoId).length > 0) {
                    $("#renamemodule_" + newnode.legoId).focus();
                    //$('body').scrollTo("#renamemodule_" + newnode.legoId);
                    // $('html, body').animate({
                    //     scrollTop: $($("#renamemodule_" + newnode.legoId).attr("href")).offset().top
                    // }, 2000);
                }
            }, 100)
        }
        else {
            this.addModuleFlag = false;
        }
    }
    /**
     * open module - set this module as global selected module
     * @param  {any} event click event
     * @return {void}@memberof SubmodulesComponent
     */
    OpenModule(event) {
        if (!_.isEmpty(event.item)) {
            this.changeModule(event.item[1]);
            if (event.item[1].children.length == 0) {
                this.nochildren = true;
                $("#firstChildHolder").show();
            }
            if (event.item[1].children.length == 1) {
                if (event.item[1].children[0].legoId < 0) {
                    this.nochildren = true;
                    $("#firstChildHolder").show();
                }
            }
            this.undoRedoMapper = [];
            this.undoRedoCursor = -1;
            this.undoRedoIndex = -1;
            this.previousUndoRedoProcess = "";
            //this.ModuleService.setSelectedModule(event.item[1]);
            // this.ModuleTreeItems = this.FilterDocumentEMployeeModules(_.cloneDeep();
            // this.ModuleTreeItems = _.cloneDeep(updates.treeModules);
        }
    }
    /**
     * goto reference module to orginal module
     * @param  {any} event cotext menu event
     * @return {void}@memberof SubmodulesComponent
     */
    gotoOriginal(event) {
        var lego = event.item[1];
        if (!_.isEmpty(lego)) {
            var item = this.ModuleService.getModule(lego.referenceLegoId);
            // var moduleList = this.ModuleService.getModelList();
            // var orgLego = _.find(moduleList, (m) => {
            //     return (m.legoId == lego.referenceLegoId)
            // });
            if (!_.isEmpty(item)) {
                this.changeModule(item);
            }
        }
    }
    /**
     * open module by single,double click based on the preferrence settings
     * @param  {any} item selected module
     * @param  {any} parentModule parent of selected module
     * @param  {any} eventClick click event - single or double click
     * @param  {any} event click event
     * @return {void}@memberof SubmodulesComponent
     */
    clickDblClickOpenModule(item, parentModule, eventClick, event) {
        if (!$(event.target).hasClass("blinkelement")) {
            // if the defaultMouseClick and eventClick both are true it's 'Single Click event' / Both are false then it's 'Double Click event' to call the method
            if (item.renamable == undefined || item.renamable != true) {
                if (this.defaultMouseClick == eventClick) {
                    var reqitem = [];
                    reqitem.push(parentModule);
                    reqitem.push(item);
                    reqitem.push(false);
                    var openReq = {
                        event: event,
                        item: reqitem
                    }
                    this.OpenModule(openReq);
                    //  this.changeModule(item);
                }
            }
        }
    }
    /**
     * change module - set set selected module prepartion
     * @param  {any} item selected submodule
     * @return {void}@memberof SubmodulesComponent
     */
    changeModule(item) {
        if (!_.isEmpty(item)) {
            var newparams :any = _.clone(item.params);
            newparams.lId = item.legoId;
            newparams.pId = item.parentId;
            newparams.lLvl = item.legoLevel;
            newparams.pos = item.position;
            newparams.mode = item.type;
            newparams.t = "submodules"
            if(item.referenceLegoId > 0){
                var tempLego = this.ModuleService.findChildModules(this.ModuleService.treeModules, null, item.referenceLegoId);
                if(! _.isEmpty(tempLego)){
                    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, item.referenceLegoId);
                    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule, true);
                    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId, item.legoId);
                    var refparam:any={};
                    refparam.lId = tempLego.legoId;
                    refparam.lLvl = tempLego.legoLevel;
                    refparam.mode = tempLego.type;
                    refparam.pId = tempLego.parentId;
                    refparam.pos = tempLego.position;
                    refparam.isRef=true;
                    refparam.Rid=item.legoId;
                    refparam.Oid=item.referenceLegoId;
                    this.ModuleService.setSelectedModule(tempLego);
                    _.merge(newparams, refparam);
                }
                else {
                    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule, false);
                    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId, 0);
                    this.ModuleService.setSelectedModule(item);
                }
                
              }
              else {
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.isRefModule, false);
                this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.RefModuleId, 0);
                this.ModuleService.setSelectedModule(item);
            }
            this.router.navigate([], { queryParams: newparams });
        }
    }
    /**
     * format dummy node while adding new and end of module group.
     * @param  {any} node 
     * @return 
     * @memberof SubmodulesComponent
     */
    formatDummyNode(node) {
        var dummmyNode = _.cloneDeep(node);
        dummmyNode.legoName = 'dummy';
        dummmyNode.legoId = this.CommonUtilityService.IDGenerator(8, 'n') * (-1);
        dummmyNode.legoLevel = node.legoLevel + 1;
        dummmyNode.parentId = node.legoId;
        dummmyNode.children = [];
        dummmyNode.type = 'DM';
        if (dummmyNode.parent)
            delete dummmyNode.parent;
        dummmyNode.draggable = false;
        dummmyNode.droppable = false;
        return dummmyNode;
    }
    /**
     * remove employee,document module from tree modules
     * @param  {any} module tree modules
     * @return 
     * @memberof SubmodulesComponent
     */
    FilterDocumentEMployeeModules(module) {
        var nodes = _.cloneDeep(module);
        if (nodes.children.length > 0) {
            nodes.children = _.remove(nodes.children, (TreeItems: any) => {
                return (TreeItems.cType != 'E' && TreeItems.cType != 'D' && TreeItems.cType != null);
            });
            nodes.draggable = false;
            nodes.droppable = false;
            _.forEach(nodes.children, (node, key) => {
                var dummmyNode = this.formatDummyNode(node)
                node.children.push(dummmyNode);
            });
        }
        var pdummmyNode = _.cloneDeep(nodes);
        pdummmyNode.legoName = 'dummy';
        pdummmyNode.legoId = this.CommonUtilityService.IDGenerator(8, 'n') * (-1);
        pdummmyNode.legoLevel = nodes.legoLevel + 2;
        pdummmyNode.parentId = nodes.legoId;
        pdummmyNode.children = [];
        pdummmyNode.type = 'DM';
        delete pdummmyNode.parent;
        pdummmyNode.draggable = false;
        pdummmyNode.droppable = false;
        nodes.children.push(pdummmyNode);
        return nodes;
    }
    /**
     * delete module -show confirmation dialog
     * @param  {any} event 
     * @return {void}@memberof SubmodulesComponent
     */
    DeleteModule(event) {
        this.tempSelectedLego = _.cloneDeep(event.item[1]);
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete?',
            accept: () => {
                this.tempSelectedLego.OwnerId = parseInt(this.userinfo.EmployeeId);

                var req: any = {
                    lego: this.tempSelectedLego,
                    statementType: 'SDelete',
                    StatementFlag: 'Lego Deleted'
                };
                this.updateUndoRedoMaps(_.clone(req), 'b');
                this.tempSelectedLego.delFlag = 'Y';
                req.lego.delFlag = 'Y';
                this.updateModules(req);
                //Actual logic to perform a confirmation
            }
        });
    }
    /**
     * storage cut module value in variable
     * @param  {any} event 
     * @return {void}@memberof SubmodulesComponent
     */
    cutModuleProcess(event) {
        this.copyRefLego = null;
        this.copyLego = null;
        this.cutLego = null;
        this.cutLego = _.cloneDeep(event.item);
    }
    /**
     * storage copied module value in variable
     * @param  {any} event 
     * @return {void}@memberof SubmodulesComponent
     */
    copyModuleProcess(event) {
        if (event.item) {
            this.copyRefLego = null;
            this.copyLego = null;
            this.cutLego = null;
            this.copyLego = _.cloneDeep(event.item);
            // if (event.item.referenceLegoId != 0 && event.item.referenceLegoId != null) {
            //     this.copyRefLego = event.item;
            // }
            // else {
            //     this.copyLego = event.item;
            // }
        }
    }
    /**
     * get drag module values from selectionvalue DOM data.
     * @param  {any} event 
     * @return {void}@memberof SubmodulesComponent
     */
    dragModuleProcess(event) {
        var oldparentNode = $(event.from).data("sectionvalue");
        var newparentNode = $(event.to).data("sectionvalue");
        var currentNode = $(event.item).data("sectionvalue");
        var oldNode = _.cloneDeep($(event.item).data("sectionvalue"));
        //     var treenodes = _.cloneDeep(this.ModuleTreeItems);
        //         var tempoldlegoId=$(event.from).data("sectionvalue");
        //         var oldparentNode = this.ModuleService.findChildModules([treenodes], null, parseInt(tempoldlegoId));
        //    // var oldparentNode = $(event.from).data("sectionvalue");
        //    var tempnewlegoId=$(event.to).data("sectionvalue");
        //    var newparentNode =  this.ModuleService.findChildModules([treenodes], null, parseInt(tempnewlegoId));
        //   //  var newparentNode = $(event.to).data("sectionvalue");
        //   var currentnewlegoId=$(event.item).data("sectionvalue");
        //   var currentNode =  this.ModuleService.findChildModules([treenodes], null, parseInt(currentnewlegoId));
        //   //  var currentNode = $(event.item).data("sectionvalue");
        var oldNode = _.cloneDeep(currentNode);
        var newposition = event.newIndex;
        var oldPosition = event.oldIndex;
        currentNode.ownerId = parseInt(this.userinfo.EmployeeId);
        // if(currentNode.legoId != oldNode.legoId)
        // {
        if (event.newIndex > 0) {
            var prev = $(event.to).children("ul")[event.newIndex - 1];
            // var prevNodelegoId=$(event.to).data("sectionvalue");
            // var prevNode : any =this.ModuleService.findChildModules([treenodes], null, parseInt(prevNodelegoId));
            var prevNode = $(prev).data("sectionvalue");
            currentNode.parentId = prevNode.parentId;
            currentNode.position = prevNode.position;
            currentNode.legoLevel = prevNode.legoLevel;
            if (prevNode.legoId < 0) {
                //   currentNode.parentId = newparentNode.parentId;
                //  currentNode.position = newparentNode.position;

                currentNode.position = newposition;
                currentNode.legoLevel = newparentNode.legoLevel + 1;
            }

        }
        else {
            currentNode.position = 0;
            currentNode.parentId = newparentNode.legoId;
            if (oldparentNode.legoId != newparentNode.legoId) {
                currentNode.legoLevel = (newparentNode.legoLevel + 1);
                // if(event.newIndex != event.oldIndex)
                // {
                //     currentNode.legoLevel = newparentNode.legoLevel;
                // }
                // else{
                // }
            }
        }
        var legoupdation = {
            parentLego: newparentNode,
            currentLego: currentNode,
            lego: currentNode,
            oldLego: oldNode,
            currentLegoLevel: this.currentLegoLevel,
            statementType: 'Move'
        };
        this.updateUndoRedoMaps(_.clone(legoupdation), 'b');
        this.updateModules(legoupdation);
        // }
    }
    /**
     * drag module process - extract data from drag event
     * @param  {any} event drag event
     * @return {void}@memberof SubmodulesComponent
     */
    TreedragModuleProcess(event) {

        var dragNode = _.clone(event.dragNode);
        var dropNode = _.clone(event.dropNode);
        var dropIndex = event.dropIndex;
        dragNode.ownerId = parseInt(this.userinfo.EmployeeId);

        if ($(event.originalEvent.currentTarget).hasClass('ui-treenode-droppoint')) {
            dragNode.parentId = dropNode.parentId;
            dragNode.legoLevel = dropNode.legoLevel;
            if (dropNode.parent.children.length > 0) {
                dragNode.position = dropNode.parent.children[dropIndex + 1].position;
            }
            else {
                dragNode.position = 0;
            }
        }
        if ($(event.originalEvent.currentTarget).hasClass('ui-treenode-content')) {
            dragNode.parentId = dropNode.legoId;
            dragNode.legoLevel = (dropNode.legoLevel + 2);
            if (dropNode.children.length > 0) {
                dragNode.position = dropNode.children[dropNode.children.length - 1].position;
            }
            else {
                dragNode.position = 0;
            }
        }
        delete dropNode.parent;
        delete dropNode.children;
        delete dragNode.parent;
        delete dragNode.children;
        var legoupdation = {
            parentLego: dropNode,
            currentLego: dragNode,
            lego: dragNode,
            oldLego: dropNode,
            currentLegoLevel: this.currentLegoLevel,
            statementType: 'Move'
        };
        this.updateModules(legoupdation);
    }
    /**
     * past module process - check copy or cut process then actuval module move process
     * @param  {any} event 
     * @param  {any} mode 
     * @return {void}@memberof SubmodulesComponent
     */
    pastModuleProcess(event, mode) {
        var Node = event.item;
        var targetNode = _.cloneDeep(event.item[1]);
        var parentNode = _.cloneDeep(event.item[0]);
        var cutcopiedNode = _.cloneDeep((!_.isEmpty(this.cutLego)) ? this.cutLego :
            (!_.isEmpty(this.copyLego)) ? this.copyLego : null);
        var pasteFlag = (!_.isEmpty(this.cutLego)) ? "CUTPS" :
            (!_.isEmpty(this.copyLego)) ? "COPYPS" : null;
        var firstChild = false;
        if (!_.isEmpty(cutcopiedNode) && cutcopiedNode != null) {
            var oldNode = _.cloneDeep(cutcopiedNode[1]);
            var validPast = true;
            if (pasteFlag == "CUTPS" && targetNode.legoId == cutcopiedNode[1].legoId) {
                validPast = false;
            }
            if (validPast) {
                var currentNode = cutcopiedNode[1];
                currentNode.parentId = targetNode.parentId;
                currentNode.position = targetNode.position;
                currentNode.legoLevel = targetNode.legoLevel;
                currentNode.ownerId = parseInt(this.userinfo.EmployeeId);
                if (targetNode.legoLevel == (this.currentLegoLevel + 1) && event.item[2] == false) {
                    firstChild = true;
                    currentNode.position = 0;
                    currentNode.parentId = targetNode.legoId;
                    currentNode.legoLevel = (targetNode.legoLevel + 1);
                    // if (mode == 'P' && !_.isEmpty(this.copyLego)) {
                    //     currentNode.legoLevel = (targetNode.legoLevel + 1);
                    // }
                    // else {
                    //     currentNode.legoLevel = (targetNode.legoLevel + 2);
                    // }
                }
                var legoupdation: any = {
                    parentLego: event.item[0],
                    currentLego: currentNode,
                    lego: currentNode,
                    oldLego: oldNode,
                    currentLegoLevel: this.currentLegoLevel
                };
                if (mode == 'P' && !_.isEmpty(this.cutLego)) {
                    legoupdation.statementType = 'Move';
                    legoupdation.exstatementType = 'PMove';
                }
                else if (mode == 'P' && !_.isEmpty(this.copyLego)) {
                    legoupdation.statementType = 'Past';
                    legoupdation.transMode = "P";
                }
                else if (mode == 'PF') {
                    legoupdation.statementType = 'PastReference';
                    legoupdation.transMode = "PF";
                    legoupdation.lego.referenceLegoId = currentNode.legoId;
                    if (targetNode.legoLevel == (this.currentLegoLevel + 1)) {
                        currentNode.legoLevel = targetNode.legoLevel + 1;
                        if (this.selectedModuleId == parentNode.legoId && event.item[2] == true) {
                            currentNode.legoLevel = parentNode.legoLevel + 1;
                        }
                        // else if(this.selectedModuleId == parentNode.legoId  && event.item[2] == true){
                        //     currentNode.legoLevel = parentNode.legoLevel;
                        // }
                        legoupdation.lego.referenceLegoId = _.clone(currentNode.legoId);
                        legoupdation.lego.legoId = parentNode.legoId;
                    }
                }
                if (targetNode.legoId == parentNode.legoId) {
                    currentNode.parentId = parentNode.legoId;
                    currentNode.legoLevel = parentNode.legoLevel + 1;
                    currentNode.position = parentNode.length;
                }
                this.updateUndoRedoMaps(_.clone(legoupdation), 'b')
                this.updateModules(legoupdation);
            }
        }
    }
    /**
     * update modules - add,rename,delete,move,past,zoom size,add/remove reference module
     * @param  {*} legoupdation - add,rename,delete,move,past,zoom size,add/remove reference module
     * @return {void}@memberof SubmodulesComponent
     */
    updateModules(legoupdation: any) {
        legoupdation.selectedModelId = this.selectedModelId;
        this.ModuleService.addModule(legoupdation).then(res => {
            if (res) {
                if (!_.isEmpty(res)) {
                    if (res.status == 1) {
                        this.cutLego=null;
                        var result: any = res.result;
                        //result.selectedLego
                        if (legoupdation.statementType == "Add" && result.length > 0) {
                            var lego = result[0];
                            legoupdation.lego = _.cloneDeep(lego);
                            legoupdation.lego.delFlag = "Y";
                            this.updateUndoRedoMaps(_.clone(legoupdation), 'b');
                            legoupdation.lego = _.cloneDeep(lego);
                            legoupdation.lego.delFlag = "N";
                            this.updateUndoRedoMaps(_.clone(legoupdation), 'a');
                            this.nochildren=false;
                            $("#firstChildHolder").hide();
                        }
                        if (legoupdation.statementType == "Past" && legoupdation.transMode == "P" && result.selectedLego.length > 0) {
                            var lego = result.selectedLego[0]
                            legoupdation.lego = _.cloneDeep(lego);
                            legoupdation.lego.delFlag = "Y";
                            this.updateUndoRedoMaps(_.clone(legoupdation), 'b');
                            legoupdation.lego = _.cloneDeep(lego);
                            legoupdation.lego.delFlag = "N";
                            this.updateUndoRedoMaps(_.clone(legoupdation), 'a');
                            this.nochildren=false;
                            $("#firstChildHolder").hide();
                        }
                        else if (legoupdation.statementType == "Move") {
                            this.updateUndoRedoMaps(_.clone(legoupdation), 'a');
                            $("#firstChildHolder").hide();
                        }
                        else if (legoupdation.statementType == "SDelete") {
                            if (legoupdation.lego.delFlag == 'Y') {
                                //this.filterTagList();
                                this.updatefilterTags(legoupdation);
                            }
                            this.updateUndoRedoMaps(_.clone(legoupdation), 'a');
                        }
                        else {
                            this.updateUndoRedoMaps(_.clone(legoupdation), 'a');
                        }

                        if (legoupdation.statementType != "zoomSize") {
                            //this.assignModuleUpdates(result);


                            if (legoupdation.undoredoProcess == 1) {
                                this.assignModuleUpdates(result);
                            }
                            else
                                this.InternalUpdates(legoupdation, result);
                            // this.ModuleService.setModules().then((res) => {

                            //     //  this.moduleItems =this.ModuleService.getTreeModules();
                            // });
                            // this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
                            //     this.selectedModelId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
                            //     this.getTreeModules();
                        }
                        if (legoupdation.statementType == "zoomSize") {
                            // this.getTreeModules();
                            this.self_refresh()
                        }
                        // $('#drag_rootContainer')[0].scrollLeft = this.lastPosition.left;
                        // $('#drag_rootContainer')[0].scrollTop = this.lastPosition.top;
                    }
                }
            }
            this.addModuleFlag = false;
        });
    }

    /**
     * client side module update after server updates 
     * @param  {any} LegoUpdation - add,rename,delete,move,past,zoom size,add/remove reference module
     * @param  {any} result - server response data after success full update.
     * @return {void}@memberof SubmodulesComponent
     */
    InternalUpdates(LegoUpdation, result) {
        var lego = LegoUpdation.lego;
        var oldLego = LegoUpdation.oldLego;
        switch (LegoUpdation.statementType) {
            case "Move":
                this.moveUpdation(LegoUpdation, result);
                break;
            case "Rename":
                this.renameUpdation(LegoUpdation);
                break;
            case "Add":
                this.addModUpdation(LegoUpdation, result);
                break;
            case "SDelete":
                if (lego.delFlag == "Y") {
                    this.deleteModUpdation(LegoUpdation, result);
                }
                else
                    this.deleteUndoModUpdation(LegoUpdation, result);
                break;
            case "PastReference":
                this.PastReferenceUpdation(LegoUpdation, result);
                break;
            case "Past":
                this.PastUpdation(LegoUpdation, result);
                break;
            default:
                this.assignModuleUpdates(result);
                break;
        }

    }
    /**
     * rename updates on client side
     * @param  {any} LegoUpdation rename data after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    renameUpdation(LegoUpdation) {
        var lego = LegoUpdation.lego;
        var oldLego = LegoUpdation.oldLego;
        var parentLego: any;
        if (this.currentLegoLevel + 1 < lego.legoLevel) {
            parentLego = _.find(this.ModuleTreeItems.children, (child) => {
                return (child.legoId == lego.parentId)
            });
        }
        else {
            parentLego = this.ModuleTreeItems;
        }
        var idx = _.findIndex(parentLego.children, (i) => {
            return (i.legoId == lego.legoId)
        });
        parentLego.children[idx].legoName, parentLego.children[idx].label = lego.legoName;
        parentLego.children[idx].tooltipLegoName = this.ModuleService.shortenText(lego.legoName, (this.ModuleService.zoomsize - 65), '...', false, lego);
        this.ModuleService.updateReferenceModuleRenames(this.ModuleTreeItems.children,lego);
        // this.ModuleTreeItems = _.cloneDeep(this.ModuleTreeItems);
        this.cd.detectChanges();
        this.ModuleService.setExternalModuleChanges(_.cloneDeep(this.ModuleTreeItems), LegoUpdation);
    }

     /**
     * delete updates on client side,update postion,level etc
     * @param  {any} LegoUpdation delete data after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    deleteUndoModUpdation(LegoUpdation, result) {
        var lego = LegoUpdation.lego;
        var oldLego = LegoUpdation.oldLego;
        if (result.allLegos.length > 0) {
            var pastedTree: any;
            if (result.allLegos.length > 1) {
                var dummyParent = _.cloneDeep(lego);
                dummyParent.legoId = dummyParent.parentId;
                dummyParent.parentId = 0;
                result.allLegos.push(dummyParent);
                pastedTree = this.ModuleService.unflattenEntities(result.allLegos);
                if (pastedTree.length > 0) {
                    if (pastedTree[0].children.length > 0) {
                        pastedTree = pastedTree[0].children[0];
                    }
                }
            }
            else {
                pastedTree = this.ModuleService.formatLego(result.allLegos[0]);
            }
            if (lego.legoLevel == (this.currentLegoLevel + 1)) {
                this.ModuleTreeItems.children.splice(lego.position - 1, 0, pastedTree);
                this.reorderPosition(this.ModuleTreeItems.children, true);
            }
            else {
                var new_parent = _.find(this.ModuleTreeItems.children, (item) => {
                    return (item.legoId == lego.parentId);
                });
                new_parent.children.splice(lego.position - 1, 0, pastedTree);
                this.reorderPosition(new_parent.children, true);
                this.updatechildCount(new_parent, lego, 1);
            }
            // this.ModuleTreeItems.children = [...this.ModuleTreeItems.children]; // xc
            this.ModuleService.setExternalModuleChanges(_.cloneDeep(this.ModuleTreeItems), LegoUpdation);
        }
    }
     /**
     * add module updates on client side
     * @param  {any} LegoUpdation add module after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    addModUpdation(LegoUpdation, result) {
        if (result.length > 0) {
            var lego = result[0];
            var formatedLego = this.ModuleService.formatLego(lego);
            if (lego.legoLevel == (this.currentLegoLevel + 1)) {
                //this.ModuleTreeItems.children.splice(lego.position, 0,lego);
                var dummmyNode = this.formatDummyNode(lego);
                formatedLego.children.push(dummmyNode);
                this.ModuleTreeItems.children[lego.position - 1] = formatedLego;

                this.reorderPosition(this.ModuleTreeItems.children, false);
            }
            else {
                var new_parent = _.find(this.ModuleTreeItems.children, (item) => {
                    return (item.legoId == lego.parentId);
                });
                new_parent.childCount += 1;
                new_parent.children[lego.position - 1] = formatedLego;
                this.reorderPosition(new_parent.children, true);
            }
            //   this.ModuleTreeItems.children = [...this.ModuleTreeItems.children];// xc
            this.ModuleService.setExternalModuleChanges(_.cloneDeep(this.ModuleTreeItems), LegoUpdation);
            this.nochildren=false;
            this.cd.detectChanges();
        }

    }
     /**
     * delete module on client side
     * @param  {any} LegoUpdation delete module after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    deleteModUpdation(LegoUpdation, result) {
        var lego = LegoUpdation.lego;

        if (this.currentLegoLevel + 1 == lego.legoLevel) {
            var idx = _.findIndex(this.ModuleTreeItems.children, (child) => {
                return (child.legoId == lego.legoId)
            });
            this.ModuleTreeItems.children.splice(idx, 1);
            this.reorderPosition(this.ModuleTreeItems.children, true);
        }
        else {
            var p_idx = _.findIndex(this.ModuleTreeItems.children, (child) => {
                return (child.legoId == lego.parentId)
            });
            var old_parent = this.ModuleTreeItems.children[p_idx];
            var c_idx = _.findIndex(old_parent.children, (child) => {
                return (child.legoId == lego.legoId)
            });
            old_parent.children.splice(c_idx, 1);
            this.reorderPosition(old_parent.children, true);

        }
        //  this.ModuleTreeItems.children = [...this.ModuleTreeItems.children]; // xc
        this.ModuleService.setExternalModuleChanges(_.cloneDeep(this.ModuleTreeItems), LegoUpdation);
        if(this.ModuleTreeItems.children.length > 0){
            var c = _.filter(this.ModuleTreeItems.children,(n)=>{
                return ( n.legoId > 0)
            });
            if(c.length == 0){
                this.nochildren=true;
                $("#firstChildHolder").show();
            }
        }
    }
     /**
     * copy-past module updates on client side
     * @param  {any} LegoUpdation copy-past module after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    PastUpdation(LegoUpdation, result) {
        var lego = LegoUpdation.lego;
        var oldLego = LegoUpdation.oldLego;
        lego.childCount = oldLego.childCount;
        if (result.allLegos.length > 0) {
            var pastedTree: any;
            if (result.allLegos.length > 1) {
                var dummyParent = _.cloneDeep(lego);
                dummyParent.legoId = dummyParent.parentId;
                dummyParent.parentId = 0;
                result.allLegos.push(dummyParent);
                pastedTree = this.ModuleService.unflattenEntities(result.allLegos);
                if (pastedTree.length > 0) {
                    if (pastedTree[0].children.length > 0) {
                        pastedTree = pastedTree[0].children[0];
                    }
                }
            }
            else {
                pastedTree = this.ModuleService.formatLego(result.allLegos[0]);
            }
            pastedTree.childCount = oldLego.childCount;
            if (lego.legoLevel == (this.currentLegoLevel + 1)) {
                this.ModuleTreeItems.children.splice(lego.position - 1, 0, pastedTree);
                this.reorderPosition(this.ModuleTreeItems.children, true);
            }
            else {
                var new_parent = _.find(this.ModuleTreeItems.children, (item) => {
                    return (item.legoId == lego.parentId);
                });
                new_parent.children.splice(lego.position - 1, 0, pastedTree);
                this.reorderPosition(new_parent.children, true);
                this.updatechildCount(new_parent, lego, 1);
            }
            //   this.ModuleTreeItems.children = [...this.ModuleTreeItems.children]; // xc
            this.ModuleService.setExternalModuleChanges(_.cloneDeep(this.ModuleTreeItems), LegoUpdation);
            this.nochildren=false;
        }
    }
         /**
     * copy-past reference module updates on client side
     * @param  {any} LegoUpdation copy-past reference module after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    PastReferenceUpdation(LegoUpdation, result) {
        if (result.length > 0) {
            var lego = result[0];
            var formatedLego = this.ModuleService.formatLego(lego);
            if (lego.legoLevel == (this.currentLegoLevel + 1)) {
                //this.ModuleTreeItems.children.splice(lego.position, 0,lego);
                this.ModuleTreeItems.children[lego.position - 1] = formatedLego;
                this.reorderPosition(this.ModuleTreeItems.children, false);
            }
            else {
                var new_parent = _.find(this.ModuleTreeItems.children, (item) => {
                    return (item.legoId == lego.parentId);
                });
                new_parent.childCount += 1;
                new_parent.children.splice(lego.position - 1, 0, lego);
                this.reorderPosition(new_parent.children, true);
            }
            //   this.ModuleTreeItems.children = [...this.ModuleTreeItems.children]; // xc
            this.ModuleService.setExternalModuleChanges(_.cloneDeep(this.ModuleTreeItems), LegoUpdation);
            this.nochildren=false;
        }
    }
         /**
     *  module move updates on client side
     * @param  {any} LegoUpdation  module move  after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    moveUpdation(LegoUpdation, result) {
        var lego: any = LegoUpdation.lego;
        if (result.length == 1) {
            var org_lego: any = result[0];
            lego.legoLevel = org_lego.legoLevel;
            lego.position = org_lego.position;
            lego.parentId = org_lego.parentId;
        }
        lego.childCount = LegoUpdation.lego.childCount;
        var oldLego = LegoUpdation.oldLego;
        if (lego.legoLevel == oldLego.legoLevel && oldLego.legoLevel == (this.currentLegoLevel + 1)) {
            if (LegoUpdation.exstatementType == "PMove") {
                this.ModuleTreeItems.children.splice(oldLego.position - 1, 1);
                this.ModuleTreeItems.children.splice(lego.position - 1, 0, lego);
            }
            this.reorderPosition(this.ModuleTreeItems.children, false);
            var Idx = _.findIndex(this.ModuleTreeItems.children, (item) => {
                return (item.legoId == lego.legoId);
            });
            _.each(this.ModuleTreeItems.children, (i) => {
                i.legoLevel = this.ModuleTreeItems.legoLevel + 1;
            });
            this.reformatLegoData(this.ModuleTreeItems.children[Idx]);
        }
        else if (lego.legoLevel > oldLego.legoLevel) {
            // splice clone  element
            var spliceIdx = _.findIndex(this.ModuleTreeItems.children, (item) => {
                return (item.legoId == lego.legoId);
            });
            this.ModuleTreeItems.children.splice(spliceIdx, 1);
            // splice end
            var item = _.find(this.ModuleTreeItems.children, (item) => {
                return (item.legoId == lego.parentId);
            });
            if(!_.isEmpty(item)){
                if (LegoUpdation.exstatementType == "PMove") {
                    item.children.splice(lego.position - 1, 0, lego);
                }
                var currentItemIdx = _.findIndex(item.children, (c) => {
                    return (c.legoId == lego.legoId)
                });
                item.children[currentItemIdx].legoLevel = lego.legoLevel;
                item.children[currentItemIdx].parentId = lego.parentId;
                this.reorderPosition(item.children, true);
                this.reorderPosition(this.ModuleTreeItems.children, false);
                this.reformatLegoLevel(item, lego, true, oldLego);
                this.updatechildCount(item, lego, 1);
            }
            else{
                if (LegoUpdation.exstatementType == "PMove") {
                    this.ModuleTreeItems.children.push(lego);
                }
                var currentItemIdx = _.findIndex(this.ModuleTreeItems.children, (c) => {
                    return (c.legoId == lego.legoId)
                });
                this.ModuleTreeItems.children[currentItemIdx].legoLevel = lego.legoLevel;
                this.ModuleTreeItems.children[currentItemIdx].parentId = lego.parentId;
                this.reorderPosition(this.ModuleTreeItems.children, true);
                this.reorderPosition(this.ModuleTreeItems.children, false);
                this.reformatLegoLevel(this.ModuleTreeItems, lego, true, oldLego);
                this.updatechildCount(this.ModuleTreeItems, lego, 1);
            }

        }
        else if (lego.legoLevel < oldLego.legoLevel) {
            // splice clone  element
            var old_parent = _.find(this.ModuleTreeItems.children, (item) => {
                return (item.legoId == oldLego.parentId);
            });
            if (old_parent.children != undefined && old_parent.children != null) {
                var spliceIdx = _.findIndex(old_parent.children, (item) => {
                    return (item.legoId == lego.legoId);
                });
                old_parent.children.splice(spliceIdx, 1);
            }
            // splice end

            this.reorderPosition(old_parent.children, true);
            this.updatechildCount(old_parent, lego, -1);
            if (LegoUpdation.exstatementType == "PMove") {
                this.ModuleTreeItems.children.splice(lego.position - 1, 0, lego);
            }
            var newIndx = _.findIndex(this.ModuleTreeItems.children, (l) => {
                return (l.legoId == lego.legoId)
            })
            if (newIndx > -1) // check dummy node is exist
            {
                var currentModule = this.ModuleTreeItems.children[newIndx];
                var dummmyNode = this.formatDummyNode(lego);
                if (currentModule.children.length == 0) {
                    this.ModuleTreeItems.children[newIndx].children.push(dummmyNode);
                }
                else if (currentModule.children[currentModule.children.length - 1].legoId < 0) {
                    this.ModuleTreeItems.children[newIndx].children.push(dummmyNode);
                }
            }
            this.reorderPosition(this.ModuleTreeItems.children, false);
            this.reformatLegoLevel(this.ModuleTreeItems, lego, true, oldLego);
        }
        else if (lego.legoLevel == oldLego.legoLevel) {
            if (lego.parentId != oldLego.parentId) {
                var old_parentIdx = _.findIndex(this.ModuleTreeItems.children, (item) => {
                    return (item.legoId == oldLego.parentId);
                });
                var old_parent = this.ModuleTreeItems.children[old_parentIdx];
                var spliceIdx = _.findIndex(old_parent.children, (item) => {
                    return (item.legoId == lego.legoId);
                });
                old_parent.children.splice(spliceIdx, 1);
                var new_parent = _.find(this.ModuleTreeItems.children, (item) => {
                    return (item.legoId == lego.parentId);
                });
                if (LegoUpdation.exstatementType == "PMove") {
                    new_parent.children.splice(lego.position - 1, 0, lego);
                }
                var currentItemIdx = _.findIndex(new_parent.children, (c) => {
                    return (c.legoId == lego.legoId)
                });
                new_parent.children[currentItemIdx].legoLevel = lego.legoLevel;
                new_parent.children[currentItemIdx].parentId = lego.parentId;
                // splice end
                this.reorderPosition(old_parent.children, true);
                if (!_.isEmpty(new_parent)) {
                    this.reorderPosition(new_parent.children, true);
                }

                this.updatechildCount(this.ModuleTreeItems.children[old_parentIdx], lego, -1);
                
            }
            else {
                if (LegoUpdation.exstatementType == "PMove") {
                    var new_p = _.find(this.ModuleTreeItems.children, (item) => {
                        return (item.legoId == lego.parentId);
                    });
                    new_p.children.splice(oldLego.position - 1, 1);
                    new_p.children.splice(lego.position - 1, 0, lego);
                }
            }
            // new parent
            var new_parentIdx = _.findIndex(this.ModuleTreeItems.children, (item) => {
                return (item.legoId == lego.parentId);
            });
            var new_parent = this.ModuleTreeItems.children[new_parentIdx];
            // if(LegoUpdation.exstatementType == "PMove")
            //     {
            //         new_parent.children.splice(lego.position - 1, 0,lego);
            //     }
            if (new_parent.children != undefined && new_parent.children != null) {
                this.reorderPosition(new_parent.children, true);
            }
            this.updatechildCount(this.ModuleTreeItems.children[new_parentIdx], lego, 1);
            this.reformatLegoLevel(new_parent, lego, false, oldLego)
        }
        //   this.ModuleTreeItems.children = [...this.ModuleTreeItems.children]; // xc
        this.ModuleService.setExternalModuleChanges(_.cloneDeep(this.ModuleTreeItems), LegoUpdation);
    }
         /**
     * Module position updates on client side
     * @param  {any} LegoUpdation Module position after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    reorderPosition(item, alpha) {
        var dummyIndex = _.findIndex(item, (d) => {
            return (0 > d.legoId)
        });

        if (dummyIndex > -1 && dummyIndex != (item.length - 1)) {
            var dummyData = _.cloneDeep(item[dummyIndex]);
            item.splice(dummyIndex, 1);
            item.push(dummyData);
        }
        _.each(item, (i, idx) => {
            i.position = idx + 1;
            if (alpha) {
                i.alphaOrder = this.ModuleService.numberToAlphapets(i.position);
            }
            this.reformatLegoData(i);
        });
        this.ModuleTreeItems.children = [...this.ModuleTreeItems.children];
        // this.ModuleTreeItems=_.cloneDeep(this.ModuleTreeItems);
    }
    /**
     * reorder updates on client side
     * @param  {any} item drag items - module,parent module
     * @param  {any} lego module
     * @param  {any} sign decrese or increse module child count
     * @return {void}@memberof SubmodulesComponent
     */
    updatechildCount(item, lego, sign) {
        item.childCount += (sign) * (lego.childCount + 1);
    }
    /**
     * reformat lego level after add,delete modules
     * @param  {any} item process items- module,parent module
     * @param  {any} lego update modules
     * @param  {any} updateLevel update lego level based on add,delete current level
     * @param  {any} oldLego lego before server updates
     * @return {void}@memberof SubmodulesComponent
     */
    reformatLegoLevel(item, lego, updateLevel, oldLego) {
        var idx = _.findIndex(item.children, (cItem) => {
            return (cItem.legoId == lego.legoId)
        });
        if (idx > -1) {
            if (updateLevel == true) {
                item.children[idx].legoLevel = item.legoLevel + 1;
            }
            item.children[idx].parentId = item.legoId;
            var addSubtractValue = (item.legoLevel + 1) - oldLego.legoLevel;
            this.reformatDeepLegoLevel(item.children[idx], addSubtractValue);
            this.reformatLegoData(item.children[idx])
        }

    }
    /**
     * update lego levels deeply if contains children
     * @param  {any} tree tree level modules
     * @param  {any} addSubtractValue increase or decrease lego level based on the process
     * @return 
     * @memberof SubmodulesComponent
     */
    reformatDeepLegoLevel(tree, addSubtractValue) {
        if (!tree["children"] || tree["children"].length === 0) return;
        for (var i = 0; i < tree["children"].length; i++) {
            var child = tree["children"][i];
            child.legoLevel = child.legoLevel + addSubtractValue;
            this.reformatDeepLegoLevel(child, addSubtractValue);
        }
        return;
    }
    /**
     * reformat - lego data like params,url after server updates
     * @param  {any} mappedElem 
     * @return {void}@memberof SubmodulesComponent
     */
    reformatLegoData(mappedElem) {
        mappedElem.url = "&lId=" + mappedElem.legoId + "&pId=" + mappedElem.parentId + "&lLvl=" + mappedElem.legoLevel + "&pos=" + mappedElem.position;
        mappedElem.params = {
            "lId": mappedElem.legoId,
            "pId": mappedElem.parentId,
            "lLvl": mappedElem.legoLevel,
            "pos": mappedElem.position,
            "mode": mappedElem.type
        }
    }
    /**
     * assign updated modules on client side after server updates
     * @param  {*} result lego data after server updates
     * @return {void}@memberof SubmodulesComponent
     */
    assignModuleUpdates(result: any) {
        if (result.allLegos.length > 0) {
            this.ModuleService.externalSetModules(result.allLegos);
        }
    }
    /**
     * self refresh if any lagging happened.
     * @return {void}@memberof SubmodulesComponent
     */
    self_refresh() {
        var item: any = {};
        item.legoId = this.selectedModuleId;
        item.params = this.queryparams;
        // this.changeModule(item);
        this.router.navigate([], { queryParams: this.queryparams });
    }
    /**
     * show rename textbox
     * @param  {any} event drag select event 
     * @return {void}@memberof SubmodulesComponent
     */
    showRename(event) {
        if (event.item) {
            event.item[1].renamable = true;
            setTimeout(() => {
                if ($("#renamemodule_" + event.item[1].legoId).length > 0) {
                    $("#renamemodule_" + event.item[1].legoId).focus();
                    $("#renamemodule_" + event.item[1].legoId).select();
                }
            }, 100)
        }
    }
    /**
     * hide rename text box
     * @param  {any} parentnode parent of selected module 
     * @param  {any} currentNode  current node 
     * @param  {any} event drag event
     * @return {void}@memberof SubmodulesComponent
     */
    hideRename(parentnode, currentNode, event) {
        if (currentNode.isNew == true) {
            if (event.target.value == "") {
                currentNode.legoName = "New Module";
            }
            else {
                currentNode.legoName = event.target.value;
            }
            // call add module method
            currentNode.legoId = currentNode.parentId;
            currentNode.employeeId = parseInt(this.userinfo.EmployeeId);
            currentNode.userId = this.userinfo.sub;
            currentNode.ownerId = parseInt(this.userinfo.EmployeeId);
            currentNode.icon = parentnode.icon;// 28-02-2019 Modified
            var legoupdation = {
                parentLego: parentnode,
                currentLego: currentNode,
                lego: currentNode,
                currentLegoLevel: this.currentLegoLevel,
                statementType: 'Add'
            };
            this.updateModules(legoupdation);
        }
        else {
            if (event.target.value != "" && currentNode.legoName != event.target.value) {
                currentNode.legoName = event.target.value;
                var templego = _.cloneDeep(currentNode);
                templego.ownerId = parseInt(this.userinfo.EmployeeId);
                var req: any = {
                    lego: templego,
                    statementType: 'Rename',
                    StatementFlag: 'Lego Name updated'
                };
                this.updateModules(req);
            }
            // call update module method
        }
        currentNode.renamable = false;
    }
    processContextMenuCloseEvent(event, contextmenu) {
    }
    triggerContextmenu($event, contextmenu, item: any) {
        if ($event.which === 3) {
            this.contextMenuService.show.next({
                anchorElement: $event.target,
                // Optional - if unspecified, all context menu components will open
                // contextMenu: this.submoduleRightMenu,
                event: <any>$event,
                item: item,
            });
            $event.preventDefault();
            $event.stopPropagation();
        }

    }
    /**
     * get module with based on zoom selection
     * @param  {any} item module
     * @param  {any} elem parent element
     * @return 
     * @memberof SubmodulesComponent
     */
    getmoduleWidth(item, elem) {
        var width;

        this.ZoomLevel_size = 125;

        switch (this.ZoomLevel) {
            case 'S':
                this.ZoomLevel = 'S';
                this.ZoomLevel_size = 85;
                break;
            case 'M':
                this.ZoomLevel = 'M';
                this.ZoomLevel_size = 105;
                break;
            case 'L':
                this.ZoomLevel = 'L';
                this.ZoomLevel_size = 125;
                break;
            case 'XL':
                this.ZoomLevel = 'XL';
                this.ZoomLevel_size = 145;
                break;
            case 'XXL':
                this.ZoomLevel = 'XXL';
                this.ZoomLevel_size = 165;
                break;
        }
        width = this.ZoomLevel_size.toString() + "px";
        var style: any = {
            width: width
        };
        if (item != null && item != undefined && !_.isEmpty(item)) {
            var childc = (item.children) ? (item.children.length + 1) : 2.5;
            if (elem == 'ul') {
                if (item.legoLevel == this.currentLegoLevel) {
                    style.width = (item.children.length > 0) ? (childc * this.ZoomLevel_size) + (this.ZoomLevel_size * 1.5)
                        : (2 * this.ZoomLevel_size).toString() + "px";
                }
            }
            else {
                if (item.legoId < 0) {
                    if (item.parentId == this.selectedModuleId) {
                        style.height = '10px';
                    }
                    else
                        style.width = '10px';
                }
                else if (item.legoLevel == (this.currentLegoLevel + 1)) {
                    var tw = (childc * this.ZoomLevel_size) + (this.ZoomLevel_size * 1.5);
                    style.width = tw.toString() + "px";
                }
            }
        }

        return style;
    }
    verticalVisible(item) {
        var visible = false;
        if (item.legoLevel == (this.currentLegoLevel + 1)) {
            visible = true;
        }
        return visible;
    }
    getchildCount(item) {
        //return item.children.length;
        var e = _.filter(_.cloneDeep(item.children), function (n) {
            return (n.legoId > 0);
        });
        return e.length;
    }
    checkdata(item) {
    }
    ngAfterViewInit() {
        // this.setElementAutoHeight(null);
        //this.activateModuleTabs();
        this.ModuleService.activateModuleTabs(this.queryparams);
    }
    activateModuleTabs() {
        $("#main_tab_container ul > li").each(function (index) {
            $(this).removeClass("active");
        });

        $("#tab_submodule-link").parent(".nav-item").addClass("active");
    }
    FilterModules(filter) {
        var legoOjb: any = {
            legoId: filter.legoId
        }
        legoOjb.params = {
            "lId": filter.legoId,
            "pId": filter.parentId,
            "lLvl": filter.legoLevel,
            "pos": filter.legoPosition,
            "mode": filter.legoType
        }
        this.ModuleService.redirecttoSelectedModule(legoOjb);

        // this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId, filter.legoId);
        // var selectedmodel = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel);
        // if (selectedmodel != filter.modelId) {
        //     this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModel, filter.modelId);
        //     this.ModuleService.setModules();
        // }
        // else {
        //     var item = this.ModuleService.getModule(filter.legoId);
        //     this.changeModule(item);
        // }

    }
    getfilterTagList() {
        var req = {
            EmpId: this.userinfo.EmployeeId,
            ownerId: this.userinfo.EmployeeId,
            CompanyId: this.userinfo.CompanyId,
            ModelId: this.selectedModelId,
            StatementType: "SubModuleFilters"
        };
        this.filtertag = [];
        this.FilterTagService.FilterOperation(req)
            .then(res => {
                if (res) {
                    if (!_.isEmpty(res)) {
                        if (res.status == 1) {
                            this.filtertagList = res.result;
                            this.formatFilterTags();

                        }
                        else {
                            //this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                            this.filtertag = [];
                            return false;
                        }

                    }

                }
            }, error => {

            })
    }
    updatefilterTags(legoupdation) {
        if (legoupdation.lego) {
            console.log("update filter tags");
            var clonedFilterList = _.cloneDeep(this.filtertagList);
            this.filtertagList = _.filter(clonedFilterList, (l) => {
                return (l.legoId != legoupdation.lego.legoId)
            });
            this.formatFilterTags();
        }
    }
    formatFilterTags() {
        let tags: any[] = _.groupBy(this.filtertagList, (s) => {
            return s.legoTagId;
        });
        this.filtertag = _.map(tags, (t) => {
            var tag = {
                legoTagId: t[0].legoTagId,
                legoTag: t[0].legoTag,
                legoTagDesc: t[0].legoTagDesc,
                moduleTag: t
            }
            return tag;
        });


    }
    updateUndoRedoMaps(trackingValue: any, beforeAfter) {
        let obj = new undoRedoMapperModel();
        // obj.legoId = trackingValue.lego.legoId;
        obj.lego = _.cloneDeep(trackingValue.lego);
        switch (trackingValue.statementType) {
            case 'Add':
                //  obj.new_parentid = trackingValue.lego.parentId;
                obj.action = 'add';
                break;
            case 'SDelete':
                obj.action = 'SDelete';
                if (beforeAfter == 'b') {
                    obj.lego.delFlag = 'N';
                }
                else {
                    obj.lego.delFlag = 'Y';
                }
                break;
            case 'Update':
                if (trackingValue.lego.delFlag == "Y") {
                    obj.action = 'Delete';
                }
                else {
                    obj.action = 'Rename';
                }
                obj.new_parentid = trackingValue.lego.parentId;
                break;
            case 'Rename':
                obj.action = 'Rename';
                break;
            case 'Move':
                obj.action = 'Move';
                if (beforeAfter == 'b') {
                    var tempObj = {
                        lego: _.cloneDeep(trackingValue.oldLego),
                        oldLego: _.cloneDeep(trackingValue.lego),
                    }
                    obj.lego = tempObj;
                }
                else {
                    var tempObj = {
                        lego: _.cloneDeep(trackingValue.lego),
                        oldLego: _.cloneDeep(trackingValue.oldLego),
                    }
                    obj.lego = tempObj;
                }
                break;
            case 'Past':
                obj.action = 'Past';
                obj.sub_action = trackingValue.transMode;
                if (beforeAfter == 'b') {
                    var tempObj = {
                        lego: _.cloneDeep(trackingValue.oldLego),
                        oldLego: _.cloneDeep(trackingValue.lego),
                    }
                    obj.lego = tempObj;
                }
                else {
                    var tempObj = {
                        lego: _.cloneDeep(trackingValue.lego),
                        oldLego: _.cloneDeep(trackingValue.oldLego),
                    }
                    obj.lego = tempObj;
                }
                break;
            case 'zoomSize':
                break;
        }

        if (beforeAfter == 'b') {
            var beforeAterData: any = {
                b: obj,
                a: null
            }
            if (this.undoRedoMapper.length > 10) {
                this.undoRedoMapper.shift();
            }
            this.undoRedoMapper.push(beforeAterData);
            this.undoRedoIndex = this.undoRedoMapper.length - 1;
            this.undoRedoCursor = this.undoRedoMapper.length;
            this.disableUndo = false;
        }
        else {
            if (this.undoRedoMapper[this.undoRedoIndex] != undefined) {
                if (this.undoRedoMapper[this.undoRedoIndex]['a'] == null || this.undoRedoMapper[this.undoRedoIndex]['a'] == undefined) {
                    this.undoRedoMapper[this.undoRedoIndex].a = obj;
                }
            }


        }

    }
    UndoEvent() {
        if (this.undoRedoMapper.length > 0) {
            // if (this.previousUndoRedoProcess == 'b' || this.previousUndoRedoProcess== undefined) {
            if (this.undoRedoCursor >= 1) {
                if (this.previousUndoRedoProcess == 'b' || this.previousUndoRedoProcess == undefined) {
                    this.undoRedoCursor -= 1;
                    if (this.undoRedoMapper.length == this.undoRedoCursor) {
                        this.disableUndo = false;
                    }
                }
                if (this.undoRedoCursor > -1) {
                    this.disableRedo = false;
                }
                this.previousUndoRedoProcess = 'b';
                this.UndoRedoProcess('b');
            }
            else {
                this.undoRedoCursor = 0;
                this.disableUndo = false;
                this.previousUndoRedoProcess = 'b';
                this.UndoRedoProcess('b');
            }
            // if (this.undoRedoCursor == 0) {
            //     this.disableUndo=false;
            // }
            // }
            // this.previousUndoRedoProcess = 'b';
            // this.UndoRedoProcess('b');
        }
    }
    RedoEvent() {
        if (this.undoRedoMapper.length > this.undoRedoCursor) {
            if (this.previousUndoRedoProcess == 'a') {
                this.undoRedoCursor += 1;
            }
            this.previousUndoRedoProcess = 'a';
            this.UndoRedoProcess('a');
        }
        else {
            this.disableRedo = true;
        }

    }
    UndoRedoProcess(undoOrRedo) {
        var currentHistory: any = this.undoRedoMapper[this.undoRedoCursor];
        if (currentHistory != null && currentHistory != undefined) {
            var process = currentHistory[undoOrRedo];
            switch (process.action) {
                case 'Rename':
                    //  obj.new_parentid = trackingValue.lego.parentId;
                    var req: any = {
                        lego: process.lego,
                        statementType: 'Rename',
                        statementOption: 1,
                        StatementFlag: 'Lego Name updated'
                    };
                    this.updateModules(req);
                    break;
                case 'add':
                    var statementType = 'Update';
                    if (undoOrRedo == 'b') {
                        process.lego.delFlag = 'Y';
                    }
                    else if (undoOrRedo == 'a') {
                        process.lego.delFlag = 'N';
                    }
                    var req: any = {
                        lego: process.lego,
                        statementType: 'Update',
                        undoredoProcess: 1,
                        StatementFlag: 'Lego Deleted'
                    };
                    this.updateModules(req);
                    break;
                case 'Past':
                    var StatementFlag = 'Lego Deleted';
                    if (undoOrRedo == 'b') {
                        process.lego.lego.delFlag = 'Y';
                        StatementFlag = 'Lego Undo pasted element(Deleted)';
                    }
                    else if (undoOrRedo == 'a') {
                        process.lego.lego.delFlag = 'N';
                        StatementFlag = 'Lego Redo deleted element(Added)';
                    }
                    var req: any = {
                        lego: process.lego.lego,
                        statementType: 'Update',
                        undoredoProcess: 1,
                        StatementFlag: 'Lego Deleted'
                    };
                    this.updateModules(req);
                    break;
                case 'Move':
                    var req: any = {
                        lego: process.lego.lego,
                        oldLego: process.lego.oldLego,
                        statementType: 'Move',
                        undoredoProcess: 1,
                        StatementFlag: 'Lego undo Moved'
                    };
                    this.updateModules(req);
                    break;
                case 'SDelete':
                    var req: any = {
                        lego: process.lego,
                        oldLego: process.lego,
                        statementType: 'SDelete',
                        undoredoProcess: 1,
                        StatementFlag: 'Lego Deleted'
                    };
                    this.updateModules(req);
                    break;
            }
        }
        else {
            if (undoOrRedo == 'b') {
                this.undoRedoCursor += this.undoRedoMapper.length - 1;
                this.disableUndo = true;
            }
            else if (undoOrRedo == 'a') {
                this.undoRedoCursor = 0;
                this.disableRedo = true;
            }
        }

    }
    checkRights() {
        this.checkrights = this.ModuleService.getModuleRights();
        if (!_.isEmpty(this.checkrights)) {
            if (this.queryparams.mode == 'E') {
                this.hasRights = true;
            }
            else if (this.queryparams.mode != 'E' && this.checkrights.moduleRights != 'Restricted' && this.checkrights.modelRights != 'Restricted') {
                this.hasRights = true;
            }
            else {
                this.hasRights = false;
            }
        }
        if (!_.isEmpty(this.checkrights)) {
            if(this.checkrights.modelRights != 'Unrestricted'){
                this.operationalRights =this.checkrights.modelRights;
              }
              else{
                this.operationalRights = (this.checkrights.moduleRights == "Readonly" || this.checkrights.modelRights == "Readonly") ? "Readonly" : this.checkrights.moduleRights;
            }

            //   this.operationalRights = this.checkrights["moduleRights"];
        }
    }
    AddUpdateCheckRights(showMessage?) {
        var permission = false;
        this.MessageService.clear();
        if (this.operationalRights == 'Readonly' || this.checkrights.modelRights == 'Readonly' || this.operationalRights == 'Restricted') {
            if (showMessage == true) {
                this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Not having permission ." });
            }
            permission = false;
        }
        else if (this.operationalRights == "Unrestricted") {
            permission = true;
        }
        else permission = false;
        return permission;
    }
checkisMobileDevice(){
var isMob=this.CommonUtilityService.isMobileDevice();
return isMob;
}
}