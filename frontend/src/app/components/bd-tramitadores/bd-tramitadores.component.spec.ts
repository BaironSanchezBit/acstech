import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdTramitadoresComponent } from './bd-tramitadores.component';

describe('BdTramitadoresComponent', () => {
  let component: BdTramitadoresComponent;
  let fixture: ComponentFixture<BdTramitadoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BdTramitadoresComponent]
    });
    fixture = TestBed.createComponent(BdTramitadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
