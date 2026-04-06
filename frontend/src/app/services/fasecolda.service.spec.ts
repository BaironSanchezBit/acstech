import { TestBed } from '@angular/core/testing';

import { FasecoldaService } from './fasecolda.service';

describe('FasecoldaService', () => {
  let service: FasecoldaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FasecoldaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
