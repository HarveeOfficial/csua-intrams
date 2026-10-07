import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../auth-api.service';

export const universityMeetAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthApi);
  const router = inject(Router);
  const role = auth.currentUser()?.role;

  if (role === 'um_admin') return true;
  return router.createUrlTree([role ? '/admin' : '/login']);
};
