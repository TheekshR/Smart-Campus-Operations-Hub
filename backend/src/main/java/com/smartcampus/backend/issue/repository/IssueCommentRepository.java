package com.smartcampus.backend.issue.repository;

import com.smartcampus.backend.issue.model.IssueComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IssueCommentRepository extends MongoRepository<IssueComment, String> {
    List<IssueComment> findByIssueIdOrderByCreatedAtAsc(String issueId);
    void deleteByIssueId(String issueId);
}