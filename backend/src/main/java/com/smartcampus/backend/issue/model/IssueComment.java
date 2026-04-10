package com.smartcampus.backend.issue.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "issue_comments")
public class IssueComment {

    @Id
    private String id;

    private String issueId;
    private String userId;
    private String userName;
    private String userRole;
    private String message;
    private String createdAt;
    private String updatedAt;
}