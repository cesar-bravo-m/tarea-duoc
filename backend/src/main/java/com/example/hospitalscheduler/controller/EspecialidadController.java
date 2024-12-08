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

import com.example.hospitalscheduler.model.Especialidad;
import com.example.hospitalscheduler.repository.EspecialidadRepository;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadController {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    // Create
    @PostMapping
    public Especialidad createEspecialidad(@RequestBody Especialidad especialidad) {
        return especialidadRepository.save(especialidad);
    }

    // Read all
    @GetMapping
    public List<Especialidad> getAllEspecialidades() {
        return especialidadRepository.findAll();
    }

    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<Especialidad> getEspecialidadById(@PathVariable Long id) {
        Especialidad especialidad = especialidadRepository.findById(id)
            .orElse(null);
        if (especialidad == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(especialidad);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Especialidad> updateEspecialidad(@PathVariable Long id, @RequestBody Especialidad especialidadDetails) {
        Especialidad especialidad = especialidadRepository.findById(id)
            .orElse(null);
        if (especialidad == null) {
            return ResponseEntity.notFound().build();
        }
        
        especialidad.setNombre(especialidadDetails.getNombre());
        Especialidad updatedEspecialidad = especialidadRepository.save(especialidad);
        return ResponseEntity.ok(updatedEspecialidad);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEspecialidad(@PathVariable Long id) {
        Especialidad especialidad = especialidadRepository.findById(id)
            .orElse(null);
        if (especialidad == null) {
            return ResponseEntity.notFound().build();
        }
        
        especialidadRepository.delete(especialidad);
        return ResponseEntity.ok().build();
    }
} 