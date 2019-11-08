import { TestBed, inject } from '@angular/core/testing';

import { SubmoduleService } from './submodule.service';

describe('SubmoduleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubmoduleService]
    });
  });

  it('should be created', inject([SubmoduleService], (service: SubmoduleService) => {
    expect(service).toBeTruthy();
  }));
});
