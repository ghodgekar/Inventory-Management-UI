import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { ManufracturerComponent } from '../manufracturer/manufracturer.component';
import { BrandComponent } from '../brand/brand.component';

@Component({
  selector: 'app-brand-manufracturer',
  templateUrl: './brand-manufracturer.component.html',
  styleUrls: ['./brand-manufracturer.component.css']
})
export class BrandManufracturerComponent {

  @ViewChild(ManufracturerComponent)
  ManufracturerComponent!: ManufracturerComponent;

  @ViewChild(BrandComponent)
  BrandComponent!: BrandComponent;


  isManfra: boolean=true;
  isBrand: boolean=false;

  constructor() {
  }


  ngOnInit(): void {
  }

  onSubmit(){
    if(this.isManfra){
      this.ManufracturerComponent.onSubmit()
    }else if(this.isBrand){
      this.BrandComponent.onSubmit()
    }
  }

  downloadAsPDF(){
    if(this.isManfra){
      this.ManufracturerComponent.downloadAsPDF()
    }else if(this.isBrand){
      this.BrandComponent.downloadAsPDF()
    }
  }

  generateExcel(){
    if(this.isManfra){
      this.ManufracturerComponent.generateExcel()
    }else if(this.isBrand){
      this.BrandComponent.generateExcel()
    }
  }

  onReset(){
    if(this.isManfra){
      this.ManufracturerComponent.onReset()
    }else if(this.isBrand){
      this.BrandComponent.onReset()
    }
  }

  isMenuActive(menu:string){
    if(menu == 'country'){
      this.isManfra = true;
      this.isBrand = false
    }
    if(menu == 'state'){
      this.isManfra = false;
      this.isBrand = true
    }
  }
} 