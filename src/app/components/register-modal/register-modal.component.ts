import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { DatabaseService, Funcionario } from '../../services/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent {
  @Output() close = new EventEmitter<void>();
  
  registerForm: FormGroup;
  showError = false;
  isLoading = false;
  errorMessage = '';
  especialidades: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      rut: ['', [Validators.required, this.rutValidator()]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9\-\+]{9,}$/)]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator()]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      esp_id: ['', Validators.required]
    }, { validator: this.passwordMatchValidator() });

    this.dbService.especialidades$.subscribe(
      esp => this.especialidades = esp
    );
  }

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

  rutValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const rut = control.value;
      if (!rut) return null;
      return this.validateRut(rut) ? null : { invalidRut: true };
    };
  }

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

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  closeModal() {
    this.close.emit();
  }

  async handleSubmit() {
    if (this.registerForm.invalid) return;

    this.showError = false;
    this.isLoading = true;

    try {
      const formValue = this.registerForm.value;
      
      // Check if RUT already exists
      const existingUser = this.dbService.getFuncionarioByRut(formValue.rut);
      if (existingUser) {
        this.showError = true;
        this.errorMessage = 'Este RUT ya está registrado';
        this.isLoading = false;
        return;
      }

      console.log("### formValue", formValue);
      // Create new funcionario object
      const newFuncionario = {
        id: 0,
        nombres: formValue.nombres,
        apellidos: formValue.apellidos,
        rut: formValue.rut.replace(/\./g, '').replace('-', ''), // Store RUT without dots and dash
        telefono: formValue.telefono,
        email: formValue.email,
        password: formValue.password,
        esp_id: parseInt(formValue.esp_id)
      } as Funcionario;

      // Add to database
      this.dbService.addFuncionario(newFuncionario);
      
      // Close modal and show success message
      this.closeModal();
      
    } catch (error) {
      console.error('Registration error:', error);
      this.showError = true;
      this.errorMessage = 'Error al registrar. Por favor intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  emailDomainValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      
      // Basic email format check
      if (!email.includes('@')) return { invalidEmail: true };

      const [localPart, domain] = email.split('@');
      
      // Check if domain exists and has at least one dot
      if (!domain || !domain.includes('.')) return { invalidDomain: true };

      // Check if domain has a valid TLD
      const parts = domain.split('.');
      const tld = parts[parts.length - 1];
      
      // TLD should be at least 2 characters long and contain only letters
      if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
        return { invalidTld: true };
      }

      return null;
    };
  }

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