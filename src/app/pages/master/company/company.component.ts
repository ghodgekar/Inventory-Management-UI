import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CompanyService } from 'src/app/services/master/company.service';
import { Subject } from 'rxjs';
import { CommonListService } from 'src/app/services/master/common-list.service';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { CityService } from 'src/app/services/master/city.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit{
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  companyForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];
  parent_menu: any=[];
  typeData: any;
  cityData: any;

  constructor(private fb: FormBuilder, private CompanyHttp:CompanyService, private CommonListHttp:CommonListService,public datepipe: DatePipe, private ref: ElementRef, private toastr: ToastrMsgService, private cityHttp:CityService) {
    this.createForm();
  }
  
  createForm() {
    this.companyForm = this.fb.group({
      comp_code: ['', Validators.required],
      comp_name: ['', Validators.required ],
      type: ['', Validators.required ],
      addr1: ['', Validators.required ],
      addr2: [''],
      addr3: ['' ],
      city: ['', Validators.required ],
      state: ['', Validators.required ],
      country: ['', Validators.required ],
      pincode: ['', Validators.required ],
      std_code: [''],
      phone: [''],
      mobile: [''],
      gstin: [''],
      fassa_no: [''],
      cin_no: [''],
      pan_no: [''],
      tan_no: [''],
      lsttinpin_no: [''],
      cst_no: [''],
      coregn_no: [''],
      coregndate: [''],
      druglic_no: [''],
      importexport: [''],
      company_image: [''],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      status: ['Active'],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getCommonListDatatable();
    this.getTypeList();
    this.getCityList();
  }

  getTypeList(){
    this.CommonListHttp.codeList('COMP_TYPE').subscribe((res:any) => {
      this.typeData = res.data
    })
  }

  getCityList(){
    this.cityHttp.list().subscribe((res:any) => {
      this.cityData = res.data
    })
  }

  onChanheCity(e:any){
    this.cityHttp.getStateCountry(e.target.value).subscribe((res:any) => {
      this.companyForm.patchValue({
        state: res.data.state,
        country: res.data.country
      });
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.companyForm.controls;
  }
  

  getCommonListDatatable(){
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
        this.CompanyHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.companyForm.value['updated_by'] = localStorage.getItem('username');
    this.companyForm.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.companyForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.companyForm.value['created_by'] = localStorage.getItem('username');
        this.companyForm.value['created_at'] = new Date();
        this.CompanyHttp.save( this.companyForm.value).subscribe((res:any) => {  
          this.onReset();
          this.toastr.showSuccess(res.message);
          $('#evaluator_table').DataTable().ajax.reload();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.companyForm.get(
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
        this.CompanyHttp.update( this.companyForm.value).subscribe((res:any) => {
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
    this.companyForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.CompanyHttp.list(id).subscribe((res:any) => {
      this.companyForm.patchValue({
        comp_code: res.data[0].comp_code,
        comp_name: res.data[0].comp_name,
        type: res.data[0].type,
        addr1: res.data[0].addr1,
        addr2: res.data[0].addr2,
        addr3: res.data[0].addr3,
        city: res.data[0].city,
        state: res.data[0].state,
        country: res.data[0].country,
        std_code: res.data[0].std_code,
        pincode: res.data[0].pincode,
        phone: res.data[0].phone,
        mobile: res.data[0].mobile,
        gstin: res.data[0].gstin,
        fassa_no: res.data[0].fassa_no,
        cin_no: res.data[0].cin_no,
        pan_no: res.data[0].pan_no,
        tan_no: res.data[0].tan_no,
        lsttinpin_no: res.data[0].lsttinpin_no,
        cst_no: res.data[0].cst_no,
        coregn_no: res.data[0].coregn_no,
        coregndate: res.data[0].coregndate,
        druglic_no: res.data[0].druglic_no,
        importexport: res.data[0].importexport,
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

  deleteCompanyList(id:any){
    this.CompanyHttp.delete( {'_id':id} ).subscribe((res:any) => {
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