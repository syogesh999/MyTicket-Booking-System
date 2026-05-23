$baseUrl = "http://localhost:8080"

Write-Host "========================================="
Write-Host "Running IRCTC Postman Collection Test Suite"
Write-Host "========================================="

# ──────────────────────────────────────────────────────────────────────────
# 1. USER SERVICE TESTS
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n--- [User Service] Create User ---"
$userJson = '{"name": "Arjun Sharma", "email": "arjun@example.com", "password": "password123", "phone": "9876543210"}'
$user = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $userJson -ContentType "application/json"
Write-Host "Created User ID: $($user.id), Name: $($user.name)"

Write-Host "`n--- [User Service] Get All Users ---"
$users = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get
Write-Host "Total Users: $($users.Count)"

Write-Host "`n--- [User Service] Get User By ID (1) ---"
$user1 = Invoke-RestMethod -Uri "$baseUrl/users/1" -Method Get
Write-Host "User ID 1 Name: $($user1.name)"

Write-Host "`n--- [User Service] Update User (1) ---"
$updateUserJson = '{"name": "Arjun Kumar Sharma", "email": "arjun@example.com", "password": "newpassword123", "phone": "9876543210"}'
$updatedUser = Invoke-RestMethod -Uri "$baseUrl/users/1" -Method Put -Body $updateUserJson -ContentType "application/json"
Write-Host "Updated User ID 1 Name: $($updatedUser.name)"


# ──────────────────────────────────────────────────────────────────────────
# 2. TRAIN SERVICE TESTS
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n--- [Train Service] Add Train 1 ---"
$trainJson1 = '{"trainNumber": "12626", "trainName": "Kerala Express", "source": "New Delhi", "destination": "Thiruvananthapuram", "availableSeats": 200, "fare": 1500.00}'
$train1 = Invoke-RestMethod -Uri "$baseUrl/trains" -Method Post -Body $trainJson1 -ContentType "application/json"
Write-Host "Added Train: ID=$($train1.id), Number=$($train1.trainNumber), Seats=$($train1.availableSeats)"

Write-Host "`n--- [Train Service] Add Another Train (Train 2) ---"
$trainJson2 = '{"trainNumber": "12301", "trainName": "Howrah Rajdhani", "source": "New Delhi", "destination": "Howrah", "availableSeats": 300, "fare": 2200.00}'
$train2 = Invoke-RestMethod -Uri "$baseUrl/trains" -Method Post -Body $trainJson2 -ContentType "application/json"
Write-Host "Added Train: ID=$($train2.id), Number=$($train2.trainNumber), Seats=$($train2.availableSeats)"

Write-Host "`n--- [Train Service] Get All Trains ---"
$trains = Invoke-RestMethod -Uri "$baseUrl/trains" -Method Get
Write-Host "Total Trains: $($trains.Count)"

Write-Host "`n--- [Train Service] Get Train By ID (1) ---"
$trainInfo1 = Invoke-RestMethod -Uri "$baseUrl/trains/1" -Method Get
Write-Host "Train ID 1 Name: $($trainInfo1.trainName), Seats: $($trainInfo1.availableSeats)"

Write-Host "`n--- [Train Service] Update Train (1) ---"
$updateTrainJson = '{"trainNumber": "12626", "trainName": "Kerala Superfast Express", "source": "New Delhi", "destination": "Thiruvananthapuram", "availableSeats": 250, "fare": 1600.00}'
$updatedTrain1 = Invoke-RestMethod -Uri "$baseUrl/trains/1" -Method Put -Body $updateTrainJson -ContentType "application/json"
Write-Host "Updated Train 1 Name: $($updatedTrain1.trainName), Seats: $($updatedTrain1.availableSeats)"


# ──────────────────────────────────────────────────────────────────────────
# 3. BOOKING SERVICE TESTS
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n--- [Booking Service] Create Booking ---"
$bookingJson = '{"userId": 1, "trainId": 1, "seatsBooked": 2}'
$booking = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $bookingJson -ContentType "application/json"
Write-Host "Created Booking ID: $($booking.id), Status: $($booking.status), Seats: $($booking.seatsBooked), Total Fare: $($booking.totalFare)"

Write-Host "`n--- [Booking Service] Get All Bookings ---"
$bookings = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Get
Write-Host "Total Bookings: $($bookings.Count)"

Write-Host "`n--- [Booking Service] Get Booking By ID (1) ---"
$booking1 = Invoke-RestMethod -Uri "$baseUrl/bookings/1" -Method Get
Write-Host "Booking ID 1 Status: $($booking1.status), Train: $($booking1.trainName)"


# ──────────────────────────────────────────────────────────────────────────
# 4. PAYMENT SERVICE TESTS
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n--- [Payment Service] Process Payment (UPI) ---"
$paymentJson1 = '{"bookingId": 1, "amount": 3200.00, "paymentMode": "UPI"}'
$payment1 = Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -Body $paymentJson1 -ContentType "application/json"
Write-Host "Processed Payment ID: $($payment1.id), Booking ID: $($payment1.bookingId), Status: $($payment1.paymentStatus), Mode: $($payment1.paymentMode)"

Write-Host "`n--- [Payment Service] Process Payment (Credit Card) ---"
$paymentJson2 = '{"bookingId": 1, "amount": 3200.00, "paymentMode": "CREDIT_CARD"}'
$payment2 = Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -Body $paymentJson2 -ContentType "application/json"
Write-Host "Processed Payment ID: $($payment2.id), Booking ID: $($payment2.bookingId), Status: $($payment2.paymentStatus), Mode: $($payment2.paymentMode)"

Write-Host "`n--- [Payment Service] Get Payment By ID (1) ---"
$paymentDetails1 = Invoke-RestMethod -Uri "$baseUrl/payments/1" -Method Get
Write-Host "Payment ID 1 Amount: $($paymentDetails1.amount), Status: $($paymentDetails1.paymentStatus)"

Write-Host "`n--- [Payment Service] Get Payments By Booking ID (1) ---"
$paymentsForBooking = Invoke-RestMethod -Uri "$baseUrl/payments/booking/1" -Method Get
Write-Host "Total Payments for Booking 1: $($paymentsForBooking.Count)"

Write-Host "`n--- [Payment Service] Refund Payment (1) ---"
$refundedPayment = Invoke-RestMethod -Uri "$baseUrl/payments/1/refund" -Method Put
Write-Host "Refunded Payment ID: $($refundedPayment.id), Status: $($refundedPayment.paymentStatus)"


# ──────────────────────────────────────────────────────────────────────────
# 5. CANCELLATION & CLEANUP TESTS
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n--- [Booking Service] Cancel Booking (1) ---"
$cancelledBooking = Invoke-RestMethod -Uri "$baseUrl/bookings/1/cancel" -Method Put
Write-Host "Cancelled Booking ID: $($cancelledBooking.id), Status: $($cancelledBooking.status)"

Write-Host "`n--- [Train Service] Verifying Seats Restored (should be 250) ---"
$trainInfoRestored = Invoke-RestMethod -Uri "$baseUrl/trains/1" -Method Get
Write-Host "Train ID 1 Available Seats: $($trainInfoRestored.availableSeats)"

Write-Host "`n--- [Train Service] Delete Train (2) ---"
try {
    $deleteResult = Invoke-RestMethod -Uri "$baseUrl/trains/2" -Method Delete
    Write-Host "Delete Train 2 response: $deleteResult"
} catch {
    Write-Host "Delete Train 2 failed: $_"
}

Write-Host "`n--- [User Service] Delete User (1) ---"
try {
    $deleteUserResult = Invoke-RestMethod -Uri "$baseUrl/users/1" -Method Delete
    Write-Host "Delete User 1 response: $deleteUserResult"
} catch {
    Write-Host "Delete User 1 failed: $_"
}

Write-Host "`n========================================="
Write-Host "Postman Collection Test Suite Completed!"
Write-Host "========================================="
