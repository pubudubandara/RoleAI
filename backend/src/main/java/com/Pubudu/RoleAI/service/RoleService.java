package com.Pubudu.RoleAI.service;

import com.Pubudu.RoleAI.dto.RoleDTO;
import com.Pubudu.RoleAI.entity.Role;
import com.Pubudu.RoleAI.entity.User;
import com.Pubudu.RoleAI.repository.RoleRepository;
import com.Pubudu.RoleAI.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.ArrayList;

@Service
public class RoleService {

    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private PineconeService pineconeService;

    // Get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else {
            // Fallback to authentication name (e.g., when using UsernamePasswordAuthenticationToken with username)
            email = authentication.getName();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Convert Role entity to DTO
    private RoleDTO convertToDTO(Role role) {
        return new RoleDTO(role.getId(), role.getName(), role.getDescription(), role.getUserId());
    }

    // Convert DTO to Role entity
    private Role convertToEntity(RoleDTO roleDTO) {
        Role role = new Role();
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        return role;
    }

    // Get all roles for current user
    public List<RoleDTO> getAllRolesForCurrentUser() {
        User currentUser = getCurrentUser();
        List<Role> roles = roleRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return roles.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Get role by ID for current user
    public Optional<RoleDTO> getRoleById(Long roleId) {
        User currentUser = getCurrentUser();
        Optional<Role> role = roleRepository.findById(roleId);
        
        if (role.isPresent() && role.get().getUserId().equals(currentUser.getId())) {
            return Optional.of(convertToDTO(role.get()));
        }
        return Optional.empty();
    }

    // Create new role
    @Transactional
    public RoleDTO createRole(RoleDTO roleDTO) {
        User currentUser = getCurrentUser();
        
        Role role = convertToEntity(roleDTO);
        role.setUserId(currentUser.getId());
        
        // Save role to database first
        Role savedRole = roleRepository.save(role);
        logger.info("Role saved to database with ID: {}", savedRole.getId());
        
        // Generate embedding and store in Pinecone
        try {
            String embeddingText = roleDTO.getName() + " " + roleDTO.getDescription();
            double[] embedding = embeddingService.generateEmbeddingArray(embeddingText);
            boolean pineconeSuccess = pineconeService.upsertRoleEmbedding(
                savedRole.getId(),
                currentUser.getId(),
                savedRole.getName(),
                savedRole.getDescription(),
                embedding
            );
            if (!pineconeSuccess) {
                logger.warn("Failed to store embedding in Pinecone for role ID: {}", savedRole.getId());
            }
        } catch (Exception e) {
            logger.error("Failed to generate or store embedding for role ID: {}", savedRole.getId(), e);
        }
        
        return convertToDTO(savedRole);
    }


    // Update existing role
    @Transactional
    public Optional<RoleDTO> updateRole(Long roleId, RoleDTO roleDTO) {
        User currentUser = getCurrentUser();
        Optional<Role> existingRole = roleRepository.findById(roleId);
        
        if (existingRole.isPresent() && existingRole.get().getUserId().equals(currentUser.getId())) {
            Role role = existingRole.get();
            role.setName(roleDTO.getName());
            role.setDescription(roleDTO.getDescription());
            
            // Save updated role to database
            Role updatedRole = roleRepository.save(role);
            logger.info("Role updated in database with ID: {}", updatedRole.getId());
            
            // Update embedding in Pinecone
            try {
                String embeddingText = roleDTO.getName() + " " + roleDTO.getDescription();
                double[] embedding = embeddingService.generateEmbeddingArray(embeddingText);
                
                boolean pineconeSuccess = pineconeService.upsertRoleEmbedding(
                    updatedRole.getId(),
                    currentUser.getId(),
                    updatedRole.getName(),
                    updatedRole.getDescription(),
                    embedding
                );
                
                if (!pineconeSuccess) {
                    logger.warn("Failed to update embedding in Pinecone for role ID: {}", updatedRole.getId());
                }
            } catch (Exception e) {
                logger.error("Failed to update embedding for role ID: {}", updatedRole.getId(), e);
            }
            
            return Optional.of(convertToDTO(updatedRole));
        }
        return Optional.empty();
    }

    // Delete role
    @Transactional
    public boolean deleteRole(Long roleId) {
        User currentUser = getCurrentUser();
        
        if (roleRepository.existsByIdAndUserId(roleId, currentUser.getId())) {
            // Delete from Pinecone first
            try {
                boolean pineconeSuccess = pineconeService.deleteRoleEmbedding(roleId, currentUser.getId());
                if (!pineconeSuccess) {
                    logger.warn("Failed to delete embedding from Pinecone for role ID: {}", roleId);
                }
            } catch (Exception e) {
                logger.error("Error deleting embedding from Pinecone for role ID: {}", roleId, e);
            }
            
            // Delete from database
            roleRepository.deleteByIdAndUserId(roleId, currentUser.getId());
            logger.info("Role deleted from database with ID: {}", roleId);
            return true;
        }
        return false;
    }

    // Search roles by name
    public List<RoleDTO> searchRoles(String query) {
        User currentUser = getCurrentUser();
        List<Role> roles = roleRepository.findByUserIdAndNameContainingIgnoreCase(currentUser.getId(), query);
        return roles.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Find similar roles using vector search
    public List<RoleDTO> findSimilarRoles(String description, int limit) {
        User currentUser = getCurrentUser();
        try {
            double[] queryEmbedding = embeddingService.generateEmbeddingArray(description);
            
            // Search using Pinecone
            List<Map<String, Object>> similarRoles = pineconeService.searchSimilarRoles(
                currentUser.getId(), 
                queryEmbedding, 
                limit
            );
            
            // Convert Pinecone results to RoleDTO
            List<RoleDTO> results = new ArrayList<>();
            for (Map<String, Object> result : similarRoles) {
                String roleIdStr = (String) result.get("id");
                // Extract role ID from "role_123" format
                Long roleId = Long.parseLong(roleIdStr.substring(5));
                String roleName = (String) result.get("roleName");
                String roleDescription = (String) result.get("description");
                
                RoleDTO roleDTO = new RoleDTO(roleId, roleName, roleDescription, currentUser.getId());
                results.add(roleDTO);
            }
            
            logger.info("Found {} similar roles using Pinecone for user {}", results.size(), currentUser.getId());
            return results;
        } catch (Exception e) {
            // If Pinecone search fails, fall back to database search
            logger.error("Pinecone search failed, falling back to name search for user {}", currentUser.getId(), e);
            return searchRoles(description);
        }
    }

    // Check if Pinecone is ready for use
    public boolean isPineconeReady() {
        return pineconeService.isIndexReady();
    }

    // Get Pinecone index statistics
    public Map<String, Object> getPineconeStats() {
        return pineconeService.getIndexStats();
    }

}