# ListNG — Remaining Tasks After Production Readiness Audit

> These items were identified in the audit but deferred because they need your decisions, credentials, or are lower priority.

---

## 🔴 Must do before first deployment

### 1. Add all environment variables to `.env.local`

Copy `.env.example` → `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

Required for the app to run:
- [ ] `DATABASE_URL` — Neon PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` — Generate with: `openssl rand -base64 32`
- [ ] `BETTER_AUTH_URL` — `http://localhost:3000` (dev) or your production URL
- [ ] `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`

Recommended (rate limiting, error monitoring):
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — From console.upstash.com
- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` — From sentry.io (creates a Next.js project)
- [ ] `SENTRY_ORG` + `SENTRY_PROJECT` + `SENTRY_AUTH_TOKEN` — For CI uploads

Optional (features won't crash without them):
- [ ] Paystack keys (`PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`)
- [ ] UploadThing keys
- [ ] Pusher keys
- [ ] Resend API key
- [ ] Prembly/Dojah CAC verification keys
- [ ] `CRON_SECRET` — A long random string for cron routes: `openssl rand -hex 32`

### 2. Push the Prisma schema

```bash
npm run db:push
```

Or, if you already have a database:
```bash
npm run db:migrate
```

### 3. Seed the database

```bash
npm run db:seed
```

This creates: 36 Nigerian states, ~45 cities, ~60 markets, 12 categories, 4 subscription packages, 1 admin user.

Admin login: `admin@listng.com.ng` / `AdminPassword123!`

### 4. Download face-api.js model weights (for face verification)

```bash
chmod +x scripts/download-face-models.sh
./scripts/download-face-models.sh
```

### 5. Start the development server

```bash
npm run dev
```

Open http://localhost:3000

---

## 🟠 Do before launch

### 6. Set up Upstash Redis
1. Go to https://console.upstash.com
2. Create a new Redis database
3. Copy `REST URL` and `REST Token`
4. Add to `.env.local` and Vercel env vars

### 7. Set up Sentry
1. Go to https://sentry.io
2. Create a new project → Next.js
3. Copy the DSN into `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
4. For CI uploads, get `SENTRY_AUTH_TOKEN` from Sentry settings

### 8. Set up Vercel Cron jobs
Add `vercel.json` crons to your Vercel project dashboard:
- `/api/cron/sweep` → every hour (`0 * * * *`)
- `/api/cron/notify-expiring` → every day at 8am (`0 8 * * *`)
- Set `CRON_SECRET` env var in Vercel to protect the cron routes

### 9. Set up Vercel environment variables
In your Vercel project Settings → Environment Variables, add all vars from `.env.example`.

### 10. Verify Paystack webhook endpoint
In Paystack dashboard → Settings → Webhooks:
- Add: `https://your-domain.com/api/payments/webhook`
- Use the test mode keys first, then switch to live keys

### 11. Set production `NEXT_PUBLIC_APP_URL`
Change from `http://localhost:3000` to your actual production URL (e.g. `https://listng.com.ng`).

---

## 🟡 Do when you have paying users

### 12. Auth recovery flows
- [ ] Forgot password page (`/forgot-password`)
- [ ] Email verification page (`/verify-email?token=...`)
- [ ] Password reset page (`/reset-password?token=...`)

### 13. Background job runner (Inngest or Trigger.dev)
Move these off the request thread:
- [ ] CAC verification (currently runs inline)
- [ ] Face descriptor encoding
- [ ] Notification creation (all types)
- [ ] Subscription expiry reminders

### 14. Real-time notification center
- [ ] Pusher channel for user notifications
- [ ] Notification bell component in header
- [ ] Notification list page

### 15. Search upgrade
- [ ] Add Postgres `tsvector` + GIN index on `Listing.title` and `Listing.description`
- [ ] Or migrate to Meilisearch/Algolia

### 16. NDPR compliance check
- [ ] Hire or consult a data protection officer
- [ ] Register with NDPR (Nigeria Data Protection Commission)
- [ ] Add cookie consent banner
- [ ] Conduct a data protection impact assessment (DPIA)

---

## 🟢 Polish (do when you have time)

### 17. Analytics
- [ ] Install PostHog or Plausible
- [ ] Track key funnels: visit → register → list → pay

### 18. TOTP 2FA for vendors
- [ ] Add authenticator app support via `otplib` or `speakeasy`

### 19. Storybook
- [ ] `npx storybook@latest init`
- [ ] Add key components

### 20. Pre-commit secret scanning
- [ ] Add `git-absorb` or `gitleaks` to CI

---

## Quick test checklist

```
[ ] Homepage loads at http://localhost:3000
[ ] Register a new individual account
[ ] Register a new vendor account
[ ] Create a listing (requires active subscription)
[ ] Activate free plan
[ ] Create a listing
[ ] View listing detail page
[ ] Message a seller
[ ] Login as admin: admin@listng.com.ng / AdminPassword123!
[ ] Admin dashboard loads at /admin
[ ] Approve a listing
[ ] /api/health returns {"status":"ok"}
[ ] /api/ready returns {"status":"ready"} (after adding Upstash)
```
