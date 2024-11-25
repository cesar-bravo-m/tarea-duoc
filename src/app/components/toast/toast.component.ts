import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

/**
 * Componente que muestra mensajes toast en la aplicación
 * @description Muestra notificaciones temporales en la esquina inferior derecha
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toast" class="toast" [class]="toast.type">
      {{ toast.message }}
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 2rem;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
      z-index: 2000;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .success {
      background-color: #48bb78;
    }

    .error {
      background-color: #e53e3e;
    }

    .info {
      background-color: #4299e1;
    }
  `]
})
export class ToastComponent implements OnDestroy {
  /** Toast actual que se está mostrando */
  toast: any = null;
  /** Suscripción al servicio de toast */
  private subscription: Subscription;

  /**
   * Constructor del componente
   * @param toastService Servicio que maneja los mensajes toast
   * @description Inicializa la suscripción al servicio de toast
   */
  constructor(private toastService: ToastService) {
    this.subscription = this.toastService.toast$.subscribe(
      toast => this.toast = toast
    );
  }

  /**
   * Limpia la suscripción al destruir el componente
   * @description Evita memory leaks cancelando la suscripción
   */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 