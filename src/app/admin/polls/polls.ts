import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DataApi, IPoll } from '../../data-api.service';

@Component({
  selector: 'app-admin-polls',
  imports: [CommonModule, FormsModule],
  templateUrl: './polls.html',
  styleUrl: './polls.css',
})
export class Polls {
  private api = inject(DataApi);

  polls = signal<IPoll[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  newTitle = signal('');
  newDescription = signal('');
  creating = signal(false);

  optionText = signal<Record<number, string>>({});
  optionImage = signal<Record<number, File | null>>({});
  addingOptionTo = signal<number | null>(null);
  busyPollId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.api.getPolls(true).subscribe({
      next: (polls) => {
        this.polls.set(polls);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load polls.');
        this.loading.set(false);
      },
    });
  }

  async createPoll(): Promise<void> {
    const title = this.newTitle().trim();
    if (!title) return;

    try {
      this.creating.set(true);
      this.error.set(null);
      const poll = await firstValueFrom(this.api.createPoll(title, this.newDescription().trim()));
      this.polls.update((polls) => [poll, ...polls]);
      this.newTitle.set('');
      this.newDescription.set('');
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Unable to create poll.');
    } finally {
      this.creating.set(false);
    }
  }

  async toggleActive(poll: IPoll): Promise<void> {
    try {
      this.busyPollId.set(poll.id);
      const updated = await firstValueFrom(this.api.updatePoll(poll.id, { active: !poll.active }));
      this.polls.update((polls) => polls.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Unable to update poll.');
    } finally {
      this.busyPollId.set(null);
    }
  }

  async deletePoll(poll: IPoll): Promise<void> {
    if (!confirm(`Delete poll "${poll.title}"? This removes all its options and votes.`)) return;

    try {
      this.busyPollId.set(poll.id);
      await firstValueFrom(this.api.deletePoll(poll.id));
      this.polls.update((polls) => polls.filter((p) => p.id !== poll.id));
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Unable to delete poll.');
    } finally {
      this.busyPollId.set(null);
    }
  }

  onOptionTextChange(pollId: number, value: string): void {
    this.optionText.update((map) => ({ ...map, [pollId]: value }));
  }

  onOptionImageSelected(pollId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.optionImage.update((map) => ({ ...map, [pollId]: input.files?.[0] ?? null }));
  }

  async addOption(poll: IPoll): Promise<void> {
    const text = (this.optionText()[poll.id] || '').trim();
    if (!text) return;

    try {
      this.addingOptionTo.set(poll.id);
      this.error.set(null);
      const option = await firstValueFrom(
        this.api.addPollOption(poll.id, text, this.optionImage()[poll.id] ?? null)
      );
      this.polls.update((polls) =>
        polls.map((p) => (p.id === poll.id ? { ...p, options: [...p.options, option] } : p))
      );
      this.optionText.update((map) => ({ ...map, [poll.id]: '' }));
      this.optionImage.update((map) => ({ ...map, [poll.id]: null }));
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Unable to add option.');
    } finally {
      this.addingOptionTo.set(null);
    }
  }

  async deleteOption(poll: IPoll, optionId: number): Promise<void> {
    if (!confirm('Delete this option?')) return;

    try {
      this.busyPollId.set(poll.id);
      await firstValueFrom(this.api.deletePollOption(poll.id, optionId));
      this.polls.update((polls) =>
        polls.map((p) =>
          p.id === poll.id ? { ...p, options: p.options.filter((o) => o.id !== optionId) } : p
        )
      );
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Unable to delete option.');
    } finally {
      this.busyPollId.set(null);
    }
  }
}
