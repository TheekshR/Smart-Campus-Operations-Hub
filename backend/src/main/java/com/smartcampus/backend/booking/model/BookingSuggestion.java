package com.smartcampus.backend.booking.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookingSuggestion {
    private String suggestedStartTime;
    private String suggestedEndTime;
    private String message;
}