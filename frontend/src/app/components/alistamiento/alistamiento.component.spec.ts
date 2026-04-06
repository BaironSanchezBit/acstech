import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlistamientoComponent } from './alistamiento.component';

describe('AlistamientoComponent', () => {
  let component: AlistamientoComponent;
  let fixture: ComponentFixture<AlistamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlistamientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlistamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
