# 🛡️ Smart Tourist Safety Platform

**A comprehensive real-time safety platform for tourists and law enforcement built for Smart India Hackathon 2025**

## 🌟 Overview

The Smart Tourist Safety Platform is a complete ecosystem designed to enhance tourist safety through real-time monitoring, emergency response, and seamless communication between tourists and law enforcement agencies.

### 🎯 Key Features

- **🆔 Digital Tourist ID**: QR code-based identification system
- **🚨 Panic Button**: One-touch emergency alerts with real-time location
- **👮 Police Dashboard**: Live monitoring and response interface
- **📱 Mobile App**: Background location tracking and offline emergency features
- **🌍 Multi-language Support**: 10+ languages with full internationalization
- **🗺️ Real-time Mapping**: Live tourist locations and incident tracking
- **⚡ WebSocket Integration**: Real-time updates and notifications

## 🏗️ Architecture

### Frontend Applications

| Application          | Port | Purpose                   | Status         |
| -------------------- | ---- | ------------------------- | -------------- |
| **Tourist Web App**  | 3000 | Tourist-facing interface  | ✅ Complete    |
| **Police Dashboard** | 3001 | Law enforcement interface | ✅ Complete    |
| **Mobile App**       | -    | Expo React Native app     | 🔄 In Progress |

### Backend Services

| Service              | Port | Purpose                 | Status          |
| -------------------- | ---- | ----------------------- | --------------- |
| **NestJS API**       | 3333 | RESTful API server      | 🔄 In Progress  |
| **WebSocket Server** | 3334 | Real-time communication | ⏳ Planned      |
| **Database**         | 5432 | PostgreSQL + PostGIS    | ✅ Schema Ready |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Bun** 1.2+ (package manager)
- **PostgreSQL** with PostGIS extension
- **Redis** (for caching and queues)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sih2025

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
bun run db:push
bun run db:seed
```

### Development

```bash
# Start all applications in development mode
bun run dev

# Or start individual applications:
bun run dev --filter=web     # Tourist frontend (port 3000)
bun run dev --filter=police  # Police dashboard (port 3001)
bun run dev --filter=backend # NestJS API (port 3333)
```

### Database Commands

```bash
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
bun run db:migrate   # Run migrations
bun run db:seed      # Seed initial data
bun run db:studio    # Open Prisma Studio
```

## 📋 MVP Feature Status

### ✅ Completed Features

#### Tourist Frontend (Port 3000)

- [x] Digital ID generation with QR codes
- [x] Emergency contacts management
- [x] Panic button with location sharing
- [x] Multi-language support (10+ languages)
- [x] Profile management
- [x] Responsive design with Tailwind CSS

#### Police Dashboard (Port 3001)

- [x] Real-time alerts panel
- [x] Interactive map with Mapbox integration
- [x] Alert severity indicators
- [x] Officer dashboard with statistics
- [x] Responsive layout for all devices

#### Database Schema

- [x] User management (tourists and police)
- [x] Geospatial location tracking
- [x] Alert system with severity levels
- [x] Emergency contacts and safety tips
- [x] PostGIS integration for location queries

### 🔄 In Progress

#### Backend API (Port 3333)

- [ ] JWT authentication system
- [ ] RESTful API endpoints
- [ ] WebSocket server for real-time updates
- [ ] Alert processing and notifications
- [ ] File upload handling

#### Mobile App

- [ ] Expo React Native setup
- [ ] Background location tracking
- [ ] Push notifications
- [ ] Offline emergency features

### ⏳ Planned Features

- [ ] Advanced analytics dashboard
- [ ] Incident reporting system
- [ ] Route sharing and tracking
- [ ] Emergency services integration
- [ ] Multi-tenant support

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **next-intl** - Internationalization
- **React Query** - Data fetching and caching
- **ShadCN UI** - Modern component library

### Backend

- **NestJS** - Enterprise Node.js framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **PostGIS** - Geospatial database extension
- **Redis** - Caching and session storage
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens

### Mobile

- **Expo** - React Native development platform
- **React Native** - Cross-platform mobile development
- **Expo Location** - Background location tracking
- **Expo Notifications** - Push notifications

### DevOps

- **Turborepo** - Monorepo build system
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Frontend deployment

## 🌍 Environment Configuration

Key environment variables needed:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Authentication
JWT_SECRET="your-secret-key"

# Map Services
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:3333/api"
NEXT_PUBLIC_WS_URL="ws://localhost:3334"

# Redis
REDIS_URL="redis://localhost:6379"
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API abuse prevention
- **CORS Protection** - Cross-origin security
- **Input Validation** - Data sanitization
- **Encrypted Storage** - Sensitive data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🏆 Team

Built with ❤️ for Smart India Hackathon 2025

---

**Live Demo**:

- Tourist App: http://localhost:3000
- Police Dashboard: http://localhost:3001
- API Documentation: http://localhost:3333/api/docs
