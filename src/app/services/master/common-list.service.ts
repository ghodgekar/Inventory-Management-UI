import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonListService {

  constructor(private http:HttpClient) { }

  list(id?:any){
    if(id == undefined){
      return this.http.get( environment.api_url +'common_list');
    }
    return this.http.get( environment.api_url +'common_list/'+id);
  }
  
  save(data:any){
    return this.http.post( environment.api_url +'common_list/save', data);
  }

  update(data:any){
    return this.http.post( environment.api_url +'common_list/update', data);
  }

  delete(data:any){
    return this.http.post( environment.api_url +'common_list/delete', data);
  }

  codeList(code?:string){
    return this.http.get( environment.api_url +'common_list_by_code/'+code);
  }

}
