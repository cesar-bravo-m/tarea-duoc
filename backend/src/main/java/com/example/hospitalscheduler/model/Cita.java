package com.example.hospitalscheduler.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Cita {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;
    
    @ManyToOne
    @JoinColumn(name = "segmento_horario_id")
    private SegmentoHorario segmentoHorario;

    // Default constructor
    public Cita() {
    }

    // Constructor with relationships
    public Cita(Paciente paciente, SegmentoHorario segmentoHorario) {
        this.paciente = paciente;
        this.segmentoHorario = segmentoHorario;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public SegmentoHorario getSegmentoHorario() {
        return segmentoHorario;
    }

    public void setSegmentoHorario(SegmentoHorario segmentoHorario) {
        this.segmentoHorario = segmentoHorario;
    }
} 