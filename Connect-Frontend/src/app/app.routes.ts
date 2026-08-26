import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ClubDashboardComponent } from './pages/club-dashboard/club-dashboard.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { EventsComponent } from './pages/events/events.component';
import { MyEventsComponent } from './pages/my-events/my-events.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { StudentsComponent } from './pages/students/students.component';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Role-Specific Dashboards
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'club-head',
    component: ClubDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLUB_HEAD', 'ADMIN'] }
  },
  {
    path: 'student',
    component: StudentDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT', 'ADMIN'] }
  },

  // Legacy fallback
  {
    path: 'dashboard',
    redirectTo: 'student',
    pathMatch: 'full'
  },

  // Shared Features with Role Guards
  {
    path: 'events',
    component: EventsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'my-events',
    component: MyEventsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT', 'ADMIN'] }
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'students',
    component: StudentsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  { path: '**', redirectTo: 'login' }
];
