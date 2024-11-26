import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { DatabaseService, Funcionario } from '../../services/database.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

/**
 * Componente que maneja el modal de registro de funcionarios
 * @description Permite registrar nuevos funcionarios en el sistema con validación de campos
 */
@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent {
  /** Evento emitido para cerrar el modal */
  @Output() close = new EventEmitter<void>();
  
  /** Formulario reactivo para el registro */
  registerForm: FormGroup;
  /** Indica si hay un error que mostrar */
  showError = false;
  /** Indica si hay una operación en curso */
  isLoading = false;
  /** Mensaje de error para mostrar al usuario */
  errorMessage = '';
  /** Lista de especialidades disponibles */
  especialidades: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(4)]],
      apellidos: ['', [Validators.required, Validators.minLength(4)]],
      rut: ['', [Validators.required, this.rutValidator()]],
      telefono: ['(56) 9 ', [Validators.required, Validators.minLength(12)]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator()]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      esp_id: ['', Validators.required]
    }, { validator: this.passwordMatchValidator() });

    this.dbService.especialidades$.subscribe(
      esp => this.especialidades = esp
    );
  }

  /**
   * Valida el RUT ingresado
   * @param rut RUT a validar
   * @returns boolean indicando si el RUT es válido
   */
  validateRut(rut: string): boolean {
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    if (!/^[0-9]{7,8}[0-9Kk]$/.test(rut)) return false;
    const verificationDigit = rut.slice(-1).toUpperCase();
    const numbers = rut.slice(0, -1);
    let sum = 0;
    let multiplier = 2;
    for (let i = numbers.length - 1; i >= 0; i--) {
      sum += parseInt(numbers[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const expectedDigit = 11 - (sum % 11);
    let expectedVerificationDigit: string;
    if (expectedDigit === 11) expectedVerificationDigit = '0';
    else if (expectedDigit === 10) expectedVerificationDigit = 'K';
    else expectedVerificationDigit = expectedDigit.toString();
    return verificationDigit === expectedVerificationDigit;
  }

  /**
   * Validador personalizado para el RUT
   * @returns ValidatorFn para validar el formato del RUT
   */
  rutValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const rut = control.value;
      if (!rut) return null;
      return this.validateRut(rut) ? null : { invalidRut: true };
    };
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
      this.registerForm.patchValue({ rut: result }, { emitEvent: false });
    }
  }

  /**
   * Validador para asegurar que las contraseñas coincidan
   * @returns ValidatorFn para comparar password y confirmPassword
   */
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  /**
   * Verifica si un campo del formulario es inválido
   * @param fieldName Nombre del campo a verificar
   * @returns boolean indicando si el campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  /**
   * Cierra el modal de registro
   * @description Emite el evento close
   */
  closeModal() {
    this.close.emit();
  }

  /**
   * Maneja el envío del formulario
   * @description Valida y procesa el registro del nuevo funcionario
   */
  async handleSubmit() {
    if (this.registerForm.invalid) return;

    this.showError = false;
    this.isLoading = true;

    try {
      const formValue = this.registerForm.value;
      
      const existingUser = this.dbService.getFuncionarioByRut(formValue.rut);
      if (existingUser) {
        this.showError = true;
        this.errorMessage = 'Este RUT ya está registrado';
        this.isLoading = false;
        return;
      }

      const newFuncionario = {
        id: 0,
        nombres: formValue.nombres,
        apellidos: formValue.apellidos,
        rut: formValue.rut.replace(/\./g, '').replace('-', ''),
        telefono: formValue.telefono,
        email: formValue.email,
        password: formValue.password,
        esp_id: parseInt(formValue.esp_id)
      } as Funcionario;

      this.dbService.addFuncionario(newFuncionario);
      
      this.toastService.show('Usuario registrado. Inicie sesión con su RUT y contraseña.', 'success');
      
      this.closeModal();
      
    } catch (error) {
      console.error('Registration error:', error);
      this.showError = true;
      this.errorMessage = 'Error al registrar. Por favor intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Validador personalizado para el dominio del email
   * @returns ValidatorFn para validar que el email tenga un dominio válido
   */
  emailDomainValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      
      if (!email.includes('@')) return { invalidEmail: true };

      const [localPart, domain] = email.split('@');
      
      if (!domain || !domain.includes('.')) return { invalidDomain: true };

      const parts = domain.split('.');
      const tld = parts[parts.length - 1];
      
      if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
        return { invalidTld: true };
      }

      return null;
    };
  }

  /**
   * Obtiene el mensaje de error para un campo
   * @param fieldName Nombre del campo
   * @returns Mensaje de error correspondiente al tipo de error
   */
  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Formato de email inválido';
      if (control.errors['invalidDomain']) return 'El dominio del email es inválido';
      if (control.errors['invalidTld']) return 'El dominio debe tener una extensión válida (ej: .com, .net)';
      if (control.errors['pattern']) {
        if (fieldName === 'telefono') return 'Formato de teléfono inválido';
        if (fieldName === 'password') return 'La contraseña debe tener al menos una mayúscula, una minúscula y un número';
        return 'Formato inválido';
      }
      if (control.errors['invalidRut']) return 'RUT inválido';
    }
    return '';
  }
} 