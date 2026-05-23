package com.irctc.payment.dto;

import com.irctc.payment.entity.Payment.PaymentMode;
import com.irctc.payment.entity.Payment.PaymentStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * PaymentResponseDTO - Outgoing payment confirmation payload.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {
    private Long id;
    private Long bookingId;
    private Double amount;
    private PaymentStatus paymentStatus;
    private PaymentMode paymentMode;
    private LocalDateTime paymentDate;
    private String transactionId;
}
