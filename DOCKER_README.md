# Docker Deployment Guide

This project includes Docker and Docker Compose configurations for easy deployment.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

## Quick Start (Production)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Formulário Secretária"
   ```

2. **Create a `.env` file** with your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your keys:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
   CLERK_PUBLISHABLE_KEY=pk_test_your_key
   CLERK_SECRET_KEY=sk_test_your_key
   OPENAI_API_KEY=sk-your_openai_key
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Application: http://localhost:3001
   - PostgreSQL: localhost:5432

5. **View logs**
   ```bash
   docker-compose logs -f app
   ```

6. **Stop the application**
   ```bash
   docker-compose down
   ```

## Development Mode

For development with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will:
- Start PostgreSQL on port 5432
- Start the backend server on port 3001
- Start Vite dev server on port 5173
- Enable hot reload for code changes

## Database Management

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d formulario_secretaria
```

### Run migrations
```bash
docker-compose exec app node run-migration.js
```

### Backup database
```bash
docker-compose exec postgres pg_dump -U postgres formulario_secretaria > backup.sql
```

### Restore database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres formulario_secretaria
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (frontend) | Yes |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (backend) | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for GPT features | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Auto-configured |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (production/development) | Auto-configured |

## Services

### App Service
- **Container Name**: `formulario-app`
- **Port**: 3001
- **Image**: Built from Dockerfile
- **Restart Policy**: unless-stopped

### PostgreSQL Service
- **Container Name**: `formulario-postgres`
- **Port**: 5432
- **Image**: postgres:17-alpine
- **Credentials**: 
  - User: postgres
  - Password: postgres
  - Database: formulario_secretaria

## Volumes

- `postgres_data`: Persistent PostgreSQL data

## Networks

- `app-network`: Bridge network for service communication

## Troubleshooting

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Application won't start
```bash
# Check application logs
docker-compose logs app

# Rebuild the image
docker-compose up --build -d
```

### Clear everything and start fresh
```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

## Production Deployment

For production deployment:

1. Update `.env` with production credentials
2. Consider using Docker secrets or external secret management
3. Use a reverse proxy (nginx, Caddy) for SSL/TLS
4. Set up automated backups for the database
5. Configure proper logging and monitoring
6. Use Docker Swarm or Kubernetes for orchestration

## One-Click Deploy to Cloud

### Deploy to Railway
```bash
# Railway will use nixpacks.toml automatically
railway up
```

### Deploy to Render
- Connect your GitHub repository
- Render will detect the Dockerfile automatically

### Deploy to DigitalOcean App Platform
- Use the docker-compose.yml configuration
- Set environment variables in the platform dashboard

## Support

For issues and questions, please refer to the main README.md or open an issue on GitHub.
