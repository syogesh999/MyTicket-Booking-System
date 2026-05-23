package com.irctc.user.service;

import com.irctc.user.dto.UserRequestDTO;
import com.irctc.user.dto.UserResponseDTO;

import java.util.List;

/**
 * UserService Interface - Defines the business operations for user management.
 */
public interface UserService {

    UserResponseDTO createUser(UserRequestDTO requestDTO);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO);

    void deleteUser(Long id);
}
