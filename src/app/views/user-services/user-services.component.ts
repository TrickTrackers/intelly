import { Component } from '@angular/core';
/**
 * user service page static page
 * @export
 * @class UserServicesComponent
 * @implements OnInit
 */
@Component({
  selector: 'app-user-services',
  templateUrl: './user-services.component.html',
  styleUrls: [
    './user-services.component.css',
    '../../../assets/user-css/core.css',
    '../../../assets/user-css/menu.css'
    ]
})
export class UserServicesComponent {
  
  /**
   * Creates an instance of UserServicesComponent.
   * @param  {Router} _router 
   * @memberof UserServicesComponent
   */
  constructor() { 
    localStorage.setItem('isControlLogin', '');
    localStorage.setItem('isMasterLogin', '');
    localStorage.setItem('isUserLogin', 'false');
  }
  /**
   * 
   * @param  {any} event 
   * @param  {any} tabview 
   * @param  {any} index 
   * @return {void}@memberof UserServicesComponent
   */
    
}
