package com.irctc.train.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Train Entity - Maps to 'trains' table in irctc_trains database.
 */
@Entity
@Table(name = "trains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Train {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Train number is required")
    @Column(nullable = false, unique = true, length = 10)
    private String trainNumber;

    @NotBlank(message = "Train name is required")
    @Column(nullable = false)
    private String trainName;

    @NotBlank(message = "Source station is required")
    @Column(nullable = false)
    private String source;

    @NotBlank(message = "Destination station is required")
    @Column(nullable = false)
    private String destination;

    @Min(value = 0, message = "Available seats cannot be negative")
    @Column(nullable = false)
    private Integer availableSeats;

    @DecimalMin(value = "0.0", message = "Fare cannot be negative")
    @Column(nullable = false)
    private Double fare;
}
