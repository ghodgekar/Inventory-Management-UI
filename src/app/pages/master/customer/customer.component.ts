import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CustomerService } from 'src/app/services/master/customer.service';

import { DatePipe } from '@angular/common';
import { CommonListService } from 'src/app/services/master/common-list.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {

  CustomerForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  loc_code!: any;
  joinDate: any;
  custTypeData: any;
  customerData: any;

  constructor(private fb: FormBuilder, private CustomerHttp:CustomerService, private datePipe:DatePipe, private CommonListHttp:CommonListService) {
    this.createForm();
  }
  
  createForm() {
    this.CustomerForm = this.fb.group({
      cust_code: ['', Validators.required],
      cust_name: ['', Validators.required ],
      gender: ['', Validators.required ],
      aadhar_no: ['', Validators.required ],
      addr1: ['', Validators.required ],
      addr2: ['', Validators.required ],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      pincode: ['', Validators.required ],
      mobile: ['', Validators.required ],
      email: ['', Validators.required ],
      pan_no: ['', Validators.required ],
      gstin: ['', Validators.required ],
      birth_date: ['', Validators.required ],
      join_date: [this.datePipe.transform(new Date(), 'dd-MM-yyyy'), Validators.required ],
      cust_type: ['', Validators.required ],
      barcode: ['', Validators.required ],
      points: ['', Validators.required ],
      ref_cust_code: ['', Validators.required ],
      cr_limit: ['', Validators.required ],
      cr_overdue_days: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.loc_code = localStorage.getItem('location')
    this.getCompanyList();
    this.getCustType();
    this.getCustomerList();
  }

  getCustType(){
    this.CommonListHttp.codeList('CUST_TYPE').subscribe((res:any) => {
      this.custTypeData = res.data
    })
  }

  getCustomerList(){
    this.CustomerHttp.list().subscribe((res:any) => {
      this.customerData = res.data;
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.CustomerForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.CustomerHttp.list().subscribe((res:any) => {
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
    this.CustomerForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.CustomerForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.CustomerForm.value['created_by'] = localStorage.getItem('username');
        this.CustomerHttp.save( this.CustomerForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.CustomerForm.get(
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
        this.CustomerHttp.update(this.CustomerForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.CustomerForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.CustomerHttp.list(id).subscribe((res:any) => {
      this.CustomerForm.patchValue({
        cust_code: res.data[0].cust_code,
        cust_name: res.data[0].cust_name,
        gender: res.data[0].gender,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        pincode: res.data[0].pincode,
        mobile: res.data[0].mobile,
        email: res.data[0].email,
        aadhar_no: res.data[0].aadhar_no,
        pan_no: res.data[0].pan_no,
        gstin: res.data[0].gstin,
        birth_date: res.data[0].birth_date,
        join_date: res.data[0].join_date,
        cust_type: res.data[0].cust_type,
        barcode: res.data[0].barcode,
        points: res.data[0].points,
        ref_cust_code: res.data[0].ref_cust_code,
        cr_limit: res.data[0].cr_limit,
        cr_overdue_days: res.data[0].cr_overdue_days,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.CustomerHttp.delete( {'_id':id} ).subscribe((res:any) => {
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