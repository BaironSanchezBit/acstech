import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdquisicionComponent } from './adquisicion.component';

describe('AdquisicionComponent', () => {
  let component: AdquisicionComponent;
  let fixture: ComponentFixture<AdquisicionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdquisicionComponent]
    });
    fixture = TestBed.createComponent(AdquisicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
