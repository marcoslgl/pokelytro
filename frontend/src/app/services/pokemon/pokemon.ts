import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  private api = 'http://localhost:3000/api/pokemons';

  constructor(private http: HttpClient) {}
  //Get methods
  get(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.api);
  }
  getById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.api}/${id}`);
  }

  // Create, Update, Delete methods
  /*post(pokemon : Pokemon): Observable<Pokemon> {
    return this.http.post<Pokemon>(this.api, pokemon);
  }
  put(id: number, pokemon : Pokemon): Observable<Pokemon> {
    return this.http.put<Pokemon>(`${this.api}/${id}`, pokemon);
  }
  delete(id: number): Observable<Pokemon> {
    return this.http.delete<Pokemon>(`${this.api}/${id}`);
  }*/

}
