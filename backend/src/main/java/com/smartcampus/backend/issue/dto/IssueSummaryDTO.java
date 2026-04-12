package com.smartcampus.backend.issue.dto;

import com.smartcampus.backend.issue.model.Issue;
import lombok.Data;

@Data
public class IssueSummaryDTO {

    private String id;
    private String resourceId;
    private String userId;
    private String description;
    private String priority;
    private String status;
    private String technicianId;
    private String resolutionNote;
    private String assignedBy;
    private int imageCount;

    public static IssueSummaryDTO from(Issue issue) {
        IssueSummaryDTO dto = new IssueSummaryDTO();
        dto.setId(issue.getId());
        dto.setResourceId(issue.getResourceId());
        dto.setUserId(issue.getUserId());
        dto.setDescription(issue.getDescription());
        dto.setPriority(issue.getPriority());
        dto.setStatus(issue.getStatus());
        dto.setTechnicianId(issue.getTechnicianId());
        dto.setResolutionNote(issue.getResolutionNote());
        dto.setAssignedBy(issue.getAssignedBy());
        dto.setImageCount(issue.getImageTypes() != null ? issue.getImageTypes().size() : 0);
        return dto;
    }
}
