package com.smartcampus.backend.issue.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
// Represents the request body for updating an existing comment on an issue
@Data
public class UpdateCommentRequest {

    @NotBlank(message = "Comment message is required")
    private String message;
}