import { TestBed, inject } from '@angular/core/testing';

import { HeadSizerService } from './head-sizer.service';

describe('HeadSizerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeadSizerService]
    });
  });

  it('should be created', inject([HeadSizerService], (service: HeadSizerService) => {
    expect(service).toBeTruthy();
  }));
});
