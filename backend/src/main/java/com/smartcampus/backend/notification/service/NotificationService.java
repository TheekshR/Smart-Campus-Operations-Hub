package com.smartcampus.backend.notification.service;

import com.smartcampus.backend.notification.model.Notification;
import com.smartcampus.backend.notification.model.NotificationType;
import com.smartcampus.backend.notification.repository.NotificationRepository;
import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public Notification createNotificationForUser(String userId,
                                                  NotificationType type,
                                                  String title,
                                                  String message,
                                                  String relatedEntityId) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("Target user not found");
        }

        if (!user.isNotificationsEnabled()) {
            return null;
        }

        if (user.getNotificationPreferences() != null) {
            Boolean enabled = user.getNotificationPreferences().get(type.name());
            if (enabled != null && !enabled) {
                return null;
            }
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now().toString());

        return repository.save(notification);
    }

    public Notification createManualNotification(Notification notification) {
        User user = userRepository.findById(notification.getUserId()).orElse(null);
        if (user == null) {
            throw new RuntimeException("Target user not found");
        }

        if (!user.isNotificationsEnabled()) {
            return null;
        }

        if (user.getNotificationPreferences() != null && notification.getType() != null) {
            Boolean enabled = user.getNotificationPreferences().get(notification.getType().name());
            if (enabled != null && !enabled) {
                return null;
            }
        }

        notification.setRead(false);
        notification.setCreatedAt(Instant.now().toString());

        return repository.save(notification);
    }

    public String getCurrentUserIdByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId();
    }

    public List<Notification> getMyNotifications(String email) {
        String userId = getCurrentUserIdByEmail(email);
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getMyUnreadNotifications(String email) {
        String userId = getCurrentUserIdByEmail(email);
        return repository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public Notification getNotificationByIdForCurrentUser(String notificationId, String email) {
        String userId = getCurrentUserIdByEmail(email);

        return repository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    public Notification markAsRead(String notificationId, String email) {
        String userId = getCurrentUserIdByEmail(email);

        Notification notification = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new AccessDeniedException("You cannot update another user's notification");
        }

        notification.setRead(true);
        return repository.save(notification);
    }

    public List<Notification> markAllAsRead(String email) {
        String userId = getCurrentUserIdByEmail(email);

        List<Notification> notifications = repository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        return repository.saveAll(notifications);
    }

    public void deleteNotification(String notificationId, String email) {
        String userId = getCurrentUserIdByEmail(email);

        Notification notification = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new AccessDeniedException("You cannot delete another user's notification");
        }

        repository.delete(notification);
    }
}