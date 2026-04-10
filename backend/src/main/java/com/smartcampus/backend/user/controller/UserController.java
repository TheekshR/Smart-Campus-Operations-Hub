package com.smartcampus.backend.user.controller;

import com.smartcampus.backend.user.model.UpdateProfileRequest;
import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.model.UserRole;
import com.smartcampus.backend.user.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        return service.getCurrentUserByEmail(email);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    @PutMapping("/me")
    public User updateMyProfile(@AuthenticationPrincipal OidcUser oidcUser,
                                @RequestBody UpdateProfileRequest request) {
        String email = oidcUser.getEmail();
        return service.updateMyProfile(email, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return service.getUserById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable UserRole role) {
        return service.getUsersByRole(role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public User updateUserRole(@PathVariable String id, @RequestParam UserRole role) {
        return service.updateUserRole(id, role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        service.deleteUser(id);
    }
}