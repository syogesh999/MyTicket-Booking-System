package com.irctc.train.repository;

import com.irctc.train.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TrainRepository - Data access layer for Train entity.
 */
@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {

    Optional<Train> findByTrainNumber(String trainNumber);

    boolean existsByTrainNumber(String trainNumber);

    boolean existsByTrainNumberAndIdNot(String trainNumber, Long id);

    /** Find trains by source and destination for search functionality */
    List<Train> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Train t SET t.availableSeats = t.availableSeats - :seats WHERE t.id = :id AND t.availableSeats >= :seats")
    int reduceSeats(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("seats") int seats);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Train t SET t.availableSeats = t.availableSeats + :seats WHERE t.id = :id")
    int increaseSeats(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("seats") int seats);
}
