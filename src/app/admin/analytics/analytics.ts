import { Component, inject, signal } from '@angular/core';
import { DataApi } from '../../data-api.service';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
  standalone: true,
})
export class Analytics {
  private readonly dataApi = inject(DataApi);

  totalVisits = signal(0);
  avgTimeSpentMinutes = signal(0);
  visitTrend: number[] = [];
  timeTrend: number[] = [];
  averageRating = signal(0);
  ratingCount = signal(0);
  popupRating = signal(0);
  showRatingModal = signal(false);
  starValues = Array.from({ length: 5 }, (_, index) => index + 1);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.dataApi.getSiteAnalytics().subscribe({
      next: (analytics) => {
        this.totalVisits.set(analytics.totalVisits || 0);
        this.avgTimeSpentMinutes.set(analytics.avgTimeSpentMinutes || 0);
        this.visitTrend = analytics.visitTrend || [];
        this.timeTrend = analytics.timeTrend || [];
        this.averageRating.set(analytics.avgRating ?? 0);
        this.ratingCount.set(analytics.ratingCount ?? 0);
        this.popupRating.set(0);
      },
      error: () => {
        this.totalVisits.set(0);
        this.avgTimeSpentMinutes.set(0);
        this.visitTrend = [];
        this.timeTrend = [];
        this.averageRating.set(0);
        this.ratingCount.set(0);
        this.popupRating.set(0);
      },
    });
  }

  openRatingModal(): void {
    this.showRatingModal.set(true);
  }

  closeRatingModal(): void {
    this.showRatingModal.set(false);
  }

  selectRating(value: number): void {
    this.popupRating.set(value);
  }

  submitRating(): void {
    if (this.popupRating() <= 0) {
      return;
    }

    this.dataApi.submitSiteRating(this.popupRating()).subscribe({
      next: () => {
        this.loadAnalytics();
        this.closeRatingModal();
      },
      error: () => {
        this.closeRatingModal();
      },
    });
  }

  isStarFilled(star: number): boolean {
    return star <= this.popupRating();
  }

  formatVisits(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getVisitBarHeight(value: number): number {
    return Math.max(18, value / 1.8);
  }

  getTimeBarHeight(value: number): number {
    return Math.max(18, value * 4.2);
  }
}
