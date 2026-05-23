package com.irctc.train.controller;

import com.irctc.train.dto.TrainRequestDTO;
import com.irctc.train.dto.TrainResponseDTO;
import com.irctc.train.service.TrainService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TrainController - REST endpoints for train management.
 * Base URL: /trains
 * Accessible via API Gateway at: http://localhost:8080/trains
 */
@RestController
@RequestMapping("/trains")
@RequiredArgsConstructor
@Slf4j
public class TrainController {

    private final TrainService trainService;

    /** POST /trains - Add a new train */
    @PostMapping
    public ResponseEntity<TrainResponseDTO> createTrain(@Valid @RequestBody TrainRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainService.createTrain(requestDTO));
    }

    /** GET /trains - List all trains */
    @GetMapping
    public ResponseEntity<List<TrainResponseDTO>> getAllTrains() {
        return ResponseEntity.ok(trainService.getAllTrains());
    }

    /** GET /trains/{id} - Get a specific train */
    @GetMapping("/{id}")
    public ResponseEntity<TrainResponseDTO> getTrainById(@PathVariable Long id) {
        return ResponseEntity.ok(trainService.getTrainById(id));
    }

    /** PUT /trains/{id} - Update train details */
    @PutMapping("/{id}")
    public ResponseEntity<TrainResponseDTO> updateTrain(
            @PathVariable Long id,
            @Valid @RequestBody TrainRequestDTO requestDTO) {
        return ResponseEntity.ok(trainService.updateTrain(id, requestDTO));
    }

    /** DELETE /trains/{id} - Remove a train */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrain(@PathVariable Long id) {
        trainService.deleteTrain(id);
        return ResponseEntity.ok("Train with ID " + id + " deleted successfully");
    }

    /**
     * PUT /trains/{id}/seats?count=N
     * Internal endpoint called by booking-service via Feign to reduce seats.
     */
    @PutMapping("/{id}/seats")
    public ResponseEntity<TrainResponseDTO> updateSeatAvailability(
            @PathVariable Long id,
            @RequestParam int count) {
        log.info("Seat update request for train ID: {}, seats to reduce: {}", id, count);
        return ResponseEntity.ok(trainService.updateSeatAvailability(id, count));
    }

    /**
     * PUT /trains/{id}/seats/release?count=N
     * Internal endpoint called by booking-service via Feign to restore seats.
     */
    @PutMapping("/{id}/seats/release")
    public ResponseEntity<TrainResponseDTO> releaseSeats(
            @PathVariable Long id,
            @RequestParam int count) {
        log.info("Seat release request for train ID: {}, seats to restore: {}", id, count);
        return ResponseEntity.ok(trainService.releaseSeats(id, count));
    }
}
