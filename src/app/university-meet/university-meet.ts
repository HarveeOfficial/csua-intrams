import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { UniversityMeetApi, UniversityMeetMatch } from './university-meet-api.service';

@Component({
  selector: 'app-university-meet',
  templateUrl: './university-meet.html',
})
export class UniversityMeet implements OnInit, OnDestroy {
  private readonly api = inject(UniversityMeetApi);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  matches = signal<UniversityMeetMatch[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.refresh();
    this.refreshTimer = setInterval(() => this.refresh(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  refresh(): void {
    this.api.list().subscribe({
      next: (matches) => {
        this.matches.set(matches);
        this.loading.set(false);
        this.error.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  status(match: UniversityMeetMatch): string {
    if (match.winner) return `${match.winner} wins`;
    if (match.plannedGames % 2 === 0 && match.gamesWonA + match.gamesWonB === match.plannedGames) {
      return 'Tiebreak game next';
    }
    return match.gamesWonA + match.gamesWonB === 0 ? 'Not started' : 'In progress';
  }
}
