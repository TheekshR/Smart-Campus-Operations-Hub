package com.smartcampus.backend.resource.controller;

import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.service.ResourceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public Resource create(
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam int capacity,
            @RequestParam String location,
            @RequestParam String status,
            @RequestParam(required = false) String availabilityStart,
            @RequestParam(required = false) String availabilityEnd,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return service.createResourceWithImage(
                name,
                type,
                capacity,
                location,
                status,
                availabilityStart,
                availabilityEnd,
                image
        );
    }

    @GetMapping
    public List<Resource> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minCapacity
    ) {
        return service.getFilteredResources(type, location, status, minCapacity);
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable String id) {
        return service.getResourceById(id);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public Resource update(
            @PathVariable String id,
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam int capacity,
            @RequestParam String location,
            @RequestParam String status,
            @RequestParam(required = false) String availabilityStart,
            @RequestParam(required = false) String availabilityEnd,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return service.updateResourceWithImage(
                id,
                name,
                type,
                capacity,
                location,
                status,
                availabilityStart,
                availabilityEnd,
                image
        );
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteResource(id);
    }
}