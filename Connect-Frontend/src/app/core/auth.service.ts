import { Injectable } from '@angular/core';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLUB_HEAD' | 'STUDENT' | string;
  token?: string;
  studentId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'cc_current_user';

  login(user: CurrentUser): void {
    let normalizedRole = (user.role || 'STUDENT').toUpperCase();
    if (normalizedRole === 'CLUB') {
      normalizedRole = 'CLUB_HEAD';
    }
    const normalizedUser = {
      ...user,
      role: normalizedRole
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalizedUser));
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getUser(): CurrentUser | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;
    try {
      const u = JSON.parse(data);
      if (u.role === 'CLUB') {
        u.role = 'CLUB_HEAD';
      }
      return u;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const user = this.getUser();
    return user !== null && typeof user.token === 'string' && user.token.length > 10;
  }

  getUserId(): number {
    return this.getUser()?.id ?? 0;
  }

  getRole(): string {
    const r = (this.getUser()?.role || '').toUpperCase();
    return r === 'CLUB' ? 'CLUB_HEAD' : r;
  }

  getToken(): string {
    return this.getUser()?.token ?? '';
  }

  getRedirectUrl(): string {
    const role = this.getRole();
    if (role === 'ADMIN') return '/admin';
    if (role === 'CLUB_HEAD') return '/club-head';
    return '/student';
  }
}
