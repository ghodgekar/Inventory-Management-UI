import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CountryService } from 'src/app/services/master/country.service';
import { Subject } from 'rxjs';



@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent {

  countryForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(private fb: FormBuilder, private CountryHttp:CountryService) {
    this.createForm();
  }
  
  createForm() {
    this.countryForm = this.fb.group({
      country_code: ['', Validators.required],
      country_name: ['', Validators.required ],
      currency_code: ['', Validators.required ],
      status: ['Active'],
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
    this.dtTrigger.next(null);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.countryForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.CountryHttp.list().subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
      this.dtTrigger.subscribe();
    })
  }

  onSubmit(): void {
    this.countryForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.countryForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.countryForm.value['created_by'] = localStorage.getItem('username');
        this.CountryHttp.save( this.countryForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.countryForm.get(
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
        this.CountryHttp.update(this.countryForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.countryForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.CountryHttp.list(id).subscribe((res:any) => {
      this.countryForm.patchValue({
        country_code: res.data[0].country_code,
        country_name: res.data[0].country_name,
        currency_code: res.data[0].currency_code,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.CountryHttp.delete( {'_id':id} ).subscribe((res:any) => {
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

  test(id:any){
    alert(id)
  }
} 