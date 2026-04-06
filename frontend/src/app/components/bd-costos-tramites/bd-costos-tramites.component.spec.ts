import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdCostosTramitesComponent } from './bd-costos-tramites.component';

describe('BdCostosTramitesComponent', () => {
  let component: BdCostosTramitesComponent;
  let fixture: ComponentFixture<BdCostosTramitesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BdCostosTramitesComponent]
    });
    fixture = TestBed.createComponent(BdCostosTramitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
