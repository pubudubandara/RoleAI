package com.Pubudu.RoleAI.repository;

import com.Pubudu.RoleAI.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
