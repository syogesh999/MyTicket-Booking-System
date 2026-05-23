@echo off
set URL=http://localhost:8080/users

curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"name\":\"Arjun Sharma\",\"email\":\"arjun.sharma@quantum.in\",\"phone\":\"9876543210\",\"password\":\"secure123\"}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"name\":\"Priya Patel\",\"email\":\"priya.patel@quantum.in\",\"phone\":\"9812345678\",\"password\":\"secure456\"}"
echo.
curl -s -X POST %URL% -H "Content-Type: application/json" -d "{\"name\":\"Rahul Verma\",\"email\":\"rahul.verma@quantum.in\",\"phone\":\"9898989898\",\"password\":\"secure789\"}"
echo.
echo ALL_USERS_SEEDED
