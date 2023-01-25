import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManufracturerService {
  
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'manufracturer');
    }
    return this.http.get( environment.api_url +'manufracturer/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'manufracturer/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'manufracturer/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'manufracturer/delete', data);
  }
}
