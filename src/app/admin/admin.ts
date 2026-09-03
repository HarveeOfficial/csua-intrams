import { Component, inject } from '@angular/core';
import { AuthApi } from '../auth-api.service';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private auth = inject(AuthApi);
  private router = inject(Router);

  currentUser = this.auth.currentUser;
  isAdmin = () => this.auth.currentUser()?.role === 'admin';
  isTeamManager = () => this.auth.currentUser()?.role === 'tm';

  dashboardTitle(): string {
    return this.isAdmin() ? 'Admin Dashboard' : 'Team Manager Dashboard';
  }

  dashboardDescription(): string {
    return this.isAdmin()
      ? 'Manage colleges, sports, schedules, and competition results.'
      : 'Update schedules and results for your assigned event.';
  }

  assignedSports(): string {
    return this.currentUser()?.sport_names?.join(', ') || 'No sports assigned';
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/standings']);
  }
}
