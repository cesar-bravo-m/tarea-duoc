import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { ToastService } from '../services/toast.service';
import { ProfileModalComponent } from '../components/profile-modal/profile-modal.component';

/**
 * Interfaz que define la estructura de un elemento de navegación
 */
interface NavItem {
  /** Ruta del componente */
  path: string;
  /** Ícono a mostrar */
  icon: string;
  /** Etiqueta del elemento */
  label: string;
  /** Descripción de la funcionalidad */
  description: string;
  /** Rol requerido para acceder */
  requiredRole: string;
}

/**
 * Componente que maneja el panel principal de la aplicación
 * @description Muestra la navegación principal y gestiona el acceso basado en roles
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ProfileModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  /** Usuario actualmente autenticado */
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  /** Indica si el menú de usuario está visible */
  showUserMenu = false;
  showProfileModal = false;

  /** Lista de elementos de navegación con sus permisos */
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

  /**
   * Obtiene los elementos de navegación autorizados para el usuario actual
   * @returns Lista filtrada de elementos de navegación según los roles del usuario
   */
  get authorizedNavItems(): NavItem[] {
    return this.navItems.filter(item => 
      this.dbService.hasRole(this.currentUser.id, item.requiredRole)
    );
  }

  /**
   * Obtiene las iniciales del usuario actual
   * @returns String con las iniciales del nombre y apellido
   */
  getUserInitials(): string {
    return `${this.currentUser.nombres?.[0] || ''}${this.currentUser.apellidos?.[0] || ''}`;
  }

  /**
   * Alterna la visibilidad del menú de usuario
   * @description Muestra u oculta el menú desplegable
   */
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Cierra la sesión del usuario
   * @description Limpia el localStorage y redirige al inicio
   */
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

  getUserFullName(): string {
    return `${this.currentUser.nombres} ${this.currentUser.apellidos}`;
  }

  getUserSpecialty(): string {
    return this.currentUser.especialidad;
  }

  openProfileModal() {
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }
}
