import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { BranchService } from 'src/app/services/master/branch.service';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { CityService } from 'src/app/services/master/city.service';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  branchForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];
  parent_menu: any=[];
  typeData: any;
  city_data: any=[];
  
  cityFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true })singleSelect!: MatSelect;
  city_data_arr: ReplaySubject<any> = new ReplaySubject<any>(1);
  _onDestroy = new Subject<void>();

  constructor(private fb: FormBuilder, private branchHttp:BranchService,public datepipe: DatePipe, private ref: ElementRef, private toastr: ToastrMsgService, private cityHttp:CityService) {
    this.createForm();
  }
  
  createForm() {
    this.branchForm = this.fb.group({
      loc_code: ['', Validators.required],
      loc_no: ['', Validators.required ],
      loc_name: ['', Validators.required ],
      comp_code: ['', Validators.required ],
      addr1: ['', Validators.required ],
      addr2: [''],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      pincode: ['', Validators.required ],
      phone: [''],
      gstin: [''],
      bank_name: [''],
      bank_ac_no: [''],
      image: [''],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      status: ['Active'],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getBranchListDatatable();
    this.getCityList();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  filterCity() {
    if (!this.city_data) {
      return;
    }
    let search = this.cityFilterCtrl.value;
    if (!search) {
      this.city_data_arr.next(this.city_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.city_data_arr.next(
      this.city_data.filter((data:any) => data.city_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getCityList(){
    this.submitBtn == 'SAVE';
    this.cityHttp.list().subscribe((res:any) => {
      this.city_data = res.data;
      this.city_data_arr.next(this.city_data.slice());
      this.cityFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterCity();
        });
    })
  }
  
  onChanheCity(e:any){
    this.cityHttp.getStateCountry(e.value).subscribe((res:any) => {
      this.branchForm.patchValue({
        state: res.data.state,
        country: res.data.country
      });
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.branchForm.controls;
  }
  

  getBranchListDatatable(){
    var formData = {
      searchStatus: 'Active',
    };
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
      scrollCollapse: false,
      pageLength: 15,
      lengthMenu: [15, 30, 45, 60, 100],
      ajax: (dataTablesParameters: any, callback: (arg0: { recordsTotal: any; recordsFiltered: any; data: never[]; }) => void) => {
        Object.assign(dataTablesParameters, formData)
        this.branchHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.branchForm.value['updated_by'] = localStorage.getItem('username');
    this.branchForm.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.branchForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.branchForm.value['created_by'] = localStorage.getItem('username');
        this.branchForm.value['created_at'] = new Date();
        this.branchHttp.save( this.branchForm.value).subscribe((res:any) => {  
          this.onReset();
          this.toastr.showSuccess(res.message);
          $('#evaluator_table').DataTable().ajax.reload();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.branchForm.get(
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
        this.branchHttp.update( this.branchForm.value).subscribe((res:any) => {
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
    this.branchForm.reset();
    this.submitBtn = 'SAVE';
    this.isEdit = false;
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.branchHttp.list(id).subscribe((res:any) => {
      this.branchForm.patchValue({
        loc_code: res.data[0].loc_code,
        loc_no: res.data[0].loc_no,
        loc_name: res.data[0].loc_name,
        comp_code: res.data[0].comp_code,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        pincode: res.data[0].pincode,
        phone: res.data[0].phone,
        gstin: res.data[0].gstin,
        bank_name: res.data[0].bank_name,
        bank_ac_no: res.data[0].bank_ac_no,
        image: res.data[0].image,
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

  deleteCompanyList(id:any){
    this.branchHttp.delete( {'_id':id} ).subscribe((res:any) => {
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

  downloadAsPDF() {
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
