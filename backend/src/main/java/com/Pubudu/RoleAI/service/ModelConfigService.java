package com.Pubudu.RoleAI.service;

import com.Pubudu.RoleAI.entity.ModelConfig;
import com.Pubudu.RoleAI.repository.ModelConfigRepository;
import com.Pubudu.RoleAI.util.CryptoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ModelConfigService {
    @Autowired
    private ModelConfigRepository repository;

    @Autowired
    private CryptoUtil cryptoUtil;

    public ModelConfig create(Long userId, String provider, String modelId, String label, String apiKeyPlain) {
        ModelConfig mc = new ModelConfig();
        mc.setUserId(userId);
        mc.setProvider(provider);
        mc.setModelId(modelId);
        mc.setLabel(label);
        mc.setEncryptedApiKey(cryptoUtil.encrypt(apiKeyPlain));
        return repository.save(mc);
    }

    public List<ModelConfig> listForUser(Long userId) {
        return repository.findByUserIdOrUserIdIsNull(userId);
    }

    public Optional<ModelConfig> get(Long id) {
        return repository.findById(id);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public ModelConfig update(Long id, String provider, String modelId, String label, String apiKeyPlain) {
        ModelConfig mc = repository.findById(id).orElseThrow();
        if (provider != null) mc.setProvider(provider);
        if (modelId != null) mc.setModelId(modelId);
        if (label != null) mc.setLabel(label);
        if (apiKeyPlain != null && !apiKeyPlain.isBlank()) {
            mc.setEncryptedApiKey(cryptoUtil.encrypt(apiKeyPlain));
        }
        return repository.save(mc);
    }

    public String getApiKeyPlain(ModelConfig mc) {
        return cryptoUtil.decrypt(mc.getEncryptedApiKey());
    }
}
