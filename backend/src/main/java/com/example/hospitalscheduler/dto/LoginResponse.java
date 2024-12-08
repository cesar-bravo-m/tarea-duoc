package com.example.hospitalscheduler.dto;

import java.util.Set;

import com.example.hospitalscheduler.model.Rol;

public class LoginResponse {
    private Long id;
    private String rut;
    private String nombres;
    private String apellidos;
    private Set<Rol> roles;

    public LoginResponse(Long id, String rut, String nombres, String apellidos, Set<Rol> roles) {
        this.id = id;
        this.rut = rut;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.roles = roles;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRut() {
        return rut;
    }

    public void setRut(String rut) {
        this.rut = rut;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public Set<Rol> getRoles() {
        return roles;
    }

    public void setRoles(Set<Rol> roles) {
        this.roles = roles;
    }
} 