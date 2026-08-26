import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <h2 class="page-title">{{ getPageTitle() }}</h2>
      </div>
      <div class="topbar-right">
        <div class="user-info" *ngIf="auth.getUser() as user">
          <span class="user-greeting">{{ user.name }}</span>
          <span class="badge" [class]="getRoleBadgeClass(user.role)">{{ formatRole(user.role) }}</span>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-greeting {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }
  `]
})
export class TopbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('admin')) return 'Admin Dashboard';
    if (url.includes('club-head')) return 'Club Organizer Dashboard';
    if (url.includes('student')) return 'Student Campus Feed';
    if (url.includes('my-events')) return 'My Registered Events';
    if (url.includes('events')) return 'Campus Events Directory';
    if (url.includes('notifications')) return 'Notifications';
    if (url.includes('students')) return 'Manage Students';
    return 'CampusConnect';
  }

  formatRole(role: string): string {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') return 'ADMIN';
    if (r === 'CLUB_HEAD' || r === 'CLUB') return 'CLUB_HEAD';
    return 'STUDENT';
  }

  getRoleBadgeClass(role: string): string {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') return 'badge badge-danger';
    if (r === 'CLUB_HEAD' || r === 'CLUB') return 'badge badge-primary';
    return 'badge badge-success';
  }
}
