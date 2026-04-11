package com.smartcampus.backend.resource.controller;

import com.smartcampus.backend.resource.dto.ResourceSummaryDTO;
import com.smartcampus.backend.resource.model.Resource;
import com.smartcampus.backend.resource.service.ResourceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
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
    public List<ResourceSummaryDTO> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minCapacity
    ) {
        return service.getFilteredResources(type, location, status, minCapacity)
                .stream()
                .map(ResourceSummaryDTO::from)
                .toList();
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable String id) {
        return service.getResourceById(id);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable String id) {
        Resource resource = service.getResourceById(id);
        if (resource == null || resource.getImageBase64() == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] imageBytes = Base64.getDecoder().decode(resource.getImageBase64());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resource.getImageType()))
                .header("Cache-Control", "public, max-age=86400")
                .body(imageBytes);
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