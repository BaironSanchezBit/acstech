import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuadroGerencialComponent } from './cuadro-gerencial.component';

describe('CuadroGerencialComponent', () => {
  let component: CuadroGerencialComponent;
  let fixture: ComponentFixture<CuadroGerencialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuadroGerencialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CuadroGerencialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
