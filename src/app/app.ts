import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthApi, UserSession } from './auth-api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  auth = inject(AuthApi);
  router = inject(Router);
  protected title = 'csua-intrams';

  currentUser = signal<UserSession | null>(null);

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
  }

  isAdminRoute() {
    return this.router.url.startsWith('/admin');
  }

  dashboardLabel(): string {
    return this.currentUser()?.role === 'admin' ? 'Admin Dashboard' : 'Team Manager Dashboard';
  }

  dashboardAriaLabel(): string {
    return this.dashboardLabel();
  }
}
