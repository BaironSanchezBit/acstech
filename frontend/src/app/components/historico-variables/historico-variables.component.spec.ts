import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoVariablesComponent } from './historico-variables.component';

describe('HistoricoVariablesComponent', () => {
  let component: HistoricoVariablesComponent;
  let fixture: ComponentFixture<HistoricoVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoVariablesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoricoVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
