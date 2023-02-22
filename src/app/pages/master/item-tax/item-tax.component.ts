import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';
import { DatePipe } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { ItemTaxService } from 'src/app/services/master/item_tax.service';
import { StateService } from 'src/app/services/master/state.service';
import { ItemService } from 'src/app/services/master/item.service';
import { TaxService } from 'src/app/services/master/tax.service';

@Component({
  selector: 'app-item-tax',
  templateUrl: './item-tax.component.html',
  styleUrls: ['./item-tax.component.css']
})
export class ItemTaxComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  itemTaxForm!: FormGroup;
  submitted: boolean = false;
  submitBtn: String = 'SAVE';
  isEdit: boolean = false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data: any = [];
  taxData: any;
  search_state_data: any = [];
  search_item_data: any = [];

  searchStateFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  search_state_data_arr: ReplaySubject<any> = new ReplaySubject<any>(1);

  searchItemFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true }) singleItemSelect!: MatSelect;
  search_item_data_arr: ReplaySubject<any> = new ReplaySubject<any>(1);
  _onDestroy = new Subject<void>();

  constructor(private fb: FormBuilder, private itmTaxHttp:ItemTaxService, private stateHttp:StateService, private itemHttp:ItemService, private taxHttp:TaxService, private toastr: ToastrMsgService, public datepipe: DatePipe) {
    this.createForm();
  }
  
  createForm() {
    this.itemTaxForm = this.fb.group({
      item_code: ['', Validators.required],
      tax_code: ['', Validators.required ],
      start_date: ['', Validators.required ],
      end_date: ['', Validators.required ],
      state_code: ['', Validators.required ],
      status: ['Active'],
      created_by: [''],
      created_at: [''],
      updated_by: [''],
      updated_at: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getItemTaxDatatable()
    this.getStateList();
    this.getItemList();
    this.getTaxList();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  filterState() {
    if (!this.search_state_data) {
      return;
    }
    let search = this.searchStateFilterCtrl.value;
    if (!search) {
      this.search_state_data_arr.next(this.search_state_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.search_state_data_arr.next(
      this.search_state_data.filter((data: any) => data.state_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  filterItem() {
    if (!this.search_item_data) {
      return;
    }
    let search = this.searchItemFilterCtrl.value;
    if (!search) {
      this.search_item_data_arr.next(this.search_item_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.search_item_data_arr.next(
      this.search_item_data.filter((data: any) => data.item_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getStateList() {
    this.submitBtn == 'SAVE';
    this.stateHttp.list().subscribe((res: any) => {
      this.search_state_data = res.data;
      this.search_state_data_arr.next(this.search_state_data.slice());
      this.searchStateFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterState();
        });
    })
  }

  getItemList() {
    this.submitBtn == 'SAVE';
    this.itemHttp.list().subscribe((res: any) => {
      this.search_item_data = res.data;
      this.search_item_data_arr.next(this.search_item_data.slice());
      this.searchItemFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterItem();
        });
    })
  }

  getTaxList(){
    this.taxHttp.list().subscribe((res: any) => {
      this.taxData = res.data
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.itemTaxForm.controls;
  }

  getItemTaxDatatable() {
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
        that.itmTaxHttp.datatable(dataTablesParameters).subscribe((resp: any) => {
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
    this.itemTaxForm.value['updated_by'] = localStorage.getItem('username');
    this.itemTaxForm.value['updated_at'] = new Date();
    this.itemTaxForm.value['status'] = 'Active';
    this.submitted = true;
    if (this.itemTaxForm.invalid) {
      return;
    } else {
      if (this.submitBtn == 'SAVE') {
        this.itemTaxForm.value['created_by'] = localStorage.getItem('username');
        this.itemTaxForm.value['created_at'] = new Date();
        this.itmTaxHttp.save(this.itemTaxForm.value).subscribe((res: any) => {
          $('#evaluator_table').DataTable().ajax.reload();
          this.onReset();
          this.toastr.showSuccess(res.message);
        }, (err: any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.itemTaxForm.get(
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
        this.itmTaxHttp.update(this.itemTaxForm.value).subscribe((res: any) => {
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
    this.itemTaxForm.reset();
    this.isEdit = false;
  }

  editItemTaxList(id: any) {
    this.isEdit = true;
    this.submitBtn = 'UPDATE'
    this.itmTaxHttp.list(id).subscribe((res: any) => {
      this.itemTaxForm.patchValue({
        item_code: res.data[0].item_code,
        tax_code: res.data[0].tax_code,
        start_date: res.data[0].start_date,
        end_date: res.data[0].end_date,
        state_code: res.data[0].state_code,
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

  deleteItemTaxList(id: any) {
    this.itmTaxHttp.delete({ '_id': id }).subscribe((res: any) => {
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