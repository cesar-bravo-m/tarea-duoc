import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { RegisterModalComponent } from '../components/register-modal/register-modal.component';

/**
 * Componente que maneja la página de inicio
 * @description Muestra la página principal y gestiona los modales de inicio de sesión y registro
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, LoginModalComponent, RegisterModalComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  /** Indica si el modal de inicio de sesión está visible */
  showLoginModal = false;
  /** Indica si el modal de registro está visible */
  showRegisterModal = false;

  /**
   * Alterna la visibilidad del modal de inicio de sesión
   * @description Cierra el modal de registro si está abierto
   */
  toggleLoginModal() {
    this.showLoginModal = !this.showLoginModal;
    if (this.showRegisterModal) this.showRegisterModal = false;
  }

  /**
   * Alterna la visibilidad del modal de registro
   * @description Cierra el modal de inicio de sesión si está abierto
   */
  toggleRegisterModal() {
    this.showRegisterModal = !this.showRegisterModal;
    if (this.showLoginModal) this.showLoginModal = false;
  }

  /**
   * Desplaza la vista a la sección de características
   * @description Realiza un desplazamiento suave hacia la sección de características
   */
  scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
