import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const requiredRole = route.data['requiredRole'];

    if (!currentUser.id || !requiredRole) {
      this.router.navigate(['/']);
      return false;
    }

    if (!this.dbService.hasRole(currentUser.id, requiredRole)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
} 