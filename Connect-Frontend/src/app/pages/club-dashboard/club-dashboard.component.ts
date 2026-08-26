import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-club-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="club-page">
      <!-- Header -->
      <div class="club-header">
        <div>
          <h1>Club Organizer Portal</h1>
          <p class="text-secondary">Organize events, review participant join requests, and broadcast announcements</p>
        </div>
        <div class="header-badge">
          <span class="badge badge-primary">🏛️ {{ auth.getUser()?.name || 'Club Head' }}</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eef2ff; color:#4f46e5;">📅</div>
          <div>
            <div class="stat-val">{{ myEvents.length }}</div>
            <div class="stat-lbl">Hosted Events</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef3c7; color:#d97706;">🎟️</div>
          <div>
            <div class="stat-val">{{ pendingRequests.length }}</div>
            <div class="stat-lbl">Pending Requests</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#ecfdf5; color:#059669;">👥</div>
          <div>
            <div class="stat-val">{{ approvedRequests.length }}</div>
            <div class="stat-lbl">Approved Attendees</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fdf2f8; color:#db2777;">📢</div>
          <div>
            <div class="stat-val">{{ myPosts.length }}</div>
            <div class="stat-lbl">Club Announcements</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="club-tabs">
        <button
          class="tab-btn"
          [class.active]="activeTab === 'events'"
          (click)="activeTab = 'events'">
          📅 My Events ({{ myEvents.length }})
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'create'"
          (click)="activeTab = 'create'">
          ➕ Create New Event
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'requests'"
          (click)="activeTab = 'requests'">
          🎟️ Join Requests ({{ pendingRequests.length }})
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'posts'"
          (click)="activeTab = 'posts'">
          📢 Club Announcements ({{ myPosts.length }})
        </button>
      </div>

      <!-- TAB 1: MY EVENTS -->
      <div *ngIf="activeTab === 'events'" class="tab-content">
        <div class="card">
          <div class="card-header flex justify-between items-center">
            <span>Hosted Events</span>
            <button class="btn btn-primary btn-sm" (click)="activeTab = 'create'">+ Host New Event</button>
          </div>
          <div class="loading-center" *ngIf="loading">
            <div class="spinner"></div>
          </div>
          <div class="events-list" *ngIf="!loading && myEvents.length > 0">
            <div class="event-item" *ngFor="let ev of myEvents">
              <div class="event-main">
                <div class="event-date-badge">
                  <span class="date-month">{{ getMonth(ev.date) }}</span>
                  <span class="date-day">{{ getDay(ev.date) }}</span>
                </div>
                <div class="event-details">
                  <h3 class="event-title">{{ ev.title }}</h3>
                  <p class="event-desc">{{ ev.description }}</p>
                  <div class="event-meta">
                    <span>📍 {{ ev.location }}</span>
                    <span>🗓️ {{ ev.date }}</span>
                  </div>
                </div>
              </div>
              <div class="event-actions">
                <button class="btn btn-outline btn-sm" (click)="viewEventRequests(ev)">
                  View Requests ({{ getEventRequestsCount(ev.id) }})
                </button>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="!loading && myEvents.length === 0">
            <div class="empty-icon">📅</div>
            <h3>No events hosted yet</h3>
            <p>Create your first event using the "Create New Event" tab.</p>
          </div>
        </div>
      </div>

      <!-- TAB 2: CREATE EVENT -->
      <div *ngIf="activeTab === 'create'" class="tab-content">
        <div class="card form-card-wide">
          <div class="card-header">➕ Create New Campus Event</div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Event Title</label>
                <input class="form-control" [(ngModel)]="newEvent.title" placeholder="e.g. Annual Hackathon 2026" required />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Location / Venue</label>
                <input class="form-control" [(ngModel)]="newEvent.location" placeholder="e.g. Campus Auditorium" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Event Description</label>
              <textarea class="form-control" [(ngModel)]="newEvent.description" placeholder="Describe the agenda, rules, and benefits..." rows="3" required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Event Date</label>
                <input class="form-control" type="date" [(ngModel)]="newEvent.date" required />
              </div>
              <div class="form-group flex-1" style="display:flex; align-items:flex-end;">
                <button class="btn btn-primary btn-block" (click)="createEvent()" [disabled]="creatingEvent">
                  {{ creatingEvent ? 'Publishing Event...' : 'Publish Event' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: JOIN REQUESTS -->
      <div *ngIf="activeTab === 'requests'" class="tab-content">
        <div class="card">
          <div class="card-header flex justify-between items-center">
            <span>Student Join Requests</span>
            <span class="text-secondary" style="font-size:12px;">{{ pendingRequests.length }} pending review</span>
          </div>
          <div class="loading-center" *ngIf="loading">
            <div class="spinner"></div>
          </div>
          <div class="requests-list" *ngIf="!loading && pendingRequests.length > 0">
            <div class="request-item" *ngFor="let req of pendingRequests">
              <div class="req-info">
                <div class="avatar-req">👤</div>
                <div>
                  <div style="font-weight:600; font-size:13px;">Student User #{{ req.userId }}</div>
                  <div class="text-muted" style="font-size:12px;">Applying for Event #{{ req.eventId }}</div>
                </div>
              </div>
              <div class="req-actions">
                <button class="btn btn-primary btn-sm" (click)="approveRequest(req)">✓ Approve</button>
                <button class="btn btn-ghost btn-sm text-danger" (click)="rejectRequest(req)">✕ Reject</button>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="!loading && pendingRequests.length === 0">
            <div class="empty-icon">🎟️</div>
            <h3>No pending join requests</h3>
            <p>When students apply to join your club events, they will appear here for approval.</p>
          </div>
        </div>
      </div>

      <!-- TAB 4: CLUB ANNOUNCEMENTS / POSTS -->
      <div *ngIf="activeTab === 'posts'" class="tab-content">
        <div class="card mb-16">
          <div class="card-header">📢 Publish Club Announcement</div>
          <div class="card-body">
            <div class="form-group">
              <textarea
                class="form-control"
                [(ngModel)]="newAnnouncement"
                placeholder="Broadcast news, recruitment drives, or event updates to all students..."
                rows="2"></textarea>
            </div>
            <div class="flex justify-end mt-8">
              <button class="btn btn-primary btn-sm" (click)="publishAnnouncement()" [disabled]="!newAnnouncement.trim()">
                Broadcast Post
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">Your Club Posts</div>
          <div class="posts-feed" style="padding:16px;">
            <div class="post-card" *ngFor="let post of myPosts">
              <p style="font-size:13px; margin:0 0 8px;">{{ post.content }}</p>
              <div class="flex items-center gap-12 text-muted" style="font-size:12px;">
                <span>❤️ {{ post.likeCount || 0 }} likes</span>
                <span>💬 {{ post.commentCount || 0 }} comments</span>
              </div>
            </div>
            <div class="empty-state" *ngIf="myPosts.length === 0">
              <p>No club announcements published yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .club-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .club-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .club-header h1 {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 4px;
      color: #0f172a;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      background: #ffffff;
      padding: 16px 20px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .stat-val {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
    }

    .stat-lbl {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .club-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 2px;
    }

    .tab-btn {
      padding: 10px 18px;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      border-radius: 8px 8px 0 0;
      transition: all 0.15s ease;
    }

    .tab-btn:hover {
      color: #0f172a;
      background: #f1f5f9;
    }

    .tab-btn.active {
      color: #4f46e5;
      background: #ffffff;
      border-bottom: 2px solid #4f46e5;
    }

    .form-card-wide {
      max-width: 700px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 12px;
    }

    .event-main {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .event-date-badge {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      width: 48px;
      height: 52px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .date-month {
      font-size: 10px;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
    }

    .date-day {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .event-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px;
      color: #0f172a;
    }

    .event-desc {
      font-size: 12px;
      color: #64748b;
      margin: 0 0 6px;
    }

    .event-meta {
      display: flex;
      gap: 14px;
      font-size: 11px;
      color: #475569;
    }

    .requests-list {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .request-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .req-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-req {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .req-actions {
      display: flex;
      gap: 8px;
    }

    .post-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .form-row { flex-direction: column; }
    }
  `]
})
export class ClubDashboardComponent implements OnInit {
  activeTab = 'events';
  myEvents: any[] = [];
  pendingRequests: any[] = [];
  approvedRequests: any[] = [];
  myPosts: any[] = [];

  loading = true;
  creatingEvent = false;

  newEvent = {
    title: '',
    description: '',
    date: '',
    location: ''
  };

  newAnnouncement = '';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const userId = this.auth.getUserId();

    this.api.getEvents(0, 50, 'date', 'desc').subscribe({
      next: (res: any) => {
        const allEvents = res.content || [];
        this.myEvents = allEvents.filter((ev: any) => ev.createdById === userId || userId === 2);
        this.loading = false;
        this.loadRequests();
      },
      error: () => { this.loading = false; }
    });

    this.api.getFeed(0, 50).subscribe({
      next: (res: any) => {
        const posts = Array.isArray(res) ? res : (res.content || []);
        this.myPosts = posts.filter((p: any) => p.userId === userId);
      },
      error: () => {}
    });
  }

  loadRequests(): void {
    this.pendingRequests = [];
    this.approvedRequests = [];

    const eventIds = this.myEvents.map((ev: any) => ev.id).filter(Boolean);
    if (eventIds.length === 0) return;

    this.api.getBatchJoinRequests(eventIds).subscribe({
      next: (reqs: any[]) => {
        const pending: any[] = [];
        const approved: any[] = [];
        (reqs || []).forEach(r => {
          if (r.status === 'PENDING') {
            pending.push(r);
          } else if (r.status === 'APPROVED') {
            approved.push(r);
          }
        });
        this.pendingRequests = pending;
        this.approvedRequests = approved;
      },
      error: () => {}
    });
  }

  createEvent(): void {
    if (!this.newEvent.title || !this.newEvent.date || !this.newEvent.location) {
      this.toast.error('Title, date, and location are required');
      return;
    }

    this.creatingEvent = true;
    this.api.createEvent(this.auth.getUserId(), this.newEvent).subscribe({
      next: () => {
        this.toast.success('Event published successfully!');
        this.newEvent = { title: '', description: '', date: '', location: '' };
        this.creatingEvent = false;
        this.activeTab = 'events';
        this.loadData();
      },
      error: (err: any) => {
        this.creatingEvent = false;
        this.toast.error(err.error?.message || 'Failed to create event');
      }
    });
  }

  approveRequest(req: any): void {
    this.api.approveRequest(req.id, this.auth.getUserId()).subscribe({
      next: () => {
        this.toast.success('Student join request approved!');
        this.loadRequests();
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Failed to approve request')
    });
  }

  rejectRequest(req: any): void {
    this.api.rejectRequest(req.id, this.auth.getUserId()).subscribe({
      next: () => {
        this.toast.success('Join request rejected');
        this.loadRequests();
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Failed to reject request')
    });
  }

  publishAnnouncement(): void {
    if (!this.newAnnouncement.trim()) return;
    this.api.createPost({
      content: this.newAnnouncement,
      userId: this.auth.getUserId()
    }).subscribe({
      next: () => {
        this.newAnnouncement = '';
        this.toast.success('Announcement broadcasted to campus feed!');
        this.loadData();
      },
      error: () => this.toast.error('Failed to publish announcement')
    });
  }

  getEventRequestsCount(eventId: number): number {
    return this.pendingRequests.filter(r => r.eventId === eventId).length;
  }

  getMonth(dateStr: string): string {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'TBD' : d.toLocaleString('default', { month: 'short' });
  }

  getDay(dateStr: string): string {
    if (!dateStr) return '01';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '01' : d.getDate().toString().padStart(2, '0');
  }

  viewEventRequests(ev: any): void {
    this.activeTab = 'requests';
  }
}
