import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { ParameterService } from 'src/app/services/master/parameter.service';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.css']
})
export class ParameterComponent implements  OnInit {

  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  parameterForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];

  constructor(private fb: FormBuilder, private parameterHttp:ParameterService,private readonly chRef: ChangeDetectorRef,public datepipe: DatePipe, private ref: ElementRef, private toastr: ToastrMsgService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.getParameterDatatable();
  }

  createForm() {
    this.parameterForm = this.fb.group({
      param_code: ['', Validators.required],
      param_value: ['', Validators.required ],
      param_desc: ['', Validators.required ],
      data_type: [''],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      status: ['Active'],
      _id: []
    });
  }

  get f(){
    return this.parameterForm.controls;
  }

  getParameterDatatable(){
    var formData = {
      searchStatus: 'Active',
    };
    this.dtOptions = {
      processing: false,
      responsive: true,
      serverSide: true,
      destroy: true,
      autoWidth: true,
      info: true,
      dom: 'Rfrtlip',
      searching: false,
      lengthChange: true,
      ordering: false,
      scrollX: false,
      scrollCollapse: true,
      pageLength: 15,
      lengthMenu: [15, 30, 45, 60, 100],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, formData)
        this.parameterHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
          this.data = resp.data;
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
    this.parameterForm.value['updated_by'] = localStorage.getItem('username');
    this.parameterForm.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.parameterForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.parameterForm.value['created_by'] = localStorage.getItem('username');
        this.parameterForm.value['created_at'] = new Date();
        this.parameterHttp.save( this.parameterForm.value).subscribe((res:any) => {  
          this.onReset();
          this.toastr.showSuccess(res.message);
          $('#evaluator_table').DataTable().ajax.reload();
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
          this.toastr.showError(err.error.message)
        })
      }else if(this.submitBtn == 'UPDATE'){
        this.parameterHttp.update( this.parameterForm.value).subscribe((res:any) => {
          this.isEdit = false;
          this.submitBtn = 'SAVE';
          this.onReset();
          this.toastr.showSuccess(res.message)
          $('#evaluator_table').DataTable().ajax.reload();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.parameterForm.reset();
  }

  editParameter(id: any){
    this.submitBtn = 'UPDATE'
    this.parameterHttp.list(id).subscribe((res:any) => {
      this.parameterForm.patchValue({
        param_code: res.data[0].param_code,
        param_value: res.data[0].param_value,
        param_desc: res.data[0].param_desc,
        data_type: res.data[0].data_type,
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
    this.isEdit = true;
  }

  deleteParameter(id:any){
    this.parameterHttp.delete( {'_id':id}).subscribe((res:any) => {
      $('#evaluator_table').DataTable().ajax.reload();
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