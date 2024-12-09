package com.example.hospitalscheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hospitalscheduler.model.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Rol findByNombre(String nombre);
} 