package com.irctc.train.dto;

import lombok.*;

/**
 * TrainResponseDTO - Outgoing payload returned to clients and other services.
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
