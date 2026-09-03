import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DataApi } from '../data-api.service';

interface ScheduleGroup {
  sport: string;
  rows: any[];
}

@Component({
  selector: 'app-visitor-event-sched-and-stats',
  imports: [CommonModule],
  templateUrl: './event-sched-and-stats.html',
  styleUrl: './event-sched-and-stats.css',
})
export class EventSchedAndStats {
  schedule$!: Observable<ScheduleGroup[]>;
  sportSearch = '';
  selectedSport = '';
  selectedCategory = '';
  selectedStandingType: 'sports' | 'socio' = 'sports';

  constructor(private api: DataApi) {
    this.schedule$ = this.api.getSchedule().pipe(
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
        return [...groups.entries()].map(([sport, sportRows]) => ({
          sport,
          rows: sportRows,
        }));
      })
    );
  }

  filteredGroups(groups: ScheduleGroup[]): ScheduleGroup[] {
    const search = this.sportSearch.trim().toLowerCase();
    return this.standingTypeGroups(groups)
      .filter((group) =>
        (!this.selectedSport || group.sport === this.selectedSport) &&
        (!search || group.sport.toLowerCase().includes(search))
      )
      .map((group) => ({
        ...group,
        rows: group.rows.filter(
          (row) => !this.selectedCategory || (row.category || '-') === this.selectedCategory
        ),
      }))
      .filter((group) => group.rows.length > 0);
  }

  standingTypeGroups(groups: ScheduleGroup[]): ScheduleGroup[] {
    return groups
      .map((group) => ({
        ...group,
        rows: group.rows.filter((row) => (row.standingType || 'sports') === this.selectedStandingType),
      }))
      .filter((group) => group.rows.length > 0)
  }

  selectStandingType(type: 'sports' | 'socio') {
    this.selectedStandingType = type;
    this.selectedSport = '';
    this.sportSearch = '';
    this.selectedCategory = '';
  }

  categoryOptions(groups: ScheduleGroup[]): string[] {
    return [...new Set(groups.flatMap((group) => group.rows.map((row) => row.category || '-')))].sort(
      (a, b) => a.localeCompare(b)
    );
  }

  clearFilters() {
    this.sportSearch = '';
    this.selectedSport = '';
    this.selectedCategory = '';
  }

  trackRow(_index: number, row: any) {
    return (
      row.id ||
      row.game + '|' + row.sport + '|' + row.category + '|' + row.event
    );
  }

  trackGroup(_index: number, group: ScheduleGroup) {
    return group.sport;
  }
}
