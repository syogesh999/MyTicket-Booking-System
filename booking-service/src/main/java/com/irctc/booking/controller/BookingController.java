package com.irctc.booking.controller;

import com.irctc.booking.dto.BookingRequestDTO;
import com.irctc.booking.dto.BookingResponseDTO;
import com.irctc.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BookingController - REST endpoints for booking management.
 * Base URL: /bookings
 * Accessible via API Gateway at: http://localhost:8080/bookings
 */
@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * POST /bookings
     * Create a new booking.
     * Internally calls train-service via Feign to validate and reduce seats.
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO requestDTO) {
        log.info("POST /bookings - userId={}, trainId={}", requestDTO.getUserId(), requestDTO.getTrainId());
        BookingResponseDTO response = bookingService.createBooking(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /bookings
     * Retrieve all bookings.
     */
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        log.info("GET /bookings - Fetching all bookings");
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /**
     * GET /bookings/{id}
     * Retrieve a booking by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        log.info("GET /bookings/{} - Fetching booking", id);
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * PUT /bookings/{id}/cancel
     * Cancel an existing booking.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        log.info("PUT /bookings/{}/cancel - Cancelling booking", id);
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}
