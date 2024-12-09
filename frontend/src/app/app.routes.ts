import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoleGuard } from './guards/role.guard';

/**
 * Configuración de rutas de la aplicación
 * @description Define las rutas y sus protecciones por roles
 */
export const routes: Routes = [
  /** 
   * Ruta principal
   * @description Muestra la página de inicio
   */
  { path: '', component: LandingPageComponent },

  /** 
   * Ruta del dashboard
   * @description Contiene las rutas hijas protegidas por roles
   */
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      /**
       * Ruta de inscripción
       * @description Requiere rol USA_INSCRIPCION
       */
      {
        path: 'inscripcion',
        loadComponent: () => import('./inscripcion/inscripcion.component')
          .then(m => m.InscripcionComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'USA_INSCRIPCION' }
      },

      /**
       * Ruta de agenda
       * @description Requiere rol USA_AGENDA
       */
      {
        path: 'agenda',
        loadComponent: () => import('./agenda/agenda.component')
          .then(m => m.AgendaComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'USA_AGENDA' }
      },

      /**
       * Ruta de citas
       * @description Requiere rol USA_CITAS
       */
      {
        path: 'citas',
        loadComponent: () => import('./citas/citas.component')
          .then(m => m.CitasComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'USA_CITAS' }
      },

      /** 
       * Ruta por defecto del dashboard
       * @description Redirige a agenda
       */
      { path: '', redirectTo: 'agenda', pathMatch: 'full' }
    ]
  }
];
