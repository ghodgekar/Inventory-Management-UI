import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { BrandService } from 'src/app/services/master/brand.service';
import { ManufracturerService } from 'src/app/services/master/manufracturer.service';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { DatePipe } from '@angular/common';
import { MatSelect } from '@angular/material/select';


@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css']
})
export class BrandComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  brandForm!: FormGroup;
  submitted: boolean = false;
  submitBtn: String = 'SAVE';
  isEdit: boolean = false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data: any = [];
  search_data: any = [];

  searchFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  search_data_arr: ReplaySubject<any> = new ReplaySubject<any>(1);
  _onDestroy = new Subject<void>();

  constructor(private fb: FormBuilder, private brandHttp: BrandService, private manufraturerHttp: ManufracturerService, private toastr: ToastrMsgService, public datepipe: DatePipe) {
    this.createForm();
  }

  createForm() {
    this.brandForm = this.fb.group({
      brand_code: ['', Validators.required],
      brand_name: ['', Validators.required],
      manufact_code: ['', Validators.required],
      status: ['Active'],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getBrandDatatable()
    this.getManufracturerList();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  filterManufracturer() {
    if (!this.search_data) {
      return;
    }
    let search = this.searchFilterCtrl.value;
    if (!search) {
      this.search_data_arr.next(this.search_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.search_data_arr.next(
      this.search_data.filter((data: any) => data.manufact_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getManufracturerList() {
    this.submitBtn == 'SAVE';
    this.manufraturerHttp.list().subscribe((res: any) => {
      this.search_data = res.data;
      this.search_data_arr.next(this.search_data.slice());
      this.searchFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterManufracturer();
        });
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.brandForm.controls;
  }

  getBrandDatatable() {
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
        that.brandHttp.datatable(dataTablesParameters).subscribe((resp: any) => {
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
    this.brandForm.value['updated_by'] = localStorage.getItem('username');
    this.brandForm.value['updated_at'] = new Date();
    this.brandForm.value['status'] = 'Active';
    this.submitted = true;
    if (this.brandForm.invalid) {
      return;
    } else {
      if (this.submitBtn == 'SAVE') {
        this.brandForm.value['created_by'] = localStorage.getItem('username');
        this.brandForm.value['created_at'] = new Date();
        this.brandHttp.save(this.brandForm.value).subscribe((res: any) => {
          $('#evaluator_table').DataTable().ajax.reload();
          this.onReset();
          this.toastr.showSuccess(res.message);
        }, (err: any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.brandForm.get(
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
      } else if (this.submitBtn == 'UPDATE') {
        this.brandHttp.update(this.brandForm.value).subscribe((res: any) => {
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
    this.brandForm.reset();
    this.isEdit = false;
  }

  editBrandList(id: any) {
    this.isEdit = true;
    this.submitBtn = 'UPDATE'
    this.brandHttp.list(id).subscribe((res: any) => {
      this.brandForm.patchValue({
        brand_code: res.data[0].brand_code,
        brand_name: res.data[0].brand_name,
        manufact_code: res.data[0].manufact_code,
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

  deleteBrandList(id: any) {
    this.brandHttp.delete({ '_id': id }).subscribe((res: any) => {
    })
  }

  generateExcel(): void {
    let element = document.getElementById('table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
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