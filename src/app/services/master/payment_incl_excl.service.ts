import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentInclExclService {
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'payment_incl_excl');
    }
    return this.http.get( environment.api_url +'payment_incl_excl/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'payment_incl_excl/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'payment_incl_excl/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'payment_incl_excl/delete', data);
  }
}
