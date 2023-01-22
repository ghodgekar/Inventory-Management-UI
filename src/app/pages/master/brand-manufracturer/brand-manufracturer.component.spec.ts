import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandManufracturerComponent } from './brand-manufracturer.component';

describe('BrandManufracturerComponent', () => {
  let component: BrandManufracturerComponent;
  let fixture: ComponentFixture<BrandManufracturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandManufracturerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandManufracturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
