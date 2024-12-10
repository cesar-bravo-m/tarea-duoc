import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  // ... component decorator remains the same ...
})
export class InscripcionComponent implements OnInit {
  // ... other properties remain the same ...

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    this.pacienteForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      rut: ['', [Validators.required, this.rutValidator()]],
      telefono: ['(56) 9 ', [Validators.required, Validators.minLength(12)]],
      email: ['', [Validators.required, Validators.email]],
      fecha_nacimiento: ['', [
        Validators.required, 
        this.dateOfBirthValidator()
      ]],
      genero: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  /**
   * Validador personalizado para fecha de nacimiento
   * @returns ValidatorFn que verifica que la fecha sea válida
   */
  dateOfBirthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;  // Let required validator handle empty values
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      const minDate = new Date('1900-01-01');

      // Check if it's a valid date
      if (isNaN(inputDate.getTime())) {
        return { invalidDate: true };
      }

      // Check if date is before 1900
      if (inputDate < minDate) {
        return { dateTooEarly: true };
      }

      // Check if date is in the future
      if (inputDate > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  getErrorMessage(fieldName: string): string {
    const control = this.pacienteForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['pattern']) {
        if (fieldName === 'telefono') return 'Formato de teléfono inválido';
        if (fieldName === 'rut') return 'RUT inválido';
        return 'Formato inválido';
      }
      if (control.errors['invalidDate']) return 'Fecha inválida';
      if (control.errors['dateTooEarly']) return 'La fecha debe ser posterior a 1900';
      if (control.errors['futureDate']) return 'La fecha no puede ser futura';
    }
    return '';
  }

  // ... rest of the component remains the same ...
} 