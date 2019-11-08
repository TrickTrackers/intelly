import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

export interface Info {
    name:string;
 }
@Injectable()
export class NameService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next();
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'success', text: message });
    }

    error(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'error', text: message });
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    info: Info = { name : "" };
  change(tab_value){
    this.info.name = tab_value;
  }

    // change(message: string, keepAfterNavigationChange = false) {
    //     this.info.name = message;
    //     this.keepAfterNavigationChange = keepAfterNavigationChange;
    //     //this.subject.next({ type: 'success', text: this.info.name });
    //     //return Observable.throw(message);
    //     //alert(message)
    // }
}