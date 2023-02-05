import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { BranchService } from 'src/app/services/master/branch.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent {

  branchForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(private fb: FormBuilder, private BranchHttp:BranchService) {
    this.createForm();
  }
  
  createForm() {
    this.branchForm = this.fb.group({
      loc_code: ['', Validators.required],
      loc_no: ['', Validators.required ],
      loc_name: ['', Validators.required ],
      comp_code: ['', Validators.required ],
      addr1: ['', Validators.required ],
      addr2: ['', Validators.required ],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      pin: ['', Validators.required ],
      phone: ['', Validators.required ],
      gstin: ['', Validators.required ],
      bank_name: ['', Validators.required ],
      bank_ac_no: ['', Validators.required ],
      image: [''],
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
  }

  get f(): { [key: string]: AbstractControl } {
    return this.branchForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.BranchHttp.list().subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
    })
  }

  onSubmit(): void {
    this.branchForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.branchForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.branchForm.value['created_by'] = localStorage.getItem('username');
        this.BranchHttp.save( this.branchForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.branchForm.get(
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
        this.BranchHttp.update(this.branchForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.branchForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.BranchHttp.list(id).subscribe((res:any) => {
      this.branchForm.patchValue({
        loc_code: res.data[0].loc_code,
        loc_no: res.data[0].loc_no,
        loc_name: res.data[0].loc_name,
        comp_code: res.data[0].comp_code,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        pin: res.data[0].pin,
        phone: res.data[0].phone,
        gstin: res.data[0].gstin,
        bank_name: res.data[0].bank_name,
        bank_ac_no: res.data[0].bank_ac_no,
        image: res.data[0].image,
        status: res.data[0].status,
        created_by: res.data[0].created_by,
        created_at: res.data[0].created_at,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.BranchHttp.delete( {'_id':id} ).subscribe((res:any) => {
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
