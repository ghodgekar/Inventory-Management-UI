import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'branch');
    }
    return this.http.get( environment.api_url +'branch/'+id);
  }
  
  datatable(data:any){
    return this.http.post( environment.api_url +'branch/datatableList', data);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'branch/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'branch/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'branch/delete', data);
  }
}
