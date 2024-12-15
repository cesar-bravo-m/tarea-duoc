import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  roles: Rol[];
}

export interface Funcionario {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  especialidad: Especialidad;
  roles: Rol[];
}

export interface Paciente {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
}

export interface Especialidad {
  id: number;
  nombre: string;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface Cita {
  id: number;
  paciente: Paciente;
  segmentoHorario: SegmentoHorario;
}

export interface SegmentoHorario {
  id: number;
  nombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  free: boolean;
  funcionario: Funcionario;
}

export interface Rol {
  id: number;
  nombre: string;
}

/**
 * Servicio para interactuar con el API del Hospital Scheduler
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // private readonly baseUrl = 'http://54.242.17.123:8080/api';
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Manejador de errores para las solicitudes API
   * @param error Respuesta de error HTTP
   * @returns Observable con el mensaje de error
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Authenticate a funcionario
   * @param credentials Credenciales de inicio de sesión
   * @returns Observable con la respuesta de inicio de sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/funcionarios/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all funcionarios
   * @returns Observable con el array de funcionarios
   */
  getFuncionarios(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(`${this.baseUrl}/funcionarios`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new funcionario
   * @param funcionario Datos del funcionario
   * @returns Observable con el funcionario creado
   */
  createFuncionario(funcionario: Funcionario): Observable<Funcionario> {
    return this.http.post<Funcionario>(`${this.baseUrl}/funcionarios`, funcionario)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get funcionario by ID
   * @param id ID del funcionario
   * @returns Observable con los datos del funcionario
   */
  getFuncionarioById(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.baseUrl}/funcionarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update funcionario
   * @param id Funcionario ID
   * @param funcionario Datos actualizados del funcionario
   * @returns Observable con el resultado de la operación
   */
  updateFuncionario(id: number, funcionario: Funcionario): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/funcionarios/${id}`, funcionario)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete funcionario
   * @param id ID del funcionario
   * @returns Observable con el resultado de la operación
   */
  deleteFuncionario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/funcionarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get funcionario by RUT
   * @param rut RUT del funcionario
   * @returns Observable con los datos del funcionario
   */
  getFuncionarioByRut(rut: string): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.baseUrl}/funcionarios/rut/${rut}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all pacientes
   * @returns Observable con el array de pacientes
   */
  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.baseUrl}/pacientes`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new paciente
   * @param paciente Datos del paciente
   * @returns Observable con el resultado de la operación
   */
  createPaciente(paciente: Paciente): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/pacientes`, paciente)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update a paciente
   * @param paciente Datos del paciente
   * @returns Observable con el resultado de la operación
   */
  updatePaciente(paciente: Paciente): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/pacientes/${paciente.id}`, paciente)
      .pipe(catchError(this.handleError));
  }

  /**
   * Assign segmento horario to paciente
   * @param pacienteId Paciente ID
   * @param segmentoHorarioId ID del segmento horario
   * @returns Observable con la cita creada
   */
  assignSegmentoToPaciente(pacienteId: number, segmentoHorarioId: number): Observable<Cita> {
    const params = new HttpParams()
      .set('pacienteId', pacienteId.toString())
      .set('segmentoHorarioId', segmentoHorarioId.toString());

    return this.http.post<Cita>(`${this.baseUrl}/citas/assign`, null, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all especialidades
   * @returns Observable con el array de especialidades
   */
  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all roles
   * @returns Observable con el array de roles
   */
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/roles`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get roles for a funcionario
   * @param funcionarioId ID del funcionario
   * @returns Observable con el array de roles
   */
  getFuncionarioRoles(funcionarioId: number): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/funcionarios/${funcionarioId}/roles`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if funcionario has a specific role
   * @param funcionarioId Funcionario ID
   * @param rolNombre Nombre del rol
   * @returns Observable con el resultado booleano
   */
  hasRole(funcionarioId: number, rolNombre: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/funcionarios/${funcionarioId}/roles/${rolNombre}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all segmentos horarios for a funcionario
   * @param funcionarioId ID del funcionario
   * @returns Observable con el array de segmentos horarios
   */
  getSegmentosHorarioByFuncionarioId(funcionarioId: number): Observable<SegmentoHorario[]> {
    return this.http.get<SegmentoHorario[]>(`${this.baseUrl}/funcionarios/${funcionarioId}/segmentos`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get segmento horario by ID
   * @param id ID del segmento horario
   * @returns Observable con los datos del segmento horario
   */
  getSegmentoHorarioById(id: number): Observable<SegmentoHorario> {
    return this.http.get<SegmentoHorario>(`${this.baseUrl}/segmentos-horarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new segmento horario
   * @param segmento Datos del segmento horario
   * @returns Observable con el segmento horario creado
   */
  createSegmentoHorario(segmento: SegmentoHorario): Observable<SegmentoHorario> {
    return this.http.post<SegmentoHorario>(`${this.baseUrl}/segmentos-horarios`, segmento)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update segmento horario
   * @param id Segmento horario ID
   * @param segmento Datos actualizados del segmento horario
   * @returns Observable con el resultado de la operación
   */
  updateSegmentoHorario(id: number, segmento: SegmentoHorario): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/segmentos-horarios/${id}`, segmento)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete segmento horario
   * @param id ID del segmento horario
   * @returns Observable con el resultado de la operación
   */
  deleteSegmentoHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/segmentos-horarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update funcionario password
   * @param id Funcionario ID
   * @param newPassword Nueva contraseña
   * @returns Observable con el resultado de la operación
   */
  updateFuncionarioPassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/funcionarios/${id}/password`, { password: newPassword })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get paciente by RUT
   * @param rut RUT del paciente
   * @returns Observable con los datos del paciente
   */
  getPacienteByRut(rut: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/pacientes/rut/${rut}`)
      .pipe(catchError(this.handleError));
  }
}
