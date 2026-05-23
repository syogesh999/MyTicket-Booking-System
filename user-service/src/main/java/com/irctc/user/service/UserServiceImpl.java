package com.irctc.user.service;

import com.irctc.user.dto.UserRequestDTO;
import com.irctc.user.dto.UserResponseDTO;
import com.irctc.user.entity.User;
import com.irctc.user.exception.DuplicateEmailException;
import com.irctc.user.exception.UserNotFoundException;
import com.irctc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * UserServiceImpl - Implements UserService with full business logic.
 * Uses constructor injection via @RequiredArgsConstructor (Lombok).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    /**
     * Create a new user.
     * Validates that the email is not already registered.
     */
    @Override
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        log.info("Creating user with email: {}", requestDTO.getEmail());

        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateEmailException("Email already registered: " + requestDTO.getEmail());
        }

        User user = User.builder()
                .name(requestDTO.getName())
                .email(requestDTO.getEmail())
                .password(requestDTO.getPassword()) // In production: encode with BCrypt
                .phone(requestDTO.getPhone())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());

        return mapToResponseDTO(savedUser);
    }

    /**
     * Fetch all registered users.
     */
    @Override
    public List<UserResponseDTO> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Fetch a single user by ID.
     */
    @Override
    public UserResponseDTO getUserById(Long id) {
        log.info("Fetching user by ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return mapToResponseDTO(user);
    }

    /**
     * Update an existing user's details.
     */
    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO) {
        log.info("Updating user with ID: {}", id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        // Check email conflict (only if email is being changed)
        if (!existingUser.getEmail().equals(requestDTO.getEmail())
                && userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateEmailException("Email already in use: " + requestDTO.getEmail());
        }

        existingUser.setName(requestDTO.getName());
        existingUser.setEmail(requestDTO.getEmail());
        existingUser.setPassword(requestDTO.getPassword());
        existingUser.setPhone(requestDTO.getPhone());

        User updatedUser = userRepository.save(existingUser);
        log.info("User updated successfully with ID: {}", updatedUser.getId());

        return mapToResponseDTO(updatedUser);
    }

    /**
     * Delete a user by ID.
     */
    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);

        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
        log.info("User deleted successfully with ID: {}", id);
    }

    // ─── Mapper ─────────────────────────────────────────────────────────────────

    private UserResponseDTO mapToResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }
}
