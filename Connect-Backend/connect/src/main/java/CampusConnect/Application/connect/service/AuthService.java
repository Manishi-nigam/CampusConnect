package CampusConnect.Application.connect.service;

import CampusConnect.Application.connect.Security.JwtUtil;
import CampusConnect.Application.connect.dto.AuthRequestDTO;
import CampusConnect.Application.connect.dto.AuthResponseDTO;
import CampusConnect.Application.connect.dto.RegisterRequestDTO;
import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.exception.DuplicateResourceException;
import CampusConnect.Application.connect.exception.UnauthorizedException;
import CampusConnect.Application.connect.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDTO login(AuthRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!matches) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if ("CLUB".equalsIgnoreCase(user.getRole())) {
            user.setRole("CLUB_HEAD");
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return new AuthResponseDTO(token);
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("User already exists with email: " + request.getEmail());
        }

        String requestedRole = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";
        if ("CLUB".equals(requestedRole)) {
            requestedRole = "CLUB_HEAD";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(requestedRole);

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getId());
        return new AuthResponseDTO(token);
    }
}
