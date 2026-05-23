-- ============================================================
-- My Ticket Booking App - MySQL Database Setup Script
-- Run this script ONCE before starting any microservice.
-- ============================================================

-- Create databases (services use createDatabaseIfNotExist=true,
-- but running this manually ensures clean setup)

CREATE DATABASE IF NOT EXISTS ticket_booking_users
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS ticket_booking_trains
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS ticket_booking_bookings
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS ticket_booking_payments
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify creation
SHOW DATABASES LIKE 'ticket_booking_%';

-- Optional: Create a dedicated app user (recommended for production)
-- CREATE USER 'ticket_booking_app'@'localhost' IDENTIFIED BY 'StrongPassword@123';
-- GRANT ALL PRIVILEGES ON ticket_booking_users.*    TO 'ticket_booking_app'@'localhost';
-- GRANT ALL PRIVILEGES ON ticket_booking_trains.*   TO 'ticket_booking_app'@'localhost';
-- GRANT ALL PRIVILEGES ON ticket_booking_bookings.* TO 'ticket_booking_app'@'localhost';
-- GRANT ALL PRIVILEGES ON ticket_booking_payments.* TO 'ticket_booking_app'@'localhost';
-- FLUSH PRIVILEGES;
