package CampusConnect.Application.connect.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret:CampusConnectSecretKeyForJwtAuthenticationMustBeAtLeast256BitsLong!}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generateToken(String email) {
        return generateToken(email, "STUDENT", null);
    }

    public String generateToken(String email, String role, Long userId) {
        String normalizedRole = (role != null ? role.toUpperCase() : "STUDENT");
        if ("CLUB".equalsIgnoreCase(normalizedRole)) {
            normalizedRole = "CLUB_HEAD";
        }

        var builder = Jwts.builder()
                .subject(email)
                .claim("role", normalizedRole)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey);

        if (userId != null) {
            builder.claim("userId", userId);
        }

        return builder.compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        Claims claims = extractClaims(token);
        return claims.get("role", String.class);
    }

    public Long extractUserId(String token) {
        Claims claims = extractClaims(token);
        Object id = claims.get("userId");
        if (id instanceof Number num) {
            return num.longValue();
        }
        return null;
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenValid(String token, String userEmail) {
        try {
            String email = extractEmail(token);
            return email.equals(userEmail) && isTokenValid(token);
        } catch (Exception e) {
            return false;
        }
    }
}
