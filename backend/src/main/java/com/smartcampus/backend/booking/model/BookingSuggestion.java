package com.smartcampus.backend.booking.model;

import lombok.AllArgsConstructor;
import lombok.Data;

// Simple DTO to return booking suggestions when a booking request conflicts with existing bookings
@Data
@AllArgsConstructor
public class BookingSuggestion {
    private String suggestedStartTime;
    private String suggestedEndTime;
    private String message;
}