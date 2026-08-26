import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EventCardComponent],
  template: `
    <div class="student-grid">
      <!-- Main Feed Column -->
      <div class="main-column">
        <!-- Create Post Card -->
        <div class="card create-post-card mb-16">
          <div class="create-post-header">
            <div class="avatar-user">{{ getUserInitial() }}</div>
            <textarea
              class="post-input"
              [(ngModel)]="newPostContent"
              placeholder="What's happening on campus? Share projects, ask questions, or discuss..."
              rows="2"></textarea>
          </div>
          <div class="create-post-footer">
            <div class="post-tips">
              <span>💡 Tip: Posts with engagement rank higher on the campus feed!</span>
            </div>
            <button
              class="btn btn-primary btn-sm"
              (click)="createPost()"
              [disabled]="!newPostContent.trim() || creatingPost">
              {{ creatingPost ? 'Publishing...' : 'Share Post' }}
            </button>
          </div>
        </div>

        <!-- Campus Recommendation Feed -->
        <div class="feed-header mb-12">
          <h3>🔥 Recommended Campus Feed</h3>
          <span class="text-secondary" style="font-size:12px;">Ranked by engagement & recency</span>
        </div>

        <!-- Progressive Skeleton Feed Placeholders -->
        <div *ngIf="loadingPosts">
          <div class="card skeleton-card" *ngFor="let i of [1, 2]" style="padding: 16px;">
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
              <div class="skeleton skeleton-avatar"></div>
              <div style="flex: 1;">
                <div class="skeleton skeleton-text" style="width: 35%;"></div>
                <div class="skeleton skeleton-text" style="width: 20%; height: 10px;"></div>
              </div>
            </div>
            <div class="skeleton skeleton-text" style="width: 90%;"></div>
            <div class="skeleton skeleton-text" style="width: 65%;"></div>
          </div>
        </div>

        <div class="posts-stream" *ngIf="!loadingPosts">
          <div class="card post-item-card mb-12" *ngFor="let post of posts">
            <div class="post-item-header">
              <div class="flex items-center gap-10">
                <div class="avatar-post">{{ getInitial(post.createdByName || 'Student') }}</div>
                <div>
                  <div class="post-author">{{ post.createdByName || ('User #' + post.userId) }}</div>
                  <div class="post-time">{{ formatTime(post.createdAt) }}</div>
                </div>
              </div>
              <span class="badge badge-primary" *ngIf="post.score > 0">⚡ Trending ({{ post.score }})</span>
            </div>

            <p class="post-body">{{ post.content }}</p>

            <div class="post-actions-bar">
              <button
                class="btn-action"
                (click)="likePost(post)">
                <span>❤️</span>
                <span>{{ post.likeCount || 0 }} Likes</span>
              </button>

              <button
                class="btn-action"
                (click)="toggleComments(post)">
                <span>💬</span>
                <span>{{ post.commentCount || 0 }} Comments</span>
              </button>
            </div>

            <!-- Comments Section -->
            <div class="comments-container" *ngIf="expandedPosts.has(post.id)">
              <div class="comments-list" *ngIf="postComments[post.id] && postComments[post.id].length > 0">
                <div class="comment-bubble" *ngFor="let c of postComments[post.id]">
                  <div class="comment-author">User #{{ c.userId }}</div>
                  <div class="comment-text">{{ c.content }}</div>
                </div>
              </div>

              <div class="add-comment-row">
                <input
                  class="comment-input"
                  [(ngModel)]="commentDrafts[post.id]"
                  (keyup.enter)="addComment(post)"
                  placeholder="Write a comment..." />
                <button
                  class="btn btn-primary btn-sm"
                  (click)="addComment(post)"
                  [disabled]="!commentDrafts[post.id]?.trim()">
                  Reply
                </button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="posts.length === 0">
            <div class="empty-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Be the first to share what is happening on campus!</p>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: Upcoming Events & Quick Links -->
      <div class="right-column">
        <!-- Quick Stats -->
        <div class="card mb-16">
          <div class="card-header">🎓 Student Profile</div>
          <div class="card-body">
            <div class="user-profile-badge mb-12">
              <div class="avatar-lg">{{ getUserInitial() }}</div>
              <div>
                <div style="font-weight:700; font-size:14px; color:#0f172a;">{{ auth.getUser()?.name }}</div>
                <div class="text-secondary" style="font-size:12px;">{{ auth.getUser()?.email }}</div>
                <span class="badge badge-success" style="margin-top:4px;">Verified Student</span>
              </div>
            </div>
            <div class="divider" style="margin:12px 0;"></div>
            <div class="stat-summary-row">
              <div class="stat-box">
                <div class="stat-num">{{ joinedEvents.size }}</div>
                <div class="stat-txt">Registered Events</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{{ posts.length }}</div>
                <div class="stat-txt">Feed Posts</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommended Events Widget -->
        <div class="card">
          <div class="card-header flex justify-between items-center">
            <span>📅 Upcoming Events</span>
            <a routerLink="/events" style="font-size:12px; font-weight:600; color:#4f46e5;">View All</a>
          </div>
          <div class="card-body" style="padding:12px;">
            <!-- Skeleton Events Widget -->
            <div *ngIf="loadingEvents" style="display: flex; flex-direction: column; gap: 8px;">
              <div class="skeleton" style="height: 64px; border-radius: 8px;" *ngFor="let i of [1, 2]"></div>
            </div>

            <div class="events-widget-list" *ngIf="!loadingEvents">
              <app-event-card
                *ngFor="let ev of events.slice(0, 3)"
                [event]="ev"
                [showJoin]="true"
                [joined]="joinedEvents.has(ev.id)"
                [joining]="joiningEvent === ev.id"
                (onJoin)="joinEvent($event)">
              </app-event-card>
              <div class="empty-state" *ngIf="events.length === 0">
                <p style="font-size:12px; margin:0;">No upcoming events scheduled right now.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
    }

    .create-post-card {
      padding: 16px;
    }

    .create-post-header {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .avatar-user {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #4f46e5;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .post-input {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      background: #f8fafc;
      transition: all 0.2s ease;
    }

    .post-input:focus {
      background: #ffffff;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .create-post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .post-tips {
      font-size: 11px;
      color: #64748b;
    }

    .post-item-card {
      padding: 16px;
    }

    .post-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .avatar-post {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #22c55e;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
    }

    .post-author {
      font-weight: 600;
      font-size: 13px;
      color: #0f172a;
    }

    .post-time {
      font-size: 11px;
      color: #94a3b8;
    }

    .post-body {
      font-size: 14px;
      color: #334155;
      line-height: 1.5;
      margin: 0 0 14px;
    }

    .post-actions-bar {
      display: flex;
      gap: 16px;
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    .btn-action:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .comments-container {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
    }

    .comment-bubble {
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
    }

    .comment-author {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .comment-text {
      color: #475569;
    }

    .add-comment-row {
      display: flex;
      gap: 8px;
    }

    .comment-input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      outline: none;
    }

    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-lg {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #4f46e5;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
    }

    .stat-summary-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .stat-box {
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-num {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .stat-txt {
      font-size: 11px;
      color: #64748b;
    }

    .events-widget-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    @media (max-width: 900px) {
      .student-grid { grid-template-columns: 1fr; }
      .right-column { display: none; }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  posts: any[] = [];
  events: any[] = [];
  joinedEvents = new Set<number>();
  joiningEvent: number | null = null;
  newPostContent = '';
  creatingPost = false;
  loadingPosts = true;
  loadingEvents = true;

  expandedPosts = new Set<number>();
  postComments: Record<number, any[]> = {};
  commentDrafts: Record<number, string> = {};

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingPosts = true;
    this.loadingEvents = true;

    // Load recommendations / feed
    this.api.getFeed(0, 20).subscribe({
      next: (res: any) => {
        this.posts = Array.isArray(res) ? res : (res.content || []);
        this.loadingPosts = false;
      },
      error: () => { this.loadingPosts = false; }
    });

    // Load upcoming events
    this.api.getEvents(0, 10, 'date', 'desc').subscribe({
      next: (res: any) => {
        this.events = res.content || [];
        this.loadingEvents = false;
      },
      error: () => { this.loadingEvents = false; }
    });
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;
    this.creatingPost = true;
    this.api.createPost({
      content: this.newPostContent,
      userId: this.auth.getUserId()
    }).subscribe({
      next: () => {
        this.newPostContent = '';
        this.creatingPost = false;
        this.toast.success('Post shared to campus feed!');
        this.loadData();
      },
      error: () => {
        this.creatingPost = false;
        this.toast.error('Failed to create post');
      }
    });
  }

  likePost(post: any): void {
    this.api.likePost(post.id, this.auth.getUserId()).subscribe({
      next: () => {
        post.likeCount = (post.likeCount || 0) + 1;
        this.toast.success('Liked post!');
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Already liked')
    });
  }

  toggleComments(post: any): void {
    if (this.expandedPosts.has(post.id)) {
      this.expandedPosts.delete(post.id);
    } else {
      this.expandedPosts.add(post.id);
      if (!this.postComments[post.id]) {
        this.api.getComments(post.id).subscribe({
          next: (comments: any[]) => this.postComments[post.id] = comments || [],
          error: () => this.postComments[post.id] = []
        });
      }
    }
  }

  addComment(post: any): void {
    const text = this.commentDrafts[post.id];
    if (!text || !text.trim()) return;

    this.api.addComment(post.id, this.auth.getUserId(), text).subscribe({
      next: (newComment: any) => {
        this.commentDrafts[post.id] = '';
        if (!this.postComments[post.id]) this.postComments[post.id] = [];
        this.postComments[post.id].push(newComment);
        post.commentCount = (post.commentCount || 0) + 1;
        this.toast.success('Comment added!');
      },
      error: () => this.toast.error('Failed to add comment')
    });
  }

  joinEvent(event: any): void {
    this.joiningEvent = event.id;
    this.api.requestToJoin(event.id, this.auth.getUserId()).subscribe({
      next: () => {
        this.joinedEvents.add(event.id);
        this.joiningEvent = null;
        this.toast.success('Join request sent to club organizers!');
      },
      error: (err: any) => {
        this.joiningEvent = null;
        this.toast.error(err.error?.message || 'Failed to send join request');
      }
    });
  }

  getUserInitial(): string {
    return this.auth.getUser()?.name?.charAt(0)?.toUpperCase() || 'S';
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  formatTime(isoString: string): string {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  }
}
