import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, Especialidad, Funcionario, Paciente, SegmentoHorario, Cupo, Cita } from './services/database.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  especialidades: Especialidad[] = [];
  funcionarios: Funcionario[] = [];
  pacientes: Paciente[] = [];
  segmentosHorario: SegmentoHorario[] = [];
  cupos: Cupo[] = [];
  citas: Cita[] = [];
  newEspecialidadTitle: string = '';
  loading: boolean = true;
  error: string | null = null;
  private especialidadesSubscription: Subscription;
  private funcionariosSubscription: Subscription;
  private pacientesSubscription: Subscription;
  private segmentosHorarioSubscription: Subscription;
  private cuposSubscription: Subscription;
  private citasSubscription: Subscription;

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

  // addTask() {
  //   try {
  //     this.dbService.addTask(this.newTaskTitle);
  //     this.newTaskTitle = '';
  //   } catch (err) {
  //     this.error = 'Failed to add task';
  //     console.error(err);
  //   }
  // }

  // toggleTask(task: Task) {
  //   try {
  //     this.dbService.toggleTask(task);
  //   } catch (err) {
  //     this.error = 'Failed to update task';
  //     console.error(err);
  //   }
  // }

  // deleteTask(id: number) {
  //   try {
  //     this.dbService.deleteTask(id);
  //   } catch (err) {
  //     this.error = 'Failed to delete task';
  //     console.error(err);
  //   }
  // }

  exportDatabase() {
    try {
      const data = this.dbService.exportDatabase();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tasks.db';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      this.error = 'Failed to export database';
      console.error(err);
    }
  }
}
