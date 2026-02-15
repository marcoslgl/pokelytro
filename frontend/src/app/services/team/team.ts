import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pokemon } from '../../models/pokemon/pokemon';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Team {
  private api = `${environment.apiUrl}${environment.api.teams}`;

  constructor(private http: HttpClient) {}
  //Get methods
  get(): Observable<Team[]> {
    return this.http.get<Team[]>(this.api);
  }
  getById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.api}/${id}`);
  }
  getByUserId(userId: string): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.api}/user/${userId}`);
  }
  // Create, Update, Delete methods
  post(team: Team): Observable<Team> {
    return this.http.post<Team>(this.api, team);
  }
  put(id: string, team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.api}/${id}`, team);
  }
  delete(id: string): Observable<Team> {
    return this.http.delete<Team>(`${this.api}/${id}`);
  }
}
