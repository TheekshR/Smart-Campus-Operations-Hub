package com.smartcampus.backend.resource.service;

import com.smartcampus.backend.resource.enums.ResourceStatus;
import com.smartcampus.backend.resource.enums.ResourceType;
import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
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
        ResourceType resourceType = (type != null && !type.isBlank())
                ? ResourceType.valueOf(type.toUpperCase())
                : null;

        ResourceStatus resourceStatus = (status != null && !status.isBlank())
                ? ResourceStatus.valueOf(status.toUpperCase())
                : null;

        List<Resource> resources;

        if (resourceType != null && location != null && resourceStatus != null) {
            resources = repository.findByTypeAndLocationIgnoreCaseAndStatus(resourceType, location, resourceStatus);
        } else if (resourceType != null && location != null) {
            resources = repository.findByTypeAndLocationIgnoreCase(resourceType, location);
        } else if (resourceType != null && resourceStatus != null) {
            resources = repository.findByTypeAndStatus(resourceType, resourceStatus);
        } else if (location != null && resourceStatus != null) {
            resources = repository.findByLocationIgnoreCaseAndStatus(location, resourceStatus);
        } else if (resourceType != null) {
            resources = repository.findByType(resourceType);
        } else if (location != null) {
            resources = repository.findByLocationIgnoreCase(location);
        } else if (resourceStatus != null) {
            resources = repository.findByStatus(resourceStatus);
        } else if (minCapacity != null) {
            resources = repository.findByCapacityGreaterThanEqual(minCapacity);
        } else {
            resources = repository.findAll();
        }

        if (minCapacity != null) {
            resources = resources.stream()
                    .filter(resource -> resource.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }

        return resources;
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