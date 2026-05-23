package com.irctc.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * BookingRequestDTO - Payload for creating a new booking.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Train ID is required")
    private Long trainId;

    @NotNull(message = "Seats booked is required")
    @Min(value = 1, message = "At least 1 seat must be booked")
    private Integer seatsBooked;
}
