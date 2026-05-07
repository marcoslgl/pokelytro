import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Moves } from './moves';

describe('Moves', () => {
  let component: Moves;
  let fixture: ComponentFixture<Moves>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Moves]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Moves);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
