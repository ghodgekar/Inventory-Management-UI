import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CompanyService } from 'src/app/services/master/company.service';
import { PaymentService } from 'src/app/services/master/payment.service';
import { PaymentModeService } from 'src/app/services/master/payment_mode.service';
import { PaymentInclExclService } from 'src/app/services/master/payment_incl_excl.service';
import { CategoryService } from 'src/app/services/master/category.service';
import { CategorySubService } from 'src/app/services/master/category_sub.service';
import { BrandService } from 'src/app/services/master/brand.service';
import { ManufracturerService } from 'src/app/services/master/manufracturer.service';


@Component({
  selector: 'app-payment-include-exclude',
  templateUrl: './payment-include-exclude.component.html',
  styleUrls: ['./payment-include-exclude.component.css']
})
export class PaymentIncludeExcludeComponent {

  companyForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  paymentModeData: any;
  transactionData: any;
  transactionType: any;

  constructor(private fb: FormBuilder, private paymentInclExclHttp:PaymentInclExclService, private paymentHttp:PaymentModeService, private categoryHttp:CategoryService,
    private subcategoryHttp:CategorySubService, private brandHttp:BrandService, private manufracturerHttp: ManufracturerService) {
    this.createForm();
  }
  
  createForm() {
    this.companyForm = this.fb.group({
      pmt_code: ['', Validators.required],
      trans_type: ['', Validators.required ],
      trans_code: ['', Validators.required ],
      incl_excl: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getCompanyList();
    this.getPaymentData();
  }

  getPaymentData(){
    this.paymentHttp.list().subscribe((res:any) => {
      this.paymentModeData = res.data
    })
  }

  getTransaction(event:any){
    this.transactionType = event.target.value;
    if(event.target.value == 1){
      this.categoryHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
    if(event.target.value == 2){
      this.subcategoryHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
    if(event.target.value == 3){
      this.manufracturerHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
    if(event.target.value == 4){
      this.brandHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.companyForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.paymentInclExclHttp.list().subscribe((res:any) => {
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
        this.paymentInclExclHttp.save( this.companyForm.value).subscribe((res:any) => {
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
        this.paymentInclExclHttp.update(this.companyForm.value).subscribe((res:any) => {
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
    this.paymentInclExclHttp.list(id).subscribe((res:any) => {
      this.companyForm.patchValue({
        pmt_code: res.data[0].pmt_code,
        trans_type: res.data[0].trans_type,
        trans_code: res.data[0].trans_code,
        incl_excl: res.data[0].incl_excl,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.paymentInclExclHttp.delete( {'_id':id} ).subscribe((res:any) => {
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