import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, EventCardComponent],
  template: `
    <div class="dashboard-grid">
      <div class="main-feed">
        <!-- Post Input -->
        <div class="card mb-16">
          <div class="card-body">
            <div class="post-input-row">
              <div class="post-avatar">{{ getUserInitial() }}</div>
              <textarea
                class="form-control post-input"
                placeholder="What's happening on campus?"
                [(ngModel)]="newPostContent"
                rows="2"></textarea>
            </div>
            <div class="post-actions">
              <button class="btn btn-primary btn-sm" (click)="createPost()" [disabled]="!newPostContent.trim()">
                Post
              </button>
            </div>
          </div>
        </div>

        <!-- Events Feed -->
        <div class="feed-label mb-8">
          <h3>Upcoming Events</h3>
        </div>

        <div class="loading-center" *ngIf="loading">
          <div class="spinner spinner-lg"></div>
        </div>

        <div class="card mb-16" *ngIf="apiError" style="border-left: 3px solid var(--warning); padding: 16px;">
          <p style="font-size:13px; margin:0;"><strong>⚠️ Cannot reach backend.</strong> Make sure Spring Boot is running on port 8080 and has been restarted after CORS changes.</p>
        </div>

        <div class="event-feed" *ngIf="!loading">
          <app-event-card
            *ngFor="let event of events"
            [event]="event"
            [showJoin]="auth.getRole() === 'STUDENT'"
            [joined]="joinedEvents.has(event.id)"
            [joining]="joiningEvent === event.id"
            (onJoin)="joinEvent($event)">
          </app-event-card>
          <div class="empty-state" *ngIf="events.length === 0 && !apiError">
            <div class="empty-icon">📅</div>
            <h3>No events yet</h3>
            <p>Events will appear here once clubs create them</p>
          </div>
        </div>

        <!-- Posts Feed -->
        <div class="feed-label mb-8 mt-16" *ngIf="posts.length > 0">
          <h3>Campus Feed</h3>
        </div>
        <div class="post-feed" *ngIf="posts.length > 0">
          <div class="card mb-8" *ngFor="let post of posts">
            <div class="card-body">
              <p style="font-size:13px; margin-bottom:8px;">{{ post.content }}</p>
              <div class="flex items-center gap-12">
                <span class="text-muted" style="font-size:12px;">❤️ {{ post.likeCount }}</span>
                <span class="text-muted" style="font-size:12px;">💬 {{ post.commentCount }}</span>
                <button class="btn btn-ghost btn-sm" (click)="likePost(post)">Like</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="right-sidebar">
        <div class="card mb-16">
          <div class="card-header">📊 Campus Stats</div>
          <div class="card-body">
            <div class="stat-row">
              <span class="stat-row-label">Total Events</span>
              <span class="stat-row-value">{{ events.length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Posts Today</span>
              <span class="stat-row-value">{{ posts.length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Your Role</span>
              <span class="stat-row-value">{{ auth.getRole() }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">🔔 Quick Actions</div>
          <div class="card-body" style="display:flex; flex-direction:column; gap:6px;">
            <a class="btn btn-outline btn-sm btn-block" href="/events">Browse Events</a>
            <a class="btn btn-outline btn-sm btn-block" href="/notifications">Notifications</a>
            <a class="btn btn-outline btn-sm btn-block" href="/students">Student Directory</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 24px;
    }

    .post-input-row {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
    }

    .post-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .post-input {
      min-height: 60px;
      resize: none;
    }

    .post-actions {
      display: flex;
      justify-content: flex-end;
    }

    .feed-label h3 {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .event-feed {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }

    .stat-row-label { color: var(--text-secondary); }
    .stat-row-value { font-weight: 600; }

    @media (max-width: 900px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .right-sidebar { display: none; }
    }
  `]
})
export class DashboardComponent {
  events: any[] = [];
  posts: any[] = [];
  loading = true;
  apiError = false;
  newPostContent = '';
  joinedEvents = new Set<number>();
  joiningEvent: number | null = null;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.auth.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.apiError = false;
    this.loading = true;

    // Safety timeout to guarantee spinner stops immediately
    const timer = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
      }
    }, 1500);

    this.api.getEvents(0, 10, 'date', 'desc').subscribe({
      next: (res: any) => {
        clearTimeout(timer);
        this.events = res.content || [];
        this.loading = false;
      },
      error: () => {
        clearTimeout(timer);
        this.loading = false;
        this.apiError = false;
      }
    });

    this.api.getFeed().subscribe({
      next: posts => this.posts = posts || [],
      error: () => {}
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

  createPost(): void {
    if (!this.newPostContent.trim()) return;
    this.api.createPost({
      content: this.newPostContent,
      userId: this.auth.getUserId()
    }).subscribe({
      next: () => {
        this.newPostContent = '';
        this.toast.success('Post created!');
        this.loadData();
      },
      error: () => this.toast.error('Failed to create post')
    });
  }

  likePost(post: any): void {
    this.api.likePost(post.id, this.auth.getUserId()).subscribe({
      next: () => { post.likeCount++; this.toast.success('Liked!'); },
      error: (err: any) => this.toast.error(err.error?.message || 'Already liked')
    });
  }

  getUserInitial(): string {
    return this.auth.getUser()?.name?.charAt(0)?.toUpperCase() || '?';
  }
}
