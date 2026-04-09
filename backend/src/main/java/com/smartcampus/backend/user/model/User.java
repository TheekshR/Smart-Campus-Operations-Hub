package com.smartcampus.backend.user.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String googleId;
    private String name;
    private String email;
    private String picture;

    private UserRole role;

    private String createdAt;
    private String lastLoginAt;
}