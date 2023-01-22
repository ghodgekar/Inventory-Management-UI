import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTaxComponent } from './item-tax.component';

describe('ItemTaxComponent', () => {
  let component: ItemTaxComponent;
  let fixture: ComponentFixture<ItemTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemTaxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
