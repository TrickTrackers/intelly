import { Component } from '@angular/core';
/**
 * sales page - static
 * @export
 * @class UserSalesComponent
 */
@Component({
  selector: 'app-user-sales',
  templateUrl: './user-sales.component.html',
  styleUrls: [
    './user-sales.component.css',
    '../../../assets/user-css/core.css',
    '../../../assets/user-css/menu.css'
    ]
})
export class UserSalesComponent {
  
  constructor() { 
    localStorage.setItem('isControlLogin', '');
    localStorage.setItem('isMasterLogin', '');
    localStorage.setItem('isUserLogin', 'false');

    
  }
}
