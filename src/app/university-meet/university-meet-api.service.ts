import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';

export interface UniversityMeetMatchInput {
  game_number: number;
  event_name: string;
  category: 'men' | 'women';
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
}

export interface UniversityMeetMatch {
  id: number;
  gameNumber: number;
  eventName: string;
  category: 'men' | 'women';
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  winnerSide: 'a' | 'b' | null;
  winner: string | null;
  updatedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class UniversityMeetApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/university-meet/matches`;

  list(): Observable<UniversityMeetMatch[]> {
    return this.http.get<UniversityMeetMatch[]>(this.url);
  }

  create(input: UniversityMeetMatchInput): Observable<UniversityMeetMatch> {
    return this.http.post<UniversityMeetMatch>(this.url, input);
  }

  update(id: number, input: UniversityMeetMatchInput): Observable<UniversityMeetMatch> {
    return this.http.put<UniversityMeetMatch>(`${this.url}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
