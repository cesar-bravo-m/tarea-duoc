import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { ApiService, Especialidad, Funcionario, Paciente, SegmentoHorario } from './services/api.service';

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
  /** Título para nueva especialidad */
  newEspecialidadTitle: string = '';
  /** Indica si la aplicación está cargando */
  loading: boolean = true;
  /** Mensaje de error si existe */
  error: string | null = null;

  /**
   * Constructor del componente
   * @param apiService Servicio de base de datos
   * @description Inicializa las suscripciones a los observables de la base de datos
   */
  constructor(private apiService: ApiService) {
  }

  /**
   * Inicializa el componente
   * @description Inicializa los datos globales
   */
  async ngOnInit() {
  }

  /**
   * Limpia las suscripciones al destruir el componente
   * @description Evita memory leaks cancelando todas las suscripciones
   */
  ngOnDestroy() {
  }
}
