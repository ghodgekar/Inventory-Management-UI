import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import htmlToPdfmake from 'html-to-pdfmake';
import { UserService } from 'src/app/services/master/user.service';
import { CommonListService } from 'src/app/services/master/common-list.service';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent  implements OnInit {

  userForm!: FormGroup;
  submitted: boolean = false;
  data:any=[];
  dtOptions: DataTables.Settings = {};

  submitBtn:String ='SAVE';

  @ViewChild('pdfTable')
  pdfTable!: ElementRef;
  roleData: any;

  constructor(private fb: FormBuilder, private userHttp:UserService, private CommonListHttp:CommonListService) {
    this.createForm();
  }
  
  createForm() {
    this.userForm = this.fb.group({
      user_code: ['', Validators.required ],
      user_name: ['', Validators.required ],
      user_pass: ['', Validators.required ],
      role: ['', Validators.required ],
      mobile: ['', Validators.required ],
      email: ['', Validators.required ],
      status: ['', Validators.required ],
      created_by: [''],
      _id: []
    });
  }

  ngOnInit(): void {
    this.getUserList();
    this.getUserRoleList();
  }

  getUserRoleList(){
    this.CommonListHttp.codeList('USER_ROLE').subscribe((res:any) => {
      this.roleData = res.data
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  getUserList(){
    this.submitBtn == 'SAVE';
    this.userHttp.list().subscribe((res:any) => {
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

  onSubmit(): void {
    this.userForm.value['updated_by'] = localStorage.getItem('username');
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }else{
      if(this.submitBtn == 'SAVE'){
        this.userForm.value['created_by'] = localStorage.getItem('username');
        this.userHttp.save( this.userForm.value).subscribe((res:any) => {
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
        this.userHttp.update(this.userForm.value).subscribe((res:any) => {
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
    this.userHttp.list(id).subscribe((res:any) => {
      this.userForm.patchValue({
        _id: res.data[0]._id,
        user_code: res.data[0].user_code,
        user_name: res.data[0].user_name,
        user_pass: res.data[0].user_pass,
        role: res.data[0].role,
        mobile: res.data[0].mobile,
        email: res.data[0].email,
        status: res.data[0].status,
      });
    })
  }

  deleteUserList(id:any){
    this.userHttp.delete( {'_id':id} ).subscribe((res:any) => {
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