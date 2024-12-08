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

import com.example.hospitalscheduler.model.SegmentoHorario;
import com.example.hospitalscheduler.repository.FuncionarioRepository;
import com.example.hospitalscheduler.repository.SegmentoHorarioRepository;

@RestController
@RequestMapping("/api/segmentos-horarios")
public class SegmentoHorarioController {

    @Autowired
    private SegmentoHorarioRepository segmentoHorarioRepository;
    
    @Autowired
    private FuncionarioRepository funcionarioRepository;

    // Create
    @PostMapping
    public ResponseEntity<SegmentoHorario> createSegmentoHorario(@RequestBody SegmentoHorario segmentoHorario) {
        segmentoHorario.setId(null);
        if (segmentoHorario.getFuncionario() != null && segmentoHorario.getFuncionario().getId() != null) {
            return funcionarioRepository.findById(segmentoHorario.getFuncionario().getId())
                .map(funcionario -> {
                    segmentoHorario.setFuncionario(funcionario);
                    SegmentoHorario savedSegmento = segmentoHorarioRepository.save(segmentoHorario);
                    return ResponseEntity.ok(savedSegmento);
                })
                .orElse(ResponseEntity.badRequest().build());
        }
        
        SegmentoHorario savedSegmento = segmentoHorarioRepository.save(segmentoHorario);
        return ResponseEntity.ok(savedSegmento);
    }

    // Read all
    @GetMapping
    public List<SegmentoHorario> getAllSegmentosHorarios() {
        return segmentoHorarioRepository.findAll();
    }

    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<SegmentoHorario> getSegmentoHorarioById(@PathVariable Long id) {
        return segmentoHorarioRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<SegmentoHorario> updateSegmentoHorario(@PathVariable Long id, @RequestBody SegmentoHorario segmentoDetails) {
        return segmentoHorarioRepository.findById(id)
            .map(segmento -> {
                segmento.setNombre(segmentoDetails.getNombre());
                segmento.setFechaHoraInicio(segmentoDetails.getFechaHoraInicio());
                segmento.setFechaHoraFin(segmentoDetails.getFechaHoraFin());
                segmento.setFree(segmentoDetails.isFree());
                
                // Update funcionario if provided
                if (segmentoDetails.getFuncionario() != null && segmentoDetails.getFuncionario().getId() != null) {
                    return funcionarioRepository.findById(segmentoDetails.getFuncionario().getId())
                        .map(funcionario -> {
                            segmento.setFuncionario(funcionario);
                            return ResponseEntity.ok(segmentoHorarioRepository.save(segmento));
                        })
                        .orElse(ResponseEntity.badRequest().build());
                }
                
                return ResponseEntity.ok(segmentoHorarioRepository.save(segmento));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSegmentoHorario(@PathVariable Long id) {
        return segmentoHorarioRepository.findById(id)
            .map(segmento -> {
                segmentoHorarioRepository.delete(segmento);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

} 