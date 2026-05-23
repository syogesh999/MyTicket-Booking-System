package com.irctc.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Payment Entity - Maps to 'payments' table in irctc_payments database.
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private Double amount;

    /** SUCCESS, FAILED, PENDING, REFUNDED */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    /** UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, WALLET */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime paymentDate;

    /** Auto-generated transaction reference */
    @Column(unique = true)
    private String transactionId;

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }

    public enum PaymentMode {
        UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, WALLET
    }
}
