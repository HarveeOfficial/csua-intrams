import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, RouterLink],
  templateUrl: './colleges.html',
  styleUrl: './colleges.css',
})
export class Colleges {
  private api = inject(DataApi);
  private auth = inject(AuthApi);
  colleges = signal<ICollege[]>([]);
  isAdmin = () => this.auth.currentUser()?.role === 'admin';

  ngOnInit(): void {
    this.getColleges().subscribe((colleges) => {
      this.colleges.set(colleges);
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
