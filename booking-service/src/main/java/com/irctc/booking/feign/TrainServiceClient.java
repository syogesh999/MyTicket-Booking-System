package com.irctc.booking.feign;

import com.irctc.booking.dto.TrainResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * TrainServiceClient - OpenFeign client for train-service.
 *
 * Uses Eureka service name "train-service" for load-balanced discovery.
 * Spring Cloud will resolve "train-service" to the actual host:port
 * via the Eureka registry at runtime.
 */
@FeignClient(name = "train-service")
public interface TrainServiceClient {

    /**
     * Fetches train details from train-service.
     * Maps to: GET http://train-service/trains/{id}
     */
    @GetMapping("/trains/{id}")
    TrainResponseDTO getTrainById(@PathVariable("id") Long id);

    /**
     * Reduces available seats in train-service after booking.
     * Maps to: PUT http://train-service/trains/{id}/seats?count=N
     */
    @PutMapping("/trains/{id}/seats")
    TrainResponseDTO updateSeatAvailability(@PathVariable("id") Long id, @RequestParam("count") int count);

    /**
     * Restores available seats in train-service when a booking is cancelled.
     * Maps to: PUT http://train-service/trains/{id}/seats/release?count=N
     */
    @PutMapping("/trains/{id}/seats/release")
    TrainResponseDTO releaseSeats(@PathVariable("id") Long id, @RequestParam("count") int count);
}
