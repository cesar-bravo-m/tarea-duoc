import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { Funcionario } from '../../services/database.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html',
  styles: [`
    .login-input {
      max-width: 330px !important;
    }
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
      max-width: 400px;
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
      transition: color 0.2s;
    }

    .close-button:hover {
      color: #2d3748;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .form-footer {
      margin-top: 2rem;
    }

    .login-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #4299e1;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .login-button:hover {
      background-color: #3182ce;
    }

    .form-group input.error {
      border-color: #e53e3e;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      margin-bottom: 1rem;
    }

    .login-button:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }
  `]
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  email: string = '';
  password: string = '';
  showError: boolean = false;
  isLoading: boolean = false;
  funcionarios: Funcionario[] = [];
  private funcionariosSubscription: Subscription;

  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {
    this.funcionariosSubscription = this.dbService.funcionarios$.subscribe(
      funcionarios => this.funcionarios = funcionarios
    );
  }

  closeModal() {
    this.close.emit();
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.showError = false;
    this.isLoading = true;

    try {
      // Query the database for the funcionario with matching email
      const result = this.dbService.tryLogin(this.email, this.password);

      if (result) {
        // Login successful
        const funcionario = this.dbService.getFuncionarioByEmail(this.email);
        if (funcionario) {
          localStorage.setItem('currentUser', JSON.stringify(funcionario));
          this.closeModal();
          this.router.navigate(['/dashboard']);
        } else {
          // Login failed
          this.showError = true;
        }
      } else {
        // Login failed
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