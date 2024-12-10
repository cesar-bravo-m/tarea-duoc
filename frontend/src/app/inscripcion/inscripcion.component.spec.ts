import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscripcionComponent } from './inscripcion.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService, Paciente } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { of, throwError } from 'rxjs';

describe('InscripcionComponent', () => {
  let component: InscripcionComponent;
  let fixture: ComponentFixture<InscripcionComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockPaciente: Paciente = {
    id: 1,
    nombres: 'Juan',
    apellidos: 'Pérez',
    rut: '12345678-9',
    telefono: '(56) 9 1234 5678',
    email: 'juan@example.com',
    fechaNacimiento: '1990-01-01',
    genero: 'M',
    direccion: 'Calle 123'
  };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', [
      'getPacienteByRut',
      'createPaciente'
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        InscripcionComponent,
        ReactiveFormsModule,
        FormsModule,
        NgxMaskDirective
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ToastService, useValue: mockToastService },
        provideNgxMask()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with invalid form', () => {
      expect(component.pacienteForm.valid).toBeFalsy();
    });

    it('should validate required fields', () => {
      const form = component.pacienteForm;
      expect(form.get('nombres')?.errors?.['required']).toBeTruthy();
      expect(form.get('apellidos')?.errors?.['required']).toBeTruthy();
      expect(form.get('rut')?.errors?.['required']).toBeTruthy();
      expect(form.get('telefono')?.errors?.['required']).toBeTruthy();
      expect(form.get('email')?.errors?.['required']).toBeTruthy();
      expect(form.get('fecha_nacimiento')?.errors?.['required']).toBeTruthy();
      expect(form.get('genero')?.errors?.['required']).toBeTruthy();
      expect(form.get('direccion')?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.pacienteForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors).toBeFalsy();
    });

    it('should validate RUT format', () => {
      const rutControl = component.pacienteForm.get('rut');
      rutControl?.setValue('invalid-rut');
      expect(rutControl?.errors?.['pattern']).toBeTruthy();
      
      rutControl?.setValue('12.345.678-9');
      expect(rutControl?.errors).toBeFalsy();
    });

    it('should validate date of birth is not before 1900', () => {
      const dateControl = component.pacienteForm.get('fecha_nacimiento');
      dateControl?.setValue('1899-12-31');
      expect(dateControl?.errors?.['dateTooEarly']).toBeTruthy();
      
      dateControl?.setValue('1900-01-01');
      expect(dateControl?.errors?.['dateTooEarly']).toBeFalsy();
    });

    it('should validate date of birth is not in the future', () => {
      const dateControl = component.pacienteForm.get('fecha_nacimiento');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      dateControl?.setValue(tomorrow.toISOString().split('T')[0]);
      expect(dateControl?.errors?.['futureDate']).toBeTruthy();
      
      const today = new Date().toISOString().split('T')[0];
      dateControl?.setValue(today);
      expect(dateControl?.errors?.['futureDate']).toBeFalsy();
    });

    it('should validate date format', () => {
      const dateControl = component.pacienteForm.get('fecha_nacimiento');
      dateControl?.setValue('invalid-date');
      expect(dateControl?.errors?.['invalidDate']).toBeTruthy();
      
      dateControl?.setValue('1990-01-01');
      expect(dateControl?.errors?.['invalidDate']).toBeFalsy();
    });
  });

  describe('RUT Search', () => {
    it('should find existing patient', () => {
      mockApiService.getPacienteByRut.and.returnValue(of(mockPaciente));
      component.searchRut = '12.345.678-9';
      
      component.searchPaciente();
      
      expect(component.showSuccess).toBeTrue();
      expect(component.message).toBe('Paciente encontrado');
      expect(component.pacienteForm.value.nombres).toBe(mockPaciente.nombres);
    });

    it('should handle patient not found', () => {
      mockApiService.getPacienteByRut.and.returnValue(throwError(() => new Error('Not found')));
      component.searchRut = '12.345.678-9';
      
      component.searchPaciente();
      
      expect(component.showError).toBeTrue();
      expect(component.message).toBe('Error al buscar paciente');
    });

    it('should validate RUT before search', () => {
      component.searchRut = 'invalid-rut';
      
      component.searchPaciente();
      
      expect(component.showError).toBeTrue();
      expect(component.message).toBe('RUT inválido');
      expect(mockApiService.getPacienteByRut).not.toHaveBeenCalled();
    });
  });

  describe('Patient Registration', () => {
    it('should register new patient successfully', () => {
      mockApiService.createPaciente.and.returnValue(of(void 0));
      
      component.pacienteForm.patchValue({
        nombres: 'Juan',
        apellidos: 'Pérez',
        rut: '12.345.678-9',
        telefono: '(56) 9 1234 5678',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        direccion: 'Calle 123'
      });

      component.onSubmit();
      
      expect(mockApiService.createPaciente).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Paciente creado exitosamente',
        'success'
      );
    });

    it('should not submit invalid form', () => {
      component.onSubmit();
      
      expect(mockApiService.createPaciente).not.toHaveBeenCalled();
      expect(component.pacienteForm.get('nombres')?.touched).toBeTrue();
    });

    it('should handle registration error', () => {
      mockApiService.createPaciente.and.returnValue(
        throwError(() => new Error('Registration failed'))
      );
      
      component.pacienteForm.patchValue({
        nombres: 'Juan',
        apellidos: 'Pérez',
        rut: '12.345.678-9',
        telefono: '(56) 9 1234 5678',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        direccion: 'Calle 123'
      });

      component.onSubmit();
      
      expect(component.showError).toBeTrue();
      expect(component.message).toBe('Error al registrar paciente');
    });
  });

  describe('Form Reset', () => {
    it('should reset form and messages', () => {
      component.pacienteForm.patchValue(mockPaciente);
      component.showError = true;
      component.showSuccess = true;
      component.message = 'Test message';
      
      component.resetForm();
      
      expect(component.pacienteForm.pristine).toBeTrue();
      expect(component.showError).toBeFalse();
      expect(component.showSuccess).toBeFalse();
      expect(component.message).toBe('');
    });
  });
}); 