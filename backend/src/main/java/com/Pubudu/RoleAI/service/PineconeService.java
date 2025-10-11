package com.Pubudu.RoleAI.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class PineconeService {

    private static final Logger logger = LoggerFactory.getLogger(PineconeService.class);

    @Value("${pinecone.api.key}")
    private String apiKey;

    // Full serverless index host, e.g. https://xxxx.svc....pinecone.io
    @Value("${pinecone.host}")
    private String host;

    @Value("${pinecone.index.dimension}")
    private int dimension;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PineconeService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get the base URL for Pinecone API calls
     */
    private String getBaseUrl() {
        // Ensure no trailing slash
        if (host.endsWith("/")) {
            return host.substring(0, host.length() - 1);
        }
        return host;
    }

    /**
     * Create HTTP headers with authentication
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Api-Key", apiKey);
        return headers;
    }

    /**
     * Upsert a role embedding into Pinecone
     */
    public boolean upsertRoleEmbedding(Long roleId, Long userId, String roleName, String description, double[] embedding) {
        try {
            String url = getBaseUrl() + "/vectors/upsert";
            
            // Create metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("userId", userId.toString());
            metadata.put("roleName", roleName);
            metadata.put("description", description);
            metadata.put("type", "role");

            // Create vector object
            Map<String, Object> vector = new HashMap<>();
            vector.put("id", "role_" + roleId);
            vector.put("values", embedding);
            vector.put("metadata", metadata);

            // Create request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("vectors", Collections.singletonList(vector));
            requestBody.put("namespace", "user_" + userId);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, createHeaders());
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Successfully upserted role embedding for role ID: {}", roleId);
                return true;
            } else {
                logger.error("Failed to upsert role embedding. Status: {}, Response: {}", 
                           response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (Exception e) {
            logger.error("Error upserting role embedding for role ID: {}", roleId, e);
            return false;
        }
    }

    /**
     * Search for similar roles using vector similarity
     */
    public List<Map<String, Object>> searchSimilarRoles(Long userId, double[] queryEmbedding, int topK) {
        try {
            String url = getBaseUrl() + "/query";

            // Create request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("vector", queryEmbedding);
            requestBody.put("topK", topK);
            requestBody.put("includeMetadata", true);
            requestBody.put("includeValues", false);
            requestBody.put("namespace", "user_" + userId);

            // Add metadata filter to only get roles
            Map<String, Object> filter = new HashMap<>();
            filter.put("type", Map.of("$eq", "role"));
            requestBody.put("filter", filter);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, createHeaders());
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                JsonNode matches = jsonResponse.get("matches");
                
                List<Map<String, Object>> results = new ArrayList<>();
                if (matches != null && matches.isArray()) {
                    for (JsonNode match : matches) {
                        Map<String, Object> result = new HashMap<>();
                        result.put("id", match.get("id").asText());
                        result.put("score", match.get("score").asDouble());
                        
                        JsonNode metadata = match.get("metadata");
                        if (metadata != null) {
                            result.put("roleName", metadata.get("roleName").asText());
                            result.put("description", metadata.get("description").asText());
                            result.put("userId", metadata.get("userId").asText());
                        }
                        results.add(result);
                    }
                }
                
                logger.info("Found {} similar roles for user {}", results.size(), userId);
                return results;
            } else {
                logger.error("Failed to search similar roles. Status: {}, Response: {}", 
                           response.getStatusCode(), response.getBody());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            logger.error("Error searching similar roles for user: {}", userId, e);
            return Collections.emptyList();
        }
    }

    /**
     * Delete a role embedding from Pinecone
     */
    public boolean deleteRoleEmbedding(Long roleId, Long userId) {
        try {
            String url = getBaseUrl() + "/vectors/delete";

            // Create request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("ids", Collections.singletonList("role_" + roleId));
            requestBody.put("namespace", "user_" + userId);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, createHeaders());
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Successfully deleted role embedding for role ID: {}", roleId);
                return true;
            } else {
                logger.error("Failed to delete role embedding. Status: {}, Response: {}", 
                           response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (Exception e) {
            logger.error("Error deleting role embedding for role ID: {}", roleId, e);
            return false;
        }
    }

    /**
     * Check if the Pinecone index exists and is ready
     */
    public boolean isIndexReady() {
        try {
            String url = getBaseUrl() + "/describe_index_stats";

            HttpEntity<String> entity = new HttpEntity<>("{}", createHeaders());

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Pinecone index is ready and accessible");
                return true;
            } else {
                logger.warn("Pinecone index not ready. Status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            logger.error("Error checking Pinecone index status", e);
            return false;
        }
    }

    /**
     * Get index statistics
     */
    public Map<String, Object> getIndexStats() {
        try {
            String url = getBaseUrl() + "/describe_index_stats";

            HttpEntity<String> entity = new HttpEntity<>("{}", createHeaders());

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                @SuppressWarnings("unchecked")
                Map<String, Object> stats = objectMapper.convertValue(jsonResponse, Map.class);
                logger.info("Retrieved Pinecone index stats: {}", stats);
                return stats;
            } else {
                logger.error("Failed to get index stats. Status: {}", response.getStatusCode());
                return Collections.emptyMap();
            }
        } catch (Exception e) {
            logger.error("Error getting Pinecone index stats", e);
            return Collections.emptyMap();
        }
    }
}