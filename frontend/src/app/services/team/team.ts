import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiConfigService } from '../api-config.service';
import { Team as TeamModel } from '../../models/team/team';

@Injectable({
  providedIn: 'root',
})
export class Team {
  private apiConfigService = inject(ApiConfigService);

  constructor(private http: HttpClient) {}

  private get api(): string {
    return `${this.apiConfigService.getApiUrl()}${environment.api.teams}`;
  }

  //Get methods
  get(): Observable<TeamModel[]> {
    return this.http.get<TeamModel[]>(this.api);
  }
  getById(id: string): Observable<TeamModel> {
    return this.http.get<TeamModel>(`${this.api}/${id}`);
  }
  getByUserId(userId: string): Observable<TeamModel[]> {
    return this.http.get<TeamModel[]>(`${this.api}/user/${userId}`);
  }
  // Create, Update, Delete methods
  post(team: TeamModel): Observable<TeamModel> {
    return this.http.post<TeamModel>(this.api, team);
  }
  put(id: string, team: TeamModel): Observable<TeamModel> {
    return this.http.put<TeamModel>(`${this.api}/${id}`, team);
  }

  addMove(teamId: string, pokemonId: number, moveId: string): Observable<TeamModel> {
    return this.http.post<TeamModel>(`${this.api}/${teamId}/pokemons/${pokemonId}/moves`, { moveId });
  }

  replaceMove(
    teamId: string,
    pokemonId: number,
    moveId: string,
    newMoveId: string,
  ): Observable<TeamModel> {
    return this.http.patch<TeamModel>(`${this.api}/${teamId}/pokemons/${pokemonId}/moves/${moveId}`, {
      newMoveId,
    });
  }

  removeMove(teamId: string, pokemonId: number, moveId: string): Observable<TeamModel> {
    return this.http.delete<TeamModel>(`${this.api}/${teamId}/pokemons/${pokemonId}/moves/${moveId}`);
  }

  delete(id: string): Observable<TeamModel> {
    return this.http.delete<TeamModel>(`${this.api}/${id}`);
  }
}
