import { Component, HostListener } from '@angular/core';
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
  showUserMenu = false;
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
    // {
    //   path: 'funcionarios',
    //   icon: '👥',
    //   label: 'Funcionarios',
    //   description: 'Gestiona el personal médico'
    // },
    {
      path: 'citas',
      icon: '🕒',
      label: 'Citas',
      description: 'Administra las citas médicas'
    }
  ];

  constructor(private router: Router) {}

  getUserInitials(): string {
    return `${this.currentUser.nombres?.[0] || ''}${this.currentUser.apellidos?.[0] || ''}`;
  }

  getUserName(): string {
    return `${this.currentUser.nombres} ${this.currentUser.apellidos}`;
  }

  getUserSpeciality(): string {
    return this.currentUser.especialidad;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }

  // Add click outside handler to close menu
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && !userMenu.contains(event.target as Node)) {
      this.showUserMenu = false;
    }
  }
}
