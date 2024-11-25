import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { ToastService } from '../services/toast.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  description: string;
  requiredRole: string;
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
  showUserMenu = false;

  navItems: NavItem[] = [
    {
      path: 'inscripcion',
      icon: '👥',
      label: 'Inscripción',
      description: 'Gestiona los pacientes',
      requiredRole: 'USA_INSCRIPCION'
    },
    {
      path: 'agenda',
      icon: '📅',
      label: 'Agenda',
      description: 'Gestiona los horarios',
      requiredRole: 'USA_AGENDA'
    },
    {
      path: 'citas',
      icon: '🕒',
      label: 'Citas',
      description: 'Administra las citas médicas',
      requiredRole: 'USA_CITAS'
    }
  ];

  constructor(
    private router: Router,
    private dbService: DatabaseService,
    private toastService: ToastService
  ) {}

  get authorizedNavItems(): NavItem[] {
    return this.navItems.filter(item => 
      this.dbService.hasRole(this.currentUser.id, item.requiredRole)
    );
  }

  getUserInitials(): string {
    return `${this.currentUser.nombres?.[0] || ''}${this.currentUser.apellidos?.[0] || ''}`;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    localStorage.removeItem('currentUser');
    
    const now = new Date();
    const timeStr = now.toLocaleString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    this.toastService.show(`Cierre de sesión exitoso @ ${timeStr}`, 'success');
    
    this.router.navigate(['/']);
  }
}
