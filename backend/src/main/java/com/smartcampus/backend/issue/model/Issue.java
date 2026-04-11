package com.smartcampus.backend.issue.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
// Represents an issue reported by a user(e.g., broken equipment, room issues, etc.)
@Data
@Document(collection = "issues")
public class Issue {

    @Id
    private String id;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Priority is required")
    private String priority; // LOW / MEDIUM / HIGH

    private String status; // REPORTED / ASSIGNED / IN_PROGRESS / FIXED

    private String technicianId;
    private String resolutionNote;
    private String assignedBy;

    // ✅ NEW: store images as Base64
    private List<String> imageBase64List;

    // ✅ NEW: store image types (image/jpeg, image/png, etc)
    private List<String> imageTypes;
}