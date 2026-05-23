# Quantum Railways 🎫 - MyTicket-Booking-System

A high-performance, modern microservice-driven train ticket reservation platform built with Spring Cloud, OpenFeign, and a premium framework-free vanilla TypeScript user interface.

---

## 🚀 Architectural Overview

This project implements a complete ticket booking pipeline spanning user management, real-time seat inventory checks, atomic ticket creation, transactional payment simulations, and automated refunds.

- **System Architecture Guide:** View detailed schemas in [ARCHITECTURE.md](file:///c:/Users/Admin/SourceCode/MyTicket-Booking-System/ARCHITECTURE.md).
- **Frontend Core:** Structured around a vanilla TypeScript component hierarchy and reactive pub-sub state store.
- **Backend Core:** Spring Boot microservices backed by Spring Cloud Netflix Eureka and Spring Cloud Gateway.

---

## 📂 Repository Layout

```
MyTicket-Booking-System/
├── api-gateway/            # Port 8080 - Spring Cloud Gateway & Cors Hub
├── discovery-server/       # Port 8761 - Eureka Service Discovery Server
├── user-service/           # Port 8081 - User Management Microservice
├── train-service/          # Port 8082 - Train Inventory & Allocation Service
├── booking-service/        # Port 8083 - Booking Orchestrator Service
├── payment-service/        # Port 8084 - Payment Simulator & Refund Service
├── booking-ui/             # Vanilla TypeScript UI (Vite dev server)
├── logs/                   # Application stdout logs directory
├── maven/                  # Bundled Apache Maven 3.9.6 wrapper binaries
├── setup-databases.sql     # Database setup routines (MySQL)
├── start_services.ps1      # Background services initialization script
├── start_and_test.ps1      # Background services launcher + integration tests runner
└── test_postman_collection.ps1 # Integration Test Suite
```

---

## 🛠️ Getting Started (Local Development)

### 1. Prerequisites
- **Java JDK 17** (or above) installed and added to your system path.
- **Node.js 20+** installed for frontend UI execution.

### 2. Databases Provisioning
By default, all services use H2 in-memory databases with automatic schema creations on startup. No extra database engine installation is required to start developing.

> [!NOTE]
> To configure MySQL, execute [setup-databases.sql](file:///c:/Users/Admin/SourceCode/MyTicket-Booking-System/setup-databases.sql) on your server and modify database properties in service resources to switch Spring profiles.

### 3. Orchestration Script
Run the PowerShell script in the root directory to spin up all backend services in the correct sequence with automatic port conflicts resolution:

```powershell
./start_services.ps1
```
*This launches 6 command shells running the microservices grid and redirects stdout output to logs inside `/logs/`.*

### 4. Running the Frontend
Navigate to the UI folder and start Vite's dev server:

```powershell
cd booking-ui
npm install
npm run dev
```

---

## 🧪 Testing and Quality Control

The project includes a complete integration test runner script mapping all service API REST routes.
To run the services, execute all verification test suites, and clean up the processes automatically, run:

```powershell
./start_and_test.ps1
```

*This will boot Eureka, the gateway, all microservices, wait for registry sync, execute API tests, print statistics, and tear down background tasks.*
