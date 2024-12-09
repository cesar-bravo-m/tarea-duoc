package com.example.hospitalscheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospitalscheduler.model.Cita;

public interface CitaRepository extends JpaRepository<Cita, Long> {
} 