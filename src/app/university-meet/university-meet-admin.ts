import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from '../auth-api.service';
import { UniversityMeetApi, UniversityMeetMatch, UniversityMeetMatchInput } from './university-meet-api.service';

function emptyMatch(): UniversityMeetMatchInput {
  return {
    game_number: 1,
    event_name: '',
    category: 'men',
    team_a: '',
    team_b: '',
    planned_games: 10,
    games_won_a: 0,
    games_won_b: 0,
  };
}

@Component({
  selector: 'app-university-meet-admin',
  imports: [FormsModule, RouterLink],
  templateUrl: './university-meet-admin.html',
})
export class UniversityMeetAdmin implements OnInit {
  private readonly api = inject(UniversityMeetApi);
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);

  matches = signal<UniversityMeetMatch[]>([]);
  error = signal('');
  saving = signal(false);
  editingId: number | null = null;
  form = emptyMatch();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.list().subscribe({
      next: (matches) => this.matches.set(matches),
      error: () => this.error.set('Could not load matches.'),
    });
  }

  edit(match: UniversityMeetMatch): void {
    this.editingId = match.id;
    this.form = {
      game_number: match.gameNumber,
      event_name: match.eventName,
      category: match.category,
      team_a: match.teamA,
      team_b: match.teamB,
      planned_games: match.plannedGames,
      games_won_a: match.gamesWonA,
      games_won_b: match.gamesWonB,
    };
    this.error.set('');
  }

  cancel(): void {
    this.editingId = null;
    this.form = emptyMatch();
    this.error.set('');
  }

  async save(): Promise<void> {
    this.error.set('');
    this.saving.set(true);
    const input = {
      ...this.form,
      event_name: this.form.event_name.trim(),
      team_a: this.form.team_a.trim(),
      team_b: this.form.team_b.trim(),
    };

    try {
      if (this.editingId === null) {
        await firstValueFrom(this.api.create(input));
      } else {
        await firstValueFrom(this.api.update(this.editingId, input));
      }
      this.cancel();
      this.load();
    } catch (error: any) {
      const errors = error?.error?.errors;
      this.error.set(errors ? Object.values(errors).flat().join(' ') : (error?.error?.message || 'Could not save match.'));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(match: UniversityMeetMatch): Promise<void> {
    if (!confirm(`Delete game ${match.gameNumber}: ${match.teamA} vs ${match.teamB}?`)) return;
    this.error.set('');
    try {
      await firstValueFrom(this.api.delete(match.id));
      if (this.editingId === match.id) this.cancel();
      this.load();
    } catch {
      this.error.set('Could not delete match.');
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/university-meet']);
  }
}
