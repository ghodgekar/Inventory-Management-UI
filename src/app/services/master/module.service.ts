import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'module');
    }
    return this.http.get( environment.api_url +'module/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'module/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'module/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'module/delete', data);
  }

  parent_menu(){
    return this.http.get( environment.api_url +'module/parent_menu');
  }

}
