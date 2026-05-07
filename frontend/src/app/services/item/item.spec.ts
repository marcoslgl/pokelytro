import { TestBed } from '@angular/core/testing';

import { Item } from './item';

describe('Item', () => {
  let service: Item;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Item);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
