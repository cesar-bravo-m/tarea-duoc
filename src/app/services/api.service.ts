import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interfaces based on OpenAPI schemas
 */
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
  genero: 'M' | 'F';
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

/**
 * Service for interacting with the Hospital Scheduler API
 * @description Implements all endpoints defined in the OpenAPI specification
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Error handler for API requests
   * @param error HTTP error response
   * @returns Observable with error message
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
   * @param credentials Login credentials
   * @returns Observable with login response
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/funcionarios/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all funcionarios
   * @returns Observable with array of funcionarios
   */
  getFuncionarios(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(`${this.baseUrl}/funcionarios`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new funcionario
   * @param funcionario Funcionario data
   * @returns Observable with created funcionario
   */
  createFuncionario(funcionario: Funcionario): Observable<Funcionario> {
    return this.http.post<Funcionario>(`${this.baseUrl}/funcionarios`, funcionario)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get funcionario by ID
   * @param id Funcionario ID
   * @returns Observable with funcionario data
   */
  getFuncionarioById(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.baseUrl}/funcionarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update funcionario
   * @param id Funcionario ID
   * @param funcionario Updated funcionario data
   * @returns Observable with operation result
   */
  updateFuncionario(id: number, funcionario: Funcionario): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/funcionarios/${id}`, funcionario)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete funcionario
   * @param id Funcionario ID
   * @returns Observable with operation result
   */
  deleteFuncionario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/funcionarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get funcionario by RUT
   * @param rut Funcionario RUT
   * @returns Observable with funcionario data
   */
  getFuncionarioByRut(rut: string): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.baseUrl}/funcionarios/rut/${rut}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all pacientes
   * @returns Observable with array of pacientes
   */
  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.baseUrl}/pacientes`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new paciente
   * @param paciente Paciente data
   * @returns Observable with operation result
   */
  createPaciente(paciente: Paciente): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/pacientes`, paciente)
      .pipe(catchError(this.handleError));
  }

  /**
   * Assign segmento horario to paciente
   * @param pacienteId Paciente ID
   * @param segmentoHorarioId Segmento horario ID
   * @returns Observable with created cita
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
   * @returns Observable with array of especialidades
   */
  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all roles
   * @returns Observable with array of roles
   */
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/roles`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get roles for a funcionario
   * @param funcionarioId Funcionario ID
   * @returns Observable with array of roles
   */
  getFuncionarioRoles(funcionarioId: number): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/funcionarios/${funcionarioId}/roles`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if funcionario has a specific role
   * @param funcionarioId Funcionario ID
   * @param rolNombre Role name
   * @returns Observable with boolean result
   */
  hasRole(funcionarioId: number, rolNombre: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/funcionarios/${funcionarioId}/roles/${rolNombre}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all segmentos horarios for a funcionario
   * @param funcionarioId Funcionario ID
   * @returns Observable with array of segmentos horarios
   */
  getSegmentosHorarioByFuncionarioId(funcionarioId: number): Observable<SegmentoHorario[]> {
    return this.http.get<SegmentoHorario[]>(`${this.baseUrl}/funcionarios/${funcionarioId}/segmentos`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get segmento horario by ID
   * @param id Segmento horario ID
   * @returns Observable with segmento horario data
   */
  getSegmentoHorarioById(id: number): Observable<SegmentoHorario> {
    return this.http.get<SegmentoHorario>(`${this.baseUrl}/segmentos-horarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new segmento horario
   * @param segmento Segmento horario data
   * @returns Observable with created segmento horario
   */
  createSegmentoHorario(segmento: SegmentoHorario): Observable<SegmentoHorario> {
    return this.http.post<SegmentoHorario>(`${this.baseUrl}/segmentos-horarios`, segmento)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update segmento horario
   * @param id Segmento horario ID
   * @param segmento Updated segmento horario data
   * @returns Observable with operation result
   */
  updateSegmentoHorario(id: number, segmento: SegmentoHorario): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/segmentos-horarios/${id}`, segmento)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete segmento horario
   * @param id Segmento horario ID
   * @returns Observable with operation result
   */
  deleteSegmentoHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/segmentos-horarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update funcionario password
   * @param id Funcionario ID
   * @param newPassword New password
   * @returns Observable with operation result
   */
  updateFuncionarioPassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/funcionarios/${id}/password`, { password: newPassword })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get paciente by RUT
   * @param rut Paciente RUT
   * @returns Observable with paciente data
   */
  getPacienteByRut(rut: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/pacientes/rut/${rut}`)
      .pipe(catchError(this.handleError));
  }
}
