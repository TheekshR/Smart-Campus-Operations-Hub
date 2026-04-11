package com.smartcampus.backend.issue.controller;

import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.service.IssueService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// Allow requests from React frontend running on port 3000
@CrossOrigin(origins = "http://localhost:3000")

// Marks this class as a REST controller (handles HTTP requests)
@RestController

// Base URL for all endpoints in this controller
@RequestMapping("/api/issues")
public class IssueController {

    // Service layer for handling business logic
    private final IssueService service;

    // Constructor injection
    public IssueController(IssueService service) {
        this.service = service;
    }

    // ================= CREATE ISSUE =================

    // Only USER and ADMIN can create issues
    @PreAuthorize("hasAnyRole('USER','ADMIN')")

    // Handles POST request to create a new issue (with optional images)
    @PostMapping(consumes = {"multipart/form-data"})
    public Issue create(
            @RequestParam String resourceId,   // ID of the resource (e.g., lab, device)
            @RequestParam String userId,       // ID of the user who reports the issue
            @RequestParam String description,  // Description of the issue
            @RequestParam String priority,     // Priority level (LOW, MEDIUM, HIGH)
            @RequestParam(value = "images", required = false) List<MultipartFile> images // Optional images
    ) {
        // Call service to create issue with images
        return service.createIssueWithImages(resourceId, userId, description, priority, images);
    }

    // ================= GET ALL ISSUES =================

    // Only ADMIN can view all issues
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Issue> getAll() {
        return service.getAllIssues();
    }

    // ================= GET ISSUE BY ID =================

    // USER, ADMIN, and TECHNICIAN can view a specific issue
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    @GetMapping("/{id}")
    public Issue getById(@PathVariable String id) {
        // Fetch issue by ID
        return service.getIssueById(id);
    }

    // ================= GET ISSUES BY USER =================

    // USER and ADMIN can view issues created by a specific user
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user/{userId}")
    public List<Issue> getByUserId(@PathVariable String userId) {
        return service.getIssuesByUserId(userId);
    }

    // ================= GET ISSUES BY RESOURCE =================

    // ADMIN and TECHNICIAN can view issues related to a specific resource
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @GetMapping("/resource/{resourceId}")
    public List<Issue> getByResourceId(@PathVariable String resourceId) {
        return service.getIssuesByResourceId(resourceId);
    }

    // ================= GET ISSUES BY STATUS =================

    // ADMIN and TECHNICIAN can filter issues by status
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @GetMapping("/status/{status}")
    public List<Issue> getByStatus(@PathVariable String status) {
        return service.getIssuesByStatus(status);
    }

    // ================= ASSIGN TECHNICIAN =================

    // Only ADMIN can assign a technician to an issue
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign")
    public Issue assignTechnician(@PathVariable String id,
                                  @RequestParam String technicianId, // Technician ID
                                  @RequestParam String admin) {      // Admin ID
        return service.assignTechnician(id, technicianId, admin);
    }

    // ================= START ISSUE =================

    // Only TECHNICIAN can start working on an issue
    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/{id}/start")
    public Issue startProgress(@PathVariable String id,
                               @RequestParam String technicianId) {
        return service.startProgress(id, technicianId);
    }

    // ================= RESOLVE ISSUE =================

    // Only TECHNICIAN can mark an issue as resolved
    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/{id}/resolve")
    public Issue resolve(@PathVariable String id,
                         @RequestParam String technicianId,
                         @RequestParam String resolutionNote) { // Explanation of fix
        return service.resolveIssue(id, technicianId, resolutionNote);
    }

    // ================= DELETE ISSUE =================

    // Only ADMIN can delete an issue
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteIssue(id);
    }
}