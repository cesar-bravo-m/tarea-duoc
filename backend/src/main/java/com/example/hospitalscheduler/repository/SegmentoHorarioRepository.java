package com.example.hospitalscheduler.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospitalscheduler.model.SegmentoHorario;

public interface SegmentoHorarioRepository extends JpaRepository<SegmentoHorario, Long> {
    List<SegmentoHorario> findByFuncionarioId(Long funcionarioId);
} 