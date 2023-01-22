import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentIncludeExcludeComponent } from './payment-include-exclude.component';

describe('PaymentIncludeExcludeComponent', () => {
  let component: PaymentIncludeExcludeComponent;
  let fixture: ComponentFixture<PaymentIncludeExcludeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentIncludeExcludeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentIncludeExcludeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
