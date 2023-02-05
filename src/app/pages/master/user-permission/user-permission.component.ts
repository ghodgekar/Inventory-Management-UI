import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { UserService } from 'src/app/services/master/user.service';
import { UserPermissionService } from 'src/app/services/master/user-permission.service';
import { ModuleService } from 'src/app/services/master/module.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission.component.html',
  styleUrls: ['./user-permission.component.css']
})
export class UserPermissionComponent implements OnInit {

  userForm!: FormGroup;
  submitted: boolean = false;
  userdata:any=[];
  data:any=[];

  submitBtn:String ='SAVE';

  role:any=["Accts.Assistant","Accts.Executive","Accts.Manager","Asst.Manager","Ast.Manager/Hd.Cashr","Auditor","Br.Manager","Ca","Cashier","Cashier/Acc","Cashier/Inv","Checker","Clu.Manager","Delivery Boy","Dept.Assistant","Head Cashier","Helper","Hod.Marketting","Inv.Branch","Inv.Clerk","Inv.Who","It.Admin","It.Edp","Mat.Manager","Pur.Manager","Rwadmin","Wh_Picker"]

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  moduledata: any;

  @ViewChild(DataTableDirective) datatableElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(private fb: FormBuilder, private userPermissionHttp:UserPermissionService, private userHttp:UserService, private moduleHttp:ModuleService,private readonly chRef: ChangeDetectorRef) {
    this.createForm();
  }
  
  createForm() {
    this.userForm = this.fb.group({
      user_code: ['', Validators.required ],
      module_code: ['', Validators.required ],
      is_open: ['', Validators.required ],
      is_entry: ['', Validators.required ],
      is_modify: ['', Validators.required ],
      is_auth: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      lengthMenu: [10,20,30],
      order:[[1,'desc']],
      destroy: true
    };
    this.dtTrigger.subscribe();
    this.getUserList();
    this.getModuleList();
    this.getUserPermissionList();
  }

  ngOnDestroy() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    })
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit() {
      this.dtTrigger.next(true);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  getUserList(){
    this.userHttp.list().subscribe((res:any) => {
      if(res.data){
        this.userdata = res.data;
      }
    })
  }

  getModuleList(){
    this.moduleHttp.list().subscribe((res:any) => {
      if(res.data){
        this.moduledata = res.data;
      }
    })
  }

  getUserPermissionList(){
    this.submitBtn == 'SAVE';
    this.userPermissionHttp.list().subscribe((res:any) => {
      if(res.data){
        this.data = res.data;
        setTimeout(()=>{   
          $('.table').DataTable( {
            pagingType: 'full_numbers',
            pageLength: 5,
            processing: true,
            lengthMenu : [5, 10, 25],
            destroy: true
        } );
        }, 1);
      }
    })
  }

  public rerender() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.userPermissionHttp.list().subscribe((res:any) => {
          this.data = res.data;
          this.chRef.detectChanges();
          this.dtTrigger.next(null);
        })
    });
  }

  onSubmit(): void {
    this.userForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.userForm.value['created_by'] = localStorage.getItem('username');
        this.userPermissionHttp.save( this.userForm.value).subscribe((res:any) => {
          this.getUserList();
          this.onReset();
        }, (err:any) => {
          if (err.status == 400) {
            const validationError = err.error.errors;
            Object.keys(validationError).forEach((index) => {
              const formControl = this.userForm.get(
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
        this.userPermissionHttp.update(this.userForm.value).subscribe((res:any) => {
          this.getUserList();
          this.onReset();
        })
      }
    }
  }

  onReset(): void {
    this.submitted = false;
    this.userForm.reset();
  }

  editUserList(id: any){
    this.submitBtn = 'UPDATE'
    this.userPermissionHttp.list(id).subscribe((res:any) => {
      this.userForm.patchValue({
        _id: res.data[0]._id,
        user_code: res.data[0].user_code,
        module_code: res.data[0].module_code,
        is_open: res.data[0].is_open,
        is_entry: res.data[0].is_entry,
        is_modify: res.data[0].is_modify,
        is_auth: res.data[0].is_auth
      });
    })
  }

  deleteUserList(id:any){
    this.userPermissionHttp.delete( {'_id':id} ).subscribe((res:any) => {
      this.getUserList();
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
            ].concat(this.userdata.map((el:any, i:any) => [el.data.list_code, el.data.list_value, el.data.list_desc, el.data.data_type, el.data.created_by]))
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