import { Component, ViewChild } from '@angular/core';
import { CityComponent } from '../city/city.component';
import { CountryComponent } from '../country/country.component';
import { StateComponent } from '../state/state.component';

@Component({
  selector: 'app-city-state-country',
  templateUrl: './city-state-country.component.html',
  styleUrls: ['./city-state-country.component.css']
})
export class CityStateCountryComponent {

  @ViewChild(CountryComponent)
  CountryComponent!: CountryComponent;

  @ViewChild(StateComponent)
  StateComponent!: StateComponent;

  @ViewChild(CityComponent)
  CityComponent!: CityComponent;

  isCountry: boolean=true;
  isState: boolean=false;
  isCity: boolean=false;

  constructor() {
  }


  ngOnInit(): void {
  }

  onSubmit(){
    if(this.isCountry){
      this.CountryComponent.onSubmit()
    }else if(this.isState){
      this.StateComponent.onSubmit()
    }else if(this.isCity){
      this.CityComponent.onSubmit()
    }
  }

  downloadAsPDF(){
    if(this.isCountry){
      this.CountryComponent.downloadAsPDF()
    }else if(this.isState){
      this.StateComponent.downloadAsPDF()
    }else if(this.isCity){
      this.CityComponent.downloadAsPDF()
    }
  }

  generateExcel(){
    if(this.isCountry){
      this.CountryComponent.generateExcel()
    }else if(this.isState){
      this.StateComponent.generateExcel()
    }else if(this.isCity){
      this.CityComponent.generateExcel()
    }
  }

  onReset(){
    if(this.isCountry){
      this.CountryComponent.onReset()
    }else if(this.isState){
      this.StateComponent.onReset()
    }else if(this.isCity){
      this.CityComponent.onReset()
    }
  }

  isMenuActive(menu:string){
    if(menu == 'country'){
      this.isCountry = true;
      this.isState = false
      this.isCity = false
    }
    if(menu == 'state'){
      this.isCountry = false;
      this.isState = true
      this.isCity = false
    }
    if(menu == 'city'){
      this.isCountry = false;
      this.isState = false
      this.isCity = true
    }
  }
} 