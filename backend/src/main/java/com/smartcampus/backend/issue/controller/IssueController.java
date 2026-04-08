package com.smartcampus.backend.issue.controller;

import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService service;

    public IssueController(IssueService service) {
        this.service = service;
    }

    @PostMapping
    public Issue create(@Valid @RequestBody Issue issue) {
        return service.createIssue(issue);
    }

    @GetMapping
    public List<Issue> getAll() {
        return service.getAllIssues();
    }

    @GetMapping("/{id}")
    public Issue getById(@PathVariable String id) {
        return service.getIssueById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Issue> getByUserId(@PathVariable String userId) {
        return service.getIssuesByUserId(userId);
    }

    @GetMapping("/resource/{resourceId}")
    public List<Issue> getByResourceId(@PathVariable String resourceId) {
        return service.getIssuesByResourceId(resourceId);
    }

    @GetMapping("/status/{status}")
    public List<Issue> getByStatus(@PathVariable String status) {
        return service.getIssuesByStatus(status);
    }

    @PutMapping("/{id}/assign")
    public Issue assignTechnician(@PathVariable String id,
                                  @RequestParam String technicianId,
                                  @RequestParam String admin) {
        return service.assignTechnician(id, technicianId, admin);
    }

    @PutMapping("/{id}/start")
    public Issue startProgress(@PathVariable String id,
                               @RequestParam String technicianId) {
        return service.startProgress(id, technicianId);
    }

    @PutMapping("/{id}/resolve")
    public Issue resolve(@PathVariable String id,
                         @RequestParam String technicianId,
                         @RequestParam String resolutionNote) {
        return service.resolveIssue(id, technicianId, resolutionNote);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteIssue(id);
    }
}