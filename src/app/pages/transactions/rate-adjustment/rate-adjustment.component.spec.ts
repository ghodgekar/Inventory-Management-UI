import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateAdjustmentComponent } from './rate-adjustment.component';

describe('RateAdjustmentComponent', () => {
  let component: RateAdjustmentComponent;
  let fixture: ComponentFixture<RateAdjustmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RateAdjustmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
