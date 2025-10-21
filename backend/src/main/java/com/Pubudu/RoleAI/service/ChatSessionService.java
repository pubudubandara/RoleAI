package com.Pubudu.RoleAI.service;

import com.Pubudu.RoleAI.entity.ChatMessage;
import com.Pubudu.RoleAI.entity.ChatSession;
import com.Pubudu.RoleAI.entity.User;
import com.Pubudu.RoleAI.repository.ChatMessageRepository;
import com.Pubudu.RoleAI.repository.ChatSessionRepository;
import com.Pubudu.RoleAI.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatSessionService {
    @Autowired private ChatSessionRepository sessionRepository;
    @Autowired private ChatMessageRepository messageRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else {
            email = authentication.getName();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public ChatSession createSession() {
        User user = getCurrentUser();
        ChatSession s = new ChatSession();
        s.setUserId(user.getId());
        s.setId(generateId());
        s.setTitle("New Chat");
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        return sessionRepository.save(s);
    }

    public List<ChatSession> listSessions() {
        User user = getCurrentUser();
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
    }

    public List<ChatMessage> getMessages(String sessionId) {
        ensureOwned(sessionId);
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public ChatMessage addMessage(String sessionId, String sender, String content, Long roleId) {
        ChatSession s = ensureOwned(sessionId);
        User user = getCurrentUser();
        ChatMessage m = new ChatMessage();
        m.setSessionId(sessionId);
        m.setUserId(user.getId());
        m.setSender(sender);
        m.setContent(content);
        if (roleId != null) m.setRoleId(roleId);
        m.setCreatedAt(LocalDateTime.now());
        ChatMessage saved = messageRepository.save(m);

        // If first user message, update title
        if ("user".equalsIgnoreCase(sender)) {
            autoTitleIfNeeded(s, content);
        }

        // bump updatedAt
        s.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(s);
        return saved;
    }

    @Transactional
    public void deleteSession(String sessionId) {
        ensureOwned(sessionId);
        messageRepository.deleteBySessionId(sessionId);
        sessionRepository.deleteById(sessionId);
    }

    private ChatSession ensureOwned(String sessionId) {
        User user = getCurrentUser();
        Optional<ChatSession> opt = sessionRepository.findById(sessionId);
        if (opt.isEmpty() || !opt.get().getUserId().equals(user.getId())) {
            throw new RuntimeException("Session not found or not owned by user");
        }
        return opt.get();
    }

    private void autoTitleIfNeeded(ChatSession s, String firstPrompt) {
        if (s.getTitle() != null && !s.getTitle().equals("New Chat")) return;
        if (firstPrompt == null || firstPrompt.isBlank()) return;
        String trimmed = firstPrompt.trim();
        String title;
        // simple heuristic-based title from first prompt
        if (trimmed.toLowerCase().contains("summary")) title = "AI Summary";
        else if (trimmed.toLowerCase().contains("role")) title = "Role Discussion";
        else if (trimmed.length() > 50) title = trimmed.substring(0, 47) + "...";
        else title = trimmed;
        s.setTitle(title);
        sessionRepository.save(s);
    }

    private String generateId() {
        // 16-char, URL-safe alphanumeric
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        java.security.SecureRandom rnd = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }
}
