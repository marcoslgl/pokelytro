import { TestBed } from '@angular/core/testing';

import { Move } from './move';

describe('Move', () => {
  let service: Move;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Move);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
