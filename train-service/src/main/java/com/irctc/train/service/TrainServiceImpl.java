package com.irctc.train.service;

import com.irctc.train.dto.TrainRequestDTO;
import com.irctc.train.dto.TrainResponseDTO;
import com.irctc.train.entity.Train;
import com.irctc.train.exception.DuplicateTrainNumberException;
import com.irctc.train.exception.InsufficientSeatsException;
import com.irctc.train.exception.TrainNotFoundException;
import com.irctc.train.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TrainServiceImpl implements TrainService {

    private final TrainRepository trainRepository;

    @Override
    public TrainResponseDTO createTrain(TrainRequestDTO requestDTO) {
        log.info("Creating train: {}", requestDTO.getTrainNumber());

        if (trainRepository.existsByTrainNumber(requestDTO.getTrainNumber())) {
            throw new DuplicateTrainNumberException("Train already exists with number: " + requestDTO.getTrainNumber());
        }

        Train train = Train.builder()
                .trainNumber(requestDTO.getTrainNumber())
                .trainName(requestDTO.getTrainName())
                .source(requestDTO.getSource())
                .destination(requestDTO.getDestination())
                .availableSeats(requestDTO.getAvailableSeats())
                .fare(requestDTO.getFare())
                .build();

        Train saved = trainRepository.save(train);
        log.info("Train created with ID: {}", saved.getId());
        return mapToDTO(saved);
    }

    @Override
    public List<TrainResponseDTO> getAllTrains() {
        return trainRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TrainResponseDTO getTrainById(Long id) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new TrainNotFoundException("Train not found with ID: " + id));
        return mapToDTO(train);
    }

    @Override
    public TrainResponseDTO updateTrain(Long id, TrainRequestDTO requestDTO) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new TrainNotFoundException("Train not found with ID: " + id));

        if (trainRepository.existsByTrainNumberAndIdNot(requestDTO.getTrainNumber(), id)) {
            throw new DuplicateTrainNumberException("Train number " + requestDTO.getTrainNumber() + " is already in use by another train");
        }

        train.setTrainNumber(requestDTO.getTrainNumber());
        train.setTrainName(requestDTO.getTrainName());
        train.setSource(requestDTO.getSource());
        train.setDestination(requestDTO.getDestination());
        train.setAvailableSeats(requestDTO.getAvailableSeats());
        train.setFare(requestDTO.getFare());

        return mapToDTO(trainRepository.save(train));
    }

    @Override
    public void deleteTrain(Long id) {
        if (!trainRepository.existsById(id)) {
            throw new TrainNotFoundException("Train not found with ID: " + id);
        }
        trainRepository.deleteById(id);
    }

    /**
     * Reduces available seat count after a booking is confirmed.
     * Called by booking-service via Feign Client.
     */
    @Override
    public TrainResponseDTO updateSeatAvailability(Long id, int seatsToReduce) {
        log.info("Reducing {} seats for train ID: {}", seatsToReduce, id);

        int updated = trainRepository.reduceSeats(id, seatsToReduce);
        if (updated == 0) {
            // Check if train exists
            Train train = trainRepository.findById(id)
                    .orElseThrow(() -> new TrainNotFoundException("Train not found with ID: " + id));
            // If it exists, then it's because there are insufficient seats
            throw new InsufficientSeatsException(
                    "Only " + train.getAvailableSeats() + " seats available, requested: " + seatsToReduce);
        }

        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new TrainNotFoundException("Train not found with ID: " + id));
        return mapToDTO(train);
    }

    /**
     * Increases available seat count when booking is cancelled.
     * Called by booking-service via Feign Client.
     */
    @Override
    public TrainResponseDTO releaseSeats(Long id, int seatsToRestore) {
        log.info("Restoring {} seats for train ID: {}", seatsToRestore, id);

        int updated = trainRepository.increaseSeats(id, seatsToRestore);
        if (updated == 0) {
            throw new TrainNotFoundException("Train not found with ID: " + id);
        }

        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new TrainNotFoundException("Train not found with ID: " + id));
        return mapToDTO(train);
    }

    // ─── Mapper ─────────────────────────────────────────────────────────────────

    private TrainResponseDTO mapToDTO(Train train) {
        return TrainResponseDTO.builder()
                .id(train.getId())
                .trainNumber(train.getTrainNumber())
                .trainName(train.getTrainName())
                .source(train.getSource())
                .destination(train.getDestination())
                .availableSeats(train.getAvailableSeats())
                .fare(train.getFare())
                .build();
    }
}
