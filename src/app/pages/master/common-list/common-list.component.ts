import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CommonListService } from 'src/app/services/master/common-list.service';
import { BranchService } from 'src/app/services/master/branch.service';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { DatePipe } from '@angular/common';

class DataTablesResponse {
  data!: any[];
  draw!: number;
  recordsFiltered!: number;
  recordsTotal!: number;
}

@Component({
  selector: 'app-common-list',
  templateUrl: './common-list.component.html',
  styleUrls: ['./common-list.component.css']
})
export class CommonListComponent implements OnInit {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;

  commonlistForn!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  branchData: any;
  isEdit:boolean=false;

  constructor(private fb: FormBuilder, private commonHttp:CommonListService, private branchHttp:BranchService, private toastr:ToastrMsgService,public datepipe: DatePipe) {
    this.createForm();
  }
  
  createForm() {
    this.commonlistForn = this.fb.group({
      list_code: ['', Validators.required],
      list_value: ['', Validators.required ],
      list_desc: ['', Validators.required ],
      order_by: [''],
      loc_code: ['', Validators.required ],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      status: ['Active'],
      _id: []
    });
  }

  ngOnInit(): void {
    // this.getCommonList();
    this.getCommonListDatatable();
    this.getLocationList();
  }

  keyPressNumbersDecimal(e:any) {
    var regex = new RegExp("^[a-zA-Z_-]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    }
    e.preventDefault();
    return false;
  }

  get f(){
    return this.commonlistForn.controls;
  }

  getCommonList(){
    this.submitBtn == 'SAVE';
    this.commonHttp.list().subscribe((res:any) => {
      this.data = res.data;
      setTimeout(()=>{   
        $('.table').DataTable( {
          pagingType: 'full_numbers',
          pageLength: 15,
          processing: true,
          lengthMenu : [15, 30, 45],
          destroy: true
      } );
      }, 1);
    })
  }

  getCommonListDatatable(){
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
      scrollX: true,
      scrollCollapse: true,
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50, 100],
      ajax: (dataTablesParameters: any, callback: (arg0: { recordsTotal: any; recordsFiltered: any; data: never[]; }) => void) => {
        Object.assign(dataTablesParameters, formData)
        that.commonHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.commonlistForn.value['updated_by'] = localStorage.getItem('username');
    this.commonlistForn.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.commonlistForn.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.commonlistForn.value['created_by'] = localStorage.getItem('username');
        this.commonlistForn.value['created_at'] = new Date();
        this.commonHttp.save( this.commonlistForn.value).subscribe((res:any) => {
          $('#evaluator_table').DataTable().ajax.reload();
          this.onReset();
          this.toastr.showSuccess(res.message);
        }, (err:any) => {
          if (err.status == 400) {
            this.toastr.showError(err.error.message)
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
          this.toastr.showError(err.error.message)
        })
      }else if(this.submitBtn == 'UPDATE'){
        this.commonHttp.update(this.commonlistForn.value).subscribe((res:any) => {
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
    this.submitted = false;
    this.commonlistForn.reset();
  }

  getLocationList(){
    this.branchHttp.list().subscribe((res:any) => {
      this.branchData = res.data;
    })
  }

  editCommonList(id: any){
    this.isEdit = true;
    this.submitBtn = 'UPDATE'
    this.commonHttp.list(id).subscribe((res:any) => {
      this.commonlistForn.patchValue({
        list_code: res.data[0].list_code,
        list_value: res.data[0].list_value,
        list_desc: res.data[0].list_desc,
        order_by: res.data[0].order_by,
        loc_code: res.data[0].loc_code,
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


  moveToNext(event:any) {
    let next = event.target.nextElementSibling;
    console.log(next)
  }
} 