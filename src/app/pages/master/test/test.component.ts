import { Component, OnInit, ViewChild  } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {
  dtOptions: DataTables.Settings = {};
  data: any = [];
  dtTrigger: Subject<any> = new Subject();


  constructor(public http:HttpClient){}
  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2,
      destroy: true
    };
    this.getParameter()
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  
  getParameter(){
    this.http.get( environment.api_url +'parameters').subscribe((res:any) => {
      this.data = res.data;
      this.dtTrigger.next(null);
    })
  }

  test(){
    this.getParameter()
  }
  
}
