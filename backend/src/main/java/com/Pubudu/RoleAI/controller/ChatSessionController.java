package com.Pubudu.RoleAI.controller;

import com.Pubudu.RoleAI.entity.ChatMessage;
import com.Pubudu.RoleAI.entity.ChatSession;
import com.Pubudu.RoleAI.service.ChatSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatSessionController {

    @Autowired private ChatSessionService chatSessionService;

    @GetMapping
    public ResponseEntity<List<ChatSession>> listSessions() {
        return ResponseEntity.ok(chatSessionService.listSessions());
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createSession() {
        ChatSession s = chatSessionService.createSession();
        return ResponseEntity.ok(Map.of("id", s.getId(), "title", s.getTitle()));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable("id") String id) {
        return ResponseEntity.ok(chatSessionService.getMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ChatMessage> addMessage(@PathVariable("id") String id, @RequestBody Map<String, Object> body) {
        String sender = String.valueOf(body.get("sender"));
        String content = String.valueOf(body.get("content"));
        Long roleId = null;
        if (body.get("roleId") != null) roleId = Long.valueOf(String.valueOf(body.get("roleId")));
        return ResponseEntity.ok(chatSessionService.addMessage(id, sender, content, roleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        chatSessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
