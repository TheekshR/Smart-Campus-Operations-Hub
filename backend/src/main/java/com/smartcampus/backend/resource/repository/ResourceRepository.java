package com.smartcampus.backend.resource.repository;

import com.smartcampus.backend.resource.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}