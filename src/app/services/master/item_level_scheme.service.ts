import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemLevelSchemeService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'item_level_scheme');
    }
    return this.http.get( environment.api_url +'item_level_scheme/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'item_level_scheme/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'item_level_scheme/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'item_level_scheme/delete', data);
  }
}
