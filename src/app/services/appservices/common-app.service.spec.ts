import { TestBed, inject } from '@angular/core/testing';

import { CommonAppService } from './common-app.service';

describe('CommonAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonAppService]
    });
  });

  it('should be created', inject([CommonAppService], (service: CommonAppService) => {
    expect(service).toBeTruthy();
  }));
});
