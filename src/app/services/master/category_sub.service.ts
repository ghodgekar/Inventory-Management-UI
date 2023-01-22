import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategorySubService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'category_sub');
    }
    return this.http.get( environment.api_url +'category_sub/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'category_sub/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'category_sub/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'category_sub/delete', data);
  }
}
