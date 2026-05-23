package com.irctc.train.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * TrainRequestDTO - Payload for creating or updating a train.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainRequestDTO {

    @NotBlank(message = "Train number is required")
    private String trainNumber;

    @NotBlank(message = "Train name is required")
    private String trainName;

    @NotBlank(message = "Source station is required")
    private String source;

    @NotBlank(message = "Destination station is required")
    private String destination;

    @Min(value = 0, message = "Available seats cannot be negative")
    @NotNull(message = "Available seats is required")
    private Integer availableSeats;

    @DecimalMin(value = "0.0", message = "Fare cannot be negative")
    @NotNull(message = "Fare is required")
    private Double fare;
}
