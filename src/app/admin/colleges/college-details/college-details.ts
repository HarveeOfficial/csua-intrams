import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DataApi } from '../../../data-api.service';
import { AuthApi } from '../../../auth-api.service';
import {
  MEDAL_POINTS,
  medalFromEventPoints,
  normalizeEventPoints,
  type MedalName,
} from '../../../scoring';

interface EventData {
  playerCount: number;
  points: number;
  sportId?: number | null;
  sportName?: string | null;
  standingType?: 'sports' | 'socio';
  eventDefinitionId?: number | null;
}

interface CollegeDoc {
  name: string;
  color: string;
  events: { [key: string]: EventData };
}

interface AddEventOption {
  value: string;
  eventKey: string;
  sportId: number;
  sportName: string;
  playerCount: number;
  label: string;
  standingType?: 'sports' | 'socio';
}

type Medal = MedalName;

@Component({
  selector: 'app-college-details',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './college-details.html',
  styleUrl: './college-details.css',
})
export class CollegeDetails {
  private route = inject(ActivatedRoute);
  private api = inject(DataApi);
  private auth = inject(AuthApi);
  private fb = inject(FormBuilder);

  collegeId = signal<string>('');
  college = signal<CollegeDoc | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  expanded = signal<Set<string>>(new Set());
  newEventKey = signal<string>('');
  newStandingType = signal<'sports' | 'socio'>('sports');
  showAddEventModal = signal<boolean>(false);
  sports = signal<{ id: number; name: string; playerCount: number }[]>([]);
  socioEvents = signal<{ id: number; name: string }[]>([]);
  addEventOptions = signal<AddEventOption[]>([]);

  form = this.fb.group({});

  isAdmin = () => this.auth.currentUser()?.role === 'admin';
  isTm = () => this.auth.currentUser()?.role === 'tm';
  isAssignedSport(event: EventData): boolean {
    const user = this.auth.currentUser();
    if (this.isAdmin()) return true;
    if (event.standingType === 'socio') {
      return !!event.eventDefinitionId && (user?.socio_event_ids || []).includes(event.eventDefinitionId);
    }
    return !!event.sportId && (user?.sport_ids || []).includes(event.sportId);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No college id.');
      return;
    }
    this.collegeId.set(id);
    this.api.getStandingEvents().subscribe({
      next: (events) => {
        this.socioEvents.set(events.map((event) => ({ id: event.id, name: event.name })));
        if (this.isTm() && !this.sports().length && events.length) {
          this.newStandingType.set('socio');
        }
      },
      error: () => this.socioEvents.set([]),
    });
    this.api.getSports().subscribe({
      next: (sports) => {
        this.sports.set(
          sports
            .filter((s) => !!s.name)
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter((s) => this.isAdmin() || (this.auth.currentUser()?.sport_ids || []).includes(s.id))
            .map((s) => ({ id: s.id, name: s.name, playerCount: s.playerCount ?? 1 }))
        );
        if (this.isTm() && !sports.length && this.socioEvents().length) {
          this.newStandingType.set('socio');
        }
        this.refreshAddEventOptions();
      },
      error: () => {
        this.sports.set([]);
        this.addEventOptions.set([]);
      },
    });
    this.api.getSchedule().subscribe({
      next: (rows) => {
        this.refreshAddEventOptions(rows || []);
      },
      error: () => {
        this.refreshAddEventOptions([]);
      },
    });
    this.api.getCollege(id).subscribe({
        next: (data) => {
          this.college.set(data as CollegeDoc);
          // build form controls for each event points
          const events = (data as any).events || {};
          Object.entries(events).forEach(([key, ev]: [string, any]) => {
            this.form.addControl(
              key,
              this.fb.control(ev.points, { nonNullable: true })
            );
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load college');
          this.loading.set(false);
        },
      });
  }

  totalPoints(): number {
    const c = this.college();
    if (!c) return 0;
    return Object.values(c.events || {}).reduce((sum, ev: any) => {
      const playerCount =
        typeof ev?.playerCount === 'number' && ev.playerCount > 0
          ? ev.playerCount
          : 1;
      return sum + normalizeEventPoints(ev?.points ?? 0, playerCount);
    }, 0);
  }

  async setMedal(eventKey: string, medal: Medal) {
    const ctrl = this.form.get(eventKey);
    const current = this.college();
    if (!ctrl || !current) return;
    const playerCount =
      typeof current.events?.[eventKey]?.playerCount === 'number' &&
      current.events[eventKey].playerCount > 0
        ? current.events[eventKey].playerCount
        : 1;

    if (!this.isAdmin()) {
      const sportId = (current.events?.[eventKey] as any)?.sportId;
      const event = current.events[eventKey];
      const isSocio = event.standingType === 'socio';
      if (isSocio) {
        if (!event.eventDefinitionId || !(this.auth.currentUser()?.socio_event_ids || []).includes(event.eventDefinitionId)) return;
      } else if (!sportId || !(this.auth.currentUser()?.sport_ids || []).includes(sportId)) return;
      const points = medal === 'none' ? 0 : normalizeEventPoints(MEDAL_POINTS[medal], playerCount);
      ctrl.setValue(points);
      try {
        this.saving.set(true);
        const updated = await firstValueFrom(
          this.api.updateCollegeStanding(
            this.collegeId(),
            eventKey,
            isSocio ? null : sportId,
            playerCount,
            points,
            isSocio ? 'socio' : 'sports'
          )
        );
        this.college.set(updated as CollegeDoc);
      } catch (e: any) {
        this.error.set(e.error?.message || e.message || 'Failed to save');
      } finally {
        this.saving.set(false);
      }
      return;
    }

    if (medal === 'none') {
      ctrl.setValue(0);
    } else {
      ctrl.setValue(normalizeEventPoints(MEDAL_POINTS[medal], playerCount));
    }
    ctrl.markAsDirty();
    await this.save();
  }

  currentMedal(points: number, playerCount = 1): Medal {
    return medalFromEventPoints(points, playerCount);
  }

  async save() {
    if (!this.form.valid) return;
    const id = this.collegeId();
    const current = this.college();
    if (!current) return;
    const updatedEvents: any = { ...current.events };
    Object.keys(this.form.controls).forEach((k) => {
      if (!updatedEvents[k]) updatedEvents[k] = { playerCount: 0, points: 0 };
      updatedEvents[k].points = this.form.get(k)?.value ?? 0;
    });
    try {
      this.saving.set(true);
      await firstValueFrom(this.api.updateCollegeEvents(id, updatedEvents));
      this.college.set({ ...current, events: updatedEvents });
      this.form.markAsPristine();
    } catch (e: any) {
      this.error.set(e.message || 'Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  // Group events by first word
  groupedEvents(): {
    category: string;
    events: { key: string; data: EventData }[];
  }[] {
    const c = this.college();
    if (!c?.events) return [];
    const groups: Record<string, { key: string; data: EventData }[]> = {};
    Object.entries(c.events).forEach(([key, data]) => {
      if (!this.isAssignedSport(data)) return;
      const category = this.deriveCategory(key);
      const groupKey = category.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push({ key, data });
    });
    return Object.entries(groups)
      .map(([category, events]) => ({
        category: this.deriveCategory(events[0]?.key || category),
        events: [...events].sort((a, b) => a.key.localeCompare(b.key)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  private deriveCategory(key: string): string {
    let base = key.trim();
    base = base.replace(/\s*-\s*(Men|Women|Mixed|Mix|M|W)$/i, '');
    base = base.replace(/[MW]$/, '');
    // Find first digit or parenthesis
    const cutIdx = base.search(/[0-9(]/);
    if (cutIdx !== -1) {
      base = base.slice(0, cutIdx);
    }
    // Trim trailing dash
    base = base.replace(/-$/, '');
    return base || key; // fallback to original if empty
  }

  toggleCategory(cat: string) {
    const set = new Set(this.expanded());
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    this.expanded.set(set);
  }

  isExpanded(cat: string): boolean {
    return this.expanded().has(cat);
  }

  openAddEventModal() {
    this.newEventKey.set('');
    this.newStandingType.set(this.isTm() && !this.sports().length && this.socioEvents().length ? 'socio' : 'sports');
    this.showAddEventModal.set(true);
  }

  closeAddEventModal() {
    this.showAddEventModal.set(false);
    this.newEventKey.set('');
    this.newStandingType.set('sports');
  }

  async addEvent() {
    const selectedValue = this.newEventKey().trim();
    const current = this.college();
    if (!selectedValue || !current) return;

    if (this.newStandingType() === 'socio') {
      if (this.form.get(selectedValue)) return;
      this.form.addControl(selectedValue, this.fb.control(0, { nonNullable: true }));
      this.college.set({
        ...current,
        events: { ...current.events, [selectedValue]: { playerCount: 1, points: 0, standingType: 'socio' } },
      });
      this.closeAddEventModal();
      try {
        this.saving.set(true);
        const updated = await firstValueFrom(
          this.api.updateCollegeStanding(this.collegeId(), selectedValue, null, 1, 0, 'socio')
        );
        this.college.set(updated as CollegeDoc);
      } catch (e: any) {
        this.error.set(e.error?.message || e.message || 'Failed to add standing');
      } finally {
        this.saving.set(false);
      }
      return;
    }

    const selected = this.addEventOptions().find((opt) => opt.value === selectedValue);
    if (!selected) {
      this.error.set('Please select one of your assigned event.');
      return;
    }
    const key = selected.eventKey;
    if (this.form.get(key)) return;

    if (this.isTm()) {
        this.form.addControl(key, this.fb.control(0, { nonNullable: true }));
        this.college.set({
          ...current,
          events: { ...current.events, [key]: { playerCount: selected.playerCount, points: 0, sportId: selected.sportId, sportName: selected.sportName } },
        });
        this.closeAddEventModal();
        try {
          this.saving.set(true);
          const updated = await firstValueFrom(this.api.updateCollegeStanding(this.collegeId(), key, selected.sportId, selected.playerCount, 0));
          this.college.set(updated as CollegeDoc);
        } catch (e: any) {
          this.error.set(e.error?.message || e.message || 'Failed to add standing');
        } finally {
          this.saving.set(false);
        }
        return;
    }

    const playerCount = selected.playerCount > 0 ? selected.playerCount : 1;
    this.form.addControl(key, this.fb.control(0, { nonNullable: true }));
    this.college.set({
      ...current,
      events: { ...current.events, [key]: { playerCount, points: 0 } },
    });
    this.closeAddEventModal();
    await this.save();
  }

  private refreshAddEventOptions(scheduleRows: any[] = []): void {
    const sportList = this.sports();
    if (!sportList.length) {
      this.addEventOptions.set([]);
      return;
    }

    const bySportName = new Map<string, { id: number; name: string; playerCount: number }>();
    sportList.forEach((sport) => bySportName.set((sport.name || '').trim().toLowerCase(), sport));

    const options: AddEventOption[] = [];
    const seen = new Set<string>();

    for (const row of scheduleRows || []) {
      const sportName = String(row?.sport || '').trim();
      if (!sportName) continue;
      const sport = bySportName.get(sportName.toLowerCase());
      if (!sport) continue;

      const eventName = String(row?.event || '').trim();
      const category = this.normalizeCategory(row?.category);
      const eventKey = this.composeEventKey(sport.name, eventName, category);
      const unique = `${sport.id}|${eventKey}`;
      if (seen.has(unique)) continue;
      seen.add(unique);

      const playerCount = sport.playerCount > 0 ? sport.playerCount : 1;
      options.push({
        value: unique,
        eventKey,
        sportId: sport.id,
        sportName: sport.name,
        playerCount,
        label: `${eventKey} (${playerCount} ${playerCount === 1 ? 'player' : 'players'})`,
      });
    }

    if (!options.length) {
      const fallback = sportList.map((sport) => {
        const playerCount = sport.playerCount > 0 ? sport.playerCount : 1;
        const unique = `${sport.id}|${sport.name}`;
        return {
          value: unique,
          eventKey: sport.name,
          sportId: sport.id,
          sportName: sport.name,
          playerCount,
          label: `${sport.name} (${playerCount} ${playerCount === 1 ? 'player' : 'players'})`,
        } satisfies AddEventOption;
      });
      this.addEventOptions.set(fallback);
      return;
    }

    options.sort((a, b) => a.eventKey.localeCompare(b.eventKey));
    this.addEventOptions.set(options);
  }

  private composeEventKey(sportName: string, eventName: string, category: string): string {
    const sport = sportName.trim();
    const event = eventName.trim();
    const cat = category.trim();

    const base = event ? `${sport} (${event})` : sport;
    if (!cat || cat === '-') return base;
    return `${base} - ${cat}`;
  }

  private normalizeCategory(raw: unknown): string {
    const value = String(raw || '').trim();
    if (!value || value === '-') return '-';
    const lower = value.toLowerCase();
    if (lower === 'mix') return 'Mixed';
    if (lower === 'men & women') return 'Mixed';
    if (lower === 'men/women') return 'Mixed';
    if (lower === 'm') return 'Men';
    if (lower === 'w') return 'Women';
    return value;
  }

  async removeEvent(eventKey: string) {
    const current = this.college();
    if (!current?.events?.[eventKey]) return;
    const event = current.events[eventKey];
    if (!this.isAdmin()) {
      if (!this.isAssignedSport(event)) return;
      try {
        this.saving.set(true);
        const updated = await firstValueFrom(this.api.deleteCollegeStanding(this.collegeId(), eventKey, event.sportId ?? null, event.standingType ?? 'sports'));
        this.form.removeControl(eventKey);
        this.college.set(updated as CollegeDoc);
      } catch (e: any) {
        this.error.set(e.error?.message || e.message || 'Failed to delete standing');
      } finally {
        this.saving.set(false);
      }
      return;
    }
    if (!confirm(`Delete the ${eventKey} event from ${current.name}?`)) return;

    const updatedEvents = { ...current.events };
    delete updatedEvents[eventKey];
    this.form.removeControl(eventKey);

    try {
      this.saving.set(true);
      await firstValueFrom(this.api.updateCollegeEvents(this.collegeId(), updatedEvents));
      this.college.set({ ...current, events: updatedEvents });
      this.form.markAsPristine();
    } catch (e: any) {
      this.error.set(e.message || 'Failed to delete event');
    } finally {
      this.saving.set(false);
    }
  }
}
