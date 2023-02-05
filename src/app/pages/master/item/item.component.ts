import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { CompanyService } from 'src/app/services/master/company.service';
import { ItemService } from 'src/app/services/master/item.service';
import { CategoryService } from 'src/app/services/master/category.service';
import { CategorySubService } from 'src/app/services/master/category_sub.service';
import { BrandService } from 'src/app/services/master/brand.service';
import { ManufracturerService } from 'src/app/services/master/manufracturer.service';
import { TaxService } from 'src/app/services/master/tax.service';


@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent {

  ItemForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  parent_menu: any=[];
  dtOptions:any={};
  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  categoryData: any;
  manufracturerData: any;
  brandData: any;
  subcategoryData: any;
  taxData: any;

  constructor(private fb: FormBuilder, private ItemHttp:ItemService, private categoryHttp:CategoryService, private subcategoryHttp:CategorySubService, private brandHttp:BrandService, private manufracturerHttp: ManufracturerService, private taxHttp:TaxService) {
    this.createForm();
  }
  
  createForm() {
    this.ItemForm = this.fb.group({
      item_code: ['', Validators.required],
      item_name: ['', Validators.required ],
      item_full_name: ['', Validators.required ],
      regional_name: ['0', Validators.required ],
      item_UOM: ['', Validators.required ],
      item_weight: ['', Validators.required ],
      item_type: ['', Validators.required],
      item_parent: ['', Validators.required ],
      pack_charge: ['', Validators.required ],
      label_reqd: ['', Validators.required ],
      qty_in_case: ['', Validators.required ],
      tax_code: ['', Validators.required ],
      sub_category_code: ['', Validators.required ],
      category_code: ['', Validators.required ],
      inventory: ['', Validators.required ],
      brand_code: ['', Validators.required ],
      manufact_code: ['', Validators.required ],
      markup: ['', Validators.required ],
      markdown: ['', Validators.required ],
      rate_upd: ['', Validators.required ],
      hsn: ['', Validators.required ],
      exp_req: ['', Validators.required ],
      shelf_life_period: ['', Validators.required ],
      shelf_life_dm: ['', Validators.required ],
      group1: ['', Validators.required ],
      group2: ['', Validators.required ],
      group3: ['', Validators.required ],
      group4: ['', Validators.required ],
      on_mrp: ['', Validators.required ],
      created_at: [''],
      created_by: [''],
      updated_at: [''],
      updated_by: [''],
      deactive_reason: [''],
      deactive_date: [''],
      _id: [],
      barcodes: this.fb.array([])
    });
    this.addBarcodes()
  }

  ngOnInit(): void {
    this.getCompanyList();
    this.getCategoryList();
    this.getSubCategoryList();
    this.getBrandList();
    this.getManufracturerList();
    this.getTaxList()
  }

  getCategoryList(){
    this.categoryHttp.list().subscribe((res:any) => {
      this.categoryData = res.data
    })
  }

  getSubCategoryList(){
    this.subcategoryHttp.list().subscribe((res:any) => {
      this.subcategoryData = res.data
    })
  }

  getBrandList(){
    this.brandHttp.list().subscribe((res:any) => {
      this.brandData = res.data
    })
  }

  getManufracturerList(){
    this.manufracturerHttp.list().subscribe((res:any) => {
      this.manufracturerData = res.data
    })
  }

  getTaxList(){
    this.taxHttp.list().subscribe((res:any) => {
      this.taxData = res.data;
    })
  }

  barcodes() : FormArray {  
    return this.ItemForm.get("barcodes") as FormArray  
  }  
     
  newBarcodes(): FormGroup {  
    return this.fb.group({  
      barcode: ''
    })  
  }  
     
  addBarcodes() {  
    this.barcodes().push(this.newBarcodes());  
  }  
     
  removeBarcodes(i:number) {  
    this.barcodes().removeAt(i);  
  }  

  get f(): { [key: string]: AbstractControl } {
    return this.ItemForm.controls;
  }

  getCompanyList(){
    this.submitBtn == 'SAVE';
    this.ItemHttp.list().subscribe((res:any) => {
      this.data = res.data;
      setTimeout(()=>{   
        $('.table1').DataTable( {
          pagingType: 'full_numbers',
          pageLength: 5,
          processing: true,
          lengthMenu : [5, 10, 25],
          destroy: true
      } );
      }, 10);
    })
  }

  onSubmit(): void {
    this.ItemForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.ItemForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.ItemForm.value['created_by'] = localStorage.getItem('username');
        this.ItemHttp.save( this.ItemForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.ItemForm.get(
                validationError[index].param
              );
              if (formControl) {
                formControl.setErrors({
                  serverError: validationError[index].msg,
                });
              }
            });
          }
        })
      }else if(this.submitBtn == 'UPDATE'){
        this.ItemHttp.update(this.ItemForm.value).subscribe((res:any) => {
          this.getCompanyList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.ItemForm.reset();
  }

  editCompanyList(id: any){
    this.submitBtn = 'UPDATE'
    this.ItemHttp.list(id).subscribe((res:any) => {
      this.ItemForm.patchValue({
        item_code: res.data[0].item_code,
        item_name: res.data[0].item_name,
        item_full_name: res.data[0].item_full_name,
        regional_name: res.data[0].regional_name,
        item_UOM: res.data[0].item_UOM,
        item_weight: res.data[0].item_weight,
        item_type: res.data[0].item_type,
        item_parent: res.data[0].item_parent,
        pack_charge: res.data[0].pack_charge,
        label_reqd: res.data[0].label_reqd,
        qty_in_case: res.data[0].qty_in_case,
        tax_code: res.data[0].tax_code,
        sub_category_code: res.data[0].sub_category_code,
        category_code: res.data[0].category_code,
        inventory: res.data[0].inventory,
        brand_code: res.data[0].brand_code,
        manufact_code: res.data[0].manufact_code,
        markup: res.data[0].markup,
        markdown: res.data[0].markdown,
        rate_upd: res.data[0].rate_upd,
        hsn: res.data[0].hsn,
        exp_req: res.data[0].exp_req,
        shelf_life_period: res.data[0].shelf_life_period,
        shelf_life_dm: res.data[0].shelf_life_dm,
        group1: res.data[0].group1,
        group2: res.data[0].group2,
        group3: res.data[0].group3,
        group4: res.data[0].group4,
        on_mrp: res.data[0].on_mrp,
        created_by: res.data[0].created_by,
        created_at: res.data[0].created_at,
        updated_by: res.data[0].updated_by,
        updated_at: res.data[0].updated_at,
        deactive_reason: res.data[0].deactive_reason,
        deactive_date: res.data[0].deactive_date,
        status: res.data[0].status,
        _id: res.data[0]._id
      });
    })
  }

  deleteCompanyList(id:any){
    this.ItemHttp.delete( {'_id':id} ).subscribe((res:any) => {
      this.getCompanyList();
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
} 