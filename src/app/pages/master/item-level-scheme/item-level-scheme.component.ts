import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { ItemLevelSchemeService } from 'src/app/services/master/item_level_scheme.service';


@Component({
  selector: 'app-item-level-scheme',
  templateUrl: './item-level-scheme.component.html',
  styleUrls: ['./item-level-scheme.component.css']
})
export class ItemLevelSchemeComponent {
  itemLevelForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  constructor(private fb: FormBuilder, private itemLevelHttp:ItemLevelSchemeService) {
    this.createForm();
  }
  
  createForm() {
    this.itemLevelForm = this.fb.group({
      loc_code: ['', Validators.required],
      promo_code: ['', Validators.required ],
      item_code: ['', Validators.required ],
      batch_no: ['0', Validators.required ],
      from_date: ['', Validators.required ],
      to_date: ['', Validators.required ],
      from_time: [''],
      to_time: [''],
      from_qty: ['', Validators.required ],
      to_qty: ['', Validators.required ],
      max_qty: ['', Validators.required ],
      disc_perc: ['', Validators.required ],
      disc_amt: ['', Validators.required ],
      fix_rate: ['', Validators.required ],
      calc_on: ['', Validators.required ],
      cust_type_incl: ['', Validators.required ],
      cust_type_excl: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getCompanyList();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.itemLevelForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.itemLevelHttp.list().subscribe((res:any) => {
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
    this.itemLevelForm.value['created_by'] = 'admin';
    this.submitted = true;
    if (this.itemLevelForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.itemLevelHttp.save( this.itemLevelForm.value).subscribe((res:any) => {
          this.getCompanyList();
        }, (err:any) => {
          if (err.from_time == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.itemLevelForm.get(
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
        this.itemLevelHttp.update(this.itemLevelForm.value).subscribe((res:any) => {
          this.getCompanyList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.itemLevelForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.itemLevelHttp.list(id).subscribe((res:any) => {
      this.itemLevelForm.patchValue({
        loc_code: res.data[0].loc_code,
        promo_code: res.data[0].promo_code,
        item_code: res.data[0].item_code,
        batch_no: res.data[0].batch_no,
        from_date: res.data[0].from_date,
        to_date: res.data[0].to_date,
        from_time: res.data[0].from_time,
        to_time: res.data[0].to_time,
        from_qty: res.data[0].from_qty,
        to_qty: res.data[0].to_qty,
        max_qty: res.data[0].max_qty,
        disc_perc: res.data[0].disc_perc,
        disc_amt: res.data[0].disc_amt,
        fix_rate: res.data[0].fix_rate,
        calc_on: res.data[0].calc_on,
        cust_type_incl: res.data[0].cust_type_incl,
        cust_type_excl: res.data[0].cust_type_excl,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.itemLevelHttp.delete( {'_id':id} ).subscribe((res:any) => {
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