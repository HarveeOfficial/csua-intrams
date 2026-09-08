import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICollege } from './admin/colleges/colleges';
import { API_BASE_URL } from './api-config';

export interface ScheduleEntry {
  id?: string;
  sport: string;
  category: string;
  event: string | null;
  game: number;
  scheduledAt?: string | null;
  venue?: string | null;
  teams: string[];
  type: 'h2h' | 'multi';
  winner: string | { first: string | null; second: string | null; third: string | null } | null;
  createdAt: number;
  updatedAt?: number;
  standingType?: 'sports' | 'socio';
  eventDefinitionId?: number | null;
  teamManagers?: string[];
}

export interface ISportRecord {
  id: number;
  name: string;
  slug: string;
  playerCount: number;
}

export interface IStandingEvent {
  id: number;
  name: string;
  standingType: 'sports' | 'socio';
  sportId: number | null;
  sportName?: string | null;
}

export interface IUserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  sportIds: number[];
  sportNames: string[];
  password?: string;
  socioEventIds: number[];
  socioEventNames: string[];
}

export interface IDownloadableFile {
  name: string;
  url: string;
  size: number;
  uploadedAt: number;
}

export interface IOfficialResult {
  isOfficial: boolean;
  certifiedBy: string | null;
  certifiedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class DataApi {
  private http = inject(HttpClient);
  private baseUrl = API_BASE_URL;

  getColleges(): Observable<ICollege[]> {
    return this.http.get<ICollege[]>(`${this.baseUrl}/colleges`);
  }

  getCollege(id: string): Observable<ICollege> {
    return this.http.get<ICollege>(`${this.baseUrl}/colleges/${encodeURIComponent(id)}`);
  }

  createCollege(college: Omit<ICollege, 'id'> & { id: string }): Observable<ICollege> {
    return this.http.post<ICollege>(`${this.baseUrl}/colleges`, college);
  }

  updateCollegeEvents(id: string, events: ICollege['events']): Observable<ICollege> {
    return this.http.patch<ICollege>(`${this.baseUrl}/colleges/${encodeURIComponent(id)}`, { events });
  }

  updateCollegeStanding(id: string, event: string, sportId: number | null, playerCount: number, points: number, standingType: 'sports' | 'socio' = 'sports'): Observable<ICollege> {
    return this.http.patch<ICollege>(`${this.baseUrl}/colleges/${encodeURIComponent(id)}/standing`, {
      event,
      sport_id: sportId,
      standing_type: standingType,
      playerCount,
      points,
    });
  }

  deleteCollegeStanding(id: string, event: string, sportId: number | null, standingType: 'sports' | 'socio' = 'sports'): Observable<ICollege> {
    return this.http.delete<ICollege>(`${this.baseUrl}/colleges/${encodeURIComponent(id)}/standing`, {
      body: { event, sport_id: sportId, standing_type: standingType },
    });
  }

  getSchedule(): Observable<ScheduleEntry[]> {
    return this.http.get<ScheduleEntry[]>(`${this.baseUrl}/schedule`);
  }

  createSchedule(entry: Omit<ScheduleEntry, 'id'> & { standing_type?: 'sports' | 'socio'; event_definition_id?: number | null }): Observable<ScheduleEntry> {
    return this.http.post<ScheduleEntry>(`${this.baseUrl}/schedule`, entry);
  }

  updateWinner(id: string, winner: string | { first: string | null; second: string | null; third: string | null } | null): Observable<ScheduleEntry> {
    return this.http.patch<ScheduleEntry>(`${this.baseUrl}/schedule/${encodeURIComponent(id)}`, { winner });
  }

  updateScheduleDetails(id: string, details: { scheduledAt?: string | null; venue?: string | null }): Observable<ScheduleEntry> {
    return this.http.patch<ScheduleEntry>(`${this.baseUrl}/schedule/${encodeURIComponent(id)}`, details);
  }

  deleteSchedule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schedule/${encodeURIComponent(id)}`);
  }

  getSports(): Observable<ISportRecord[]> {
    return this.http.get<ISportRecord[]>(`${this.baseUrl}/sports`);
  }

  getStandingEvents(): Observable<IStandingEvent[]> {
    return this.http.get<IStandingEvent[]>(`${this.baseUrl}/events`);
  }

  createStandingEvent(name: string, standingType: 'sports' | 'socio', sportId: number | null = null): Observable<IStandingEvent> {
    return this.http.post<IStandingEvent>(`${this.baseUrl}/events`, {
      name,
      standing_type: standingType,
      sport_id: sportId,
    });
  }

  updateStandingEvent(id: number, name: string): Observable<IStandingEvent> {
    return this.http.patch<IStandingEvent>(`${this.baseUrl}/events/${id}`, { name });
  }

  deleteStandingEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/events/${id}`);
  }

  createSport(name: string, playerCount: number): Observable<ISportRecord> {
    return this.http.post<ISportRecord>(`${this.baseUrl}/sports`, { name, playerCount });
  }

  createUser(name: string, email: string, password: string, sportIds: number[], socioEventIds: number[]): Observable<IUserRecord> {
    return this.http.post<IUserRecord>(`${this.baseUrl}/users`, { name, email, password, sportIds, socioEventIds });
  }

  getUsers(): Observable<IUserRecord[]> {
    return this.http.get<IUserRecord[]>(`${this.baseUrl}/users`);
  }

  getDownloadableFiles(): Observable<IDownloadableFile[]> {
    return this.http.get<IDownloadableFile[]>(`${this.baseUrl}/downloadable-files`);
  }

  uploadDownloadableFile(file: File): Observable<IDownloadableFile> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<IDownloadableFile>(`${this.baseUrl}/downloadable-files`, body);
  }

  deleteDownloadableFile(name: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/downloadable-files/${encodeURIComponent(name)}`);
  }

  updateUser(id: number, name: string, email: string, password: string, sportIds: number[], socioEventIds: number[]): Observable<IUserRecord> {
    return this.http.patch<IUserRecord>(`${this.baseUrl}/users/${id}`, { name, email, password: password || null, sportIds, socioEventIds });
  }

  updateSport(id: number, name: string, playerCount: number): Observable<ISportRecord> {
    return this.http.patch<ISportRecord>(`${this.baseUrl}/sports/${id}`, { name, playerCount });
  }

  deleteSport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sports/${id}`);
  }

  getOfficialResult(): Observable<IOfficialResult> {
    return this.http.get<IOfficialResult>(`${this.baseUrl}/official-result`);
  }

  updateOfficialResult(isOfficial: boolean): Observable<IOfficialResult> {
    return this.http.patch<IOfficialResult>(`${this.baseUrl}/official-result`, { is_official: isOfficial });
  }
}