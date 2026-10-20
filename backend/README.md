# EcoAid Backend

Express API serving the resident, barangay staff and Super Admin sides of the ECOPROFIT system.

## Current Status

All modules are live and mounted in `src/server.js`. Each route file sets its own authentication middleware and `requireRoles([...])`; every query is scoped to the caller's `barangayId`.

### Mounted routes

| Mount point          | Route file                          | Covers                                                                  |
|-----------------------|--------------------------------------|--------------------------------------------------------------------------|
| `/auth`               | `routes/auth.route.js`              | Registration, OTP, login/logout, forgot password (resident, staff, Super Admin) |
| `/resident`           | `routes/resident.route.js`          | Resident profile, barangay info, staff-side resident list/edit, name search for manual intake |
| `/pickup-requests`    | `routes/pickup-request.route.js`    | Pickup request lifecycle, cancel, AI photo classification               |
| `/material`           | `routes/material.route.js`          | Material and category lookups                                            |
| `/manual-intake`      | `routes/manual-intake.route.js`     | Manual Collection Intake (account user or household name + material rows) |
| `/mrf-inventory`      | `routes/mrf-inventory.route.js`     | MRF balances, transaction log, manual stock-out                          |
| `/redemption`         | `routes/redemption.route.js`        | Programs, transactions, resident search, resident program list           |
| `/rewards`            | `routes/reward-inventory.route.js`  | Reward items, releases, summary, resident search                         |
| `/junkshop-sales`     | `routes/junkshop-sales.route.js`    | Junkshops, price comparison, sales                                       |
| `/program-funds`      | `routes/program-funds.route.js`     | Expenses, summary, transaction ledger                                    |
| `/announcements`      | `routes/announcement.route.js`      | Staff announcements, resident feed                                       |
| `/leaderboard`        | `routes/leaderboard.route.js`       | Rankings (staff and resident views)                                      |
| `/notifications`      | `routes/notification.route.js`      | Resident notifications and unread status                                 |
| `/reports`            | `routes/reports.route.js`           | Report previews and the Excel export                                     |
| `/settings`           | `routes/settings.route.js`          | Theme and add-material                                                   |
| `/barangay`           | `routes/barangay.route.js`          | Sitios of the staff member's barangay                                    |
| `/dashboard`          | `routes/dashboard.route.js`         | Dashboard stats and recent transactions                                  |
| `/admin`              | `routes/barangay-accounts.route.js`, `routes/admin-dashboard.route.js` | Super Admin: barangays, staff accounts, sitios, onboarding status |

The full endpoint list with roles is in the root `README.md`.

### Stock ledger

`StockTransactionLog` is the single append-only stock ledger. It is written by manual intake (`MANUAL_INTAKE`, `IN`), pickup-request collection (`COLLECTION_REQUEST`, `IN`), redemption transactions (`REDEMPTION`, `IN`, with the resident's `userId`), manual stock-out adjustments (`MANUAL_ADJUSTMENT`, `OUT`) and junkshop sales (`JUNKSHOP_SALES`, `OUT`). MRF balances are netted from it, and the leaderboard ranks the entries that carry a `userId`.

### Redemption points

Points are never stored. `utils/residentPoints.js` computes a resident's balance in one program as the points earned in that program's transactions minus the points spent on its reward releases.

## Getting Started

Run the dev server from this directory:

```bash
npm run dev     # nodemon, http://localhost:5001
```

Database setup (Prisma + PostgreSQL):

```bash
npx prisma migrate dev   # apply migrations (production: npx prisma migrate deploy)
npx prisma generate      # regenerate the Prisma client
npx prisma validate      # check the schema without touching a database
npm run seed             # run prisma/seed.js
```

`prisma/seed.js` has separate functions (super admin, the Beddeng Laud test barangay with staff per role and 3 sitios, core materials, a sample resident); `main()` decides which run. Check which database `DATABASE_URL` points at before seeding or migrating.

See the root `README.md` for the environment variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV`, `SEMAPHORE_API_KEY`, `SEMAPHORE_SENDER_NAME`, `ANTHROPIC_API_KEY`).

## Structure

- `src/server.js` — Express app, CORS, route mounting
- `src/config/db.js` — Prisma client singleton
- `src/routes/` — route definitions, one file per resource
- `src/controllers/` — business logic per route file
- `src/middlewares/authMiddleware.js` — `authenticateResident`, `authenticateBarangay`, `authenticateSuperAdmin`, `requireRoles`
- `src/utils/` — `coreMaterials.js` (core material list and the AI classification prompt), `residentPoints.js`, `reportHelpers.js`, `leaderboard.js`, `covertToKg.js`, `generateToken.js`, `sms.js` (Semaphore OTP; logs to the console in development)
- `prisma/schema.prisma` — source of truth for the DB schema; `prisma/migrations/` — migration history
- `prisma/seed.js` — dev seed data

## References

- Root project instructions: `../AGENTS.md`, `../CLAUDE.md`
- Project docs: `../docs`
- Progress tracking: `../PROGRESS.md`
