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
- Java 21
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

- JDK 21+
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

## Deploy on Render with MongoDB Atlas

The backend uses Spring Data MongoDB, so it can use MongoDB Atlas without changing its repositories or models. Render builds the backend from `water-management-backend/Dockerfile` and checks `/actuator/health`; the health endpoint reports `DOWN` when MongoDB cannot be reached. The frontend's `VITE_API_BASE_URL` points at the backend Render service.

1. In [MongoDB Atlas](https://cloud.mongodb.com/), create a cluster or use an existing one. Create a **database user** with `readWrite` access to `waterbillingdb`, and allow the backend service's [Render outbound IP addresses](https://render.com/docs/outbound-ip-addresses) in Atlas Network Access. An existing cluster can hold this new database alongside other projects' databases.
2. In the cluster's **Connect → Drivers** page, copy its connection string. Replace the username and password placeholders (URL-encode special characters) and use `waterbillingdb` as the path, before any query string: `mongodb+srv://USER:PASSWORD@HOST/waterbillingdb?retryWrites=true&w=majority`. Keep this URI out of git.
3. In the Render dashboard, set `MONGODB_URI` on the **water-management-backend** service to that full URI. Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` to credentials for your first super admin. Render generates `JWT_SECRET` from the Blueprint and enables the `production` profile. For an existing Blueprint, `sync: false` variables must be set in the service's Environment tab: subsequent Blueprint syncs do not prompt for them.
4. Deploy/sync `render.yaml` and check `https://water-management-backend.onrender.com/actuator/health` for `{"status":"UP"}`. The frontend must use the backend's actual URL for `VITE_API_BASE_URL`, with `/api` at the end; rebuild the static site after changing it. Log in with the bootstrap admin credentials. The bootstrap account is created only if that email is absent, so later deploys do not reset its password.

Production does not seed demo users or sample records. The local default `mongodb://localhost:27017/waterbillingdb` remains available outside the `production` profile. Production requires `MONGODB_URI` and `JWT_SECRET`; password recovery is unavailable until an email delivery service is configured. If using a database with existing demo users, remove or reset their published credentials before exposing it.

## Notes
- The project uses JWT-based authentication for secure user access.
- Payment configuration is currently configured in the backend properties file.
- The frontend and backend need to run together for the full application experience.

## License
This project is under Apache 2.0 license
