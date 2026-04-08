package com.smartcampus.backend.resource.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.smartcampus.backend.resource.enums.ResourceStatus;
import com.smartcampus.backend.resource.enums.ResourceType;

import com.smartcampus.backend.resource.enums.ResourceType;
import com.smartcampus.backend.resource.enums.ResourceStatus;

@Data
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;
    private String location;

    @NotBlank(message = "Status is required")
    private String status;
}