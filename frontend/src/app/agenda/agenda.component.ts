import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Funcionario, SegmentoHorario } from '../services/api.service';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SegmentoModalComponent } from './segmento-modal/segmento-modal.component';
import { ToastService } from '../services/toast.service';

/**
 * Componente que maneja la agenda de los funcionarios
 * @description Permite a los funcionarios gestionar sus horarios de atención
 */
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
            <span class="specialty" *ngIf="selectedFuncionario">{{ selectedFuncionario.especialidad.nombre }}</span>
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
                <p>{{ funcionario.especialidad.nombre }}</p>
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
  /** Referencia al componente de calendario */
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  
  /** Término de búsqueda para funcionarios */
  searchTerm: string = '';
  /** Lista de todos los funcionarios */
  funcionarios: Funcionario[] = [];
  /** Lista de funcionarios filtrados por búsqueda */
  filteredFuncionarios: Funcionario[] = [];
  /** Funcionario seleccionado actualmente */
  selectedFuncionario: Funcionario | null = null;

  /** Configuración del calendario */
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

  /** Indica si se debe mostrar el modal de segmento */
  showSegmentoModal = false;
  /** Fecha seleccionada para nuevo segmento */
  selectedDate: Date | null = null;
  /** Segmento seleccionado para edición */
  selectedSegmento: SegmentoHorario | null = null;
  /** Indica si la pantalla es pequeña */
  isSmallScreen: boolean = false;

  /**
   * Escucha cambios en el tamaño de la ventana
   * @description Actualiza la vista del calendario según el tamaño de pantalla
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    this.apiService.getFuncionarios().subscribe(
      funcionarios => {
        this.funcionarios = funcionarios.map(f => ({
          ...f,
          hasAvailableSegments: this.checkFuncionarioAvailability(f.id)
        }));
        this.filteredFuncionarios = this.funcionarios;
      }
    );
    this.checkScreenSize();
  }

  private checkFuncionarioAvailability(funcionarioId: number): boolean {
    // Get segmentos from API
    let hasAvailability = false;
    this.apiService.getSegmentosHorarioByFuncionarioId(funcionarioId).subscribe(
      segmentos => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        hasAvailability = segmentos.some(segmento => {
          const segmentoDate = new Date(segmento.fechaHoraInicio);
          return segmento.free && 
                 segmentoDate >= startOfWeek && 
                 segmentoDate < endOfWeek;
        });
      }
    );
    return hasAvailability;
  }

  /**
   * Verifica el tamaño de la pantalla
   * @description Actualiza isSmallScreen y la vista del calendario
   * @private
   */
  private checkScreenSize() {
    const wasSmallScreen = this.isSmallScreen;
    this.isSmallScreen = window.innerWidth < 768;

    if (wasSmallScreen !== this.isSmallScreen) {
      this.updateCalendarView();
    }
  }

  /**
   * Actualiza la vista del calendario
   * @description Cambia entre vista diaria y semanal según el tamaño de pantalla
   * @private
   */
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

  /**
   * Inicializa el componente
   * @description Carga la lista de funcionarios
   */
  ngOnInit() {
    // Load funcionarios from API
    this.apiService.getFuncionarios().subscribe();
  }

  /**
   * Filtra funcionarios según término de búsqueda
   * @description Actualiza filteredFuncionarios basado en searchTerm
   */
  searchFuncionarios() {
    if (!this.searchTerm.trim()) {
      this.filteredFuncionarios = this.funcionarios;
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredFuncionarios = this.funcionarios.filter(funcionario => 
      funcionario.nombres.toLowerCase().includes(searchTermLower) ||
      funcionario.apellidos.toLowerCase().includes(searchTermLower) ||
      funcionario.especialidad.nombre.toLowerCase().includes(searchTermLower)
    );
  }

  /**
   * Selecciona un funcionario y carga sus horarios
   * @param funcionario Funcionario seleccionado
   */
  selectFuncionario(funcionario: Funcionario) {
    this.selectedFuncionario = funcionario;
    this.loadSegmentos(funcionario.id);
    
    setTimeout(() => {
      this.updateCalendarView();
    }, 0);
  }

  /**
   * Carga los horarios de un funcionario
   * @param funcionarioId ID del funcionario
   * @description Actualiza los eventos del calendario con los segmentos del funcionario
   */
  loadSegmentos(funcionarioId: number) {
    this.apiService.getSegmentosHorarioByFuncionarioId(funcionarioId).subscribe(
      segmentos => {
        const events: EventInput[] = segmentos.map(segmento => ({
          id: segmento.id.toString(),
          title: segmento.nombre,
          start: segmento.fechaHoraInicio,
          end: segmento.fechaHoraFin,
          backgroundColor: segmento.free ? '#48bb78' : '#fc8181',
          borderColor: segmento.free ? '#38a169' : '#f56565',
          extendedProps: {
            segmento: segmento
          }
        }));

        this.calendarOptions.events = events;
      }
    );
  }

  /**
   * Maneja la selección de una fecha en el calendario
   * @param selectInfo Información de la selección
   * @description Abre el modal para crear un nuevo segmento
   */
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

  /**
   * Maneja el envío del formulario de segmento
   * @param segmento Segmento a guardar
   * @description Crea o actualiza un segmento horario
   */
  handleSegmentoSubmit(segmento: SegmentoHorario) {
    try {
      if (segmento.id === 0) {
        this.apiService.createSegmentoHorario(segmento).subscribe({
          next: () => {
            this.loadSegmentos(this.selectedFuncionario!.id);
            this.toastService.show('Segmento creado exitosamente', 'success');
          },
          error: (error) => {
            console.error('Error creating segmento:', error);
            this.toastService.show('Error al crear el segmento', 'error');
          }
        });
      } else {
        this.apiService.updateSegmentoHorario(segmento.id, segmento).subscribe({
          next: () => {
            this.loadSegmentos(this.selectedFuncionario!.id);
            this.toastService.show('Segmento actualizado exitosamente', 'success');
          },
          error: (error) => {
            console.error('Error updating segmento:', error);
            this.toastService.show('Error al actualizar el segmento', 'error');
          }
        });
      }
    } catch (error) {
      console.error('Error saving segmento:', error);
      this.toastService.show('Error al guardar el segmento', 'error');
    }
    this.showSegmentoModal = false;
    this.selectedSegmento = null;
  }

  /**
   * Maneja la eliminación de un segmento
   * @param id ID del segmento a eliminar
   */
  handleSegmentoDelete(id: number) {
    try {
      this.apiService.deleteSegmentoHorario(id).subscribe({
        next: () => {
          this.loadSegmentos(this.selectedFuncionario!.id);
          this.toastService.show('Segmento eliminado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error deleting segmento:', error);
          this.toastService.show('Error al eliminar el segmento', 'error');
        }
      });
    } catch (error) {
      console.error('Error deleting segmento:', error);
      this.toastService.show('Error al eliminar el segmento', 'error');
    }
  }

  /**
   * Maneja el clic en un evento del calendario
   * @param clickInfo Información del evento clickeado
   * @description Abre el modal para editar el segmento
   */
  handleEventClick(clickInfo: any) {
    const segmentoId = parseInt(clickInfo.event.id);
    this.apiService.getSegmentoHorarioById(segmentoId).subscribe({
      next: (segmento) => {
        if (segmento) {
          this.selectedSegmento = segmento;
          this.showSegmentoModal = true;
        }
      },
      error: (error) => {
        console.error('Error loading segmento:', error);
        this.toastService.show('Error al cargar el segmento', 'error');
      }
    });
  }

  /**
   * Alterna la visibilidad de la sección de búsqueda
   * @description Limpia la selección actual si está colapsada
   */
  toggleSearch() {
    if (this.selectedFuncionario) {
      this.selectedFuncionario = null;
      this.searchTerm = '';
      this.searchFuncionarios();
    }
  }
}
