import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferenceMenuComponent } from './preference-menu.component';

describe('SharedCompanyComponent', () => {
  let component: PreferenceMenuComponent;
  let fixture: ComponentFixture<PreferenceMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferenceMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferenceMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
