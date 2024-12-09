package com.example.hospitalscheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospitalscheduler.model.Especialidad;

public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {
} 