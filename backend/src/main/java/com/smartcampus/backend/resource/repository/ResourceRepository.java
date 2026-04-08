package com.smartcampus.backend.resource.repository;

import com.smartcampus.backend.resource.enums.ResourceType;
import com.smartcampus.backend.resource.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByLocationIgnoreCase(String location);
    List<Resource> findByTypeAndLocationIgnoreCase(ResourceType type, String location);
}