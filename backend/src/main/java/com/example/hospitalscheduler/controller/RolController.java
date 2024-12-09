package com.example.hospitalscheduler.controller;

import java.util.List;
import java.util.Set;

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

import com.example.hospitalscheduler.model.Funcionario;
import com.example.hospitalscheduler.model.Rol;
import com.example.hospitalscheduler.repository.FuncionarioRepository;
import com.example.hospitalscheduler.repository.RolRepository;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private FuncionarioRepository funcionarioRepository;

    // Create
    @PostMapping
    public ResponseEntity<Rol> createRol(@RequestBody Rol rol) {
        Rol savedRol = rolRepository.save(rol);
        return ResponseEntity.ok(savedRol);
    }

    // Read all
    @GetMapping
    public List<Rol> getAllRoles() {
        return rolRepository.findAll();
    }

    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<Rol> getRolById(@PathVariable Long id) {
        return rolRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Rol> updateRol(@PathVariable Long id, @RequestBody Rol rolDetails) {
        return rolRepository.findById(id)
            .map(rol -> {
                rol.setNombre(rolDetails.getNombre());
                return ResponseEntity.ok(rolRepository.save(rol));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRol(@PathVariable Long id) {
        return rolRepository.findById(id)
            .map(rol -> {
                rolRepository.delete(rol);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Assign role to funcionario
    @PostMapping("/{rolId}/funcionarios/{funcionarioId}")
    public ResponseEntity<?> assignRolToFuncionario(
            @PathVariable Long rolId,
            @PathVariable Long funcionarioId) {
        
        Rol rol = rolRepository.findById(rolId).orElse(null);
        if (rol == null) {
            return ResponseEntity.badRequest()
                .body("Rol not found with id: " + rolId);
        }

        Funcionario funcionario = funcionarioRepository.findById(funcionarioId).orElse(null);
        if (funcionario == null) {
            return ResponseEntity.badRequest()
                .body("Funcionario not found with id: " + funcionarioId);
        }

        Set<Rol> roles = funcionario.getRoles();
        roles.add(rol);
        funcionario.setRoles(roles);
        funcionarioRepository.save(funcionario);

        return ResponseEntity.ok()
            .body("Role assigned successfully");
    }

    // Remove role from funcionario
    @DeleteMapping("/{rolId}/funcionarios/{funcionarioId}")
    public ResponseEntity<?> removeRolFromFuncionario(
            @PathVariable Long rolId,
            @PathVariable Long funcionarioId) {
        
        Rol rol = rolRepository.findById(rolId).orElse(null);
        if (rol == null) {
            return ResponseEntity.badRequest()
                .body("Rol not found with id: " + rolId);
        }

        Funcionario funcionario = funcionarioRepository.findById(funcionarioId).orElse(null);
        if (funcionario == null) {
            return ResponseEntity.badRequest()
                .body("Funcionario not found with id: " + funcionarioId);
        }

        Set<Rol> roles = funcionario.getRoles();
        roles.remove(rol);
        funcionario.setRoles(roles);
        funcionarioRepository.save(funcionario);

        return ResponseEntity.ok()
            .body("Role removed successfully");
    }

    // Get all funcionarios with a specific role
    @GetMapping("/{rolId}/funcionarios")
    public ResponseEntity<Set<Funcionario>> getFuncionariosByRol(@PathVariable Long rolId) {
        return rolRepository.findById(rolId)
            .map(rol -> ResponseEntity.ok(rol.getFuncionarios()))
            .orElse(ResponseEntity.notFound().build());
    }
} 