import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'customer');
    }
    return this.http.get( environment.api_url +'customer/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'customer/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'customer/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'customer/delete', data);
  }

  parent_menu(){
    return this.http.get( environment.api_url +'customer/parent_menu');
  }
}
