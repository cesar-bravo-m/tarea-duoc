import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, Funcionario, SegmentoHorario } from '../services/database.service';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
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
      <div class="search-section" [class.collapsed]="selectedFuncionario">
        <div class="search-header" (click)="toggleSearch()">
          <div class="header-content">
            <h2>{{ selectedFuncionario ? selectedFuncionario.nombres + ' ' + selectedFuncionario.apellidos : 'Seleccionar Funcionario' }}</h2>
            <span class="specialty" *ngIf="selectedFuncionario">{{ selectedFuncionario.especialidad }}</span>
          </div>
          <button class="toggle-btn">
            {{ selectedFuncionario ? '▼' : '▲' }}
          </button>
        </div>

        <div class="search-content" [class.hidden]="selectedFuncionario">
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
      </div>

      <div class="calendar-section" *ngIf="selectedFuncionario">
        <full-calendar #calendar [options]="calendarOptions"></full-calendar>
      </div>

      <app-segmento-modal
        *ngIf="showSegmentoModal"
        [startDate]="selectedDate!"
        [funcionario]="selectedFuncionario!"
        [segmentoToEdit]="selectedSegmento"
        (close)="showSegmentoModal = false"
        (submit)="handleSegmentoSubmit($event)"
        (delete)="handleSegmentoDelete($event)"
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
      transition: all 0.3s ease;
    }

    .search-section.collapsed {
      padding: 0.75rem;
      margin-bottom: 1rem;
    }

    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .header-content {
      flex: 1;
    }

    .header-content h2 {
      margin: 0;
      color: #2d3748;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .specialty {
      font-size: 0.9rem;
      color: #718096;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: #4a5568;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.25rem;
      transition: transform 0.3s ease;
      margin-left: 1rem;
    }

    .search-content {
      margin-top: 1rem;
      transition: all 0.3s ease;
      max-height: 500px;
      overflow: hidden;
    }

    .search-content.hidden {
      margin-top: 0;
      max-height: 0;
      opacity: 0;
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
    initialView: window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: window.innerWidth < 768 ? 'today' : 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '24:00:00',
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
  selectedSegmento: SegmentoHorario | null = null;
  isSmallScreen: boolean = false;
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(private dbService: DatabaseService) {
    this.dbService.funcionarios$.subscribe(
      funcionarios => {
        this.funcionarios = funcionarios;
        this.filteredFuncionarios = funcionarios;
      }
    );
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasSmallScreen = this.isSmallScreen;
    this.isSmallScreen = window.innerWidth < 768;

    // Only update calendar if screen size category changed
    if (wasSmallScreen !== this.isSmallScreen) {
      this.updateCalendarView();
    }
  }

  private updateCalendarView() {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      if (this.isSmallScreen) {
        calendarApi.changeView('timeGridDay');
        this.calendarOptions = {
          ...this.calendarOptions,
          headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }
        };
      } else {
        calendarApi.changeView('timeGridWeek');
        this.calendarOptions = {
          ...this.calendarOptions,
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }
        };
      }
    }
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
    this.loadShifts(funcionario.id);
    
    // Ensure correct view is set after loading shifts
    setTimeout(() => {
      this.updateCalendarView();
    }, 0);
  }

  loadShifts(funcionarioId: number) {
    const segmentos = this.dbService.getSegmentosHorarioByFuncionarioId(funcionarioId);
    const events: EventInput[] = segmentos.map(segmento => ({
      id: segmento.id.toString(),
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
      if (segmento.id === 0) {
        console.log("### creating", segmento);
        this.dbService.addSegmentoHorario(segmento);
      } else {
        console.log("### updating", segmento);
        this.dbService.updateSegmentoHorario(segmento);
      }
      this.loadShifts(this.selectedFuncionario!.id);
    } catch (error) {
      console.error('Error saving segmento:', error);
      alert('Error al guardar el segmento horario');
    }
    this.showSegmentoModal = false;
    this.selectedSegmento = null;
  }

  handleSegmentoDelete(id: number) {
    try {
      this.dbService.deleteSegmentoHorario(id);
      this.loadShifts(this.selectedFuncionario!.id);
    } catch (error) {
      console.error('Error deleting segmento:', error);
      alert('Error al eliminar el segmento horario');
    }
  }

  handleEventClick(clickInfo: any) {
    console.log("### clickInfo", clickInfo);
    const segmento = this.dbService.getSegmentoHorarioById(clickInfo.event.id);
    if (segmento) {
      this.selectedSegmento = segmento;
      this.showSegmentoModal = true;
    }
  }

  toggleSearch() {
    if (this.selectedFuncionario) {
      this.selectedFuncionario = null;
      this.searchTerm = '';
      this.searchFuncionarios();
    }
  }
}
