import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApi } from '../auth-api.service';
import { adminGuard } from '../guards/admin.guard';
import { authenticatedGuard } from '../guards/authenticated.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [() => {
      const auth = inject(AuthApi);
      const router = inject(Router);
      const role = auth.currentUser()?.role;
      router.navigate([
        role === 'admin' ? '/admin/colleges' : '/admin/event-sched-and-stats',
      ]);
      return false;
    }],
    loadComponent: () => import('./colleges/colleges').then((m) => m.Colleges),
  },
  {
    path: 'colleges',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./colleges/colleges').then((m) => m.Colleges),
  },
  {
    path: 'colleges/new',
    canActivate: [adminGuard],
    loadComponent: () => import('./colleges/college-create').then((m) => m.CollegeCreate),
  },
  {
    path: 'colleges/:id',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./colleges/college-details/college-details').then(
        (m) => m.CollegeDetails
      ),
  },
  {
    path: 'event-sched-and-stats',
    loadComponent: () =>
      import('./event-sched-and-stats/event-sched-and-stats').then(
        (m) => m.EventSchedAndStats
      ),
  },
  {
    path: 'sports',
    canActivate: [adminGuard],
    loadComponent: () => import('./sports/sports').then((m) => m.Sports),
  },
  {
    path: 'files',
    canActivate: [adminGuard],
    loadComponent: () => import('./downloadable-files/downloadable-files').then((m) => m.DownloadableFiles),
  },
  {
    path: 'user-manual',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./user-manual/user-manual').then((m) => m.UserManual),
  },
];
