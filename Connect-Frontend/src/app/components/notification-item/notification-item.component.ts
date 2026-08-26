import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-item" [class.unread]="!isRead(notification)">
      <div class="notif-dot" *ngIf="!isRead(notification)"></div>
      <div class="notif-body">
        <p class="notif-message">{{ notification.message }}</p>
        <span class="notif-time">{{ formatTime(notification.createdAt) }}</span>
      </div>
      <button
        class="btn btn-ghost btn-sm"
        *ngIf="!isRead(notification)"
        (click)="onMarkRead.emit(notification)">
        Mark read
      </button>
    </div>
  `,
  styles: [`
    .notif-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      transition: background var(--transition);
    }

    .notif-item.unread {
      background: var(--primary-light);
    }

    .notif-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      flex-shrink: 0;
    }

    .notif-body { flex: 1; min-width: 0; }

    .notif-message {
      font-size: 13px;
      color: var(--text);
      margin: 0 0 2px;
    }

    .notif-time {
      font-size: 11px;
      color: var(--text-muted);
    }
  `]
})
export class NotificationItemComponent {
  @Input() notification: any;
  @Output() onMarkRead = new EventEmitter<any>();

  isRead(n: any): boolean {
    if (!n) return true;
    return n.read === true || n.isRead === true;
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  }
}
