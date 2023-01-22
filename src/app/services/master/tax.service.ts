import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'tax');
    }
    return this.http.get( environment.api_url +'tax/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'tax/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'tax/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'tax/delete', data);
  }

  parent_menu(){
    return this.http.get( environment.api_url +'tax/parent_menu');
  }
}
