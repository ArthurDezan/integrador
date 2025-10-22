import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  
    private apiUrl: string = '/api/leituras';

    constructor(private http:HttpClient) {}

    getSensor():Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl);
    }


}
