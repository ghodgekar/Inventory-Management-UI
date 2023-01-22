import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufracturerComponent } from './manufracturer.component';

describe('ManufracturerComponent', () => {
  let component: ManufracturerComponent;
  let fixture: ComponentFixture<ManufracturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManufracturerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManufracturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
