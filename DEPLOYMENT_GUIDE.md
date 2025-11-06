# Deployment Guide - Formulário Secretária

## Quick Deploy with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Git installed

### 1. Clone and Setup

```bash
git clone https://github.com/Coelho1806/form-secretarial.git
cd form-secretarial

# Create .env file (optional - app works without OAuth)
cp .env.example .env
```

### 2. Configure Environment Variables (Optional)

Edit `.env` file:

```env
# OAuth Configuration (Optional - app works without these)
CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
OPENAI_API_KEY=sk-your_openai_key

# Database Configuration (uses defaults if not set)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/formulario_secretaria
```

### 3. Deploy

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### 4. Access the Application

- **Frontend/API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **API Docs**: http://localhost:3001/ (shows available endpoints)

### 5. Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3001/api/health

# Should return: {"status":"ok","message":"API is running"}
```

## Deployment Platforms

### Coolify (Recommended)

1. **Create New Project**
   - Go to your Coolify dashboard
   - Create a new service
   - Choose "Docker Compose"

2. **Connect Repository**
   - Repository: `https://github.com/Coelho1806/form-secretarial`
   - Branch: `main`

3. **Configure**
   - Docker Compose File: `docker-compose.yml`
   - Add environment variables (optional):
     - `CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `OPENAI_API_KEY`

4. **Deploy**
   - Click "Deploy"
   - Coolify will automatically build and deploy both services

### Railway

1. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `form-secretarial`

2. **Configure Services**
   - Railway will detect `docker-compose.yml`
   - It will create two services: `postgres` and `app`

3. **Add Environment Variables** (optional)
   - Go to app service settings
   - Add variables as needed

4. **Generate Domain**
   - Go to app service
   - Click "Generate Domain"
   - Access your deployed app

### Render

1. **New Web Service**
   - Dashboard → New → Web Service
   - Connect GitHub repo: `form-secretarial`

2. **Configure**
   - Environment: Docker
   - Docker Command: Leave empty (uses Dockerfile CMD)
   - Plan: Free or paid

3. **Add PostgreSQL Database**
   - Create new PostgreSQL database
   - Copy Internal Database URL
   - Add to app as `DATABASE_URL`

4. **Deploy**
   - Click "Create Web Service"

## Troubleshooting

### 504 Gateway Timeout

**Cause**: App not listening on correct host/port

**Solution**: Ensure these environment variables are set:
```bash
PORT=3001
HOST=0.0.0.0  # Critical for Docker!
```

### Database Connection Issues

**Check logs**:
```bash
docker-compose logs postgres
docker-compose logs app
```

**Verify connection**:
```bash
# Inside app container
docker-compose exec app sh
wget -qO- http://localhost:3001/api/health
```

### Port 5432 Already in Use

**Solution**: Either:
1. Stop local PostgreSQL: `sudo systemctl stop postgresql`
2. Or change port in `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Use different external port
   ```

### Container Not Starting

**Check logs**:
```bash
docker-compose logs app --tail=100
```

**Common issues**:
- Missing dependencies: Rebuild with `docker-compose build --no-cache`
- Database not ready: Wait for healthcheck to pass
- Port conflicts: Change ports in docker-compose.yml

### OAuth Not Working

**This is expected!** The app works without OAuth. To enable:

1. Set up Clerk account
2. Add OAuth credentials to `.env`
3. Rebuild and redeploy

See `CLERK_OAUTH_SETUP.md` for detailed OAuth setup.

## Monitoring

### Health Checks

```bash
# App health
curl http://localhost:3001/api/health

# Database health
docker-compose exec postgres pg_isready -U postgres
```

### Logs

```bash
# Real-time logs
docker-compose logs -f

# App logs only
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Updating

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f app
```

## Backup & Restore

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres formulario_secretaria > backup.sql

# Or with timestamp
docker-compose exec postgres pg_dump -U postgres formulario_secretaria > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres formulario_secretaria < backup.sql
```

## Scaling

### Horizontal Scaling

For high traffic, use a reverse proxy:

```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
  depends_on:
    - app
```

### Database Optimization

For production, consider:
- Enabling connection pooling
- Using managed PostgreSQL (RDS, Supabase, etc.)
- Setting up read replicas

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use secrets management (Vault, AWS Secrets Manager)
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Use environment-specific secrets

## Support

For issues:
1. Check logs: `docker-compose logs app`
2. Verify health: `curl http://localhost:3001/api/health`
3. Check GitHub issues: https://github.com/Coelho1806/form-secretarial/issues
4. Review troubleshooting guide above

## Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP (port 3001)
       │
┌──────▼──────┐
│     App     │
│   (Node.js) │
│   Express   │
└──────┬──────┘
       │
       │ PostgreSQL (port 5432)
       │
┌──────▼──────┐
│  PostgreSQL │
│  Database   │
└─────────────┘
```

The app is designed to work standalone with minimal configuration. OAuth features are optional and can be added later.
