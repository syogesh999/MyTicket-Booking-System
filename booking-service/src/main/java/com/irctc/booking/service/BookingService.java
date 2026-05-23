package com.irctc.booking.service;

import com.irctc.booking.dto.BookingRequestDTO;
import com.irctc.booking.dto.BookingResponseDTO;

import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO requestDTO);
    List<BookingResponseDTO> getAllBookings();
    BookingResponseDTO getBookingById(Long id);
    BookingResponseDTO cancelBooking(Long id);
}
