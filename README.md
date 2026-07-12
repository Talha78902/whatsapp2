# Talha WhatsApp Business Platform

A production-ready WhatsApp Business Platform built with NestJS, React 19, PostgreSQL, and Redis.

## Features

- Customer management (CRUD, import/export)
- WhatsApp campaign creation and scheduling
- Real-time conversation management
- AI-powered customer support with OpenAI
- Message templates
- Analytics dashboard with charts
- Knowledge base
- JWT authentication with refresh tokens
- Dark/Light theme
- Swagger API documentation
- Docker containerization

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Recharts
- **Backend:** NestJS, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Cache:** Redis (BullMQ)
- **AI:** OpenAI API
- **Infrastructure:** Docker, Nginx, PM2

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### Local Development

1. Clone and install dependencies:

```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

2. Set up environment variables:

```bash
cp backend/.env.example backend/.env
```

3. Run database migrations:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts
```

4. Start development servers:

Terminal 1 (Backend):
```bash
cd backend && npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend && npm run dev
```

5. Open http://localhost:5173 and login with:
   - Email: `admin@talha.com`
   - Password: `admin123`

### Docker Deployment

```bash
docker compose up -d
```

### API Documentation

Swagger docs available at http://localhost:3000/api/docs

## Project Structure

```
├── backend/          # NestJS API
│   ├── prisma/       # Database schema & migrations
│   └── src/
│       ├── auth/     # Authentication
│       ├── users/    # User management
│       ├── customers/ # Customer management
│       ├── campaigns/ # Campaign management
│       ├── conversations/ # Conversations
│       ├── messages/  # Messages
│       ├── templates/ # Message templates
│       ├── whatsapp/  # WhatsApp API integration
│       ├── ai/        # AI & Knowledge base
│       ├── analytics/ # Analytics
│       ├── settings/  # Settings
│       ├── logs/      # Audit logs
│       ├── dashboard/ # Dashboard stats
│       └── common/    # Shared utilities
├── frontend/         # React SPA
│   └── src/
│       ├── api/      # API client
│       ├── components/ # Reusable components
│       ├── contexts/  # Auth & Theme
│       ├── pages/     # Page components
│       ├── types/     # TypeScript types
│       └── styles/    # CSS
├── infrastructure/   # Docker, Nginx, PM2
└── docs/             # Documentation
```
