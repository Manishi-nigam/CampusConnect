import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  template: `
    <div class="loading-center" *ngIf="loading">
      <div class="spinner spinner-lg"></div>
    </div>

    <div *ngIf="!loading">
      <div class="events-list">
        <app-event-card
          *ngFor="let event of events"
          [event]="event"
          [showJoin]="false">
        </app-event-card>
      </div>
      <div class="empty-state" *ngIf="events.length === 0">
        <div class="empty-icon">⭐</div>
        <h3>No events joined yet</h3>
        <p>Join events from the Events page to see them here</p>
      </div>
    </div>
  `,
  styles: [`
    .events-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `]
})
export class MyEventsComponent {
  events: any[] = [];
  loading = true;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.studentId) {
      this.api.getStudentEvents(user.studentId).subscribe({
        next: events => { this.events = events; this.loading = false; },
        error: () => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }
}
