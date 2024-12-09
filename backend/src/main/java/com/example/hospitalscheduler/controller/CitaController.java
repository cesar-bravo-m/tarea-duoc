package com.example.hospitalscheduler.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hospitalscheduler.model.Cita;
import com.example.hospitalscheduler.model.Paciente;
import com.example.hospitalscheduler.model.SegmentoHorario;
import com.example.hospitalscheduler.repository.CitaRepository;
import com.example.hospitalscheduler.repository.PacienteRepository;
import com.example.hospitalscheduler.repository.SegmentoHorarioRepository;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private PacienteRepository pacienteRepository;
    
    @Autowired
    private SegmentoHorarioRepository segmentoHorarioRepository;

    @PostMapping("/assign")
    public ResponseEntity<?> assignSegmentoToPaciente(
            @RequestParam Long pacienteId,
            @RequestParam Long segmentoHorarioId) {
        System.out.println("pacienteId: " + pacienteId);
        System.out.println("segmentoHorarioId: " + segmentoHorarioId);
        
        // Find paciente
        Paciente paciente = pacienteRepository.findById(pacienteId).orElse(null);
        System.out.println("paciente: " + paciente);
        if (paciente == null) {
            System.out.println("paciente not found");
            return ResponseEntity.badRequest()
                .body("Paciente not found with id: " + pacienteId);
        }
        System.out.println("paciente found");

        // Find segmento horario
        SegmentoHorario segmentoHorario = segmentoHorarioRepository.findById(segmentoHorarioId).orElse(null);
        System.out.println("segmentoHorario: " + segmentoHorario);
        if (segmentoHorario == null) {
            System.out.println("segmentoHorario not found");
            return ResponseEntity.badRequest()
                .body("SegmentoHorario not found with id: " + segmentoHorarioId);
        }
        System.out.println("segmentoHorario: " + segmentoHorario);

        // Check if segmento is free
        if (!segmentoHorario.isFree()) {
            return ResponseEntity.badRequest()
                .body("SegmentoHorario is not available");
        }
        System.out.println("segmentoHorario is free");
        // Create new cita
        Cita cita = new Cita(paciente, segmentoHorario);
        System.out.println("cita: " + cita);
        
        // Mark segmento as not free
        segmentoHorario.setFree(false);
        segmentoHorarioRepository.save(segmentoHorario);
        System.out.println("segmentoHorario saved");
        
        // Save cita
        cita.setId(null);
        cita.setPaciente(paciente);
        cita.setSegmentoHorario(segmentoHorario);
        Cita savedCita = citaRepository.save(cita);
        System.out.println("cita saved");
        
        return ResponseEntity.ok(savedCita);
    }
} 