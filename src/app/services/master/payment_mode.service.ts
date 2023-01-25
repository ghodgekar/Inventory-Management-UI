import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentModeService {
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'payment_mode');
    }
    return this.http.get( environment.api_url +'payment_mode/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'payment_mode/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'payment_mode/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'payment_mode/delete', data);
  }
}
