import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Pokemon as PokemonModel } from '../../models/pokemon/pokemon';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  private api = `${environment.apiUrl}${environment.api.pokemons}`;

  constructor(private http: HttpClient) {}
  //Get methods
  get(): Observable<PokemonModel[]> {
    return this.http.get<any[]>(this.api).pipe(
      map((pokemons) => pokemons.map((p) => ({ ...p, id: p._id }) as PokemonModel))
    );
  }
  getById(id: number): Observable<PokemonModel> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map((p) => ({ ...p, id: p._id }) as PokemonModel)
    );
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
