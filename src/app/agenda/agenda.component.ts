import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, Funcionario, SegmentoHorario } from '../services/database.service';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SegmentoModalComponent } from './segmento-modal/segmento-modal.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, SegmentoModalComponent],
  template: `
    <div class="agenda-container">
      <div class="search-section">
        <h2>Seleccionar Funcionario</h2>
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar por nombre o especialidad"
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
              <p>{{ funcionario.especialidad }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-section" *ngIf="selectedFuncionario">
        <h2>Agenda de {{ selectedFuncionario.nombres }} {{ selectedFuncionario.apellidos }}</h2>
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>

      <app-segmento-modal
        *ngIf="showSegmentoModal && selectedDate"
        [startDate]="selectedDate"
        [funcionario]="selectedFuncionario!"
        (close)="showSegmentoModal = false"
        (submit)="handleSegmentoSubmit($event)"
      ></app-segmento-modal>
    </div>
  `,
  styles: [`
    .agenda-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .search-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-section h2 {
      margin: 0 0 1rem 0;
      color: #2d3748;
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
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .funcionarios-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .funcionario-card {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .funcionario-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-color: #4299e1;
    }

    .funcionario-card.selected {
      background: #ebf8ff;
      border-color: #4299e1;
    }

    .funcionario-info h3 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
      font-size: 1.1rem;
    }

    .funcionario-info p {
      margin: 0;
      color: #718096;
      font-size: 0.9rem;
    }

    .calendar-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .calendar-section h2 {
      margin: 0 0 1.5rem 0;
      color: #2d3748;
    }

    :host ::ng-deep {
      .fc {
        font-family: inherit;
      }

      .fc-toolbar-title {
        font-size: 1.2rem !important;
      }

      .fc-button-primary {
        background-color: #4299e1 !important;
        border-color: #3182ce !important;
      }

      .fc-button-primary:hover {
        background-color: #3182ce !important;
        border-color: #2c5282 !important;
      }

      .fc-event {
        background-color: #4299e1;
        border-color: #3182ce;
      }
    }
  `]
})
export class AgendaComponent implements OnInit {
  searchTerm: string = '';
  funcionarios: Funcionario[] = [];
  filteredFuncionarios: Funcionario[] = [];
  selectedFuncionario: Funcionario | null = null;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: []
  };
  showSegmentoModal = false;
  selectedDate: Date | null = null;

  constructor(private dbService: DatabaseService) {
    this.dbService.funcionarios$.subscribe(
      funcionarios => {
        this.funcionarios = funcionarios;
        this.filteredFuncionarios = funcionarios;
      }
    );
  }

  ngOnInit() {
    this.dbService.loadFuncionarios();
  }

  searchFuncionarios() {
    if (!this.searchTerm.trim()) {
      this.filteredFuncionarios = this.funcionarios;
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredFuncionarios = this.funcionarios.filter(funcionario => 
      funcionario.nombres.toLowerCase().includes(searchTermLower) ||
      funcionario.apellidos.toLowerCase().includes(searchTermLower) ||
      funcionario.especialidad?.toLowerCase().includes(searchTermLower)
    );
  }

  selectFuncionario(funcionario: Funcionario) {
    this.selectedFuncionario = funcionario;
    // Load shifts for the selected funcionario
    this.loadShifts(funcionario.id);
  }

  loadShifts(funcionarioId: number) {
    const segmentos = this.dbService.getSegmentosHorarioByFuncionarioId(funcionarioId);
    const events: EventInput[] = segmentos.map(segmento => ({
      title: segmento.nombre,
      start: segmento.fecha_hora_inicio,
      end: segmento.fecha_hora_fin,
      funcionarioId: segmento.fun_id
    }));

    this.calendarOptions.events = events;
  }

  handleDateSelect(selectInfo: any) {
    if (!this.selectedFuncionario) {
      alert('Por favor seleccione un funcionario primero');
      selectInfo.view.calendar.unselect();
      return;
    }

    this.selectedDate = selectInfo.start;
    this.showSegmentoModal = true;
    selectInfo.view.calendar.unselect();
  }

  handleSegmentoSubmit(segmento: SegmentoHorario) {
    try {
      this.dbService.addSegmentoHorario(segmento);
      this.loadShifts(this.selectedFuncionario!.id);
    } catch (error) {
      console.error('Error creating segmento:', error);
      alert('Error al crear el segmento horario');
    }
    this.showSegmentoModal = false;
    this.selectedDate = null;
  }

  handleEventClick(clickInfo: any) {
    if (confirm('¿Desea eliminar este segmento horario?')) {
      clickInfo.event.remove();
    }
  }
}
