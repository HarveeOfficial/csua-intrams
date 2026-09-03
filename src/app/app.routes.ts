import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'standings',
    pathMatch: 'full',
  },
  {
    path: 'standings',
    loadComponent: () =>
      import('./standings/standings').then((m) => m.Standings),
  },
  {
    path: 'rankings',
    loadComponent: () =>
      import('./standings/standings').then((m) => m.Standings),
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./event-sched-and-stats/event-sched-and-stats').then(
        (m) => m.EventSchedAndStats
      ),
  },
  {
    path: 'downloads',
    loadComponent: () => import('./downloadable-files/downloadable-files').then((m) => m.DownloadableFiles),
  },
  {
    path: 'event-info',
    loadComponent: () => import('./event-info/event-info').then((m) => m.EventInfo),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then((m) => m.Admin),
    loadChildren: () => import('./admin/admin.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: 'standings',
  },
];
