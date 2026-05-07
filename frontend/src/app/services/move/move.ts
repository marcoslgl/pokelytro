import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiConfigService } from '../api-config.service';

export interface MoveModel {
  _id: string;
  id: number;
  name: string;
  power: number;
  type: string;
  damage_class: string;
  accuracy: number;
  pp: number;
  description: string;
  learned_by_ids: number[];
}

@Injectable({
  providedIn: 'root',
})
export class MoveService {
  private apiConfigService = inject(ApiConfigService);

  constructor(private http: HttpClient) {}

  private get api(): string {
    return `${this.apiConfigService.getApiUrl()}${environment.api.moves}`;
  }

  // Get methods
  get(): Observable<MoveModel[]> {
    return this.http.get<MoveModel[]>(this.api);
  }

  getById(id: string): Observable<MoveModel> {
    return this.http.get<MoveModel>(`${this.api}/${id}`);
  }
}
