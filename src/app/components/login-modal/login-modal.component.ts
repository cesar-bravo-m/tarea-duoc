import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

/**
 * Componente que maneja el modal de inicio de sesión
 * @description Permite a los usuarios iniciar sesión y recuperar su contraseña
 */
@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  /** Evento emitido para cerrar el modal */
  @Output() close = new EventEmitter<void>();
  
  /** RUT del usuario para inicio de sesión */
  rut: string = '';
  /** Contraseña del usuario */
  password: string = '';
  
  /** Indica si se está en proceso de recuperación de contraseña */
  isRecovering: boolean = false;
  /** RUT para recuperación de contraseña */
  recoveryRut: string = '';
  /** Código de recuperación ingresado por el usuario */
  recoveryCode: string = '';
  /** Indica si el código de recuperación ha sido enviado */
  recoveryCodeSent: boolean = false;
  /** Indica si el código de recuperación ha sido verificado */
  recoveryCodeVerified: boolean = false;
  /** Nueva contraseña durante recuperación */
  newPassword: string = '';
  /** Código de recuperación generado por el sistema */
  generatedCode: string = '';
  
  /** Indica si hay un error que mostrar */
  showError: boolean = false;
  /** Indica si hay una operación en curso */
  isLoading: boolean = false;
  /** Mensaje de error para mostrar al usuario */
  errorMessage: string = 'RUT o contraseña incorrectos';

  /** Formulario para recuperación de contraseña */
  recoveryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.recoveryForm = this.fb.group({
      recoveryRut: ['', [Validators.required]],
      recoveryCode: [''],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern(/^[^\s]+$/),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator() });
  }

  passwordMatchValidator() {
    return (formGroup: FormGroup) => {
      const password = formGroup.get('newPassword');
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recoveryForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.recoveryForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['pattern']) {
        if (fieldName === 'newPassword') {
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
   * Cierra el modal de inicio de sesión
   * @description Emite el evento close
   */
  closeModal() {
    this.close.emit();
  }

  /**
   * Inicia el proceso de recuperación de contraseña
   * @description Cambia el estado del modal a recuperación
   */
  startRecovery() {
    this.isRecovering = true;
    this.showError = false;
    this.errorMessage = '';
  }

  /**
   * Cancela el proceso de recuperación de contraseña
   * @description Reinicia todos los campos de recuperación
   */
  cancelRecovery() {
    this.isRecovering = false;
    this.recoveryRut = '';
    this.recoveryCode = '';
    this.recoveryCodeSent = false;
    this.recoveryCodeVerified = false;
    this.newPassword = '';
    this.showError = false;
    this.errorMessage = '';
  }

  /**
   * Maneja el proceso de recuperación de contraseña
   * @param event Evento del formulario
   * @description Proceso de tres pasos: envío de código, verificación y cambio de contraseña
   */
  handleRecovery(event: Event) {
    event.preventDefault();
    this.showError = false;
    this.isLoading = true;

    try {
      if (!this.recoveryCodeSent) {
        const funcionario = this.dbService.getFuncionarioByRut(this.recoveryForm.get('recoveryRut')?.value);
        if (!funcionario) {
          this.showError = true;
          this.errorMessage = 'RUT no encontrado';
          return;
        }

        this.generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log('Código de recuperación:', this.generatedCode);
        
        this.recoveryCodeSent = true;
        this.errorMessage = '';
      } 
      else if (!this.recoveryCodeVerified) {
        if (this.recoveryForm.get('recoveryCode')?.value !== this.generatedCode) {
          this.showError = true;
          this.errorMessage = 'Código inválido';
          return;
        }
        
        this.recoveryCodeVerified = true;
        this.errorMessage = '';
      } 
      else {
        if (this.recoveryForm.invalid) {
          Object.keys(this.recoveryForm.controls).forEach(key => {
            const control = this.recoveryForm.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
          return;
        }

        const funcionario = this.dbService.getFuncionarioByRut(this.recoveryForm.get('recoveryRut')?.value);
        if (funcionario) {
          this.dbService.updateFuncionarioPassword(funcionario.id, this.recoveryForm.get('newPassword')?.value);
          this.toastService.show('Contraseña actualizada', 'success');
          this.closeModal();
        }
      }
    } catch (error) {
      console.error('Recovery error:', error);
      this.showError = true;
      this.errorMessage = 'Error en el proceso de recuperación';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Formatea el RUT mientras el usuario escribe
   * @param event Evento de input
   * @description Agrega puntos y guión al RUT
   */
  onRutInput(event: any) {
    const input = event.target;
    let rut = input.value.replace(/\./g, '').replace(/-/g, '');
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length > 0) {
      let result = rut;
      if (rut.length > 1) {
        result = rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + rut.slice(-1);
      }
      input.value = result;
    }
  }

  /**
   * Maneja el intento de inicio de sesión
   * @param event Evento del formulario
   * @description Verifica credenciales y redirige al dashboard si son correctas
   */
  async handleSubmit(event: Event) {
    event.preventDefault();
    this.showError = false;
    this.isLoading = true;

    try {
      const cleanRut = this.rut.replace(/\./g, '').replace('-', '');
      const funcionario = this.dbService.getFuncionarioByRut(cleanRut);

      if (funcionario && funcionario.password === this.password) {
        const userData = {
          id: funcionario.id,
          nombres: funcionario.nombres,
          apellidos: funcionario.apellidos,
          rut: funcionario.rut,
          esp_id: funcionario.esp_id,
          especialidad: funcionario.especialidad,
          password: funcionario.password,
          email: funcionario.email,
          telefono: funcionario.telefono
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        const now = new Date();
        const timeStr = now.toLocaleString('es-CL', { 
          hour: '2-digit', 
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        this.toastService.show(`Inicio de sesión exitoso @ ${timeStr}`, 'success');
        
        this.closeModal();
        await this.router.navigate(['/dashboard']);
      } else {
        this.showError = true;
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError = true;
    } finally {
      this.isLoading = false;
    }
  }
} 