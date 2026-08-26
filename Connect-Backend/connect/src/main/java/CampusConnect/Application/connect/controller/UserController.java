package CampusConnect.Application.connect.controller;

import CampusConnect.Application.connect.entity.User;
import CampusConnect.Application.connect.repository.UserRepository;
import CampusConnect.Application.connect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User querying and management endpoints")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository,
                          UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @PostMapping
    @Operation(summary = "Register/Create a user")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User created = userService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Get all registered users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}