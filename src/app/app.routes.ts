import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      {
        path: 'inscripcion',
        loadComponent: () => import('./inscripcion/inscripcion.component')
          .then(m => m.InscripcionComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'USA_INSCRIPCION' }
      },
      {
        path: 'agenda',
        loadComponent: () => import('./agenda/agenda.component')
          .then(m => m.AgendaComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'USA_AGENDA' }
      },
      {
        path: 'citas',
        loadComponent: () => import('./citas/citas.component')
          .then(m => m.CitasComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'USA_CITAS' }
      },
      { path: '', redirectTo: 'agenda', pathMatch: 'full' }
    ]
  }
];
