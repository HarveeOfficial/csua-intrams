import { Component, computed, input, signal } from '@angular/core';
import { CountAnimDirective } from '../count-anim.directive';
import { ICollege } from '../../admin/colleges/colleges';
import { IMedal } from '../standings';
import { medalFromEventPoints, normalizeEventPoints } from '../../scoring';

@Component({
  selector: 'app-medal-standings',
  imports: [CountAnimDirective],
  templateUrl: './medal-standings.html',
  styleUrl: './medal-standings.css',
})
export class MedalStandings {
  medals = signal<IMedal[]>([]);
  colleges = input<ICollege[]>([]);
  standingType = input<'sports' | 'socio'>('sports');

  rows = computed(() => {
    const medals = this.medals();
    const colleges = this.colleges();
    const zeroEntry = (c: ICollege) => ({
      id: (c as any).id,
      name: c.name,
      photo_url: (c as any).photo_url,
      gold: 0,
      silver: 0,
      bronze: 0,
    });
    let base: {
      id: string;
      name: string;
      gold: number;
      silver: number;
      bronze: number;
      photo_url?: string;
    }[];
    if (medals.length) {
      const medalMap = new Map<
        string,
        {
          id: string;
          name: string;
          gold: number;
          silver: number;
          bronze: number;
          photo_url?: string;
        }
      >();
      medals.forEach((m) =>
        medalMap.set((m as any).id, {
          id: (m as any).id,
          name: (m as any).name,
          gold: m.gold,
          silver: m.silver,
          bronze: m.bronze,
          photo_url: (m as any).photo_url,
        })
      );
      // ensure every college appears
      colleges.forEach((c) => {
        if (!medalMap.has(c.id)) medalMap.set(c.id, zeroEntry(c));
      });
      base = [...medalMap.values()];
    } else {
      // Derive medal counts from college event points (5=gold,3=silver,1=bronze)
      const map: Record<
        string,
        {
          id: string;
          name: string;
          gold: number;
          silver: number;
          bronze: number;
          photo_url?: string;
        }
      > = {};
      colleges.forEach((c) => {
        const events = (c as any).events || ({} as Record<string, any>);
        Object.values(events).forEach((ev: any) => {
          if ((ev?.standingType ?? 'sports') !== this.standingType()) return;
          const pcRaw =
            ev && typeof ev.playerCount === 'number' ? ev.playerCount : 1;
          const playerCount = pcRaw > 0 ? pcRaw : 1;
          const weightedPoints = normalizeEventPoints(ev?.points ?? 0, playerCount);
          const medal = medalFromEventPoints(weightedPoints, playerCount);
          if (!map[c.id]) map[c.id] = zeroEntry(c);
          if (medal === 'gold') map[c.id].gold += playerCount;
          else if (medal === 'silver') map[c.id].silver += playerCount;
          else if (medal === 'bronze') map[c.id].bronze += playerCount;
        });
        if (!map[c.id]) map[c.id] = zeroEntry(c); // include even with no events
      });
      base = Object.values(map);
    }
    return base
      .map((m) => ({ ...m, total: m.gold + m.silver + m.bronze }))
      .sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return a.name.localeCompare(b.name);
      })
      .map((m, i) => ({
        ...m,
        rank: i + 1,
        color: this.colors[i % this.colors.length],
      }));
  });

  private colors = [
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#6366f1',
    '#ec4899',
    '#14b8a6',
    '#8b5cf6',
  ];
}
