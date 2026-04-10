package com.smartcampus.backend.chatbot;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> request) {
        String message = request.getOrDefault("message", "").trim();
        String conversationId = request.getOrDefault("conversationId", "default");
        String userId = request.getOrDefault("userId", "");

        if (message.isEmpty()) {
            return ResponseEntity.ok(Map.of("reply", "Please type a question and I'll do my best to help!"));
        }

        String reply = chatbotService.ask(message, conversationId, userId);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
