import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CompanyService } from 'src/app/services/master/company.service';
import { PaymentModeService } from 'src/app/services/master/payment_mode.service';


@Component({
  selector: 'app-payment-mode',
  templateUrl: './payment-mode.component.html',
  styleUrls: ['./payment-mode.component.css']
})
export class PaymentModeComponent {

  companyForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  constructor(private fb: FormBuilder, private paymentModeHttp:PaymentModeService) {
    this.createForm();
  }
  
  createForm() {
    this.companyForm = this.fb.group({
      pmt_code: ['', Validators.required],
      pmt_name: ['', Validators.required ],
      calc_on: ['', Validators.required ],
      charge_per: ['', Validators.required ],
      allow_multi: ['', Validators.required ],
      bill_copy: ['', Validators.required ],
      status: ['Active'],
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
    this.paymentModeHttp.list().subscribe((res:any) => {
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
    this.companyForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.companyForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.companyForm.value['created_by'] = localStorage.getItem('username');
        this.paymentModeHttp.save( this.companyForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
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
        this.paymentModeHttp.update(this.companyForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.companyForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.paymentModeHttp.list(id).subscribe((res:any) => {
      this.companyForm.patchValue({
        pmt_code: res.data[0].pmt_code,
        pmt_name: res.data[0].pmt_name,
        calc_on: res.data[0].calc_on,
        charge_per: res.data[0].charge_per,
        allow_multi: res.data[0].allow_multi,
        bill_copy: res.data[0].bill_copy,
        status: res.data[0].status,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.paymentModeHttp.delete( {'_id':id} ).subscribe((res:any) => {
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