package com.smartcampus.backend.issue.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

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

    // store uploaded image file names or paths
    private List<String> imageUrls;
}