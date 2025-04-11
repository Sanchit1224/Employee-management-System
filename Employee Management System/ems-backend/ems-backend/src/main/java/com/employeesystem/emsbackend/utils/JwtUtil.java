package com.employeesystem.emsbackend.utils;

import com.employeesystem.emsbackend.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private Role role;
    private static final String SECRET_KEY = "MySuperSecretKey123456789012345678901234567890"; // 🔥 Choose a long, random secret

    private SecretKey getSigningKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser() // ✅ Correct for JJWT 0.12.x
                .verifyWith(getSigningKey()) // ✅ Correct signing key usage
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String generateToken(String username,String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) // ✅ Add role in JWT payload
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 🔥 10 hours expiry
                .signWith(getSigningKey()) // ✅ Correct signing key usage
                .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            System.out.println("❌ Invalid JWT Token: " + e.getMessage());
            return false;
        }
    }
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
