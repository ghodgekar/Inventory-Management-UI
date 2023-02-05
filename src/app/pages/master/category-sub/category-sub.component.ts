import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CategoryService } from 'src/app/services/master/category.service';
import { CategorySubService } from 'src/app/services/master/category_sub.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-category-sub',
  templateUrl: './category-sub.component.html',
  styleUrls: ['./category-sub.component.css']
})
export class CategorySubComponent  implements OnInit {

  categorySubForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];

  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  categorydata: any=[];
  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(private fb: FormBuilder, private categoryHttp:CategoryService, private categorySubHttp:CategorySubService) {
    this.createForm();
  }
  
  createForm() {
    this.categorySubForm = this.fb.group({
      sub_category_code: ['', Validators.required ],
      sub_category_name: ['', Validators.required ],
      category_code: ['', Validators.required ],
      markup: ['', Validators.required ],
      markdown: ['', Validators.required ],
      shelf_life_p: ['', Validators.required ],
      shelf_life_dm: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      lengthMenu: [10,20,30],
      order:[[1,'desc']],
      destroy: true
    };
    this.getCategorySubList();
    this.getCategoryList();
    this.dtTrigger.next(null);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.categorySubForm.controls;
  }

  getCategoryList(){
    this.submitBtn == 'SAVE';
    this.categoryHttp.list().subscribe((res:any) => {
      if(res.data){
        this.categorydata = res.data;
      }
    })
  }

  getCategorySubList(){
    this.submitBtn == 'SAVE';
    this.categorySubHttp.list().subscribe((res:any) => {
      if(res.data){
        this.data = res.data;
        this.dtTrigger.next(null);
        this.dtTrigger.subscribe();
      }
    })
  }

  onSubmit(): void {
    this.categorySubForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.categorySubForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.categorySubForm.value['created_by'] = localStorage.getItem('username');
        this.categorySubHttp.save( this.categorySubForm.value).subscribe((res:any) => {
          this.getCategorySubList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.categorySubForm.get(
                validationError[index].param
              );
              if (formControl) {
                formControl.setErrors({
                  serverError: validationError[index].msg,
                });
              }
            });
          }
        })
      }else if(this.submitBtn == 'UPDATE'){
        this.categorySubHttp.update(this.categorySubForm.value).subscribe((res:any) => {
          this.getCategorySubList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.categorySubForm.reset();
  }

  editCategorySubList(id: any){
    this.submitBtn = 'UPDATE'
    this.categorySubHttp.list(id).subscribe((res:any) => {
      this.categorySubForm.patchValue({
        _id: res.data[0]._id,
        sub_category_code: res.data[0].sub_category_code,
        sub_category_name: res.data[0].sub_category_name,
        category_code: res.data[0].category_code,
        markup: res.data[0].markup,
        markdown: res.data[0].markdown,
        shelf_life_p: res.data[0].shelf_life_p,
        shelf_life_dm: res.data[0].shelf_life_dm,
        status: res.data[0].status,
      });
    })
  }

  deleteCategorySubList(id:any){
    this.categorySubHttp.delete( {'_id':id} ).subscribe((res:any) => {
      this.getCategorySubList();
    })
  }

  generatePDF() {  
    let docDefinition = {  
      content: [
        {
          text: 'TEST Company',
          style: 'header'
        },	
        {
          text: 'Paramater Master Report',
          style: ['subheader']
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*', '*', '*', '*'],
            body: [
              ['Code', 'Value', 'Description', 'Data Type', 'Created By']
            ].concat(this.data.map((el:any, i:any) => [el.data.list_code, el.data.list_value, el.data.list_desc, el.data.data_type, el.data.created_by]))
          }
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 15,
          bold: true
        },
        quote: {
          italics: true
        },
        small: {
          fontSize: 8
        }
      }
    };  
   
    pdfMake.createPdf(docDefinition).print();  
  } 

  generateExcel(): void
  {
    let element = document.getElementById('table');
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Download.xls');
  }

  public downloadAsPDF() {
    const doc = new jsPDF();
    const pdfTable = this.pdfTable.nativeElement;
    var html = htmlToPdfmake(pdfTable.innerHTML);
    var documentDefinition = { 
      content: [html],
      styles: {
        
      }
    };
    pdfMake.createPdf(documentDefinition).open();
  }
} 