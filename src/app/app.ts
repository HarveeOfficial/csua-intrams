import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthApi, UserSession } from './auth-api.service';
import { DataApi } from './data-api.service';

export interface ImageZoomTarget {
  src: string;
  alt: string;
}

export function resolveImageZoomTarget(image: HTMLImageElement | null): ImageZoomTarget | null {
  if (!(image instanceof HTMLImageElement)) {
    return null;
  }

  if (image.closest('button')) {
    return null;
  }

  const src = (image.currentSrc || image.src || '').trim();

  if (!src || src === 'about:blank') {
    return null;
  }

  return {
    src,
    alt: image.alt?.trim() || 'Zoomed image',
  };
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  auth = inject(AuthApi);
  dataApi = inject(DataApi);
  router = inject(Router);
  protected title = 'csua-intrams';

  private readonly publicRatingKey = 'csua_public_rating';

  currentUser = signal<UserSession | null>(null);
  rating = signal(this.readStoredRating());
  isRatingModalOpen = signal(false);
  selectedZoomImage = signal<ImageZoomTarget | null>(null);
  starValues = Array.from({ length: 5 }, (_, index) => index + 1);
  private readonly sessionStartedAt = Date.now();
  private readonly recordSessionTime = (): void => {
    if (!this.isAdminRoute()) {
      this.dataApi.recordTimeSpent((Date.now() - this.sessionStartedAt) / 1000);
    }
  };

  private readonly handleImageClick = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const image = target.closest('img');
    if (!image) {
      return;
    }

    if (image.closest('.image-zoom-backdrop, .image-zoom-panel')) {
      return;
    }

    const zoomTarget = resolveImageZoomTarget(image as HTMLImageElement);
    if (zoomTarget) {
      this.selectedZoomImage.set(zoomTarget);
    }
  };

  private readonly handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.closeImageZoom();
    }
  };

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
    document.addEventListener('click', this.handleImageClick);
    document.addEventListener('keydown', this.handleEscapeKey);

    if (!this.isAdminRoute()) {
      this.dataApi.recordSiteVisit().subscribe();
      window.addEventListener('pagehide', this.recordSessionTime, { once: true });
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleImageClick);
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  isAdminRoute() {
    return this.router.url.startsWith('/admin') || this.router.url.startsWith('/um-admin');
  }

  isUniversityMeetRoute(): boolean {
    return this.router.url.startsWith('/university-meet') || this.router.url.startsWith('/um-admin');
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

  openImageZoom(image: ImageZoomTarget): void {
    this.selectedZoomImage.set(image);
  }

  closeImageZoom(): void {
    this.selectedZoomImage.set(null);
  }

  isStarFilled(star: number): boolean {
    return star <= this.rating();
  }

  dashboardLabel(): string {
    const role = this.currentUser()?.role;
    return role === 'um_admin' ? 'University Meet Dashboard'
      : role === 'admin' ? 'Admin Dashboard' : 'Tournament Manager Dashboard';
  }

  dashboardRoute(): string {
    return this.currentUser()?.role === 'um_admin' ? '/um-admin' : '/admin';
  }

  dashboardAriaLabel(): string {
    return this.dashboardLabel();
  }
}
