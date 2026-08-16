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
- MongoDB-backed data persistence
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
- Java 24
- Spring Boot 3.5
- Spring Security
- MongoDB
- JWT authentication
- Springdoc OpenAPI
- Razorpay Java SDK

## Repository Structure

- `water-management-backend/` - Spring Boot REST API
- `water-management-frontend/` - Vite React frontend
- `API_Collection/` - Bruno API collection for testing endpoints

## Prerequisites

Before running the project, make sure you have:

- JDK 24+
- Maven
- MongoDB running locally
- Node.js 18+
- npm

## Backend Setup

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

The backend is configured to use MongoDB at:

```properties
mongodb://localhost:27017/waterbillingdb
```

This can be adjusted in:

- `water-management-backend/src/main/resources/application.properties`

## Notes

- The project uses JWT-based authentication for secure user access.
- Payment configuration is currently configured in the backend properties file.
- The frontend and backend need to run together for the full application experience.

## License

This project is under Apache 2.0 license
