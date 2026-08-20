# ListNG — Nigerian E-Commerce Marketplace

> Buy and sell anything in your local market. Powered by Next.js 16, Neon PostgreSQL, and Paystack.

## Overview

ListNG is a marketplace platform connecting Nigerian buyers and sellers across physical markets. Key features:

- **Browse by market** — Explore listings by Nigerian state, city, and market
- **Verified vendors** — CAC and face verification for trusted sellers
- **Subscriptions** — Free, Trader Plus, Market Pro, Distributor VIP plans
- **Real-time messaging** — Instant chat between buyers and sellers via Pusher
- **Payment processing** — Paystack integration for subscription payments
- **Admin dashboard** — Content moderation, user management, package management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Database | PostgreSQL (Neon.tech serverless) |
| ORM | Prisma 7 |
| Auth | Better Auth |
| Payments | Paystack |
| Real-time | Pusher |
| File uploads | UploadThing |
| Email | Resend |
| Identity | Prembly/Dojah (CAC), face-api.js |
| Rate limiting | Upstash Redis |
| Monitoring | Sentry |
| Styling | Tailwind CSS v4 + Radix UI |
| Validation | Zod v4 |
| Forms | React Hook Form |

## Prerequisites

- Node.js 20+
- Docker (for local Postgres + Redis via `compose.yaml`)
- Account credentials for: Neon, Paystack, Pusher, UploadThing, Resend, Prembly, Upstash, Sentry

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd ecom_listing
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all required values (see .env.example comments)
```

### 3. Download face-api.js model weights

```bash
chmod +x scripts/download-face-models.sh
./scripts/download-face-models.sh
```

### 4. Database setup (local development)

```bash
# Start Postgres + Redis + Mailhog
docker compose up -d

# Push Prisma schema
npm run db:push

# Seed the database (Nigerian states, cities, markets, categories, packages)
npm run db:seed

# Or with Docker:
docker compose exec postgres psql -U listng -d listng_dev < prisma/seed.sql
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format all files with Prettier
npm run format:check # Check formatting
npm run typecheck    # TypeScript type check
npm run test         # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:e2e:ui  # Run E2E tests with UI
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema (dev)
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
docker build -t listng .
docker run -p 3000:3000 --env-file .env.production listng
```

### Cron jobs (Vercel)

Add to `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/sweep", "schedule": "0 * * * *" },
    { "path": "/api/cron/notify-expiring", "schedule": "0 8 * * *" }
  ]
}
```

## Project Structure

```
app/
├── (main)/              # Public pages (home, search, listings, markets, messages)
├── (auth)/             # Auth pages (login, register)
├── (dashboard)/         # User dashboard
├── (admin)/admin/       # Admin dashboard
├── api/                # API routes
│   ├── auth/           # Better Auth
│   ├── listings/       # CRUD
│   ├── payments/       # Paystack
│   ├── conversations/  # Messaging
│   ├── cron/           # Scheduled jobs
│   └── health|ready    # Health checks
components/
├── layout/             # Header, Footer, MobileBottomNav
├── listings/           # ListingCard, ListingGrid, CreateListingWizard
├── auth/               # SignOutButton, FaceCapture
├── home/               # HeroSearch, CategoryGrid, MarketPicker
└── admin/              # Admin CRUD components
lib/
├── auth.ts             # Better Auth config
├── db.ts               # Prisma singleton
├── payments.ts         # Paystack helpers
├── rate-limit.ts       # Upstash rate limiter
├── logger.ts           # Structured JSON logger
├── moderation.ts        # Content moderation
├── image-validation.ts # Image safety checks
├── csrf.ts             # Origin/CSRF checks
├── pusher.ts           # Pusher client
├── pusher-server.ts    # Pusher server
├── risk-engine.ts      # Login risk scoring
├── cac-verification.ts # Prembly/Dojah CAC API
├── nigeria-data.ts     # Nigerian location + category seed data
└── schemas/            # Shared Zod schemas
```

## API Routes

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/auth/[...all]` | * | — | Better Auth |
| `/api/listings` | GET, POST | Session | List / create listings |
| `/api/listings/[id]` | PATCH, DELETE | Owner/Admin | Update / delete |
| `/api/payments/initialize` | POST | Session | Start Paystack payment |
| `/api/payments/verify` | GET | — | Paystack callback |
| `/api/payments/webhook` | POST | Signature | Payment confirmation |
| `/api/conversations` | GET, POST | Session | List / create threads |
| `/api/messages` | POST | Session | Send message |
| `/api/cron/sweep` | GET | Secret | Expire subscriptions/listings |
| `/api/account/export` | GET | Session | GDPR data export |
| `/api/account/delete` | DELETE | Session | GDPR account deletion |
| `/api/health` | GET | — | Liveness check |
| `/api/ready` | GET | — | Readiness check (DB + Redis) |

## Subscription Plans

| Plan | Price | Max Listings | Auto-boost |
|------|-------|-------------|-----------|
| Free Starter | Free | 5 | Weekly |
| Trader Plus | ₦9,500/mo | 35 | Daily |
| Market Pro | ₦29,000/mo | 150 | 4× Daily |
| Distributor VIP | ₦79,000/mo | 1,000 | 2hr cycle |

## Contributing

1. Fork and branch (`git checkout -b feature/your-feature`)
2. Install dependencies: `npm install`
3. Run: `npm run dev`
4. Write tests: `npm run test`
5. Format: `npm run format`
6. Commit (Husky enforces lint + typecheck pre-commit)
7. Open a Pull Request

## License

Private / All rights reserved.
