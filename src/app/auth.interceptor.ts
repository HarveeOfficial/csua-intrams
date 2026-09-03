import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthApi } from './auth-api.service';
import { isApiRequest } from './api-config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthApi).token();
  if (!token || !isApiRequest(request.url)) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};