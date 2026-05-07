import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que se complete la verificación de autenticación
  // con un timeout de 5 segundos
  let isChecked = false;
  let attempts = 0;
  const maxAttempts = 50; // 5 segundos con 100ms de espera

  while (!isChecked && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 100));
    isChecked = authService.isAuthChecked();
    attempts++;
  }

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
