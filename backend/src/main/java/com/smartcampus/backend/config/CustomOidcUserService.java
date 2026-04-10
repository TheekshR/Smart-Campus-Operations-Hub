package com.smartcampus.backend.config;

import com.smartcampus.backend.user.model.User;
import com.smartcampus.backend.user.repository.UserRepository;
import com.smartcampus.backend.user.service.UserService;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserService userService;
    private final UserRepository userRepository;

    public CustomOidcUserService(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getEmail();
        String googleId = oidcUser.getSubject();
        String name = oidcUser.getFullName();
        String picture = oidcUser.getPicture();

        userService.saveOrUpdateGoogleUser(email, googleId, name, picture);

        User appUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new OAuth2AuthenticationException("User not found in database"));

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