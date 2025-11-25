# Yolo Padel

YOLO padel booking system.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

Build untuk production (otomatis run migration & seed):

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Default Admin Account

- Email: `systemadmin@yolopadel.com`
- Password: `YoloPadel2024!`
- Login via magic link yang dikirim ke email

**⚠️ Ganti password setelah first login di production!**

## Database Commands

```bash
pnpm db:migrate      # Create & apply migration (dev)
pnpm db:seed         # Seed RBAC data
pnpm db:seed:dev     # Seed test data (dev only)
pnpm db:studio       # Open Prisma Studio
```
