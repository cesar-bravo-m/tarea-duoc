package com.example.hospitalscheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospitalscheduler.model.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Funcionario findByRut(String rut);
} 