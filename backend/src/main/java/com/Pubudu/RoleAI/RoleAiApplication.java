package com.Pubudu.RoleAI;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RoleAiApplication {

	public static void main(String[] args) {
		// Load environment variables from .env file
		// Try multiple locations to find the .env file
		Dotenv dotenv = null;
		String[] possiblePaths = {".", "./backend", "../backend"};
		
		for (String path : possiblePaths) {
			try {
				dotenv = Dotenv.configure()
					.directory(path)
					.ignoreIfMissing()
					.load();
				if (dotenv != null && dotenv.get("JWT_SECRET") != null) {
					System.out.println("✓ Loaded .env file from: " + path);
					break;
				}
			} catch (Exception e) {
				// Try next path
			}
		}
		
		if (dotenv == null || dotenv.get("JWT_SECRET") == null) {
			System.err.println("ERROR: Could not find .env file with required variables!");
			System.err.println("Tried locations: ., ./backend, ../backend");
			System.err.println("Please ensure .env file exists in the backend directory");
			System.exit(1);
		}
		
		// Set system properties from .env
		dotenv.entries().forEach(entry -> 
			System.setProperty(entry.getKey(), entry.getValue())
		);
		
		SpringApplication.run(RoleAiApplication.class, args);
	}

}
