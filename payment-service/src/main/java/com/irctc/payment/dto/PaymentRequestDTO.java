package com.irctc.payment.dto;

import com.irctc.payment.entity.Payment.PaymentMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * PaymentRequestDTO - Payload for initiating a payment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDTO {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Amount must be at least 1.0")
    private Double amount;

    @NotNull(message = "Payment mode is required")
    private PaymentMode paymentMode;
}
