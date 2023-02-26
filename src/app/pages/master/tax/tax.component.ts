import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { DatePipe } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { TaxService } from 'src/app/services/master/tax.service';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent implements OnInit{
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  taxForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];
  search_data: any=[];
  
  searchFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true })singleSelect!: MatSelect;
  search_data_arr: ReplaySubject<any> = new ReplaySubject<any>(1);
  _onDestroy = new Subject<void>();
  isVAT: boolean = false;

  constructor(private fb: FormBuilder, private taxHttp:TaxService, private toastr:ToastrMsgService,public datepipe: DatePipe) {
    this.createForm();
  }
  
  createForm() {
    this.taxForm = this.fb.group({
      tax_type: ['', Validators.required ],
      tax_code: ['', Validators.required ],
      tax_name: ['', Validators.required ],
      tax_per: ['', Validators.required],
      tax_indicator: [''],
      igst: [''],
      sgst: [''],
      cgst: [''],
      utgst: [''],
      cess: [''],
      cessperpiece: [''],
      status: ['Active'],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getTaxDatatable()
  }

  get f(): { [key: string]: AbstractControl } {
    return this.taxForm.controls;
  }

  getTaxDatatable(){
    var formData = {
      searchStatus: 'Active',
    };
    const that = this;
    this.dtOptions = {
      processing: false,
      responsive: true,
      serverSide: true,
      destroy: true,
      autoWidth: false,
      info: true,
      dom: 'Rfrtlip',
      searching: false,
      lengthChange: true,
      ordering: false,
      scrollX: false,
      scrollCollapse: true,
      pageLength: 15,
      lengthMenu: [15, 30, 45, 60],
      ajax: (dataTablesParameters: any, callback: (arg0: { recordsTotal: any; recordsFiltered: any; data: never[]; }) => void) => {
        Object.assign(dataTablesParameters, formData)
        that.taxHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
            that.data = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      }
    };
  }

  onSubmit(): void {
    this.taxForm.value['updated_by'] = localStorage.getItem('username');
    this.taxForm.value['updated_at'] = new Date();
    this.taxForm.value['status'] = 'Active';
    this.submitted = true;
    if (this.taxForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.taxForm.value['created_by'] = localStorage.getItem('username');
        this.taxForm.value['created_at'] = new Date();
        this.taxHttp.save( this.taxForm.value).subscribe((res:any) => {
          $('#evaluator_table').DataTable().ajax.reload();
          this.onReset();
          this.toastr.showSuccess(res.message);
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.taxForm.get(
                validationError[index].param
              );
              if (formControl) {
                formControl.setErrors({
                  serverError: validationError[index].msg,
                });
              }
            });
          }
          this.toastr.showError(err.error.message)
        })
      }else if(this.submitBtn == 'UPDATE'){
        this.taxHttp.update(this.taxForm.value).subscribe((res:any) => {
          $('#evaluator_table').DataTable().ajax.reload();
          this.isEdit = false;
          this.submitBtn = 'SAVE';
          this.onReset();
          this.toastr.showSuccess(res.message)
        })
      }
    }
  }

  onReset(): void {
    this.submitBtn = 'SAVE';
    this.submitted = false;
    this.taxForm.reset();
    this.isEdit = false;
    this.isVAT = false;
  }

  editTaxList(id: any){
    this.isEdit = true;
    this.submitBtn = 'UPDATE'
    this.taxHttp.list(id).subscribe((res:any) => {
      this.taxForm.patchValue({
        tax_type: res.data[0].tax_type,
        tax_code: res.data[0].tax_code,
        tax_name: res.data[0].tax_name,
        tax_per: res.data[0].tax_per,
        tax_indicator: res.data[0].tax_indicator,
        igst: res.data[0].igst,
        sgst: res.data[0].sgst,
        cgst: res.data[0].cgst,
        utgst: res.data[0].utgst,
        cess: res.data[0].cess,
        cessperpiece: res.data[0].cessperpiece,
        status: res.data[0].status,
        created_by: res.data[0].created_by,
        created_at: res.data[0].created_at,
        updated_by: res.data[0].updated_by,
        updated_at: res.data[0].updated_at,
        _id: res.data[0]._id
      });
      this.created_by = res.data[0].created_by;
      this.created_at = this.datepipe.transform(res.data[0].created_at, 'dd-MM-YYYY HH:MM:SS');
      this.updated_by = res.data[0].updated_by;
      this.updated_at = this.datepipe.transform(res.data[0].updated_at, 'dd-MM-YYYY HH:MM:SS');
    })
  }

  deleteTaxList(id:any){
    this.taxHttp.delete( {'_id':id} ).subscribe((res:any) => {
    })
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

  taxTypeChange(e:any){
    if(e.target.value == 'VAT'){
      this.isVAT = true
    }else{
      this.isVAT = false
    }
  }
} 