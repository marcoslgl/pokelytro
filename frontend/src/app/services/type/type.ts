import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private api = 'http://localhost:3000/api/types';

  constructor(private http: HttpClient) {}

  // Get methods
  get(): Observable<TypeModel[]> {
    return this.http.get<TypeModel[]>(this.api);
  }

  getById(id: string): Observable<TypeModel> {
    return this.http.get<TypeModel>(`${this.api}/${id}`);
  }

}
