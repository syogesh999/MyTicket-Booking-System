package com.irctc.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Booking Entity - Maps to 'bookings' table in irctc_bookings database.
 */
@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long trainId;

    @Column(nullable = false)
    private Integer seatsBooked;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime bookingDate;

    @Column(nullable = false)
    private Double totalFare;

    /** CONFIRMED, CANCELLED, PENDING */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED
    }
}
