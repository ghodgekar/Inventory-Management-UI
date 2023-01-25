import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'brand');
    }
    return this.http.get( environment.api_url +'brand/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'brand/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'brand/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'brand/delete', data);
  }
}
