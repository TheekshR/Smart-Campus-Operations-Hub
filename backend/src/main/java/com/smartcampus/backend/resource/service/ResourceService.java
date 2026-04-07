package com.smartcampus.backend.resource.service;

import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public Resource createResource(Resource resource) {
        return repository.save(resource);
    }

    public List<Resource> getAllResources() {
        return repository.findAll();
    }

    public Resource getResourceById(String id) {
        return repository.findById(id).orElse(null);
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existingResource = repository.findById(id).orElse(null);

        if (existingResource == null) {
            return null;
        }

        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setStatus(updatedResource.getStatus());

        return repository.save(existingResource);
    }

    public void deleteResource(String id) {
        repository.deleteById(id);
    }
}