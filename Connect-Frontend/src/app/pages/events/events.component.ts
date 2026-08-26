import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCardComponent],
  template: `
    <div class="events-layout">
      <!-- Create Event Form (CLUB_HEAD only) -->
      <div class="card mb-16" *ngIf="auth.getRole() === 'CLUB_HEAD'">
        <div class="card-header">➕ Create Event</div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Title</label>
              <input class="form-control" [(ngModel)]="newEvent.title" placeholder="Event title">
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Location</label>
              <input class="form-control" [(ngModel)]="newEvent.location" placeholder="Event location">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" [(ngModel)]="newEvent.description" placeholder="Event description" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Date</label>
              <input class="form-control" type="date" [(ngModel)]="newEvent.date">
            </div>
            <div class="form-group flex-1" style="display:flex; align-items:flex-end;">
              <button class="btn btn-primary" (click)="createEvent()" [disabled]="creating">
                {{ creating ? 'Creating...' : 'Create Event' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progressive Skeleton Events Grid -->
      <div class="events-grid" *ngIf="loading">
        <div class="card skeleton-card" *ngFor="let i of [1, 2, 3]" style="height: 180px;">
          <div class="skeleton skeleton-text" style="width: 60%; height: 20px; margin-bottom: 12px;"></div>
          <div class="skeleton skeleton-text" style="width: 40%; margin-bottom: 16px;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 75%;"></div>
        </div>
      </div>

      <!-- Live Events Grid -->
      <div class="events-grid" *ngIf="!loading">
        <app-event-card
          *ngFor="let event of events"
          [event]="event"
          [showJoin]="auth.getRole() === 'STUDENT'"
          [joined]="joinedEvents.has(event.id)"
          [joining]="joiningEvent === event.id"
          (onJoin)="joinEvent($event)">
        </app-event-card>
        <div class="empty-state" *ngIf="events.length === 0">
          <div class="empty-icon">📅</div>
          <h3>No events found</h3>
          <p>Check back later for new events</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-row {
      display: flex;
      gap: 12px;
    }

    .events-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `]
})
export class EventsComponent {
  events: any[] = [];
  loading = true;
  creating = false;
  joinedEvents = new Set<number>();
  joiningEvent: number | null = null;
  newEvent = { title: '', description: '', date: '', location: '' };

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.api.getEvents(0, 50, 'date', 'desc').subscribe({
      next: (res: any) => {
        this.events = res.content || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  createEvent(): void {
    if (!this.newEvent.title || !this.newEvent.date) {
      this.toast.error('Title and date are required');
      return;
    }
    this.creating = true;
    this.api.createEvent(this.auth.getUserId(), this.newEvent).subscribe({
      next: () => {
        this.toast.success('Event created!');
        this.newEvent = { title: '', description: '', date: '', location: '' };
        this.creating = false;
        this.loadEvents();
      },
      error: (err: any) => {
        this.creating = false;
        this.toast.error(err.error?.message || 'Failed to create event');
      }
    });
  }

  joinEvent(event: any): void {
    this.joiningEvent = event.id;
    this.api.requestToJoin(event.id, this.auth.getUserId()).subscribe({
      next: () => {
        this.joinedEvents.add(event.id);
        this.joiningEvent = null;
        this.toast.success('Join request sent!');
      },
      error: (err: any) => {
        this.joiningEvent = null;
        this.toast.error(err.error?.message || 'Failed to send request');
      }
    });
  }
}
