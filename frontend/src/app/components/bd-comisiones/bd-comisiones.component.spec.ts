import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdComisionesComponent } from './bd-comisiones.component';

describe('BdComisionesComponent', () => {
  let component: BdComisionesComponent;
  let fixture: ComponentFixture<BdComisionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BdComisionesComponent]
    });
    fixture = TestBed.createComponent(BdComisionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
