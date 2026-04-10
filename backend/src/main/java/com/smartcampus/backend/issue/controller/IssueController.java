package com.smartcampus.backend.issue.controller;

import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.service.IssueService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService service;

    public IssueController(IssueService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping(consumes = {"multipart/form-data"})
    public Issue create(
            @RequestParam String resourceId,
            @RequestParam String userId,
            @RequestParam String description,
            @RequestParam String priority,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        return service.createIssueWithImages(resourceId, userId, description, priority, images);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Issue> getAll() {
        return service.getAllIssues();
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    @GetMapping("/{id}")
    public Issue getById(@PathVariable String id) {
        return service.getIssueById(id);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user/{userId}")
    public List<Issue> getByUserId(@PathVariable String userId) {
        return service.getIssuesByUserId(userId);
    }

    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @GetMapping("/resource/{resourceId}")
    public List<Issue> getByResourceId(@PathVariable String resourceId) {
        return service.getIssuesByResourceId(resourceId);
    }

    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @GetMapping("/status/{status}")
    public List<Issue> getByStatus(@PathVariable String status) {
        return service.getIssuesByStatus(status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign")
    public Issue assignTechnician(@PathVariable String id,
                                  @RequestParam String technicianId,
                                  @RequestParam String admin) {
        return service.assignTechnician(id, technicianId, admin);
    }

    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/{id}/start")
    public Issue startProgress(@PathVariable String id,
                               @RequestParam String technicianId) {
        return service.startProgress(id, technicianId);
    }

    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/{id}/resolve")
    public Issue resolve(@PathVariable String id,
                         @RequestParam String technicianId,
                         @RequestParam String resolutionNote) {
        return service.resolveIssue(id, technicianId, resolutionNote);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteIssue(id);
    }
}