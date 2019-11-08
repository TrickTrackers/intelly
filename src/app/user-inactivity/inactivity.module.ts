import { NgModule } from '@angular/core';

import { InactivityDirective } from './inactivity.directive';

@NgModule({
  declarations: [
    InactivityDirective
  ],
  exports: [
    InactivityDirective
  ]
})
export class Inactivity {
}
