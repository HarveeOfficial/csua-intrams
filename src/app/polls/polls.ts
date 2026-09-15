import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataApi, IPoll } from '../data-api.service';

const VOTER_ID_KEY = 'csua-intrams-voter-id';
const VOTED_POLLS_KEY = 'csua-intrams-voted-polls';
const VOTE_SELECTIONS_KEY = 'csua-intrams-vote-selections';

@Component({
  selector: 'app-polls',
  imports: [CommonModule],
  templateUrl: './polls.html',
  styleUrl: './polls.css',
})
export class Polls {
  private api = inject(DataApi);

  polls = signal<IPoll[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  votingPollId = signal<number | null>(null);
  voteError = signal<string | null>(null);

  ngOnInit(): void {
    this.api.getPolls().subscribe({
      next: (polls) => {
        this.polls.set(polls);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Polls are unavailable right now. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  hasVoted(pollId: number): boolean {
    return this.votedPollIds().includes(pollId);
  }

  selectedOptionId(pollId: number): number | null {
    const selections = this.voteSelections();
    const saved = selections[String(pollId)];
    return saved ?? null;
  }

  percentage(voteCount: number, totalVotes: number): number {
    if (!totalVotes) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  }

  vote(poll: IPoll, optionId: number): void {
    if (this.votingPollId()) return;

    if (this.hasVoted(poll.id)) {
      if (this.selectedOptionId(poll.id) === optionId) {
        this.removeVote(poll);
      }
      return;
    }

    this.votingPollId.set(poll.id);
    this.voteError.set(null);

    this.api.votePoll(poll.id, optionId, this.getVoterId()).subscribe({
      next: (updated) => {
        this.polls.update((polls) => polls.map((p) => (p.id === updated.id ? updated : p)));
        this.markVoted(poll.id, optionId);
        this.votingPollId.set(null);
      },
      error: (err) => {
        this.voteError.set(err?.error?.message || 'Unable to submit your vote.');
        if (err?.status === 422) {
          this.markVoted(poll.id, optionId);
        }
        this.votingPollId.set(null);
      },
    });
  }

  private removeVote(poll: IPoll): void {
    this.votingPollId.set(poll.id);
    this.voteError.set(null);

    this.api.removeVotePoll(poll.id, this.getVoterId()).subscribe({
      next: (updated) => {
        this.polls.update((polls) => polls.map((p) => (p.id === updated.id ? updated : p)));
        this.clearVote(poll.id);
        this.votingPollId.set(null);
      },
      error: (err) => {
        this.voteError.set(err?.error?.message || 'Unable to remove your vote.');
        this.votingPollId.set(null);
      },
    });
  }

  private votedPollIds(): number[] {
    try {
      return JSON.parse(localStorage.getItem(VOTED_POLLS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private voteSelections(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(VOTE_SELECTIONS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private markVoted(pollId: number, optionId: number): void {
    const ids = new Set(this.votedPollIds());
    ids.add(pollId);
    localStorage.setItem(VOTED_POLLS_KEY, JSON.stringify([...ids]));

    const selections = this.voteSelections();
    selections[String(pollId)] = optionId;
    localStorage.setItem(VOTE_SELECTIONS_KEY, JSON.stringify(selections));
  }

  private clearVote(pollId: number): void {
    const ids = new Set(this.votedPollIds());
    ids.delete(pollId);
    localStorage.setItem(VOTED_POLLS_KEY, JSON.stringify([...ids]));

    const selections = this.voteSelections();
    delete selections[String(pollId)];
    localStorage.setItem(VOTE_SELECTIONS_KEY, JSON.stringify(selections));
  }

  private getVoterId(): string {
    let voterId = localStorage.getItem(VOTER_ID_KEY);
    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem(VOTER_ID_KEY, voterId);
    }
    return voterId;
  }
}
