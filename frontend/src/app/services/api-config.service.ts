import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private apiUrl: string = environment.apiUrl;
  private initialized = false;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient) {
    this.initializeApiUrl();
  }

  private async initializeApiUrl(): Promise<void> {
    // Solo intenta localhost si estamos en el navegador y el origen es localhost
    if (!this.isBrowser || !this.isLocalhost()) {
      this.initialized = true;
      return;
    }

    try {
      const localUrl = environment.localApiUrl;
      const testUrl = `${localUrl}${environment.api.users}`;
      
      await firstValueFrom(
        this.http.head(testUrl).pipe(
          timeout(2000),
          catchError(() => {
            throw new Error('localhost no disponible');
          })
        )
      );
      
      this.apiUrl = environment.localApiUrl;
      console.log('✓ API conectada a localhost:3000');
    } catch (error) {
      this.apiUrl = environment.apiVersion;
      console.log('✓ API conectada a Vercel:', this.apiUrl);
    }
    this.initialized = true;
  }

  private isLocalhost(): boolean {
    if (!this.isBrowser) return false;
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  getEndpoint(endpoint: string): string {
    return `${this.apiUrl}${endpoint}`;
  }

  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
