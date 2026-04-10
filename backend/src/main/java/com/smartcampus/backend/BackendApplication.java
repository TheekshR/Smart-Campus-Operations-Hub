package com.smartcampus.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        String mongoUri = dotenv.get("MONGO_URI");
        String googleClientId = dotenv.get("GOOGLE_CLIENT_ID");
        String googleClientSecret = dotenv.get("GOOGLE_CLIENT_SECRET");
        String groqApiKey = dotenv.get("GROQ_API_KEY");

        System.setProperty("MONGO_URI", mongoUri != null ? mongoUri : "");
        System.setProperty("GOOGLE_CLIENT_ID", googleClientId != null ? googleClientId : "");
        System.setProperty("GOOGLE_CLIENT_SECRET", googleClientSecret != null ? googleClientSecret : "");
        System.setProperty("GROQ_API_KEY", groqApiKey != null ? groqApiKey : "");

        System.out.println("MONGO_URI loaded: " + System.getProperty("MONGO_URI"));
        System.out.println("GOOGLE_CLIENT_ID loaded: " + !System.getProperty("GOOGLE_CLIENT_ID").isBlank());

        SpringApplication.run(BackendApplication.class, args);
    }
}