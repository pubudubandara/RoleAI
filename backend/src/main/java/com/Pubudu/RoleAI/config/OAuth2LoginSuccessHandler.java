package com.Pubudu.RoleAI.config;

import com.Pubudu.RoleAI.entity.User;
import com.Pubudu.RoleAI.repository.UserRepository;
import com.Pubudu.RoleAI.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                       Authentication authentication) throws IOException {
        
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) token.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        // 1. Check if user exists in your DB
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            // Auto-register the user with Google OAuth2
            user = new User();
            user.setEmail(email);
            user.setFullName(name != null ? name : email);
            user.setEnabled(true); // Google already verified the email
            user.setPassword(null); // No password for OAuth2 users
            userRepository.save(user);
            
            System.out.println("New user auto-registered via Google OAuth2: " + email);
        } else {
            System.out.println("Existing user logged in via Google OAuth2: " + email);
        }

        // 2. Generate your system's JWT
        String jwtToken = jwtUtil.generateToken(user);

        // 3. Redirect to React Frontend with the token
        String targetUrl = frontendUrl + "/oauth2/redirect?token=" + jwtToken;
        
        System.out.println("Redirecting to: " + targetUrl);
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
