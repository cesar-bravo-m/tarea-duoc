import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Funcionario, SegmentoHorario, Paciente } from '../services/api.service';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ToastService } from '../services/toast.service';
import { Observable, map } from 'rxjs';

/**
 * Componente que maneja la asignación de citas médicas
 * @description Permite asignar pacientes a segmentos horarios de funcionarios
 */
@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  /** Referencia al componente de calendario */
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  
  /** Término de búsqueda para funcionarios */
  searchTerm: string = '';
  /** RUT del paciente a buscar */
  searchRut: string = '';
  /** Lista de funcionarios con información de disponibilidad */
  funcionarios: FuncionarioWithAvailability[] = [];
  /** Lista filtrada de funcionarios */
  filteredFuncionarios: FuncionarioWithAvailability[] = [];
  /** Funcionario seleccionado actualmente */
  selectedFuncionario: Funcionario | null = null;
  /** Segmento horario seleccionado */
  selectedSegmento: SegmentoHorario | null = null;
  /** Paciente seleccionado */
  selectedPaciente: Paciente | null = null;
  /** Indica si se debe mostrar el modal de asignación */
  showAssignModal = false;
  /** Indica si hay un error que mostrar */
  showError = false;
  /** Indica si hay un mensaje de éxito que mostrar */
  showSuccess = false;
  /** Mensaje de error */
  errorMessage = '';
  /** Mensaje de éxito */
  successMessage = '';
  /** Indica si la pantalla es pequeña */
  isSmallScreen: boolean = false;
  /** Lista de pacientes */
  pacientes: Paciente[] = [];

  /** Configuración del calendario */
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: window.innerWidth < 768 ? 'today' : 'timeGridWeek,timeGridDay'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    weekends: true,
    eventClick: this.handleEventClick.bind(this),
    events: []
  };

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
    this.apiService.getFuncionarios().subscribe({
      next: (funcionarios) => {
        this.funcionarios = funcionarios.map(f => ({
          ...f,
          hasAvailableSegments: false
        }));
        this.filteredFuncionarios = this.funcionarios;
        
        // Check availability for each funcionario
        this.funcionarios.forEach(f => {
          this.checkFuncionarioAvailability(f.id).subscribe(
            hasAvailable => {
              f.hasAvailableSegments = hasAvailable;
            }
          );
        });
      },
      error: (error) => {
        console.error('Error loading funcionarios:', error);
        this.toastService.show('Error al cargar funcionarios', 'error');
      }
    });

    this.checkScreenSize();
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
            right: 'timeGridWeek,timeGridDay'
          }
        };
      }
    }
  }

  ngOnInit() {
    // Load initial data
    this.apiService.getFuncionarios().subscribe();
  }

  /**
   * Verifica la disponibilidad de un funcionario
   * @param funcionarioId ID del funcionario
   * @returns boolean indicando si tiene segmentos disponibles esta semana
   * @private
   */
  private checkFuncionarioAvailability(funcionarioId: number): Observable<boolean> {
    return this.apiService.getSegmentosHorarioByFuncionarioId(funcionarioId).pipe(
      map(segmentos => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        return segmentos.some(segmento => {
          const segmentoDate = new Date(segmento.fechaHoraInicio);
          return segmento.free && 
                 segmentoDate >= startOfWeek && 
                 segmentoDate < endOfWeek;
        });
      })
    );
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
      funcionario.apellidos.toLowerCase().includes(searchTermLower)
    );
  }

  /**
   * Selecciona un funcionario y carga sus segmentos
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
   * Carga los segmentos de un funcionario en el calendario
   * @param funcionarioId ID del funcionario
   */
  loadSegmentos(funcionarioId: number) {
    this.apiService.getSegmentosHorarioByFuncionarioId(funcionarioId).subscribe({
      next: (segmentos) => {
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
      },
      error: (error) => {
        console.error('Error loading segmentos:', error);
        this.toastService.show('Error al cargar horarios', 'error');
      }
    });
  }

  /**
   * Maneja el clic en un evento del calendario
   * @param clickInfo Información del evento clickeado
   * @description Abre el modal de asignación si el segmento está disponible
   */
  handleEventClick(clickInfo: any) {
    const segmento = clickInfo.event.extendedProps.segmento as SegmentoHorario;
    if (segmento.free) {
      this.selectedSegmento = segmento;
      this.showAssignModal = true;
    } else {
      this.toastService.show('Este horario ya está ocupado', 'error');
    }
  }

  /**
   * Formatea el RUT mientras el usuario escribe
   * @param event Evento de input
   * @description Agrega puntos y guión al RUT
   */
  onRutInput(event: any) {
    const input = event.target;
    let rut = input.value.replace(/\./g, '').replace(/-/g, '');
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length > 0) {
      let result = rut;
      if (rut.length > 1) {
        result = rut.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + rut.slice(-1);
      }
      input.value = result;
    }
  }

  /**
   * Busca un paciente por RUT
   * @description Actualiza selectedPaciente y muestra mensajes de éxito/error
   */
  searchPaciente() {
    if (!this.searchRut) {
      this.showError = true;
      this.errorMessage = 'Ingrese un RUT para buscar';
      return;
    }

    const cleanRut = this.searchRut.replace(/\./g, '').replace(/-/g, '');
    this.apiService.getPacienteByRut(cleanRut).subscribe({
      next: (paciente) => {
        if (paciente) {
          this.selectedPaciente = paciente;
          this.showSuccess = true;
          this.successMessage = 'Paciente encontrado';
        } else {
          this.showError = true;
          this.errorMessage = 'Paciente no encontrado';
          this.selectedPaciente = null;
        }
      },
      error: (error) => {
        console.error('Error searching paciente:', error);
        this.showError = true;
        this.errorMessage = 'Error al buscar paciente';
        this.selectedPaciente = null;
      }
    });
  }

  /**
   * Asigna un paciente a un segmento horario
   * @description Marca el segmento como ocupado y muestra mensaje de éxito
   */
  assignPaciente() {
    if (!this.selectedSegmento || !this.selectedPaciente) return;

    this.apiService.assignSegmentoToPaciente(
      this.selectedPaciente.id, 
      this.selectedSegmento.id
    ).subscribe({
      next: () => {
        this.toastService.show('Cita creada exitosamente', 'success');
        if (this.selectedFuncionario) {
          this.loadSegmentos(this.selectedFuncionario.id);
        }
        this.closeAssignModal();
        
        // Refresh funcionario availability
        if (this.selectedFuncionario) {
          this.checkFuncionarioAvailability(this.selectedFuncionario.id).subscribe(
            hasAvailable => {
              const funcionario = this.funcionarios.find(f => f.id === this.selectedFuncionario?.id);
              if (funcionario) {
                funcionario.hasAvailableSegments = hasAvailable;
              }
            }
          );
        }
      },
      error: (error) => {
        console.error('Error assigning cita:', error);
        this.showError = true;
        this.errorMessage = 'Error al asignar la cita';
      }
    });
  }

  /**
   * Cierra el modal de asignación
   * @description Limpia las selecciones actuales
   */
  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedSegmento = null;
    this.selectedPaciente = null;
    this.searchRut = '';
  }

  /**
   * Alterna la visibilidad de la sección de búsqueda
   * @description Limpia la selección actual si está colapsada
   */
  toggleSearch() {
    if (this.selectedFuncionario) {
      this.selectedFuncionario = null;
      this.searchTerm = '';
      this.filteredFuncionarios = this.funcionarios;
      this.calendarOptions.events = [];
    }
  }
}

/**
 * Interfaz que extiende Funcionario con información de disponibilidad
 */
interface FuncionarioWithAvailability extends Funcionario {
  /** Indica si el funcionario tiene segmentos disponibles esta semana */
  hasAvailableSegments?: boolean;
}
