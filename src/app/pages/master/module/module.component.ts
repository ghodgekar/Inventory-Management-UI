import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { ModuleService } from 'src/app/services/master/module.service';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit{
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  moduleForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];
  parent_menu_data: any=[];
  
  menuFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true })singleSelect!: MatSelect;
  parent_menu: ReplaySubject<any> = new ReplaySubject<any>(1);
  _onDestroy = new Subject<void>();

  constructor(private fb: FormBuilder, private moduleHttp:ModuleService,public datepipe: DatePipe, private toastr: ToastrMsgService) {
    this.createForm();
  }
  
  createForm() {
    this.moduleForm = this.fb.group({
      module_code: ['', Validators.required],
      module_name: ['', Validators.required ],
      module_slug: ['', Validators.required ],
      parent_madule_code: ['0'],
      status: ['Active'],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getModuleDatatable();
    this.getModuleParent();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected filterMenus() {
    if (!this.parent_menu_data) {
      return;
    }
    let search = this.menuFilterCtrl.value;
    if (!search) {
      this.parent_menu.next(this.parent_menu_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.parent_menu.next(
      this.parent_menu_data.filter((data:any) => data.module_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  get f() {
    return this.moduleForm.controls;
  }

  getModuleDatatable(){
    var formData = {
      searchStatus: 'Active',
    };
    const that = this;
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
      ajax: (dataTablesParameters: any, callback: (arg0: { recordsTotal: any; recordsFiltered: any; data: never[]; }) => void) => {
        Object.assign(dataTablesParameters, formData)
        that.moduleHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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

  getModuleParent(){
    this.submitBtn == 'SAVE';
    this.moduleHttp.parent_menu().subscribe((res:any) => {
      this.parent_menu_data = res.data;
      this.parent_menu.next(this.parent_menu_data.slice());
      this.menuFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterMenus();
        });
    })
  }

  onSubmit(): void {
    this.moduleForm.value['updated_by'] = localStorage.getItem('username');
    this.moduleForm.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.moduleForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.moduleForm.value['created_by'] = localStorage.getItem('username');
        this.moduleForm.value['created_at'] = new Date();
        this.moduleHttp.save( this.moduleForm.value).subscribe((res:any) => {  
          this.onReset();
          this.toastr.showSuccess(res.message);
          $('#evaluator_table').DataTable().ajax.reload();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.moduleForm.get(
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
        this.moduleHttp.update( this.moduleForm.value).subscribe((res:any) => {
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
    this.moduleForm.reset();
    this.isEdit = false;
    this.submitBtn = 'SAVE';
  }

  editModuleList(id: any){
    this.isEdit = true;
    this.submitBtn = 'UPDATE'
    this.moduleHttp.list(id).subscribe((res:any) => {
      this.moduleForm.patchValue({
        module_code: res.data[0].module_code,
        module_name: res.data[0].module_name,
        module_slug: res.data[0].module_slug,
        parent_madule_code: res.data[0].parent_madule_code,
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

  deleteModuleList(id:any){
    this.moduleHttp.delete( {'_id':id} ).subscribe((res:any) => {
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