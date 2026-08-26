import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-card">
      <div class="event-header">
        <div class="event-icon">📅</div>
        <div class="event-meta">
          <h4 class="event-title">{{ event.title }}</h4>
          <span class="event-creator" *ngIf="event.createdByName">by {{ event.createdByName }}</span>
        </div>
        <button
          class="btn btn-sm"
          [class]="joined ? 'btn-outline' : 'btn-primary'"
          [disabled]="joined || joining || hideJoin"
          (click)="onJoin.emit(event)"
          *ngIf="showJoin">
          {{ joining ? '...' : (joined ? 'Joined' : 'Join') }}
        </button>
      </div>
      <p class="event-desc">{{ event.description }}</p>
      <div class="event-footer">
        <span class="event-detail">📍 {{ event.location }}</span>
        <span class="event-detail">🗓️ {{ event.date }}</span>
      </div>
    </div>
  `,
  styles: [`
    .event-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 16px;
      transition: box-shadow var(--transition);
    }

    .event-card:hover {
      box-shadow: var(--shadow);
    }

    .event-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }

    .event-icon {
      font-size: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .event-meta { flex: 1; min-width: 0; }

    .event-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .event-creator {
      font-size: 11px;
      color: var(--text-muted);
    }

    .event-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 10px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .event-footer {
      display: flex;
      gap: 16px;
    }

    .event-detail {
      font-size: 12px;
      color: var(--text-muted);
    }
  `]
})
export class EventCardComponent {
  @Input() event: any;
  @Input() showJoin = true;
  @Input() hideJoin = false;
  @Input() joined = false;
  @Input() joining = false;
  @Output() onJoin = new EventEmitter<any>();
}
