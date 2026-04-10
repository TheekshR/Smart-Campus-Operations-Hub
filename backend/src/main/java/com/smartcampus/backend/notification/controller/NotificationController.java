package com.smartcampus.backend.notification.controller;

import com.smartcampus.backend.notification.model.Notification;
import com.smartcampus.backend.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Notification createManual(@Valid @RequestBody Notification notification) {
        return service.createManualNotification(notification);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public List<Notification> getMyNotifications(@AuthenticationPrincipal OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        return service.getMyNotifications(email);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/unread")
    public List<Notification> getMyUnreadNotifications(@AuthenticationPrincipal OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        return service.getMyUnreadNotifications(email);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public Notification getById(@PathVariable String id,
                                @AuthenticationPrincipal OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        return service.getNotificationByIdForCurrentUser(id, email);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable String id,
                                   @AuthenticationPrincipal OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        return service.markAsRead(id, email);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/read-all")
    public List<Notification> markAllAsRead(@AuthenticationPrincipal OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        return service.markAllAsRead(email);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id,
                       @AuthenticationPrincipal OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        service.deleteNotification(id, email);
    }
}