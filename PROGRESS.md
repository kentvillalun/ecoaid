# EcoAid - AI Context File

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
- [x] InProgress modal max width — `Modal.jsx` given a max-width constraint so the in-progress collection modal doesn't stretch too wide on larger screens
- [x] **`PageTransition` component** — `frontend/src/components/ui/PageTransition.jsx`; wraps children in a `motion.div` (from `motion/react`) with opacity + y-offset fade-in/out animation (duration 0.5s); used by onboarding and auth pages for smooth route transitions
- [x] **`haptics.js` utility** — `frontend/src/lib/haptics.js`; wraps the `bzzz` haptics library with named presets: `light` (selection — casual nav/Next/back), `medium` (snap — form submit/confirm), `success`, `error`, `warning` (toggle — destructive confirm); added `bzzz@^0.1.1` and `motion@^12.40.0` to `frontend/package.json`
- [x] **Onboarding screens 2.0** — `/onboarding` page fully redesigned; new illustrations at `public/onboarding-2.0/onb{1,2,3}.png`; horizontal slide animation between steps via `motion/react`; 4-segment progress bar indicator; animated headline, body text, and button per step (opacity + y fade-in with staggered delay); new copy: step 1 "Recyclables Go to Waste Without a Clear System", step 2 "Your recyclables have value. Benefit from them", step 3 "How EcoAid Works"; haptic feedback on Next button via `haptic.light()`; uses `PageTransition` for entry animation
- [x] **Auth pages visual redesign** — login, signup, OTP, forgot-password, and reset-password pages redesigned; login uses a bottom-sheet card layout (white form rises from green background); `motion/react` animations on form content; new splash screen shows a white EcoAid wordmark on the brand green background and fades out; Android devices skip the splash screen entirely (detected via `navigator.userAgent`); new SVG assets added: `public/ecoaid-logo/logo-wordmark.svg` and `white-logo-wordmark.svg`; `DesktopGuard` now uses `lg:hidden` CSS class approach in auth pages (no separate blocking overlay)
- [x] **Manual Collection Intake module** — `backend/src/controllers/manual-intake.controller.js`: `recordIntake` creates a `ManualIntakeTransaction` with nested `ManualIntakeItems` (one per material/quantity/unit row), then writes one `StockTransactionLog` row per item (`source: MANUAL_INTAKE`, `transactionType: IN`, quantity normalized to KG via `convertToKg`); `getIntakeTransactions` lists a barangay's intake history with resident/sitio and material/category breakdown; `manual-intake.route.js` mounted at `/manual-intake`, protected by `authenticateBarangay + requireRoles(["CAPTAIN","SECRETARY","SK","COLLECTOR"])`. Frontend `/manual-intake` page wired with `useFetch`/`useMutation`: debounced resident search (`GET /api/resident/search?name=`), household-name input shown when no resident match exists, dynamic material/quantity/unit rows
- [x] **Material Stock (MRF) module** — `backend/src/controllers/material-stock.controller.js`: `getStockSummary` groups `StockTransactionLog` by material/transactionType/unit and nets IN vs OUT into a running balance per material, enriched with material name + category; `getTransactionLogs` lists the full log history; `recordStockOut` validates the requested deduction against the current balance before writing an OUT log (`source: MANUAL_ADJUSTMENT`); `material-stock.route.js` mounted at `/material-stock`. Frontend `/material-stock` page wired with `useFetch` (summary + logs) and a stock-out modal wired via `useMutation`
- [x] **Stock ledger schema** — `ManualIntakeTransaction`, `ManualIntakeItems`, and `StockTransactionLog` Prisma models added; `TransactionType` (`IN`/`OUT`) and `Source` (`MANUAL_INTAKE`/`COLLECTION_REQUEST`/`MANUAL_ADJUSTMENT`/`REDEMPTION`/`JUNKSHOP_SALES`) enums added; migrations `20260619032326_add_userid_fk` and `20260619032730_add_performed_by_field` applied
- [ ] Collection schedule module
- [ ] Dashboard remaining hardcoded stats (Total Recyclables Collected, Total Program Expenses, Current Fund Balance) — pending Program Funds module and dashboard wiring to `StockTransactionLog`
- [ ] Wire pickup-request `COLLECTED` transitions and redemption transactions into `StockTransactionLog` — `Source` enum already reserves `COLLECTION_REQUEST` and `REDEMPTION` values for this, but neither controller writes to the stock ledger yet, so Material Stock balances currently reflect manual intake (+ manual stock-out) only
- [ ] Junkshop Sales, Leaderboard, and Reports backend + wiring — pages exist as static UI scaffolds with hardcoded mock data, not linked in the barangay `Sidebar` (`href: ""`)
- [ ] Reward Inventory, Program Funds, Residents, Announcements (barangay-side), and Settings modules — not yet built; `Sidebar` entries reserved but unlinked (`href: ""`)

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
Balance) remain hardcoded pending the Program Funds module and dashboard rewiring.

**Onboarding and auth pages are fully redesigned.** Onboarding uses new illustrations,
horizontal slide animation with `motion/react`, and haptic feedback via `bzzz`. Auth pages
use a bottom-sheet card layout with motion animations and a revised splash screen.

**Manual Collection Intake module is done.** Barangay staff can record Sunday EcoAid intake
(or any direct intake) by searching for a resident or falling back to a household name,
adding one or more material/quantity/unit rows, and submitting. Each submission creates a
`ManualIntakeTransaction` + `ManualIntakeItems` and writes matching `IN` rows to
`StockTransactionLog`.

**Material Stock (MRF) module is done.** `/material-stock` shows a live running balance per
material (net of IN/OUT `StockTransactionLog` rows) plus a full transaction log, and supports
manual stock-out adjustments through a modal. The stock ledger currently only receives `IN`
entries from Manual Intake and `OUT` entries from manual adjustments — pickup-request
collections and redemption transactions do not yet write to the ledger, even though the
`Source` enum reserves `COLLECTION_REQUEST` and `REDEMPTION` values for that.

Next focus: Junkshop Sales module (per the latest commit message), which currently exists
only as an unwired UI scaffold with hardcoded mock data.

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
- backend/src/controllers/manual-intake.controller.js — recordIntake, getIntakeTransactions; writes ManualIntakeTransaction/Items + StockTransactionLog IN rows
- backend/src/controllers/material-stock.controller.js — getStockSummary, getTransactionLogs, recordStockOut; nets StockTransactionLog IN/OUT rows into per-material balances
- backend/src/utils/covertToKg.js — converts quantity + Unit into a normalized KG value for the stock ledger
- backend/src/middlewares/authMiddleware.js — authenticateResident, authenticateBarangay, requireRoles
- backend/src/routes/auth.route.js
- backend/src/routes/pickup-request.route.js — POST /pickup-requests; GET/PATCH/GET-by-id collection-requests routes; COLLECTED transition creates CollectionItem records
- backend/src/routes/redemption.route.js — program and transaction endpoints; GET /transactions/:id added
- backend/src/routes/material.route.js — GET /materials/, GET /materials/barangay, GET /materials/categories
- backend/src/routes/manual-intake.route.js — POST /manual-intake/, GET /manual-intake/
- backend/src/routes/material-stock.route.js — GET /material-stock/, GET /material-stock/transaction-logs, POST /material-stock/transaction-logs/out
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
- frontend/src/components/ui/PageTransition.jsx — motion.div wrapper with opacity+y fade-in/out (used by onboarding and auth)
- frontend/src/lib/haptics.js — named haptic presets wrapping the bzzz library
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
- frontend/src/app/(barangay)/manual-intake/page.jsx — manual intake form with debounced resident search, household-name fallback, dynamic material rows
- frontend/src/app/(barangay)/material-stock/page.jsx — live stock balance table, transaction log, and stock-out modal

## Design Token System (finalized Aug 1, 2026)
Built ahead of the Settings theme-picker feature. A full color audit via
Claude Code found the frontend had 4 rival "green" systems, 5 different
border-grays, and 8 independent status-color maps (all fixed by consolidating
into one token set) — see `Known Issues / TODO` batch-migration note below.

16 CSS custom properties now live in `frontend/src/app/globals.css`'s
`@theme` block:
- `--color-bg` (#f8f8f8), `--color-surface` (#FFFFFF)
- `--color-text-primary` (#1a1a1a), `--color-text-secondary` (#6B7280)
- `--color-border` (#e5e7eb), `--color-dark` (#092517)
- `--color-accent` (#14532D), `--color-accent-hover` (#1f7a42), `--color-accent-light` (#EAF7E3)
- `--color-success` (#74C857), `--color-error` (#E54848), `--color-warning` (#EEB90E)
- `--color-in-progress` (#C88A00), `--color-info` (#1D9BF0)
- `--color-muted-accent` (#9DB2CE), `--color-icon-bg` (#f3f4f6)

Old tokens (`--color-primary`, `--color-cta-color`, `--color-new-primary`,
`--color-new-bg`) are **deleted**. Any code still referencing them
(`bg-primary`, `outline-cta-color`, etc.) is a leftover bug, not intentional.

Design rule: status colors (success/error/warning/in-progress/info) are
intentionally separate from `--color-accent` — status meaning must stay
consistent no matter what accent color a barangay picks for their theme.
`--color-accent` is the only token planned to be swappable per barangay
theme preset (dark mode explicitly deferred, not v1 scope).

`.input`, `.gradient-button`, `.gradient-card`, `.new-border`, `.label`
utility classes in `globals.css` already updated to reference the new
tokens via `var(--color-...)`.

**Migration status: COMPLETE.** All 7 batches + cleanup pass finished and
verified — zero remaining `cta-color`/`new-primary`/`new-bg` references
outside 2 dead/commented lines, ESLint clean. `MIGRATION_LOG.md` reviewed.
3 open decisions from the log resolved:
1. Discard-confirm modal icon (`personal-information.jsx`) → changed from
   `stroke-accent` to `stroke-error` (destructive-action warning icon
   shouldn't be brand green) — pending Haru applying the 1-line fix
2. Program Funds income/expense colors (`text-green-600`/`text-red-600`
   etc.) → **kept as-is, intentional.** Decided these deep/saturated
   Tailwind-named colors serve prominent financial figures better than
   the softer `--color-success`/`--color-error` tokens; not a bug
3. Minor unmapped hex (signup dropdown grays, reports chart border,
   leaderboard `hover:border-[#d1d5db]`) → leaderboard one fixed
   (→ `hover:border-border`); the rest parked in Block J debt

**Theme picker UI direction validated (Aug 2)** via inline mockup —
grid of preset preview cards (mini sidebar-bar + gradient sample button
per card), matches the "curated presets, not a color picker" UX pattern
(Bentodoro-style reference). 5 presets designed, each defining just the
3 themeable tokens (`--color-accent`, `--color-accent-hover`,
`--color-accent-light`) — bg/surface/border/text tokens stay fixed
across all themes since only light mode is in scope:

| Preset | accent | accent-hover | accent-light |
|---|---|---|---|
| Forest Green (default) | #14532D | #1f7a42 | #EAF7E3 |
| Ocean Teal | #115E59 | #0D9488 | #CCFBF1 |
| Sunrise Orange | #9A3412 | #EA580C | #FFEDD5 |
| Royal Purple | #6B21A8 | #9333EA | #F3E8FF |
| Deep Maroon | #7F1D1D | #B91C1C | #FEE2E2 |

UX decisions locked:
- Section header ("Appearance") — consistent with every other Settings
  section, same `SectionHeader` component pattern as rest of app
- Click a preset card = **local preview only** (instant CSS variable
  update via JS, e.g. `document.documentElement.style.setProperty()`),
  zero backend calls per click — avoids wasted requests while browsing
- "Save changes" button sits below the preset grid, only meaningfully
  active when previewed selection differs from the actually-saved theme
- One API call only on Save — commits to DB + updates localStorage
- No confirmation modal — low-stakes, reversible, cosmetic setting
- If user navigates away without saving, **silently revert** to actual
  saved theme — no "unsaved changes" warning needed
- Theme is barangay-level (not per-user), fetched once on login/app
  load, cached to localStorage, applies to both resident and barangay
  staff interfaces
- Dark mode explicitly out of scope for v1

**Schema — DONE (Aug 3).** Decided: store a theme **slug via Prisma enum**
(not raw hex values in DB) — reasoning: hex values live in a frontend
constant, so the last-saved theme can render instantly from localStorage
cache on load, without waiting on a network request. Also decided: no
separate table needed (single value, one per barangay, no history to
track) — just a column on `Barangay`, same pattern as `redemptionMode`.

```prisma
enum Theme {
  FOREST_GREEN
  OCEAN_TEAL
  SUNRISE_ORANGE
  ROYAL_PURPLE
  DEEP_MAROON
}
```
`Barangay.themeAccent Theme @default(FOREST_GREEN)` — migration run and
verified (existing barangay record defaulted correctly).

**Controller/routes — DONE (Aug 3),** new `settings.controller.js` +
`settings.routes.js` (first real Settings-domain file — Junkshop's "Add
Junkshop" still lives in the junkshop-sales controller since it's
junkshop-domain data despite living in Settings UI; theme has no natural
domain home, so it's the first thing to justify a dedicated Settings
controller).
- `GET /settings/theme/resident` (authenticateResident, role RESIDENT)
- `GET /settings/theme/staff` (authenticateBarangay, roles CAPTAIN/SK/
  SECRETARY/TREASURER/COLLECTOR) — both routes call the same `getTheme`,
  kept as two routes since the auth middleware isn't designed to accept
  either token type interchangeably (JWT payload carries `barangayId`
  regardless of role either way, so the query itself is identical)
- `PATCH /settings/theme` (authenticateBarangay, roles CAPTAIN + SECRETARY
  only — theme change requires top admin privilege, Secretary included
  since they handle day-to-day settings/admin work in practice)
- Validation: incoming `themeAccent` checked against the 5 valid enum
  values via `.includes()`, `400` on invalid, `500` on Prisma/server error
- Manually tested via Thunder Client — both GET routes, PATCH with valid
  role (succeeds) and invalid role e.g. SK/COLLECTOR (correctly rejected)

**Next session (frontend):** two pieces, in this order —
1. **App-wide fetch/cache/apply logic** — where the theme gets fetched
   once on login (both resident and barangay redirect flows), cached to
   localStorage, and CSS variables applied on load. This needs to exist
   before Settings page work, since Settings reads from the same context.
2. **Settings page UI** — preset grid (design already validated via
   mockup), local-only preview on click (`document.documentElement.
   style.setProperty()`, no backend call), Save button below the grid
   using `useMutation` to hit `PATCH /settings/theme`, only meaningfully
   active when previewed selection differs from saved theme.

**Unrelated bug noticed mid-session, not yet fixed:** two custom Tailwind
breakpoints (`xs`, `mobile`) used throughout `onboarding/page.jsx` (and
likely other mobile-specific files) were accidentally deleted from the
`@theme` block during the token migration cleanup — original pixel
values unknown/unrecoverable. Suggested placeholder values discussed but
not yet applied: `--breakpoint-xs: 400px`, `--breakpoint-mobile: 500px`
(inferred from usage pattern — `xs` = smallest phones, `mobile` = larger
phones, both below `md`'s 768px). Needs visual verification on a real
device or devtools before locking in, and a grep across the codebase for
other files using `xs:`/`mobile:` that may also be affected.

## Known Issues / TODO
- `StockTransactionLog.performedBy` not set in Manual Intake, Redemption, or
  Collection Request `COLLECTED` transitions — only Junkshop Sales
  (`recordSale`) sets it correctly so far; each of the other three needs
  its own check for whether the performing user's name is already in
  scope before wiring it in (not a one-line fix per file, do as a batch)
- BlacklistedToken cleanup job needed (periodic deletion of expired tokens using the expiresAt field)
- Dashboard partially wired — "Pending Collection Requests", "Total Intake Transactions", and "Unverified Residents" cards show real DB data; "Total Recyclables Collected", "Total Program Expenses", and "Current Fund Balance" are still hardcoded (pending Program Funds module and dashboard rewiring to the stock ledger)
- Resident Layer 2 auth check (server component calling GET /auth/me) still pending
- `InProgressActions` multi-row form: no client-side validation before submit — empty material/amount rows are silently sent to backend
- `StockTransactionLog` is only written by Manual Intake (`IN`) and manual stock-out adjustments (`OUT`); pickup-request `COLLECTED` transitions and redemption transactions do not create ledger entries yet, so Material Stock balances undercount real intake/outflow until those are wired in
- Junkshop Sales, Leaderboard, and Reports pages are static UI scaffolds with hardcoded mock data — no backend, and not linked in the barangay `Sidebar` (`href: ""`)

## Deferred Decisions
- **Neon DB ownership/handover (not urgent — revisit before pilot testing / production handover)**
  Currently on Kent's personal Neon account (same one used for freelance side
  projects). Two branches depending on how the project lands post-graduation:
  - If EcoAid stays generic/multi-barangay (per panel's original scoping) →
    Kent retains DB ownership as neutral infra holder across multiple
    barangay "clients"
  - If one barangay becomes the sole/primary long-term owner → DB should be
    handed off entirely, not left under personal account
  If full handover is needed: do NOT use personal Neon/GitHub account for
  client- or barangay-owned production DBs — create a dedicated account first.
  Schema reapplies automatically via `prisma migrate deploy` against a new
  DB (source of truth is `schema.prisma`, already in the codebase) — only
  the actual data rows need manual export/import via `pg_dump` (use direct
  connection string, not pooled/`-pooler`, since `pg_dump` needs
  session-level SET statements) → restore via `psql` into the new project.
  Ref: https://neon.com/faqs/export-database-sql-file
  Same account-separation rule applies to any freelance client work
  (e.g. balloon business site) — dedicated account before production, not
  personal.

## Mentor Instructions
Act as a senior dev mentor — guide me, don't just give me answers.
Challenge me first, explain concepts before showing code, ask what 
I've tried, flag shortcuts that hurt my learning. I'm a 3rd year 
BS IT student focused on becoming a full stack developer. My main 
concern is AI over-reliance — make sure I actually understand what 
I'm building.

## Vacation Roadmap — Block-Based (replaces fixed weekly dates as of Jun 29)
> Switched from calendar weeks to focus blocks because actual pace is bursty
> (2-3 hrs/day, only on days nothing else is pulling at time), not a uniform
> 3hrs/day every day. A block = however many consecutive free days actually
> show up. One unit of work per block. No block happening in a given week is
> not a slip — it's just no block that week. Roadmap updates when a block
> actually happens or doesn't, not on a fixed weekly cadence.
> AI handles frontend UI scaffolding, Haru handles wiring + backend.
> SplitPals = overflow/break only, no fixed schedule.
> Teachable Machine = during sem (blocked on groupmates' dataset).

- [x] Completed — Manual Collection Intake (end-to-end)
- [x] Completed — Material Stock (end-to-end)
- [x] Block A (completed Jun 29) — Junkshop Sales backend
- [x] Block B (completed Jul 5) — Junkshop Sales + Settings fully wired
- [x] Block C (completed Jul 13) — Announcements module
- [x] Block D (completed Jul 13) — Resident Announcements wiring
- [x] Block E (completed Jul 19) — Residents module + sidebar refactor
- [x] Block F (completed Jul 20) — Leaderboard module
- [x] Block G (completed Jul 25) — Program Funds module fully wired
- [x] Block H (completed Jul 30) — Reward Inventory + Redemption fixes:
      ✅ Beneficiary model + RewardItem + RewardRelease schema + migrations
      ✅ addRewardItem, getRewardItems, releaseReward, getRewardReleases,
         getRewardSummary controllers — all done and tested
      ✅ getBeneficiaries, searchBeneficiary controllers + routes
      ✅ createTransaction updated — beneficiary create-or-find inline,
         collectorName derived from req.user, points added to beneficiary
      ✅ RecordTransactionModal — debounced beneficiary search, two modes
         (existing vs new beneficiary), correct submission body
      ✅ Reward Inventory page fully wired — summary cards, reward items
         table + mobile cards, release history table + mobile cards,
         AddRewardItemModal + ReleaseRewardModal both wired
- [ ] Block I — Reports module
      NOTE (Aug 1): before backend design, need to sit down with actual
      barangay staff (Secretary/Treasurer) — they currently compile reports
      manually in Excel from multiple sources. Need their real column/field
      requirements before designing aggregation + export. Not yet started.
- [x/~] Block I.5 (inserted, Aug 1) — Settings: Theme Picker + Design System Consolidation
      Scope locked: barangay-level (not per-user) accent color theme,
      curated presets only (not full color picker), applies to both
      resident and barangay staff UI. Dark mode explicitly deferred —
      not needed for v1.
      Discovered mid-design: color usage across frontend/src was NOT
      unified (4 rival "green" systems, 5 border-grays, 8 independent
      status-color maps, Card.jsx defaulting to shadow/rounded-3xl
      against the locked no-shadow/12px spec). Full color audit run via
      Claude Code before touching the theme feature — see
      COLOR_AUDIT.md-equivalent findings, 22 inconsistencies catalogued
      and prioritized (High/Medium/Low).
      Decided: fix all 22 findings now (not deferred to Block J) since
      the theme picker can't work correctly on top of untokenized colors.
      New design token system finalized — 16 CSS custom properties in
      globals.css @theme block (see below), replacing the old 4 tokens
      (--color-primary, --color-cta-color, --color-new-primary,
      --color-new-bg, all deleted).
      Token migration in progress via Claude Code, batched by
      module to keep diffs reviewable:
        Batch 1 (ui/ shared components + form inputs) — DONE.
          Regression found: dashboard stat card icons/pills lost color
          (referenced deleted --color-primary via bg-primary/text-primary/
          border-primary/ring-primary) — fix folded into next batch run.
        Batches 2-7 (nav/layout, auth, resident pages, barangay modules,
          stragglers + not-found.jsx + manifest fix) — combined into one
          prompt run due to Claude Code usage limit proximity; includes
          MIGRATION_LOG.md requirement and a scope-creep guard (Claude
          Code is not to proactively "fix" out-of-scope files without
          flagging first — this happened once during Batch 1).
      Next session: pull MIGRATION_LOG.md, run git diff --stat for full
      blast radius, spot-check ~5-6 representative pages across module
      groups, then close out any remaining unmapped colors manually.
- [ ] Block J — Technical debt batch (archive pattern, rate limiting,
      pagination/load more, backend hardening)

## During Sem (Jul 20 onwards)
- [ ] Teachable Machine (image recognition on pickup request)
- [ ] Multi-barangay registration flow
- [ ] Pilot testing prep
- [ ] Deployment hardening
- [ ] SuperAdmin / system configurability (tackle when clearer)