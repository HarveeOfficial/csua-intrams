import { Component, inject, signal } from '@angular/core';
import { AuthApi } from '../auth-api.service';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private auth = inject(AuthApi);
  private router = inject(Router);

  currentUser = this.auth.currentUser;
  isAdmin = () => this.auth.currentUser()?.role === 'admin';
  isTeamManager = () => this.auth.currentUser()?.role === 'tm';

  showChangePassword = signal(false);
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);
  changingPassword = signal(false);

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

  openChangePassword() {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.showChangePassword.set(true);
  }

  closeChangePassword() {
    this.showChangePassword.set(false);
  }

  async submitChangePassword() {
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    if (this.newPassword().length < 8) {
      this.passwordError.set('New password must be at least 8 characters.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('New password and confirmation do not match.');
      return;
    }

    this.changingPassword.set(true);
    try {
      await this.auth.changePassword(this.currentPassword(), this.newPassword(), this.confirmPassword());
      this.passwordSuccess.set('Password updated successfully.');
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
    } catch (error: any) {
      this.passwordError.set(error?.error?.message || 'Failed to update password.');
    } finally {
      this.changingPassword.set(false);
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/standings']);
  }
}
