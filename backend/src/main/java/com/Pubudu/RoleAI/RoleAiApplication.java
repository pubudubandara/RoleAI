package com.Pubudu.RoleAI;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RoleAiApplication {

	public static void main(String[] args) {
		// Load environment variables from .env file
		Dotenv.configure()
			.directory("./backend")
			.ignoreIfMissing()
			.systemProperties()
			.load();
		
		SpringApplication.run(RoleAiApplication.class, args);
	}

}
