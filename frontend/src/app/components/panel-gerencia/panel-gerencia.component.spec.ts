import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelGerenciaComponent } from './panel-gerencia.component';

describe('PanelGerenciaComponent', () => {
  let component: PanelGerenciaComponent;
  let fixture: ComponentFixture<PanelGerenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelGerenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PanelGerenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
