import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContaCuentasPagarComponent } from './conta-cuentas-pagar.component';

describe('ContaCuentasPagarComponent', () => {
  let component: ContaCuentasPagarComponent;
  let fixture: ComponentFixture<ContaCuentasPagarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContaCuentasPagarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContaCuentasPagarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
