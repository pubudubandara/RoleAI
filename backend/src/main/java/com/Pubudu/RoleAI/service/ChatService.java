package com.Pubudu.RoleAI.service;

import com.Pubudu.RoleAI.dto.RoleDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    @Value("${gemini.api.key:}") // default to empty if not provided
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/}")
    private String geminiApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient = WebClient.create();

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private PineconeService pineconeService;

    @Autowired
    private ModelConfigService modelConfigService;

    public String generateReply(RoleDTO role, String userMessage, String model, Long modelConfigId) {
        // TEMPORARY: Enable this for testing without API key issues
        String apiKeyToUse = geminiApiKey;
        String modelToUse = (model == null || model.isBlank()) ? "gemini-2.5-flash" : model;
        if (modelConfigId != null) {
            try {
                var opt = modelConfigService.get(modelConfigId);
                if (opt.isPresent()) {
                    var mc = opt.get();
                    apiKeyToUse = modelConfigService.getApiKeyPlain(mc);
                    if (mc.getModelId() != null && !mc.getModelId().isBlank()) {
                        modelToUse = mc.getModelId();
                    }
                    logger.info("Using ModelConfig {} -> provider={} model={} apiKeyPrefix={}",
                        mc.getId(), mc.getProvider(), modelToUse,
                        apiKeyToUse != null && apiKeyToUse.length() > 6 ? apiKeyToUse.substring(0,6) + "***" : "null/empty");
                }
            } catch (Exception e) {
                logger.warn("Failed to load model config {}: {}", modelConfigId, e.getMessage());
            }
        }
        if (apiKeyToUse == null || apiKeyToUse.isEmpty() || "your_gemini_api_key_here".equals(apiKeyToUse)) {
            logger.warn("Using mock response - Gemini API key not configured");
            return "Mock response from " + role.getName() + ": " + userMessage + " (Configure API key or add a Model in settings for real responses)";
        }
        
        try {
            // Build retrieval-augmented context from Pinecone (best-effort)
            String context = buildContextFromVectors(role, userMessage);

            // System prompt includes role description and retrieved context
            StringJoiner systemText = new StringJoiner("\n\n");
            systemText.add("You are a helpful assistant acting as the following role.");
            systemText.add("Role: " + role.getName());
            systemText.add("Role description: " + safe(role.getDescription()));
            if (!context.isBlank()) {
                systemText.add("Relevant role context (from vector DB):\n" + context);
            }

            Map<String, Object> systemInstruction = Map.of(
                "role", "system",
                "parts", new Object[]{Map.of("text", systemText.toString())}
            );

            Map<String, Object> userContent = Map.of(
                "role", "user",
                "parts", new Object[]{Map.of("text", userMessage)}
            );

            Map<String, Object> requestBody = Map.of(
                // Gemini REST expects snake_case: system_instruction
                "system_instruction", systemInstruction,
                "contents", new Object[]{userContent}
            );

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            // Log a compact version of the request body (truncate to 2k)
            String preview = jsonBody.length() > 2048 ? jsonBody.substring(0, 2048) + "..." : jsonBody;
            logger.debug("Gemini request body (truncated): {}", preview);

            // Prepare bases and model variants to try (v1beta/v1 and with/without -latest)
            String primaryBase = trimTrailingSlash(geminiApiUrl);
            String fallbackBase = primaryBase.contains("v1beta/models")
                    ? primaryBase.replace("v1beta/models", "v1/models")
                    : primaryBase.replace("v1/models", "v1beta/models");

            String baseModel = modelToUse;
            String withLatest = modelToUse != null && modelToUse.endsWith("-latest") ? modelToUse : modelToUse + "-latest";
            String withoutLatest = modelToUse != null && modelToUse.endsWith("-latest") ? modelToUse.substring(0, modelToUse.length() - 7) : modelToUse;

            java.util.LinkedHashSet<String> modelVariants = new java.util.LinkedHashSet<>();
            modelVariants.add(baseModel);
            modelVariants.add(withoutLatest);
            modelVariants.add(withLatest);

            java.util.LinkedHashSet<String> baseVariants = new java.util.LinkedHashSet<>();
            baseVariants.add(primaryBase);
            baseVariants.add(fallbackBase);

            String responseBody = null;
            WebClientResponseException lastHttpEx = null;
            Exception lastEx = null;
            outer:
            for (String b : baseVariants) {
                for (String mv : modelVariants) {
                    String url = UriComponentsBuilder
                            .fromUriString(b + "/" + mv + ":generateContent")
                            .queryParam("key", apiKeyToUse)
                            .toUriString();
                    logger.info("Calling Gemini URL: {}", maskApiKey(url));
                    try {
                        responseBody = webClient.post()
                                .uri(url)
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .bodyValue(jsonBody)
                                .retrieve()
                                .bodyToMono(String.class)
                                .block();
                        break outer; // success
                    } catch (WebClientResponseException.NotFound nf) {
                        lastHttpEx = nf; // try next variant
                        logger.warn("Gemini returned 404 for URL: {} -- trying next variant", maskApiKey(url));
                    } catch (WebClientResponseException wex) {
                        lastHttpEx = wex;
                        logger.error("Gemini HTTP error: status={} body={}", wex.getStatusCode().value(), wex.getResponseBodyAsString());
                        break outer; // other HTTP errors - stop early
                    } catch (Exception ex) {
                        lastEx = ex;
                        logger.error("Gemini call failed: {}", ex.getMessage());
                        break outer; // unexpected failure
                    }
                }
            }
            if (responseBody == null) {
                if (lastHttpEx != null) throw lastHttpEx;
                if (lastEx != null) throw lastEx;
                throw new RuntimeException("Gemini call failed with no response");
            }
            // Parse response
            logger.debug("Gemini raw response (truncated): {}", responseBody != null && responseBody.length() > 2048 ? responseBody.substring(0, 2048) + "..." : responseBody);
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            JsonNode candidates = jsonResponse.get("candidates");
            if (candidates != null && candidates.size() > 0) {
                JsonNode content = candidates.get(0).get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.size() > 0) {
                        return parts.get(0).get("text").asText();
                    }
                }
            }
            throw new RuntimeException("No content in Gemini response");

        } catch (Exception e) {
            if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException wex) {
                int status = wex.getStatusCode().value();
                String errorBody = wex.getResponseBodyAsString();
                logger.error("Gemini API error: status={} body={}", status, errorBody);
                
                if (status == 403) {
                    logger.error("GEMINI API KEY ERROR: 403 Forbidden - Check your API key permissions and billing");
                    logger.error("Current API key starts with: {}", apiKeyToUse != null && apiKeyToUse.length() > 10 
                        ? apiKeyToUse.substring(0, 10) + "..." : "null/empty");
                }
            } else {
                logger.error("Error calling Gemini API", e);
            }
            throw new RuntimeException("Failed to generate reply", e);
        }
    }

    private String buildContextFromVectors(RoleDTO role, String userMessage) {
        try {
            // Generate embedding for the user's message (and role name for better intent)
            String query = role.getName() + ": " + userMessage;
            double[] queryEmbedding = embeddingService.generateEmbeddingArray(query);

            Long userId = role.getUserId();
            if (userId == null) {
                return ""; // cannot scope to namespace without user
            }

            List<Map<String, Object>> matches = pineconeService.searchSimilarRoles(userId, queryEmbedding, 5);
            if (matches == null || matches.isEmpty()) return "";

            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> m : matches) {
                String rName = String.valueOf(m.getOrDefault("roleName", ""));
                String desc = String.valueOf(m.getOrDefault("description", ""));
                Object scoreObj = m.get("score");
                String score = scoreObj != null ? String.format("%.3f", (double) scoreObj) : "";
                sb.append("- ").append(rName).append(": ").append(desc);
                if (!score.isBlank()) sb.append(" (score ").append(score).append(")");
                sb.append("\n");
            }
            return sb.toString().trim();
        } catch (Exception e) {
            logger.warn("Vector context build failed: {}", e.getMessage());
            return ""; // best-effort: don't block chat if vectors fail
        }
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private String maskApiKey(String url) {
        if (url == null) return null;
        int idx = url.indexOf("key=");
        if (idx == -1) return url;
        int start = idx + 4;
        int end = url.indexOf('&', start);
        String key = end == -1 ? url.substring(start) : url.substring(start, end);
        String masked = key.length() <= 4 ? "****" : key.substring(0, 2) + "****" + key.substring(key.length() - 2);
        return url.replace(key, masked);
    }

    private String trimTrailingSlash(String s) {
        if (s == null) return null;
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}
