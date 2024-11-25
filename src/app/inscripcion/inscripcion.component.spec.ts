import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscripcionComponent } from './inscripcion.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatabaseService } from '../services/database.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { BehaviorSubject } from 'rxjs';

describe('InscripcionComponent', () => {
  let component: InscripcionComponent;
  let fixture: ComponentFixture<InscripcionComponent>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;

  const mockPaciente = {
    id: 1,
    nombres: 'Juan',
    apellidos: 'Pérez',
    rut: '12345678-9',
    telefono: '912345678',
    email: 'juan.perez@example.com',
    fecha_nacimiento: '1990-01-01',
    genero: 'M',
    direccion: 'Calle 123'
  };

  beforeEach(async () => {
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', [
      'getPacienteByRut',
      'addPaciente'
    ]);

    mockDatabaseService.pacientes$ = new BehaviorSubject([]).asObservable();

    await TestBed.configureTestingModule({
      imports: [
        InscripcionComponent,
        ReactiveFormsModule,
        FormsModule,
        NgxMaskDirective
      ],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService },
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
      
      rutControl?.setValue('12345678-9');
      expect(rutControl?.errors).toBeFalsy();
    });
  });

  describe('RUT Formatting', () => {
    it('should format RUT correctly', () => {
      expect(component.formatRut('123456789')).toBe('12.345.678-9');
      expect(component.formatRut('12345678K')).toBe('12.345.678-K');
      expect(component.formatRut('1234')).toBe('123-4');
    });

    it('should validate RUT correctly', () => {
      expect(component.validateRut('111111111')).toBeTruthy();
      expect(component.validateRut('invalid-rut')).toBeFalsy();
    });
  });

  describe('Patient Search', () => {
    it('should search patient by RUT', () => {
      mockDatabaseService.getPacienteByRut.and.returnValue(mockPaciente);
      component.searchRut = '111111111';
      component.searchPaciente();
      
      expect(mockDatabaseService.getPacienteByRut).toHaveBeenCalledWith('111111111');
      expect(component.showSuccess).toBeTrue();
      expect(component.message).toBe('Paciente encontrado');
    });

    it('should handle patient not found', () => {
      mockDatabaseService.getPacienteByRut.and.returnValue(null);
      component.searchRut = '111111111'
      component.searchPaciente();
      
      expect(component.showError).toBeTrue();
      expect(component.message).toBe('Paciente no encontrado');
    });
n
    it('should validate RUT before search', () => {
      component.searchRut = 'invalid-rut';
      component.searchPaciente();
      
      expect(mockDatabaseService.getPacienteByRut).not.toHaveBeenCalled();
      expect(component.showError).toBeTrue();
      expect(component.message).toBe('RUT inválido');
    });
  });

  describe('Form Submission', () => {
    it('should submit valid form', () => {
      mockDatabaseService.addPaciente.and.callThrough();
      component.pacienteForm.patchValue({
        nombres: 'Juan',
        apellidos: 'Pérez',
        rut: '12345678-9',
        telefono: '912345678',
        email: 'juan.perez@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        direccion: 'Calle 123'
      });

      component.onSubmit();
      
      expect(mockDatabaseService.addPaciente).toHaveBeenCalled();
      expect(component.showSuccess).toBeTrue();
      expect(component.message).toBe('Paciente registrado exitosamente');
    });

    it('should not submit invalid form', () => {
      component.onSubmit();
      
      expect(mockDatabaseService.addPaciente).not.toHaveBeenCalled();
      expect(component.pacienteForm.get('nombres')?.touched).toBeTrue();
    });
  });

  describe('Form Reset', () => {
    it('should reset form and messages', () => {
      component.pacienteForm.patchValue(mockPaciente);
      component.showError = true;
      component.showSuccess = true;
      component.message = 'Test message';
      component.searchRut = '12345678-9';

      component.resetForm();

      expect(component.pacienteForm.pristine).toBeTrue();
      expect(component.showError).toBeFalse();
      expect(component.showSuccess).toBeFalse();
      expect(component.message).toBe('');
      expect(component.searchRut).toBe('');
    });
  });
});
