import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { DatabaseService, Especialidad, Funcionario, Paciente, SegmentoHorario, Cupo, Cita } from './services/database.service';
import { Subscription } from 'rxjs';

/**
 * Componente principal de la aplicación
 * @description Maneja la inicialización de la base de datos y la gestión de datos globales
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  /** Lista de especialidades médicas */
  especialidades: Especialidad[] = [];
  /** Lista de funcionarios del hospital */
  funcionarios: Funcionario[] = [];
  /** Lista de pacientes registrados */
  pacientes: Paciente[] = [];
  /** Lista de segmentos horarios */
  segmentosHorario: SegmentoHorario[] = [];
  /** Lista de cupos disponibles */
  cupos: Cupo[] = [];
  /** Lista de citas médicas */
  citas: Cita[] = [];
  /** Título para nueva especialidad */
  newEspecialidadTitle: string = '';
  /** Indica si la aplicación está cargando */
  loading: boolean = true;
  /** Mensaje de error si existe */
  error: string | null = null;

  /** Suscripciones a los observables de la base de datos */
  private especialidadesSubscription: Subscription;
  private funcionariosSubscription: Subscription;
  private pacientesSubscription: Subscription;
  private segmentosHorarioSubscription: Subscription;
  private cuposSubscription: Subscription;
  private citasSubscription: Subscription;

  /**
   * Constructor del componente
   * @param dbService Servicio de base de datos
   * @description Inicializa las suscripciones a los observables de la base de datos
   */
  constructor(private dbService: DatabaseService) {
    this.especialidadesSubscription = this.dbService.especialidades$.subscribe(
      especialidades => this.especialidades = especialidades
    );
    this.funcionariosSubscription = this.dbService.funcionarios$.subscribe(
      funcionarios => this.funcionarios = funcionarios
    );
    this.pacientesSubscription = this.dbService.pacientes$.subscribe(
      pacientes => this.pacientes = pacientes
    );
    this.segmentosHorarioSubscription = this.dbService.segmentosHorario$.subscribe(
      segmentosHorario => this.segmentosHorario = segmentosHorario
    );
    this.cuposSubscription = this.dbService.cupos$.subscribe(
      cupos => this.cupos = cupos
    );
    this.citasSubscription = this.dbService.citas$.subscribe(
      citas => this.citas = citas
    );
  }

  /**
   * Inicializa el componente
   * @description Inicializa la base de datos y carga los datos iniciales
   */
  async ngOnInit() {
    try {
      await this.dbService.initializeDatabase();
      this.dbService.loadEspecialidades();
      this.loading = false;
    } catch (err) {
      this.error = 'Failed to initialize database';
      this.loading = false;
      console.error(err);
    }
  }

  /**
   * Limpia las suscripciones al destruir el componente
   * @description Evita memory leaks cancelando todas las suscripciones
   */
  ngOnDestroy() {
    if (this.especialidadesSubscription) {
      this.especialidadesSubscription.unsubscribe();
    }
    if (this.funcionariosSubscription) {
      this.funcionariosSubscription.unsubscribe();
    }
    if (this.pacientesSubscription) {
      this.pacientesSubscription.unsubscribe();
    } 
    if (this.segmentosHorarioSubscription) {
      this.segmentosHorarioSubscription.unsubscribe();
    } 
    if (this.cuposSubscription) {
      this.cuposSubscription.unsubscribe();
    } 
    if (this.citasSubscription) {
      this.citasSubscription.unsubscribe();
    } 
  }
}
