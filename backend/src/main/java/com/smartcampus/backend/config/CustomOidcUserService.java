package com.smartcampus.backend.config;

import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.model.UserRole;
import com.smartcampus.backend.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    public CustomOidcUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getEmail();
        String googleId = oidcUser.getSubject();
        String name = oidcUser.getFullName();
        String picture = oidcUser.getPicture();

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from Google account");
        }

        User appUser = userRepository.findByEmail(email).orElse(null);

        if (appUser == null) {
            appUser = new User();
            appUser.setEmail(email);
            appUser.setGoogleId(googleId);
            appUser.setName(name);
            appUser.setPicture(picture);
            appUser.setRole(UserRole.USER);
            appUser.setCreatedAt(Instant.now().toString());
            appUser.setLastLoginAt(Instant.now().toString());
            appUser = userRepository.save(appUser);
        } else {
            appUser.setGoogleId(googleId);
            appUser.setName(name);
            appUser.setPicture(picture);
            appUser.setLastLoginAt(Instant.now().toString());
            appUser = userRepository.save(appUser);
        }

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + appUser.getRole().name())
        );

        return new DefaultOidcUser(
                authorities,
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "email"
        );
    }
}