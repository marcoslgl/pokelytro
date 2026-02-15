import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TypeModel {
  _id?: string;
  attacking_type: string;
  defender_type: string;
  multiplier: number;
}

@Injectable({
  providedIn: 'root',
})
export class Type {
  private api = `${environment.apiUrl}/types`;

  constructor(private http: HttpClient) {}

  // Get methods
  get(): Observable<TypeModel[]> {
    return this.http.get<TypeModel[]>(this.api);
  }

  getById(id: string): Observable<TypeModel> {
    return this.http.get<TypeModel>(`${this.api}/${id}`);
  }

}
