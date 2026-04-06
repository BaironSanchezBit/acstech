import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreInventariosComponent } from './pre-inventarios.component';

describe('PreInventariosComponent', () => {
  let component: PreInventariosComponent;
  let fixture: ComponentFixture<PreInventariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreInventariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreInventariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
