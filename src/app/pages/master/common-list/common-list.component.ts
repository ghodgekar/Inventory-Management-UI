import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CommonListService } from 'src/app/services/master/common-list.service';

@Component({
  selector: 'app-common-list',
  templateUrl: './common-list.component.html',
  styleUrls: ['./common-list.component.css']
})
export class CommonListComponent implements OnInit {

  commonlistForn!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  constructor(private fb: FormBuilder, private commonHttp:CommonListService) {
    this.createForm();
  }
  
  createForm() {
    this.commonlistForn = this.fb.group({
      list_code: ['', Validators.required],
      list_value: ['', Validators.required ],
      list_desc: ['', Validators.required ],
      order_by: ['', Validators.required ],
      loc_code: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getCommonList();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.commonlistForn.controls;
  }

  getCommonList(){
    this.submitBtn == 'SAVE';
    this.commonHttp.list().subscribe((res:any) => {
      this.data = res.data;
      setTimeout(()=>{   
        $('.table').DataTable( {
          pagingType: 'full_numbers',
          pageLength: 5,
          processing: true,
          lengthMenu : [5, 10, 25],
          destroy: true
      } );
      }, 1);
    })
  }

  onSubmit(): void {
    this.commonlistForn.value['created_by'] = 'admin';
    this.submitted = true;
    if (this.commonlistForn.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.commonHttp.save( this.commonlistForn.value).subscribe((res:any) => {
          this.getCommonList();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.commonlistForn.get(
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
        this.commonHttp.update(this.commonlistForn.value).subscribe((res:any) => {
          this.getCommonList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.commonlistForn.reset();
  }

  editCommonList(id: any){
    this.submitBtn = 'UPDATE'
    this.commonHttp.list(id).subscribe((res:any) => {
      this.commonlistForn.patchValue({
        list_code: res.data[0].list_code,
        list_value: res.data[0].list_value,
        list_desc: res.data[0].list_desc,
        order_by: res.data[0].order_by,
        loc_code: res.data[0].loc_code,
        _id: res.data[0]._id
      });
    })
  }

  deleteCommonList(id:any){
    this.commonHttp.delete( {'_id':id} ).subscribe((res:any) => {
      this.getCommonList();
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