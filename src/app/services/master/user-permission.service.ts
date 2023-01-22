import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'user_permission');
    }
    return this.http.get( environment.api_url +'user_permission/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'user_permission/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'user_permission/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'user_permission/delete', data);
  }

}
