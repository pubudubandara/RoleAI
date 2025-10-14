package com.Pubudu.RoleAI.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "model_configs")
public class ModelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider; // e.g., GEMINI

    @Column(nullable = false)
    private String modelId; // e.g., gemini-2.5-pro

    @Column
    private String label; // optional display name

    @Column
    private Long userId; // owner; nullable if global

    @Column(nullable = false, length = 4096)
    private String encryptedApiKey;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getModelId() { return modelId; }
    public void setModelId(String modelId) { this.modelId = modelId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEncryptedApiKey() { return encryptedApiKey; }
    public void setEncryptedApiKey(String encryptedApiKey) { this.encryptedApiKey = encryptedApiKey; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
