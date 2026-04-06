package com.aaron.portfolio.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aaron.portfolio.service.ChatService;

@RestController
@RequestMapping("/api")
public class ChatController {

    private static final int MAX_WORDS = 500;

    @Autowired
    private ChatService chatService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message is required."));
        }

        int wordCount = message.trim().split("\\s+").length;
        if (wordCount > MAX_WORDS) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message exceeds the " + MAX_WORDS + " word limit."));
        }

        String reply = chatService.generateReply(message);
        Map<String, String> response = new HashMap<>();
        response.put("reply", reply);
        return ResponseEntity.ok(response);
    }
}
