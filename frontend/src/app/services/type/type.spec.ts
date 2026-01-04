import { TestBed } from '@angular/core/testing';

import { Type } from './type';

describe('Type', () => {
  let service: Type;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Type);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
