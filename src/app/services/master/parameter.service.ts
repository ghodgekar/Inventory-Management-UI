import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'parameters');
    }
    return this.http.get( environment.api_url +'parameters/'+id);
  }
  
  datatable(data:any){
    return this.http.post( environment.api_url +'parameters/datatableList', data);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'parameters/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'parameters/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'parameters/delete', data);
  }

  codeList(code?:string){
    return this.http.get( environment.api_url +'parametersByCode/'+code);
  }
}
