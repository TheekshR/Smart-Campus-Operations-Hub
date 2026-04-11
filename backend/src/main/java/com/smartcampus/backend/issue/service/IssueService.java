package com.smartcampus.backend.issue.service;

import com.smartcampus.backend.issue.dto.IssueSummaryDTO;
import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.repository.IssueRepository;
import com.smartcampus.backend.notification.model.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import com.smartcampus.backend.resource.enums.ResourceStatus;
import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.repository.ResourceRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
// Contains business logic for managing issues.
@Service
public class IssueService {

    private final IssueRepository repository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final IssueCommentService issueCommentService;
    private final MongoTemplate mongoTemplate;

    public IssueService(IssueRepository repository,
                        ResourceRepository resourceRepository,
                        NotificationService notificationService,
                        IssueCommentService issueCommentService,
                        MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
        this.issueCommentService = issueCommentService;
        this.mongoTemplate = mongoTemplate;
    }

    public Issue createIssueWithImages(String resourceId,
                                       String userId,
                                       String description,
                                       String priority,
                                       List<MultipartFile> images) {

        if (!resourceRepository.existsById(resourceId)) {
            throw new RuntimeException("Resource not found");
        }

        if (images != null && images.size() > 3) {
            throw new RuntimeException("You can upload up to 3 images only");
        }

        Issue issue = new Issue();
        issue.setResourceId(resourceId);
        issue.setUserId(userId);
        issue.setDescription(description);
        issue.setPriority(priority);
        issue.setStatus("REPORTED");
        issue.setTechnicianId(null);
        issue.setResolutionNote(null);
        issue.setAssignedBy(null);

        List<String> imageBase64List = new ArrayList<>();
        List<String> imageTypes = new ArrayList<>();

        if (images != null) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    try {
                        imageBase64List.add(Base64.getEncoder().encodeToString(image.getBytes()));
                        imageTypes.add(image.getContentType());
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to process uploaded image");
                    }
                }
            }
        }

        issue.setImageBase64List(imageBase64List);
        issue.setImageTypes(imageTypes);

        Issue savedIssue = repository.save(issue);

        Resource resource = resourceRepository.findById(resourceId).orElse(null);
        if (resource != null) {
            resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
            resourceRepository.save(resource);
        }

        return savedIssue;
    }

    private Query excludeImages() {
        Query query = new Query();
        query.fields().exclude("imageBase64List");
        return query;
    }

    public List<IssueSummaryDTO> getAllIssues() {
        return mongoTemplate.find(excludeImages(), Issue.class).stream()
                .map(IssueSummaryDTO::from)
                .collect(Collectors.toList());
    }

    public Issue getIssueById(String id) {
        Issue issue = repository.findById(id).orElse(null);

        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }

        return issue;
    }

    public List<IssueSummaryDTO> getIssuesByUserId(String userId) {
        Query query = excludeImages();
        query.addCriteria(Criteria.where("userId").is(userId));
        return mongoTemplate.find(query, Issue.class).stream()
                .map(IssueSummaryDTO::from)
                .collect(Collectors.toList());
    }

    public List<IssueSummaryDTO> getIssuesByResourceId(String resourceId) {
        Query query = excludeImages();
        query.addCriteria(Criteria.where("resourceId").is(resourceId));
        return mongoTemplate.find(query, Issue.class).stream()
                .map(IssueSummaryDTO::from)
                .collect(Collectors.toList());
    }

    public List<IssueSummaryDTO> getIssuesByStatus(String status) {
        Query query = excludeImages();
        query.addCriteria(Criteria.where("status").is(status));
        return mongoTemplate.find(query, Issue.class).stream()
                .map(IssueSummaryDTO::from)
                .collect(Collectors.toList());
    }

    public Issue getIssueWithImages(String id) {
        return repository.findById(id).orElse(null);
    }

    public Issue assignTechnician(String id, String technicianId, String admin) {
        Issue issue = repository.findById(id).orElse(null);
    
        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }
    
        issue.setTechnicianId(technicianId);
        issue.setAssignedBy(admin);
        issue.setStatus("ASSIGNED");
    
        Issue savedIssue = repository.save(issue);
    
        // Notify ticket owner
        notificationService.createNotificationForUser(
                savedIssue.getUserId(),
                NotificationType.ISSUE_STATUS_CHANGED,
                "Issue Assigned",
                "Your issue has been assigned to a technician.",
                savedIssue.getId()
        );
    
        // Notify assigned technician
        if (technicianId != null && !technicianId.isBlank()) {
            notificationService.createNotificationForUser(
                    technicianId,
                    NotificationType.ISSUE_STATUS_CHANGED,
                    "New Task Assigned",
                    "A new issue has been assigned to you.",
                    savedIssue.getId()
            );
        }
    
        return savedIssue;
    }

    public Issue startProgress(String id, String technicianId) {
        Issue issue = repository.findById(id).orElse(null);

        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }

        if (issue.getTechnicianId() == null || !issue.getTechnicianId().equals(technicianId)) {
            throw new RuntimeException("Only the assigned technician can start this issue");
        }

        issue.setStatus("IN_PROGRESS");
        Issue savedIssue = repository.save(issue);

        notificationService.createNotificationForUser(
                savedIssue.getUserId(),
                NotificationType.ISSUE_STATUS_CHANGED,
                "Issue In Progress",
                "Your reported issue is now in progress.",
                savedIssue.getId()
        );

        return savedIssue;
    }

    public Issue resolveIssue(String id, String technicianId, String resolutionNote) {
        Issue issue = repository.findById(id).orElse(null);

        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }

        if (issue.getTechnicianId() == null || !issue.getTechnicianId().equals(technicianId)) {
            throw new RuntimeException("Only the assigned technician can resolve this issue");
        }

        issue.setStatus("FIXED");
        issue.setResolutionNote(resolutionNote);

        Issue savedIssue = repository.save(issue);

        Resource resource = resourceRepository.findById(issue.getResourceId()).orElse(null);
        if (resource != null) {
            resource.setStatus(ResourceStatus.ACTIVE);
            resourceRepository.save(resource);
        }

        notificationService.createNotificationForUser(
                savedIssue.getUserId(),
                NotificationType.ISSUE_STATUS_CHANGED,
                "Issue Resolved",
                "Your reported issue has been resolved.",
                savedIssue.getId()
        );

        return savedIssue;
    }

    public void deleteIssue(String id) {
        Issue issue = repository.findById(id).orElse(null);

        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }

        issueCommentService.deleteCommentsByIssueId(id);
        repository.deleteById(id);
    }
}