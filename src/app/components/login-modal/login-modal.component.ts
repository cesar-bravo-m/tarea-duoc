import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  
  rut: string = '';
  password: string = '';
  
  isRecovering: boolean = false;
  recoveryRut: string = '';
  recoveryCode: string = '';
  recoveryCodeSent: boolean = false;
  recoveryCodeVerified: boolean = false;
  newPassword: string = '';
  generatedCode: string = '';
  
  showError: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = 'RUT o contraseña incorrectos';

  constructor(
    private dbService: DatabaseService,
    private router: Router,
    private toastService: ToastService
  ) {}

  closeModal() {
    this.close.emit();
  }

  startRecovery() {
    this.isRecovering = true;
    this.showError = false;
    this.errorMessage = '';
  }

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

  handleRecovery(event: Event) {
    event.preventDefault();
    this.showError = false;
    this.isLoading = true;

    try {
      if (!this.recoveryCodeSent) {
        const funcionario = this.dbService.getFuncionarioByRut(this.recoveryRut);
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
        if (this.recoveryCode !== this.generatedCode) {
          this.showError = true;
          this.errorMessage = 'Código inválido';
          return;
        }
        
        this.recoveryCodeVerified = true;
        this.errorMessage = '';
      } 
      else {
        if (this.newPassword.length < 6) {
          this.showError = true;
          this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
          return;
        }

        const funcionario = this.dbService.getFuncionarioByRut(this.recoveryRut);
        if (funcionario) {
          this.dbService.updateFuncionarioPassword(funcionario.id, this.newPassword);
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
          especialidad: funcionario.especialidad
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