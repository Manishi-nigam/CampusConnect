import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles: string[] = route.data?.['roles'] || [];
  let userRole = (auth.getRole() || 'STUDENT').toUpperCase();
  if (userRole === 'CLUB') {
    userRole = 'CLUB_HEAD';
  }

  const normalizedExpectedRoles = expectedRoles.map(r => r === 'CLUB' ? 'CLUB_HEAD' : r.toUpperCase());

  if (normalizedExpectedRoles.length === 0 || normalizedExpectedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to user's proper role dashboard
  if (userRole === 'ADMIN') {
    router.navigate(['/admin']);
  } else if (userRole === 'CLUB_HEAD') {
    router.navigate(['/club-head']);
  } else {
    router.navigate(['/student']);
  }

  return false;
};
