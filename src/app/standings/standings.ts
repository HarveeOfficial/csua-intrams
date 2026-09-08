import { Component, inject, signal } from '@angular/core';
import { ICollege } from '../admin/colleges/colleges';
import { Observable } from 'rxjs';
import { DataApi } from '../data-api.service';
import { CollapsibleCategories } from './collapsible-categories/collapsible-categories';
import { MedalStandings } from './medal-standings/medal-standings';
import { PointsBasedRanking } from './points-based-ranking/points-based-ranking';
export interface IMedal {
  silver: number;
  gold: number;
  bronze: number;
  name: string;
  id: string;
}
@Component({
  selector: 'app-standings',
  imports: [CollapsibleCategories, MedalStandings, PointsBasedRanking],
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

  ngOnInit(): void {
    this.getColleges().subscribe((colleges) => this.colleges.set(colleges));
    this.api.getOfficialResult().subscribe((result) => this.isOfficial.set(result.isOfficial));
  }

  getColleges(): Observable<ICollege[]> {
    return this.api.getColleges();
  }
}
