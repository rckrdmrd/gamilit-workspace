# DEPLOYMENT - GAMILIT Platform

**Version:** 1.0.0 | **Fecha:** 2026-02-10 | **Servidor:** 74.208.126.102

---

## 1. Architecture Overview

```
                     INTERNET
                        |
                   [ DNS: gamilit.com ]
                        |
              +---------+---------+
              |  74.208.126.102   |
              |   (gamilit-prod)  |
              +-------------------+
              |      NGINX        |
              |  :80 -> :443 redirect
              |  :443 SSL termination
              +--------+----------+
                       |
          +------------+------------+
          |                         |
  gamilit.com              api.gamilit.com
  www.gamilit.com
  app.gamilit.com
          |                         |
  +-------+-------+     +----------+----------+
  | Static Files   |     | Reverse Proxy       |
  | /var/www/       |     | -> localhost:3006    |
  | gamilit/        |     +----------+----------+
  | frontend/dist   |                |
  +-----------------+     +----------+----------+
                          | PM2 Cluster (x2)    |
                          | gamilit-backend     |
                          | NestJS :3006        |
                          +----------+----------+
                                     |
                    +----------------+----------------+
                    |                                 |
           +--------+--------+             +---------+---------+
           | PostgreSQL 16    |             | Redis 7           |
           | :5432            |             | :6379 (DB 0)      |
           | gamilit_platform |             | Cache + Sessions  |
           +-----------------+             +-------------------+
```

**Key difference from other ISEM projects:** Gamilit uses PM2 for process management on a dedicated server. Other projects (erp-core, trading-platform) on the 72.60.226.4 server use Jenkins for CI/CD. Gamilit does not use Jenkins.

---

## 2. Server Details

| Property | Value |
|----------|-------|
| IP | 74.208.126.102 |
| Hostname | gamilit-prod |
| Deploy user | deploy |
| PM2 home | /home/deploy/.pm2 |
| App root | /var/www/gamilit |
| Log path | /var/log/pm2 |
| OS | Ubuntu (systemd) |
| Repository | git@github.com:rckrdmrd/gamilit-workspace.git |
| Branch | main |

### Domains

| Domain | Target |
|--------|--------|
| gamilit.com | Frontend (static files) |
| www.gamilit.com | Frontend (static files) |
| app.gamilit.com | Frontend (static files) |
| api.gamilit.com | Backend API (reverse proxy to :3006) |

---

## 3. PM2 Configuration

PM2 manages two process groups defined in `ecosystem.config.js` at the project root.

### Backend Process (gamilit-backend)

| Setting | Value |
|---------|-------|
| Name | gamilit-backend |
| Script | dist/main.js |
| Working dir | ./apps/backend |
| Instances | 2 (cluster mode) |
| Exec mode | cluster |
| Port | 3006 |
| Max memory | 1G per instance |
| Node args | -r tsconfig-paths/register |
| Log (out) | ../../logs/backend-out.log |
| Log (err) | ../../logs/backend-error.log |
| Min uptime | 10s |
| Max restarts | 10 |
| Kill timeout | 5000ms |
| Wait ready | true (listen_timeout: 10s) |

### Frontend Process (gamilit-frontend)

| Setting | Value |
|---------|-------|
| Name | gamilit-frontend |
| Script | npx vite preview --port 3005 --host 0.0.0.0 |
| Working dir | ./apps/frontend |
| Instances | 1 (fork mode) |
| Exec mode | fork |
| Port | 3005 |
| Max memory | 512M |
| Log (out) | ../../logs/frontend-out.log |
| Log (err) | ../../logs/frontend-error.log |
| Min uptime | 10s |
| Max restarts | 10 |

**Note:** In production, Nginx serves the frontend static files directly from `/var/www/gamilit/frontend/dist`. The PM2 frontend process (`vite preview`) is a fallback / development convenience. For maximum performance, configure Nginx to serve the `dist/` directory and only use PM2 for the backend.

### ecosystem.config.js Location

```
gamilit/
  ecosystem.config.js   <-- PM2 config (project root)
  apps/
    backend/
      dist/main.js      <-- Backend entry point (after build)
    frontend/
      dist/              <-- Frontend static files (after build)
  logs/                  <-- PM2 logs directory
```

---

## 4. Nginx + HTTPS Setup

### SSL Certificates

| Property | Value |
|----------|-------|
| Provider | Let's Encrypt (Certbot) |
| Domain | gamilit.com + *.gamilit.com |
| Method | HTTP-01 challenge |
| Cert path | /etc/letsencrypt/live/gamilit.com/fullchain.pem |
| Key path | /etc/letsencrypt/live/gamilit.com/privkey.pem |
| Auto-renew | Yes (cron: `0 0,12 * * *`) |
| Webroot | /var/www/certbot |

### Nginx Configuration

The production nginx.conf is maintained in `infra/services/nginx/templates/prod/nginx.conf`. Key settings:

**SSL:**
- TLS 1.2 and 1.3 only
- ECDHE ciphers with forward secrecy
- SSL session cache (50MB, 1 day timeout)
- OCSP stapling enabled

**Security headers:**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Server token hidden

**Rate limiting:**
- API: 30 requests/second per IP (`api_limit`)
- Login: 5 requests/minute per IP (`login_limit`)

**HTTP to HTTPS redirect:**
- Port 80 default server redirects all traffic to HTTPS (301)
- ACME challenge path exempted for certificate renewal

### Virtual Host Layout

```nginx
# /etc/nginx/sites-available/gamilit.com

# Frontend: gamilit.com, www.gamilit.com, app.gamilit.com
server {
    listen 443 ssl http2;
    server_name gamilit.com www.gamilit.com app.gamilit.com;

    ssl_certificate     /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;

    root /var/www/gamilit/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API: api.gamilit.com
server {
    listen 443 ssl http2;
    server_name api.gamilit.com;

    ssl_certificate     /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api_limit burst=50 nodelay;
    }

    # Login endpoint stricter rate limit
    location /api/v1/auth/login {
        proxy_pass http://localhost:3006;
        limit_req zone=login_limit burst=3 nodelay;
    }
}
```

### Certificate Operations

```bash
# Issue certificate (first time)
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d gamilit.com \
  -d www.gamilit.com \
  -d app.gamilit.com \
  -d api.gamilit.com \
  --email admin@gamilit.com

# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# List certificates
sudo certbot certificates
```

---

## 5. Environment Variables Reference

Create `.env.production` in `apps/backend/`:

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | production |
| PORT | Backend port | 3006 |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_NAME | Database name | gamilit_platform |
| DATABASE_USER | DB user | gamilit_user |
| DATABASE_PASSWORD | DB password | (secret) |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| REDIS_DB | Redis database index | 0 |
| JWT_SECRET | JWT signing secret | (secret, min 32 chars) |
| JWT_EXPIRATION | Access token TTL | 15m |
| REFRESH_TOKEN_EXPIRATION | Refresh token TTL | 7d |
| CORS_ORIGINS | Allowed origins | https://gamilit.com,https://app.gamilit.com |
| SMTP_HOST | Email server | smtp.provider.com |
| SMTP_PORT | Email port | 587 |

Frontend environment is embedded at build time via Vite. Key variables in `apps/frontend/.env.production`:

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_ENV | Environment flag | production |
| VITE_API_URL | Backend API base URL | https://api.gamilit.com |

---

## 6. Common Operations

### 6.1 Full Production Deploy

```bash
# SSH into server
ssh deploy@74.208.126.102

# Navigate to project
cd /var/www/gamilit

# Pull latest code
git fetch origin && git pull origin main

# Install dependencies
cd apps/backend && npm ci --production=false
cd ../frontend && npm ci
cd ../..

# Build
cd apps/backend && npm run build
cd ../frontend && npm run build
cd ../..

# Reload PM2 (zero-downtime for cluster)
pm2 reload ecosystem.config.js --env production
pm2 save
```

Or use the automated script:

```bash
# From server, in the project root
./apps/devops/scripts/deploy-production.sh --env prod

# Dry run first
./apps/devops/scripts/deploy-production.sh --env prod --dry-run
```

The automated script performs: prerequisites check, tests, backup, build, PM2 deploy, health checks, and automatic rollback on failure.

### 6.2 PM2 Process Management

```bash
# Start all processes
pm2 start ecosystem.config.js --env production

# Start only backend
pm2 start ecosystem.config.js --only gamilit-backend --env production

# Reload (zero-downtime for cluster mode)
pm2 reload ecosystem.config.js --env production

# Restart (with downtime)
pm2 restart all

# Stop all
pm2 stop all

# Delete all processes
pm2 delete all

# Save current process list (survives reboot)
pm2 save

# Configure auto-start on boot
pm2 startup
pm2 save
```

### 6.3 Viewing Logs

```bash
# All logs in real-time
pm2 logs

# Backend only
pm2 logs gamilit-backend

# Frontend only
pm2 logs gamilit-frontend

# Last 200 lines
pm2 logs gamilit-backend --lines 200

# Clear all log files
pm2 flush

# Log files on disk
tail -f logs/backend-out.log
tail -f logs/backend-error.log
```

### 6.4 Monitoring

```bash
# Interactive dashboard
pm2 monit

# Process list with status
pm2 status

# Detailed info about a process
pm2 describe gamilit-backend

# Health check (from server)
curl -s http://localhost:3006/api/health
curl -s http://localhost:3006/api/v1/docs   # Swagger docs

# Health check (external)
curl -s https://api.gamilit.com/health
```

### 6.5 Database Operations

```bash
# Connect to database
psql -U gamilit_user -d gamilit_platform -h localhost -p 5432

# Full backup
pg_dump -U gamilit_user -h localhost gamilit_platform > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U gamilit_user -h localhost gamilit_platform < backup.sql

# Backup critical data only (users, progress, gamification)
./apps/devops/scripts/backup-production-data.sh --env prod

# List existing backups
./apps/devops/scripts/backup-production-data.sh --list

# Restore from backup archive
./apps/devops/scripts/backup-production-data.sh --restore backup_20260210_120000.tar.gz --env prod
```

### 6.6 Rollback

```bash
# Rollback via deploy script
./apps/devops/scripts/deploy-production.sh --rollback apps/devops/backups/backup_20260210_120000.tar.gz

# Manual rollback: revert to previous commit
git log --oneline -5          # find the commit to revert to
git checkout <commit-hash>
cd apps/backend && npm ci --production=false && npm run build
cd ../frontend && npm ci && npm run build
cd ../..
pm2 reload ecosystem.config.js --env production
pm2 save
```

### 6.7 Nginx Operations

```bash
# Test configuration
sudo nginx -t

# Reload (apply config changes without downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log
```

---

## 7. Differences from Other ISEM Projects

| Aspect | Gamilit | Other ISEM Projects |
|--------|---------|---------------------|
| **Server** | 74.208.126.102 (dedicated) | 72.60.226.4 (shared) |
| **Process Manager** | PM2 | Jenkins CI/CD pipelines |
| **Deploy Method** | `pm2 reload` / deploy scripts | Jenkins pipeline triggers |
| **Source Control** | GitHub (github.com/rckrdmrd) | Gitea (git.isem.dev) |
| **SSL** | Let's Encrypt for gamilit.com | Let's Encrypt wildcard for *.isem.dev |
| **Architecture** | Standalone monorepo | Inherited from template-saas/erp-core |
| **Backend Cluster** | 2 instances via PM2 cluster | Varies per project |
| **Frontend Serving** | Nginx static / PM2 vite preview | Nginx reverse proxy |

### Why PM2 instead of Jenkins?

Gamilit runs on a dedicated server separate from the main ISEM infrastructure. PM2 provides:
- Direct process management without CI/CD overhead
- Built-in cluster mode for Node.js (zero-downtime reloads)
- Process monitoring, auto-restart, and log management
- Simpler setup for a single-project server

Jenkins is used on the shared server (72.60.226.4) where multiple projects need coordinated CI/CD pipelines, build queues, and integration with Gitea.

---

## Quick Reference Card

```
SSH:        ssh deploy@74.208.126.102
App root:   /var/www/gamilit
Logs:       /var/log/pm2/ or /var/www/gamilit/logs/

Backend:    localhost:3006  ->  https://api.gamilit.com
Frontend:   localhost:3005  ->  https://gamilit.com
PostgreSQL: localhost:5432  ->  gamilit_platform
Redis:      localhost:6379  ->  DB 0

Deploy:     git pull && npm ci && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save
Status:     pm2 status
Logs:       pm2 logs
Monitor:    pm2 monit
Health:     curl https://api.gamilit.com/health
```

---

*GAMILIT Platform - Deployment Documentation v1.0.0*
*Source configs: ecosystem.config.js, infra/services/nginx/, infra/services/pm2/, infra/services/certbot/*
