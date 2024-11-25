import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, Funcionario, SegmentoHorario } from '../../services/database.service';

/**
 * Componente modal para la gestión de segmentos horarios
 * @description Permite crear y editar segmentos horarios de los funcionarios
 */
@Component({
  selector: 'app-segmento-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './segmento-modal.component.html',
  styleUrl: './segmento-modal.component.css'
})
export class SegmentoModalComponent implements OnInit {
  /** Fecha de inicio del segmento */
  @Input() startDate!: Date;
  /** Funcionario al que pertenece el segmento */
  @Input() funcionario!: Funcionario;
  /** Segmento a editar (null si es nuevo) */
  @Input() segmentoToEdit: SegmentoHorario | null = null;
  /** Evento emitido para cerrar el modal */
  @Output() close = new EventEmitter<void>();
  /** Evento emitido al guardar el segmento */
  @Output() submit = new EventEmitter<SegmentoHorario>();
  /** Evento emitido al eliminar el segmento */
  @Output() delete = new EventEmitter<number>();

  /** Formulario reactivo para los datos del segmento */
  segmentoForm: FormGroup;
  /** Indica si se está editando un segmento existente */
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {
    this.segmentoForm = this.fb.group({
      nombre: ['', Validators.required],
      cupos: [1, [Validators.required, Validators.min(1), Validators.max(48)]]
    });
  }

  /**
   * Inicializa el componente
   * @description Configura el formulario si se está editando un segmento existente
   */
  ngOnInit() {
    if (this.segmentoToEdit) {
      this.isEditMode = true;
      const duration = (new Date(this.segmentoToEdit.fecha_hora_fin).getTime() - 
                       new Date(this.segmentoToEdit.fecha_hora_inicio).getTime()) / (30 * 60000);
      
      this.segmentoForm.patchValue({
        nombre: this.segmentoToEdit.nombre,
        cupos: duration
      });
    }
  }

  /**
   * Cierra el modal
   * @description Emite el evento close
   */
  closeModal() {
    this.close.emit();
  }

  /**
   * Maneja la eliminación de un segmento
   * @description Solicita confirmación antes de eliminar
   */
  onDelete() {
    if (this.segmentoToEdit && confirm('¿Está seguro de eliminar este segmento horario?')) {
      this.delete.emit(this.segmentoToEdit.id);
      this.closeModal();
    }
  }

  /**
   * Maneja el envío del formulario
   * @description Crea o actualiza un segmento horario
   */
  onSubmit() {
    if (this.segmentoForm.valid) {
      const formValue = this.segmentoForm.value;
      const startDate = this.segmentoToEdit ? new Date(this.segmentoToEdit.fecha_hora_inicio) : this.startDate;
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + (formValue.cupos * 30));

      const segmento: SegmentoHorario = {
        id: this.segmentoToEdit?.id || 0,
        nombre: formValue.nombre,
        fecha_hora_inicio: startDate.toISOString(),
        fecha_hora_fin: endDate.toISOString(),
        fun_id: this.funcionario.id,
        free: true
      };
      
      this.submit.emit(segmento);
      this.closeModal();
    }
  }
} 