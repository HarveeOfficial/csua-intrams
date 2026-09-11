import { Component, computed, input } from '@angular/core';
import { CountAnimDirective } from '../count-anim.directive';
import { ICollege } from '../../admin/colleges/colleges';
import { medalFromWeightedEventPoints } from '../../scoring';

@Component({
  selector: 'app-points-based-ranking',
  imports: [CountAnimDirective],
  templateUrl: './points-based-ranking.html',
  styleUrl: './points-based-ranking.css',
})
export class PointsBasedRanking {
  colleges = input<ICollege[]>([]);
  standingType = input<'sports' | 'socio'>('sports');

  // Overall points-based ranking (sum all event points per college)
  pointsRows = computed(() => {
    const colleges = this.colleges();
    const rows = colleges.map((c) => {
      const events = (c as any).events || ({} as Record<string, any>);
      let gold = 0,
        silver = 0,
        bronze = 0;
      Object.values(events).forEach((ev: any) => {
        if ((ev?.standingType ?? 'sports') !== this.standingType()) return;
        const pcRaw =
          ev && typeof ev.playerCount === 'number' ? ev.playerCount : 1;
        const playerCount = pcRaw > 0 ? pcRaw : 1;
        const p = ev && typeof ev.points === 'number' ? ev.points : 0;
        const weightedPoints = p;
        const medal = medalFromWeightedEventPoints(weightedPoints, playerCount);
        if (medal === 'gold') gold += playerCount;
        else if (medal === 'silver') silver += playerCount;
        else if (medal === 'bronze') bronze += playerCount;
      });
      const points = gold * 5 + silver * 3 + bronze * 1;
      return {
        id: (c as any).id,
        name: c.name,
        points,
        gold,
        silver,
        bronze,
        photo_url: (c as any).photo_url,
      };
    });
    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      if (b.bronze !== a.bronze) return b.bronze - a.bronze;
      return a.name.localeCompare(b.name);
    });
    return rows.map((r, i) => ({
      ...r,
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
