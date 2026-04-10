package com.smartcampus.backend.issue.controller;

import com.smartcampus.backend.issue.model.AddCommentRequest;
import com.smartcampus.backend.issue.model.IssueComment;
import com.smartcampus.backend.issue.model.UpdateCommentRequest;
import com.smartcampus.backend.issue.service.IssueCommentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueCommentController {

    private final IssueCommentService service;

    public IssueCommentController(IssueCommentService service) {
        this.service = service;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{issueId}/comments")
    public List<IssueComment> getComments(@PathVariable String issueId,
                                          @AuthenticationPrincipal OidcUser oidcUser) {
        return service.getCommentsByIssue(issueId, oidcUser.getEmail());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{issueId}/comments")
    public IssueComment addComment(@PathVariable String issueId,
                                   @Valid @RequestBody AddCommentRequest request,
                                   @AuthenticationPrincipal OidcUser oidcUser) {
        return service.addComment(issueId, request, oidcUser.getEmail());
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/comments/{commentId}")
    public IssueComment updateComment(@PathVariable String commentId,
                                      @Valid @RequestBody UpdateCommentRequest request,
                                      @AuthenticationPrincipal OidcUser oidcUser) {
        return service.updateComment(commentId, request, oidcUser.getEmail());
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@PathVariable String commentId,
                              @AuthenticationPrincipal OidcUser oidcUser) {
        service.deleteComment(commentId, oidcUser.getEmail());
    }
}