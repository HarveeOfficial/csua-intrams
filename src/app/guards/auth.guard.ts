import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../auth-api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthApi);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};
