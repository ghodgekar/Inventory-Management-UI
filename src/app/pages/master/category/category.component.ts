import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CategoryService } from 'src/app/services/master/category.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  categoryForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];

  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(private fb: FormBuilder, private categoryHttp:CategoryService) {
    this.createForm();
  }
  
  createForm() {
    this.categoryForm = this.fb.group({
      category_code: ['', Validators.required ],
      category_name: ['', Validators.required ],
      category_type: ['', Validators.required ],
      group: ['', Validators.required ],
      inventory: ['', Validators.required ],
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
    this.getCategoryList();
    this.dtTrigger.next(null);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.categoryForm.controls;
  }

  getCategoryList(){
    this.submitBtn == 'SAVE';
    this.categoryHttp.list().subscribe((res:any) => {
      if(res.data){
        this.data = res.data;
        this.dtTrigger.next(null);
        this.dtTrigger.subscribe();
      }
    })
  }

  onSubmit(): void {
    this.categoryForm.value['created_by'] = 'admin';
    this.submitted = true;
    if (this.categoryForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.categoryHttp.save( this.categoryForm.value).subscribe((res:any) => {
          this.getCategoryList();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.categoryForm.get(
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
        this.categoryHttp.update(this.categoryForm.value).subscribe((res:any) => {
          this.getCategoryList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.categoryForm.reset();
  }

  editCategoryList(id: any){
    this.submitBtn = 'UPDATE'
    this.categoryHttp.list(id).subscribe((res:any) => {
      this.categoryForm.patchValue({
        _id: res.data[0]._id,
        category_code: res.data[0].category_code,
        category_name: res.data[0].category_name,
        category_type: res.data[0].category_type,
        group: res.data[0].group,
        inventory: res.data[0].inventory,
        status: res.data[0].status,
      });
    })
  }

  deleteCategoryList(id:any){
    this.categoryHttp.delete( {'_id':id} ).subscribe((res:any) => {
      this.getCategoryList();
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
