import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdContrasenasComponent } from './bd-contrasenas.component';

describe('BdContrasenasComponent', () => {
  let component: BdContrasenasComponent;
  let fixture: ComponentFixture<BdContrasenasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BdContrasenasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BdContrasenasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
