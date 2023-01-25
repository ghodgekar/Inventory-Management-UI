import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CompanyService } from 'src/app/services/master/company.service';
import { Subject } from 'rxjs';
import { BrandService } from 'src/app/services/master/brand.service';
import { ManufracturerService } from 'src/app/services/master/manufracturer.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css']
})
export class BrandComponent {


  brandForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  manufraturerData: any;

  constructor(private fb: FormBuilder, private brandHttp:BrandService, private manufraturerService:ManufracturerService) {
    this.createForm();
  }
  
  createForm() {
    this.brandForm = this.fb.group({
      brand_code: ['', Validators.required],
      brand_name: ['', Validators.required ],
      manufact_code: ['', Validators.required ],
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
    this.getCompanyList();
    this.getmanufraturerList();
    this.dtTrigger.next(null);
  }

  getmanufraturerList(){
    this.manufraturerService.list().subscribe((res:any) => {
      this.manufraturerData = res.data;
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.brandForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.brandHttp.list().subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
      this.dtTrigger.subscribe();
    })
  }

  onSubmit(): void {
    this.brandForm.value['created_by'] = 'admin';
    this.submitted = true;
    if (this.brandForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.brandHttp.save( this.brandForm.value).subscribe((res:any) => {
          this.getCompanyList();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.brandForm.get(
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
        this.brandHttp.update(this.brandForm.value).subscribe((res:any) => {
          this.getCompanyList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.brandForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.brandHttp.list(id).subscribe((res:any) => {
      this.brandForm.patchValue({
        brand_code: res.data[0].brand_code,
        brand_name: res.data[0].brand_name,
        manufact_code: res.data[0].manufact_code,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.brandHttp.delete( {'_id':id} ).subscribe((res:any) => {
      this.getCompanyList();
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