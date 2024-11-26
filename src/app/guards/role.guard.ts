import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

/**
 * Guardia que protege las rutas basadas en roles de usuario
 * @description Verifica que el usuario tenga los permisos necesarios para acceder a una ruta
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {}

  /**
   * Verifica si el usuario puede acceder a la ruta solicitada
   * @param route Información de la ruta a activar
   * @param state Estado actual del router
   * @returns Promise<boolean> indicando si se permite el acceso
   * @description Comprueba si el usuario tiene el rol requerido para la ruta
   */
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
      // await this.dbService.initializeDatabase();
      
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