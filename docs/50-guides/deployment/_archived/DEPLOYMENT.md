---
titulo: Deployment Guide
tipo: guia
dominio: deployment
ultima_actualizacion: 2026-02-27
---

# Deployment Guide

## Production Environment

### Server Information

- **IP:** 74.208.126.102
- **OS:** Linux
- **Process Manager:** PM2
- **Database:** PostgreSQL 15
- **Node.js:** v18+

### Deployed Services

| Service | Port | Instances | Status |
|---------|------|-----------|--------|
| **Backend API** | 3006 | 2 (cluster) | Active |
| **Frontend** | 3005 | 1 | Active |
| **PostgreSQL** | 5432 | 1 | Active |

### URLs

- **Frontend:** http://74.208.126.102:3005
- **Backend API:** http://74.208.126.102:3006/api
- **API Docs (Swagger):** http://74.208.126.102:3006/api/docs

## Prerequisites

### Server Requirements

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ and npm 9+
- PostgreSQL 15+
- PM2 installed globally
- Git

### Development Requirements

- Node.js 18+
- PostgreSQL 15+
- npm 9+

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url> gamilit
cd gamilit
```

### 2. Install Dependencies

```bash
# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gamilit_production;

# Create user
CREATE USER gamilit_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gamilit_production TO gamilit_user;

# Exit psql
\q

# Run DDL scripts
cd apps/database
psql -U gamilit_user -d gamilit_production -f ddl/schemas/auth_management/schema.sql
psql -U gamilit_user -d gamilit_production -f ddl/schemas/student_learning/schema.sql
# ... repeat for all schemas

# Run migrations
cd ../backend
npm run migration:run

# Seed initial data (optional)
npm run seed
```

### 4. Environment Configuration

#### Backend `.env`

```bash
# apps/backend/.env

# Server
NODE_ENV=production
PORT=3006
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_production
DB_USER=gamilit_user
DB_PASSWORD=your_secure_password
DB_SSL=false
DB_LOGGING=false

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://74.208.126.102:3005

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@gamilit.com

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@gamilit.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

#### Frontend `.env`

```bash
# apps/frontend/.env

VITE_API_URL=http://74.208.126.102:3006/api
VITE_WS_URL=ws://74.208.126.102:3006
VITE_APP_NAME=GAMILIT
VITE_APP_VERSION=2.0.0
```

### 5. Build Applications

```bash
# Backend
cd apps/backend
npm run build

# Frontend
cd ../frontend
npm run build
```

## Deployment with PM2

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. PM2 Ecosystem File

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'gamilit-backend',
      script: 'dist/main.js',
      cwd: './apps/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'gamilit-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3005',
      cwd: './apps/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false
    }
  ]
};
```

### 3. Start Services

```bash
# Start all apps
pm2 start ecosystem.config.js

# Or start individually
pm2 start ecosystem.config.js --only gamilit-backend
pm2 start ecosystem.config.js --only gamilit-frontend

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow instructions displayed
```

## PM2 Commands

### Basic Operations

```bash
# View status
pm2 status

# View logs (all apps)
pm2 logs

# View logs (specific app)
pm2 logs gamilit-backend
pm2 logs gamilit-frontend

# Real-time monitoring
pm2 monit

# Restart all
pm2 restart all

# Restart specific app
pm2 restart gamilit-backend

# Stop all
pm2 stop all

# Stop specific app
pm2 stop gamilit-backend

# Delete app from PM2
pm2 delete gamilit-backend

# Reload app (zero-downtime for cluster mode)
pm2 reload gamilit-backend

# Flush logs
pm2 flush
```

### Advanced Monitoring

```bash
# Show app info
pm2 show gamilit-backend

# List processes with details
pm2 list

# Monitor CPU/Memory
pm2 monit

# Generate startup script
pm2 startup

# Save current process list
pm2 save

# Resurrect previously saved processes
pm2 resurrect
```

## Deployment Scripts

### Pre-deployment Check

Create `scripts/pre-deploy-check.sh`:

```bash
#!/bin/bash

echo "🔍 Pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node -v)
echo "✓ Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
echo "✓ npm version: $NPM_VERSION"

# Check PostgreSQL
psql --version
echo "✓ PostgreSQL installed"

# Check PM2
pm2 -v
echo "✓ PM2 installed"

# Check disk space
df -h

echo "✅ Pre-deployment checks complete!"
```

### Build Script

Create `scripts/build-production.sh`:

```bash
#!/bin/bash

echo "🔨 Building for production..."

# Backend
echo "Building backend..."
cd apps/backend
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Backend build failed"
  exit 1
fi
echo "✓ Backend built successfully"

# Frontend
echo "Building frontend..."
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi
echo "✓ Frontend built successfully"

echo "✅ Build complete!"
```

### Deployment Script

Create `scripts/deploy-production.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying to production..."

# Run pre-deployment checks
./scripts/pre-deploy-check.sh

# Build
./scripts/build-production.sh

# Run migrations
echo "Running database migrations..."
cd apps/backend
npm run migration:run
cd ../..

# Reload PM2 apps (zero-downtime)
echo "Reloading PM2 applications..."
pm2 reload ecosystem.config.js

# Save PM2 process list
pm2 save

echo "✅ Deployment complete!"
echo "Frontend: http://74.208.126.102:3005"
echo "Backend: http://74.208.126.102:3006/api"
```

Make scripts executable:

```bash
chmod +x scripts/*.sh
```

## Database Migrations

### Create Migration

```bash
cd apps/backend
npm run migration:create -- -n MigrationName
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Migration

```bash
npm run migration:revert
```

### Show Migrations

```bash
npm run migration:show
```

## Backup & Recovery

### Database Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
pg_dump -U gamilit_user -d gamilit_production -F c -f backups/gamilit_$(date +%Y%m%d_%H%M%S).dump

# Backup with plain SQL
pg_dump -U gamilit_user -d gamilit_production > backups/gamilit_$(date +%Y%m%d_%H%M%S).sql
```

### Automated Backup Script

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="gamilit_production"
DB_USER="gamilit_user"

# Create backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/gamilit_$DATE.dump

# Keep only last 7 days of backups
find $BACKUP_DIR -name "gamilit_*.dump" -mtime +7 -delete

echo "Backup completed: gamilit_$DATE.dump"
```

### Schedule Automatic Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh
```

### Restore Database

```bash
# From custom format
pg_restore -U gamilit_user -d gamilit_production -c backups/gamilit_20251212_020000.dump

# From SQL file
psql -U gamilit_user -d gamilit_production < backups/gamilit_20251212_020000.sql
```

## Docker Deployment (Alternative)

### Dockerfile (Backend)

Create `apps/backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3006

CMD ["node", "dist/main.js"]
```

### Dockerfile (Frontend)

Create `apps/frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3005
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: gamilit_production
      POSTGRES_USER: gamilit_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    ports:
      - "3006:3006"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
    depends_on:
      - postgres

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - "3005:3005"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Docker Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

## SSL/TLS Configuration (Nginx Reverse Proxy)

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Nginx Configuration

Create `/etc/nginx/sites-available/gamilit`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

## Monitoring & Logging

### PM2 Logging

Logs are stored in:
- `apps/backend/logs/backend-error.log`
- `apps/backend/logs/backend-out.log`
- `apps/frontend/logs/frontend-error.log`
- `apps/frontend/logs/frontend-out.log`

### Application Logs

Backend uses Winston for logging. Logs are written to:
- Console (development)
- Files (production): `apps/backend/logs/`

### Log Rotation

Install logrotate:

```bash
sudo apt install logrotate
```

Create `/etc/logrotate.d/gamilit`:

```
/path/to/gamilit/apps/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 username username
}
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs gamilit-backend

# Check if port is in use
sudo lsof -i :3006

# Restart backend
pm2 restart gamilit-backend
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U gamilit_user -d gamilit_production -c "SELECT 1"
```

### High Memory Usage

```bash
# Check PM2 processes
pm2 monit

# Restart with memory limit
pm2 restart gamilit-backend --max-memory-restart 500M
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3006

# Kill process
sudo kill -9 <PID>
```

## Performance Tuning

### PM2 Cluster Mode

Backend runs in cluster mode with 2 instances for better performance and availability.

### Database Optimization

- Create indexes on frequently queried columns
- Use connection pooling (configured in TypeORM)
- Regular VACUUM and ANALYZE

```sql
-- Run maintenance
VACUUM ANALYZE;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Nginx Caching

Add to Nginx config for static assets caching:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall (ufw)
- [ ] Use SSL/TLS certificates
- [ ] Keep dependencies updated
- [ ] Regular security audits (`npm audit`)
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Disable root SSH login

## Rollback Procedure

### 1. Stop Current Version

```bash
pm2 stop all
```

### 2. Restore Previous Code

```bash
git checkout <previous-commit-hash>
```

### 3. Rebuild

```bash
./scripts/build-production.sh
```

### 4. Revert Database

```bash
npm run migration:revert
```

### 5. Restart Services

```bash
pm2 restart all
```

## CI/CD Pipeline (Future)

GitHub Actions workflow example:

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@74.208.126.102 'cd /path/to/gamilit && git pull && ./scripts/deploy-production.sh'
```

## Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Check database: `psql -U gamilit_user -d gamilit_production`
3. Review this documentation
4. Contact DevOps team

## References

- [Deployment Master](../DEPLOYMENT-MASTER.md)
- [API Documentation](../../../40-api/README.md)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
