import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoginResponse } from '../models/auth/login-response';
import { User } from '../models/user/user';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiConfigService } from './api-config.service';

interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private apiConfigService = inject(ApiConfigService);
  private isBrowser = isPlatformBrowser(this.platformId);

  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<User | null>(null);

  constructor() {
    this.checkAuthenticationStatus();
  }

  private get apiUrl(): string {
    return `${this.apiConfigService.getApiUrl()}${environment.api.users}`;
  }

  private saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('authToken', token);
    }
  }

  private loadToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private checkAuthenticationStatus(): void {
    if (!this.isBrowser) {
      return;
    }

    const token = this.loadToken();
    if (token) {
      this.isAuthenticated.set(true);

      this.getProfile().subscribe({
        next: (user) => {
          this.currentUser.set(user);
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) {
            this.logout();
          }
        },
      });
    }
  }

  register(data: AuthCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.handleAuthentication(response);
      }),
    );
  }

  login(data: AuthCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        this.handleAuthentication(response);
      }),
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private handleAuthentication(response: LoginResponse): void {
    this.saveToken(response.token);
    this.isAuthenticated.set(true);
    this.currentUser.set(response.user as User);
  }

  getToken(): string | null {
    return this.loadToken();
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  getFavorites(id: string): Observable<number[]> {
    return this.http
      .get<{ favorites: number[] }>(`${this.apiUrl}/${id}/favorites`)
      .pipe(map((resp) => resp?.favorites ?? []));
  }

  addFavorite(id: string, pokemonId: number): Observable<number[]> {
    return this.http
      .post<{ favorites: number[] }>(`${this.apiUrl}/${id}/favorites`, { pokemonId })
      .pipe(map((resp) => resp?.favorites ?? []));
  }

  removeFavorite(id: string, pokemonId: number): Observable<number[]> {
    return this.http
      .delete<{ favorites: number[] }>(`${this.apiUrl}/${id}/favorites`, {
        body: { pokemonId },
      })
      .pipe(map((resp) => resp?.favorites ?? []));
  }
}
