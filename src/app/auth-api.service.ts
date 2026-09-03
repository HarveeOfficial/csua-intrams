import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface UserSession {
  id: number;
  email: string;
  role: 'admin' | 'tm';
  sport_id: number | null;
  sport_name: string | null;
  sport_ids: number[];
  sport_names: string[];
  socio_event_ids: number[];
  socio_event_names: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;
  private readonly storageKey = 'csua_intrams_session';
  currentUser = signal<UserSession | null>(this.readSession());

  async login(email: string, password: string, recaptchaToken: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<{ token: string; user: UserSession }>(`${this.baseUrl}/auth/login`, {
        email,
        password,
        recaptcha_token: recaptchaToken,
      })
    );
    localStorage.setItem(this.storageKey, JSON.stringify({ token: response.token, user: response.user }));
    this.currentUser.set(response.user);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.baseUrl}/auth/logout`, {}));
    } finally {
      localStorage.removeItem(this.storageKey);
      this.currentUser.set(null);
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  token(): string | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw).token : null;
  }

  private readSession(): UserSession | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try { return JSON.parse(raw).user as UserSession; }
    catch { localStorage.removeItem(this.storageKey); return null; }
  }
}