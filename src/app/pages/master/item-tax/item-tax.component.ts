import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { ItemTaxService } from 'src/app/services/master/item_tax.service';
import { Subject } from 'rxjs';
import { StateService } from 'src/app/services/master/state.service';
import { ItemService } from 'src/app/services/master/item.service';
import { TaxService } from 'src/app/services/master/tax.service';

@Component({
  selector: 'app-item-tax',
  templateUrl: './item-tax.component.html',
  styleUrls: ['./item-tax.component.css']
})
export class ItemTaxComponent {

  ItemTaxForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  stateData: any;
  itemData: any;
  taxData: any;

  constructor(private fb: FormBuilder, private ItemTaxHttp:ItemTaxService, private stateHttp:StateService, private itemHttp:ItemService, private taxHttp:TaxService) {
    this.createForm();
  }
  
  createForm() {
    this.ItemTaxForm = this.fb.group({
      item_code: ['', Validators.required],
      tax_code: ['', Validators.required ],
      start_date: ['', Validators.required ],
      end_date: ['', Validators.required ],
      state_code: ['', Validators.required ],
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
    this.getStateList();
    this.getItemList();
    this.getItemTaxList();
    this.dtTrigger.next(null);
  }

  getStateList(){
    this.stateHttp.list().subscribe((res:any) => {
      this.stateData = res.data
    })
  }

  getItemList(){
    this.itemHttp.list().subscribe((res:any) => {
      this.itemData = res.data
    })
  }

  getItemTaxList(){
    this.taxHttp.list().subscribe((res:any) => {
      this.taxData = res.data
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.ItemTaxForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.ItemTaxHttp.list().subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
      this.dtTrigger.subscribe();
    })
  }

  onSubmit(): void {
    this.ItemTaxForm.value['created_by'] = 'admin';
    this.submitted = true;
    if (this.ItemTaxForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.ItemTaxHttp.save( this.ItemTaxForm.value).subscribe((res:any) => {
          this.getCompanyList();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.ItemTaxForm.get(
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
        this.ItemTaxHttp.update(this.ItemTaxForm.value).subscribe((res:any) => {
          this.getCompanyList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.ItemTaxForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.ItemTaxHttp.list(id).subscribe((res:any) => {
      this.ItemTaxForm.patchValue({
        item_code: res.data[0].item_code,
        tax_code: res.data[0].tax_code,
        start_date: res.data[0].start_date,
        end_date: res.data[0].end_date,
        state_code: res.data[0].state_code,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.ItemTaxHttp.delete( {'_id':id} ).subscribe((res:any) => {
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