import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiConfigService } from '../api-config.service';

export interface Item {
  name: string;
  gen: string;
  desc: string; // Agregado campo de descripción opcional
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiConfigService = inject(ApiConfigService);

  constructor(private http: HttpClient) {}

  private get api(): string {
    return `${this.apiConfigService.getApiUrl()}${environment.api.items}`;
  }

  // Get methods
  get(): Observable<Item[]> {
    return this.http.get<Item[]>(this.api);
  }

  getById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.api}/${id}`);
  }
}
