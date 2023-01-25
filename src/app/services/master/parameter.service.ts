import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {
  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'parameter');
    }
    return this.http.get( environment.api_url +'parameter/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'parameter/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'parameter/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'parameter/delete', data);
  }

  codeList(code?:string){
    return this.http.get( environment.api_url +'parametersByCode/'+code);
  }
}
