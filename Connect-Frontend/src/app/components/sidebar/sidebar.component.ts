import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">🎓</span>
        <span class="logo-text">CampusConnect</span>
      </div>

      <!-- ROLE-SPECIFIC NAVIGATION -->
      <nav class="sidebar-nav">
        <!-- 1. ADMIN NAVIGATION -->
        <ng-container *ngIf="auth.getRole() === 'ADMIN'">
          <div class="nav-section-title">ADMINISTRATION</div>
          <a routerLink="/admin" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/students" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👨‍🎓</span>
            <span>Manage Students</span>
          </a>
          <a routerLink="/events" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📅</span>
            <span>All Events</span>
          </a>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔔</span>
            <span>Notifications</span>
            <span class="nav-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </a>
        </ng-container>

        <!-- 2. CLUB HEAD NAVIGATION -->
        <ng-container *ngIf="auth.getRole() === 'CLUB_HEAD'">
          <div class="nav-section-title">CLUB PORTAL</div>
          <a routerLink="/club-head" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏛️</span>
            <span>Club Dashboard</span>
          </a>
          <a routerLink="/events" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📅</span>
            <span>Browse Events</span>
          </a>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔔</span>
            <span>Notifications</span>
            <span class="nav-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </a>
        </ng-container>

        <!-- 3. STUDENT NAVIGATION -->
        <ng-container *ngIf="auth.getRole() === 'STUDENT'">
          <div class="nav-section-title">STUDENT PORTAL</div>
          <a routerLink="/student" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span>Campus Feed</span>
          </a>
          <a routerLink="/events" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📅</span>
            <span>Browse Events</span>
          </a>
          <a routerLink="/my-events" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🎫</span>
            <span>My RSVPs</span>
          </a>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔔</span>
            <span>Notifications</span>
            <span class="nav-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </a>
        </ng-container>
      </nav>

      <!-- Sidebar Footer / Profile -->
      <div class="sidebar-footer" *ngIf="auth.getUser() as user">
        <div class="user-card">
          <div class="user-avatar" [style.background]="getRoleColor(user.role)">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-role">{{ formatRole(user.role) }}</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .sidebar-logo {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border);
    }

    .logo-icon { font-size: 24px; }
    .logo-text { font-size: 16px; font-weight: 700; color: var(--text); }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      padding: 12px 12px 6px;
      text-transform: uppercase;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      transition: all var(--transition);
      position: relative;
    }

    .nav-item:hover {
      background: var(--bg);
      color: var(--text);
    }

    .nav-item.active {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 600;
    }

    .nav-icon { font-size: 16px; width: 20px; text-align: center; }

    .nav-badge {
      margin-left: auto;
      background: var(--danger);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .user-name { font-size: 13px; font-weight: 600; }
    .user-role { font-size: 11px; color: var(--text-muted); }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private pollingTimer: any = null;
  private isFetching = false;

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.loadUnreadCount();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollingTimer = setInterval(() => this.loadUnreadCount(), 30000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  loadUnreadCount(): void {
    if (!this.auth.isLoggedIn() || this.isFetching) return;
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.isFetching = true;
    this.api.getUnreadCount(userId).subscribe({
      next: count => {
        this.unreadCount = count;
        this.isFetching = false;
      },
      error: () => {
        this.isFetching = false;
      }
    });
  }

  getRoleColor(role: string): string {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') return '#ef4444';
    if (r === 'CLUB_HEAD' || r === 'CLUB') return '#4f46e5';
    return '#22c55e';
  }

  formatRole(role: string): string {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') return 'Administrator';
    if (r === 'CLUB_HEAD' || r === 'CLUB') return 'Club Head';
    return 'Student';
  }
}
