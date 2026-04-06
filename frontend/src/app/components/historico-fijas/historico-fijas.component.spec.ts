import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoFijasComponent } from './historico-fijas.component';

describe('HistoricoFijasComponent', () => {
  let component: HistoricoFijasComponent;
  let fixture: ComponentFixture<HistoricoFijasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoFijasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoFijasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
