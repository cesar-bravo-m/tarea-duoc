import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  navItems: NavItem[] = [
    {
      path: 'inscripcion',
      icon: '📝',
      label: 'Inscripción',
      description: 'Gestiona las inscripciones de pacientes'
    },
    {
      path: 'agenda',
      icon: '📅',
      label: 'Agenda',
      description: 'Administra los horarios y citas'
    },
    {
      path: 'funcionarios',
      icon: '👥',
      label: 'Funcionarios',
      description: 'Gestiona el personal médico'
    },
    {
      path: 'citas',
      icon: '🕒',
      label: 'Citas',
      description: 'Administra las citas médicas'
    }
  ];

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }
}
