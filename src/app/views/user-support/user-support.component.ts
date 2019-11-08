import { Component} from '@angular/core';
import { Router } from '@angular/router';
/**
 * 
 * @export
 * @class UserSupportComponent
 * @implements OnInit
 */
/**
 * 
 * @export
 * @class UserSupportComponent
 */
@Component({
  selector: 'app-user-support',
  templateUrl: './user-support.component.html',
  styleUrls: [
    './user-support.component.css',
    '../../../assets/user-css/core.css',
    '../../../assets/user-css/menu.css'
]
})

export class UserSupportComponent {
  
  /**
   * Creates an instance of UserSupportComponent.
   * @param  {Router} _router 
   * @memberof UserSupportComponent
   */
  constructor(private _router: Router) { 
    localStorage.setItem('isControlLogin', '');
    localStorage.setItem('isMasterLogin', '');
    localStorage.setItem('isUserLogin', 'false');

    
  }
}
