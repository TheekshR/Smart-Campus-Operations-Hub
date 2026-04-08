package com.smartcampus.backend.resource.controller;

import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @PostMapping
    public Resource create(@jakarta.validation.Valid @RequestBody Resource resource) {
        return service.createResource(resource);
    }

    @GetMapping
    public List<Resource> getAll(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String location
    ) {
        return service.getFilteredResources(type, location);
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable String id) {
        return service.getResourceById(id);
    }

    @PutMapping("/{id}")
    public Resource update(@PathVariable String id, @jakarta.validation.Valid @RequestBody Resource resource) {
        return service.updateResource(id, resource);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteResource(id);
    }
}