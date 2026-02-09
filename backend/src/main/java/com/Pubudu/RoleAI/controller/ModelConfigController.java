package com.Pubudu.RoleAI.controller;

import com.Pubudu.RoleAI.entity.ModelConfig;
import com.Pubudu.RoleAI.service.ModelConfigService;
import com.Pubudu.RoleAI.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/models")
public class ModelConfigController {

    @Autowired
    private ModelConfigService modelConfigService;

    @Autowired
    private JwtUtil jwtUtil;

    private Long userIdFromAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    private Map<String, Object> sanitize(ModelConfig mc) {
        java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();
        map.put("id", mc.getId());
        map.put("provider", mc.getProvider());
        map.put("modelId", mc.getModelId());
        map.put("label", mc.getLabel()); // may be null
        map.put("userId", mc.getUserId()); // may be null
        map.put("createdAt", mc.getCreatedAt());
        return map;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestHeader(value = "Authorization", required = false) String auth) {
        Long uid = userIdFromAuth(auth);
        List<ModelConfig> list = modelConfigService.listForUser(uid);
        return ResponseEntity.ok(list.stream().map(this::sanitize).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestHeader(value = "Authorization", required = false) String auth,
                                    @RequestBody Map<String, String> body) {
        Long uid = userIdFromAuth(auth);
        String provider = body.getOrDefault("provider", "GEMINI");
        String modelId = body.get("modelId");
        String label = body.get("label");
        String apiKey = body.get("apiKey");
        if (modelId == null || apiKey == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "modelId and apiKey are required"));
        }
        ModelConfig mc = modelConfigService.create(uid, provider, modelId, label, apiKey);
        return ResponseEntity.ok(sanitize(mc));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "Authorization", required = false) String auth,
                                    @PathVariable Long id,
                                    @RequestBody Map<String, String> body) {
        Long uid = userIdFromAuth(auth);
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        // Check if the model belongs to the user
        ModelConfig existing = modelConfigService.get(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (existing.getUserId() != null && !existing.getUserId().equals(uid)) {
            return ResponseEntity.status(403).body(Map.of("error", "You can only update your own models"));
        }
        
        ModelConfig mc = modelConfigService.update(
                id,
                body.get("provider"),
                body.get("modelId"),
                body.get("label"),
                body.get("apiKey")
        );
        return ResponseEntity.ok(sanitize(mc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader(value = "Authorization", required = false) String auth,
                                   @PathVariable Long id) {
        Long uid = userIdFromAuth(auth);
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        // Check if the model belongs to the user
        ModelConfig existing = modelConfigService.get(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (existing.getUserId() != null && !existing.getUserId().equals(uid)) {
            return ResponseEntity.status(403).body(Map.of("error", "You can only delete your own models"));
        }
        
        modelConfigService.delete(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }
}
