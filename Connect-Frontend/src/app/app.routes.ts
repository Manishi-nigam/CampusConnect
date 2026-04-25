import { Routes } from '@angular/router';
import { Students } from './pages/students/students';
import { Events } from './pages/events/events';
import { Login } from './pages/login/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'students',
    component: Students
  },
  {
    path: 'students/:id/events',
    component: Events,
    runGuardsAndResolvers: 'paramsChange'
  }
];
