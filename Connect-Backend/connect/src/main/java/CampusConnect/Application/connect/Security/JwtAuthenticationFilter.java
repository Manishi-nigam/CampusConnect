package CampusConnect.Application.connect.Security;

import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            if (jwtUtil.isTokenValid(jwt)) {
                Claims claims = jwtUtil.extractClaims(jwt);
                String email = claims.getSubject();

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String role = claims.get("role", String.class);

                    if (role == null || role.isBlank()) {
                        Optional<User> userOptional = userRepository.findByEmail(email);
                        if (userOptional.isPresent()) {
                            role = userOptional.get().getRole();
                        }
                    }

                    if (role == null || role.isBlank()) {
                        role = "STUDENT";
                    }

                    role = role.toUpperCase();
                    if ("CLUB".equals(role) || "ROLE_CLUB".equals(role)) {
                        role = "CLUB_HEAD";
                    }

                    if (!role.startsWith("ROLE_")) {
                        role = "ROLE_" + role;
                    }

                    List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            authorities
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.debug("Failed to authenticate JWT token: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
