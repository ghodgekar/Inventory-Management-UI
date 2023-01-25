import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'country');
    }
    return this.http.get( environment.api_url +'country/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'country/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'country/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'country/delete', data);
  }
}
