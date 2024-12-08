package com.example.hospitalscheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospitalscheduler.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Paciente findByRut(String rut);
} 