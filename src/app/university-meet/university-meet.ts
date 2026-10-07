import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { UniversityMeetApi, UniversityMeetMatch } from './university-meet-api.service';

interface UniversityMeetEventGroup {
  key: string;
  eventName: string;
  category: UniversityMeetMatch['category'];
  matches: UniversityMeetMatch[];
}

interface PagedUniversityMeetEventGroup extends UniversityMeetEventGroup {
  pageIndex: number;
  pageCount: number;
  pageMatches: UniversityMeetMatch[];
}

const GAMES_PER_PAGE = 4;

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
  private readonly eventPages = signal<Record<string, number>>({});
  eventGroups = computed<PagedUniversityMeetEventGroup[]>(() =>
    this.groupMatches(this.matches()).map((group) => {
      const pageCount = Math.ceil(group.matches.length / GAMES_PER_PAGE);
      const pageIndex = Math.min(this.eventPages()[group.key] ?? 0, pageCount - 1);

      return {
        ...group,
        pageIndex,
        pageCount,
        pageMatches: group.matches.slice(
          pageIndex * GAMES_PER_PAGE,
          (pageIndex + 1) * GAMES_PER_PAGE,
        ),
      };
    }),
  );

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
    return match.scoreA === 0 && match.scoreB === 0 ? 'Not started' : 'Tied';
  }

  changeGamePage(group: PagedUniversityMeetEventGroup, direction: -1 | 1): void {
    const pageIndex = Math.max(0, Math.min(group.pageIndex + direction, group.pageCount - 1));
    this.eventPages.update((pages) => ({ ...pages, [group.key]: pageIndex }));
  }

  private groupMatches(matches: UniversityMeetMatch[]): UniversityMeetEventGroup[] {
    const groups = new Map<string, UniversityMeetEventGroup>();

    for (const match of matches) {
      const key = JSON.stringify([match.eventName, match.category]);
      let group = groups.get(key);

      if (!group) {
        group = {
          key,
          eventName: match.eventName,
          category: match.category,
          matches: [],
        };
        groups.set(key, group);
      }

      group.matches.push(match);
    }

    return [...groups.values()]
      .map((group) => ({
        ...group,
        matches: [...group.matches].sort(
          (a, b) => a.gameNumber - b.gameNumber || a.id - b.id,
        ),
      }))
      .sort(
        (a, b) =>
          a.eventName.localeCompare(b.eventName) || a.category.localeCompare(b.category),
      );
  }
}
