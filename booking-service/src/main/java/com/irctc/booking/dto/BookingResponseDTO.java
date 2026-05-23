package com.irctc.booking.dto;

import com.irctc.booking.entity.Booking.BookingStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * BookingResponseDTO - Outgoing booking confirmation payload.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {
    private Long id;
    private Long userId;
    private Long trainId;
    private String trainName;
    private String source;
    private String destination;
    private Integer seatsBooked;
    private LocalDateTime bookingDate;
    private Double totalFare;
    private BookingStatus status;
}
