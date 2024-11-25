import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      {
        path: 'inscripcion',
        loadComponent: () => import('./inscripcion/inscripcion.component')
          .then(m => m.InscripcionComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./agenda/agenda.component')
          .then(m => m.AgendaComponent)
      },
      {
        path: 'funcionarios',
        loadComponent: () => import('./funcionarios/funcionarios.component')
          .then(m => m.FuncionariosComponent)
      },
      {
        path: 'citas',
        loadComponent: () => import('./citas/citas.component')
          .then(m => m.CitasComponent)
      },
      { path: '', redirectTo: 'agenda', pathMatch: 'full' }
    ]
  }
];
