# EcoAid Backend

Express API serving the resident and barangay sides of the ECOPROFIT system.

## Current Status

Auth, pickup requests, redemption, materials, manual intake, material stock, resident, and dashboard endpoints are live and mounted in `src/server.js`.

### Mounted routes

| Mount point          | Route file                              | Covers                                                              |
|-----------------------|------------------------------------------|----------------------------------------------------------------------|
| `/auth`               | `routes/auth.route.js`                  | Registration, OTP, login/logout, forgot password (resident + barangay) |
| `/dashboard`          | `routes/dashboard.route.js`             | Barangay dashboard stats and recent transactions                     |
| `/pickup-requests`    | `routes/pickup-request.route.js`        | Resident pickup request lifecycle (REQUESTED → COLLECTED/REJECTED)   |
| `/redemption`         | `routes/redemption.route.js`            | Redemption programs and transactions                                 |
| `/resident`           | `routes/resident.route.js`              | Resident profile and barangay info                                   |
| `/material`           | `routes/material.route.js`              | Material and category lookups                                        |
| `/manual-intake`      | `routes/manual-intake.route.js`         | Manual Collection Intake (resident search or household name + material rows) |
| `/material-stock`     | `routes/material-stock.route.js`        | Material Stock (MRF) balances, transaction log, manual stock-out     |

Manual Intake and Material Stock share a single append-only ledger, `StockTransactionLog`: Manual Intake writes `IN` rows, manual stock-out adjustments write `OUT` rows. Pickup-request collections and redemption transactions do not write to the ledger yet, even though the `Source` enum reserves `COLLECTION_REQUEST` and `REDEMPTION` values for that.

## Getting Started

Run the dev server from this directory:

```bash
npm run dev     # nodemon, http://localhost:5001
```

Database setup (Prisma + PostgreSQL):

```bash
npx prisma migrate dev   # apply migrations
npx prisma generate      # regenerate the Prisma client
npm run seed             # seed dev data (barangay + admin account)
```

See the root `README.md` for required environment variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SEMAPHORE_API_KEY`).

## Structure

- `src/server.js` — Express app, CORS, route mounting
- `src/config/db.js` — Prisma client singleton
- `src/routes/` — route definitions, one file per resource
- `src/controllers/` — business logic per route file
- `src/middlewares/authMiddleware.js` — `authenticateResident`, `authenticateBarangay`, `requireRoles`
- `src/utils/` — `generateToken.js`, `sms.js` (Semaphore OTP), `covertToKg.js` (stock ledger unit normalization)
- `prisma/schema.prisma` — source of truth for the DB schema
- `prisma/seed.js` — dev seed data

## References

- Root project instructions: `../AGENTS.md`
- Project docs: `../docs`
- Progress tracking: `../PROGRESS.md`
