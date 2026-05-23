package com.irctc.user.exception;

/**
 * Thrown when attempting to register a user with an already-used email.
 */
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
