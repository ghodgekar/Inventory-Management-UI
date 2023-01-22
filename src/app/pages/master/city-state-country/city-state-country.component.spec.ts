import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityStateCountryComponent } from './city-state-country.component';

describe('CityStateCountryComponent', () => {
  let component: CityStateCountryComponent;
  let fixture: ComponentFixture<CityStateCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CityStateCountryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityStateCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
