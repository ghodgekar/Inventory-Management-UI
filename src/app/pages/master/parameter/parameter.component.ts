import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.css']
})
export class ParameterComponent implements  OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective) datatableElement!: DataTableDirective;
  parameterForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;

  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(private fb: FormBuilder, private http:HttpClient,private readonly chRef: ChangeDetectorRef) {
    this.createForm();
  }
  
  createForm() {
    this.parameterForm = this.fb.group({
      param_code: ['', Validators.required],
      param_value: ['', Validators.required ],
      param_desc: ['', Validators.required ],
      data_type: ['', Validators.required ],
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
    this.dtTrigger.subscribe();
    this.getParameter();
  }

  ngOnDestroy() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    })
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit() {
      this.dtTrigger.next(true);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.parameterForm.controls;
  }

  getParameter(){
    this.submitBtn == 'SAVE';
    this.http.get( environment.api_url +'parameters').subscribe((res:any) => {
      this.data = res.data;
      this.chRef.detectChanges();
      this.dtTrigger.next(null);
    })
  }

  public rerender() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.http.get( environment.api_url +'parameters').subscribe((res:any) => {
          this.data = res.data;
          this.chRef.detectChanges();
          this.dtTrigger.next(null);
        })
    });
  }

  onSubmit(): void {
    this.parameterForm.value['created_by'] = 'Admin';
    this.submitted = true;
    if (this.parameterForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.http.post( environment.api_url + 'parameters/save', this.parameterForm.value).subscribe((res:any) => {  
          // this.getParameter();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.parameterForm.get(
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
        this.http.post( environment.api_url + 'parameters/update', this.parameterForm.value).subscribe((res:any) => {
          this.getParameter();
        })
      }
      this.onReset();
    }
  }

  onReset(): void {
    this.submitted = false;
    this.parameterForm.reset();
  }

  editParameter(id: any){
    this.submitBtn = 'UPDATE'
    this.http.get( environment.api_url +'parameters/' + id).subscribe((res:any) => {
      this.parameterForm.patchValue({
        param_code: res.data[0].param_code,
        param_value: res.data[0].param_value,
        param_desc: res.data[0].param_desc,
        data_type: res.data[0].data_type,
        _id: res.data[0]._id
      });
    })
  }

  deleteParameter(id:any){
    this.http.post( environment.api_url +'parameters/delete', {'_id':id}).subscribe((res:any) => {
      this.getParameter();
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
            ].concat(this.data.map((el:any, i:any) => [el.data.param_code, el.data.param_value, el.data.param_desc, el.data.data_type, el.data.created_by]))
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