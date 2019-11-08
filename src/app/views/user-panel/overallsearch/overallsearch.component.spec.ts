import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallSearchComponent } from './overallsearch.component';

describe('CollaborationComponent', () => {
  let component: OverallSearchComponent;
  let fixture: ComponentFixture<OverallSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverallSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverallSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
