import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'item');
    }
    return this.http.get( environment.api_url +'item/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'item/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'item/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'item/delete', data);
  }
}
