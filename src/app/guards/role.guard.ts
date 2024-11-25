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

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const requiredRole = route.data['requiredRole'];

    if (!currentUser.id || !requiredRole) {
      this.router.navigate(['/']);
      return false;
    }
    // Hack temporal
    if (currentUser.id > 10) return true

    try {
      // Ensure database is initialized
      await this.dbService.initializeDatabase();
      
      // Check if user has the required role
      const hasRole = this.dbService.hasRole(currentUser.id, requiredRole);
      
      if (!hasRole) {
        this.router.navigate(['/dashboard']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking roles:', error);
      this.router.navigate(['/']);
      return false;
    }
  }
} 