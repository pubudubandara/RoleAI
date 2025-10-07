package com.Pubudu.RoleAI.service;

import com.Pubudu.RoleAI.dto.SignupRequest;
import com.Pubudu.RoleAI.entity.User;
import com.Pubudu.RoleAI.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;

    public User register(SignupRequest request) {
        // Validate input
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }

        String email = request.getEmail().trim().toLowerCase();

        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(false); // Disabled until email verification
        user.setVerificationToken(UUID.randomUUID().toString());

        userRepository.save(user);
        System.out.println("User registered: " + user.getEmail() + ", enabled: " + user.isEnabled() + ", token: " + user.getVerificationToken());

        String link = "http://localhost:8080/api/auth/verify?token=" + user.getVerificationToken();
        System.out.println("Verification link: " + link);
        emailService.sendEmail(user.getEmail(), "Verify your email",
                "Click here to verify: " + link);

        return user;
    }

    public boolean verifyUser(String token) {
        System.out.println("Verifying user with token: " + token);
        
        if (token == null || token.trim().isEmpty()) {
            System.out.println("Verification failed: Token is null or empty");
            throw new IllegalArgumentException("Verification token is required");
        }

        User user = userRepository.findByVerificationToken(token.trim())
                .orElseThrow(() -> {
                    System.out.println("Verification failed: Token not found in database: " + token.trim());
                    return new IllegalArgumentException("Invalid or expired verification token");
                });

        System.out.println("User found: " + user.getEmail() + ", enabled: " + user.isEnabled());

        if (user.isEnabled()) {
            System.out.println("Verification failed: User is already verified");
            throw new IllegalArgumentException("User is already verified");
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        System.out.println("User successfully verified: " + user.getEmail());
        return true;
    }
}