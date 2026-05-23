package com.irctc.booking.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * UserServiceClient - OpenFeign client for user-service.
 * Uses Eureka service name "user-service" for load-balanced discovery.
 */
@FeignClient(name = "user-service")
public interface UserServiceClient {

    /**
     * Fetches user details from user-service by ID.
     * Maps to: GET http://user-service/users/{id}
     */
    @GetMapping("/users/{id}")
    Object getUserById(@PathVariable("id") Long id);
}
