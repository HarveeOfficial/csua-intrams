import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { DataApi } from '../../data-api.service';
import { AuthApi } from '../../auth-api.service';
import { medalFromWeightedEventPoints } from '../../scoring';

export interface ICollege {
  name: string;
  events: { [key: string]: IEvent };
  color: string;
  id: string;
  photo_url?: string; // logo / image URL
}

export interface IEvent {
  playerCount: number;
  points: number;
  standingType?: 'sports' | 'socio';
  sportId?: number | null;
  sportName?: string | null;
}

@Component({
  selector: 'app-colleges',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './colleges.html',
  styleUrl: './colleges.css',
})
export class Colleges {
  private api = inject(DataApi);
  private auth = inject(AuthApi);
  colleges = signal<ICollege[]>([]);
  isAdmin = () => this.auth.currentUser()?.role === 'admin';

  championId = signal<string | null>(null);
  firstRunnerUpId = signal<string | null>(null);
  secondRunnerUpId = signal<string | null>(null);
  savingOverallChampion = signal(false);
  overallChampionSaved = signal(false);

  socioChampionId = signal<string | null>(null);
  socioFirstRunnerUpId = signal<string | null>(null);
  socioSecondRunnerUpId = signal<string | null>(null);
  savingSocioChampion = signal(false);
  socioChampionSaved = signal(false);

  ngOnInit(): void {
    this.getColleges().subscribe((colleges) => {
      this.colleges.set(colleges);
    });
    this.api.getOverallChampion().subscribe((result) => {
      this.championId.set(result.sports.champion?.id ?? null);
      this.firstRunnerUpId.set(result.sports.firstRunnerUp?.id ?? null);
      this.secondRunnerUpId.set(result.sports.secondRunnerUp?.id ?? null);
      this.socioChampionId.set(result.socio.champion?.id ?? null);
      this.socioFirstRunnerUpId.set(result.socio.firstRunnerUp?.id ?? null);
      this.socioSecondRunnerUpId.set(result.socio.secondRunnerUp?.id ?? null);
    });
  }

  saveOverallChampion() {
    this.savingOverallChampion.set(true);
    this.overallChampionSaved.set(false);
    this.api
      .updateOverallChampion('sports', this.championId(), this.firstRunnerUpId(), this.secondRunnerUpId())
      .subscribe({
        next: () => {
          this.savingOverallChampion.set(false);
          this.overallChampionSaved.set(true);
        },
        error: () => {
          this.savingOverallChampion.set(false);
        },
      });
  }

  saveSocioChampion() {
    this.savingSocioChampion.set(true);
    this.socioChampionSaved.set(false);
    this.api
      .updateOverallChampion('socio', this.socioChampionId(), this.socioFirstRunnerUpId(), this.socioSecondRunnerUpId())
      .subscribe({
        next: () => {
          this.savingSocioChampion.set(false);
          this.socioChampionSaved.set(true);
        },
        error: () => {
          this.savingSocioChampion.set(false);
        },
      });
  }

  getColleges(): Observable<ICollege[]> {
    return this.api.getColleges();
  }

  totalPoints(college: ICollege): number {
    if (!college.events) return 0;
    let gold = 0,
      silver = 0,
      bronze = 0;
    Object.values(college.events).forEach((ev) => {
      const pc =
        typeof ev.playerCount === 'number' && ev.playerCount > 0
          ? ev.playerCount
          : 1;
      const weightedPoints = typeof ev.points === 'number' ? ev.points : 0;
      const medal = medalFromWeightedEventPoints(weightedPoints, pc);
      if (medal === 'gold') gold += pc;
      else if (medal === 'silver') silver += pc;
      else if (medal === 'bronze') bronze += pc;
    });
    return gold * 5 + silver * 3 + bronze * 1;
  }

  // Build an acronym from a snake_case id, skipping common stop words (e.g. 'of')
  acronym(id: string): string {
    if (!id) return '';
    const stop = new Set(['of', 'the', 'and', 'for', 'in', 'on', 'at', 'de']);
    return id
      .split(/[_\s]+/)
      .filter((part) => part && !stop.has(part.toLowerCase()))
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}
