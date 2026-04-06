import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdBancosComponent } from './bd-bancos.component';

describe('BdBancosComponent', () => {
  let component: BdBancosComponent;
  let fixture: ComponentFixture<BdBancosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BdBancosComponent]
    });
    fixture = TestBed.createComponent(BdBancosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
