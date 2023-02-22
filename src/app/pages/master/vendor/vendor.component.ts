import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { VendorService } from 'src/app/services/master/vendor.service';
import { CommonListService } from 'src/app/services/master/common-list.service';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { CityService } from 'src/app/services/master/city.service';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css']
})
export class VendorComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  vendorForm!: FormGroup;
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
  custTypeData: any;

  constructor(private fb: FormBuilder, private vendorHttp:VendorService, private commonListHttp:CommonListService,public datepipe: DatePipe, private toastr: ToastrMsgService, private cityHttp:CityService) {
    this.createForm();
  }
  
  createForm() {
    this.vendorForm = this.fb.group({
      vend_code: ['', Validators.required],
      vend_name: ['', Validators.required ],
      type: ['', Validators.required ],
      credit_day: ['', Validators.required ],
      addr1: ['', Validators.required ],
      addr2: ['', Validators.required ],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      pin_no: ['', Validators.required ],
      phone: ['', Validators.required ],
      email: ['', Validators.required ],
      gstin: ['', Validators.required ],
      fassi_no: ['', Validators.required ],
      aadhar_no: ['', Validators.required ],
      pan_no: ['', Validators.required ],
      contact_person: ['', Validators.required ],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      status: ['Active'],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getVendorListDatatable();
    this.getTypeList();
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

  getTypeList(){
    this.commonListHttp.codeList('COMP_TYPE').subscribe((res:any) => {
      this.typeData = res.data
    })
  }

  onChanheCity(e:any){
    this.cityHttp.getStateCountry(e.value).subscribe((res:any) => {
      this.vendorForm.patchValue({
        state: res.data.state,
        country: res.data.country
      });
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.vendorForm.controls;
  }
  

  getVendorListDatatable(){
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
        this.vendorHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.vendorForm.value['updated_by'] = localStorage.getItem('username');
    this.vendorForm.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.vendorForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.vendorForm.value['created_by'] = localStorage.getItem('username');
        this.vendorForm.value['created_at'] = new Date();
        this.vendorHttp.save( this.vendorForm.value).subscribe((res:any) => {  
          this.onReset();
          this.toastr.showSuccess(res.message);
          $('#evaluator_table').DataTable().ajax.reload();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.vendorForm.get(
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
        this.vendorHttp.update( this.vendorForm.value).subscribe((res:any) => {
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
    this.vendorForm.reset();
    this.submitBtn = 'SAVE';
    this.isEdit = false;
  }

  editVendorList(id: any){
    this.submitBtn = 'UPDATE'
    this.vendorHttp.list(id).subscribe((res:any) => {
      this.vendorForm.patchValue({
        vend_code: res.data[0].vend_code,
        vend_name: res.data[0].vend_name,
        type: res.data[0].type,
        credit_day: res.data[0].credit_day,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        pin_no: res.data[0].pin_no,
        phone: res.data[0].phone,
        email: res.data[0].email,
        gstin: res.data[0].gstin,
        fassi_no: res.data[0].fassi_no,
        aadhar_no: res.data[0].aadhar_no,
        pan_no: res.data[0].pan_no,
        contact_person: res.data[0].contact_person,
        created_by: res.data[0].created_by,
        created_at: res.data[0].created_at,
        updated_by: res.data[0].updated_by,
        updated_at: res.data[0].updated_at,
        status: res.data[0].status,
        _id: res.data[0]._id
      });
      this.created_by = res.data[0].created_by;
      this.created_at = this.datepipe.transform(res.data[0].created_at, 'dd-MM-YYYY HH:MM:SS');
      this.updated_by = res.data[0].updated_by;
      this.updated_at = this.datepipe.transform(res.data[0].updated_at, 'dd-MM-YYYY HH:MM:SS');
    })
    this.isEdit = true;
  }

  deleteVendorList(id:any){
    this.vendorHttp.delete( {'_id':id} ).subscribe((res:any) => {
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