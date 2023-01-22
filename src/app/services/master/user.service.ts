import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'user');
    }
    return this.http.get( environment.api_url +'user/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'user/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'user/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'user/delete', data);
  }

}
