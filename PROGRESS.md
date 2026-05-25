# EcoProfit - AI Context File

## Stack
- Frontend: Next.js (PWA for resident, dashboard for barangay)
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT with httpOnly cookies
- SMS: Semaphore OTP
- Roles: RESIDENT, CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR, SUPER_ADMIN

## What's Built
- [x] Resident signup with barangay/sitio autocomplete
- [x] OTP verification via Semaphore SMS
- [x] Resident login
- [x] Barangay login with JWT token generation
- [x] Auth endpoints:
      POST /auth/register
      POST /auth/verify-otp
      POST /auth/resend-otp
      POST /auth/login
      POST /auth/barangay/login
      POST /auth/forgot-password
      POST /auth/verify-forgot-password-otp
      POST /auth/reset-password
      POST /auth/logout
      GET  /auth/me (returns id, role, barangay from JWT)
- [x] JWT middleware: authenticate and requireRoles
- [x] httpOnly cookie authentication
- [x] Token blacklist (BlacklistedToken table)
- [x] Logout endpoint (clears cookie + blacklists token)
- [x] Protected route: GET /dashboard (CAPTAIN only)
- [x] Barangay login page with form validation (fully integrated end-to-end)
- [x] Proxy route protection (Layer 1) — middleware in frontend/src/proxy.js
- [x] Server component auth verification (Layer 2) — dashboard page calls GET /auth/me and redirects on failure
- [x] Shared config: frontend/src/lib/config.js exports API_BASE_URL
- [x] Barangay logout — Sidebar button calls POST /auth/logout with credentials: "include", clears cookie, redirects to /barangay/login; toast notifications via sonner
- [x] Pickup request schema — PickupRequests model with MaterialType, WeightUnit, Status enums; migration applied (20260401174639_add_pickup_request)
- [x] Capture page Cloudinary upload — photo uploads to Cloudinary on "Next" click; cloudinaryUrl stored for later submission; retake resets the URL; loading state disables button; sonner toast on upload error
- [x] Resident cookie auth — POST /auth/login sets `resident_token` httpOnly cookie (7-day); authenticate middleware reads it; proxy Layer 1 guards resident routes (/home, /capture, /requests, /profile, /announcements, /community); login page wired end-to-end with credentials: "include", RESIDENT role guard, localStorage session store, redirect to /home
- [x] Resident logout frontend — Profile page logout button calls POST /auth/logout with credentials: "include"; redirects to /login on success; Toaster for error feedback
- [x] Capture page form submission wired to backend — onSubmit calls POST /pickup-request with credentials: "include"; sends materialType, estimatedWeight, weightUnit, notes, photoUrl (Cloudinary); shows success modal on 200; toast on error
- [x] Barangay sidebar logout endpoint corrected — Sidebar now calls POST /auth/barangay/logout (was /auth/logout)
- [x] Resident logout backend — logoutResident implemented and exported from auth.controller.js; blacklists resident_token cookie and clears it
- [x] Pickup request backend endpoint — POST /pickup-requests route created; controller validates required fields, reads userId from JWT, writes to PickupRequests table via Prisma; mounted in server.js at /pickup-requests; protected by authenticate + requireRoles(["RESIDENT"])
- [x] Deployment — backend deployed to Railway; `backend/package.json` postinstall runs `prisma generate`; CORS origin via `CORS_ORIGIN` env var; cookie `sameSite: "none"` for cross-origin production auth
- [x] Frontend API proxy — `next.config.mjs` rewrites `/api/:path*` to backend; env-based URL switches between localhost:5001 (dev) and Railway URL (prod); `allowedDevOrigins` set for LAN dev
- [x] Proxy middleware matcher hardened — explicit `matcher` array added to `proxy.js` covering all barangay + resident routes; `"/"` included as resident-guarded root
- [x] Onboarding step text updated — steps 2, 3, and 4 rewritten to accurately reflect the redemption/rewards model and pickup request lifecycle; removed inaccurate "weighed and paid" framing
- [x] `<img>` → Next.js `<Image>` — signup and onboarding pages now use `next/image` for optimized image loading
- [x] Capture page upload toast — loading toast shown while Cloudinary upload is in flight; dismissed and replaced with success toast on completion; error toast on failure
- [x] Barangay login bug fix — corrected redirect/token handling in auth.controller.js and barangay/login/page.jsx; simplified dashboard/page.jsx (removed redundant auth logic)
- [x] `useFetch` custom hook — `frontend/src/hooks/useFetch.js` wraps GET requests with `isLoading`, `isError`, `data`, `error` state; accepts `refetchCount` to re-trigger fetches; uses `credentials: "include"` automatically
- [x] `useUpdate` custom hook — `frontend/src/hooks/useUpdate.js` wraps PATCH requests; exposes `updateStatus({ id, status })` function with loading/error state
- [x] Collection requests management UI (barangay side) — tabbed page at `/collection-requests` with Pending / Approved / In Progress / Collected / Rejected tabs; `RequestCard` (mobile) and `RequestTable` (desktop) components; batch "Create Batch Collection" action for approved requests
- [x] Pickup request backend endpoints live — `GET /pickup-requests/collection-requests` and `PATCH /pickup-requests/collection-requests/:id` uncommented and active; protected by `authenticate + requireRoles(["CAPTAIN","SECRETARY","COLLECTOR"])`
- [x] Collection requests UI wired to real backend — `useFetch` replaces mock data; `handleRefetchCount` increments `refetchCount` to trigger re-fetch after mutations
- [x] Approve action wired end-to-end — `PendingActions` calls `useUpdate.updateStatus({ id, status: "APPROVED" })` then `handleRefetchCount()`; table refreshes automatically
- [x] Decline modal UI built — `Modal` component at `frontend/src/components/ui/Modal.jsx` with rejection reason textarea, Cancel/Decline buttons; not yet wired to `updateStatus`
- [x] Make Modal reusable with React Portal (render outside DOM tree to avoid stacking context issues)
- [x] Wire Decline modal: pass `id` + `handleRefetchCount` into Modal; on submit call `updateStatus({ id, status: "REJECTED", rejectionReason })` then close modal and refetch
- [x] actualWeight input UI for COLLECTED action
- [x] `GET /pickup-requests/collection-requests/:id` backend endpoint — `getRequest` controller fetches single request with full user/sitio/timeline fields; added to route and exported
- [x] `formatDate` utility — `frontend/src/lib/formatDate.js` formats ISO date strings to human-readable locale strings (e.g. "Apr 10, 2026, 3:00 PM")
- [x] `LabelValue` component — `frontend/src/components/ui/LabelValue.jsx` renders a label + value pair used across detail cards
- [x] `RequestDetailHeader` component — card with back button (`history.back()`), clipboard icon, title, and status `Pill`
- [x] View Details full page — `/collection-requests/[id]` fetches via `useFetch`; shows Resident Info, Request Info, Photo Evidence, and Timeline cards (timeline entries shown conditionally per status); renders `PendingActions` / `ApprovedActions` / `InProgressActions` card based on current status; `onSuccess` navigates back to list
- [x] `ASSORTED` MaterialType — added to `MaterialType` enum in `schema.prisma`; capture page dropdown and yup schema updated to include `ASSORTED`
- [x] `CollectionItem` Prisma model — stores per-material breakdown at collection time (`requestId`, `materialType`, `actualWeight`, `weightUnit`); related to `PickupRequests` via `collectionItems` relation
- [x] `updateStatus` COLLECTED handler upgraded — now creates `CollectionItem` records via `prisma.collectionItem.createMany` before updating request status; replaces the old single `actualWeight`/`weightUnit` fields on the request row
- [x] `useUpdate` hook updated — `updateStatus` now accepts and forwards an `items` array to the backend for the COLLECTED transition
- [x] `InProgressActions` redesigned — two modes based on `materialType` prop: simple mode (single actual weight + unit input) and ASSORTED mode (dynamic table with add/remove rows, each row has materialType/actualWeight/weightUnit fields)
- [x] "Finalized Collection" card on detail page — `/collection-requests/[id]` shows a collection items breakdown table (materialType, actualWeight, weightUnit) when status is `COLLECTED`; backend `getRequest` now selects the `collectionItems` relation
- [x] Capture page sitio auto-fetch — on mount, page calls `GET /auth/me` and displays the resident's sitio name as a read-only field; removes the "unregistered field" known issue
- [x] Login page session guards — `useEffect` added to redirect to `/home` if localStorage session exists; `useEffect` added to redirect to `/onboarding` if user hasn't seen onboarding
- [x] Root page redirect — `app/page.js` redirects `/` to `/login`
- [x] Username/password auth system — `username` field added to `User` model (unique, optional for backward compat); both resident and barangay login now accept `username`; signup collects `firstName`, `lastName`, `username` upfront; backend validates uniqueness; seed updated with `username: "barangayadmin"`
- [x] Split authenticate middleware — `authenticateResident` and `authenticateBarangay` separated; each only accepts its own cookie, preventing cross-role token acceptance; all pickup-request routes updated accordingly
- [x] `GET /auth/barangay/me` endpoint added using `authenticateBarangay`; existing `GET /auth/me` now uses `authenticateResident`
- [x] `frontend/src/lib/roles.js` — exports `BARANGAY_ROLES` array for reuse across frontend
- [x] Signup page stores `otpFlow: "signup"` in `sessionStorage` before pushing to `/otp`
- [x] Redemption module backend foundation:
      - `Program` model — name, allotted budget, max points
      - `ProgramMaterial` model — per-material point value scoped to a program; unique on `(programId, materialType)`
      - `RedemptionTransaction` model — records each redemption event with `programMaterialId`, `quantity`, `collectorName`, `beneficiaryName`, `educationalLevel`, and `currentPointValue` snapshot
      - `EducationalLevel` enum (`PRIMARY` / `SECONDARY` / `TERTIARY`) added to schema
      - `redemption.controller.js` — `createProgram`, `getPrograms`, `getProgram`, `createTransaction`, `getTransactions`; `createTransaction` snapshots `pointValue` before writing
      - `redemption.route.js` — protected by `authenticateBarangay + requireRoles(["CAPTAIN","SECRETARY","SK"])`; registered at `/redemption` in `server.js`
      - Endpoints: `POST /redemption/programs`, `GET /redemption/programs`, `GET /redemption/programs/:id`, `POST /redemption/transactions`, `GET /redemption/transactions`
- [x] `useMutation` custom hook — `frontend/src/hooks/useMutation.js` wraps POST/PATCH requests; exposes `makeRequest({ url, method, body })` with `isLoading`, `isError`, `error` state; returns `true` on success
- [x] `useFetch` bug fix — `setIsError(false)` now resets before each fetch attempt so stale error state no longer persists across refetches
- [x] `SkeletonCard` component — accepts `rowsCount` prop; renders grey animated placeholder rows while data loads
- [x] `Spinner` component — inline loading spinner for button/modal loading states
- [x] `Error` component — error state card with a "Try again" button that calls `handleRefetchCount` callback
- [x] `Empty` component — empty state card with title and subtext props
- [x] Redemption Management frontend — fully wired to backend:
      - `AddProgramModal` wired to `POST /redemption/programs` via `useMutation`; form validated with `react-hook-form` + `yup`; success triggers program list refetch
      - `RecordTransactionModal` — dependent dropdowns (program → filtered materials); fields: program, material, beneficiary name, collector name, quantity, educational level; wired to `POST /redemption/transactions`; success triggers transaction list refetch
      - `redemption-programs/page.jsx` — mock data replaced with `useFetch`; separate `refetchCount` states for programs and transactions; "Record Transaction" button passes fetched programs into modal
      - `TransactionTable` and `TransactionCard` — now receive live data with loading/error states
- [x] `/redemption-programs/[id]` detail page — fully wired to backend; shows program info, materials breakdown (point values per material), and transaction history (flattened from nested `programMaterial.redemptionTransaction`); `getProgram` controller `include` updated so `redemptionTransaction` also includes `programMaterial { include: { program: true } }`
- [x] `Program` model — `description String?` and `isActive Boolean @default(true)` fields added; migration applied
- [x] `updateProgram` controller — partial update pattern with upsert for `ProgramMaterial` point values; `PATCH /redemption/programs/:id`
- [x] `AddProgramModal` extended for edit — pre-fills form via `reset()` in `useEffect` when `program` prop present; sends `POST` for create, `PATCH` for edit; upsert for material point values
- [x] Deactivate/Reactivate toggle in Edit modal — sends `{ isActive: !program.isActive }`; button label and color flip based on current state; caution/reactivation message shown below button
- [x] Inactive program UX — program cards dimmed with `opacity-50`; "Record Transaction" button hidden when program is inactive; inactive programs filtered from transaction modal dropdown
- [x] `RecordTransactionModal` `preselectedProgram` prop — skips program dropdown, shows locked input with program name; `useEffect` + `setValue` sets `programId` automatically
- [x] Splash screen on login page — animated splash shown on first visit; fades out then checks localStorage session (already logged in → `/home`, no onboarding → `/onboarding`, else show form); `sessionStorage.getItem("skipSplash")` bypasses splash on return navigations (e.g. back from OTP or reset password)
- [x] Web app manifest — `manifest.json` added at `frontend/src/app/`; enables add-to-home-screen on mobile; `display: standalone`, `theme_color: #a8e063`, 192×192 and 512×512 maskable icons, `start_url: /`
- [x] Barangay login manifest — separate `manifest.json` added for the barangay login page
- [x] UI polish — fixed cut logo icon on Android devices; fixed slow loading on onboarding screens; input fields given explicit min/max heights; select input container aligned with `items-center`; logo position adjusted
- [x] `contactNumber` field on `Barangay` model — `contactNumber VARCHAR(20)` added via migration `20260423175548_add_barangay_contact`; seed updated with `contactNumber: "09177744669"` for dev barangay
- [x] Resident profile endpoint — `GET /resident/me` returns `firstName`, `lastName`, `sitio`, `phoneNumber`, `barangay`, `address`; protected by `authenticateResident`
- [x] Barangay info endpoint — `GET /resident/barangay-info` returns `name`, `isRegistered`, `contactNumber`, `city` for the authenticated resident's barangay; protected by `authenticateResident`
- [x] My requests endpoint — `GET /pickup-requests/my-requests` (`getMyRequest` controller) returns the authenticated resident's own pickup requests; protected by `authenticateResident`
- [x] Resident home page wired to real data — fetches resident name/barangay from `GET /resident/me`; fetches recent requests from `GET /pickup-requests/my-requests`; skeleton loading, `Error` and `Empty` states; request cards show material, notes, date, estimated weight, status pill
- [x] Community page fully built — `/community` fetches from `GET /resident/barangay-info`; displays EcoAid schedule, accepted materials, how-it-works steps, and barangay contact info card (name, registration badge, city, contact number); skeleton loading on all data-driven fields
- [x] `Badge` component — standalone reusable pill at `components/ui/Badge.jsx`; accepts `label`, `color`, `className` props
- [x] `SitioPill` component — new reusable sitio pill at `components/ui/SitioPill.jsx`; maps sitio keys to display labels and styles
- [x] `Error` component updated — now accepts optional `text`, `subtext`, `buttonLabel`, `buttonClassName` props for flexible reuse
- [x] Sidebar leaderboard link — barangay sidebar now includes a Leaderboard navigation entry
- [x] Bug fixes (recent) — skeleton alignment; collection request module minor bugs; rejection reason shown on detail page; table items hidden while loading; column layout on pickup details page; card bug under approved tab; "View Details" text button for approved items on mobile
- [x] `GET /pickup-requests/my-requests/:id` backend endpoint — `getMyRequestsById` controller; query scoped to the authenticated resident's `userId` (ownership check); returns `photoUrl`, `materialType`, `status`, `notes`, estimated weight, timeline fields (`createdAt`, `approvedAt`, `collectedAt`, `rejectedAt`, `isScheduled`), and `collectionItems` relation; mounted at `/pickup-requests/my-requests/:id`, protected by `authenticateResident`
- [x] Resident requests list page wired to real data — `/requests` fetches from `GET /pickup-requests/my-requests`; Ongoing tab filters `REQUESTED / APPROVED / IN_PROGRESS`; History tab filters `COLLECTED / REJECTED`; skeleton loading, `Error`, `Empty` states; each card shows photo thumbnail, material, notes, date, estimated weight, status pill; tapping a card navigates to `/requests/:id`
- [x] Resident request detail page fully built — `/requests/[id]` fetches from `GET /pickup-requests/my-requests/:id`; shows photo banner, Request Information (material pill, estimated weight, notes, submitted date), Status Timeline (conditional entries with connecting line), and Collection Details (breakdown table of `collectionItems` when `COLLECTED`, placeholder text otherwise); skeleton loading and error states implemented
- [x] Home page request cards navigate to detail — "Recent Requests" cards on `/home` now push to `/requests/:id` on tap
- [x] `isVerified Boolean` field on `User` model — migration `20260426061732_add_is_verified` adds `isVerified @default(false)`; used by dashboard unverified-residents stat
- [x] Dashboard stats endpoint `GET /dashboard/` — `getDashboardStats` controller returns `requestedCount` (REQUESTED pickups), `totalRecords` (COLLECTED pickups), `unverified` (unverified RESIDENT users) from real DB; protected by `authenticateBarangay + requireRoles(["CAPTAIN"])`
- [x] Dashboard recent transactions endpoint `GET /dashboard/recent-transactions` — `getRecentTransactions` controller returns last 3 `CollectionItem` records ordered by `request.createdAt desc`, including related user `firstName`/`lastName`; protected by `authenticateBarangay + requireRoles(["CAPTAIN"])`
- [x] `RecentTransactionTable` component — `frontend/src/components/dashboard/RecentTransactionTable.jsx`; desktop table (date, household name, material pill, actual weight, source, "View Details" link to `/collection-requests/:id`); loading/error/empty states
- [x] `RecentTransactionCard` component — `frontend/src/components/dashboard/RecentTransactionCard.jsx`; mobile card version of recent transactions; tappable, navigates to `/collection-requests/:id`
- [x] Dashboard page wired with real data — `useFetch` drives both stats (`GET /api/dashboard/`) and recent transactions (`GET /api/dashboard/recent-transactions`); skeleton loading and `Error` states; "Pending Collection Requests", "Total Intake Transactions", and "Unverified Residents" cards show live DB data; "Total Recyclables Collected", "Total Program Expenses", and "Current Fund Balance" remain hardcoded pending MRF and Program Funds modules
- [x] **Schema overhaul** — `MaterialType` enum fully replaced by a `Material` DB model; `Category` model added; `Unit` enum (`KG`/`GRAMS`/`LBS`/`PIECE`) replaces `WeightUnit`; all FK references updated across `PickupRequests` (`materialId`, `estimatedValue`, `estimatedUnit`, `isAssorted`), `CollectionItem` (`materialId`, `actualValue`, `actualUnit`), and `ProgramMaterial` (`materialId`); migrations applied
- [x] **`Barangay` model extended** — `municipality`, `province`, `zipCode`, `logoUrl` fields added; `redemptionMode RedemptionMode` enum (`POINTS`/`CASH`/`BOTH`) added; feature flags added: `hasCollectionRequests`, `hasRedemptionManagement`, `hasRewardInventory`, `hasLeaderboard`
- [x] **`Program` model updated** — `barangayId` added (programs now scoped per barangay); `isCashMode Boolean @default(false)` added to support cash-equivalent reward programs; `maxPoints` field removed
- [x] **`ProgramMaterial` model updated** — `materialType` enum replaced by `materialId` FK to `Material`; both `pointValue Float?` and `cashValue Float?` present to support dual reward modes
- [x] **`RedemptionTransaction` restructured** — now uses `RedemptionTransactionItem` line-item model (`transactionId`, `programMaterialId`, `amount`, `currentValue`) instead of a single row per transaction; `quantity` and `currentPointValue` fields removed from the parent record
- [x] **Material endpoints** — `backend/src/controllers/material.controller.js` + `backend/src/routes/material.route.js`; `GET /materials/` (resident, returns materials for their barangay), `GET /materials/barangay` (barangay staff), `GET /materials/categories` (resident, returns categories)
- [x] **Pickup request module overhauled** — `InProgressActions`, `RequestCard`, `RequestTable`, and `MateriaPill` updated to work with `Material` DB records (name, category, unit) instead of the old `MaterialType` enum; capture page material selection now fetches real materials from `GET /materials/`; "mixed" (assorted) checkbox clears the material selection input
- [x] **`DesktopGuard` component** — `frontend/src/components/ui/DesktopGuard.jsx`; blocks desktop-sized viewports on resident-side pages with a mobile-only message; used in resident layout
- [x] **Onboarding page overhauled** — onboarding flow content restructured; steps rewritten for clarity
- [x] **Redemption module restructured** — route moved from `/redemption-programs` to `/redemption`; barangay sidebar and proxy matcher updated; sub-routes: programs list at `/redemption`, program detail at `/redemption/programs/[id]`, transaction detail at `/redemption/transactions/[id]`
- [x] **`GET /redemption/transactions/:id` backend endpoint** — `getTransaction` controller; returns full transaction with nested `redemptionTransactionItem[]` (each with `programMaterial`, `material`, `cashValue`/`pointValue`); registered in `redemption.route.js`
- [x] **Transaction detail page `/redemption/transactions/[id]`** — fetches from `GET /redemption/transactions/:id`; shows Transaction Information card (beneficiary, collector, program name, educational level) and Redemption Items card (per-item material name, category pill, amount, computed value); total row at bottom; displays `₱` for cash-mode programs and `pts` for points-mode; skeleton loading and error states
- [x] **Redemption cash mode** — `AddProgramModal` has an `isCashMode` toggle; `RecordTransactionModal` shows `cashValue` inputs when mode is cash; `TransactionCard` and `TransactionTable` display totals in ₱ or pts depending on program mode; program detail page respects mode for column labels and totals
- [x] **`RecordTransactionModal` overhauled** — now supports multiple line items per transaction to match `RedemptionTransactionItem` schema; add/remove row UI; each row selects a material and enters an amount; sends `items[]` array to backend
- [x] **Resident side UI fixes** — home, community, profile, and request pages fixed for new Material data shape; dashboard `RecentTransactionCard` and `RecentTransactionTable` updated for schema changes; camera open button fixed on capture page; responsivity fixes applied across all resident pages
- [ ] Manual Collection Intake module (Sunday EcoAid manual entry with resident search)
- [ ] Collection schedule module
- [ ] Dashboard remaining hardcoded stats (Total Recyclables Collected, Total Program Expenses, Current Fund Balance) — pending MRF and Program Funds modules

## Current State
App is deployed. Backend runs on Railway (`ecoprofit-production.up.railway.app`).
Frontend proxies `/api/*` to the backend via `next.config.mjs` rewrites, switching
between localhost and Railway based on `NODE_ENV`. CORS origin is now env-var
controlled (`CORS_ORIGIN`). Cookies use `sameSite: "none"` so they work across
origins in production.

Auth is username-based for both residents and barangay staff. The `authenticate`
middleware is split into `authenticateResident` and `authenticateBarangay` to prevent
cross-role token acceptance.

**Schema overhaul is complete.** The `MaterialType` enum has been replaced by a proper
`Material` DB model with a `Category` model. `WeightUnit` is replaced by a `Unit` enum.
All pickup request, collection item, and redemption module fields now reference `materialId`
(FK to `Material`) instead of the old enum. The `Barangay` model gained `redemptionMode`,
feature flags, and additional address fields. `Program` is now scoped per barangay and
supports a `isCashMode` flag. `RedemptionTransaction` now stores line items via the
`RedemptionTransactionItem` model.

The full pickup request lifecycle is end-to-end on the barangay side (list, approve,
decline, schedule, collect, detail page). The capture page fetches real materials from
`GET /materials/` and uses a DB-driven material selector. A `DesktopGuard` component
blocks resident pages on non-mobile viewports.

The Redemption Management module is fully wired and restructured. The route moved from
`/redemption-programs` to `/redemption`. Programs support both points and cash reward
modes. `RecordTransactionModal` handles multiple line items. The transaction detail page
at `/redemption/transactions/[id]` is built and wired. The program detail page is at
`/redemption/programs/[id]`.

The resident side has working data-driven pages: home, community, requests list, request
detail, and profile pages all fetch real API data. The barangay dashboard is partially
wired — three stat cards (Total Recyclables Collected, Total Program Expenses, Current Fund
Balance) remain hardcoded pending the MRF and Program Funds modules.

Next focus: Manual Collection Intake module (Sunday EcoAid manual entry with resident search).

## Key Decisions Made
- httpOnly cookies over localStorage → XSS protection
- Token blacklist in PostgreSQL → production grade logout
- requireRoles as higher-order function → flexible RBAC
- secure: process.env.NODE_ENV === "production" → works in both dev and prod
- generateToken accepts object → cleaner, more flexible
- cookie-parser registered before routes → cookies available everywhere
- CORS credentials: true → required for cookie based auth
- sonner added for toast notifications in barangay layout → consistent error UX without inline state
- resident_token cookie mirrors barangay_token pattern → same authenticate middleware handles both; proxy distinguishes by cookie name
- sameSite: "none" in production → required for cookies to cross the frontend/backend origin boundary on Railway
- CORS_ORIGIN env var → avoids hardcoding the deployed frontend URL in server.js
- next.config.mjs rewrites → frontend calls /api/* locally; Next.js proxies to backend; no CORS preflight from the browser in prod
- postinstall: prisma generate in backend/package.json → Railway runs it automatically after npm install so the Prisma client is always fresh

## Key Files
- backend/src/controllers/auth.controller.js
- backend/src/controllers/pickup-request.controller.js — pickup request creation and all collection-request lifecycle transitions
- backend/src/controllers/redemption.controller.js — createProgram, updateProgram, getPrograms, getProgram, createTransaction, getTransaction, getTransactions
- backend/src/controllers/material.controller.js — getMaterials, getCategories
- backend/src/middlewares/authMiddleware.js — authenticateResident, authenticateBarangay, requireRoles
- backend/src/routes/auth.route.js
- backend/src/routes/pickup-request.route.js — POST /pickup-requests; GET/PATCH/GET-by-id collection-requests routes; COLLECTED transition creates CollectionItem records
- backend/src/routes/redemption.route.js — program and transaction endpoints; GET /transactions/:id added
- backend/src/routes/material.route.js — GET /materials/, GET /materials/barangay, GET /materials/categories
- backend/src/routes/dashboard.route.js
- frontend/src/lib/roles.js — BARANGAY_ROLES array
- backend/src/utils/generateToken.js
- backend/prisma/schema.prisma
- backend/package.json — postinstall: prisma generate (required for Railway deploy)
- frontend/next.config.mjs — /api/* rewrites; env-based backend URL; allowedDevOrigins
- frontend/src/proxy.js — Next.js middleware (Layer 1 route protection) with explicit matcher; /redemption/* paths included
- frontend/src/lib/config.js — shared API_BASE_URL constant
- frontend/src/app/(auth)/barangay/login/page.jsx — barangay login form
- frontend/src/app/(barangay)/dashboard/page.jsx — server component with Layer 2 auth check
- frontend/src/app/(barangay)/layout.jsx — barangay layout with DrawerContext + Toaster
- frontend/src/hooks/useFetch.js — reusable GET fetch hook; refetchCount dep triggers re-fetch; resets isError on each attempt
- frontend/src/hooks/useUpdate.js — PATCH hook exposing updateStatus({ id, status, rejectionReason? })
- frontend/src/hooks/useMutation.js — POST/PATCH hook exposing makeRequest({ url, method?, body }); returns true on success
- frontend/src/components/ui/SkeletonCard.jsx — skeleton loader with rowsCount prop
- frontend/src/components/ui/Spinner.jsx — inline loading spinner
- frontend/src/components/ui/Error.jsx — error state with handleRefetchCount callback
- frontend/src/components/ui/Empty.jsx — empty state with title and subtext
- frontend/src/components/ui/DesktopGuard.jsx — blocks resident pages on non-mobile viewports
- frontend/src/components/redemption/modals/AddProgramModal.jsx — handles create and edit; isCashMode toggle; deactivate/reactivate
- frontend/src/components/redemption/modals/RecordTransactionModal.jsx — multi-item transaction form; preselectedProgram prop; inactive programs filtered
- frontend/src/app/(barangay)/redemption/page.jsx — redemption programs list (was /redemption-programs)
- frontend/src/app/(barangay)/redemption/programs/[id]/page.jsx — program detail with materials breakdown and transaction history
- frontend/src/app/(barangay)/redemption/transactions/[id]/page.jsx — transaction detail with line items breakdown
- frontend/src/app/(barangay)/collection-requests/page.jsx — tabbed collection requests management UI
- frontend/src/app/(barangay)/collection-requests/[id]/page.jsx — full request detail page with timeline and action cards
- frontend/src/lib/formatDate.js — ISO date → readable locale string
- frontend/src/components/requests/RequestDetailHeader.jsx — header card with back button and status pill
- frontend/src/components/ui/LabelValue.jsx — label/value pair display component
- frontend/src/app/(resident)/capture/page.jsx — Cloudinary upload + pickup request submission; fetches materials from DB
- frontend/src/app/(resident)/profile/page.jsx — resident logout
- frontend/src/app/(resident)/home/page.jsx — resident home; fetches profile + recent requests from real API
- frontend/src/app/(resident)/community/page.jsx — community page; fetches and displays live barangay info
- frontend/src/components/navigation/Sidebar.jsx — sidebar with logout handler and leaderboard link
- frontend/src/components/ui/Badge.jsx — reusable pill badge (label, color, className)
- frontend/src/components/ui/SitioPill.jsx — sitio display pill component
- backend/src/controllers/resident.controller.js — getResidentProfile, updateResidentProfile, getBarangayInfo
- backend/src/routes/resident.route.js — GET /resident/me, PATCH /resident/me, GET /resident/barangay-info
- frontend/src/app/(resident)/requests/page.jsx — resident requests list with Ongoing/History tabs, live data, error/empty/skeleton states
- frontend/src/app/(resident)/requests/[id]/page.jsx — resident request detail with photo, timeline, and collection items breakdown

## Known Issues / TODO
- BlacklistedToken cleanup job needed (periodic deletion of expired tokens using the expiresAt field)
- Dashboard partially wired — "Pending Collection Requests", "Total Intake Transactions", and "Unverified Residents" cards show real DB data; "Total Recyclables Collected", "Total Program Expenses", and "Current Fund Balance" are still hardcoded (pending MRF and Program Funds modules)
- Resident Layer 2 auth check (server component calling GET /auth/me) still pending
- `InProgressActions` multi-row form: no client-side validation before submit — empty material/amount rows are silently sent to backend

## Mentor Instructions
Act as a senior dev mentor — guide me, don't just give me answers.
Challenge me first, explain concepts before showing code, ask what 
I've tried, flag shortcuts that hurt my learning. I'm a 3rd year 
BS IT student focused on becoming a full stack developer. My main 
concern is AI over-reliance — make sure I actually understand what 
I'm building.