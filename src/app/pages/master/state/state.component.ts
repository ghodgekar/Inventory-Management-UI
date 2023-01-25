import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { StateService } from 'src/app/services/master/state.service';
import { Subject } from 'rxjs';
import { CountryService } from 'src/app/services/master/country.service';



@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.css']
})
export class StateComponent {

  stateForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  countryData: any;

  constructor(private fb: FormBuilder, private StateHttp:StateService, private countryHttp:CountryService) {
    this.createForm();
  }
  
  createForm() {
    this.stateForm = this.fb.group({
      state_code: ['', Validators.required],
      state_name: ['', Validators.required ],
      country_code: ['', Validators.required ],
      state_type: ['', Validators.required ],
      gst_state_code: ['', Validators.required ],
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
    this.getCountryList();
  }

  getCountryList(){
    this.countryHttp.list().subscribe((res:any) => {
      this.countryData = res.data
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.stateForm.controls;
  }

  getCompanyList(){
    this.StateHttp.list().subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
      this.dtTrigger.subscribe();
    })
  }

  onSubmit(): void {
    this.stateForm.value['created_by'] = 'Admin';
    this.submitted = true;
    if (this.stateForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.StateHttp.save( this.stateForm.value).subscribe((res:any) => {
          this.getCompanyList();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.stateForm.get(
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
        this.StateHttp.update(this.stateForm.value).subscribe((res:any) => {
          this.getCompanyList();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.stateForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.StateHttp.list(id).subscribe((res:any) => {
      this.stateForm.patchValue({
        state_code: res.data[0].state_code,
        state_name: res.data[0].state_name,
        country_code: res.data[0].country_code,
        state_type: res.data[0].state_type,
        gst_state_code: res.data[0].gst_state_code,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.StateHttp.delete( {'_id':id} ).subscribe((res:any) => {
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