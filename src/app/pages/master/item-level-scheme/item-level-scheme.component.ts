import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { ItemLevelSchemeService } from 'src/app/services/master/item_level_scheme.service';
import { ItemService } from 'src/app/services/master/item.service';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { ToastrMsgService } from 'src/app/services/components/toastr-msg.service';


@Component({
  selector: 'app-item-level-scheme',
  templateUrl: './item-level-scheme.component.html',
  styleUrls: ['./item-level-scheme.component.css']
})
export class ItemLevelSchemeComponent {
  created_by: any;
  created_at: any;
  updated_by: any;
  updated_at: any;
  itemLevelForm!: FormGroup;
  submitted: boolean = false;
  submitBtn:String ='SAVE';
  isEdit:boolean=false;
  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  dtOptions: DataTables.Settings = {};
  data:any=[];
  search_data: any=[];
  itemData: any;
  
  searchFilterCtrl: FormControl<string> = new FormControl<any>('');
  @ViewChild('singleSelect', { static: true })singleSelect!: MatSelect;
  search_field: ReplaySubject<any> = new ReplaySubject<any>(1);
  _onDestroy = new Subject<void>();
  

  constructor(private fb: FormBuilder, private itemLevelHttp:ItemLevelSchemeService, private itemHttp:ItemService,public datepipe: DatePipe, private toastr: ToastrMsgService) {
    this.createForm();
  }
  
  createForm() {
    this.itemLevelForm = this.fb.group({
      loc_code: ['', Validators.required],
      promo_code: ['', Validators.required ],
      item_code: ['', Validators.required ],
      batch_no: ['', Validators.required ],
      from_date: ['', Validators.required ],
      to_date: ['', Validators.required ],
      from_time: [''],
      to_time: [''],
      from_qty: ['', Validators.required ],
      to_qty: ['', Validators.required ],
      max_qty: ['', Validators.required ],
      disc_perc: ['', Validators.required ],
      disc_amt: ['', Validators.required ],
      fix_rate: ['', Validators.required ],
      calc_on: ['', Validators.required ],
      cust_type_incl: ['', Validators.required ],
      cust_type_excl: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getItemLevelSchemeDatatable();
    this.getItemLevelSchemeList();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected filterSelect() {
    if (!this.search_data) {
      return;
    }
    let search = this.searchFilterCtrl.value;
    if (!search) {
      this.search_field.next(this.search_data.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.search_field.next(
      this.search_data.filter((data:any) => data.item_name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  getItemLevelSchemeList(){
    this.submitBtn == 'SAVE';
    this.itemHttp.list().subscribe((res:any) => {
      this.search_data = res.data;
      this.search_field.next(this.search_data.slice());
      this.searchFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterSelect();
        });
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.itemLevelForm.controls;
  }

  getItemLevelSchemeDatatable(){
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
        that.itemLevelHttp.datatable(dataTablesParameters).subscribe((resp:any) => {
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
    this.itemLevelForm.value['updated_by'] = localStorage.getItem('username');
    this.itemLevelForm.value['updated_at'] = new Date();
    this.submitted = true;
    if (this.itemLevelForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.itemLevelForm.value['created_by'] = localStorage.getItem('username');
        this.itemLevelForm.value['created_at'] = new Date();
        this.itemLevelHttp.save( this.itemLevelForm.value).subscribe((res:any) => {  
          this.onReset();
          this.toastr.showSuccess(res.message);
          $('#evaluator_table').DataTable().ajax.reload();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.itemLevelForm.get(
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
        this.itemLevelHttp.update( this.itemLevelForm.value).subscribe((res:any) => {
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
    this.itemLevelForm.reset();
    this.isEdit = false;
  }

  editItemLevelSchemeList(id: any){
    this.submitBtn = 'UPDATE'
    this.itemLevelHttp.list(id).subscribe((res:any) => {
      this.itemLevelForm.patchValue({
        loc_code: res.data[0].loc_code,
        promo_code: res.data[0].promo_code,
        item_code: res.data[0].item_code,
        batch_no: res.data[0].batch_no,
        from_date: res.data[0].from_date,
        to_date: res.data[0].to_date,
        from_time: res.data[0].from_time,
        to_time: res.data[0].to_time,
        from_qty: res.data[0].from_qty,
        to_qty: res.data[0].to_qty,
        max_qty: res.data[0].max_qty,
        disc_perc: res.data[0].disc_perc,
        disc_amt: res.data[0].disc_amt,
        fix_rate: res.data[0].fix_rate,
        calc_on: res.data[0].calc_on,
        cust_type_incl: res.data[0].cust_type_incl,
        cust_type_excl: res.data[0].cust_type_excl,
        status: res.data[0].status,
        created_by: res.data[0].created_by,
        created_at: res.data[0].created_at,
        updated_by: res.data[0].updated_by,
        updated_at: res.data[0].updated_at,
        _id: res.data[0]._id,
      });
      this.created_by = res.data[0].created_by;
      this.created_at = this.datepipe.transform(res.data[0].created_at, 'dd-MM-YYYY HH:MM:SS');
      this.updated_by = res.data[0].updated_by;
      this.updated_at = this.datepipe.transform(res.data[0].updated_at, 'dd-MM-YYYY HH:MM:SS');
    })
  }

  deleteItemLevelSchemeList(id:any){
    this.itemLevelHttp.delete( {'_id':id} ).subscribe((res:any) => {
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