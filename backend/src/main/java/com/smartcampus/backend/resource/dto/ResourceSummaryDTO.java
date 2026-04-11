package com.smartcampus.backend.resource.dto;

import com.smartcampus.backend.resource.enums.ResourceStatus;
import com.smartcampus.backend.resource.enums.ResourceType;
import com.smartcampus.backend.resource.model.Resource;
import lombok.Data;

@Data
public class ResourceSummaryDTO {

    private String id;
    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private ResourceStatus status;
    private String availabilityStart;
    private String availabilityEnd;
    private boolean hasImage;

    public static ResourceSummaryDTO from(Resource resource) {
        ResourceSummaryDTO dto = new ResourceSummaryDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setStatus(resource.getStatus());
        dto.setAvailabilityStart(resource.getAvailabilityStart());
        dto.setAvailabilityEnd(resource.getAvailabilityEnd());
        dto.setHasImage(resource.getImageType() != null && !resource.getImageType().isEmpty());
        return dto;
    }
}
