import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagenesIngresoComponent } from './imagenes-ingreso.component';

describe('ImagenesIngresoComponent', () => {
  let component: ImagenesIngresoComponent;
  let fixture: ComponentFixture<ImagenesIngresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagenesIngresoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImagenesIngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
