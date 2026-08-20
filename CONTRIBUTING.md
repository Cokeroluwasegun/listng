# Contributing to ListNG

Thanks for your interest in contributing! ListNG is a Nigerian marketplace and we welcome contributions that improve the platform.

## Code of Conduct

This project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to its terms.

## Development setup

1. **Fork & clone**
   ```bash
   git clone https://github.com/your-username/ecom_listing.git
   cd ecom_listing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local services**
   ```bash
   docker compose up -d
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Fill in required values
   ```

5. **Set up database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

6. **Download face-api models**
   ```bash
   ./scripts/download-face-models.sh
   ```

7. **Run dev server**
   ```bash
   npm run dev
   ```

## Branching model

- `main` — production-ready code
- `develop` — integration branch for features
- `feature/<name>` — new features
- `fix/<name>` — bug fixes
- `chore/<name>` — tooling, deps, CI

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add listing image moderation
fix: prevent duplicate payment activation
chore: bump next to 16.3.1
docs: add API table to README
test: add unit tests for risk-engine
```

## Pull request process

1. Create a feature branch from `develop`
2. Write code with tests (where applicable)
3. Run `npm run lint && npm run typecheck && npm run test`
4. Format with `npm run format`
5. Open a PR with a clear description (linked issue, screenshots, breaking changes)
6. Address review comments
7. Squash-merge once approved

## Style guide

- **TypeScript strict mode** — no `any`, prefer precise types
- **Tailwind v4** — utility-first, no new CSS files
- **Zod** — all input validation at boundaries
- **Server-first** — default to RSC, use `'use client'` only when needed
- **No console.log** in production code — use `logger` from `@/lib/logger`
- **Imports** — absolute via `@/` alias, no relative `../../`
- **Naming** — PascalCase components, camelCase variables, kebab-case files

## Testing

- Unit tests live next to source: `lib/**/*.test.ts`
- E2E tests in `tests/e2e/`
- Coverage threshold: 60% lines/functions/statements, 50% branches
- Run: `npm run test` (unit) and `npm run test:e2e` (e2e)

## Where to help

- 🐛 Fix issues tagged `good first issue`
- ✨ Build features tagged `enhancement`
- 📚 Improve docs
- 🌐 Add translations (Hausa, Yoruba, Igbo, Pidgin)
- ♿ Improve accessibility

## Questions?

Open a [GitHub Discussion](https://github.com/your-org/ecom_listing/discussions) or email dev@listng.com.ng.
