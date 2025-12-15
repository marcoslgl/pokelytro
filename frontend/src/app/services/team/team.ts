import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pokemon } from '../../models/pokemon/pokemon';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Team {
  private api = 'http://localhost:3000/api/teams';

  constructor(private http: HttpClient) {}
  //Get methods
  get(): Observable<Team[]> {
    return this.http.get<Team[]>(this.api);
  }
  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.api}/${id}`);
  }
  // Create, Update, Delete methods
  post(team: Team): Observable<Team> {
    return this.http.post<Team>(this.api, team);
  }
  put(id: number, team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.api}/${id}`, team);
  }
  delete(id: number): Observable<Team> {
    return this.http.delete<Team>(`${this.api}/${id}`);
  }
}
