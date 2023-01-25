import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemTaxService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'item_tax');
    }
    return this.http.get( environment.api_url +'item_tax/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'item_tax/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'item_tax/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'item_tax/delete', data);
  }
}
