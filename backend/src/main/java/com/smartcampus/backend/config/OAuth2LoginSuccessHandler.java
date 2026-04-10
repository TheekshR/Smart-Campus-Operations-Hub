package com.smartcampus.backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        String redirectUrl = "http://localhost:3000/user/dashboard"; // default

        for (GrantedAuthority authority : authorities) {
            String role = authority.getAuthority();

            if (role.equals("ROLE_ADMIN")) {
                redirectUrl = "http://localhost:3000/admin/dashboard";
                break;
            }

            if (role.equals("ROLE_TECHNICIAN")) {
                redirectUrl = "http://localhost:3000/technician/dashboard";
                break;
            }

            if (role.equals("ROLE_USER")) {
                redirectUrl = "http://localhost:3000/user/dashboard";
                break;
            }
        }

        response.sendRedirect(redirectUrl);
    }
}