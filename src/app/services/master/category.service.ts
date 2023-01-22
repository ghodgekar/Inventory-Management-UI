import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'category');
    }
    return this.http.get( environment.api_url +'category/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'category/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'category/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'category/delete', data);
  }
}
