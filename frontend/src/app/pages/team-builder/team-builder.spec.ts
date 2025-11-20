import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamBuilder } from './team-builder';

describe('TeamBuilder', () => {
  let component: TeamBuilder;
  let fixture: ComponentFixture<TeamBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
