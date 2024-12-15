import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ApiService, Paciente } from '../services/api.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ToastService } from '../services/toast.service';

/**
 * Componente que maneja la inscripción de pacientes
 * @description Permite registrar nuevos pacientes y buscar pacientes existentes
 */
@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.css']
})
export class InscripcionComponent implements OnInit {
  pacienteForm: FormGroup;
  /** RUT para búsqueda de pacientes */
  searchRut: string = '';
  /** Indica si hay un error que mostrar */
  showError = false;
  /** Indica si hay un mensaje de éxito que mostrar */
  showSuccess = false;
  /** Mensaje para mostrar al usuario */
  message = '';
  /** Indica si hay una operación en curso */
  isLoading = false;
  /** ID del paciente */
  pacienteId = 0;

  /**
   * Constructor del componente
   * @param fb Servicio de formulario reactivo
   * @param apiService Servicio de base de datos
   * @param toastService Servicio de notificaciones
   */
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    this.pacienteForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-Z]+$/)]],
      apellidos: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-Z]+$/)]],
      rut: ['', [Validators.required, this.rutValidator()]],
      telefono: ['(56) 9 ', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator()]],
      fecha_nacimiento: ['', [Validators.required, this.dateOfBirthValidator()]],
      genero: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  /**
   * Validador personalizado para validar el formato del RUT
   * @returns ValidatorFn para validar el formato del RUT
   */
  rutValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const rut = control.value;
      if (!rut) return null;
      
      // Remove formatting before validation
      const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
      
      if (!/^[0-9]{7,8}[0-9Kk]$/.test(cleanRut)) {
        return { invalidRut: true };
      }

      return this.validateRut(cleanRut) ? null : { invalidRut: true };
    };
  }

  /**
   * Inicializa el componente
   * @description Carga los datos necesarios del servicio
   */
  ngOnInit() {
  }

  /**
   * Verifica si un campo del formulario es inválido
   * @param fieldName Nombre del campo a verificar
   * @returns boolean indicando si el campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.pacienteForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  /**
   * Obtiene el mensaje de error para un campo
   * @param fieldName Nombre del campo
   * @returns Mensaje de error correspondiente al tipo de error
   */
  getErrorMessage(fieldName: string): string {
    const control = this.pacienteForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['pattern']) {
        switch(fieldName) {
          case 'rut': return 'Formato de RUT inválido (ej: 12345678-9)';
          case 'telefono': return 'Formato de teléfono inválido';
          default: return 'Formato inválido';
        }
      }
      if (control.errors['invalidDate']) return 'Fecha inválida';
      if (control.errors['dateTooEarly']) return 'La fecha debe ser posterior a 1900';
      if (control.errors['futureDate']) return 'La fecha no puede ser futura';
    }
    return '';
  }

  /**
   * Formatea el RUT mientras el usuario escribe
   * @param rut RUT a formatear
   * @returns RUT formateado con puntos y guión
   */
  formatRut(rut: string): string {
    if (!rut) return '';
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    if (rut.length > 1) {
      return rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + rut.slice(-1);
    }
    return rut;
  }

  /**
   * Valida el RUT ingresado
   * @param rut RUT a validar
   * @returns boolean indicando si el RUT es válido
   */
  validateRut(rut: string): boolean {
    // Remove any dots and dash before validation
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
    if (!/^[0-9Kk.-]+$/.test(rut)) return false;
    
    return verificationDigit === expectedVerificationDigit;
  }

  /**
   * Formatea el RUT mientras el usuario escribe
   * @param event Evento de entrada
   * @description Formatea el RUT ingresado para que cumpla con el formato estándar
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
      this.searchRut = result;
    }
  }

  /**
   * Busca un paciente por RUT
   * @description Actualiza el formulario con los datos del paciente si se encuentra
   */
  searchPaciente() {
    const cleanRut = this.searchRut.replace(/\./g, '').replace(/-/g, '');
    
    if (!this.validateRut(cleanRut)) {
      this.showError = true;
      this.message = 'RUT inválido';
      return;
    }

    this.apiService.getPacienteByRut(cleanRut).subscribe({
      next: (paciente) => {
        if (paciente) {
          // Format the date to YYYY-MM-DD for the input field
          const fechaNacimiento = paciente.fechaNacimiento ? 
            new Date(paciente.fechaNacimiento).toISOString().split('T')[0] : '';
          this.pacienteId = paciente.id;

          this.pacienteForm.patchValue({
            ...paciente,
            rut: this.formatRut(paciente.rut),
            fecha_nacimiento: fechaNacimiento  // Use the formatted date
          });
          this.showSuccess = true;
          this.message = 'Paciente encontrado';
        } else {
          this.showError = true;
          this.message = 'Paciente no encontrado';
        }
      },
      error: (error) => {
        console.error('Error searching paciente:', error);
        this.showError = true;
        this.message = 'Error al buscar paciente';
      }
    });
  }

  /**
   * Maneja el envío del formulario
   * @description Crea o actualiza un paciente según los datos del formulario
   */
  onSubmit() {
    if (this.pacienteForm.invalid) {
      Object.keys(this.pacienteForm.controls).forEach(key => {
        const control = this.pacienteForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    this.showError = false;
    this.showSuccess = false;

    try {
      const formValue = this.pacienteForm.value;
      const paciente: Paciente = {
        id: this.message === 'Paciente encontrado' ? this.pacienteId : 0,
        nombres: formValue.nombres,
        apellidos: formValue.apellidos,
        rut: formValue.rut.replace(/\./g, '').replace(/-/g, ''),
        telefono: formValue.telefono,
        email: formValue.email,
        fechaNacimiento: formValue.fecha_nacimiento,
        genero: formValue.genero,
        direccion: formValue.direccion
      };

      if (this.message === 'Paciente encontrado') {
        this.apiService.updatePaciente(paciente).subscribe({
          next: () => {
            this.toastService.show('Paciente actualizado exitosamente', 'success');
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating paciente:', error);
            this.showError = true;
            this.message = 'Error al registrar paciente';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.apiService.createPaciente(paciente).subscribe({
          next: () => {
            this.toastService.show('Paciente creado exitosamente', 'success');
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating paciente:', error);
            this.showError = true;
            this.message = 'Error al registrar paciente';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } catch (error) {
      this.showError = true;
      this.message = 'Error al registrar paciente';
      console.error(error);
      this.isLoading = false;
    }
  }

  /**
   * Reinicia el formulario
   * @description Limpia todos los campos y mensajes
   */
  resetForm() {
    this.pacienteForm.reset();
    this.showError = false;
    this.showSuccess = false;
    this.message = '';
    this.searchRut = '';
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
   * Validador personalizado para la fecha de nacimiento
   * @returns ValidatorFn para validar la fecha de nacimiento
   */
  dateOfBirthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      const minDate = new Date('1900-01-01');

      if (isNaN(inputDate.getTime())) {
        return { invalidDate: true };
      }

      if (inputDate < minDate) {
        return { dateTooEarly: true };
      }

      if (inputDate > today) {
        return { futureDate: true };
      }

      return null;
    };
  }
}