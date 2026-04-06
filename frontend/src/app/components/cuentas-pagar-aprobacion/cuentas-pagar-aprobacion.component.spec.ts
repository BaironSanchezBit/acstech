import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasPagarAprobacionComponent } from './cuentas-pagar-aprobacion.component';

describe('CuentasPagarAprobacionComponent', () => {
  let component: CuentasPagarAprobacionComponent;
  let fixture: ComponentFixture<CuentasPagarAprobacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentasPagarAprobacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CuentasPagarAprobacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
