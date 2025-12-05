import { TestBed } from '@angular/core/testing';

import { Pokemon } from './pokemon';

describe('Pokemon', () => {
  let service: Pokemon;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pokemon);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
