package com.smartcampus.backend.chatbot;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatbotService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CampusTools campusTools;

    // In-memory conversation history per session (max 20 messages)
    private final Map<String, List<Map<String, String>>> conversationStore = new ConcurrentHashMap<>();

    private static final String SYSTEM_PROMPT = """
            You are the **Campus Sync Assistant**, a helpful knowledge-base bot embedded in the
            Smart Campus Operations Hub. You help lecturers, staff, and students navigate the system.

            ## What you know about the system
            - **Book Resource**: Users can browse and book rooms, labs, and lecture halls.
              Bookings go through admin approval (statuses: PENDING → APPROVED / REJECTED).
            - **View Resources**: Lists all campus resources with availability.
            - **My Bookings**: Shows the user's booking history and statuses.
            - **Report Incident**: Users report campus issues (broken equipment, maintenance, etc.).
            - **My Tickets**: Track reported incidents (statuses: REPORTED → ASSIGNED → IN_PROGRESS → FIXED).
              Admins assign technicians to handle tickets.
            - **Notifications**: Real-time updates about bookings, tickets, and announcements.
            - **Authentication**: Google OAuth sign-in.

            ## Navigation paths
            - Dashboard: /user/dashboard
            - View Resources: /user/resources
            - Book Resource: /user/book-resource
            - My Bookings: /user/my-bookings
            - Report Incident: /user/report-incident
            - My Tickets: /user/my-tickets
            - Notifications: /user/notifications

            ## Rules
            - Be concise, friendly, and helpful.
            - If asked something outside campus operations, politely redirect to campus topics.
            - Use markdown formatting for clarity.
            - Keep responses short (2-4 sentences) unless the user asks for detail.
            """;

    public ChatbotService(@Value("${groq.api.key}") String apiKey,
                          @Value("${groq.api.model:openai/gpt-oss-120b}") String model,
                          CampusTools campusTools) {
        this.campusTools = campusTools;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String ask(String message, String conversationId, String userId) {
        // Get or create conversation history
        List<Map<String, String>> history = conversationStore.computeIfAbsent(
                conversationId, k -> new ArrayList<>());

        // Add user message
        history.add(Map.of("role", "user", "content", message));

        // Trim to last 20 messages
        if (history.size() > 20) {
            history = new ArrayList<>(history.subList(history.size() - 20, history.size()));
            conversationStore.put(conversationId, history);
        }

        // Enrich system prompt with live data if user ID is available
        String enrichedSystem = SYSTEM_PROMPT;
        if (userId != null && !userId.isBlank()) {
            enrichedSystem += "\n## Current user context\n" + campusTools.getUserContext(userId);
        }

        // Build messages array
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", enrichedSystem));
        messages.addAll(history);

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", "openai/gpt-oss-120b",
                    "messages", messages,
                    "temperature", 0.7,
                    "max_completion_tokens", 512
            );

            String response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(objectMapper.writeValueAsString(requestBody))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String reply = root.path("choices").get(0).path("message").path("content").asText();

            // Add assistant reply to history
            history.add(Map.of("role", "assistant", "content", reply));

            return reply;
        } catch (Exception e) {
            return "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
        }
    }
}
