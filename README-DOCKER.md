# Docker Setup for Event Ticketing Platform

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher
- At least 4GB RAM allocated to Docker

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration values.

### 2. Start All Services

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
```

### 3. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Services Overview

| Service       | Port | Description                    |
|---------------|------|--------------------------------|
| API Gateway   | 3000 | Main entry point for APIs      |
| Auth Service  | 3001 | Authentication service         |
| PostgreSQL    | 5432 | Primary database               |
| Redis         | 6379 | Cache and session store        |
| Kafka         | 9092 | Message broker                 |
| Zookeeper     | 2181 | Kafka coordination             |
| Kafka UI      | 8080 | Kafka monitoring dashboard     |

## Accessing Services

- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Kafka UI**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Database

The PostgreSQL database is automatically initialized with:
- Required extensions (uuid-ossp, pgcrypto)
- Schema tables (users, events, tickets, bookings)
- Indexes for performance
- Triggers for automatic timestamp updates

### Connect to Database

```bash
docker exec -it postgres psql -U postgres -d event_ticketing
```

## Kafka

Kafka is pre-configured with topics defined in your application:
- `user.registered`
- `user.login`
- `event.created`
- `event.updated`
- `ticket.purchased`
- And more...

### Monitor Kafka

Access Kafka UI at http://localhost:8080 to:
- View topics
- Monitor messages
- Check consumer groups
- Inspect configurations

## Development Mode

For development with hot-reload:

```bash
# Start infrastructure only (DB, Redis, Kafka)
docker-compose up -d postgres redis kafka zookeeper

# Run services locally with watch mode
pnpm run dev
```

## Troubleshooting

### Services won't start

Check if ports are already in use:
```bash
lsof -i :3000  # API Gateway
lsof -i :3001  # Auth Service
lsof -i :5432  # PostgreSQL
lsof -i :9092  # Kafka
```

### Check service health

```bash
docker-compose ps
docker-compose logs <service-name>
```

### Reset everything

```bash
docker-compose down -v
docker-compose up -d --build
```

### Rebuild specific service

```bash
docker-compose up -d --build api-gateway
```

## Production Deployment

For production:

1. Update environment variables in `.env`
2. Change default passwords and secrets
3. Configure proper SSL/TLS certificates
4. Set up proper logging and monitoring
5. Configure backup strategies for PostgreSQL
6. Adjust resource limits in docker-compose.yaml

## Useful Commands

```bash
# View running containers
docker-compose ps

# Execute command in container
docker-compose exec api-gateway sh

# View resource usage
docker stats

# Clean up unused images and volumes
docker system prune -a --volumes
```

## Network

All services communicate through the `event-ticketing-network` bridge network, allowing:
- Service discovery by container name
- Isolated networking
- Inter-service communication

## Volumes

Persistent data is stored in Docker volumes:
- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis persistence files

These volumes persist data across container restarts.
