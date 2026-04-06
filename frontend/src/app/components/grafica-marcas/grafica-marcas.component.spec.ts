import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficaMarcasComponent } from './grafica-marcas.component';

describe('GraficaMarcasComponent', () => {
  let component: GraficaMarcasComponent;
  let fixture: ComponentFixture<GraficaMarcasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficaMarcasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraficaMarcasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
