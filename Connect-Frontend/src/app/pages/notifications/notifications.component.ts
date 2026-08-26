import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { NotificationItemComponent } from '../../components/notification-item/notification-item.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NotificationItemComponent],
  template: `
    <div class="notifications-page">
      <div class="notif-header mb-16">
        <div>
          <h2 style="font-size:18px; font-weight:700; margin:0 0 4px; color:#0f172a;">Notifications</h2>
          <span class="badge badge-primary" *ngIf="unreadCount > 0">{{ unreadCount }} unread</span>
        </div>
      </div>

      <!-- Progressive Loading Skeletons -->
      <div class="card" *ngIf="loading" style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; gap: 12px; align-items: center;" *ngFor="let i of [1, 2, 3]">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-text" style="width: 70%;"></div>
            <div class="skeleton skeleton-text" style="width: 40%; height: 10px;"></div>
          </div>
        </div>
      </div>

      <!-- Live Notifications List -->
      <div class="card" *ngIf="!loading && notifications.length > 0">
        <app-notification-item
          *ngFor="let n of notifications"
          [notification]="n"
          (onMarkRead)="markRead($event)">
        </app-notification-item>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && notifications.length === 0">
        <div class="empty-icon">🔔</div>
        <h3>No notifications</h3>
        <p>You're all caught up! Updates regarding events and join requests will appear here.</p>
      </div>
    </div>
  `,
  styles: [`
    .notifications-page {
      max-width: 800px;
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;
  loading = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const userId = this.auth.getUserId() || 1;
    this.loading = true;

    const timer = setTimeout(() => {
      if (this.loading) this.loading = false;
    }, 1500);

    this.api.getNotifications(userId).subscribe({
      next: (n: any[]) => {
        clearTimeout(timer);
        this.notifications = n || [];
        this.unreadCount = this.notifications.filter((x: any) => !x.read && !x.isRead).length;
        this.loading = false;
      },
      error: () => {
        clearTimeout(timer);
        this.notifications = [];
        this.loading = false;
      }
    });
  }

  markRead(notification: any): void {
    this.api.markNotificationRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        notification.isRead = true;
        this.unreadCount = this.notifications.filter((x: any) => !x.read && !x.isRead).length;
        this.toast.success('Marked as read');
      },
      error: () => this.toast.error('Failed to mark as read')
    });
  }
}
