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
  styleUrl: './register-modal.component.css'
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
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9\-\+]{9,}$/)]],
      email: ['', [Validators.required, Validators.email]],
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

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      const res = password === confirmPassword ? null : { passwordMismatch: true };
      control.get('confirmPassword')?.setErrors(res);
      return res;
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
      
      // Check if email already exists
      const existingUser = this.dbService.getFuncionario(formValue.email);
      if (existingUser) {
        this.showError = true;
        this.errorMessage = 'Este correo electrónico ya está registrado';
        return;
      }

      // Create new funcionario object
      const newFuncionario = {
        id: 0,
        nombres: formValue.nombres,
        apellidos: formValue.apellidos,
        telefono: formValue.telefono,
        email: formValue.email,
        password: formValue.password,
        esp_id: formValue.esp_id
      } as Funcionario;

      // Add to database
      this.dbService.addFuncionario(newFuncionario);
      
      // Close modal and show success message
      this.closeModal();
      // You could add a toast notification here for success
      
    } catch (error) {
      console.error('Registration error:', error);
      this.showError = true;
      this.errorMessage = 'Error al registrar. Por favor intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }
} 