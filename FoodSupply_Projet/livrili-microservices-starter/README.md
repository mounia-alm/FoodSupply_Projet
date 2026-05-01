# Livrili Microservices Starter

Production-oriented starter for a B2B wholesale platform connecting restaurants and suppliers.

## Services
- auth-service (JWT + roles)
- user-service (restaurant/supplier profiles)
- product-service (supplier products)
- order-service (orders and statuses)
- notification-worker (RabbitMQ consumer)
- frontend-web (React + Vite)
- traefik (API gateway)
- consul (service discovery)
- rabbitmq (broker)

## Quick Start
1. Install Docker Desktop
2. From this folder:
   - `docker compose up --build`
3. Open:
   - Frontend: http://localhost
   - Traefik dashboard (optional if enabled): not exposed by default
   - Consul: http://localhost:8500
   - RabbitMQ: http://localhost:15672 (guest/guest)

## API Routes (Gateway)
- `/api/auth/*` -> auth-service
- `/api/users/*` -> user-service
- `/api/products/*` -> product-service
- `/api/orders/*` -> order-service

## Default Order Status
- pending
- confirmed
- delivered

## Notes
- Each service has its own SQLite DB for starter simplicity.
- Swap SQLite with Postgres per service for production.
- Add CI, tests, and migrations hardening before release.
