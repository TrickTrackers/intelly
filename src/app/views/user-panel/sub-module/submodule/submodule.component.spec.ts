import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmodulesComponent } from './submodule.component';

describe('SubmoduleComponent', () => {
  let component: SubmodulesComponent;
  let fixture: ComponentFixture<SubmodulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmodulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmodulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
