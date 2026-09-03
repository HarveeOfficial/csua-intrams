import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { DataApi, IStandingEvent } from '../../data-api.service';

export interface ISport {
  id: number;
  name: string;
  slug: string;
  playerCount: number;
}

const sportPlayerDefaults: Record<string, number> = {
  'badminton doubles': 2,
  'badminton singles': 1,
  basketball: 5,
  volleyball: 6,
  swimming: 1,
  'track and field': 1,
};

@Component({
  selector: 'app-sports',
  imports: [CommonModule],
  templateUrl: './sports.html',
  styleUrl: './sports.css',
})
export class Sports {
  private api = inject(DataApi);

  sports = signal<ISport[]>([]);
  standingEvents = signal<IStandingEvent[]>([]);
  users = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  activeTab = signal<'sports' | 'users'>('sports');
  newSportName = signal<string>('');
  newStandingType = signal<'sports' | 'socio'>('sports');
  newSportPlayerCount = signal<number>(1);
  newUserName = signal<string>('');
  newUserEmail = signal<string>('');
  newUserPassword = signal<string>('');
  newUserSportSearch = signal<string>('');
  newUserSocioSearch = signal<string>('');
  selectedSportIds = signal<number[]>([]);
  selectedSocioEventIds = signal<number[]>([]);
  editingId = signal<number | null>(null);
  editingName = signal<string>('');
  editingPlayerCount = signal<number>(1);
  editingSocioEventId = signal<number | null>(null);
  editingSocioEventName = signal<string>('');
  editingUserId = signal<number | null>(null);
  editingUserName = signal<string>('');
  editingUserEmail = signal<string>('');
  editingUserPassword = signal<string>('');
  editingUserSportIds = signal<number[]>([]);
  editingUserSocioEventIds = signal<number[]>([]);
  editingUserSportSearch = signal<string>('');
  editingUserSocioSearch = signal<string>('');

  createdUser = signal<{ name: string; email: string; password: string; sportNames: string[] } | null>(null);

  ngOnInit(): void {
    this.load();
    this.loadStandingEvents();
    this.loadUsers();
  }

  private loadStandingEvents() {
    this.api.getStandingEvents().subscribe({
      next: (events) => this.standingEvents.set(events.filter((event) => event.standingType === 'socio')),
      error: (err) => this.error.set(err?.error?.message || 'Failed to load socio events'),
    });
  }

  private load() {
    this.loading.set(true);
    this.api.getSports().subscribe({
      next: (sports) => {
        this.sports.set(sports);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load sports');
        this.loading.set(false);
      },
    });
  }

  private loadUsers() {
    this.api.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (err) => this.error.set(err?.error?.message || 'Failed to load users'),
    });
  }

  private resolvePlayerCount(name: string, fallback: number): number {
    const normalized = name.trim().toLowerCase();
    const explicitCount = Number.isFinite(fallback) && fallback > 0 ? fallback : 0;
    if (explicitCount > 0) return explicitCount;

    const mapped = sportPlayerDefaults[normalized];
    if (mapped) return mapped;
    return 1;
  }

  async addSport() {
    const name = this.newSportName().trim();
    if (this.newStandingType() === 'socio') {
      if (!name) return;
      try {
        this.saving.set(true);
        this.error.set(null);
        await firstValueFrom(this.api.createStandingEvent(name, 'socio'));
        this.newSportName.set('');
        this.loadStandingEvents();
      } catch (e: any) {
        this.error.set(e?.error?.message || 'Failed to add socio event');
      } finally {
        this.saving.set(false);
      }
      return;
    }

    const playerCount = this.resolvePlayerCount(
      name,
      Number(this.newSportPlayerCount()) || 1
    );
    if (!name) return;
    try {
      this.saving.set(true);
      this.error.set(null);
      await firstValueFrom(this.api.createSport(name, playerCount));
      this.newSportName.set('');
      this.newSportPlayerCount.set(1);
      this.load();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to add sport');
    } finally {
      this.saving.set(false);
    }
  }

  canCreateUser = () => Boolean(
    this.newUserName().trim() &&
    this.newUserEmail().trim() &&
    this.newUserPassword().length >= 8 &&
    (this.selectedSportIds().length > 0 || this.selectedSocioEventIds().length > 0)
  );

  toggleSport(sportId: number, checked: boolean) {
    const selected = new Set(this.selectedSportIds());
    if (checked) selected.add(sportId);
    else selected.delete(sportId);
    this.selectedSportIds.set([...selected]);
  }

  toggleSocioEvent(eventId: number, checked: boolean) {
    const selected = new Set(this.selectedSocioEventIds());
    if (checked) selected.add(eventId);
    else selected.delete(eventId);
    this.selectedSocioEventIds.set([...selected]);
  }

  filteredSports(search: string, editingUserId: number | null = null): ISport[] {
    const query = search.trim().toLowerCase();
    const assignedToOtherUser = new Set(
      this.users()
        .filter((user) => user.id !== editingUserId)
        .flatMap((user) => user.sportIds || [])
    );

    return this.sports().filter((sport) =>
      !assignedToOtherUser.has(sport.id) &&
      (!query || sport.name.toLowerCase().includes(query))
    );
  }

  filteredSocioEvents(search: string, editingUserId: number | null = null): IStandingEvent[] {
    const query = search.trim().toLowerCase();
    const assignedToOtherUser = new Set(
      this.users()
        .filter((user) => user.id !== editingUserId)
        .flatMap((user) => user.socioEventIds || [])
    );

    return this.standingEvents().filter((event) =>
      !assignedToOtherUser.has(event.id) &&
      (!query || event.name.toLowerCase().includes(query))
    );
  }

  async createUser() {
    const sportIds = this.selectedSportIds();
    const socioEventIds = this.selectedSocioEventIds();
    if ((!sportIds.length && !socioEventIds.length) || !this.canCreateUser()) return;
    try {
      this.saving.set(true);
      this.error.set(null);
      const user = await firstValueFrom(this.api.createUser(
        this.newUserName().trim(),
        this.newUserEmail().trim(),
        this.newUserPassword(),
        sportIds,
        socioEventIds,
      ));
      this.createdUser.set({
        name: user.name,
        email: user.email,
        password: user.password || '',
        sportNames: user.sportNames,
      });
      this.newUserName.set('');
      this.newUserEmail.set('');
      this.newUserPassword.set('');
      this.newUserSocioSearch.set('');
        this.selectedSportIds.set([]);
        this.selectedSocioEventIds.set([]);
      this.loadUsers();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to create user');
    } finally {
      this.saving.set(false);
    }
  }

  startUserEdit(user: any) {
    this.editingUserId.set(user.id);
    this.editingUserName.set(user.name);
    this.editingUserEmail.set(user.email);
    this.editingUserPassword.set('');
    this.editingUserSportIds.set([...(user.sportIds || [])]);
    this.editingUserSocioEventIds.set([...(user.socioEventIds || [])]);
    this.editingUserSportSearch.set('');
    this.editingUserSocioSearch.set('');
  }

  cancelUserEdit() {
    this.editingUserId.set(null);
    this.editingUserName.set('');
    this.editingUserEmail.set('');
    this.editingUserPassword.set('');
    this.editingUserSportIds.set([]);
    this.editingUserSocioEventIds.set([]);
    this.editingUserSportSearch.set('');
    this.editingUserSocioSearch.set('');
  }

  toggleEditingUserSport(sportId: number, checked: boolean) {
    const ids = new Set(this.editingUserSportIds());
    if (checked) ids.add(sportId);
    else ids.delete(sportId);
    this.editingUserSportIds.set([...ids]);
  }

  toggleEditingUserSocioEvent(eventId: number, checked: boolean) {
    const ids = new Set(this.editingUserSocioEventIds());
    if (checked) ids.add(eventId);
    else ids.delete(eventId);
    this.editingUserSocioEventIds.set([...ids]);
  }

  async saveUserEdit(user: any) {
    const name = this.editingUserName().trim();
    const email = this.editingUserEmail().trim();
    const sportIds = this.editingUserSportIds();
    const socioEventIds = this.editingUserSocioEventIds();
    if (!name || !email) return;
    try {
      this.saving.set(true);
      this.error.set(null);
      await firstValueFrom(this.api.updateUser(user.id, name, email, this.editingUserPassword(), sportIds, socioEventIds));
      this.cancelUserEdit();
      this.loadUsers();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to update user');
    } finally {
      this.saving.set(false);
    }
  }

  startEdit(sport: ISport) {
    this.editingId.set(sport.id);
    this.editingName.set(sport.name);
    this.editingPlayerCount.set(Number(sport.playerCount) || 1);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editingName.set('');
    this.editingPlayerCount.set(1);
  }

  async saveEdit(sport: ISport) {
    const name = this.editingName().trim();
    const playerCount = this.resolvePlayerCount(
      name,
      Number(this.editingPlayerCount()) || 1
    );
    if (!name) return;
    try {
      this.saving.set(true);
      this.error.set(null);
      await firstValueFrom(this.api.updateSport(sport.id, name, playerCount));
      this.cancelEdit();
      this.load();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to update sport');
    } finally {
      this.saving.set(false);
    }
  }

  startSocioEdit(event: IStandingEvent) {
    this.editingSocioEventId.set(event.id);
    this.editingSocioEventName.set(event.name);
  }

  cancelSocioEdit() {
    this.editingSocioEventId.set(null);
    this.editingSocioEventName.set('');
  }

  async saveSocioEdit(event: IStandingEvent) {
    const name = this.editingSocioEventName().trim();
    if (!name) return;
    try {
      this.saving.set(true);
      this.error.set(null);
      await firstValueFrom(this.api.updateStandingEvent(event.id, name));
      this.cancelSocioEdit();
      this.loadStandingEvents();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to update socio event');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteSocioEvent(event: IStandingEvent) {
    if (!confirm(`Delete socio event: ${event.name}?`)) return;
    try {
      this.saving.set(true);
      this.error.set(null);
      await firstValueFrom(this.api.deleteStandingEvent(event.id));
      this.loadStandingEvents();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to delete socio event');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteSport(sport: ISport) {
    if (!confirm(`Delete sport: ${sport.name}?`)) return;
    try {
      this.saving.set(true);
      this.error.set(null);
      await firstValueFrom(this.api.deleteSport(sport.id));
      this.load();
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to delete sport');
    } finally {
      this.saving.set(false);
    }
  }
}
