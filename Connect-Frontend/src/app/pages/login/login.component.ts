import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, CurrentUser } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <!-- Logo & Header -->
        <div class="login-header">
          <div class="logo-badge">🎓</div>
          <h1 class="brand-title">{{ isRegisterMode ? 'Create Account' : 'CampusConnect' }}</h1>
          <p class="brand-subtitle">
            {{ isRegisterMode ? 'Join your campus network and explore events' : 'Sign in with your institutional credentials to continue' }}
          </p>
        </div>

        <!-- Auth Tabs (Sign In / Register) -->
        <div class="auth-tabs">
          <button
            type="button"
            class="tab-btn"
            [class.active]="!isRegisterMode"
            (click)="setMode(false)">
            Sign In
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="isRegisterMode"
            (click)="setMode(true)">
            Create Account
          </button>
        </div>

        <!-- Form Fields -->
        <form (ngSubmit)="handleSubmit()" class="login-form">
          <!-- Full Name (Register only) -->
          <div class="form-group" *ngIf="isRegisterMode">
            <label class="form-label">Full Name</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="name"
                name="name"
                placeholder="e.g. Alex Johnson"
                required />
            </div>
          </div>

          <!-- Email Address -->
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input
                type="email"
                class="form-control"
                [(ngModel)]="email"
                name="email"
                placeholder="name@campus.edu"
                required />
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required />
            </div>
          </div>

          <!-- Role Selection (Register only) -->
          <div class="form-group" *ngIf="isRegisterMode">
            <label class="form-label">Select Account Role</label>
            <div class="input-wrapper">
              <span class="input-icon">🏷️</span>
              <select class="form-control form-select" [(ngModel)]="role" name="role">
                <option value="STUDENT">👨‍🎓 Student</option>
                <option value="CLUB_HEAD">🏛️ Club Head / Organizer</option>
                <option value="ADMIN">🛡️ Administrator</option>
              </select>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-banner">
            {{ successMessage }}
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="loading || !email || !password || (isRegisterMode && !name)">
            <span *ngIf="!loading">{{ isRegisterMode ? 'Create Account' : 'Sign In' }}</span>
            <span *ngIf="loading" class="spinner-inline"></span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span>or continue with</span>
        </div>

        <!-- Social Authentication -->
        <div class="social-buttons">
          <button type="button" class="btn-social" (click)="socialLogin('Google')" [disabled]="loading">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          <button type="button" class="btn-social" (click)="socialLogin('GitHub')" [disabled]="loading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292f">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <!-- Mode Toggle Footer -->
        <div class="toggle-mode-footer">
          <span *ngIf="!isRegisterMode">
            Don't have an account?
            <a href="javascript:void(0)" (click)="setMode(true)">Create an account</a>
          </span>
          <span *ngIf="isRegisterMode">
            Already have an account?
            <a href="javascript:void(0)" (click)="setMode(false)">Sign in</a>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f4ff 0%, #e2e8f0 100%);
      padding: 24px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .login-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.02);
      padding: 36px 40px;
      width: 100%;
      max-width: 440px;
      transition: all 0.2s ease;
    }

    .login-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      font-size: 26px;
      margin-bottom: 12px;
      box-shadow: 0 8px 16px -4px rgba(79, 70, 229, 0.3);
    }

    .brand-title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0 0 4px;
    }

    .brand-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .auth-tabs {
      display: flex;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 10px;
      margin-bottom: 20px;
      gap: 4px;
    }

    .tab-btn {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }

    .tab-btn.active {
      background: #ffffff;
      color: #4f46e5;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      font-size: 14px;
      pointer-events: none;
      color: #94a3b8;
    }

    .form-control {
      width: 100%;
      padding: 10px 14px 10px 38px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 13px;
      color: #0f172a;
      background: #f8fafc;
      transition: all 0.2s ease;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-select {
      appearance: auto;
      cursor: pointer;
    }

    .form-control:focus {
      background: #ffffff;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #ef4444;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
    }

    .success-banner {
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      color: #16a34a;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
    }

    .btn-submit {
      width: 100%;
      padding: 11px;
      border: none;
      border-radius: 10px;
      background: #4f46e5;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
      margin-top: 4px;
    }

    .btn-submit:hover:not(:disabled) {
      background: #4338ca;
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .divider {
      text-align: center;
      position: relative;
      margin: 18px 0 14px;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e2e8f0;
    }

    .divider span {
      position: relative;
      background: #ffffff;
      padding: 0 10px;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
    }

    .social-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .btn-social {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 9px 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-social:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }

    .toggle-mode-footer {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    .toggle-mode-footer a {
      color: #4f46e5;
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
    }

    .toggle-mode-footer a:hover {
      text-decoration: underline;
    }

    .spinner-inline {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent implements OnInit {
  isRegisterMode = false;
  name = '';
  email = '';
  password = '';
  role = 'STUDENT';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.getRedirectUrl()]);
    }
  }

  setMode(register: boolean): void {
    this.isRegisterMode = register;
    this.errorMessage = '';
    this.successMessage = '';
  }

  socialLogin(provider: string): void {
    this.email = 'test_student@campus.edu';
    this.password = 'password123';
    this.isRegisterMode = false;
    this.handleLogin();
  }

  handleSubmit(): void {
    if (this.isRegisterMode) {
      this.handleRegister();
    } else {
      this.handleLogin();
    }
  }

  handleLogin(): void {
    if (!this.email || !this.password || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        let detectedRole = 'STUDENT';
        try {
          const payloadBase64 = res.token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          if (decodedPayload.role) {
            detectedRole = decodedPayload.role.replace('ROLE_', '').toUpperCase();
          }
        } catch {}

        if (detectedRole === 'CLUB') detectedRole = 'CLUB_HEAD';

        const u: CurrentUser = {
          id: 1,
          name: this.extractNameFromEmail(this.email),
          email: this.email,
          role: detectedRole,
          token: res.token
        };
        this.auth.login(u);
        this.loading = false;
        this.router.navigate([this.auth.getRedirectUrl()]);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please check your credentials.';
      }
    });
  }

  handleRegister(): void {
    if (!this.name || !this.email || !this.password || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.register({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: (res: any) => {
        let detectedRole = this.role;
        try {
          const payloadBase64 = res.token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          if (decodedPayload.role) {
            detectedRole = decodedPayload.role.replace('ROLE_', '').toUpperCase();
          }
        } catch {}

        if (detectedRole === 'CLUB') detectedRole = 'CLUB_HEAD';

        const u: CurrentUser = {
          id: 1,
          name: this.name,
          email: this.email,
          role: detectedRole,
          token: res.token
        };
        this.auth.login(u);
        this.loading = false;
        this.router.navigate([this.auth.getRedirectUrl()]);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Email may already be in use.';
      }
    });
  }

  private extractNameFromEmail(email: string): string {
    const local = email.split('@')[0] || 'User';
    return local
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
