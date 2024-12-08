package com.example.hospitalscheduler.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hospitalscheduler.model.Paciente;
import com.example.hospitalscheduler.repository.PacienteRepository;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    // Create
    @PostMapping
    public ResponseEntity<Paciente> createPaciente(@RequestBody Paciente paciente) {
        paciente.setId(null);

        Paciente savedPaciente = pacienteRepository.save(paciente);
        return ResponseEntity.ok(savedPaciente);
    }

    // Read all
    @GetMapping
    public List<Paciente> getAllPacientes() {
        return pacienteRepository.findAll();
    }

    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> getPacienteById(@PathVariable Long id) {
        return pacienteRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> updatePaciente(@PathVariable Long id, @RequestBody Paciente pacienteDetails) {
        // Find paciente
        Paciente paciente = pacienteRepository.findById(id).orElse(null);
        if (paciente == null) {
            return ResponseEntity.notFound().build();
        }

        // Update fields
        paciente.setRut(pacienteDetails.getRut());
        paciente.setNombres(pacienteDetails.getNombres());
        paciente.setApellidos(pacienteDetails.getApellidos());
        paciente.setTelefono(pacienteDetails.getTelefono());
        paciente.setEmail(pacienteDetails.getEmail());
        paciente.setFechaNacimiento(pacienteDetails.getFechaNacimiento());
        paciente.setGenero(pacienteDetails.getGenero());
        paciente.setDireccion(pacienteDetails.getDireccion());
        
        // Save and return
        Paciente updatedPaciente = pacienteRepository.save(paciente);
        return ResponseEntity.ok(updatedPaciente);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePaciente(@PathVariable Long id) {
        return pacienteRepository.findById(id)
            .map(paciente -> {
                pacienteRepository.delete(paciente);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Add this method to the existing controller class
    @GetMapping("/rut/{rut}")
    public ResponseEntity<Paciente> getPacienteByRut(@PathVariable String rut) {
        Paciente paciente = pacienteRepository.findByRut(rut);
        if (paciente == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(paciente);
    }
} 