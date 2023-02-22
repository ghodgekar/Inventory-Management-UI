import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { PaymentModeService } from 'src/app/services/master/payment_mode.service';
import { PaymentInclExclService } from 'src/app/services/master/payment_incl_excl.service';
import { CategoryService } from 'src/app/services/master/category.service';
import { CategorySubService } from 'src/app/services/master/category_sub.service';
import { BrandService } from 'src/app/services/master/brand.service';
import { ManufracturerService } from 'src/app/services/master/manufracturer.service';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-payment-include-exclude',
  templateUrl: './payment-include-exclude.component.html',
  styleUrls: ['./payment-include-exclude.component.css']
})
export class PaymentIncludeExcludeComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  paymentInclExclForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];
  paymentModeData: any;
  transactionData: any;
  transactionType: any;

  constructor(private fb: FormBuilder, private paymentInclExclHttp:PaymentInclExclService, private paymentHttp:PaymentModeService, private categoryHttp:CategoryService,
    private subcategoryHttp:CategorySubService, private brandHttp:BrandService, private manufracturerHttp: ManufracturerService, private toastr:ToastrMsgService,public datepipe: DatePipe) {
    this.createForm();
  }
  
  createForm() {
    this.paymentInclExclForm = this.fb.group({
      pmt_code: ['', Validators.required],
      trans_type: ['', Validators.required ],
      trans_code: ['', Validators.required ],
      incl_excl: ['', Validators.required ],
      status: ['Active'],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getpaymentInclExclDatatable();
    this.getPaymentData();
  }

  getPaymentData(){
    this.paymentHttp.list().subscribe((res:any) => {
      this.paymentModeData = res.data
    })
  }

  getTransaction(event:any){
    this.transactionType = event.target.value;
    if(this.transactionType == 1){
      this.categoryHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
    if(this.transactionType == 2){
      this.subcategoryHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
    if(this.transactionType == 3){
      this.manufracturerHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
    if(this.transactionType == 4){
      this.brandHttp.list().subscribe((res:any) => {
        this.transactionData = res.data
      })
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.paymentInclExclForm.controls;
  }

  getpaymentInclExclDatatable(){
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
        that.paymentInclExclHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.paymentInclExclForm.value['updated_by'] = localStorage.getItem('username');
    this.paymentInclExclForm.value['updated_at'] = new Date();
    this.paymentInclExclForm.value['status'] = 'Active';
    this.submitted = true;
    if (this.paymentInclExclForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.paymentInclExclForm.value['created_by'] = localStorage.getItem('username');
        this.paymentInclExclForm.value['created_at'] = new Date();
        this.paymentInclExclHttp.save( this.paymentInclExclForm.value).subscribe((res:any) => {
          $('#evaluator_table').DataTable().ajax.reload();
          this.onReset();
          this.toastr.showSuccess(res.message);
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.paymentInclExclForm.get(
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
        this.paymentInclExclHttp.update(this.paymentInclExclForm.value).subscribe((res:any) => {
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
    this.paymentInclExclForm.reset();
    this.isEdit = false;
  }

  editPaymentInclExclList(id: any){
    this.isEdit = true;
    this.submitBtn = 'UPDATE'
    this.paymentInclExclHttp.list(id).subscribe((res:any) => {
      this.paymentInclExclForm.patchValue({
        pmt_code: res.data[0].pmt_code,
        trans_type: res.data[0].trans_type,
        trans_code: res.data[0].trans_code,
        incl_excl: res.data[0].incl_excl,
        status: res.data[0].status,
        created_by: res.data[0].created_by,
        created_at: res.data[0].created_at,
        updated_by: res.data[0].updated_by,
        updated_at: res.data[0].updated_at,
        _id: res.data[0]._id
      });
      this.transactionType = res.data[0].trans_type;
      this.getTransaction(this.transactionType)
      this.created_by = res.data[0].created_by;
      this.created_at = this.datepipe.transform(res.data[0].created_at, 'dd-MM-YYYY HH:MM:SS');
      this.updated_by = res.data[0].updated_by;
      this.updated_at = this.datepipe.transform(res.data[0].updated_at, 'dd-MM-YYYY HH:MM:SS');
    })
  }

  deletePaymentInclExclList(id:any){
    this.paymentInclExclHttp.delete( {'_id':id} ).subscribe((res:any) => {
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
} 