import { Component, signal } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, firstValueFrom, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { SchedSeeder } from './sched-seeder/sched-seeder';
import { DataApi } from '../../data-api.service';
import { AuthApi } from '../../auth-api.service';

@Component({
  selector: 'app-admin-event-sched-and-stats',
  imports: [CommonModule, ReactiveFormsModule, SchedSeeder],
  templateUrl: './event-sched-and-stats.html',
  styleUrl: './event-sched-and-stats.css',
})
export class EventSchedAndStats {
  schedule$!: Observable<any[]>;
  filteredSchedule$!: Observable<any[]>;
  colleges$!: Observable<any[]>;
  private colorByAcronym: Record<string, string> = {};
  private scheduleRefresh$ = new BehaviorSubject<void>(undefined);
  private sportFilter$ = new BehaviorSubject<string>('');
  sportOptions = signal<string[]>([]);
  sportFilter = signal<string>('');
  socioEvents = signal<{ id: number; name: string }[]>([]);

  form = new FormGroup({
    standingType: new FormControl<'sports' | 'socio'>('sports', { nonNullable: true }),
    socioEventId: new FormControl<number | null>(null),
    sport: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    category: new FormControl('', { nonNullable: true }),
    event: new FormControl('', { nonNullable: true }), // optional usage
    game: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    scheduledDate: new FormControl('', { nonNullable: true }),
    scheduledTime: new FormControl('', { nonNullable: true }),
    venue: new FormControl('', { nonNullable: true }),
    type: new FormControl<'h2h' | 'multi'>('h2h', { nonNullable: true }),
    teams: new FormArray<FormControl<string>>([
      new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    ]),
  });

  constructor(private api: DataApi, public auth: AuthApi) {
    this.colleges$ = this.api.getColleges().pipe(
      tap((list: any[]) => {
        this.colorByAcronym = {};
        list.forEach((c: any) => {
          const acr = this.acronym(c.name || '').trim();
          if (acr)
            this.colorByAcronym[acr] =
              c.color || this.colorByAcronym[acr] || '';
        });
      })
    );
    this.schedule$ = this.scheduleRefresh$.pipe(
      switchMap(() => this.api.getSchedule()),
      map((rows: any[]) =>
        [...rows].sort((a, b) => {
          return (
            (a.sport || '').localeCompare(b.sport || '') ||
            (a.category || '').localeCompare(b.category || '') ||
            (a.event || '').localeCompare(b.event || '') ||
            (a.game || 0) - (b.game || 0)
          );
        })
      )
    );
    this.api.getSports().subscribe((sports) => {
      const user = this.auth.currentUser();
      const allNames = sports.map((s) => s.name).sort((a, b) => a.localeCompare(b));
      if (user?.role === 'tm') {
        this.sportOptions.set(user.sport_names);
        this.form.get('sport')!.setValue(user.sport_names[0] || '');
      } else {
        this.sportOptions.set(allNames);
      }
    });
    this.api.getStandingEvents().subscribe((events) => {
      this.socioEvents.set(events.map((event) => ({ id: event.id, name: event.name })));
    });
    this.filteredSchedule$ = combineLatest([this.schedule$, this.sportFilter$]).pipe(
      map(([rows, sport]) => (sport ? rows.filter((r) => r.sport === sport) : rows))
    );
  }

  onSportFilterChange(sport: string) {
    this.sportFilter.set(sport);
    this.sportFilter$.next(sport);
  }

  private refreshSchedule() {
    this.scheduleRefresh$.next();
  }

  async updatePlacement(row: any, place: 'first' | 'second' | 'third', value: string) {
    const current = row.winner && typeof row.winner === 'object' ? row.winner : {};
    await this.updateMultiWinner(row, { ...current, [place]: value || null });
  }

  async updateMultiWinner(row: any, winner: { first: string | null; second: string | null; third: string | null }) {
    if (!row?.id) return;
    try {
      await firstValueFrom(this.api.updateWinner(row.id, winner));
    } catch (err) {
      this.reportError('update', err);
      return;
    }
    this.refreshSchedule();
  }

  get teamsArray() {
    return this.form.get('teams') as FormArray<FormControl<string>>;
  }

  addTeamField() {
    // Additional team fields are optional; we'll validate count manually.
    this.teamsArray.push(
      new FormControl('', {
        nonNullable: true,
      })
    );
  }

  removeTeamField(i: number) {
    if (this.teamsArray.length > 2) {
      this.teamsArray.removeAt(i);
    }
  }

  onTypeChange() {
    const type = this.form.get('type')!.value;
    // For head-to-head enforce exactly 2 inputs
    if (type === 'h2h') {
      while (this.teamsArray.length > 2)
        this.teamsArray.removeAt(this.teamsArray.length - 1);
      while (this.teamsArray.length < 2)
        this.teamsArray.push(
          new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
          })
        );
    } else if (type === 'multi') {
      // Ensure at least 3 slots to hint multiple teams
      if (this.teamsArray.length < 3) this.addTeamField();
    }
  }

  async addSchedule() {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const isSocio = raw.standingType === 'socio';
    let teams: string[] = [];
    if (raw.type === 'multi') {
      // Auto-include all colleges (unique, non-empty)
      const colleges = await firstValueFrom(this.colleges$);
      teams = colleges
        .map((c: any) => this.acronym((c.name || '').trim()))
        .filter((v: string) => !!v);
      teams = [...new Set(teams)];
    } else {
      // h2h - take the two selected colleges
      teams = this.teamsArray.controls
        .map((c) => c.value.trim())
        .filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
    }
    if (teams.length < 2) return; // safety
    const payload: any = {
      sport: isSocio ? null : raw.sport.trim(),
      standing_type: raw.standingType,
      event_definition_id: isSocio ? raw.socioEventId : null,
      category: raw.category?.trim() || '-',
      event: raw.event?.trim() || null,
      game: raw.game,
      scheduledAt: this.combineDateTime(raw.scheduledDate, raw.scheduledTime),
      venue: raw.venue?.trim() || null,
      teams,
      winner: null,
      createdAt: Date.now(),
      type: raw.type,
    };
    try {
      await firstValueFrom(this.api.createSchedule(payload));
    } catch (err) {
      this.reportError('add', err);
      return;
    }
    this.refreshSchedule();
    // reset but keep type
    const keepType = raw.type;
    this.form.reset({
    standingType: 'sports',
    socioEventId: null,
      type: keepType,
      sport: '',
      category: '',
      event: '',
      game: null,
      scheduledDate: '',
      scheduledTime: '',
      venue: '',
    });
    // reset teams controls
    while (this.teamsArray.length) this.teamsArray.removeAt(0);
    if (keepType === 'h2h') {
      this.teamsArray.push(
        new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
      this.teamsArray.push(
        new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
    }
  }

  trackRow(_index: number, row: any) {
    return (
      row.id ||
      row.game + '|' + row.sport + '|' + row.category + '|' + row.event
    );
  }

  async updateWinner(row: any, winner: string | null) {
    if (!row?.id) return;
    try {
      await firstValueFrom(this.api.updateWinner(row.id, winner || null));
    } catch (err) {
      this.reportError('update', err);
      return;
    }
    this.refreshSchedule();
  }

  async clearWinner(row: any) {
    await this.updateWinner(row, null);
  }

  async updateScheduleDate(row: any, value: string) {
    if (!row?.id) return;
    const time = row.scheduledAt ? this.toTimeInputValue(row.scheduledAt) : '';
    const scheduledAt = this.combineDateTime(value, time);
    try {
      await firstValueFrom(this.api.updateScheduleDetails(row.id, { scheduledAt }));
    } catch (err) {
      this.reportError('update', err);
      return;
    }
    this.refreshSchedule();
  }

  async updateScheduleTime(row: any, value: string) {
    if (!row?.id) return;
    const date = row.scheduledAt ? this.toDateInputValue(row.scheduledAt) : '';
    const scheduledAt = this.combineDateTime(date, value);
    try {
      await firstValueFrom(this.api.updateScheduleDetails(row.id, { scheduledAt }));
    } catch (err) {
      this.reportError('update', err);
      return;
    }
    this.refreshSchedule();
  }

  async updateScheduleVenue(row: any, value: string) {
    if (!row?.id) return;
    try {
      await firstValueFrom(this.api.updateScheduleDetails(row.id, { venue: value.trim() || null }));
    } catch (err) {
      this.reportError('update', err);
      return;
    }
    this.refreshSchedule();
  }

  combineDateTime(date: string | null | undefined, time: string | null | undefined): string | null {
    if (!date) return null;
    return new Date(`${date}T${time || '00:00'}`).toISOString();
  }

  toDateInputValue(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }

  toTimeInputValue(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toTimeString().slice(0, 5);
  }

  async deleteSchedule(row: any) {
    if (!row?.id) return;
    const ok = confirm(`Delete schedule entry: ${row.sport} G${row.game}?`);
    if (!ok) return;
    try {
      await firstValueFrom(this.api.deleteSchedule(row.id));
    } catch (err) {
      this.reportError('delete', err);
      return;
    }
    this.refreshSchedule();
  }

  private reportError(action: string, err: unknown) {
    const status = (err as any)?.status;
    if (status === 401 || status === 419) {
      alert('Your session has expired. Please log in again.');
      return;
    }
    const message = (err as any)?.error?.message || `Failed to ${action} schedule entry.`;
    alert(message);
  }

  canSubmit(): boolean {
    const standingType = this.form.get('standingType')?.value || 'sports';
    if (standingType === 'socio' && !this.form.get('socioEventId')?.value) return false;
    const sportValid = this.form.get('sport')?.valid;
    const gameValid = this.form.get('game')?.valid;
    if ((standingType === 'sports' && !sportValid) || !gameValid) return false;
    const type = this.form.get('type')?.value || 'h2h';
    if (type === 'multi') {
      // Rely on presence of at least 2 colleges; assume true here (data driven)
      return true;
    }
    const teams = this.teamsArray.controls
      .map((c) => c.value.trim())
      .filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
    return teams.length === 2;
  }

  acronym(raw: string): string {
    if (!raw) return '';
    const stop = new Set(['of', 'the', 'and', 'for', 'in', 'on', 'at', 'de']);
    return raw
      .split(/[_\s]+/)
      .filter((p) => p && !stop.has(p.toLowerCase()))
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  isCollegeSelectable(name: string, index: number): boolean {
    if (!name) return false;
    const target = this.acronym(name).trim();
    const currentValue = this.teamsArray.at(index)?.value?.trim(); // already an acronym
    const chosen = this.teamsArray.controls
      .map((c, i) => (i === index ? null : c.value?.trim()))
      .filter((v): v is string => !!v);
    // Allow if acronym not chosen elsewhere OR it's the current control's value
    return !chosen.includes(target) || currentValue === target;
  }

  colorFor(acronym: string): string {
    return this.colorByAcronym[acronym] || '#475569'; // fallback slate
  }
}
