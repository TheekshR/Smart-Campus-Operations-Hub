package com.smartcampus.backend.user.repository;

import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.model.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    List<User> findByRole(UserRole role);
}