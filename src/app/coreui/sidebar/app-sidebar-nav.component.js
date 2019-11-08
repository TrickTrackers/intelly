import { Component, Directive, ElementRef, HostBinding, HostListener, Input, Renderer2 } from '@angular/core';
import { Replace } from './../shared';
import * as _ from 'lodash';
import { ModuleService } from '../../services/module.services';
import { DefaultLayoutComponent } from '../../containers/default-layout/default-layout.component';
var NavDropdownDirective = /** @class */ (function () {
    function NavDropdownDirective(el) {
        this.el = el;
    }
    NavDropdownDirective.prototype.toggle = function () {
        this.el.nativeElement.classList.toggle('open');
    };
    NavDropdownDirective.decorators = [
        {
            type: Directive, args: [{
                selector: '[appNavDropdown]'
            },]
        },
    ];
    /** @nocollapse */
    NavDropdownDirective.ctorParameters = function () {
        return [
            { type: ElementRef, },
        ];
    };
    return NavDropdownDirective;
}());
export { NavDropdownDirective };
/**
* Allows the dropdown to be toggled via click.
*/
var NavDropdownToggleDirective = /** @class */ (function () {
    function NavDropdownToggleDirective(dropdown) {
        this.dropdown = dropdown;
    }
    NavDropdownToggleDirective.prototype.toggleOpen = function ($event) {
        $event.preventDefault();
        this.dropdown.toggle();
    };
    NavDropdownToggleDirective.decorators = [
        {
            type: Directive, args: [{
                selector: '[appNavDropdownToggle]'
            },]
        },
    ];
    /** @nocollapse */
    NavDropdownToggleDirective.ctorParameters = function () {
        return [
            { type: NavDropdownDirective, },
        ];
    };
    NavDropdownToggleDirective.propDecorators = {
        "toggleOpen": [{ type: HostListener, args: ['click', ['$event'],] },],
    };
    return NavDropdownToggleDirective;
}());
export { NavDropdownToggleDirective };
var AppSidebarNavComponent = /** @class */ (function () {
    function AppSidebarNavComponent() {
        this.role = 'nav';
    }
    AppSidebarNavComponent.prototype.isDivider = function (item) {
        return (item != null) ? (item.divider ? true : false) : false;
    };
    AppSidebarNavComponent.prototype.isTitle = function (item) {
        return (item != null) ? (item.title ? true : false) : false;
    };
    AppSidebarNavComponent.decorators = [
        {
            type: Component, args: [{
                selector: 'app-sidebar-nav',
                template: `<ul class="nav" id="treenavigation_component">
                    <ng-template ngFor let-navitem [ngForOf]="navItems">
                        <li *ngIf="isDivider(navitem)" class="nav-divider"></li>
                        <ng-template [ngIf]="isTitle(navitem)">
                            <app-sidebar-nav-title [title]='navitem'></app-sidebar-nav-title>
                        </ng-template>
                        <ng-template [ngIf]="!isDivider(navitem)&&!isTitle(navitem)">
                            <app-sidebar-nav-item [item]='navitem'></app-sidebar-nav-item>
                        </ng-template>
                    </ng-template>
                </ul>`
            },]
        },
    ];
    /** @nocollapse */
    AppSidebarNavComponent.ctorParameters = function () { return []; };
    AppSidebarNavComponent.propDecorators = {
        "navItems": [{ type: Input },],
        "true": [{ type: HostBinding, args: ['class.sidebar-nav',] },],
        "role": [{ type: HostBinding, args: ['attr.role',] },],
    };
    return AppSidebarNavComponent;
}());
export { AppSidebarNavComponent };
import { Router } from '@angular/router';
var AppSidebarNavItemComponent = /** @class */ (function () {
    function AppSidebarNavItemComponent(router, el) {
        this.router = router;
        this.el = el;
    }
    AppSidebarNavItemComponent.prototype.hasClass = function () {
        return (this.item != null) ? (this.item.class ? true : false) : false;
    };
    AppSidebarNavItemComponent.prototype.isDropdown = function () {
        return (this.item != null) ? ((this.item.children.length > 0) ? true : false) : false;
    };
    AppSidebarNavItemComponent.prototype.thisUrl = function () {
        return this.item.url;
    };
    AppSidebarNavItemComponent.prototype.isActive = function () {
        // return this.router.isActive(this.thisUrl(), false);
        return this.item.expanded;
    };
    AppSidebarNavItemComponent.prototype.isSelected = function () {
        // return this.router.isActive(this.thisUrl(), false);
        return this.item.selected;
    };
    AppSidebarNavItemComponent.prototype.ngOnInit = function () {
        Replace(this.el);
    };
    AppSidebarNavItemComponent.prototype.setSelectedModule = function (item) {
        // var selectedmodule = localStorage.getItem("selectedmodule");
        // if (_.isEmpty(selectedmodule)) {
        //     localStorage.setItem("selectedmodule", JSON.stringify(item));
        // }
        // else {
        //     localStorage.removeItem('selectedmodule');
        //     localStorage.setItem("selectedmodule", JSON.stringify(item));
        // }
    };
    AppSidebarNavItemComponent.decorators = [
        {
            type: Component, args: [{
                selector: 'app-sidebar-nav-item',
                template: `<li *ngIf="!isDropdown(); else dropdown" [ngClass]="hasClass() ? 'nav-item ' + item.class : 'nav-item'">
                    <app-sidebar-nav-link  [link]='item'></app-sidebar-nav-link>
                </li>
                <ng-template #dropdown>
                    <li  [ngClass]="hasClass() ? 'nav-item nav-dropdown ' + item.class : 'nav-item nav-dropdown'"
                        [class.open]="isActive()" [class.selected]="isSelected()" routerLinkActive="open" appNavDropdown>
                        <app-sidebar-nav-dropdown  [link]='item'></app-sidebar-nav-dropdown>
                    </li>
                </ng-template>`
            },]
        },
    ];
    /** @nocollapse */
    AppSidebarNavItemComponent.ctorParameters = function () {
        return [
            { type: Router, },
            { type: ElementRef, },
        ];
    };
    AppSidebarNavItemComponent.propDecorators = {
        "item": [{ type: Input },]
    };
    return AppSidebarNavItemComponent;
}());
export { AppSidebarNavItemComponent };
var AppSidebarNavLinkComponent = /** @class */ (function () {
    function AppSidebarNavLinkComponent(router, el) {
        this.router = router;
        this.el = el;
    }
    AppSidebarNavLinkComponent.prototype.hasVariant = function () {
        return (this.link != null) ? (this.link.variant ? true : false) : false;
    };
    AppSidebarNavLinkComponent.prototype.isBadge = function () {
        return (this.link != null) ? (this.link.badge ? true : false) : false;
    };
    AppSidebarNavLinkComponent.prototype.isExternalLink = function () {
        return (this.link != null) ? (this.link.url.substring(0, 4) === 'http' ? true : false) : false;
    };
    AppSidebarNavLinkComponent.prototype.isIcon = function () {
        return (this.link != null) ? (this.link.icon ? true : false) : false;
    };
    AppSidebarNavLinkComponent.prototype.hideMobile = function () {
        if (document.body.classList.contains('sidebar-mobile-show')) {
            document.body.classList.toggle('sidebar-mobile-show');
        }
    };
    AppSidebarNavLinkComponent.prototype.setSelectedModule = function (item) {
        //parentComponent.setSelectedModule(item);
        // // dynamic change router value
        // let urlTree = this.router.parseUrl(this.router.url);
        // // item.params.t= urlTree.queryParams.t;
        // // urlTree.queryParams= item.params;
        // // urlTree.queryParams.
        // _.merge(urlTree.queryParams, item.params);
        // this.router.navigateByUrl(urlTree);

    };
    AppSidebarNavLinkComponent.prototype.ngOnInit = function () {
        Replace(this.el);
    };
    AppSidebarNavLinkComponent.decorators = [
        {
            type: Component, args: [{
                selector: 'app-sidebar-nav-link',
                template: `<a *ngIf="!isExternalLink(); else external" (click)="setSelectedModule(link)" [ngClass]="hasVariant() ? 'nav-link nav-link-' + link.variant : 'nav-link'"
                    [routerLink]="['.']" (click)="hideMobile()">
                    <i *ngIf="isIcon()" class="nav-icon {{ link.icon }}"></i>
                    {{ link.legoName }}
                    <span *ngIf="isBadge()" [ngClass]="'badge badge-' + link.badge.variant">
                        {{ link.badge.text }}
                    </span>
                </a>
                <ng-template #external>
                    <a (click)="setSelectedModule(link)" [ngClass]="hasVariant() ? 'nav-link nav-link-' + link.variant : 'nav-link'" href="{{link.url}}">
                        <i *ngIf="isIcon()" class="nav-icon {{ link.icon }}"></i>
                        {{ link.legoName }}
                        <span *ngIf="isBadge()" [ngClass]="'badge badge-' + link.badge.variant">
                            {{ link.badge.text }}</span>
                    </a>
                </ng-template>`
            },]
        },
    ];
    /** @nocollapse */
    AppSidebarNavLinkComponent.ctorParameters = function () {
        return [
            { type: Router, },
            { type: ElementRef, },
        ];
    };
    AppSidebarNavLinkComponent.propDecorators = {
        "link": [{ type: Input },]
    };
    return AppSidebarNavLinkComponent;
}());
export { AppSidebarNavLinkComponent };

var AppSidebarNavDropdownComponent = /** @class */ (function () {

    function AppSidebarNavDropdownComponent(router, el) {
        this.router = router;
        this.el = el;
        this.ModuleService = ModuleService;
    }
    AppSidebarNavDropdownComponent.prototype.isBadge = function () {
        return (this.link != null) ? (this.link.badge ? true : false) : false;
    };
    AppSidebarNavDropdownComponent.prototype.isIcon = function () {
        return (this.link != null) ? (this.link.icon ? true : false) : false;
    };
    AppSidebarNavDropdownComponent.prototype.ngOnInit = function () {
        Replace(this.el);
    };
    AppSidebarNavDropdownComponent.prototype.setSelectedParentModule = function (item, event) {

       // parentComponent.setSelectedModule(item);
        // if (item.params.mode == 'E') {

        //     let urlTree = this.router.parseUrl(this.router.url);
        //     var newparams = _.clone(item.params);
        //     newparams.t = "stab_details_uemplist";
        //     this.router.navigate(['/details'], { queryParams: newparams });
        //     //return;
        // }
        // else if (item.params.mode == 'T' || item.params.mode == 'O' || item.params.mode == 'P') {

        //     let urlTree = this.router.parseUrl(this.router.url);
        //     var newparams = _.clone(item.params);
        //     newparams.t = "submodules";
        //     this.router.navigate(['/submodule'], { queryParams: newparams });
        //     //return;
        // }
        // else {
        //     // dynamic change router value
        //     let urlTree = this.router.parseUrl(this.router.url);
        //     // urlTree.queryParams= item.params;
        //     _.merge(urlTree.queryParams, item.params);
        //     this.router.navigateByUrl(urlTree);
        // }

    };
    AppSidebarNavDropdownComponent.decorators = [
        {
            type: Component, args: [{
                selector: 'app-sidebar-nav-dropdown',
                template: `<a class="nav-link nav-dropdown-toggle"  [routerLink]="['.']" (click)="setSelectedParentModule(link,$event)">
                    <i class=" menu_close menu_open_close icon-arrow-down icons" appNavDropdownToggle></i>
                    <i class=" menu_open menu_open_close icon-arrow-left icons" appNavDropdownToggle></i>
                    <i *ngIf="isIcon()" class="nav-icon {{ link.icon }}"></i>
                        {{ link.legoName }}
                     <span *ngIf="isBadge()"
                      [ngClass]="'badge badge-' + link.badge.variant">
                      {{ link.badge.text }}
                      </span>
                        </a>
                        <ul class="nav-dropdown-items">
                             <ng-template ngFor let-child [ngForOf]="link.children">
                                <app-sidebar-nav-item  [item]='child'></app-sidebar-nav-item>
                             </ng-template>
                        </ul>`,
                styles: ['.nav-dropdown-toggle { cursor: pointer; }']
            },]
        },
    ];
    /** @nocollapse */
    AppSidebarNavDropdownComponent.ctorParameters = function () {
        return [
            { type: Router, },
            { type: ElementRef, },
        ];
    };
    AppSidebarNavDropdownComponent.propDecorators = {
        "link": [{ type: Input },]
    };

    return AppSidebarNavDropdownComponent;
}());
export { AppSidebarNavDropdownComponent };
var AppSidebarNavTitleComponent = /** @class */ (function () {
    function AppSidebarNavTitleComponent(el, renderer) {
        this.el = el;
        this.renderer = renderer;
    }
    AppSidebarNavTitleComponent.prototype.ngOnInit = function () {
        var nativeElement = this.el.nativeElement;
        var li = this.renderer.createElement('li');
        var name = this.renderer.createText(this.title.name);
        this.renderer.addClass(li, 'nav-title');
        if (this.title.class) {
            var classes = this.title.class;
            this.renderer.addClass(li, classes);
        }
        if (this.title.wrapper) {
            var wrapper = this.renderer.createElement(this.title.wrapper.element);
            this.renderer.appendChild(wrapper, name);
            this.renderer.appendChild(li, wrapper);
        }
        else {
            this.renderer.appendChild(li, name);
        }
        this.renderer.appendChild(nativeElement, li);
        Replace(this.el);
    };
    AppSidebarNavTitleComponent.decorators = [
        {
            type: Component, args: [{
                selector: 'app-sidebar-nav-title',
                template: ''
            },]
        },
    ];
    /** @nocollapse */
    AppSidebarNavTitleComponent.ctorParameters = function () {
        return [
            { type: ElementRef, },
            { type: Renderer2, },
        ];
    };
    AppSidebarNavTitleComponent.propDecorators = {
        "title": [{ type: Input },],
    };
    return AppSidebarNavTitleComponent;
}());
export { AppSidebarNavTitleComponent };
//# sourceMappingURL=app-sidebar-nav.component.js.map