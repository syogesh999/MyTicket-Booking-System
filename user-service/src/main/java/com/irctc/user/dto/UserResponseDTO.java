package com.irctc.user.dto;

import lombok.*;

/**
 * UserResponseDTO - Outgoing payload returned to the client.
 * Password is intentionally excluded for security.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
}
