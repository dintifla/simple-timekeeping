import { TestBed } from '@angular/core/testing';

import { ResultValidationService } from './result-validation.service';

describe('ResultValidatorService', () => {
  let service: ResultValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResultValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
