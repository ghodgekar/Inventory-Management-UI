import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'city');
    }
    return this.http.get( environment.api_url +'city/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'city/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'city/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'city/delete', data);
  }
}
