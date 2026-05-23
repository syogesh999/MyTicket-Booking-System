package com.irctc.payment.service;

import com.irctc.payment.dto.PaymentRequestDTO;
import com.irctc.payment.dto.PaymentResponseDTO;

import java.util.List;

public interface PaymentService {
    PaymentResponseDTO processPayment(PaymentRequestDTO requestDTO);
    PaymentResponseDTO getPaymentById(Long id);
    List<PaymentResponseDTO> getPaymentsByBookingId(Long bookingId);
    PaymentResponseDTO refundPayment(Long id);
}
