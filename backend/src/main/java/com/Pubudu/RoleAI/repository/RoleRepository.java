package com.Pubudu.RoleAI.repository;

import com.Pubudu.RoleAI.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    // Find roles by user ID
    List<Role> findByUserId(Long userId);
    
    // Find roles by name containing (case insensitive)
    List<Role> findByNameContainingIgnoreCase(String name);
    
    // Find roles by user ID and name
    List<Role> findByUserIdAndNameContainingIgnoreCase(Long userId, String name);
    
    // Vector similarity search - find similar roles based on embedding
    @Query(value = "SELECT * FROM roles WHERE user_id = :userId ORDER BY embedding <-> CAST(:queryEmbedding AS vector) LIMIT :limit", nativeQuery = true)
    List<Role> findSimilarRoles(@Param("userId") Long userId, @Param("queryEmbedding") String queryEmbedding, @Param("limit") int limit);
    
    // Find all roles for a user ordered by creation date
    List<Role> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Delete role by id and user id (for security)
    void deleteByIdAndUserId(Long id, Long userId);
    
    // Check if role exists for user
    boolean existsByIdAndUserId(Long id, Long userId);
}