import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdProveedoresComponent } from './bd-proveedores.component';

describe('BdProveedoresComponent', () => {
  let component: BdProveedoresComponent;
  let fixture: ComponentFixture<BdProveedoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BdProveedoresComponent]
    });
    fixture = TestBed.createComponent(BdProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
