import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../auth-api.service';

export const authenticatedGuard: CanActivateFn = () => {
  const auth = inject(AuthApi);
  const router = inject(Router);

  if (!auth.currentUser()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
