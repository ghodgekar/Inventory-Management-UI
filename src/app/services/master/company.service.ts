import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'company');
    }
    return this.http.get( environment.api_url +'company/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'company/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'company/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'company/delete', data);
  }
}
