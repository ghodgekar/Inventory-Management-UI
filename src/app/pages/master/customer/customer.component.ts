import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CommonListService } from 'src/app/services/master/common-list.service';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { CityService } from 'src/app/services/master/city.service';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { CustomerService } from 'src/app/services/master/customer.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  customerForm!: FormGroup;
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
  loc_code!: any;
  joinDate: any;
  customerData: any;

  constructor(private fb: FormBuilder, private customerHttp:CustomerService, private datePipe:DatePipe, private commonListHttp:CommonListService,public datepipe: DatePipe, private toastr: ToastrMsgService, private cityHttp:CityService) {
    this.createForm();
  }
  
  createForm() {
    this.customerForm = this.fb.group({
      cust_code: ['', Validators.required],
      cust_name: ['', Validators.required ],
      gender: [''],
      aadhar_no: [''],
      addr1: ['', Validators.required ],
      addr2: [''],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      pincode: [''],
      mobile: [''],
      email: [''],
      pan_no: [''],
      gstin: [''],
      birth_date: [''],
      join_date: [this.datePipe.transform(new Date(), 'dd-MM-yyyy')],
      cust_type: [''],
      barcode: [''],
      points: [''],
      ref_cust_code: [''],
      cr_limit: [''],
      cr_overdue_days: [''],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      status: ['Active'],
      _id: []
    });
  }

  ngOnInit(): void {
    this.loc_code = localStorage.getItem('location')
    this.getCustomerListDatatable();
    this.getCustType();
    this.getCustomerList();
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
      this.customerForm.patchValue({
        state: res.data.state,
        country: res.data.country
      });
    })
  }

  getCustType(){
    this.commonListHttp.codeList('CUST_TYPE').subscribe((res:any) => {
      this.custTypeData = res.data
    })
  }

  getCustomerList(){
    this.customerHttp.list().subscribe((res:any) => {
      this.customerData = res.data;
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.customerForm.controls;
  }
  

  getCustomerListDatatable(){
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
        this.customerHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.customerForm.value['updated_by'] = localStorage.getItem('username');
    this.customerForm.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.customerForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.customerForm.value['created_by'] = localStorage.getItem('username');
        this.customerForm.value['created_at'] = new Date();
        this.customerHttp.save( this.customerForm.value).subscribe((res:any) => {  
          this.onReset();
          this.toastr.showSuccess(res.message);
          $('#evaluator_table').DataTable().ajax.reload();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.customerForm.get(
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
        this.customerHttp.update( this.customerForm.value).subscribe((res:any) => {
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
    this.customerForm.reset();
    this.submitBtn = 'SAVE';
    this.isEdit = false;
  }

  editCustomerList(id: any){
    this.submitBtn = 'UPDATE'
    this.customerHttp.list(id).subscribe((res:any) => {
      this.customerForm.patchValue({
        cust_code: res.data[0].cust_code,
        cust_name: res.data[0].cust_name,
        gender: res.data[0].gender,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        pincode: res.data[0].pincode,
        mobile: res.data[0].mobile,
        email: res.data[0].email,
        aadhar_no: res.data[0].aadhar_no,
        pan_no: res.data[0].pan_no,
        gstin: res.data[0].gstin,
        birth_date: res.data[0].birth_date,
        join_date: res.data[0].join_date,
        cust_type: res.data[0].cust_type,
        barcode: res.data[0].barcode,
        points: res.data[0].points,
        ref_cust_code: res.data[0].ref_cust_code,
        cr_limit: res.data[0].cr_limit,
        cr_overdue_days: res.data[0].cr_overdue_days,
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

  deleteCustomerList(id:any){
    this.customerHttp.delete( {'_id':id} ).subscribe((res:any) => {
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