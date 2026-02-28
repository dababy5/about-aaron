package com.aaron.portfolio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Value("${openai.apiKey:}")
    private String openaiApiKey;

    public String generateReply(String message) {
        String lowerMsg = message.toLowerCase();

        if (lowerMsg.contains("projects")) {
            return "I've worked on several exciting projects! From full-stack web apps using React and Spring Boot, to 3D visualization tools with Three.js. " +
                   "I focus on creating clean, maintainable code and intuitive user experiences. What specific type of project interests you?";
        }

        if (lowerMsg.contains("skills")) {
            return "My core skills include: Java, Spring Boot, React, TypeScript, Three.js, and Web development. " +
                   "I'm experienced with Maven, Docker, REST APIs, and modern frontend tooling like Vite. " +
                   "Always learning new technologies! What would you like to know more about?";
        }

        String reply = "You said: \"" + message + "\". ";
        reply += "Feel free to ask me about my projects, skills, experience, or anything else!";

        // Placeholder for OpenAI integration (commented out - do not break build if key missing)
        /*
        if (!openaiApiKey.isEmpty()) {
            // Uncomment when ready to integrate OpenAI:
            // RestClient client = RestClient.create();
            // Map<String, Object> body = Map.of(
            //     "model", "gpt-3.5-turbo",
            //     "messages", new Object[]{ Map.of("role", "user", "content", message) }
            // );
            // Map<String, Object> response = client.post()
            //     .uri("https://api.openai.com/v1/chat/completions")
            //     .header("Authorization", "Bearer " + openaiApiKey)
            //     .body(body).retrieve().body(Map.class);
            // reply = (String) ((Map<String, Object>) ((List) response.get("choices")).get(0)).get("text");
        }
        */

        return reply;
    }
}
