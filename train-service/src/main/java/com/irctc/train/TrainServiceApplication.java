package com.irctc.train;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Train Service - Manages train inventory, schedules, and seat availability.
 * Registers with Eureka Discovery Server.
 * Runs on port 8082.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class TrainServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrainServiceApplication.class, args);
    }
}
