import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { Subject } from 'rxjs';
import { OpningStockService } from 'src/app/services/transactions/opning-stock.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css']
})
export class PointOfSaleComponent {

  branchForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(private fb: FormBuilder, private OpeningStockHttp:OpningStockService,private datePipe: DatePipe) {
    this.createForm();
  }
  
  createForm() {
    this.branchForm = this.fb.group({
      loc_code: ['KMTH', Validators.required],
      bill_date: [this.datePipe.transform(new Date(), 'yyyy-MM-dd'), Validators.required ],
      item_code: ['', Validators.required ],
      qty: ['', Validators.required ],
      mrp: ['', Validators.required ],
      sale_rate: ['', Validators.required ],
      cost_rate: ['', Validators.required ],
      dept_code: ['', Validators.required ],
      expiry_date: ['', Validators.required ],
      batch_no: [''],
      doc_type: [''],
      comp_code: [''],
      item_name: [''],
      markup: [''],
      markdown: [''],
      created_by: ['Admin'],
      created_at: [''],
      _id: [],
      barcodes: this.fb.array([]), 
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

  getItemList(event:any){
    if(event.target.value)
    this.OpeningStockHttp.itemList(event.target.value).subscribe((res:any) => {
      this.branchForm.patchValue({
        item_code: res.data[0].item_code,
        item_name: res.data[0].item_name,
        markup: res.data[0].markup,
        markdown: res.data[0].markdown
      })
    })
  }



  get f(): { [key: string]: AbstractControl } {
    return this.branchForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.OpeningStockHttp.list().subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
    })
  }

  onSubmit(): void {
    this.branchForm.value['created_by'] = 'Admin';
    this.submitted = true;
    if (this.branchForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.OpeningStockHttp.save( this.branchForm.value).subscribe((res:any) => {
          this.getCompanyList();
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
        this.OpeningStockHttp.update(this.branchForm.value).subscribe((res:any) => {
          this.getCompanyList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.branchForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.OpeningStockHttp.list(id).subscribe((res:any) => {
      this.branchForm.patchValue({
        loc_code: res.data[0].loc_code,
        barcode: res.data[0].barcode,
        item_code: res.data[0].item_code,
        qty: res.data[0].qty,
        mrp: res.data[0].mrp,
        sale_rate: res.data[0].sale_rate,
        cost_rate: res.data[0].cost_rate,
        dept_code: res.data[0].dept_code,
        expiry_date: res.data[0].expiry_date,
        batch_no: res.data[0].batch_no,
        doc_type: res.data[0].doc_type,
        gstin: res.data[0].gstin,
        comp_code: res.data[0].comp_code,
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
    this.OpeningStockHttp.delete( {'_id':id} ).subscribe((res:any) => {
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
