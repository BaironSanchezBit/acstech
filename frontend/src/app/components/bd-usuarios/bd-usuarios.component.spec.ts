import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdUsuariosComponent } from './bd-usuarios.component';

describe('BdUsuariosComponent', () => {
  let component: BdUsuariosComponent;
  let fixture: ComponentFixture<BdUsuariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BdUsuariosComponent]
    });
    fixture = TestBed.createComponent(BdUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
