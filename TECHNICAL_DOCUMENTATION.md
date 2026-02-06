# Technical Handover Documentation

## Project Overview

**Yolo Padel** is a padel court booking and management system. Users browse venues, book courts, manage payments; admins manage venues, courts, bookings, and users.

### Tech Stack

- **Framework**: Next.js 15.5.7 (App Router)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma 6.17.1
- **UI**: Radix UI + Tailwind CSS 4
- **State**: TanStack React Query v5
- **Auth**: Custom JWT (jose), magic link
- **Email**: Brevo
- **Payment**: Xendit
- **Storage**: Vercel Blob
- **Integration**: AYO booking
- **PDF**: @react-pdf/renderer
- **Forms**: React Hook Form + Zod

---

## Architecture

High-level: 6-layer clean architecture — Presentation → Container → Hooks → API → Service → Data. Business logic in services; dependencies flow downward.

**Details**: See `.kiro/steering/architecture-patterns/` — `quick-reference.md`, `clean-architecture-guide.md`, `data-flow-diagram.md`, `layer-diagram.md`.

### Folder Structure

```
yolo-padel/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── admin/dashboard/
│   │   ├── api/ (admin, auth, booking, order, payment, webhook)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── payment/
│   ├── components/ (emails, receipt, ui)
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   │   ├── services/
│   │   ├── validations/
│   │   ├── format/
│   │   └── webhook/
│   ├── types/
│   └── middleware.ts
├── .env
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Third-Party Integrations

| Name        | Entry point                                               |
| ----------- | --------------------------------------------------------- |
| Xendit      | `src/lib/services/xendit.service.ts`, `src/lib/xendit.ts` |
| Brevo       | `src/lib/services/brevo.service.ts`, `src/lib/brevo.ts`   |
| AYO         | `src/lib/services/ayo.service.ts`                         |
| Vercel Blob | `src/lib/services/vercel-blob.service.ts`                 |

---

## Environment Variables

| Variable                | Required | Notes                              |
| ----------------------- | -------- | ---------------------------------- |
| `DATABASE_URL`          | ✅       | PostgreSQL connection string       |
| `JWT_SECRET`            | ✅       | 32+ chars                          |
| `BREVO_API_KEY`         | ✅       | Brevo API key                      |
| `FROM_EMAIL`            | ✅       | Verified sender                    |
| `COMPANY_NAME`          | ✅       | For emails                         |
| `NEXT_PUBLIC_APP_URL`   | ✅       | App URL                            |
| `BLOB_READ_WRITE_TOKEN` | ✅       | Vercel Blob token                  |
| `XENDIT_SECRET_API_KEY` | ✅       | Xendit API key                     |
| `XENDIT_WEBHOOK_TOKEN`  | ✅       | Webhook verification               |
| `AYO_PRIVATE_KEY`       | If AYO   | HMAC key                           |
| `AYO_API_TOKEN`         | If AYO   | API token                          |
| `AYO_HOST`              | If AYO   | API base URL                       |
| `ENVIRONMENT`           | ❌       | PRODUCTION / STAGING / DEVELOPMENT |
| `DUMMY_PASSWORD`        | ❌       | Dev seed only                      |

---

## Key Features & Logic

### 1. Authentication

- **Service**: `src/lib/services/auth.service.ts`
- **Middleware**: `src/middleware.ts`
- **API**: `src/app/api/auth/`
- Magic link → JWT in HTTP-only cookie. User types: ADMIN, STAFF, USER. Protected: `/admin/*` (ADMIN/STAFF), `/dashboard/*` (USER).

### 2. Data Fetching

- Server Components for initial loads; API routes + React Query for dynamic features. See `.kiro/steering/architecture-patterns/` for data flow.

### 3. Booking

- Time-slot based; dynamic pricing. Statuses: PENDING, UPCOMING, COMPLETED, CANCELLED, NO_SHOW. Pricing and blocking: `src/lib/services/booking.service.ts`.

### 4. Payment (Xendit)

- Order → invoice → webhook updates. Webhook: `/api/webhook/payment`. Fee/tax in `src/config.json`.

### 5. RBAC

- **Frontend**: `src/lib/frontend-rbac.ts`
- **Backend**: `src/lib/services/rbac.service.ts`
- **Hook**: `src/hooks/use-permission-guard.ts`
- Roles, Modules, Permissions, RolePermission. Seeded via `prisma/seed.ts`.

### 6. Activity Logging

- `src/lib/services/activity-log.service.ts` — audit for user, booking, court, payment, RBAC actions.

### 7. Multi-Venue

- ADMIN: all venues; STAFF: `assignedVenueIds`. Venue filter in service layer.

### 8. Email (Brevo)

- Templates in `src/components/emails/`. Sending: `src/lib/services/brevo.service.ts`.

### 9. File Upload (Vercel Blob)

- `src/lib/services/vercel-blob.service.ts`. Upload via `/api/upload`. Images, 5MB max.

---

## Deployment

- **Build**: `pnpm build` (runs Prisma generate, migrate deploy, seed, next build). Dev build: `pnpm build:dev`.
- **Hosting**: Node 20+, 512MB+ RAM. Recommended: Vercel or Cloudflare Pages (`wrangler.jsonc`, `open-next.config.ts`).
- **Migrations**: `pnpm db:migrate:deploy`

---

## Database Schema (Entities)

**Users & Auth**: User, Profile, MagicLink, Membership

**Venues & Courts**: Venue, Court, CourtOperatingHour, CourtTimeSlot, CourtDynamicPrice

**Bookings & Orders**: Booking, BookingTimeSlot, Order, Payment, Blocking

**RBAC**: Roles, Module, Permission, RolePermission

**Audit**: ActivityLog

Full schema: `prisma/schema.prisma`.

---

## Development Workflow

**Start**: Clone → `pnpm install` → copy `.env.example` to `.env` → `pnpm db:generate` → `pnpm db:migrate` → `pnpm db:seed` → `pnpm dev` (http://localhost:3000).

**Scripts**: `pnpm dev` | `pnpm lint` | `pnpm db:generate` | `pnpm db:push` | `pnpm db:migrate` | `pnpm db:migrate:deploy` | `pnpm db:studio` | `pnpm db:seed` | `pnpm build` | `pnpm build:dev` | `pnpm start`

Architecture and patterns: `.kiro/steering/architecture-patterns/`.

---

## Configuration

- **App config**: `src/config.json` (tax, booking fee, contact email).
- **Next**: `next.config.ts`. **TypeScript**: `tsconfig.json` (`@/*` → `./src/*`). **DB**: `prisma/schema.prisma`.

---

## Security Best Practices

- Do not commit `.env`; use different secrets per environment; rotate regularly.
- JWT in HTTP-only cookie; magic links expire 15 min; RBAC at API and service layer.
- Validate inputs with Zod; Prisma for DB; verify webhook signatures (Xendit, AYO).
- Rate limiting recommended for production.

---

## Support & Resources

**Internal**: Architecture and patterns — `.kiro/steering/architecture-patterns/`. Schema — `prisma/schema.prisma`.

**Document version**: 1.0 · Last updated: January 26, 2026
