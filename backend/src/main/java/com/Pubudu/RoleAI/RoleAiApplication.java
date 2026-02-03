package com.Pubudu.RoleAI;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class RoleAiApplication {

	public static void main(String[] args) {
		// Load .env file from either ./ or ./backend
		loadEnvironment();
		SpringApplication.run(RoleAiApplication.class, args);
	}

	private static void loadEnvironment() {
		try {
			// Check if .env exists in current directory (./) 
			if (Files.exists(Path.of(".env"))) {
				Dotenv.configure()
						.directory(".")
						.systemProperties()
						.load();
				System.out.println("Loaded .env from root directory");
			} 
			// Check if .env exists in ./backend directory
			else if (Files.exists(Path.of("./backend/.env"))) {
				Dotenv.configure()
						.directory("./backend")
						.systemProperties()
						.load();
				System.out.println("Loaded .env from backend directory");
			} else {
				System.out.println("No .env file found in ./ or ./backend - using default configuration");
			}
		} catch (Exception e) {
			System.err.println("Error loading .env file: " + e.getMessage());
		}
	}

}
