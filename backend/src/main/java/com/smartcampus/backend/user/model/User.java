package com.smartcampus.backend.user.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

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

    private String phone;
    private String department;
    private String bio;

    private boolean notificationsEnabled = true;
    private Map<String, Boolean> notificationPreferences;

    private String createdAt;
    private String lastLoginAt;
}