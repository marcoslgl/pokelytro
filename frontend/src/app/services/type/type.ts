import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiConfigService } from '../api-config.service';

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
  private apiConfigService = inject(ApiConfigService);

  constructor(private http: HttpClient) {}

  private get api(): string {
    return `${this.apiConfigService.getApiUrl()}${environment.api.types}`;
  }

  // Get methods
  get(): Observable<TypeModel[]> {
    return this.http.get<TypeModel[]>(this.api);
  }

  getById(id: string): Observable<TypeModel> {
    return this.http.get<TypeModel>(`${this.api}/${id}`);
  }

}
