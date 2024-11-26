import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterModalComponent } from './register-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

// Mock interfaces
interface MockFuncionario {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
  telefono: string;
  email: string;
  password: string;
  esp_id: number;
  especialidad?: string;
}

interface MockEspecialidad {
  id: number;
  nombre: string;
}

describe('RegisterModalComponent', () => {
  let component: RegisterModalComponent;
  let fixture: ComponentFixture<RegisterModalComponent>;
  let mockDatabaseService: any;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockFuncionario: MockFuncionario = {
    id: 1,
    nombres: 'Test',
    apellidos: 'User',
    rut: '11.111.111-1',
    telefono: '912345678',
    email: 'test@example.com',
    password: 'Password123',
    esp_id: 1,
    especialidad: 'Test Especialidad'
  };

  beforeEach(async () => {
    mockDatabaseService = {
      getFuncionarioByRut: jasmine.createSpy('getFuncionarioByRut'),
      addFuncionario: jasmine.createSpy('addFuncionario'),
      especialidades$: new BehaviorSubject<MockEspecialidad[]>([
        { id: 1, nombre: 'Test Especialidad' }
      ]).asObservable()
    };

    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterModalComponent,
        ReactiveFormsModule,
        NgxMaskDirective
      ],
      providers: [
        { provide: 'DatabaseService', useValue: mockDatabaseService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        provideNgxMask()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with invalid form', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('should validate required fields', () => {
      const form = component.registerForm;
      expect(form.get('nombres')?.errors?.['required']).toBeTruthy();
      expect(form.get('apellidos')?.errors?.['required']).toBeTruthy();
      expect(form.get('rut')?.errors?.['required']).toBeTruthy();
      expect(form.get('email')?.errors?.['required']).toBeTruthy();
      expect(form.get('password')?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors).toBeFalsy();
    });

    it('should validate password format', () => {
      const passwordControl = component.registerForm.get('password');
      
      // Too short
      passwordControl?.setValue('Aa1');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();

      // No uppercase
      passwordControl?.setValue('password123');
      expect(passwordControl?.errors?.['pattern']).toBeTruthy();

      // No lowercase
      passwordControl?.setValue('PASSWORD123');
      expect(passwordControl?.errors?.['pattern']).toBeTruthy();

      // No number
      passwordControl?.setValue('Password');
      expect(passwordControl?.errors?.['pattern']).toBeTruthy();

      // Valid password
      passwordControl?.setValue('Password123');
      expect(passwordControl?.errors).toBeFalsy();
    });

    it('should validate password match', () => {
      component.registerForm.patchValue({
        password: 'Password123',
        confirmPassword: 'DifferentPass123'
      });
      expect(component.registerForm.errors?.['passwordMismatch']).toBeTruthy();

      component.registerForm.patchValue({
        confirmPassword: 'Password123'
      });
      expect(component.registerForm.errors?.['passwordMismatch']).toBeFalsy();
    });
  });

  describe('RUT Validation', () => {
    it('should format RUT correctly', () => {
      const event = {
        target: { value: '123456789' }
      };
      component.onRutInput(event);
      expect(component.registerForm.get('rut')?.value).toBe('12.345.678-9');
    });

    it('should validate RUT format', () => {
      const rutControl = component.registerForm.get('rut');
      rutControl?.setValue('invalid-rut');
      expect(rutControl?.errors?.['invalidRut']).toBeTruthy();
      
      rutControl?.setValue('11.111.111-1');
      expect(rutControl?.errors).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit if form is invalid', async () => {
      await component.handleSubmit();
      expect(mockDatabaseService.addFuncionario).not.toHaveBeenCalled();
      expect(mockToastService.show).not.toHaveBeenCalled();
    });

    it('should not register duplicate RUT', async () => {
      mockDatabaseService.getFuncionarioByRut.and.returnValue(mockFuncionario);
      
      component.registerForm.patchValue({
        nombres: 'Test',
        apellidos: 'User',
        rut: '11.111.111-1',
        telefono: '912345678',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        esp_id: 1
      });

      await component.handleSubmit();
      expect(mockDatabaseService.addFuncionario).not.toHaveBeenCalled();
    });
  });
});
