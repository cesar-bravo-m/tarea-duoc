import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';

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
  showError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {}

  closeModal() {
    this.close.emit();
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
      // Clean RUT format before querying
      const cleanRut = this.rut.replace(/\./g, '').replace('-', '');
      const funcionario = this.dbService.getFuncionarioByRut(cleanRut);

      if (funcionario && funcionario.password === this.password) {
        // Store only necessary user data
        const userData = {
          id: funcionario.id,
          nombres: funcionario.nombres,
          apellidos: funcionario.apellidos,
          rut: funcionario.rut,
          esp_id: funcionario.esp_id,
          especialidad: funcionario.especialidad
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
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