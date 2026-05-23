@echo off
set URL=http://localhost:8080/trains
set CT=Content-Type: application/json

curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"12301\",\"trainName\":\"Rajdhani Express\",\"source\":\"New Delhi\",\"destination\":\"Kolkata\",\"availableSeats\":120,\"fare\":1450.0}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"12626\",\"trainName\":\"Kerala Express\",\"source\":\"New Delhi\",\"destination\":\"Kochi\",\"availableSeats\":200,\"fare\":1850.0}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"12951\",\"trainName\":\"Mumbai Rajdhani\",\"source\":\"New Delhi\",\"destination\":\"Mumbai\",\"availableSeats\":150,\"fare\":1200.0}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"12433\",\"trainName\":\"Rajdhani Express\",\"source\":\"Bengaluru\",\"destination\":\"New Delhi\",\"availableSeats\":90,\"fare\":2100.0}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"12622\",\"trainName\":\"Tamil Nadu Express\",\"source\":\"Chennai\",\"destination\":\"New Delhi\",\"availableSeats\":180,\"fare\":1650.0}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"12273\",\"trainName\":\"Duronto Express\",\"source\":\"Howrah\",\"destination\":\"Mumbai\",\"availableSeats\":7,\"fare\":980.0}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"22691\",\"trainName\":\"Rajdhani Express\",\"source\":\"Bengaluru\",\"destination\":\"Hyderabad\",\"availableSeats\":60,\"fare\":750.0}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"trainNumber\":\"12978\",\"trainName\":\"Ajmer Superfast\",\"source\":\"Mumbai\",\"destination\":\"Goa\",\"availableSeats\":240,\"fare\":550.0}"
echo.
echo ALL_TRAINS_SEEDED
