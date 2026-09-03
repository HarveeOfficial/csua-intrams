import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { DataApi } from '../data-api.service';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class Games {
  games$: Observable<{ sport: string; rows: any[] }[]>;
  sportSearch = signal('');
  selectedSport = signal('');

  constructor(private api: DataApi) {
    this.games$ = this.api.getSchedule().pipe(
      map((rows: any[]) => {
        const sorted = [...rows].sort((a, b) =>
          (a.sport || '').localeCompare(b.sport || '') ||
          (a.category || '').localeCompare(b.category || '') ||
          (a.event || '').localeCompare(b.event || '') ||
          (a.game || 0) - (b.game || 0)
        );
        const groups = new Map<string, any[]>();
        sorted.forEach((row) => {
          const sport = row.sport || 'Other';
          groups.set(sport, [...(groups.get(sport) || []), row]);
        });
        return [...groups.entries()].map(([sport, sportRows]) => ({ sport, rows: sportRows }));
      })
    );
  }

  filteredGroups(groups: { sport: string; rows: any[] }[]): { sport: string; rows: any[] }[] {
    const search = this.sportSearch().trim().toLowerCase();
    const selected = this.selectedSport();
    return groups.filter((group) =>
      (!selected || group.sport === selected) &&
      (!search || group.sport.toLowerCase().includes(search))
    );
  }

  sportOptions(groups: { sport: string; rows: any[] }[]): string[] {
    return groups.map((group) => group.sport);
  }

  clearFilters() {
    this.sportSearch.set('');
    this.selectedSport.set('');
  }

  trackRow(_index: number, row: any): string {
    return row.id || `${row.sport}|${row.category}|${row.event}|${row.game}`;
  }

  trackGroup(_index: number, group: { sport: string }): string {
    return group.sport;
  }
}
