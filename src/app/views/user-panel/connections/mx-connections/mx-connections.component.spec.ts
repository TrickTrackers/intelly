import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MxConnectionsComponent } from './mx-connections.component';

describe('MxConnectionsComponent', () => {
  let component: MxConnectionsComponent;
  let fixture: ComponentFixture<MxConnectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MxConnectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MxConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
