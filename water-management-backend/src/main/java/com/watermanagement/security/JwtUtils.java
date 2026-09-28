package com.watermanagement.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    private final SecretKey jwtSecret;
    private final int jwtExpirationMs = 86400000; // 24 hours

    public JwtUtils(@Value("${app.jwt-secret:WaterManagementSuperSecretKeyForJWTAuth2026!@#}") String secret) {
        this.jwtSecret = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(jwtSecret)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser().verifyWith(jwtSecret).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(jwtSecret).build().parseSignedClaims(authToken);
            return true;
        } catch (Exception e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }
        return false;
    }
}
