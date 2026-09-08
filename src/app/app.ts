import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthApi, UserSession } from './auth-api.service';
import { DataApi } from './data-api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  auth = inject(AuthApi);
  dataApi = inject(DataApi);
  router = inject(Router);
  protected title = 'csua-intrams';

  private readonly publicRatingKey = 'csua_public_rating';

  currentUser = signal<UserSession | null>(null);
  rating = signal(this.readStoredRating());
  isRatingModalOpen = signal(false);
  starValues = Array.from({ length: 5 }, (_, index) => index + 1);
  private readonly sessionStartedAt = Date.now();
  private readonly recordSessionTime = (): void => {
    if (!this.router.url.startsWith('/admin')) {
      this.dataApi.recordTimeSpent((Date.now() - this.sessionStartedAt) / 1000);
    }
  };

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
    if (!this.router.url.startsWith('/admin')) {
      this.dataApi.recordSiteVisit().subscribe();
      window.addEventListener('pagehide', this.recordSessionTime, { once: true });
    }
  }

  isAdminRoute() {
    return this.router.url.startsWith('/admin');
  }

  private readStoredRating(): number {
    const raw = localStorage.getItem(this.publicRatingKey);
    const value = Number(raw ?? 0);
    return Number.isFinite(value) && value >= 1 && value <= 5 ? value : 0;
  }

  openRatingModal(): void {
    this.isRatingModalOpen.set(true);
  }

  closeRatingModal(): void {
    this.isRatingModalOpen.set(false);
  }

  selectRating(value: number): void {
    this.rating.set(value);
  }

  submitRating(): void {
    const selectedRating = this.rating();
    if (selectedRating <= 0) {
      return;
    }

    this.dataApi.submitSiteRating(selectedRating).subscribe({
      next: () => {
        localStorage.setItem(this.publicRatingKey, String(selectedRating));
        this.closeRatingModal();
      },
    });
  }

  isStarFilled(star: number): boolean {
    return star <= this.rating();
  }

  dashboardLabel(): string {
    return this.currentUser()?.role === 'admin' ? 'Admin Dashboard' : 'Tournament Manager Dashboard';
  }

  dashboardAriaLabel(): string {
    return this.dashboardLabel();
  }
}
