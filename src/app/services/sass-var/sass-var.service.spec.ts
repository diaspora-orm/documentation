import { TestBed, inject } from '@angular/core/testing';

import { SassVarService } from './sass-var.service';

describe('SassVarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SassVarService]
    });
  });

  it('should be created', inject([SassVarService], (service: SassVarService) => {
    expect(service).toBeTruthy();
  }));
});
