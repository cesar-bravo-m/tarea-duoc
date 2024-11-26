import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, Funcionario } from '../../services/database.service';
import { ToastService } from '../../services/toast.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { Router } from '@angular/router';

/**
 * Componente modal para la modificación del perfil de usuario
 * @description Permite a los usuarios actualizar su información personal y contraseña
 */
@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  providers: [provideNgxMask()],
  template: `
    <div class="modal-backdrop" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Modificar Perfil</h2>
          <button class="close-button" (click)="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="nombres">Nombres</label>
                <input 
                  id="nombres" 
                  type="text" 
                  formControlName="nombres"
                  [class.error]="isFieldInvalid('nombres')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('nombres')">
                  {{ getErrorMessage('nombres') }}
                </div>
              </div>

              <div class="form-group">
                <label for="apellidos">Apellidos</label>
                <input 
                  id="apellidos" 
                  type="text" 
                  formControlName="apellidos"
                  [class.error]="isFieldInvalid('apellidos')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('apellidos')">
                  {{ getErrorMessage('apellidos') }}
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input 
                  id="email" 
                  type="email" 
                  formControlName="email"
                  [class.error]="isFieldInvalid('email')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('email')">
                  {{ getErrorMessage('email') }}
                </div>
              </div>

              <div class="form-group">
                <label for="esp_id">Especialidad</label>
                <select 
                  id="esp_id" 
                  formControlName="esp_id"
                  [class.error]="isFieldInvalid('esp_id')"
                >
                  <option value="">Seleccione una especialidad</option>
                  <option *ngFor="let esp of especialidades" [value]="esp.id">
                    {{ esp.nombre }}
                  </option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('esp_id')">
                  Especialidad es requerida
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input 
                  id="telefono" 
                  type="text" 
                  formControlName="telefono"
                  placeholder="(56) 9 1234 5678"
                  mask="(00) 0 0000 0000"
                  prefix="  "
                  [dropSpecialCharacters]="false"
                  [showMaskTyped]="true"
                  [clearIfNotMatch]="false"
                  [class.error]="isFieldInvalid('telefono')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('telefono')">
                  {{ getErrorMessage('telefono') }}
                </div>
              </div>

              <div class="form-group">
                <label for="password">Nueva Contraseña (opcional)</label>
                <input 
                  id="password" 
                  type="password" 
                  formControlName="password"
                  [class.error]="isFieldInvalid('password')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('password')">
                  {{ getErrorMessage('password') }}
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="confirmPassword">Confirmar Nueva Contraseña</label>
                <input 
                  id="confirmPassword" 
                  type="password" 
                  formControlName="confirmPassword"
                  [class.error]="isFieldInvalid('confirmPassword')"
                >
                <div class="error-message" *ngIf="profileForm.errors?.['passwordMismatch']">
                  Las contraseñas no coinciden
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" (click)="closeModal()">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="submit-btn" 
                [disabled]="profileForm.invalid || isLoading"
              >
                {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #2d3748;
      font-size: 1.5rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #718096;
      cursor: pointer;
      padding: 0.5rem;
      line-height: 1;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group input.error {
      border-color: #fc8181;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .submit-btn, .cancel-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .submit-btn {
      background-color: #4299e1;
      color: white;
    }

    .cancel-btn {
      background-color: #e2e8f0;
      color: #4a5568;
    }

    .submit-btn:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileModalComponent implements OnInit {
  /** Usuario actual cuyos datos se están modificando */
  @Input() currentUser!: any;
  /** Evento emitido para cerrar el modal */
  @Output() close = new EventEmitter<void>();
  
  /** Formulario reactivo para la edición del perfil */
  profileForm: FormGroup;
  /** Indica si hay una operación en curso */
  isLoading = false;
  /** Lista de especialidades disponibles */
  especialidades: any[] = [];

  /**
   * Constructor del componente
   * @param fb Servicio de formularios reactivos
   * @param dbService Servicio de base de datos
   * @param toastService Servicio de notificaciones
   */
  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.profileForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['(56) 9 ', [Validators.required, Validators.minLength(12)]],
      esp_id: ['', Validators.required],
      password: ['', [
        Validators.pattern(/^[^\s]+$/),  // No spaces allowed
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
      ]],
      confirmPassword: ['']
    }, { validator: this.passwordMatchValidator() });

    this.dbService.especialidades$.subscribe(
      esp => this.especialidades = esp
    );
  }

  /**
   * Inicializa el componente
   * @description Carga las especialidades y configura el formulario con los datos del usuario
   */
  ngOnInit() {
    this.dbService.loadEspecialidades();
    this.profileForm.patchValue({
      nombres: this.currentUser.nombres,
      apellidos: this.currentUser.apellidos,
      email: this.currentUser.email,
      telefono: this.currentUser.telefono || '(56) 9 ',
      esp_id: this.currentUser.esp_id
    });
  }

  /**
   * Validador personalizado para contraseñas coincidentes
   * @returns ValidatorFn que verifica que las contraseñas coincidan
   */
  passwordMatchValidator() {
    return (formGroup: FormGroup) => {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (password?.value || confirmPassword?.value) {
        if (password?.value !== confirmPassword?.value) {
          confirmPassword?.setErrors({ passwordMismatch: true });
          return { passwordMismatch: true };
        } else {
          confirmPassword?.setErrors(null);
          return null;
        }
      }
      return null;
    };
  }

  /**
   * Verifica si un campo del formulario es inválido
   * @param fieldName Nombre del campo a verificar
   * @returns boolean indicando si el campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  /**
   * Obtiene el mensaje de error para un campo
   * @param fieldName Nombre del campo
   * @returns Mensaje de error correspondiente al tipo de error
   */
  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['pattern']) {
        if (fieldName === 'telefono') return 'Formato de teléfono inválido';
        if (fieldName === 'password') {
          if (control.value?.includes(' ')) return 'No se permiten espacios';
          return 'La contraseña debe tener al menos una mayúscula, una minúscula y un número';
        }
        return 'Formato inválido';
      }
      if (control.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }

  /**
   * Cierra el modal
   * @description Emite el evento close
   */
  closeModal() {
    this.close.emit();
  }

  /**
   * Maneja el envío del formulario
   * @description Valida y actualiza la información del usuario
   */
  onSubmit() {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.profileForm.value;
    
    try {
      const updatedUser = {
        ...this.currentUser,
        ...formValue
      };

      if (formValue.password && formValue.password.length > 0) {
        if (!formValue.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)) {
          this.toastService.show('La contraseña debe tener al menos una mayúscula, una minúscula y un número', 'error');
          return;
        }
        updatedUser.password = formValue.password;
      }

      this.dbService.updateFuncionario(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      this.toastService.show('Perfil actualizado exitosamente', 'success');
      this.closeModal();
    } catch (error) {
      this.toastService.show('Error al actualizar el perfil', 'error');
    } finally {
      this.isLoading = false;
    }
  }
} 