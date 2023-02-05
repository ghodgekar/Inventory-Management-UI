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
import { CommonListService } from 'src/app/services/master/common-list.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit{

  companyForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  typeData: any;

  constructor(private fb: FormBuilder, private CompanyHttp:CompanyService, private CommonListHttp:CommonListService) {
    this.createForm();
  }
  
  createForm() {
    this.companyForm = this.fb.group({
      comp_code: ['', Validators.required],
      comp_name: ['', Validators.required ],
      type: ['', Validators.required ],
      addr1: ['', Validators.required ],
      addr2: ['', Validators.required ],
      addr3: ['', Validators.required ],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      std_code: ['', Validators.required ],
      phone: ['', Validators.required ],
      mobile: ['', Validators.required ],
      gstin: ['', Validators.required ],
      fassa_no: ['', Validators.required ],
      cin_no: ['', Validators.required ],
      pan_no: ['', Validators.required ],
      tan_no: ['', Validators.required ],
      lsttinpin_no: ['', Validators.required ],
      cst_no: ['', Validators.required ],
      coregn_no: ['', Validators.required ],
      coregndate: ['', Validators.required ],
      druglic_no: ['', Validators.required ],
      importexport: ['', Validators.required ],
      company_image: [''],
      status: ['Active', Validators.required ],
      created_by: ['Admin'],
      created_at: [''],
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
    this.getTypeList();
  }

  getTypeList(){
    this.CommonListHttp.codeList('COMP_TYPE').subscribe((res:any) => {
      this.typeData = res.data
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.companyForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.CompanyHttp.list().subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
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
        this.CompanyHttp.save( this.companyForm.value).subscribe((res:any) => {
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
        this.CompanyHttp.update(this.companyForm.value).subscribe((res:any) => {
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
    this.CompanyHttp.list(id).subscribe((res:any) => {
      this.companyForm.patchValue({
        comp_code: res.data[0].comp_code,
        comp_name: res.data[0].comp_name,
        type: res.data[0].type,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        addr3: res.data[0].addr3,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        std_code: res.data[0].std_code,
        phone: res.data[0].phone,
        mobile: res.data[0].mobile,
        gstin: res.data[0].gstin,
        fassa_no: res.data[0].fassa_no,
        cin_no: res.data[0].cin_no,
        pan_no: res.data[0].pan_no,
        tan_no: res.data[0].tan_no,
        lsttinpin_no: res.data[0].lsttinpin_no,
        cst_no: res.data[0].cst_no,
        coregn_no: res.data[0].coregn_no,
        coregndate: res.data[0].coregndate,
        druglic_no: res.data[0].druglic_no,
        importexport: res.data[0].importexport,
        created_by: res.data[0].created_by,
        created_date: res.data[0].created_date,
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