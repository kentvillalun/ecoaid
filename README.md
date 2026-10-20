# ECOAID

A Web Recycling Waste Management System with Image Recognition

ECOAID is a barangay waste management system that allows residents to contribute recyclable materials and enables the barangay to manage collections, track inventory, run redemption programs, and monitor finances. Based on real operations in Barangay Beddeng Laud, Vigan City.

---

## Project Structure

```
ecoprofit/
├── frontend/   Next.js app (resident PWA, barangay staff UI, Super Admin portal)
├── backend/    Node.js + Express API
└── docs/       System documentation and business rules
```

---

## Requirements

- Node.js 18+
- PostgreSQL database
- npm

---

## Setup

### 1. Clone and install dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"                       # token lifetime, e.g. "7d", "1h"
CORS_ORIGIN="http://localhost:3000"       # allowed frontend origin
NODE_ENV="development"                    # in development, OTPs are printed to the console
SEMAPHORE_API_KEY="your-semaphore-key"    # SMS provider for OTP
SEMAPHORE_SENDER_NAME="your-sender-name"
ANTHROPIC_API_KEY="your-anthropic-key"    # AI photo classification on the resident capture page
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5001"        # backend base URL used directly by the auth pages (lib/config.js)
JWT_SECRET="same-value-as-the-backend"             # the edge middleware verifies the login cookies
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"     # request photo uploads
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"
```

Check which database `DATABASE_URL` points at before running anything that writes (seed, migrations, tests).

### 3. Set up the database

```bash
# From backend/
npx prisma migrate dev     # Apply migrations (production: npx prisma migrate deploy)
npx prisma generate        # Regenerate Prisma client
npm run seed               # Seed dev data (see below)
```

`backend/prisma/seed.js` has separate functions — super admin, the Beddeng Laud barangay with 3 sitios and one staff account per role, the core materials, and a sample resident — and `main()` decides which of them run. The dev usernames and passwords are defined at the top of that file. New barangays receive the core materials automatically when a Super Admin registers them; `seedCoreMaterials()` backfills existing barangays (it only adds missing rows).

---

## Running the Project

**Backend** (from `backend/`):
```bash
npm run dev     # http://localhost:5001
```

**Frontend** (from `frontend/`):
```bash
npm run dev     # http://localhost:3000
```

Both must be running for the app to work. The frontend rewrites `/api/*` to the backend: `http://localhost:5001` in development and the deployed Render URL in production (set in `frontend/next.config.mjs`, chosen by `NODE_ENV`).

---

## Tech Stack

| Layer    | Technology                                                           |
|----------|----------------------------------------------------------------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, `motion`, `sonner`             |
| Backend  | Node.js, Express 5, Prisma 7 (`@prisma/adapter-pg`)                  |
| Database | PostgreSQL                                                           |
| Auth     | JWT in httpOnly cookies, bcryptjs, SMS OTP via Semaphore, `jose` for edge verification |
| AI       | Claude (`@anthropic-ai/sdk`) for recyclable photo classification     |
| Files    | Cloudinary (request photos), `exceljs` (report export)               |
| Forms    | react-hook-form + yup                                                |

---

## Roles

`RESIDENT`, barangay staff `CAPTAIN`, `SECRETARY`, `TREASURER`, `SK`, `COLLECTOR`, and the platform-level `SUPER_ADMIN`. Which staff role may open which page is defined once in `frontend/src/lib/roles.js` (`ROLE_MATRIX`) and mirrored by `requireRoles(...)` on each backend route. A barangay can also switch modules on or off with its `has___` flags.

---

## API Endpoints

Abbreviations: **staff** = CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR. Routes list the roles from each route file.

### Auth (`/auth`)

| Method | Path                                | Description                                      |
|--------|-------------------------------------|--------------------------------------------------|
| GET    | `/auth/barangays?search=`           | Search registered barangays (max 10)             |
| GET    | `/auth/barangays/:barangayId/sitios`| List sitios for a barangay                       |
| POST   | `/auth/register`                    | Register resident + send OTP                     |
| POST   | `/auth/login`                       | Resident login by username + password            |
| POST   | `/auth/verify-otp`                  | Verify OTP + activate account                    |
| POST   | `/auth/resend-otp`                  | Resend OTP (signup or forgot-password flow)      |
| POST   | `/auth/forgot-password`             | Send password reset OTP                          |
| POST   | `/auth/verify-forgot-password-otp`  | Verify password reset OTP                        |
| POST   | `/auth/reset-password`              | Set new password after OTP verified              |
| POST   | `/auth/logout`                      | Resident logout — clears cookie, blacklists token |
| GET    | `/auth/me`                          | Resident session                                 |
| POST   | `/auth/barangay/login`              | Staff login — sets `barangay_token` cookie       |
| POST   | `/auth/barangay/logout`             | Staff logout                                     |
| GET    | `/auth/barangay/me`                 | Staff session (user + role)                      |
| POST   | `/auth/admin/login`, `/auth/admin/logout` | Super Admin login/logout (`admin_token` cookie) |

### Resident (`/resident`)

| Method | Path                      | Roles                          | Description                                              |
|--------|---------------------------|--------------------------------|----------------------------------------------------------|
| GET    | `/resident/me`            | RESIDENT                       | Profile (name, sitio, barangay, phone, `isVerified`)     |
| PATCH  | `/resident/me`            | RESIDENT                       | Update first/last name, phone, address                   |
| GET    | `/resident/barangay-info` | RESIDENT                       | Barangay name, address, contact, registration status, and whether redemption is enabled |
| GET    | `/resident/search?name=`  | CAPTAIN, SECRETARY, COLLECTOR, SK | Search residents **and staff** by name (manual intake) |
| GET    | `/resident`               | CAPTAIN, SECRETARY             | List the barangay's residents                            |
| PATCH  | `/resident/:id`           | CAPTAIN, SECRETARY             | Edit a resident (name, phone, sitio, verified)           |

### Pickup requests (`/pickup-requests`)

| Method | Path                                       | Roles                         | Description                                   |
|--------|--------------------------------------------|-------------------------------|-----------------------------------------------|
| POST   | `/pickup-requests`                         | RESIDENT                      | Submit a pickup request                       |
| POST   | `/pickup-requests/classify`                | RESIDENT                      | AI classification of a photo (5 requests/min) |
| GET    | `/pickup-requests/my-requests`, `/my-requests/:id` | RESIDENT              | The resident's own requests                   |
| PATCH  | `/pickup-requests/:id/cancel`              | RESIDENT                      | Cancel a request that is still REQUESTED      |
| GET    | `/pickup-requests/collection-requests`, `/collection-requests/:id` | CAPTAIN, SECRETARY, COLLECTOR | List / detail |
| PATCH  | `/pickup-requests/collection-requests/:id` | CAPTAIN, SECRETARY, COLLECTOR | Approve, schedule, collect or reject          |

### Materials (`/material`)

| Method | Path                            | Roles                              | Description                      |
|--------|---------------------------------|------------------------------------|----------------------------------|
| GET    | `/material`                     | RESIDENT                           | Materials of the resident's barangay |
| GET    | `/material/barangay`            | CAPTAIN, SECRETARY, SK, TREASURER  | Materials for staff              |
| GET    | `/material/categories`, `/material/categories/barangay` | RESIDENT / CAPTAIN, SECRETARY, SK | Categories |

### Manual intake (`/manual-intake`) — CAPTAIN, SECRETARY, SK, COLLECTOR

| Method | Path             | Description                                                                 |
|--------|------------------|------------------------------------------------------------------------------|
| POST   | `/manual-intake` | Record an intake (account user or household name + material rows); writes `IN` rows to the stock ledger and verifies the account |
| GET    | `/manual-intake` | Intake history of the barangay                                              |

### MRF inventory (`/mrf-inventory`) — CAPTAIN, SECRETARY, SK, COLLECTOR

| Method | Path                                 | Description                                           |
|--------|--------------------------------------|-------------------------------------------------------|
| GET    | `/mrf-inventory`                     | Per-material balance netted from the stock ledger     |
| GET    | `/mrf-inventory/transaction-logs`    | Ledger history with a running balance                 |
| POST   | `/mrf-inventory/transaction-logs/out`| Manual stock-out adjustment (validated against balance) |

### Redemption (`/redemption`)

| Method | Path                              | Roles                                  | Description                                              |
|--------|-----------------------------------|----------------------------------------|----------------------------------------------------------|
| POST   | `/redemption/programs`            | CAPTAIN, SECRETARY, SK, TREASURER      | Create a program; `announce: true` also posts an announcement (CAPTAIN, SECRETARY, SK) |
| GET    | `/redemption/programs`, `/programs/:id` | same                              | List / detail with materials and transactions            |
| PATCH  | `/redemption/programs/:id`        | same                                   | Edit; removes deselected materials not yet used, can change the mode only before any transaction |
| GET    | `/redemption/programs/residents`  | RESIDENT                               | Active programs for residents (accepted materials, rewards, and the resident's own `myPoints`) |
| GET    | `/redemption/residents/me/points` | RESIDENT                               | The resident's own points per program (active programs plus ended ones with points left) |
| GET    | `/redemption/residents/me/history`| RESIDENT                               | The resident's own history: what they brought (transactions) and what they claimed (reward releases), newest first |
| POST   | `/redemption/transactions`        | CAPTAIN, SECRETARY, SK, TREASURER      | Record a transaction for a registered resident (`residentId`) |
| GET    | `/redemption/transactions`, `/transactions/:id` | same                     | List / detail                                            |
| GET    | `/redemption/residents/search?name=&programId=` | same                      | Residents with their points in that program              |

### Rewards (`/rewards`) — CAPTAIN, SECRETARY, TREASURER, SK

| Method | Path                         | Description                                                           |
|--------|------------------------------|-----------------------------------------------------------------------|
| GET    | `/rewards?programId=`        | Reward items with available stock (optionally one program)            |
| POST   | `/rewards`                   | Add a reward item to a program                                        |
| POST   | `/rewards/release`           | Release rewards to a resident (checks stock and the resident's balance in the program) |
| GET    | `/rewards/release`           | Release history                                                       |
| GET    | `/rewards/summary`           | Totals (items, available, released, residents)                        |
| GET    | `/rewards/residents/search?name=&programId=` | Residents with their points in that program         |

### Other staff modules

| Mount             | Roles                                   | Covers                                                        |
|-------------------|------------------------------------------|---------------------------------------------------------------|
| `/junkshop-sales` | CAPTAIN, SECRETARY, TREASURER (prices also SK) | Record sales, junkshops, price comparison               |
| `/program-funds`  | CAPTAIN, SECRETARY, TREASURER, SK        | Expenses, summary, transaction ledger                         |
| `/announcements`  | CAPTAIN, SECRETARY, SK (residents read `/announcements/residents`, `/residents/latest`) | Announcements |
| `/leaderboard`    | CAPTAIN, SECRETARY, SK, TREASURER (residents: `/leaderboard/residents`) | Rankings by kg and by piece |
| `/notifications`  | RESIDENT                                 | Notifications and unread status                               |
| `/reports`        | all staff                                | `GET /reports?type=` previews, `POST /reports/export` (Excel) |
| `/settings`       | CAPTAIN, SECRETARY (theme read: all staff / residents) | Theme, add material                              |
| `/dashboard`      | CAPTAIN, SECRETARY                       | Dashboard stats and recent transactions                       |
| `/barangay`       | CAPTAIN, SECRETARY                       | Sitios of the barangay                                        |

### Super Admin (`/admin`) — `authenticateSuperAdmin`

Barangay CRUD (`/admin/barangays`, `/admin/barangay/register`, `/admin/barangay/:id`), staff accounts (`/admin/barangays/:id/staff`), sitios (`/admin/barangays/:id/sitios`, `/admin/sitios/:id`) and `GET /admin/onboarding-status`.

---

## Database Models

- **Access and tenancy:** `Barangay` (name, address, theme, module flags), `Sitio`, `User` (residents, staff and super admin), `OtpVerification`, `PasswordResetToken`, `BlackListedToken`
- **Materials:** `Category`, `Material` (per barangay, seeded from the core list)
- **Collection:** `PickupRequests`, `CollectionItem`, `ManualIntakeTransaction`, `ManualIntakeItems`
- **Stock:** `StockTransactionLog` — append-only ledger written by manual intake, pickup collection, redemption, manual adjustment and junkshop sales; balances are netted from it
- **Redemption:** `Program`, `ProgramMaterial` (`pointValue` / `cashValue`), `RedemptionTransaction` and `RedemptionTransactionItem` (frozen `currentValue`; `residentId` = the beneficiary), `RewardItem`, `RewardRelease`. Points are not stored; they are computed per resident per program
- **Money:** `Junkshop`, `JunkshopPriceItem`, `JunkshopSale`, `JunkshopSaleItem`, `ProgramExpense`
- **Communication:** `Announcement`, `Notifications`

---

## Frontend Pages

| Route group  | Pages                                                                                                    |
|--------------|-----------------------------------------------------------------------------------------------------------|
| `(intro)`    | Onboarding                                                                                                |
| `(auth)`     | Login (splash screen), signup, OTP, forgot/reset password, barangay login, admin login                    |
| `(resident)` | Home, community (barangay info, announcements, programs preview), capture (photo + AI analysis), requests list and detail, programs, standings, updates (announcements), notifications, profile (personal information, settings, terms, help) — mobile only |
| `(barangay)` | Dashboard, collection requests, manual intake, MRF inventory, redemption (programs, program and transaction detail), reward inventory, junkshop sales, program funds, announcements, leaderboard, residents, reports, settings |
| `(admin)`    | Admin dashboard, barangay accounts (list, register, detail, edit)                                         |

---

## Current Status

All modules above are built end-to-end and deployed (backend on Render, frontend proxying `/api/*`). The redemption module was reshaped in October 2026 around the resident as beneficiary, and residents can now see active programs and rewards; residents see their own points on the home screen (they choose which program to show) and on each Programs page card; the field evaluation in a real barangay is next.

See `docs/current-progress.md` for the detailed log and `PROGRESS.md` for open items and technical debt.

---

## Documentation

- `docs/project-overview.md` — system description and current development status
- `docs/business-rules.md` — core rules governing the domain
- `docs/module-boundaries.md` — what each module owns
- `docs/request-lifecycle.md` — pickup request statuses
- `docs/current-progress.md` — completed features and next steps
- `PROGRESS.md` — session log, technical debt, open items
- `fr-process-documentation.md` — functional requirement verification against the running app
- `AGENTS.md` / `CLAUDE.md` — development guidelines for AI assistants
