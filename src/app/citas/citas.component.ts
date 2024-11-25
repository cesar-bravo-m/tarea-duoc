import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, Funcionario, SegmentoHorario, Paciente } from '../services/database.service';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ToastService } from '../services/toast.service';

interface FuncionarioWithAvailability extends Funcionario {
  hasAvailableSegments?: boolean;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  
  searchTerm: string = '';
  searchRut: string = '';
  funcionarios: FuncionarioWithAvailability[] = [];
  filteredFuncionarios: FuncionarioWithAvailability[] = [];
  selectedFuncionario: Funcionario | null = null;
  selectedSegmento: SegmentoHorario | null = null;
  selectedPaciente: Paciente | null = null;
  showAssignModal = false;
  showError = false;
  showSuccess = false;
  errorMessage = '';
  successMessage = '';
  isSmallScreen: boolean = false;

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private dbService: DatabaseService,
    private toastService: ToastService
  ) {
    this.dbService.funcionarios$.subscribe(
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

  private checkScreenSize() {
    const wasSmallScreen = this.isSmallScreen;
    this.isSmallScreen = window.innerWidth < 768;

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
            right: 'timeGridWeek,timeGridDay'
          }
        };
      }
    }
  }

  ngOnInit() {
    this.dbService.loadFuncionarios();
  }

  private checkFuncionarioAvailability(funcionarioId: number): boolean {
    const segmentos = this.dbService.getSegmentosHorarioByFuncionarioId(funcionarioId);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return segmentos.some(segmento => {
      const segmentoDate = new Date(segmento.fecha_hora_inicio);
      return segmento.free && 
             segmentoDate >= startOfWeek && 
             segmentoDate < endOfWeek;
    });
  }

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

  selectFuncionario(funcionario: Funcionario) {
    this.selectedFuncionario = funcionario;
    this.loadSegmentos(funcionario.id);
    
    setTimeout(() => {
      this.updateCalendarView();
    }, 0);
  }

  loadSegmentos(funcionarioId: number) {
    const segmentos = this.dbService.getSegmentosHorarioByFuncionarioId(funcionarioId);
    const events: EventInput[] = segmentos.map(segmento => ({
      id: segmento.id.toString(),
      title: segmento.nombre,
      start: segmento.fecha_hora_inicio,
      end: segmento.fecha_hora_fin,
      backgroundColor: segmento.free ? '#48bb78' : '#fc8181',
      borderColor: segmento.free ? '#38a169' : '#f56565',
      extendedProps: {
        segmento: segmento
      }
    }));

    this.calendarOptions.events = events;
  }

  handleEventClick(clickInfo: any) {
    const segmento = clickInfo.event.extendedProps.segmento as SegmentoHorario;
    if (segmento.free) {
      this.selectedSegmento = segmento;
      this.showAssignModal = true;
    } else {
      alert('Este horario ya está ocupado');
    }
  }

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

  searchPaciente() {
    if (!this.searchRut) {
      this.showError = true;
      this.errorMessage = 'Ingrese un RUT para buscar';
      return;
    }

    const paciente = this.dbService.getPacienteByRut(this.searchRut);
    if (paciente) {
      this.selectedPaciente = paciente;
      this.showSuccess = true;
      this.successMessage = 'Paciente encontrado';
    } else {
      this.showError = true;
      this.errorMessage = 'Paciente no encontrado';
      this.selectedPaciente = null;
    }
  }

  assignPaciente() {
    if (!this.selectedSegmento || !this.selectedPaciente) return;

    try {
      this.dbService.assignSegmentoToPaciente(this.selectedPaciente.id, this.selectedSegmento.id);
      
      this.toastService.show('Cita creada exitosamente', 'success');
      
      this.selectedSegmento = null;
      this.selectedPaciente = null;
      this.searchRut = '';
      
      if (this.selectedFuncionario) {
        this.loadSegmentos(this.selectedFuncionario.id);
      }
      
      this.closeAssignModal();
    } catch (error) {
      this.showError = true;
      this.errorMessage = 'Error al asignar la cita';
      console.error(error);
    }
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedSegmento = null;
    this.selectedPaciente = null;
    this.searchRut = '';
  }

  toggleSearch() {
    if (this.selectedFuncionario) {
      this.selectedFuncionario = null;
      this.searchTerm = '';
      this.filteredFuncionarios = this.funcionarios;
      this.calendarOptions.events = [];
    }
  }
}
