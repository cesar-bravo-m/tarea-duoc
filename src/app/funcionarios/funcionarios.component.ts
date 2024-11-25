import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, Funcionario } from '../services/database.service';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="funcionarios-container">
      <div class="search-section">
        <h2>Buscar Funcionario</h2>
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar por nombre"
            class="search-input"
            (input)="searchFuncionarios()"
          >
        </div>

        <div class="funcionarios-list" *ngIf="filteredFuncionarios.length > 0">
          <div 
            *ngFor="let funcionario of filteredFuncionarios" 
            class="funcionario-card"
            [class.selected]="selectedFuncionario?.id === funcionario.id"
            (click)="selectFuncionario(funcionario)"
          >
            <div class="funcionario-info">
              <h3>{{ funcionario.nombres }} {{ funcionario.apellidos }}</h3>
              <p class="especialidad">{{ funcionario.especialidad }}</p>
              <p class="email">{{ funcionario.email }}</p>
              <p class="telefono">{{ funcionario.telefono }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="searchTerm && filteredFuncionarios.length === 0" class="no-results">
          No se encontraron funcionarios
        </div>
      </div>

      <div class="form-section">
        <div class="form-header">
          <h2>{{ selectedFuncionario ? 'Editar' : 'Nuevo' }} Funcionario</h2>
          <button 
            *ngIf="selectedFuncionario" 
            type="button"
            class="delete-btn" 
            (click)="deleteFuncionario()"
          >
            Eliminar
          </button>
        </div>

        <form [formGroup]="funcionarioForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label for="nombres">Nombres</label>
              <input 
                id="nombres" 
                type="text" 
                formControlName="nombres"
                [class.error]="isFieldInvalid('nombres')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('nombres')">
                {{ getErrorMessage('nombres') }}
              </div>
            </div>

            <div class="form-group">
              <label for="apellidos">Apellidos</label>
              <input 
                id="apellidos" 
                type="text" 
                formControlName="apellidos"
                [class.error]="isFieldInvalid('apellidos')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('apellidos')">
                {{ getErrorMessage('apellidos') }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <input 
                id="email" 
                type="email" 
                formControlName="email"
                [class.error]="isFieldInvalid('email')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('email')">
                {{ getErrorMessage('email') }}
              </div>
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input 
                id="telefono" 
                type="tel" 
                formControlName="telefono"
                [class.error]="isFieldInvalid('telefono')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('telefono')">
                {{ getErrorMessage('telefono') }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="esp_id">Especialidad</label>
              <select 
                id="esp_id" 
                formControlName="esp_id"
                [class.error]="isFieldInvalid('esp_id')"
              >
                <option value="">Seleccione una especialidad</option>
                <option *ngFor="let esp of especialidades" [value]="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
              <div class="error-message" *ngIf="isFieldInvalid('esp_id')">
                {{ getErrorMessage('esp_id') }}
              </div>
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <input 
                id="password" 
                type="password" 
                formControlName="password"
                [class.error]="isFieldInvalid('password')"
              >
              <div class="error-message" *ngIf="isFieldInvalid('password')">
                {{ getErrorMessage('password') }}
              </div>
            </div>
          </div>

          <div class="message-container">
            <div *ngIf="showError" class="error-alert">{{ errorMessage }}</div>
            <div *ngIf="showSuccess" class="success-alert">{{ successMessage }}</div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="resetForm()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="submit-btn" 
              [disabled]="funcionarioForm.invalid || isLoading"
            >
              {{ isLoading ? 'Guardando...' : (selectedFuncionario ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .funcionarios-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .search-section, .form-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-box {
      margin-bottom: 1.5rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
    }

    .funcionarios-list {
      display: grid;
      gap: 1rem;
    }

    .funcionario-card {
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .funcionario-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .funcionario-card.selected {
      border-color: #4299e1;
      background-color: #ebf8ff;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #4a5568;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group input.error,
    .form-group select.error {
      border-color: #fc8181;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .submit-btn, .cancel-btn, .delete-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .submit-btn {
      background-color: #4299e1;
      color: white;
    }

    .cancel-btn {
      background-color: #e2e8f0;
      color: #4a5568;
    }

    .delete-btn {
      background-color: #fc8181;
      color: white;
    }

    .submit-btn:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FuncionariosComponent implements OnInit {
  funcionarioForm: FormGroup;
  funcionarios: Funcionario[] = [];
  especialidades: any[] = [];
  filteredFuncionarios: Funcionario[] = [];
  selectedFuncionario: Funcionario | null = null;
  searchTerm: string = '';
  showError = false;
  showSuccess = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService
  ) {
    this.funcionarioForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9\-\+]{9,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      esp_id: ['', Validators.required]
    });

    this.dbService.funcionarios$.subscribe(
      funcionarios => {
        this.funcionarios = funcionarios.map(funcionario => ({
          ...funcionario,
          especialidad: this.getEspecialidadNombre(funcionario.esp_id)
        }));
        this.searchFuncionarios();
      }
    );

    this.dbService.especialidades$.subscribe(
      especialidades => {
        this.especialidades = especialidades;
      }
    );
  }

  ngOnInit() {
    this.dbService.loadFuncionarios();
    this.dbService.loadEspecialidades();
  }

  searchFuncionarios() {
    if (!this.searchTerm.trim()) {
      this.filteredFuncionarios = [];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredFuncionarios = this.funcionarios.filter(funcionario => 
      funcionario.nombres.toLowerCase().includes(searchTermLower) ||
      funcionario.apellidos.toLowerCase().includes(searchTermLower)
    );
  }

  getEspecialidadNombre(esp_id: number): string {
    const especialidad = this.especialidades.find(esp => esp.id === esp_id);
    return especialidad ? especialidad.nombre : '';
  }

  selectFuncionario(funcionario: Funcionario) {
    console.log("Selected funcionario:", funcionario); // Debug log
    this.selectedFuncionario = funcionario;
    
    // Explicitly set each form control value
    this.funcionarioForm.setValue({
      nombres: funcionario.nombres || '',
      apellidos: funcionario.apellidos || '',
      email: funcionario.email || '',
      telefono: funcionario.telefono || '',
      esp_id: funcionario.esp_id || '',
      password: '' // Always empty for security
    });

    // Mark form as pristine and untouched after setting values
    this.funcionarioForm.markAsPristine();
    this.funcionarioForm.markAsUntouched();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.funcionarioForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.funcionarioForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['pattern']) {
        if (fieldName === 'telefono') return 'Formato de teléfono inválido';
        return 'Formato inválido';
      }
    }
    return '';
  }

  onSubmit() {
    if (this.funcionarioForm.invalid) {
      Object.keys(this.funcionarioForm.controls).forEach(key => {
        const control = this.funcionarioForm.get(key);
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
      const formValue = this.funcionarioForm.value;
      const funcionario = {
        ...formValue,
        id: this.selectedFuncionario?.id || 0,
        esp_id: parseInt(formValue.esp_id)
      } as Funcionario;

      this.dbService.addFuncionario(funcionario);
      this.showSuccess = true;
      this.successMessage = `Funcionario ${this.selectedFuncionario ? 'actualizado' : 'guardado'} exitosamente`;
      this.resetForm();
    } catch (error) {
      this.showError = true;
      this.errorMessage = 'Error al guardar funcionario';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  deleteFuncionario() {
    if (this.selectedFuncionario && confirm('¿Está seguro de eliminar este funcionario?')) {
      try {
        this.dbService.deleteFuncionario(this.selectedFuncionario.id);
        this.showSuccess = true;
        this.successMessage = 'Funcionario eliminado exitosamente';
        this.resetForm();
      } catch (error) {
        this.showError = true;
        this.errorMessage = 'Error al eliminar funcionario';
        console.error(error);
      }
    }
  }

  resetForm() {
    this.funcionarioForm.reset();
    this.selectedFuncionario = null;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
