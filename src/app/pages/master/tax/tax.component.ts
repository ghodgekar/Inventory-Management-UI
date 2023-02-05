import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { TaxService } from 'src/app/services/master/tax.service';



@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent implements OnInit{

  taxForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  constructor(private fb: FormBuilder, private taxHttp:TaxService) {
    this.createForm();
  }
  
  createForm() {
    this.taxForm = this.fb.group({
      tax_type: ['', Validators.required ],
      tax_code: ['', Validators.required ],
      tax_name: ['', Validators.required ],
      tax_per: ['', Validators.required ],
      tax_indicator: ['', Validators.required ],
      igst: ['', Validators.required ],
      sgst: ['', Validators.required ],
      cgst: ['', Validators.required ],
      utgst: ['', Validators.required ],
      cess: ['', Validators.required ],
      cessperpiece: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getTaxList();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.taxForm.controls;
  }

  getTaxList(){
    this.submitBtn == 'SAVE';
    this.taxHttp.list().subscribe((res:any) => {
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
    this.taxForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.taxForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.taxForm.value['created_by'] = localStorage.getItem('username');
        this.taxHttp.save( this.taxForm.value).subscribe((res:any) => {
          this.getTaxList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.taxForm.get(
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
        this.taxHttp.update(this.taxForm.value).subscribe((res:any) => {
          this.getTaxList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.taxForm.reset();
  }

  editTaxList(id: any){
    this.submitBtn = 'UPDATE'
    this.taxHttp.list(id).subscribe((res:any) => {
      this.taxForm.patchValue({
        tax_type: res.data[0].tax_type,
        tax_code: res.data[0].tax_code,
        tax_name: res.data[0].tax_name,
        tax_per: res.data[0].tax_per,
        tax_indicator: res.data[0].tax_indicator,
        igst: res.data[0].igst,
        sgst: res.data[0].sgst,
        cgst: res.data[0].cgst,
        utgst: res.data[0].utgst,
        cess: res.data[0].cess,
        cessperpiece: res.data[0].cessperpiece,
        status: res.data[0].status,
        _id: res.data[0]._id
      });
    })
  }

  deleteTaxList(id:any){
    this.taxHttp.delete( {'_id':id} ).subscribe((res:any) => {
      this.getTaxList();
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