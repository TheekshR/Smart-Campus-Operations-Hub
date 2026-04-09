package com.smartcampus.backend.user.service;

import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.model.UserRole;
import com.smartcampus.backend.user.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User saveOrUpdateGoogleUser(OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String googleId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        User user = repository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setGoogleId(googleId);
            user.setEmail(email);
            user.setName(name);
            user.setPicture(picture);
            user.setRole(UserRole.USER);
            user.setCreatedAt(Instant.now().toString());
            user.setLastLoginAt(Instant.now().toString());
            return repository.save(user);
        }

        user.setGoogleId(googleId);
        user.setName(name);
        user.setPicture(picture);
        user.setLastLoginAt(Instant.now().toString());

        return repository.save(user);
    }

    public User getCurrentUserByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
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