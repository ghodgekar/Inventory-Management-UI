import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { VendorService } from 'src/app/services/master/vendor.service';
import { CommonListService } from 'src/app/services/master/common-list.service';


@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css']
})
export class VendorComponent {

  vendorForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  typeData: any;
  custTypeData: any;

  constructor(private fb: FormBuilder, private vendorHttp:VendorService, private CommonListHttp:CommonListService) {
    this.createForm();
  }
  
  createForm() {
    this.vendorForm = this.fb.group({
      vend_code: ['', Validators.required],
      vend_name: ['', Validators.required ],
      type: ['', Validators.required ],
      credit_day: ['', Validators.required ],
      addr1: ['', Validators.required ],
      addr2: ['', Validators.required ],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      pin_no: ['', Validators.required ],
      phone: ['', Validators.required ],
      email: ['', Validators.required ],
      gstin: ['', Validators.required ],
      fassi_no: ['', Validators.required ],
      aadhar_no: ['', Validators.required ],
      pan_no: ['', Validators.required ],
      contact_person: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getCompanyList();
    this.getType();
    this.getCustType();
  }

  getType(){
    this.CommonListHttp.codeList('SUPP_TYPE').subscribe((res:any) => {
      this.typeData = res.data
    })
  }

  getCustType(){
    this.CommonListHttp.codeList('CUST_TYPE').subscribe((res:any) => {
      this.custTypeData = res.data
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.vendorForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.vendorHttp.list().subscribe((res:any) => {
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
    this.vendorForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.vendorForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.vendorForm.value['created_by'] = localStorage.getItem('username');
        this.vendorHttp.save( this.vendorForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.vendorForm.get(
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
        this.vendorHttp.update(this.vendorForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.vendorForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.vendorHttp.list(id).subscribe((res:any) => {
      this.vendorForm.patchValue({
        vend_code: res.data[0].vend_code,
        vend_name: res.data[0].vend_name,
        type: res.data[0].type,
        credit_day: res.data[0].credit_day,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        pin_no: res.data[0].pin_no,
        phone: res.data[0].phone,
        email: res.data[0].email,
        gstin: res.data[0].gstin,
        fassi_no: res.data[0].fassi_no,
        aadhar_no: res.data[0].aadhar_no,
        pan_no: res.data[0].pan_no,
        contact_person: res.data[0].contact_person,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.vendorHttp.delete( {'_id':id} ).subscribe((res:any) => {
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