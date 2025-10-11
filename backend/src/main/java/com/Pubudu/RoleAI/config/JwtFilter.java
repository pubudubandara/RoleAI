package com.Pubudu.RoleAI.config;

import com.Pubudu.RoleAI.entity.User;
import com.Pubudu.RoleAI.repository.UserRepository;
import com.Pubudu.RoleAI.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    // Simple cache to reduce database calls
    private final Map<String, User> userCache = new ConcurrentHashMap<>();
    private final long CACHE_DURATION = 300000; // 5 minutes
    private final Map<String, Long> cacheTimestamps = new ConcurrentHashMap<>();

    // List of public endpoints that don't need JWT authentication
    private final List<String> publicPaths = Arrays.asList(
        "/api/auth/signup",
        "/api/auth/login", 
        "/api/auth/verify",
        "/api/auth/forgot-password",
        "/api/auth/verify-reset-code",
        "/api/auth/reset-password"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Skip JWT filter for public paths
        if (publicPaths.stream().anyMatch(path::startsWith)) {
            return true;
        }
        
        // Skip JWT filter for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equals(method)) {
            return true;
        }
        
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.getEmailFromToken(token);
            } catch (Exception e) {
                // Invalid token, continue without authentication
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = getCachedUser(email);

            if (user != null && jwtUtil.validateToken(token)) {
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        user, null, new ArrayList<>()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

    private User getCachedUser(String email) {
        long currentTime = System.currentTimeMillis();
        
        // Check if user is in cache and not expired
        if (userCache.containsKey(email) && cacheTimestamps.containsKey(email)) {
            long cacheTime = cacheTimestamps.get(email);
            if (currentTime - cacheTime < CACHE_DURATION) {
                return userCache.get(email);
            } else {
                // Remove expired entry
                userCache.remove(email);
                cacheTimestamps.remove(email);
            }
        }
        
        // Fetch from database and cache
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            userCache.put(email, user);
            cacheTimestamps.put(email, currentTime);
        }
        
        return user;
    }
}