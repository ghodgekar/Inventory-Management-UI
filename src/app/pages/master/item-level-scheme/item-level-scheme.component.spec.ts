import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemLevelSchemeComponent } from './item-level-scheme.component';

describe('ItemLevelSchemeComponent', () => {
  let component: ItemLevelSchemeComponent;
  let fixture: ComponentFixture<ItemLevelSchemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemLevelSchemeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemLevelSchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
