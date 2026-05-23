package com.irctc.booking.dto;

import lombok.*;

/**
 * TrainResponseDTO (booking-service copy) - Mirrors train-service's response.
 * Used as the return type in the Feign client for train-service calls.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainResponseDTO {
    private Long id;
    private String trainNumber;
    private String trainName;
    private String source;
    private String destination;
    private Integer availableSeats;
    private Double fare;
}
