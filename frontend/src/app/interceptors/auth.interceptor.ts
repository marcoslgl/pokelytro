import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);
    let authToken = null;

    if (isPlatformBrowser(platformId)) {
        authToken = localStorage.getItem('authToken');
    }

    if (!authToken || req.url.includes('/api/pokemons')) {
        return next(req);
    }

    const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });

    return next(authReq);
};