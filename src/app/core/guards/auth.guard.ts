import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../core/api.services';

// Guard de connexion basique
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// Guard pour ADMIN uniquement
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user.role === 'ADMIN') {
    return true;
  }

  // Si pas admin, on redirige vers la page autorisée (Projets)
  return router.createUrlTree(['/projets']);
};