import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlBdComponent } from './control-bd.component';

describe('ControlBdComponent', () => {
  let component: ControlBdComponent;
  let fixture: ComponentFixture<ControlBdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ControlBdComponent]
    });
    fixture = TestBed.createComponent(ControlBdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
