import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class SegmentoModalComponent {
  @Input() startDate!: Date;
  @Input() funcionario!: Funcionario;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<SegmentoHorario>();

  segmentoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.segmentoForm = this.fb.group({
      nombre: ['', Validators.required],
      cupos: [1, [Validators.required, Validators.min(1), Validators.max(48)]]
    });
  }

  closeModal() {
    this.close.emit();
  }

  onSubmit() {
    if (this.segmentoForm.valid) {
      const formValue = this.segmentoForm.value;
      const endDate = new Date(this.startDate);
      endDate.setMinutes(endDate.getMinutes() + (formValue.cupos * 30));

      const segmento: SegmentoHorario = {
        id: 0, // The database will assign this
        nombre: formValue.nombre,
        fecha_hora_inicio: this.startDate.toISOString(),
        fecha_hora_fin: endDate.toISOString(),
        fun_id: this.funcionario.id
      };

      this.submit.emit(segmento);
      this.closeModal();
    }
  }
} 