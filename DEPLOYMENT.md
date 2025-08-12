# FinScoreX - Deployment Guide

This guide explains how to deploy FinScoreX to various platforms after removing Replit dependencies.

## What Was Removed from Replit Version

- ✅ Replit Auth (replaced with JWT authentication)
- ✅ Replit-specific Vite plugins
- ✅ OpenID Connect dependencies
- ✅ Passport.js (simplified to JWT-only)
- ✅ Replit environment variables
- ✅ Session store dependencies (simplified)

## Deployment Options

### 1. Vercel (Recommended for Frontend + Serverless)

1. **Fork/Clone to GitHub**
2. **Connect to Vercel**
3. **Environment Variables:**
   ```env
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   NODE_ENV=production
   ```
4. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Railway (Full-Stack with Database)

1. **Connect GitHub Repository**
2. **Add PostgreSQL Service**
3. **Set Environment Variables:**
   ```env
   DATABASE_URL=${DATABASE_URL}
   JWT_SECRET=generate-secure-key
   SESSION_SECRET=generate-secure-key
   NODE_ENV=production
   PORT=5000
   ```

### 3. Render (Full-Stack Hosting)

1. **Web Service Configuration:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Environment: Node.js

2. **Database:** Add PostgreSQL service
3. **Environment Variables:** Same as above

### 4. DigitalOcean App Platform

1. **App Spec Configuration:**
   ```yaml
   name: finscorex
   services:
   - name: web
     source_dir: /
     build_command: npm run build
     run_command: npm run start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
   databases:
   - name: finscorex-db
     engine: PG
     version: "14"
   ```

### 5. Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

USER node

CMD ["npm", "run", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/finscorex
      - JWT_SECRET=your-jwt-secret
      - SESSION_SECRET=your-session-secret
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=finscorex
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 6. VPS/Cloud Server (Ubuntu)

1. **Server Setup:**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Application Setup:**
   ```bash
   git clone https://github.com/yourusername/finscorex.git
   cd finscorex
   npm install
   npm run build
   ```

3. **Database Setup:**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE finscorex;
   CREATE USER finscorex_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE finscorex TO finscorex_user;
   ```

4. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Start with PM2:**
   ```bash
   pm2 start npm --name finscorex -- run start
   pm2 save
   pm2 startup
   ```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | ✅ | `your-super-secret-jwt-key` |
| `SESSION_SECRET` | Secret for sessions | ✅ | `your-session-secret` |
| `NODE_ENV` | Environment mode | ✅ | `production` |
| `PORT` | Server port | ❌ | `5000` |

## Database Migration

Before first deployment, run:
```bash
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

## Security Checklist

- ✅ Use strong, unique secrets for JWT and sessions
- ✅ Enable HTTPS in production
- ✅ Set up proper CORS configuration
- ✅ Use environment variables for all secrets
- ✅ Enable PostgreSQL SSL in production
- ✅ Set up proper firewall rules
- ✅ Regular security updates

## Performance Optimizations

1. **Enable Gzip compression**
2. **Use a CDN for static assets**
3. **Set up database connection pooling**
4. **Implement Redis for session storage** (optional)
5. **Enable database query optimization**

## Monitoring & Logs

Consider adding:
- **Error tracking** (Sentry, Bugsnag)
- **Performance monitoring** (New Relic, DataDog)
- **Uptime monitoring** (Pingdom, UptimeRobot)
- **Log aggregation** (LogRocket, Papertrail)

## Backup Strategy

1. **Database backups** (daily automated)
2. **Code repository** (GitHub/GitLab)
3. **Environment configuration** (secure vault)
4. **SSL certificates** (Let's Encrypt auto-renewal)

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall rules

2. **Authentication errors:**
   - Verify JWT_SECRET is set
   - Check session configuration
   - Validate user table exists

3. **Build errors:**
   - Ensure Node.js version is 18+
   - Check package.json dependencies
   - Verify TypeScript compilation

### Health Check Endpoint

The application includes a health check at `/api/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Review the troubleshooting section
5. Create an issue on GitHub if needed