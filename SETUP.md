# 🚀 Smart Tourist Safety Platform - Quick Setup Guide

This guide will help you set up the complete Smart Tourist Safety MVP in under 10 minutes.

## 📋 Prerequisites

- **Node.js** 18+ and **Bun** 1.2+
- **PostgreSQL** with PostGIS extension
- **Redis** server (optional for development)
- **Git** for version control

## 🏃‍♂️ Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd sih2025

# Install all dependencies
bun install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Minimum required variables:**

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/tourist_safety"
JWT_SECRET="your-secret-key-change-this"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.your-mapbox-token"
```

### 3. Database Setup

```bash
# Set up database schema and seed data
bun run setup
```

This will:

- Generate Prisma client
- Push schema to database
- Seed with sample data

### 4. Start Development

```bash
# Start all applications
bun run dev
```

This starts:

- **Tourist Web App**: http://localhost:3000
- **Police Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3333
- **API Docs**: http://localhost:3333/api/docs

## 🔧 Detailed Setup

### Database Setup (PostgreSQL + PostGIS)

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL and PostGIS
sudo apt-get install postgresql postgresql-contrib postgis

# Create database
sudo -u postgres createdb tourist_safety

# Enable PostGIS
sudo -u postgres psql tourist_safety -c "CREATE EXTENSION postgis;"
```

#### Option B: Neon (Recommended for Development)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string to `DATABASE_URL`

### Smart Contracts Setup

```bash
# Navigate to contracts package
cd packages/smart-contracts

# Compile contracts
bun run compile

# Deploy to Polygon Amoy testnet
bun run deploy --network polygonAmoy

# Test deployment
bun run hardhat dtid-stats --contract 0x<deployed-address> --network polygonAmoy
```

### Individual Service Startup

```bash
# Backend API only
bun run api:dev

# Tourist web app only
bun run dev --filter=web

# Police dashboard only
bun run dev --filter=police

# Database operations
bun run db:studio    # Open Prisma Studio
bun run db:generate  # Regenerate Prisma client
bun run db:push      # Push schema changes
```

## 🌍 Environment Configurations

### Development Environment

```env
NODE_ENV="development"
DATABASE_URL="postgresql://localhost:5432/tourist_safety"
REDIS_URL="redis://localhost:6379"
SKIP_NOTIFICATIONS="true"
MOCK_BLOCKCHAIN="true"
```

### Production Environment

```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@prod-db:5432/tourist_safety?sslmode=require"
REDIS_URL="rediss://default:pass@prod-redis:6380"
HTTPS_ENABLED="true"
RATE_LIMIT_ENABLED="true"
```

## 📱 Testing the MVP

### 1. Create Digital Tourist ID

```bash
# Using API directly
curl -X POST http://localhost:3333/api/v1/dtid/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "touristId": "user-id",
    "profile": {
      "name": "John Doe",
      "nationality": "USA",
      "documentType": "passport",
      "documentRef": "****1234"
    }
  }'
```

### 2. Test Panic Alert

```bash
# Send panic alert
curl -X POST http://localhost:3333/api/v1/alert/panic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "latitude": 28.6139,
    "longitude": 77.2090,
    "message": "Emergency assistance needed"
  }'
```

### 3. View Live Dashboard

1. Open http://localhost:3001 (Police Dashboard)
2. Login with: `officer@police.gov`
3. View live alerts and tourist locations

## 🚨 Common Issues & Solutions

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep tourist_safety

# Reset database if needed
bun run db:reset
```

### Port Already in Use

```bash
# Find process using port 3333
lsof -i :3333

# Kill process
kill -9 <PID>

# Or use different port
PORT=3334 bun run api:dev
```

### Prisma Issues

```bash
# Regenerate Prisma client
bun run db:generate

# Reset and recreate database
bun run db:reset

# Check schema syntax
npx prisma validate
```

### Smart Contract Issues

```bash
# Check network configuration
cd packages/smart-contracts
bun run hardhat network

# Verify contract deployment
bun run hardhat verify --network polygonAmoy <contract-address>
```

## 🔒 Security Setup

### Production Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging
- [ ] Regular security updates

### Environment Security

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Monitoring & Debugging

### Health Checks

```bash
# API health
curl http://localhost:3333/api/v1/health

# Database connection
bun run db:studio

# Redis connection (if using)
redis-cli ping
```

### Logs

```bash
# API logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Real-time logs with Docker
docker-compose logs -f api
```

### Performance Monitoring

```bash
# Database query performance
npx prisma studio

# API response times
curl -w "@curl-format.txt" http://localhost:3333/api/v1/ping/batch

# Memory usage
node --inspect packages/api/dist/main.js
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build all services
docker-compose build

# Start production stack
docker-compose up -d

# Check service status
docker-compose ps
```

### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy tourist web app
cd apps/web && vercel

# Deploy police dashboard
cd apps/police && vercel
```

### Railway/Render Deployment (Backend)

1. Connect GitHub repository
2. Set environment variables
3. Deploy from `packages/api`
4. Configure custom domain

## 🤝 Development Workflow

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Develop and test locally
3. Update database schema if needed: `bun run db:migrate`
4. Add tests: `bun run test`
5. Create pull request

### Database Changes

```bash
# Create migration
bun run db:migrate --name add_new_table

# Apply migration
bun run db:migrate

# Reset if needed
bun run db:reset
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js)

## 🆘 Getting Help

- **Issues**: Create GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `/docs` folder for detailed guides
- **API Reference**: http://localhost:3333/api/docs

---

**🎉 You're all set! The Smart Tourist Safety Platform should now be running locally.**
