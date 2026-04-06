import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaCuentasPagarFijaComponent } from './conta-cuentas-pagar-fija.component';

describe('ContaCuentasPagarFijaComponent', () => {
  let component: ContaCuentasPagarFijaComponent;
  let fixture: ComponentFixture<ContaCuentasPagarFijaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContaCuentasPagarFijaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContaCuentasPagarFijaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
