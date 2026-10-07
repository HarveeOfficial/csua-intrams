import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../auth-api.service';

export const campusStaffGuard: CanActivateFn = () => {
  const auth = inject(AuthApi);
  const router = inject(Router);
  const role = auth.currentUser()?.role;

  if (role === 'admin' || role === 'tm') return true;
  return router.createUrlTree([role === 'um_admin' ? '/um-admin' : '/login']);
};
