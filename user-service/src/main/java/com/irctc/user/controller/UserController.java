package com.irctc.user.controller;

import com.irctc.user.dto.UserRequestDTO;
import com.irctc.user.dto.UserResponseDTO;
import com.irctc.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UserController - Exposes REST endpoints for User management.
 * Base URL: /users
 * Accessible via API Gateway at: http://localhost:8080/users
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * POST /users
     * Create a new user.
     */
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO requestDTO) {
        log.info("POST /users - Creating user: {}", requestDTO.getEmail());
        UserResponseDTO response = userService.createUser(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /users
     * Retrieve all users.
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        log.info("GET /users - Fetching all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * GET /users/{id}
     * Retrieve a specific user by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        log.info("GET /users/{} - Fetching user", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * PUT /users/{id}
     * Update an existing user.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDTO requestDTO) {
        log.info("PUT /users/{} - Updating user", id);
        return ResponseEntity.ok(userService.updateUser(id, requestDTO));
    }

    /**
     * DELETE /users/{id}
     * Delete a user by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        log.info("DELETE /users/{} - Deleting user", id);
        userService.deleteUser(id);
        return ResponseEntity.ok("User with ID " + id + " deleted successfully");
    }
}
