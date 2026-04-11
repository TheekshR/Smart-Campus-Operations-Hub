package com.smartcampus.backend.resource.service;

import com.smartcampus.backend.resource.dto.ResourceSummaryDTO;
import com.smartcampus.backend.resource.enums.ResourceStatus;
import com.smartcampus.backend.resource.enums.ResourceType;
import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.repository.ResourceRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository repository;
    private final MongoTemplate mongoTemplate;

    public ResourceService(ResourceRepository repository, MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    public long countResources() {
        return repository.count();
    }

    public List<ResourceSummaryDTO> getAllResourceSummaries() {
        Query query = new Query();
        query.fields().exclude("imageBase64");
        return mongoTemplate.find(query, Resource.class).stream()
                .map(ResourceSummaryDTO::from)
                .collect(Collectors.toList());
    }

    public Resource createResourceWithImage(String name,
                                            String type,
                                            int capacity,
                                            String location,
                                            String status,
                                            String availabilityStart,
                                            String availabilityEnd,
                                            MultipartFile image) {
        Resource resource = new Resource();
        resource.setName(name);
        resource.setType(ResourceType.valueOf(type.toUpperCase()));
        resource.setCapacity(capacity);
        resource.setLocation(location);
        resource.setStatus(ResourceStatus.valueOf(status.toUpperCase()));
        resource.setAvailabilityStart(availabilityStart);
        resource.setAvailabilityEnd(availabilityEnd);

        if (image != null && !image.isEmpty()) {
            try {
                resource.setImageBase64(Base64.getEncoder().encodeToString(image.getBytes()));
                resource.setImageType(image.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Failed to process image");
            }
        }

        return repository.save(resource);
    }

    public List<Resource> getFilteredResources(String type, String location, String status, Integer minCapacity) {
        Query query = new Query();
        query.fields().exclude("imageBase64");

        if (type != null && !type.isBlank()) {
            query.addCriteria(Criteria.where("type").is(ResourceType.valueOf(type.toUpperCase())));
        }
        if (location != null && !location.isBlank()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }
        if (status != null && !status.isBlank()) {
            query.addCriteria(Criteria.where("status").is(ResourceStatus.valueOf(status.toUpperCase())));
        }
        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }

        return mongoTemplate.find(query, Resource.class);
    }

    public Resource getResourceById(String id) {
        return repository.findById(id).orElse(null);
    }

    public Resource updateResourceWithImage(String id,
                                            String name,
                                            String type,
                                            int capacity,
                                            String location,
                                            String status,
                                            String availabilityStart,
                                            String availabilityEnd,
                                            MultipartFile image) {
        Resource existingResource = repository.findById(id).orElse(null);

        if (existingResource == null) {
            return null;
        }

        existingResource.setName(name);
        existingResource.setType(ResourceType.valueOf(type.toUpperCase()));
        existingResource.setCapacity(capacity);
        existingResource.setLocation(location);
        existingResource.setStatus(ResourceStatus.valueOf(status.toUpperCase()));
        existingResource.setAvailabilityStart(availabilityStart);
        existingResource.setAvailabilityEnd(availabilityEnd);

        if (image != null && !image.isEmpty()) {
            try {
                existingResource.setImageBase64(Base64.getEncoder().encodeToString(image.getBytes()));
                existingResource.setImageType(image.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Failed to process image");
            }
        }

        return repository.save(existingResource);
    }

    public void deleteResource(String id) {
        repository.deleteById(id);
    }
}