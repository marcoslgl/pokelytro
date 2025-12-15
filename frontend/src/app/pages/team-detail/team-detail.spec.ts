import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamDetail } from './team-detail';

describe('TeamDetail', () => {
  let component: TeamDetail;
  let fixture: ComponentFixture<TeamDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
