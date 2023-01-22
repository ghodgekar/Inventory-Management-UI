import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CompanyService } from 'src/app/services/master/company.service';


@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent {

  companyForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  constructor(private fb: FormBuilder, private CompanyHttp:CompanyService) {
    this.createForm();
  }
  
  createForm() {
    this.companyForm = this.fb.group({
      module_code: ['', Validators.required],
      module_name: ['', Validators.required ],
      module_slug: ['', Validators.required ],
      parent_madule_code: ['0', Validators.required ],
      module_image: ['', Validators.required ],
      is_home: ['', Validators.required ],
      status: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getCompanyList();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.companyForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.CompanyHttp.list().subscribe((res:any) => {
      this.data = res.data;
      setTimeout(()=>{   
        $('.table').DataTable( {
          pagingType: 'full_numbers',
          pageLength: 5,
          processing: true,
          lengthMenu : [5, 10, 25],
          destroy: true
      } );
      }, 10);
    })
  }

  onSubmit(): void {
    this.companyForm.value['created_by'] = 'admin';
    this.submitted = true;
    if (this.companyForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.CompanyHttp.save( this.companyForm.value).subscribe((res:any) => {
          this.getCompanyList();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.companyForm.get(
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
        this.CompanyHttp.update(this.companyForm.value).subscribe((res:any) => {
          this.getCompanyList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.companyForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.CompanyHttp.list(id).subscribe((res:any) => {
      this.companyForm.patchValue({
        module_code: res.data[0].module_code,
        module_name: res.data[0].module_name,
        module_slug: res.data[0].module_slug,
        parent_madule_code: res.data[0].parent_madule_code,
        module_image: res.data[0].module_image,
        is_home: res.data[0].is_home,
        status: res.data[0].status,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.CompanyHttp.delete( {'_id':id} ).subscribe((res:any) => {
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