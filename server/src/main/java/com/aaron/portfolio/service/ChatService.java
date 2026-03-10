package com.aaron.portfolio.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ChatService {

    @Value("${modal.endpoint:https://pintotamayoaaron--aaron-ai-model-web.modal.run/ask}")
    private String modalEndpoint;

    private final RestClient restClient;

    public ChatService() {
        this.restClient = RestClient.create();
    }

    @SuppressWarnings("unchecked")
    public String generateReply(String message) {
        try {
            Map<String, Object> response = restClient.post()
                    .uri(modalEndpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("question", message))
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("answer")) {
                return (String) response.get("answer");
            }

            return "Hmm, I didn't get a response. Try asking something else!";
        } catch (Exception e) {
            return "Sorry, I'm having trouble connecting right now. Try again in a moment!";
        }
    }
}
