package com.irctc.payment.service;

import com.irctc.payment.dto.PaymentRequestDTO;
import com.irctc.payment.dto.PaymentResponseDTO;
import com.irctc.payment.entity.Payment;
import com.irctc.payment.entity.Payment.PaymentStatus;
import com.irctc.payment.exception.PaymentNotFoundException;
import com.irctc.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

/**
 * PaymentServiceImpl - Handles payment processing with simulated gateway.
 *
 * In production: replace simulatePaymentGateway() with a real
 * payment provider (Razorpay, Stripe, PayU, etc.).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    /**
     * Process payment for a booking.
     * Generates a unique transaction ID and simulates gateway call.
     */
    @Override
    public PaymentResponseDTO processPayment(PaymentRequestDTO requestDTO) {
        log.info("Processing payment for bookingId={}, amount={}, mode={}",
                requestDTO.getBookingId(), requestDTO.getAmount(), requestDTO.getPaymentMode());

        // Simulate payment gateway response (SUCCESS ~90% of the time)
        PaymentStatus status = simulatePaymentGateway();
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .bookingId(requestDTO.getBookingId())
                .amount(requestDTO.getAmount())
                .paymentStatus(status)
                .paymentMode(requestDTO.getPaymentMode())
                .transactionId(transactionId)
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Payment {} for bookingId={} - status: {}", transactionId, requestDTO.getBookingId(), status);

        return mapToDTO(saved);
    }

    @Override
    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + id));
        return mapToDTO(payment);
    }

    @Override
    public List<PaymentResponseDTO> getPaymentsByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Refund a payment — sets status to REFUNDED.
     * In production: trigger actual refund via payment gateway API.
     */
    @Override
    public PaymentResponseDTO refundPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + id));

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Only successful payments can be refunded");
        }

        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        Payment refunded = paymentRepository.save(payment);
        log.info("Payment {} refunded", payment.getTransactionId());

        return mapToDTO(refunded);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Simulates a payment gateway response.
     * Replace with real integration (Razorpay / Stripe SDK) in production.
     */
    private PaymentStatus simulatePaymentGateway() {
        // Simulate ~90% success rate
        return Math.random() > 0.1 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    }

    private PaymentResponseDTO mapToDTO(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .paymentMode(payment.getPaymentMode())
                .paymentDate(payment.getPaymentDate())
                .transactionId(payment.getTransactionId())
                .build();
    }
}
