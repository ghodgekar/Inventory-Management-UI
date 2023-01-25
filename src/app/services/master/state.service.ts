import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'state');
    }
    return this.http.get( environment.api_url +'state/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'state/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'state/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'state/delete', data);
  }
}
