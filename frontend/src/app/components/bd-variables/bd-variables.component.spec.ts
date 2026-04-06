import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdVariablesComponent } from './bd-variables.component';

describe('BdVariablesComponent', () => {
  let component: BdVariablesComponent;
  let fixture: ComponentFixture<BdVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BdVariablesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BdVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
