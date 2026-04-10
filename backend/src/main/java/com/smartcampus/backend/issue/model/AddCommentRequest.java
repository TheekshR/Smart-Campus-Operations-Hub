package com.smartcampus.backend.issue.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddCommentRequest {

    @NotBlank(message = "Comment message is required")
    private String message;
}