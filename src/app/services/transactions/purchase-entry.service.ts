import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseEntryService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'opening_stock');
    }
    return this.http.get( environment.api_url +'opening_stock/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'opening_stock/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'opening_stock/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'opening_stock/delete', data);
  }

  itemList(barcode?:any){
    return this.http.get( environment.api_url +'getitemdetials/'+barcode);
  }
}
