import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { StateService } from 'src/app/services/master/state.service';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { CountryService } from 'src/app/services/master/country.service';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';



@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.css']
})
export class StateComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  stateForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];
  country_data: any=[];
  
  countryFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true })singleSelect!: MatSelect;
  country_data_arr: ReplaySubject<any> = new ReplaySubject<any>(1);
  _onDestroy = new Subject<void>();

  constructor(private fb: FormBuilder, private stateHttp:StateService, private countryHttp:CountryService, private toastr:ToastrMsgService,public datepipe: DatePipe) {
    this.createForm();
  }
  
  createForm() {
    this.stateForm = this.fb.group({
      state_code: ['', Validators.required],
      state_name: ['', Validators.required ],
      country_code: ['', Validators.required ],
      state_type: ['', Validators.required ],
      gst_state_code: [''],
      status: ['Active'],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getStateDatatable()
    this.getCountryList();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  filterState() {
    if (!this.country_data) {
      return;
    }
    let search = this.countryFilterCtrl.value;
    if (!search) {
      this.country_data_arr.next(this.country_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.country_data_arr.next(
      this.country_data.filter((data:any) => data.country_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getCountryList(){
    this.submitBtn == 'SAVE';
    this.countryHttp.list().subscribe((res:any) => {
      this.country_data = res.data;
      this.country_data_arr.next(this.country_data.slice());
      this.countryFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterState();
        });
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.stateForm.controls;
  }

  getStateDatatable(){
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
        that.stateHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.stateForm.value['updated_by'] = localStorage.getItem('username');
    this.stateForm.value['updated_at'] = new Date();
    this.stateForm.value['status'] = 'Active';
    this.submitted = true;
    if (this.stateForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.stateForm.value['created_by'] = localStorage.getItem('username');
        this.stateForm.value['created_at'] = new Date();
        this.stateHttp.save( this.stateForm.value).subscribe((res:any) => {
          $('#evaluator_table').DataTable().ajax.reload();
          this.onReset();
          this.toastr.showSuccess(res.message);
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
          this.toastr.showError(err.error.message)
        })
      }else if(this.submitBtn == 'UPDATE'){
        this.stateHttp.update(this.stateForm.value).subscribe((res:any) => {
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
    this.stateForm.reset();
    this.isEdit = false;
  }

  editCountryList(id: any){
    this.isEdit = true;
    this.submitBtn = 'UPDATE'
    this.stateHttp.list(id).subscribe((res:any) => {
      this.stateForm.patchValue({
        state_code: res.data[0].state_code,
        state_name: res.data[0].state_name,
        country_code: res.data[0].country_code,
        state_type: res.data[0].state_type,
        gst_state_code: res.data[0].gst_state_code,
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

  deleteCountryList(id:any){
    this.stateHttp.delete( {'_id':id} ).subscribe((res:any) => {
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