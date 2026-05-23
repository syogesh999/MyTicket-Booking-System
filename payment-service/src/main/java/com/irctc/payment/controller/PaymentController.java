package com.irctc.payment.controller;

import com.irctc.payment.dto.PaymentRequestDTO;
import com.irctc.payment.dto.PaymentResponseDTO;
import com.irctc.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * PaymentController - REST endpoints for payment processing.
 * Base URL: /payments
 * Accessible via API Gateway at: http://localhost:8080/payments
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /payments
     * Process a payment for a booking.
     */
    @PostMapping
    public ResponseEntity<PaymentResponseDTO> processPayment(
            @Valid @RequestBody PaymentRequestDTO requestDTO) {
        log.info("POST /payments - bookingId={}", requestDTO.getBookingId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.processPayment(requestDTO));
    }

    /**
     * GET /payments/{id}
     * Retrieve payment details by payment ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    /**
     * GET /payments/booking/{bookingId}
     * Retrieve all payments linked to a specific booking.
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByBookingId(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBookingId(bookingId));
    }

    /**
     * PUT /payments/{id}/refund
     * Refund a successful payment.
     */
    @PutMapping("/{id}/refund")
    public ResponseEntity<PaymentResponseDTO> refundPayment(@PathVariable Long id) {
        log.info("PUT /payments/{}/refund", id);
        return ResponseEntity.ok(paymentService.refundPayment(id));
    }
}
