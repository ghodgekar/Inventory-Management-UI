import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'vendor');
    }
    return this.http.get( environment.api_url +'vendor/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'vendor/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'vendor/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'vendor/delete', data);
  }
}
