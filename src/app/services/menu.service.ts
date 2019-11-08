import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class MenuService {
  private open: boolean = false;
  private subject: Subject<boolean> = new Subject<boolean>();
  constructor() { }
  resetMenu() {
    this.open = false;
  }
  setToggleMenu(): void {
    this.open = !this.open;
    this.subject.next(this.open);
    $("#main_viewpoint").removeAttr("style");
  }
  showhideMenu(value : boolean) // true=hide,false = show
  {
    this.open = value;
    this.subject.next(this.open);
  }
  getToggleMenu(): Observable<any> {
    return this.subject.asObservable();
  }
  get IsMenuOpen() {
    return this.open;
  }
  checkMenuOpen()
  {
    return this.open;
  }

}
