import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, Paciente } from '../services/database.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

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
export class InscripcionComponent {
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

  /**
   * Constructor del componente
   * @param fb Servicio de formulario reactivo
   * @param dbService Servicio de base de datos
   */
  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService
  ) {
    this.pacienteForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      rut: ['', [Validators.required, Validators.pattern(/^[0-9]{7,8}-[0-9Kk]$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9\-\+]{9,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      fecha_nacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  /**
   * Inicializa el componente
   * @description Carga los datos necesarios del servicio
   */
  ngOnInit() {
    this.dbService.loadPacientes();
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
    }
    return '';
  }

  /**
   * Formatea el RUT mientras el usuario escribe
   * @param rut RUT a formatear
   * @returns RUT formateado con puntos y guión
   */
  formatRut(rut: string): string {
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    
    if (!rut || rut.length <= 1) return rut;

    let verificationDigit = '';
    let numbers = rut;
    
    if (rut.length > 1) {
      verificationDigit = rut.slice(-1);
      numbers = rut.slice(0, -1);
    }

    let formattedNumbers = numbers.split('').reverse().join('')
      .match(/.{1,3}/g)?.join('.')
      .split('').reverse().join('') || numbers;

    return verificationDigit ? `${formattedNumbers}-${verificationDigit}` : formattedNumbers;
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
   * Formatea el RUT mientras el usuario escribe
   * @param event Evento de entrada
   * @description Formatea el RUT ingresado para que cumpla con el formato estándar
   */
  onRutInput(event: any) {
    const input = event.target;
    let rut = input.value.replace(/\./g, '').replace(/-/g, '');
    
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length > 0) {
      input.value = this.formatRut(rut);
    }
  }

  /**
   * Busca un paciente por RUT
   * @description Actualiza el formulario con los datos del paciente si se encuentra
   */
  searchPaciente() {
    if (!this.searchRut) {
      this.showError = true;
      this.message = 'Ingrese un RUT para buscar';
      return;
    }

    if (!this.validateRut(this.searchRut)) {
      this.showError = true;
      this.message = 'RUT inválido';
      return;
    }

    const paciente = this.dbService.getPacienteByRut(this.searchRut.replace(/\./g, '').replace('-', ''));
    if (paciente) {
      this.pacienteForm.patchValue(paciente);
      this.showSuccess = true;
      this.message = 'Paciente encontrado';
    } else {
      this.showError = true;
      this.message = 'Paciente no encontrado';
      this.pacienteForm.reset();
    }
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
      const paciente = this.pacienteForm.value as Paciente;
      this.dbService.addPaciente(paciente);
      this.showSuccess = true;
      this.message = 'Paciente registrado exitosamente';
      this.pacienteForm.reset();
      this.searchRut = '';
    } catch (error) {
      this.showError = true;
      this.message = 'Error al registrar paciente';
      console.error(error);
    } finally {
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
}