package com.smartcampus.backend.chatbot;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
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

    private final Map<String, List<Map<String, Object>>> conversationStore = new ConcurrentHashMap<>();

    private static final int MAX_TOOL_ROUNDS = 5;

    private static final String SYSTEM_PROMPT = """
            You are the **Campus Sync Assistant**, an AI agent embedded in the Smart Campus Operations Hub.
            You can perform real actions on behalf of users — book resources, check bookings, cancel bookings, list resources, and more.

            ## What you can DO (via tools)
            - **list_resources**: Show all campus resources (rooms, labs, lecture halls, equipment)
            - **search_resource_by_name**: Find a resource by name (e.g., "Lecture Hall A")
            - **create_booking**: Book a resource for a user (date, time, purpose, attendees)
            - **get_user_bookings**: View the user's current and past bookings
            - **cancel_booking**: Cancel an existing booking
            - **get_booking_suggestion**: Get suggested available time slots when there's a conflict
            - **get_user_issues**: View the user's reported issues/tickets

            ## How to handle bookings
            1. When a user wants to book, first use **search_resource_by_name** to find the resource ID
            2. Then use **create_booking** with the correct resource ID, user ID, date, time, purpose, and attendees
            3. If booking fails due to conflict, use **get_booking_suggestion** to find an alternative slot
            4. Always confirm the details back to the user after a successful booking

            ## Rules
            - ALWAYS use tools to perform actions — never just describe steps for the user to do manually
            - Be concise, friendly, and helpful
            - If asked something outside campus operations, politely redirect
            - Use markdown formatting for clarity
            - The current user's ID is provided in context — use it for bookings and queries
            - Dates should be in YYYY-MM-DD format, times in HH:mm (24-hour) format
            """;

    // Tool definitions for the LLM (OpenAI-compatible function calling format)
    private static final String TOOLS_JSON = """
            [
              {
                "type": "function",
                "function": {
                  "name": "list_resources",
                  "description": "List all campus resources including rooms, labs, lecture halls, and equipment with their availability status",
                  "parameters": { "type": "object", "properties": {}, "required": [] }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "search_resource_by_name",
                  "description": "Search for a campus resource by name (e.g., 'Lecture Hall A', 'Lab 3'). Returns matching resources with their IDs.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string", "description": "The name or partial name of the resource to search for" }
                    },
                    "required": ["name"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "create_booking",
                  "description": "Create a new booking for a campus resource. The booking will be in PENDING status until an admin approves it.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "resourceId": { "type": "string", "description": "The ID of the resource to book" },
                      "date": { "type": "string", "description": "Booking date in YYYY-MM-DD format (e.g., 2026-04-27)" },
                      "startTime": { "type": "string", "description": "Start time in HH:mm 24-hour format (e.g., 17:00)" },
                      "endTime": { "type": "string", "description": "End time in HH:mm 24-hour format (e.g., 18:00)" },
                      "purpose": { "type": "string", "description": "Purpose of the booking" },
                      "attendees": { "type": "integer", "description": "Number of attendees" }
                    },
                    "required": ["resourceId", "date", "startTime", "endTime", "purpose", "attendees"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "get_user_bookings",
                  "description": "Get all bookings for the current user, including status and details",
                  "parameters": { "type": "object", "properties": {}, "required": [] }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "cancel_booking",
                  "description": "Cancel an existing booking by its booking ID",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "bookingId": { "type": "string", "description": "The ID of the booking to cancel" }
                    },
                    "required": ["bookingId"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "get_booking_suggestion",
                  "description": "Get a suggested available time slot for a resource when the requested slot has a conflict",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "resourceId": { "type": "string", "description": "The resource ID" },
                      "date": { "type": "string", "description": "Date in YYYY-MM-DD format" },
                      "startTime": { "type": "string", "description": "Desired start time in HH:mm format" },
                      "endTime": { "type": "string", "description": "Desired end time in HH:mm format" }
                    },
                    "required": ["resourceId", "date", "startTime", "endTime"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "get_user_issues",
                  "description": "Get all reported issues/tickets for the current user",
                  "parameters": { "type": "object", "properties": {}, "required": [] }
                }
              }
            ]
            """;

    private final String model;

    public ChatbotService(@Value("${groq.api.key}") String apiKey,
                          @Value("${groq.api.model:llama-3.3-70b-versatile}") String model,
                          CampusTools campusTools) {
        this.model = model;
        this.campusTools = campusTools;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String ask(String message, String conversationId, String userId) {
        List<Map<String, Object>> history = conversationStore.computeIfAbsent(
                conversationId, k -> new ArrayList<>());

        history.add(Map.of("role", "user", "content", message));

        if (history.size() > 20) {
            history = new ArrayList<>(history.subList(history.size() - 20, history.size()));
            conversationStore.put(conversationId, history);
        }

        String enrichedSystem = SYSTEM_PROMPT;
        if (userId != null && !userId.isBlank()) {
            enrichedSystem += "\n## Current user context\n"
                    + "- User ID: " + userId + "\n"
                    + campusTools.getUserContext(userId);
        }

        try {
            for (int round = 0; round < MAX_TOOL_ROUNDS; round++) {
                List<Map<String, Object>> messages = new ArrayList<>();
                messages.add(Map.of("role", "system", "content", enrichedSystem));
                messages.addAll(history);

                ObjectNode requestBody = objectMapper.createObjectNode();
                requestBody.put("model", model);
                requestBody.set("messages", objectMapper.valueToTree(messages));
                requestBody.put("temperature", 0.7);
                requestBody.put("max_completion_tokens", 1024);
                requestBody.set("tools", objectMapper.readTree(TOOLS_JSON));

                String response = restClient.post()
                        .uri("/chat/completions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(objectMapper.writeValueAsString(requestBody))
                        .retrieve()
                        .body(String.class);

                JsonNode root = objectMapper.readTree(response);
                JsonNode choice = root.path("choices").get(0);
                JsonNode messageNode = choice.path("message");
                String finishReason = choice.path("finish_reason").asString();

                if ("tool_calls".equals(finishReason) && messageNode.has("tool_calls")) {
                    // Add the assistant message with tool_calls to history
                    Map<String, Object> assistantMsg = new LinkedHashMap<>();
                    assistantMsg.put("role", "assistant");
                    assistantMsg.put("content", messageNode.has("content") && !messageNode.path("content").isNull()
                            ? messageNode.path("content").asString() : null);

                    List<Map<String, Object>> toolCalls = new ArrayList<>();
                    for (JsonNode tc : messageNode.path("tool_calls")) {
                        Map<String, Object> toolCall = new LinkedHashMap<>();
                        toolCall.put("id", tc.path("id").asString());
                        toolCall.put("type", "function");
                        Map<String, String> function = new LinkedHashMap<>();
                        function.put("name", tc.path("function").path("name").asString());
                        function.put("arguments", tc.path("function").path("arguments").asString());
                        toolCall.put("function", function);
                        toolCalls.add(toolCall);
                    }
                    assistantMsg.put("tool_calls", toolCalls);
                    history.add(assistantMsg);

                    for (JsonNode tc : messageNode.path("tool_calls")) {
                        String toolCallId = tc.path("id").asString();
                        String functionName = tc.path("function").path("name").asString();
                        String argsJson = tc.path("function").path("arguments").asString();
                        JsonNode args = objectMapper.readTree(argsJson);

                        String result = executeTool(functionName, args, userId);

                        Map<String, Object> toolResultMsg = new LinkedHashMap<>();
                        toolResultMsg.put("role", "tool");
                        toolResultMsg.put("tool_call_id", toolCallId);
                        toolResultMsg.put("content", result);
                        history.add(toolResultMsg);
                    }

                    continue;
                }

                // Model returned a final text response
                String reply = messageNode.path("content").asString();
                history.add(Map.of("role", "assistant", "content", reply));
                return reply;
            }

            return "I tried multiple steps but couldn't complete the action. Please try again or be more specific.";

        } catch (Exception e) {
            return "Sorry, I'm having trouble right now: " + e.getMessage();
        }
    }

    private String executeTool(String functionName, JsonNode args, String userId) {
        return switch (functionName) {
            case "list_resources" -> campusTools.listResources();
            case "search_resource_by_name" -> campusTools.searchResourceByName(args.path("name").asString());
            case "create_booking" -> campusTools.createBooking(
                    args.path("resourceId").asString(),
                    userId,
                    args.path("date").asString(),
                    args.path("startTime").asString(),
                    args.path("endTime").asString(),
                    args.path("purpose").asString(),
                    args.path("attendees").asInt()
            );
            case "get_user_bookings" -> campusTools.getUserBookings(userId);
            case "cancel_booking" -> campusTools.cancelBooking(args.path("bookingId").asString());
            case "get_booking_suggestion" -> campusTools.getBookingSuggestion(
                    args.path("resourceId").asString(),
                    args.path("date").asString(),
                    args.path("startTime").asString(),
                    args.path("endTime").asString()
            );
            case "get_user_issues" -> campusTools.getUserIssues(userId);
            default -> "Unknown tool: " + functionName;
        };
    }
}
