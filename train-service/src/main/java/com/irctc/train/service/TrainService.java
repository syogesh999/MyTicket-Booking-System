package com.irctc.train.service;

import com.irctc.train.dto.TrainRequestDTO;
import com.irctc.train.dto.TrainResponseDTO;

import java.util.List;

public interface TrainService {

    TrainResponseDTO createTrain(TrainRequestDTO requestDTO);

    List<TrainResponseDTO> getAllTrains();

    TrainResponseDTO getTrainById(Long id);

    TrainResponseDTO updateTrain(Long id, TrainRequestDTO requestDTO);

    void deleteTrain(Long id);

    /**
     * Called by booking-service via Feign to reduce seat count after booking.
     */
    TrainResponseDTO updateSeatAvailability(Long id, int seatsToReduce);

    /**
     * Expose endpoint to release seats when booking is cancelled.
     */
    TrainResponseDTO releaseSeats(Long id, int seatsToRestore);
}
