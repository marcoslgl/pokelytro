import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Items } from './item';

describe('Items', () => {
  let component: Items;
  let fixture: ComponentFixture<Items>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Items],
    }).compileComponents();

    fixture = TestBed.createComponent(Items);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
