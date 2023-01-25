import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CompanyService } from 'src/app/services/master/company.service';
import { CategoryComponent } from '../category/category.component';
import { CategorySubComponent } from '../category-sub/category-sub.component';


@Component({
  selector: 'app-category-subcategory',
  templateUrl: './category-subcategory.component.html',
  styleUrls: ['./category-subcategory.component.css']
})
export class CategorySubcategoryComponent {
  
  @ViewChild(CategoryComponent)
  CategoryComponent!: CategoryComponent;

  @ViewChild(CategorySubComponent)
  CategorySubComponent!: CategorySubComponent;

  isCategory: boolean=true;
  isSubCategory: boolean=false;

  constructor() {
  }
  
  onSubmit(){
    if(this.isCategory){
      this.CategoryComponent.onSubmit()
    }else if(this.isSubCategory){
      this.CategorySubComponent.onSubmit()
    }
  }

  downloadAsPDF(){
    if(this.isCategory){
      this.CategoryComponent.downloadAsPDF()
    }else if(this.isSubCategory){
      this.CategorySubComponent.downloadAsPDF()
    }
  }

  generateExcel(){
    if(this.isCategory){
      this.CategoryComponent.generateExcel()
    }else if(this.isSubCategory){
      this.CategorySubComponent.generateExcel()
    }
  }

  onReset(){
    if(this.isCategory){
      this.CategoryComponent.onReset()
    }else if(this.isSubCategory){
      this.CategorySubComponent.onReset()
    }
  }

  isMenuActive(menu:string){
    if(menu == 'country'){
      this.isCategory = true;
      this.isSubCategory = false
    }
    if(menu == 'state'){
      this.isCategory = false;
      this.isSubCategory = true
    }
  }
} 