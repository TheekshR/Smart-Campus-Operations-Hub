package com.smartcampus.backend.issue.service;

import com.smartcampus.backend.issue.model.AddCommentRequest;
import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.model.IssueComment;
import com.smartcampus.backend.issue.model.UpdateCommentRequest;
import com.smartcampus.backend.issue.repository.IssueCommentRepository;
import com.smartcampus.backend.issue.repository.IssueRepository;
import com.smartcampus.backend.notification.model.NotificationType;
import com.smartcampus.backend.notification.service.NotificationService;
import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.repository.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
// Contains business logic for managing issue comments (adding, updating, deleting, and retrieving comments).
@Service
public class IssueCommentService {

    private final IssueCommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    public IssueCommentService(IssueCommentRepository commentRepository,
                               IssueRepository issueRepository,
                               UserRepository userRepository,
                               NotificationService notificationService,
                               MongoTemplate mongoTemplate) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.mongoTemplate = mongoTemplate;
    }

    public List<IssueComment> getCommentsByIssue(String issueId, String email) {
        User currentUser = getCurrentUser(email);
        Issue issue = getIssue(issueId);

        if (!canAccessIssueComments(currentUser, issue)) {
            throw new AccessDeniedException("You are not allowed to view comments for this ticket");
        }

        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
    }

    public IssueComment addComment(String issueId, AddCommentRequest request, String email) {
        User currentUser = getCurrentUser(email);
        Issue issue = getIssue(issueId);
    
        if (!canAccessIssueComments(currentUser, issue)) {
            throw new AccessDeniedException("You are not allowed to comment on this ticket");
        }
    
        IssueComment comment = new IssueComment();
        comment.setIssueId(issueId);
        comment.setUserId(currentUser.getId());
        comment.setUserName(currentUser.getName());
        comment.setUserRole(currentUser.getRole().name());
        comment.setMessage(request.getMessage());
        comment.setCreatedAt(Instant.now().toString());
        comment.setUpdatedAt(null);
    
        IssueComment savedComment = commentRepository.save(comment);
    
        // Notify ticket owner if commenter is not the owner
        if (!currentUser.getId().equals(issue.getUserId())) {
            notificationService.createNotificationForUser(
                    issue.getUserId(),
                    NotificationType.ISSUE_COMMENT_ADDED,
                    "New Comment on Your Ticket",
                    currentUser.getName() + " added a new comment on your issue.",
                    issue.getId()
            );
        }
    
        // Notify assigned technician if exists and commenter is not the technician
        if (issue.getTechnicianId() != null
                && !issue.getTechnicianId().isBlank()
                && !currentUser.getId().equals(issue.getTechnicianId())) {
    
            notificationService.createNotificationForUser(
                    issue.getTechnicianId(),
                    NotificationType.ISSUE_COMMENT_ADDED,
                    "New Comment on Assigned Ticket",
                    currentUser.getName() + " added a new comment on an issue assigned to you.",
                    issue.getId()
            );
        }
    
        return savedComment;
    }

    public IssueComment updateComment(String commentId, UpdateCommentRequest request, String email) {
        User currentUser = getCurrentUser(email);

        IssueComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only edit your own comments");
        }

        comment.setMessage(request.getMessage());
        comment.setUpdatedAt(Instant.now().toString());

        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, String email) {
        User currentUser = getCurrentUser(email);

        IssueComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isOwner = comment.getUserId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You can only delete your own comments unless you are an admin");
        }

        commentRepository.delete(comment);
    }

    public void deleteCommentsByIssueId(String issueId) {
        commentRepository.deleteByIssueId(issueId);
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private Issue getIssue(String issueId) {
        Query query = new Query(Criteria.where("id").is(issueId));
        query.fields().exclude("imageBase64List");
        Issue issue = mongoTemplate.findOne(query, Issue.class);
        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }
        return issue;
    }

    private boolean canAccessIssueComments(User currentUser, Issue issue) {
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        boolean isOwner = currentUser.getId().equals(issue.getUserId());
        boolean isAssignedTechnician =
                issue.getTechnicianId() != null && issue.getTechnicianId().equals(currentUser.getId());

        return isAdmin || isOwner || isAssignedTechnician;
    }
}