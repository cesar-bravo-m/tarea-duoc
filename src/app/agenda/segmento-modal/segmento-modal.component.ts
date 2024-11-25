import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, Funcionario, SegmentoHorario } from '../../services/database.service';

@Component({
  selector: 'app-segmento-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './segmento-modal.component.html',
  styleUrl: './segmento-modal.component.css'
})
export class SegmentoModalComponent implements OnInit {
  @Input() startDate!: Date;
  @Input() funcionario!: Funcionario;
  @Input() segmentoToEdit: SegmentoHorario | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<SegmentoHorario>();
  @Output() delete = new EventEmitter<number>();

  segmentoForm: FormGroup;
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {
    this.segmentoForm = this.fb.group({
      nombre: ['', Validators.required],
      cupos: [1, [Validators.required, Validators.min(1), Validators.max(48)]]
    });
  }

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

  closeModal() {
    this.close.emit();
  }

  onDelete() {
    if (this.segmentoToEdit && confirm('¿Está seguro de eliminar este segmento horario?')) {
      this.delete.emit(this.segmentoToEdit.id);
      this.closeModal();
    }
  }

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