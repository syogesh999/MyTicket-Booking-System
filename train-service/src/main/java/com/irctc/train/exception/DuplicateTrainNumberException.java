package com.irctc.train.exception;

public class DuplicateTrainNumberException extends RuntimeException {
    public DuplicateTrainNumberException(String message) {
        super(message);
    }
}
