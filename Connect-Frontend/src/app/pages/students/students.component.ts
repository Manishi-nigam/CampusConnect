import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="students-layout">
      <div class="main-content">
        <!-- Stats Row -->
        <div class="stats-row mb-16">
          <div class="stat-card">
            <div class="stat-value">{{ students.length }}</div>
            <div class="stat-label">Total Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getDepartments().length }}</div>
            <div class="stat-label">Departments</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getYears().length }}</div>
            <div class="stat-label">Year Groups</div>
          </div>
        </div>

        <!-- Student Table -->
        <div class="card">
          <div class="card-header flex items-center justify-between">
            <span>👥 Students</span>
          </div>
          <div class="loading-center" *ngIf="loading">
            <div class="spinner"></div>
          </div>
          <table class="data-table" *ngIf="!loading && students.length > 0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roll No</th>
                <th>Dept</th>
                <th>Year</th>
                <th *ngIf="auth.getRole() === 'ADMIN'"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of students">
                <td style="font-weight:500;">{{ s.name }}</td>
                <td class="text-secondary">{{ s.email }}</td>
                <td><span class="badge badge-primary">{{ s.rollNumber }}</span></td>
                <td>{{ s.department }}</td>
                <td>{{ s.year }}</td>
                <td *ngIf="auth.getRole() === 'ADMIN'">
                  <button class="btn btn-ghost btn-sm text-danger" (click)="deleteStudent(s)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="!loading && students.length === 0">
            <div class="empty-icon">👥</div>
            <h3>No students yet</h3>
            <p>Add a student using the form</p>
          </div>
        </div>
      </div>

      <!-- Add Student Sidebar -->
      <div class="side-form">
        <div class="card">
          <div class="card-header">➕ Add Student</div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">User ID</label>
              <input class="form-control" [(ngModel)]="newStudent.userId" type="number" placeholder="Linked user ID">
            </div>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-control" [(ngModel)]="newStudent.name" placeholder="Full name">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-control" [(ngModel)]="newStudent.email" placeholder="Email address">
            </div>
            <div class="form-group">
              <label class="form-label">Roll Number</label>
              <input class="form-control" [(ngModel)]="newStudent.rollNumber" placeholder="Roll number">
            </div>
            <div class="form-group">
              <label class="form-label">Department</label>
              <input class="form-control" [(ngModel)]="newStudent.department" placeholder="Department">
            </div>
            <div class="form-group">
              <label class="form-label">Year</label>
              <input class="form-control" [(ngModel)]="newStudent.year" type="number" placeholder="Year">
            </div>
            <button class="btn btn-primary btn-block" (click)="addStudent()" [disabled]="saving">
              {{ saving ? 'Adding...' : 'Add Student' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .students-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 24px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    @media (max-width: 900px) {
      .students-layout { grid-template-columns: 1fr; }
      .stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class StudentsComponent {
  students: any[] = [];
  loading = true;
  saving = false;
  newStudent: any = { userId: null, name: '', email: '', rollNumber: '', department: '', year: null };

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.api.getStudents().subscribe({
      next: s => { this.students = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addStudent(): void {
    if (!this.newStudent.name || !this.newStudent.email) {
      this.toast.error('Name and email are required');
      return;
    }
    this.saving = true;
    this.api.createStudent(this.newStudent).subscribe({
      next: () => {
        this.toast.success('Student added!');
        this.newStudent = { userId: null, name: '', email: '', rollNumber: '', department: '', year: null };
        this.saving = false;
        this.loadStudents();
      },
      error: (err: any) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Failed to add student');
      }
    });
  }

  deleteStudent(student: any): void {
    this.api.deleteStudent(student.id, this.auth.getUserId()).subscribe({
      next: () => {
        this.toast.success('Student deleted');
        this.loadStudents();
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Failed to delete')
    });
  }

  getDepartments(): string[] {
    return [...new Set(this.students.map((s: any) => s.department).filter(Boolean))];
  }

  getYears(): number[] {
    return [...new Set(this.students.map((s: any) => s.year).filter(Boolean))];
  }
}
