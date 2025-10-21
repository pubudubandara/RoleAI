package com.Pubudu.RoleAI.repository;

import com.Pubudu.RoleAI.entity.ModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModelConfigRepository extends JpaRepository<ModelConfig, Long> {
    List<ModelConfig> findByUserIdOrUserIdIsNull(Long userId);
}
