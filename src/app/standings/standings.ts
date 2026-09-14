import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ICollege } from '../admin/colleges/colleges';
import { Observable } from 'rxjs';
import { DataApi, IOverallChampion, IOverallChampions } from '../data-api.service';
import { MedalStandings } from './medal-standings/medal-standings';
import { PointsBasedRanking } from './points-based-ranking/points-based-ranking';
import { medalFromWeightedEventPoints } from '../scoring';
export interface IMedal {
  silver: number;
  gold: number;
  bronze: number;
  name: string;
  id: string;
}

interface EventWinner {
  event: string;
  gold: string[];
  silver: string[];
  bronze: string[];
}
@Component({
  selector: 'app-standings',
  imports: [NgIf, MedalStandings, PointsBasedRanking],
  templateUrl: './standings.html',
  styleUrl: './standings.css',
})
export class Standings {
  private api = inject(DataApi);
  medals = signal<IMedal[]>([]);
  colleges = signal<ICollege[]>([]);
  categoryExpanded = signal<Set<string>>(new Set());
  eventExpanded = signal<Set<string>>(new Set());
  isOfficial = signal(false);
  overallChampions = signal<IOverallChampions | null>(null);

  eventWinners = computed(() => {
    const winners = new Map<string, { gold: string[]; silver: string[]; bronze: string[] }>();
    this.colleges().forEach((college) => {
      Object.entries((college as any).events || {}).forEach(([event, value]: [string, any]) => {
        const standingType = value?.standingType ?? 'sports';
        if (standingType !== 'sports' && standingType !== 'socio') return;
        const playerCount = value?.playerCount > 0 ? value.playerCount : 1;
        const medal = medalFromWeightedEventPoints(value?.points ?? 0, playerCount);
        if (medal === 'none') return;
        const baseEvent = event.replace(/ #\d+$/, '');
        const key = `${standingType}|${baseEvent}`;
        if (!winners.has(key)) winners.set(key, { gold: [], silver: [], bronze: [] });
        winners.get(key)![medal].push(college.name);
      });
    });
    return [...winners.entries()]
      .map(([key, medals]) => {
        const separator = key.indexOf('|');
        return { standingType: key.slice(0, separator), event: key.slice(separator + 1), ...medals };
      })
      .sort((a, b) => a.event.localeCompare(b.event));
  });

  winnersFor(type: 'sports' | 'socio'): EventWinner[] {
    return this.eventWinners().filter((winner) => winner.standingType === type);
  }

  ngOnInit(): void {
    this.getColleges().subscribe((colleges) => this.colleges.set(colleges));
    this.api.getOfficialResult().subscribe((result) => this.isOfficial.set(result.isOfficial));
    this.api.getOverallChampion().subscribe((result) => this.overallChampions.set(result));
  }

  overallChampionFor(type: 'sports' | 'socio'): IOverallChampion | null {
    return this.overallChampions()?.[type] ?? null;
  }

  getColleges(): Observable<ICollege[]> {
    return this.api.getColleges();
  }
}
