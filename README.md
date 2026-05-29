# ECOPROFIT

Turning Waste Materials into Worth Through a Community Buyback and Management Platform.

ECOPROFIT is a barangay waste management system that allows residents to contribute recyclable materials and enables the barangay to manage collections, track inventory, run redemption programs, and monitor finances. Based on real operations in Barangay Beddeng Laud, Vigan City.

---

## Project Structure

```
ecoprofit/
├── frontend/   Next.js app (resident and barangay web UI)
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
SEMAPHORE_API_KEY="your-semaphore-key"   # optional in dev — OTP prints to console if omitted
```

### 3. Set up the database

```bash
# From backend/
npx prisma migrate dev     # Apply migrations
npx prisma generate        # Regenerate Prisma client
npm run seed               # Seed dev data (barangay + admin account)
```

The seed creates:
- Barangay Beddeng Laud with 3 sitios
- Admin account: `+639990000001` / `barangay123`

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

Both must be running for the app to work. The frontend calls the backend over HTTP.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4            |
| Backend  | Node.js, Express 5, Prisma 7                    |
| Database | PostgreSQL                                      |
| Auth     | JWT (cookies), bcryptjs, SMS OTP via Semaphore  |
| Forms    | react-hook-form + yup                           |

---

## API Endpoints

### Auth (`/auth`)

| Method | Path                                | Description                                      |
|--------|-------------------------------------|--------------------------------------------------|
| GET    | `/auth/barangays?search=`           | Search registered barangays (max 10)             |
| GET    | `/auth/barangays/:id/sitios`        | List sitios for a barangay                       |
| POST   | `/auth/register`                    | Register resident + send OTP                     |
| POST   | `/auth/login`                       | Resident login by username + password            |
| POST   | `/auth/verify-otp`                  | Verify OTP + activate account                    |
| POST   | `/auth/resend-otp`                  | Resend OTP (signup or forgot-password flow)      |
| POST   | `/auth/forgot-password`             | Send password reset OTP                          |
| POST   | `/auth/verify-forgot-password-otp`  | Verify password reset OTP                        |
| POST   | `/auth/reset-password`              | Set new password after OTP verified              |
| POST   | `/auth/barangay/login`              | Barangay staff login — sets `barangay_token` httpOnly cookie |
| POST   | `/auth/logout`                      | Logout — clears cookie, blacklists token         |
| GET    | `/auth/me`                          | Resident: returns id, role, barangay from JWT    |
| GET    | `/auth/barangay/me`                 | Barangay staff: returns id, role from JWT        |

### Resident (`/resident`)

Protected by `authenticateResident` middleware.

| Method | Path                     | Description                                              |
|--------|--------------------------|----------------------------------------------------------|
| GET    | `/resident/me`           | Returns resident profile (name, sitio, barangay, phone)  |
| PATCH  | `/resident/me`           | Updates firstName, lastName, phoneNumber, address        |
| GET    | `/resident/barangay-info`| Returns resident's barangay info (name, city, contact, registration status) |

### Pickup Requests (`/pickup-requests`)

| Method | Path                                    | Required role                       | Description                           |
|--------|-----------------------------------------|-------------------------------------|---------------------------------------|
| POST   | `/pickup-requests/`                     | RESIDENT                            | Submit new pickup request             |
| GET    | `/pickup-requests/my-requests`          | RESIDENT                            | List authenticated resident's requests |
| GET    | `/pickup-requests/my-requests/:id`      | RESIDENT                            | Get single resident request detail (ownership-scoped) |
| GET    | `/pickup-requests/collection-requests`  | CAPTAIN, SECRETARY, COLLECTOR       | List all pickup requests              |
| GET    | `/pickup-requests/collection-requests/:id` | CAPTAIN, SECRETARY, COLLECTOR    | Get single request detail             |
| PATCH  | `/pickup-requests/collection-requests/:id` | CAPTAIN, SECRETARY, COLLECTOR    | Update request status                 |

### Materials (`/materials`)

| Method | Path                    | Required role                        | Description                              |
|--------|-------------------------|--------------------------------------|------------------------------------------|
| GET    | `/materials/`           | RESIDENT                             | List materials for resident's barangay   |
| GET    | `/materials/barangay`   | CAPTAIN, SECRETARY, SK               | List materials for barangay staff        |
| GET    | `/materials/categories` | RESIDENT                             | List material categories                 |

### Redemption (`/redemption`)

Protected by `authenticateBarangay + requireRoles(["CAPTAIN","SECRETARY","SK"])`.

| Method | Path                          | Description                                            |
|--------|-------------------------------|--------------------------------------------------------|
| POST   | `/redemption/programs`        | Create redemption program                              |
| GET    | `/redemption/programs`        | List all programs                                      |
| GET    | `/redemption/programs/:id`    | Get program detail with materials and transactions     |
| PATCH  | `/redemption/programs/:id`    | Update program and upsert material reward values       |
| POST   | `/redemption/transactions`    | Record a redemption transaction (supports line items)  |
| GET    | `/redemption/transactions`    | List all redemption transactions                       |
| GET    | `/redemption/transactions/:id`| Get transaction detail with full line-item breakdown   |

### Dashboard (`/dashboard`)

Protected by `authenticateBarangay + requireRoles(["CAPTAIN"])`.

| Method | Path                               | Required role | Description                                                |
|--------|------------------------------------|---------------|------------------------------------------------------------|
| GET    | `/dashboard`                       | CAPTAIN       | Returns `requestedCount`, `totalRecords`, `unverified`     |
| GET    | `/dashboard/recent-transactions`   | CAPTAIN       | Returns last 3 `CollectionItem` records with user info     |

---

## Database Models

- `Barangay` — Registered barangay organizations; fields include `name`, `municipality`, `province`, `zipCode`, `logoUrl`, `isRegistered`, `contactNumber`, `redemptionMode` (`POINTS`/`CASH`/`BOTH`), and feature flags (`hasCollectionRequests`, `hasRedemptionManagement`, `hasRewardInventory`, `hasLeaderboard`)
- `Sitio` — Sub-divisions within a barangay (unique per barangay)
- `User` — Residents and barangay staff; roles: `RESIDENT`, `CAPTAIN`, `SECRETARY`, `TREASURER`, `SK`, `COLLECTOR`, `SUPER_ADMIN`; `username` field for login; `isVerified` flag for resident account verification
- `OtpVerification` — SMS OTP codes with expiration
- `PasswordResetToken` — Tokens for forgot-password flow
- `BlackListedToken` — Revoked JWTs; checked on every authenticated request
- `Category` — Material categories (e.g. Plastic, Metal) for grouping `Material` records
- `Material` — Individual recyclable material types scoped per barangay; replaces the old `MaterialType` enum; has `name`, `categoryId`, `barangayId`, `defaultUnit`, `isActive`, `acceptNonSellable`
- `PickupRequests` — Resident pickup requests; `materialId` FK to `Material`; `estimatedValue`/`estimatedUnit` (`Unit` enum: KG/GRAMS/LBS/PIECE); `isAssorted` flag; `Status` enum (REQUESTED/APPROVED/IN_PROGRESS/COLLECTED/REJECTED)
- `CollectionItem` — Per-material breakdown recorded at collection time; `materialId` FK; `actualValue`/`actualUnit` (child of `PickupRequests`)
- `Program` — Redemption program scoped to a barangay; fields: `allotedBudget`, `description`, `isActive`, `isCashMode`
- `ProgramMaterial` — Per-material reward value scoped to a program; both `pointValue` and `cashValue` to support dual reward modes; `materialId` FK to `Material`
- `RedemptionTransaction` — Header record for a redemption event (beneficiary, collector, educational level, program)
- `RedemptionTransactionItem` — Line-item detail per transaction; `programMaterialId` FK, `amount`, `currentValue` snapshot

---

## Frontend Pages

| Route group      | Pages                                                                                       |
|------------------|---------------------------------------------------------------------------------------------|
| `(intro)`        | Onboarding flow                                                                             |
| `(auth)`         | Login (with splash screen), signup, OTP verification, forgot password, reset password, barangay login |
| `(resident)`     | Home (live data: profile + recent requests, cards navigate to detail), community (live barangay info), capture (DB-driven material selector, Cloudinary upload), requests list (Ongoing/History tabs, live data), request detail (photo, timeline, collection breakdown), profile (live name + barangay, logout), personal-information (edit mode, PATCH /resident/me, discard modal), notification settings (UI shell), settings (UI shell), help & support (FAQ accordion), announcements |
| `(barangay)`     | Dashboard (partial live data), collection requests (list + detail), redemption programs list (`/redemption`), program detail (`/redemption/programs/[id]`), transaction detail (`/redemption/transactions/[id]`) |

---

## Current Status

Both resident and barangay auth flows are complete and stable (username-based login, OTP, forgot password, split `authenticateResident`/`authenticateBarangay` middleware). The app ships as a PWA with web manifests and a splash screen on login. Auth pages and the onboarding flow have been fully redesigned — login uses a bottom-sheet card layout with `motion/react` animations, the splash screen shows a white EcoAid wordmark on brand green, and onboarding uses new illustrations with a horizontal slide animation and haptic feedback (`bzzz`).

**Schema overhaul is complete.** The `MaterialType` enum is fully replaced by a `Material` DB model with a `Category` model. `WeightUnit` is replaced by a `Unit` enum. All pickup request, collection item, and redemption module fields now use `materialId` (FK to `Material`). The `Barangay` model gained `redemptionMode`, feature flags, and additional address fields. `RedemptionTransaction` now uses a `RedemptionTransactionItem` line-item model.

The full pickup request lifecycle is wired end-to-end on the barangay side (REQUESTED → APPROVED → IN_PROGRESS → COLLECTED or REJECTED, including batch collection). Material selection in the capture page and collection flow now uses real `Material` DB records fetched from `GET /materials/`.

The Redemption Management module is fully wired and restructured. The route is now `/redemption` (was `/redemption-programs`). Programs support both points and cash reward modes via `isCashMode`. `RecordTransactionModal` handles multiple line items per transaction. The transaction detail page (`/redemption/transactions/[id]`) and program detail page (`/redemption/programs/[id]`) are built and wired. A `DesktopGuard` component blocks resident pages on non-mobile viewports.

All resident data-driven pages are working (home, community, requests list, request detail, profile with edit mode). The barangay dashboard is partially wired — three stat cards (Total Recyclables Collected, Total Program Expenses, Current Fund Balance) remain hardcoded pending the MRF and Program Funds modules.

Next focus: Manual Collection Intake module (Sunday EcoAid manual entry with resident search).

See `docs/current-progress.md` for a detailed breakdown of what is done and what is next.

---

## Documentation

- `docs/project-overview.md` — system description and current development status
- `docs/business-rules.md` — core rules governing the domain
- `docs/module-boundaries.md` — what each module owns
- `docs/current-progress.md` — completed features and next steps