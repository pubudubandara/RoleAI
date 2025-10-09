package com.Pubudu.RoleAI.controller;

import com.Pubudu.RoleAI.dto.RoleDTO;
import com.Pubudu.RoleAI.service.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:5173")
public class RoleController {

    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private RoleService roleService;

    // Get all roles for the current user
    @GetMapping
    public ResponseEntity<?> getAllRoles() {
        try {
            logger.info("Fetching all roles for current user");
            List<RoleDTO> roles = roleService.getAllRolesForCurrentUser();
            logger.info("Found {} roles", roles.size());
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            logger.error("Error fetching roles: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch roles: " + e.getMessage()));
        }
    }

    // Get a specific role by ID
    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        try {
            Optional<RoleDTO> role = roleService.getRoleById(id);
            return role.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create a new role
    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody RoleDTO roleDTO) {
        try {
            logger.info("Creating role: {}", roleDTO.getName());
            RoleDTO createdRole = roleService.createRole(roleDTO);
            logger.info("Successfully created role with ID: {}", createdRole.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
        } catch (Exception e) {
            logger.error("Error creating role: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create role: " + e.getMessage()));
        }
    }

    // Test endpoint to create role with hardcoded user (for testing only)
    @PostMapping("/test")
    public ResponseEntity<?> createTestRole(@RequestBody RoleDTO roleDTO) {
        try {
            logger.info("Creating test role: {}", roleDTO.getName());
            RoleDTO createdRole = roleService.createTestRole(roleDTO);
            logger.info("Successfully created test role with ID: {}", createdRole.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
        } catch (Exception e) {
            logger.error("Error creating test role: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create test role: " + e.getMessage()));
        }
    }

    // Update an existing role
    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> updateRole(@PathVariable Long id, @RequestBody RoleDTO roleDTO) {
        try {
            Optional<RoleDTO> updatedRole = roleService.updateRole(id, roleDTO);
            return updatedRole.map(ResponseEntity::ok)
                             .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a role
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        try {
            boolean deleted = roleService.deleteRole(id);
            return deleted ? ResponseEntity.noContent().build()
                          : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search roles by name
    @GetMapping("/search")
    public ResponseEntity<List<RoleDTO>> searchRoles(@RequestParam String query) {
        try {
            List<RoleDTO> roles = roleService.searchRoles(query);
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Find similar roles using vector search
    @PostMapping("/similar")
    public ResponseEntity<List<RoleDTO>> findSimilarRoles(
            @RequestBody String description,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<RoleDTO> similarRoles = roleService.findSimilarRoles(description, limit);
            return ResponseEntity.ok(similarRoles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Seed sample roles for the authenticated user and return all roles
    @PostMapping("/seed")
    public ResponseEntity<?> seedSampleRoles() {
        try {
            logger.info("Seeding sample roles for current user");
            List<RoleDTO> roles = roleService.seedSampleRoles();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            logger.error("Error seeding roles: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to seed roles: " + e.getMessage()));
        }
    }
}