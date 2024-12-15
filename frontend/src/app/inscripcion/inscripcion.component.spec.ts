import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscripcionComponent } from './inscripcion.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { of, throwError } from 'rxjs';

describe('InscripcionComponent', () => {
  let component: InscripcionComponent;
  let fixture: ComponentFixture<InscripcionComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const mockPaciente = {
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
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getPacienteByRut', 'createPaciente', 'updatePaciente']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        InscripcionComponent,
        ReactiveFormsModule,
        FormsModule,
        NgxMaskDirective
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideNgxMask()
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    
    fixture = TestBed.createComponent(InscripcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Validación de formulario', () => {
    it('debe marcar el formulario como inválido cuando está vacío', () => {
      expect(component.pacienteForm.valid).toBeFalse();
    });

    it('debe validar el formato del RUT correctamente', () => {
      const rutControl = component.pacienteForm.get('rut');
      
      rutControl?.setValue('12345678-9');
      expect(rutControl?.valid).toBeTrue();
      
      rutControl?.setValue('12345678-K');
      expect(rutControl?.valid).toBeTrue();
      
      rutControl?.setValue('123456789');
      expect(rutControl?.valid).toBeFalse();
    });

    it('debe validar el formato del email correctamente', () => {
      const emailControl = component.pacienteForm.get('email');
      
      emailControl?.setValue('correo@dominio.com');
      expect(emailControl?.valid).toBeTrue();
      
      emailControl?.setValue('correo.invalido');
      expect(emailControl?.valid).toBeFalse();
    });

    it('debe validar la fecha de nacimiento correctamente', () => {
      const fechaControl = component.pacienteForm.get('fecha_nacimiento');
      
      fechaControl?.setValue('2024-12-31');
      expect(fechaControl?.errors?.['futureDate']).toBeTrue();
      
      fechaControl?.setValue('1800-01-01');
      expect(fechaControl?.errors?.['dateTooEarly']).toBeTrue();
      
      fechaControl?.setValue('1990-01-01');
      expect(fechaControl?.valid).toBeTrue();
    });
  });

  describe('Búsqueda de paciente', () => {
    it('debe encontrar un paciente existente', () => {
      apiService.getPacienteByRut.and.returnValue(of(mockPaciente));
      component.searchRut = '12345678-9';
      
      component.searchPaciente();
      
      expect(component.showSuccess).toBeTrue();
      expect(component.message).toBe('Paciente encontrado');
      expect(component.pacienteForm.get('nombres')?.value).toBe(mockPaciente.nombres);
    });

    // it('debe mostrar error cuando el paciente no existe', () => {
    //   apiService.getPacienteByRut.and.returnValue(of(null));
    //   component.searchRut = '12345678-9';
    //   
    //   component.searchPaciente();
    //   
    //   expect(component.showError).toBeTrue();
    //   expect(component.message).toBe('Paciente no encontrado');
    // });

    it('debe manejar errores de búsqueda', () => {
      apiService.getPacienteByRut.and.returnValue(throwError(() => new Error('Error de API')));
      component.searchRut = '12345678-9';
      
      component.searchPaciente();
      
      expect(component.showError).toBeTrue();
      expect(component.message).toBe('Error al buscar paciente');
    });
  });

  describe('Guardado de paciente', () => {
    beforeEach(() => {
      component.pacienteForm.patchValue({
        nombres: 'Juan',
        apellidos: 'Pérez',
        rut: '12345678-9',
        telefono: '(56) 9 1234 5678',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        genero: 'M',
        direccion: 'Calle 123'
      });
    });

    // it('debe crear un nuevo paciente exitosamente', () => {
    //   apiService.createPaciente.and.returnValue(of(mockPaciente));
    //   
    //   component.onSubmit();
    //   
    //   expect(apiService.createPaciente).toHaveBeenCalled();
    //   expect(toastService.show).toHaveBeenCalledWith('Paciente creado exitosamente', 'success');
    // });

    // it('debe actualizar un paciente existente exitosamente', () => {
    //   component.message = 'Paciente encontrado';
    //   apiService.updatePaciente.and.returnValue(of(mockPaciente));
    //   
    //   component.onSubmit();
    //   
    //   expect(apiService.updatePaciente).toHaveBeenCalled();
    //   expect(toastService.show).toHaveBeenCalledWith('Paciente actualizado exitosamente', 'success');
    // });

    it('debe manejar errores al guardar', () => {
      apiService.createPaciente.and.returnValue(throwError(() => new Error('Error de API')));
      
      component.onSubmit();
      
      expect(component.showError).toBeTrue();
      expect(component.message).toBe('Error al registrar paciente');
    });
  });

  describe('Reinicio de formulario', () => {
    it('debe limpiar el formulario y los mensajes', () => {
      component.showError = true;
      component.showSuccess = true;
      component.message = 'Mensaje de prueba';
      component.searchRut = '12345678-9';
      
      component.resetForm();
      
      expect(component.showError).toBeFalse();
      expect(component.showSuccess).toBeFalse();
      expect(component.message).toBe('');
      expect(component.searchRut).toBe('');
      expect(component.pacienteForm.pristine).toBeTrue();
    });
  });
});
