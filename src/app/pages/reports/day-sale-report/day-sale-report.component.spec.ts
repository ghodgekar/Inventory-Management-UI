import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaySaleReportComponent } from './day-sale-report.component';

describe('DaySaleReportComponent', () => {
  let component: DaySaleReportComponent;
  let fixture: ComponentFixture<DaySaleReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaySaleReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaySaleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
