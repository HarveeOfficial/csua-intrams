import { Routes } from '@angular/router';
import { campusStaffGuard } from './guards/campus-staff.guard';
import { universityMeetAdminGuard } from './guards/university-meet-admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'university-meet',
    pathMatch: 'full',
  },
  {
    path: 'program-of-events',
    loadComponent: () =>
      import('./program-of-events/program-of-events').then(
        (m) => m.ProgramOfEvents
      ),
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
    path: 'university-meet',
    loadComponent: () => import('./university-meet/university-meet').then((m) => m.UniversityMeet),
  },
  {
    path: 'um-admin',
    canActivate: [universityMeetAdminGuard],
    loadComponent: () => import('./university-meet/university-meet-admin').then((m) => m.UniversityMeetAdmin),
  },
  {
    path: 'downloads',
    loadComponent: () => import('./downloadable-files/downloadable-files').then((m) => m.DownloadableFiles),
  },
  {
    path: 'polls',
    loadComponent: () => import('./polls/polls').then((m) => m.Polls),
  },
  {
    path: 'event-info',
    loadComponent: () => import('./event-info/event-info').then((m) => m.EventInfo),
  },
  {
    path: 'safety-measures',
    loadComponent: () =>
      import('./safety-measures/safety-measures').then((m) => m.SafetyMeasures),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    canActivate: [campusStaffGuard],
    loadComponent: () => import('./admin/admin').then((m) => m.Admin),
    loadChildren: () => import('./admin/admin.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: 'standings',
  },
];
