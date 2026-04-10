package com.smartcampus.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthDebugController {

    @GetMapping("/api/debug/auth")
    public Map<String, Object> debugAuth(Authentication authentication) {
        return Map.of(
                "name", authentication.getName(),
                "authorities", authentication.getAuthorities().stream()
                        .map(Object::toString)
                        .toList(),
                "authenticated", authentication.isAuthenticated()
        );
    }
}