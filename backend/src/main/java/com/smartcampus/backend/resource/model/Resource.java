package com.smartcampus.backend.resource.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;        // e.g., Lab 1
    private String type;        // LAB, ROOM, EQUIPMENT
    private int capacity;
    private String location;
    private String status;      // ACTIVE / OUT_OF_SERVICE
}