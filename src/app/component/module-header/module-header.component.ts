import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-module-header',
  templateUrl: './module-header.component.html',
  styleUrls: ['./module-header.component.css']
})
export class ModuleHeaderComponent implements OnInit {
  @Output() onSubmitChild = new EventEmitter<any>();
  @Output() downloadAsPDFChild = new EventEmitter<any>();
  @Output() generateExcelChild = new EventEmitter<any>();
  @Output() onResetChild = new EventEmitter<any>();
  @Input() moduleTitle:string = '';
  constructor(private router: Router,private confirmationDialogService: ConfirmationDialogService) {}

  ngOnInit(): void {
  }

  onSubmit(){
    this.onSubmitChild.emit();
  }

  downloadAsPDF(){
    this.downloadAsPDFChild.emit();
  }

  generateExcel(){
    this.generateExcelChild.emit();
  }

  onReset(){
    this.onResetChild.emit();
  }

  exitPage(){
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to ... ?')
    .then((confirmed) => {
      if(confirmed === true){
        this.router.navigate(['/dashboard']);
      }
    })
    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
}
