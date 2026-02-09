package com.Pubudu.RoleAI.controller;

import com.Pubudu.RoleAI.dto.RoleDTO;
import com.Pubudu.RoleAI.service.ChatService;
import com.Pubudu.RoleAI.service.ChatSessionService;
import com.Pubudu.RoleAI.service.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatService chatService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ChatSessionService chatSessionService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateReply(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            String message = (String) request.get("message");
            String model = (String) request.get("model");
            Long modelConfigId = null;
            if (request.get("modelConfigId") != null) {
                modelConfigId = Long.valueOf(request.get("modelConfigId").toString());
            }
            String sessionId = null;
            if (request.get("sessionId") != null) {
                sessionId = request.get("sessionId").toString();
            }

            if (roleId == null || message == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "roleId and message are required"));
            }

        String msgPreview = message == null ? "" : (message.length() > 120 ? message.substring(0, 120) + "..." : message);
        logger.info("Incoming chat request -> roleId: {}, model: {}, messageLen: {}, message: {}",
            roleId, model, message != null ? message.length() : 0, msgPreview);

            Optional<RoleDTO> roleOpt = roleService.getRoleById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Role not found"));
            }

            RoleDTO role = roleOpt.get();
            String reply = chatService.generateReply(role, message, model, modelConfigId);

            // Persist AI reply if sessionId provided
            if (sessionId != null) {
                try {
                    chatSessionService.addMessage(sessionId, "ai", reply, role.getId());
                } catch (Exception ex) {
                    logger.warn("Failed to persist AI reply to session {}: {}", sessionId, ex.getMessage());
                }
            }

            logger.info("Successfully generated reply");
            return ResponseEntity.ok(Map.of("reply", reply));

        } catch (Exception e) {
            logger.error("Error generating reply: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate reply: " + e.getMessage()));
        }
    }
}