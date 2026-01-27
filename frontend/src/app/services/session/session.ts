import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setData(key: string, value: any): void {
    if (!this.isBrowser()) return;

    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getData<T = any>(key: string): T | null {
    if (!this.isBrowser()) return null;

    const data = sessionStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  removeData(key: string): void {
    if (!this.isBrowser()) return;

    sessionStorage.removeItem(key);
  }

  clearSession(): void {
    if (!this.isBrowser()) return;

    sessionStorage.clear();
  }
}
