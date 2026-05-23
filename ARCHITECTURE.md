# System Architecture & Technical Topology

This document describes the high-level design, routing topologies, data management schemas, and state patterns of the **Quantum Railways (MyTicket-Booking-System)** platform.

---

## 1. Core Architecture Topology

The application is structured around a **Microservices Architecture Pattern**, leveraging the Spring Cloud ecosystem for discovery and routing, coupled with an isolated vanilla TypeScript frontend.

```mermaid
graph TD
    UI[Vanilla TS Client / booking-ui] -->|Port 8080| GW[Spring Cloud API Gateway]
    
    subgraph Registry & Mesh
        E[Eureka Discovery Server / Port 8761] <--> GW
        E <--> US[User Service / Port 8081]
        E <--> TS[Train Service / Port 8082]
        E <--> BS[Booking Service / Port 8083]
        E <--> PS[Payment Service / Port 8084]
    end
    
    subgraph Storage Tier (H2/MySQL Profiles)
        US --> DB1[(User DB)]
        TS --> DB2[(Train DB)]
        BS --> DB3[(Booking DB)]
        PS --> DB4[(Payment DB)]
    end
    
    BS -->|Feign Clients| TS
    BS -->|Feign Clients| US
```

---

## 2. Infrastructure Registry Directory

| Registry Name | Listening Port | Primary Purpose | Database Reference |
| :--- | :--- | :--- | :--- |
| **Discovery Server** | `8761` | Spring Cloud Eureka node coordinates registry | *None* |
| **API Gateway** | `8080` | Netty routing gateway, CORS mapping & fallback hub | *None* |
| **User Service** | `8081` | Profile creation, details synchronization | `ticket_booking_users` |
| **Train Service** | `8082` | Seat allocation grid, scheduling inventory | `ticket_booking_trains` |
| **Booking Service** | `8083` | Seat allocation validation orchestrator, Feign client | `ticket_booking_bookings` |
| **Payment Service** | `8084` | Transaction handler simulator, refunds processing | `ticket_booking_payments` |

---

## 3. Communication Patterns

### API Gateway Routing
The gateway (`api-gateway`) acts as the single entry point. Incoming client calls are routed to services via discovery-backed load balancing (`lb://` protocol):
- `/users/**` ➔ Routed to `user-service`
- `/trains/**` ➔ Routed to `train-service`
- `/bookings/**` ➔ Routed to `booking-service`
- `/payments/**` ➔ Routed to `payment-service`

### Inter-Service Integration
The `booking-service` coordinates with other nodes to ensure booking legitimacy. Communication is synchronous, facilitated via **Spring Cloud OpenFeign**:
1. When booking is requested: `booking-service` contacts `train-service` to verify and decrement available seats.
2. `booking-service` contacts `user-service` to confirm passenger legitimacy.
3. If booking is cancelled: `booking-service` instructs `train-service` to increment seats, and `payment-service` triggers automated refunds.

---

## 4. Frontend Architecture (`booking-ui`)

The frontend is a modular, high-performance web application constructed in **vanilla TypeScript** with **no heavy JS frameworks**, ensuring quick rendering speeds and low resource utilization.

### Core Architecture Components:
- **BaseComponent (`src/components/BaseComponent.ts`):** Abstract class that binds components to the global state store and automatically re-renders them on state mutations.
- **Store (`src/state/Store.ts`):** Lightweight Publish-Subscribe state repository handling:
  - Global user authentication states.
  - Interactive toast arrays.
  - Active workspace themes (Light/Dark themes).
  - Microservice mesh health registry.
- **Pages Directory (`src/pages/`):** High-level page-views (e.g. `Dashboard.ts`, `TrainFinder.ts`, `SystemMonitor.ts`) which represent primary router targets.
- **Components Directory (`src/components/`):** Reusable UI elements (e.g. `Navbar.ts`, `BookingModal.ts`, `PaymentDrawer.ts`).

---

## 5. Development vs. Staging Databases

By default, the platform uses an **in-memory H2 DB Engine** for zero-configuration startup. To transition the system to MySQL for staging:
1. Run [setup-databases.sql](file:///c:/Users/Admin/SourceCode/MyTicket-Booking-System/setup-databases.sql) on your MySQL instance.
2. Switch Spring active profiles in the services' `application.yml` files (or environment variable overrides) to direct JDBC drivers to MySQL.
