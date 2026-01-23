package com.Pubudu.RoleAI.service;

import org.springframework.stereotype.Service;
// import org.springframework.web.client.RestTemplate;
// import org.springframework.http.HttpEntity;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.HttpMethod;
// import org.springframework.http.ResponseEntity;
// import com.fasterxml.jackson.databind.JsonNode;
// import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
// import java.util.Map;
// import java.util.HashMap;

@Service
public class EmbeddingService {

    public EmbeddingService() {
        // this.restTemplate = new RestTemplate();
        // this.objectMapper = new ObjectMapper();
    }

    /**
     * Generate vector embedding for text using OpenAI's text-embedding-ada-002 model
     * For now, returns a mock embedding. Replace with actual OpenAI API call when ready.
     */
    public String generateEmbedding(String text) {
        // Mock implementation - replace with actual OpenAI API call
        return generateMockEmbedding(text);
    }

    /**
     * Generate vector embedding as double array
     */
    public double[] generateEmbeddingArray(String text) {
        String embeddingString = generateEmbedding(text);
        return parseEmbedding(embeddingString);
    }

    /**
     * Generate mock embedding for development/testing
     */
    private String generateMockEmbedding(String text) {
    // Generate a simple hash-based mock embedding (1024 dimensions to match llama-text-embed-v2)
        int hash = text.hashCode();
    double[] embedding = new double[1024];
        
        // Use hash to generate deterministic but varied values
        java.util.Random random = new java.util.Random(hash);
        for (int i = 0; i < embedding.length; i++) {
            embedding[i] = random.nextGaussian() * 0.1; // Small random values
        }
        
        // Convert to comma-separated string for storage
        return Arrays.toString(embedding).replaceAll("[\\[\\]\\s]", "");
    }


    public double calculateSimilarity(String embedding1, String embedding2) {
        try {
            double[] vec1 = parseEmbedding(embedding1);
            double[] vec2 = parseEmbedding(embedding2);
            
            double dotProduct = 0.0;
            double normA = 0.0;
            double normB = 0.0;
            
            for (int i = 0; i < vec1.length; i++) {
                dotProduct += vec1[i] * vec2[i];
                normA += vec1[i] * vec1[i];
                normB += vec2[i] * vec2[i];
            }
            
            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        } catch (Exception e) {
            return 0.0; // Return 0 similarity if calculation fails
        }
    }

    /**
     * Parse embedding string to double array
     */
    public double[] parseEmbedding(String embedding) {
        String[] parts = embedding.split(",");
        double[] result = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Double.parseDouble(parts[i].trim());
        }
        return result;
    }
}