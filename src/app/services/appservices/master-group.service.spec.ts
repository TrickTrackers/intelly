import { TestBed, inject } from '@angular/core/testing';

import { MasterGroupService } from './master-group.service';

describe('MasterGroupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MasterGroupService]
    });
  });

  it('should be created', inject([MasterGroupService], (service: MasterGroupService) => {
    expect(service).toBeTruthy();
  }));
});
