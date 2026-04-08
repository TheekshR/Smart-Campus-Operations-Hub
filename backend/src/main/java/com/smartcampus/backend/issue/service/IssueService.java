package com.smartcampus.backend.issue.service;

import com.smartcampus.backend.issue.model.Issue;
import com.smartcampus.backend.issue.repository.IssueRepository;
import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import com.smartcampus.backend.resource.enums.ResourceStatus;

import java.util.List;

@Service
public class IssueService {

    private final IssueRepository repository;
    private final ResourceRepository resourceRepository;

    public IssueService(IssueRepository repository, ResourceRepository resourceRepository) {
        this.repository = repository;
        this.resourceRepository = resourceRepository;
    }

    public Issue createIssue(Issue issue) {
        Resource resource = resourceRepository.findById(issue.getResourceId()).orElse(null);

        if (resource == null) {
            throw new RuntimeException("Resource not found");
        }

        issue.setStatus("REPORTED");
        issue.setTechnicianId(null);
        issue.setResolutionNote(null);
        issue.setAssignedBy(null);

        Issue savedIssue = repository.save(issue);

        resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        resourceRepository.save(resource);

        return savedIssue;
    }

    public List<Issue> getAllIssues() {
        return repository.findAll();
    }

    public Issue getIssueById(String id) {
        Issue issue = repository.findById(id).orElse(null);

        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }

        return issue;
    }

    public List<Issue> getIssuesByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    public List<Issue> getIssuesByResourceId(String resourceId) {
        return repository.findByResourceId(resourceId);
    }

    public List<Issue> getIssuesByStatus(String status) {
        return repository.findByStatus(status);
    }

    public Issue assignTechnician(String id, String technicianId, String admin) {
        Issue issue = repository.findById(id).orElse(null);

        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }

        issue.setTechnicianId(technicianId);
        issue.setAssignedBy(admin);
        issue.setStatus("ASSIGNED");

        return repository.save(issue);
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
        return repository.save(issue);
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

        return savedIssue;
    }

    public void deleteIssue(String id) {
        Issue issue = repository.findById(id).orElse(null);

        if (issue == null) {
            throw new RuntimeException("Issue not found");
        }

        repository.deleteById(id);
    }
}