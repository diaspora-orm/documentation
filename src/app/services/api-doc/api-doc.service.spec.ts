import { TestBed, inject } from '@angular/core/testing';

import { ApiDocService } from './api-doc.service';

describe('ApiDocService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiDocService]
    });
  });

  it('should be created', inject([ApiDocService], (service: ApiDocService) => {
    expect(service).toBeTruthy();
  }));
});
