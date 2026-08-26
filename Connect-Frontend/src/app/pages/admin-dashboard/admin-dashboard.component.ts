import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <!-- Header Banner -->
      <div class="admin-header">
        <div>
          <h1>Platform Administration</h1>
          <p class="text-secondary">Overview, moderation, and institutional management controls</p>
        </div>
        <div class="header-badge">
          <span class="badge badge-danger">🛡️ Administrator Access</span>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eef2ff; color:#4f46e5;">👥</div>
          <div>
            <div class="stat-val" *ngIf="!loadingStudents">{{ students.length }}</div>
            <div class="skeleton skeleton-text" *ngIf="loadingStudents" style="width: 36px; height: 20px; margin: 4px 0;"></div>
            <div class="stat-lbl">Enrolled Students</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#ecfdf5; color:#059669;">📅</div>
          <div>
            <div class="stat-val" *ngIf="!loadingEvents">{{ events.length }}</div>
            <div class="skeleton skeleton-text" *ngIf="loadingEvents" style="width: 36px; height: 20px; margin: 4px 0;"></div>
            <div class="stat-lbl">Campus Events</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef3c7; color:#d97706;">💬</div>
          <div>
            <div class="stat-val" *ngIf="!loadingPosts">{{ posts.length }}</div>
            <div class="skeleton skeleton-text" *ngIf="loadingPosts" style="width: 36px; height: 20px; margin: 4px 0;"></div>
            <div class="stat-lbl">Community Posts</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fdf2f8; color:#db2777;">🏛️</div>
          <div>
            <div class="stat-val" *ngIf="!loadingStudents">{{ getDepartments().length }}</div>
            <div class="skeleton skeleton-text" *ngIf="loadingStudents" style="width: 36px; height: 20px; margin: 4px 0;"></div>
            <div class="stat-lbl">Active Departments</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="admin-tabs">
        <button
          class="tab-btn"
          [class.active]="activeTab === 'students'"
          (click)="activeTab = 'students'">
          👥 Manage Students ({{ students.length }})
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'events'"
          (click)="activeTab = 'events'">
          📅 Manage Events ({{ events.length }})
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'posts'"
          (click)="activeTab = 'posts'">
          💬 Moderate Posts ({{ posts.length }})
        </button>
      </div>

      <!-- TAB 1: MANAGE STUDENTS -->
      <div *ngIf="activeTab === 'students'" class="tab-content">
        <div class="two-col-layout">
          <!-- Students Table -->
          <div class="card">
            <div class="card-header flex justify-between items-center">
              <span>Student Directory</span>
              <span class="text-secondary" style="font-size:12px;">{{ students.length }} records</span>
            </div>

            <!-- Skeleton Table -->
            <div class="table-responsive" *ngIf="loadingStudents" style="padding: 16px;">
              <div class="skeleton" style="height: 36px; margin-bottom: 8px; border-radius: 6px;" *ngFor="let i of [1, 2, 3]"></div>
            </div>

            <div class="table-responsive" *ngIf="!loadingStudents && students.length > 0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll Number</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th style="text-align:right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of students">
                    <td style="font-weight:600;">{{ s.name }}</td>
                    <td class="text-secondary">{{ s.email }}</td>
                    <td><span class="badge badge-primary">{{ s.rollNumber }}</span></td>
                    <td>{{ s.department }}</td>
                    <td>Year {{ s.year }}</td>
                    <td style="text-align:right;">
                      <button class="btn btn-ghost btn-sm text-danger" (click)="deleteStudent(s)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="empty-state" *ngIf="!loadingStudents && students.length === 0">
              <div class="empty-icon">👥</div>
              <h3>No student records</h3>
              <p>Add a student profile using the form on the right.</p>
            </div>
          </div>

          <!-- Add Student Form -->
          <div class="card form-card">
            <div class="card-header">➕ Add Student Profile</div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Linked User ID</label>
                <input class="form-control" type="number" [(ngModel)]="newStudent.userId" placeholder="1" required />
              </div>
              <div class="form-group">
                <label class="form-label">Student Name</label>
                <input class="form-control" [(ngModel)]="newStudent.name" placeholder="Full name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input class="form-control" type="email" [(ngModel)]="newStudent.email" placeholder="student@campus.edu" required />
              </div>
              <div class="form-group">
                <label class="form-label">Roll Number</label>
                <input class="form-control" [(ngModel)]="newStudent.rollNumber" placeholder="CS2026-001" required />
              </div>
              <div class="form-group">
                <label class="form-label">Department</label>
                <input class="form-control" [(ngModel)]="newStudent.department" placeholder="Computer Science" required />
              </div>
              <div class="form-group">
                <label class="form-label">Year of Study</label>
                <input class="form-control" type="number" [(ngModel)]="newStudent.year" placeholder="3" required />
              </div>
              <button class="btn btn-primary btn-block" (click)="addStudent()" [disabled]="savingStudent">
                {{ savingStudent ? 'Adding Profile...' : 'Add Student' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: MANAGE ALL EVENTS -->
      <div *ngIf="activeTab === 'events'" class="tab-content">
        <div class="card">
          <div class="card-header flex justify-between items-center">
            <span>All Campus Events</span>
            <span class="text-secondary" style="font-size:12px;">{{ events.length }} events registered</span>
          </div>

          <!-- Skeleton Table -->
          <div class="table-responsive" *ngIf="loadingEvents" style="padding: 16px;">
            <div class="skeleton" style="height: 36px; margin-bottom: 8px; border-radius: 6px;" *ngFor="let i of [1, 2, 3]"></div>
          </div>

          <div class="table-responsive" *ngIf="!loadingEvents && events.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Organized By</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ev of events">
                  <td style="font-weight:600; color:#0f172a;">{{ ev.title }}</td>
                  <td><span class="badge badge-primary">{{ ev.createdByName || 'Club' }}</span></td>
                  <td>{{ ev.date }}</td>
                  <td>📍 {{ ev.location }}</td>
                  <td class="text-secondary" style="max-width:250px; font-size:12px;">{{ ev.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="empty-state" *ngIf="!loadingEvents && events.length === 0">
            <div class="empty-icon">📅</div>
            <h3>No events registered yet</h3>
            <p>Events organized by clubs will appear here.</p>
          </div>
        </div>
      </div>

      <!-- TAB 3: MODERATE POSTS -->
      <div *ngIf="activeTab === 'posts'" class="tab-content">
        <div class="card">
          <div class="card-header flex justify-between items-center">
            <span>Community Feed & Posts</span>
            <span class="text-secondary" style="font-size:12px;">{{ posts.length }} posts</span>
          </div>

          <!-- Skeleton Posts -->
          <div *ngIf="loadingPosts" style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
            <div class="skeleton" style="height: 72px; border-radius: 8px;" *ngFor="let i of [1, 2]"></div>
          </div>

          <div class="posts-list" *ngIf="!loadingPosts && posts.length > 0" style="padding:16px;">
            <div class="post-item-admin" *ngFor="let post of posts">
              <div class="flex justify-between items-center mb-8">
                <div class="flex items-center gap-8">
                  <div class="avatar-small">💬</div>
                  <span style="font-weight:600; font-size:13px;">User #{{ post.userId }}</span>
                  <span class="text-muted" style="font-size:11px;">• Score: {{ post.score || 0 }}</span>
                </div>
              </div>
              <p style="font-size:13px; color:#334155; margin:0 0 10px;">{{ post.content }}</p>
              <div class="flex items-center gap-12 text-muted" style="font-size:12px;">
                <span>❤️ {{ post.likeCount || 0 }} likes</span>
                <span>💬 {{ post.commentCount || 0 }} comments</span>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="!loadingPosts && posts.length === 0">
            <div class="empty-icon">💬</div>
            <h3>No posts found</h3>
            <p>Student and club posts will appear here for moderation.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .admin-header h1 {
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

    .admin-tabs {
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
      position: relative;
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

    .two-col-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 20px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .data-table th {
      background: #f8fafc;
      padding: 10px 16px;
      font-weight: 600;
      color: #475569;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .data-table tr:hover {
      background: #f8fafc;
    }

    .post-item-admin {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 14px;
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .avatar-small {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .two-col-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'students';
  students: any[] = [];
  events: any[] = [];
  posts: any[] = [];

  loadingStudents = true;
  loadingEvents = true;
  loadingPosts = true;
  savingStudent = false;

  newStudent: any = {
    userId: 1,
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    year: 1
  };

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.loadEvents();
    this.loadPosts();
  }

  loadStudents(): void {
    this.loadingStudents = true;
    this.api.getStudents().subscribe({
      next: s => { this.students = s || []; this.loadingStudents = false; },
      error: () => { this.loadingStudents = false; }
    });
  }

  loadEvents(): void {
    this.loadingEvents = true;
    this.api.getEvents(0, 50, 'date', 'desc').subscribe({
      next: (res: any) => {
        this.events = res.content || [];
        this.loadingEvents = false;
      },
      error: () => { this.loadingEvents = false; }
    });
  }

  loadPosts(): void {
    this.loadingPosts = true;
    this.api.getFeed(0, 50).subscribe({
      next: (res: any) => {
        this.posts = Array.isArray(res) ? res : (res.content || []);
        this.loadingPosts = false;
      },
      error: () => { this.loadingPosts = false; }
    });
  }

  addStudent(): void {
    if (!this.newStudent.name || !this.newStudent.email || !this.newStudent.rollNumber) {
      this.toast.error('Please fill in all required student details');
      return;
    }
    this.savingStudent = true;
    this.api.createStudent(this.newStudent).subscribe({
      next: () => {
        this.toast.success('Student profile created successfully');
        this.newStudent = { userId: 1, name: '', email: '', rollNumber: '', department: '', year: 1 };
        this.savingStudent = false;
        this.loadStudents();
      },
      error: (err: any) => {
        this.savingStudent = false;
        this.toast.error(err.error?.message || 'Failed to create student profile');
      }
    });
  }

  deleteStudent(student: any): void {
    if (!confirm(`Are you sure you want to delete student ${student.name}?`)) return;
    this.api.deleteStudent(student.id, this.auth.getUserId()).subscribe({
      next: () => {
        this.toast.success('Student deleted');
        this.loadStudents();
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Failed to delete student')
    });
  }

  getDepartments(): string[] {
    return [...new Set(this.students.map((s: any) => s.department).filter(Boolean))];
  }
}
