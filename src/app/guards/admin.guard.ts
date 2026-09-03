import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../auth-api.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthApi);
  const router = inject(Router);

  const user = auth.currentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  if (user.role !== 'admin') {
    router.navigate(['/admin/colleges']);
    return false;
  }
  return true;
};
