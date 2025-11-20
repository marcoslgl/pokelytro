import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Showdown } from './showdown';

describe('Showdown', () => {
  let component: Showdown;
  let fixture: ComponentFixture<Showdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Showdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Showdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
