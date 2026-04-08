package com.smartcampus.backend.issue.repository;

import com.smartcampus.backend.issue.model.Issue;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IssueRepository extends MongoRepository<Issue, String> {
    List<Issue> findByUserId(String userId);
    List<Issue> findByResourceId(String resourceId);
    List<Issue> findByStatus(String status);
}