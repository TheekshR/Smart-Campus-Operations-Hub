package com.smartcampus.backend.user.model;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String phone;
    private String department;
    private String bio;
}