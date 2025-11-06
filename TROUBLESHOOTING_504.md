# Troubleshooting 504 Gateway Timeout

## Quick Diagnosis Commands

Run these on your server to identify the issue:

### 1. Check Container Status
```bash
docker ps -a | grep formulario
```

**Look for:**
- Is the app container running?
- What's the STATUS? (Up, Restarting, Exited?)

### 2. Check Container Logs
```bash
docker logs formulario-app
# or
docker logs app-ucsw0o0co4scco88444s04kw-<timestamp>
```

**Common Issues to Look For:**
- Database connection errors
- Missing environment variables
- Port binding errors
- Crashes on startup

### 3. Check Database Container
```bash
docker logs formulario-postgres
# or
docker logs postgres-ucsw0o0co4scco88444s04kw-<timestamp>
```

### 4. Test Database Connection Inside Container
```bash
docker exec -it formulario-app sh
# Then inside container:
node -e "const { Client } = require('pg'); const client = new Client({connectionString: process.env.DATABASE_URL}); client.connect().then(() => console.log('Connected!')).catch(e => console.error(e));"
```

### 5. Check Network
```bash
docker network inspect ucsw0o0co4scco88444s04kw_app-network
```

## Common Causes & Fixes

### Issue 1: App Container Not Starting
**Symptoms:** Container exits immediately or keeps restarting

**Check:**
```bash
docker logs formulario-app
```

**Possible causes:**
- Missing `dist` folder → Need to rebuild
- Database connection failing → Check DATABASE_URL
- Node modules issues → Rebuild image

**Fix:**
```bash
# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Issue 2: Database Not Ready
**Symptoms:** App starts but can't connect to database

**Check:**
```bash
docker exec -it formulario-postgres psql -U postgres -d formulario_secretaria -c "SELECT 1;"
```

**Fix:**
Add healthcheck wait time or restart app:
```bash
docker-compose restart app
```

### Issue 3: Port Not Exposed
**Symptoms:** Container running but can't access from outside

**Check:**
```bash
docker ps | grep formulario-app
# Look for "0.0.0.0:3001->3001/tcp"
```

**Fix:**
Check if Coolify is properly routing to port 3001

### Issue 4: Environment Variables Missing
**Symptoms:** App starts but endpoints fail

**Check:**
```bash
docker exec formulario-app env | grep DATABASE_URL
```

**Fix:**
Ensure Coolify has these environment variables set:
- `DATABASE_URL`
- `PORT=3001`
- `NODE_ENV=production`

## Coolify-Specific Issues

### Missing Database Configuration
Coolify might not be using the docker-compose.yml database service.

**Solution 1: Use External Database**
In Coolify dashboard:
1. Add a new PostgreSQL database service
2. Get the connection string
3. Set `DATABASE_URL` environment variable in app

**Solution 2: Single Dockerfile Deployment**
Since Coolify might not handle docker-compose well, we can create a standalone Dockerfile that just runs the app and connects to Coolify's managed database.

## Next Steps

1. **Run diagnostics above**
2. **Share the output** of:
   - `docker logs formulario-app` (last 50 lines)
   - `docker ps -a | grep formulario`
   
3. **Quick Fix Attempt:**
```bash
# Force rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f app
```

## Alternative: Use Coolify's Database

If docker-compose isn't working in Coolify, you can:

1. **Remove postgres from docker-compose.yml**
2. **Create a database in Coolify's dashboard**
3. **Use that DATABASE_URL instead**

Would you like me to create a simplified version that works with Coolify's managed services?
