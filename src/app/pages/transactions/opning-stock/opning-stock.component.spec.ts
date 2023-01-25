import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpningStockComponent } from './opning-stock.component';

describe('OpningStockComponent', () => {
  let component: OpningStockComponent;
  let fixture: ComponentFixture<OpningStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpningStockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpningStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
