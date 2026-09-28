# Web-Based Water Consumption and Billing Management Platform

A full-stack web application for managing water utility billing, tariff plans, bulk water purchases, billing cycles, payments, and service requests.

## Overview

This platform is designed for multiple user roles and billing workflows, including:

- Super Admin
- Community Admin
- Resident

It supports end-to-end management of water consumption and billing operations in a community or utility environment.

## Key Features
- Role-based authentication and access control
- Tariff plan management
- Open and finalize billing cycles
- Bulk water purchase tracking
- Invoice generation and billing workflows
- Payment integration with Razorpay
- Service ticket handling
- Notifications and communication support
- PostgreSQL-backed data persistence
- Swagger API documentation

## Tech Stack
### Frontend
- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
### Backend
- Java 21
- Spring Boot 3.5
- Spring Security
- PostgreSQL
- JWT authentication
- Springdoc OpenAPI
- Razorpay Java SDK

## Repository Structure

- `water-management-backend/` - Spring Boot REST API
- `water-management-frontend/` - Vite React frontend
- `API_Collection/` - Bruno API collection for testing endpoints

## Prerequisites

Before running the project, make sure you have:

- JDK 21+
- Maven
- PostgreSQL running locally
- Node.js 20.19+ or 22.12+
- npm

## Backend Setup

Start PostgreSQL with a database named `waterbillingdb`. Set `DB_PASSWORD` to your local PostgreSQL user's password; the default username is `postgres`. For example, with Docker:

```bash
docker run -d --name waterbilling-postgres -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=local-only-password -e POSTGRES_DB=waterbillingdb postgres:16
export DB_PASSWORD=local-only-password
```

```bash
cd water-management-backend
mvn clean install
mvn spring-boot:run
```

The backend runs on:

- http://localhost:8080

Swagger UI is available at:

- http://localhost:8080/swagger-ui/index.html

## Frontend Setup

```bash
cd water-management-frontend
npm install
npm run dev
```

The frontend runs on:

- http://localhost:5173

## Database Configuration

Local development uses `jdbc:postgresql://localhost:5432/waterbillingdb`. Set `DB_USERNAME` and `DB_PASSWORD` for your PostgreSQL user, and optionally `JDBC_DATABASE_URL` for a different JDBC address. The database is created separately; Hibernate creates or updates the application's tables on startup. Tests also require a running PostgreSQL database.

## Deploy on Render with PostgreSQL

The backend uses Spring Data JPA with PostgreSQL. Render builds `water-management-backend/Dockerfile` and checks `/actuator/health`, which reports `DOWN` when PostgreSQL cannot be reached. The frontend's `VITE_API_BASE_URL` points at the backend Render service.

1. The Blueprint provisions a free Render Postgres database and links its connection string to the backend's `DATABASE_URL`. [Free Render Postgres expires after 30 days](https://render.com/docs/free#free-postgres); upgrade it to a persistent plan before then to retain data. Alternatively, provide an existing PostgreSQL connection string by replacing the Blueprint's `fromDatabase` reference with `sync: false` and setting `DATABASE_URL` on the backend service. Keep credentials out of git.
2. On the backend service's Render Environment tab, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` for the first super admin. Render generates `JWT_SECRET` from the Blueprint and enables the `production` profile. For an existing Blueprint, `sync: false` variables must be set in the service's Environment tab: later Blueprint syncs do not prompt for them.
3. Deploy/sync `render.yaml` and check `https://water-management-backend.onrender.com/actuator/health` for `{"status":"UP"}`. The frontend must use the backend's actual URL for `VITE_API_BASE_URL`, with `/api` at the end; rebuild the static site after changing it. Log in with the bootstrap admin credentials. The bootstrap account is created only if that email is absent, so later deploys do not reset its password.

The new PostgreSQL database starts empty; existing MongoDB records are not copied into it. Production does not seed demo users or sample records. Production requires `DATABASE_URL` and `JWT_SECRET`; password recovery is unavailable until an email delivery service is configured. If importing accounts from an older database, remove or reset their published demo credentials before exposing them.

## Notes
- The project uses JWT-based authentication for secure user access.
- Payment configuration is currently configured in the backend properties file.
- The frontend and backend need to run together for the full application experience.

## License
This project is under Apache 2.0 license
