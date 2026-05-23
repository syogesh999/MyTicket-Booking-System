package com.irctc.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Booking Service - Handles train bookings.
 * Communicates with train-service via OpenFeign.
 * Runs on port 8083.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients  // Enables OpenFeign client scanning
public class BookingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookingServiceApplication.class, args);
    }
}
