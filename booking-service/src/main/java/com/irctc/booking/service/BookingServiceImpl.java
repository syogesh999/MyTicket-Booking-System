package com.irctc.booking.service;

import com.irctc.booking.dto.BookingRequestDTO;
import com.irctc.booking.dto.BookingResponseDTO;
import com.irctc.booking.dto.TrainResponseDTO;
import com.irctc.booking.entity.Booking;
import com.irctc.booking.entity.Booking.BookingStatus;
import com.irctc.booking.exception.BookingFailedException;
import com.irctc.booking.exception.BookingNotFoundException;
import com.irctc.booking.feign.TrainServiceClient;
import com.irctc.booking.feign.UserServiceClient;
import com.irctc.booking.repository.BookingRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * BookingServiceImpl - Core booking logic.
 *
 * Flow for createBooking:
 *   1. Call train-service via Feign to get train details
 *   2. Validate seat availability
 *   3. Calculate total fare
 *   4. Persist booking as CONFIRMED
 *   5. Call train-service via Feign to reduce available seats
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TrainServiceClient trainServiceClient; // Feign client
    private final UserServiceClient userServiceClient; // Feign client

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO) {
        log.info("Creating booking for userId={}, trainId={}, seats={}",
                requestDTO.getUserId(), requestDTO.getTrainId(), requestDTO.getSeatsBooked());

        // ── Step 0: Validate user existence via Feign ────────────────────────
        try {
            userServiceClient.getUserById(requestDTO.getUserId());
        } catch (FeignException.NotFound e) {
            throw new BookingFailedException("User not found with ID: " + requestDTO.getUserId());
        } catch (Exception e) {
            throw new BookingFailedException("Unable to reach user-service: " + e.getMessage());
        }

        // ── Step 1: Fetch train details via Feign ────────────────────────────
        TrainResponseDTO train;
        try {
            train = trainServiceClient.getTrainById(requestDTO.getTrainId());
        } catch (FeignException.NotFound e) {
            throw new BookingFailedException("Train not found with ID: " + requestDTO.getTrainId());
        } catch (Exception e) {
            throw new BookingFailedException("Unable to reach train-service: " + e.getMessage());
        }

        // ── Step 2: Validate seat availability ───────────────────────────────
        if (train.getAvailableSeats() < requestDTO.getSeatsBooked()) {
            throw new BookingFailedException(
                    "Insufficient seats. Available: " + train.getAvailableSeats()
                    + ", Requested: " + requestDTO.getSeatsBooked());
        }

        // ── Step 3: Calculate total fare ──────────────────────────────────────
        double totalFare = train.getFare() * requestDTO.getSeatsBooked();

        // ── Step 4: Save booking ──────────────────────────────────────────────
        Booking booking = Booking.builder()
                .userId(requestDTO.getUserId())
                .trainId(requestDTO.getTrainId())
                .seatsBooked(requestDTO.getSeatsBooked())
                .totalFare(totalFare)
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking saved with ID: {}", savedBooking.getId());

        // ── Step 5: Reduce seats in train-service via Feign ──────────────────
        try {
            trainServiceClient.updateSeatAvailability(requestDTO.getTrainId(), requestDTO.getSeatsBooked());
        } catch (Exception e) {
            log.error("Failed to update seat availability in train-service: {}", e.getMessage());
            throw new BookingFailedException("Failed to reduce seats in train-service: " + e.getMessage());
        }

        return mapToDTO(savedBooking, train);
    }

    @Override
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(b -> {
                    TrainResponseDTO train = fetchTrainSafely(b.getTrainId());
                    return mapToDTO(b, train);
                })
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + id));
        TrainResponseDTO train = fetchTrainSafely(booking.getTrainId());
        return mapToDTO(booking, train);
    }

    @Override
    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + id));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingFailedException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelled = bookingRepository.save(booking);
        log.info("Booking {} cancelled", id);

        try {
            trainServiceClient.releaseSeats(booking.getTrainId(), booking.getSeatsBooked());
        } catch (Exception e) {
            log.error("Failed to restore seats in train-service for cancelled booking: {}", e.getMessage());
            throw new BookingFailedException("Failed to restore seats in train-service: " + e.getMessage());
        }

        TrainResponseDTO train = fetchTrainSafely(booking.getTrainId());
        return mapToDTO(cancelled, train);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private TrainResponseDTO fetchTrainSafely(Long trainId) {
        try {
            return trainServiceClient.getTrainById(trainId);
        } catch (Exception e) {
            // Return a placeholder if train-service is unavailable
            return TrainResponseDTO.builder()
                    .id(trainId)
                    .trainName("N/A")
                    .source("N/A")
                    .destination("N/A")
                    .build();
        }
    }

    private BookingResponseDTO mapToDTO(Booking booking, TrainResponseDTO train) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .trainId(booking.getTrainId())
                .trainName(train != null ? train.getTrainName() : "N/A")
                .source(train != null ? train.getSource() : "N/A")
                .destination(train != null ? train.getDestination() : "N/A")
                .seatsBooked(booking.getSeatsBooked())
                .bookingDate(booking.getBookingDate())
                .totalFare(booking.getTotalFare())
                .status(booking.getStatus())
                .build();
    }
}
