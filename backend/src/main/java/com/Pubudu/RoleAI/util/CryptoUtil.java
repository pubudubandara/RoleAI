package com.Pubudu.RoleAI.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class CryptoUtil {

    private static final String ALG = "AES";
    private static final String CIPHER = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; // bits
    private static final int IV_LENGTH = 12; // bytes

    private final byte[] key;
    private final java.util.List<byte[]> legacyKeys;
    private final SecureRandom random = new SecureRandom();

    public CryptoUtil(
            @Value("${app.encryption.secret}") String secret,
            @Value("${app.encryption.legacy-secrets:}") String legacySecrets
    ) {
        // Derive 16-byte key from secret (simple approach). In production use PBKDF2/Argon2.
        this.key = deriveKey(secret);
        this.legacyKeys = new java.util.ArrayList<>();
        if (legacySecrets != null && !legacySecrets.isBlank()) {
            for (String s : legacySecrets.split(",")) {
                String trimmed = s.trim();
                if (!trimmed.isEmpty()) {
                    legacyKeys.add(deriveKey(trimmed));
                }
            }
        }
    }

    private byte[] deriveKey(String secret) {
        byte[] raw = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        byte[] k = new byte[16];
        for (int i = 0; i < k.length; i++) {
            k[i] = i < raw.length ? raw[i] : 0;
        }
        return k;
    }

    public String encrypt(String plaintext) {
        if (plaintext == null) return null;
        try {
            byte[] iv = new byte[IV_LENGTH];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(CIPHER);
            SecretKeySpec ks = new SecretKeySpec(key, ALG);
            cipher.init(Cipher.ENCRYPT_MODE, ks, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] ct = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] out = new byte[iv.length + ct.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(ct, 0, out, iv.length, ct.length);
            return Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String ciphertextB64) {
        if (ciphertextB64 == null) return null;
        // Try primary key first, then each legacy key
        RuntimeException last = null;
        java.util.List<byte[]> keysToTry = new java.util.ArrayList<>();
        keysToTry.add(this.key);
        keysToTry.addAll(this.legacyKeys);
        for (byte[] k : keysToTry) {
            try {
                byte[] in = Base64.getDecoder().decode(ciphertextB64);
                byte[] iv = new byte[IV_LENGTH];
                byte[] ct = new byte[in.length - IV_LENGTH];
                System.arraycopy(in, 0, iv, 0, IV_LENGTH);
                System.arraycopy(in, IV_LENGTH, ct, 0, ct.length);
                Cipher cipher = Cipher.getInstance(CIPHER);
                SecretKeySpec ks = new SecretKeySpec(k, ALG);
                cipher.init(Cipher.DECRYPT_MODE, ks, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
                byte[] pt = cipher.doFinal(ct);
                return new String(pt, StandardCharsets.UTF_8);
            } catch (Exception e) {
                last = new RuntimeException("Decryption failed", e);
                // try next key
            }
        }
        throw last != null ? last : new RuntimeException("Decryption failed: no keys available");
    }
}
