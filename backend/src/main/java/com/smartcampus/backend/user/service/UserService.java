package com.smartcampus.backend.user.service;

import com.smartcampus.backend.notification.model.NotificationType;
import com.smartcampus.backend.user.model.UpdateProfileRequest;
import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.model.UserRole;
import com.smartcampus.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User saveOrUpdateGoogleUser(String email, String googleId, String name, String picture) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email not found from Google account");
        }

        User user = repository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setGoogleId(googleId);
            user.setName(name);
            user.setPicture(picture);
            user.setRole(UserRole.USER);
            user.setPhone(null);
            user.setDepartment(null);
            user.setBio(null);

            Map<String, Boolean> prefs = new HashMap<>();
            for (NotificationType type : NotificationType.values()) {
                prefs.put(type.name(), true);
            }

            user.setNotificationsEnabled(true);
            user.setNotificationPreferences(prefs);

            user.setCreatedAt(Instant.now().toString());
            user.setLastLoginAt(Instant.now().toString());
            return repository.save(user);
        }

        user.setGoogleId(googleId);
        user.setName(name);
        user.setPicture(picture);
        user.setLastLoginAt(Instant.now().toString());

        if (user.getNotificationPreferences() == null) {
            Map<String, Boolean> prefs = new HashMap<>();
            for (NotificationType type : NotificationType.values()) {
                prefs.put(type.name(), true);
            }
            user.setNotificationsEnabled(true);
            user.setNotificationPreferences(prefs);
        }

        return repository.save(user);
    }

    public User getCurrentUserByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateMyProfile(String email, UpdateProfileRequest request) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setBio(request.getBio());

        return repository.save(user);
    }

    public User updateMyNotificationSettings(String email, User updatedUser) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setNotificationsEnabled(updatedUser.isNotificationsEnabled());
        user.setNotificationPreferences(updatedUser.getNotificationPreferences());

        return repository.save(user);
    }

    public User saveUser(User user) {
        return repository.save(user);
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getUsersByRole(UserRole role) {
        return repository.findByRole(role);
    }

    public User updateUserRole(String id, UserRole role) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);
        return repository.save(user);
    }

    public void deleteUser(String id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        repository.delete(user);
    }
}