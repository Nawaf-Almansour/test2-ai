# Production Deployment Guide

## Overview

This guide covers deploying the School Platform to production using Docker and Docker Compose with Nginx as a reverse proxy.

## Architecture

```
Internet → Nginx (Port 80/443) → React Frontend (Port 8080)
                                    ↘ NestJS API (Port 3001) → MongoDB (Port 27017)
```

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Linux server with at least 2GB RAM and 10GB storage
- Domain name (optional, for SSL setup)
- SSL certificates (if using HTTPS)

## Quick Start

### 1. Prepare Environment

```bash
# Clone the repository
git clone <repository-url>
cd school-platform

# Create production environment file
cp .env.production .env

# Edit .env with your production values
nano .env
```

### 2. Configure Production Values

Update these values in `.env`:

```bash
# REQUIRED: Secure MongoDB password
MONGODB_PASSWORD=your-secure-mongodb-password-here

# REQUIRED: Update MONGODB_URI with your password
MONGODB_URI=mongodb://admin:your-secure-mongodb-password-here@mongodb:27017/school-platform?authSource=admin

# REQUIRED: Your domain
FRONTEND_URL=https://your-domain.com

# SECURITY: Generate secure secrets
JWT_SECRET=your-super-secure-jwt-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 3. Deploy

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Verify Deployment

```bash
# Check health endpoints
curl http://localhost/health
curl http://localhost/api/v1/health

# Test the application
curl http://localhost/
curl http://localhost/api/v1/health
```

## Services

### Nginx (Reverse Proxy)
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Purpose**: Routes traffic to frontend and backend
- **Config**: `nginx/nginx.conf`, `nginx/conf.d/default.conf`

### Frontend (React SPA)
- **Port**: 8080 (internal)
- **Purpose**: Serves the React application
- **Build**: Multi-stage Docker with Nginx serving static files

### Backend (NestJS API)
- **Port**: 3001 (internal)
- **Purpose**: API server for registration requests
- **Health**: `/api/v1/health`

### MongoDB
- **Port**: 27017 (internal)
- **Purpose**: Database for registration requests
- **Persistence**: Docker volume `mongodb_data`

## Security Features

### Container Security
- ✅ Non-root users in all containers
- ✅ Multi-stage builds (minimal production images)
- ✅ Fixed image versions
- ✅ Health checks and restart policies
- ✅ No secrets in images

### Application Security
- ✅ Rate limiting (5 requests/minute for registration)
- ✅ Security headers (CORS, CSP, XSS protection)
- ✅ Input validation and sanitization
- ✅ Environment-based configuration
- ✅ No development dependencies in production

### Network Security
- ✅ Internal services not exposed to internet
- ✅ Custom network subnet
- ✅ Nginx as single entry point

## SSL/HTTPS Setup

### With Let's Encrypt

```bash
# Install certbot
sudo apt update && sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Update Nginx for HTTPS

Add to `nginx/conf.d/default.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # ... rest of your configuration
}
```

## Monitoring and Maintenance

### Health Checks

All services have health checks:

```bash
# Check individual services
docker-compose -f docker-compose.prod.yml exec nginx curl -f http://localhost/health
docker-compose -f docker-compose.prod.yml exec backend curl -f http://localhost:3001/api/v1/health
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Follow logs
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Updates

```bash
# Pull latest code
git pull origin team/school-platform

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backups

```bash
# Backup MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --out /backup

# Backup to host
docker cp school-platform-mongodb:/backup ./backup-$(date +%Y%m%d)
```

## Environment Variables Reference

| Variable | Required | Description | Production Value |
|----------|----------|-------------|------------------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Yes | Backend port | `3001` |
| `MONGODB_URI` | Yes | MongoDB connection string | Custom |
| `FRONTEND_URL` | Yes | Frontend domain | `https://your-domain.com` |
| `THROTTLER_TTL` | No | Rate limit TTL (ms) | `600000` |
| `THROTTLER_LIMIT` | No | Rate limit count | `10` |
| `SWAGGER_ENABLED` | No | Enable API docs | `false` |
| `JWT_SECRET` | Yes | JWT signing secret | Secure random string |
| `MONGODB_PASSWORD` | Yes | MongoDB password | Secure random string |

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs service-name
   
   # Check environment variables
   docker-compose -f docker-compose.prod.yml config
   ```

2. **Database connection failed**
   - Verify MongoDB password in `.env`
   - Check MongoDB container health
   - Ensure network connectivity

3. **Frontend not loading**
   - Check Nginx configuration
   - Verify frontend build completed
   - Check upstream server connectivity

4. **API requests failing**
   - Verify backend health endpoint
   - Check rate limiting configuration
   - Review Nginx proxy settings

### Performance Optimization

1. **Enable HTTP/2** in Nginx
2. **Configure CDN** for static assets
3. **Enable Redis** for caching
4. **Monitor resource usage** with `docker stats`

## Production Checklist

- [ ] Secure passwords and secrets in `.env`
- [ ] SSL certificates installed and configured
- [ ] Firewall rules configured (only ports 80/443 exposed)
- [ ] Database backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Log rotation configured
- [ ] Security scanning completed
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

## Support

For deployment issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify health checks: `curl http://localhost/health`
3. Review this troubleshooting section
4. Check the project documentation

## Security Notes

- Never commit `.env` files to version control
- Regularly update Docker images
- Monitor security advisories
- Implement intrusion detection
- Use secrets management for production secrets
- Enable audit logging for sensitive operations