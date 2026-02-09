package com.Pubudu.RoleAI.repository;

import com.Pubudu.RoleAI.entity.ModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModelConfigRepository extends JpaRepository<ModelConfig, Long> {
    @Query("SELECT m FROM ModelConfig m WHERE m.userId = :userId OR m.userId IS NULL")
    List<ModelConfig> findByUserIdOrUserIdIsNull(@Param("userId") Long userId);
    
    List<ModelConfig> findByUserId(Long userId);
}
