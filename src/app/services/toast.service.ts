import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Interfaz que define la estructura de un mensaje toast
 */
export interface Toast {
  /** Mensaje a mostrar */
  message: string;
  /** Tipo de mensaje: success, error o info */
  type: 'success' | 'error' | 'info';
}

/**
 * Servicio que maneja los mensajes toast de la aplicación
 * @description Permite mostrar notificaciones temporales en la interfaz
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /** Subject que mantiene el estado del toast actual */
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  /** Observable público que emite los cambios en el toast */
  toast$ = this.toastSubject.asObservable();

  /**
   * Muestra un nuevo mensaje toast
   * @param message Texto del mensaje a mostrar
   * @param type Tipo de mensaje (success, error, info)
   * @description El mensaje se ocultará automáticamente después de 3 segundos
   */
  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastSubject.next({ message, type });
    setTimeout(() => this.toastSubject.next(null), 3000);
  }

  /**
   * Oculta el mensaje toast actual
   * @description Limpia el toast actual estableciéndolo a null
   */
  hide() {
    this.toastSubject.next(null);
  }
} 