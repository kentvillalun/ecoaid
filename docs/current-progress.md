# Current Progress

## Completed
- Resident-side authentication frontend is fixed and now stable
- Stable auth flows:
  - onboarding
  - login (resident, connected to backend)
  - signup with barangay autocomplete and sitio dependent dropdown (connected to backend)
  - OTP validation (6-digit input, resend cooldown, verify/resend endpoints)
  - forgot password (full flow: phone → OTP → reset password, all connected to backend)
  - reset password page
- Collection Requests UI tabs
- Basic request filtering using mock data
- Approved tab selection and mock batch collection flow to In Progress
- Resident signup address selection (barangay autocomplete + sitio dependent dropdown)
- Backend endpoints for barangay search and sitio listing
- Backend validation for barangay/sitio combinations during registration
- OTP backend: `OtpVerification` model, `sendOtp` utility, verify and resend endpoints
- Forgot password backend: `PasswordResetToken` model, `forgotPassword`, `verifyForgotPasswordOtp`, `resetPassword` controllers + routes
- `resendOtp` updated to handle both signup and forgot-password flows via `otpFlow` param
- Resident capture page: camera access via file input, image preview, submit confirmation UI
- Barangay login backend: `POST /auth/barangay/login` accepts phone + password, validates barangay staff roles (CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR), issues JWT in a `barangay_token` httpOnly cookie (7-day expiry)
- Barangay logout: `POST /auth/logout` clears the `barangay_token` cookie and writes the token to `BlackListedToken` so it cannot be reused
- JWT token utility (`generateToken`) and auth middleware (`authenticate`, `requireRoles`)
- `authenticate` middleware accepts both `barangay_token` cookie and `Authorization: Bearer` header; checks every token against the `BlackListedToken` table before allowing access
- `cookie-parser` middleware registered in `server.js` to parse httpOnly cookies
- `BlackListedToken` model added to Prisma schema (stores revoked tokens until expiry)
- `Role` enum in Prisma schema covers all staff roles: `CAPTAIN`, `SECRETARY`, `TREASURER`, `SK`, `COLLECTOR`, `SUPER_ADMIN`, `RESIDENT`
- Protected dashboard route: `GET /dashboard` (requires valid JWT + CAPTAIN role)

- **Username/password auth system**: `username` field added to `User` model (unique, optional for backward compat); login for both residents and barangay staff now accepts `username` instead of `phoneNumber`
- Signup flow now collects `firstName`, `lastName`, and `username` upfront; backend validates uniqueness and passes them through `register` → `verifyOtp` → `prisma.user.create`
- `authenticateResident` and `authenticateBarangay` split from the single `authenticate` middleware — each only accepts its own cookie (`resident_token` / `barangay_token`), preventing cross-role token acceptance
- `GET /auth/me` now uses `authenticateResident`; new `GET /auth/barangay/me` added using `authenticateBarangay`
- All pickup-request routes updated: resident routes use `authenticateResident`, barangay collection-request routes use `authenticateBarangay`
- `frontend/src/lib/roles.js` created — exports `BARANGAY_ROLES` array for reuse across frontend
- Seed updated: dev admin account now seeded with `username: "barangayadmin"`
- Signup page stores `otpFlow: "signup"` in `sessionStorage` before pushing to `/otp`

- Barangay login frontend connected and bug fixed
- Toast notifications added to the resident capture page (via `sonner`)
- `useUpdate` custom hook: sends `PATCH /api/pickup-requests/collection-requests/:id` with `{ status, rejectionReason }`; returns `true` on success
- Reusable `Modal` component (`components/ui/Modal.jsx`): rendered via `createPortal`, accepts `title`, `subtitle`, `icon`, `status` (for pill), `confirmLabel`, `confirmClassName`, `onConfirm`, `onClose`, and `children`
- Pickup collection end-to-end: barangay admin can **approve** or **decline** `REQUESTED` pickups directly from the collection requests table; decline opens a modal for rejection reason input; toast feedback on success/error; list auto-refetches via `refetchCount` state
- `ApprovedActions` component: barangay admin can **schedule** an approved request, moving it from `APPROVED` → `IN_PROGRESS` (sets `isScheduled: true`)
- `InProgressActions` component: barangay admin can **complete** an in-progress request via a modal that captures actual weight and unit, transitioning `IN_PROGRESS` → `COLLECTED` (sets `collectedAt`, `actualWeight`, `weightUnit`)
- Batch collection wired to backend: selecting multiple approved requests and clicking "Create Batch Collection" fires `Promise.all` of `PATCH` requests, moving each to `IN_PROGRESS`; toast feedback on full success or partial failure; list auto-refetches and selection clears on success
- `updateStatus` backend controller extended to handle all 4 status transitions: `APPROVED` (sets `approvedAt`), `IN_PROGRESS` (sets `isScheduled`), `COLLECTED` (sets `collectedAt`, `actualWeight`, `weightUnit`), `REJECTED` (sets `rejectedAt`, `rejectionReason`)
- `useUpdate` hook extended to forward `actualWeight` and `weightUnit` to the backend
- Full request lifecycle now wired end-to-end: `REQUESTED` → `APPROVED` → `IN_PROGRESS` → `COLLECTED` (or `REJECTED` from `REQUESTED`)

- `ASSORTED` MaterialType — added to `MaterialType` enum in schema; capture page dropdown and yup validation updated to include it
- `CollectionItem` Prisma model — per-material breakdown stored at collection time (`requestId`, `materialType`, `actualWeight`, `weightUnit`)
- `updateStatus` COLLECTED handler upgraded — creates `CollectionItem` records before updating request status; replaces single `actualWeight`/`weightUnit` fields on the request row
- `useUpdate` hook — now forwards `items` array to the backend for the COLLECTED transition
- `InProgressActions` redesigned — simple mode (single weight input) for non-ASSORTED requests; ASSORTED mode shows a dynamic table of rows (materialType/actualWeight/weightUnit) with add/remove row support
- "Finalized Collection" card — detail page `/collection-requests/[id]` shows a breakdown table of `collectionItems` when status is `COLLECTED`; `getRequest` controller now selects `collectionItems` relation
- Capture page sitio auto-fetch — fetches resident's sitio from `GET /auth/me` on mount; displays it as a read-only field
- Login page session guards — redirects to `/home` if already logged in; redirects to `/onboarding` if user hasn't seen it
- Root page redirect — `app/page.js` redirects `/` to `/login`

- **Redemption module — backend foundation**:
  - `Program` model — stores redemption program name, allotted budget, and max points
  - `ProgramMaterial` model — per-material point value scoped to a program; unique constraint on `(programId, materialType)`
  - `RedemptionTransaction` model — records each redemption event: `programMaterialId`, `quantity`, `collectorName`, `beneficiaryName`, `educationalLevel` (`PRIMARY`/`SECONDARY`/`TERTIARY`), and `currentPointValue` snapshot (preserves value at time of transaction)
  - `EducationalLevel` enum added to schema
  - `redemption.controller.js` — `createProgram`, `getPrograms`, `getProgram`, `createTransaction`, `getTransactions`; `createTransaction` snapshots the current `pointValue` from `ProgramMaterial` before writing the record
  - `redemption.route.js` — all routes protected by `authenticateBarangay` + `requireRoles(["CAPTAIN", "SECRETARY", "SK"])`; registered at `/redemption` in `server.js`
  - Endpoints: `POST /redemption/programs`, `GET /redemption/programs`, `GET /redemption/programs/:id`, `POST /redemption/transactions`, `GET /redemption/transactions`

- **Redemption Management frontend — fully wired**:
  - `AddProgramModal` — wired to `POST /redemption/programs`; on success triggers program list refetch
  - `RecordTransactionModal` — new modal (replaces `AddTransactionModal`); form fields: program (select), material (dependent select filtered by chosen program), beneficiary name, collector name, quantity, educational level; wired to `POST /redemption/transactions` via `useMutation`; on success triggers transaction list refetch
  - `redemption-programs/page.jsx` — mock data replaced with real API calls; `useFetch` drives both programs list (`GET /redemption/programs`) and transaction history (`GET /redemption/transactions`); separate `refetchCount` states for each; "Record Transaction" button opens `RecordTransactionModal` passing fetched programs as `data` prop
  - `TransactionTable` and `TransactionCard` — now receive live data from `useFetch` with `isLoading`/`isError` states
  - `mockRequests.js` deleted — collection requests page now fully driven by `useFetch` against `GET /api/pickup-requests/collection-requests`
  - `Badge` — reusable pill badge component accepting `label` and `color` props (used in `TransactionCard`)
  - `Modal` — added `isPill` prop; when true, renders a `Pill` status chip next to the modal title (used by `PendingActions` and `InProgressActions`)

- **Shared UI components added**:
  - `Empty.jsx` — empty state with title and subtext
  - `Error.jsx` — error state with a refetch trigger callback
  - `SkeletonCard.jsx` — skeleton loading placeholder; accepts `rowsCount` prop
  - `Spinner.jsx` — inline loading spinner

- **RequestCard redesigned** — layout now mirrors `TransactionCard`: top row (name, sitio, estimated weight on left; status pill + material pill on right) + footer row (date on left, "View Details" on right) separated by a `border-t`; selected state uses `ring-2 ring-[#74C857] bg-[#F0FAF0]` instead of the old `!important` override

- **Splash screen on login page** — login page shows an animated splash screen on first visit; fades out then redirects based on session state (already logged in → `/home`, hasn't seen onboarding → `/onboarding`, otherwise shows login form); `sessionStorage.getItem("skipSplash")` skips the splash on return navigations (e.g. back from OTP) to prevent re-triggering
- **Web app manifest (PWA)** — `manifest.json` added at `frontend/src/app/`; enables add-to-home-screen on mobile; `display: standalone`, `theme_color: #a8e063`, 192×192 and 512×512 maskable icons, `start_url: /`; barangay login page has its own `manifest.json` as well
- **UI polish** — fixed cut logo icon on Android devices; fixed slow loading issue on onboarding screens; logo position adjusted; input fields given minimum and maximum height values; select input container aligned with `items-center`

- **`contactNumber` field on `Barangay` model** — `contactNumber VARCHAR(20)` added via migration `20260423175548_add_barangay_contact`; seed updated so dev barangay is seeded with `contactNumber: "09177744669"`
- **Resident profile endpoint** — `GET /resident/me` returns `firstName`, `lastName`, `sitio`, `phoneNumber`, `barangay`, `address`; protected by `authenticateResident`
- **Barangay info endpoint** — `GET /resident/barangay-info` returns `name`, `isRegistered`, `contactNumber`, `city` for the authenticated resident's barangay; protected by `authenticateResident`
- **My requests endpoint** — `GET /pickup-requests/my-requests` (`getMyRequest` controller) returns the authenticated resident's own pickup requests; protected by `authenticateResident`
- **Resident home page wired to real data** — fetches resident name and barangay name from `GET /resident/me`; fetches recent requests from `GET /pickup-requests/my-requests`; skeleton loading states, `Error` and `Empty` components used for all states; request cards show material type, notes, date, estimated weight, and status pill
- **Community page fully built** — `/community` page fetches from `GET /resident/barangay-info`; displays EcoAid collection schedule card, accepted materials card, how-it-works steps card, and barangay contact info card (name, registration badge, city, contact number); skeleton loading on all data-driven fields
- **`Badge` component** — standalone reusable pill component at `components/ui/Badge.jsx`; accepts `label`, `color`, and `className` props
- **`SitioPill` component** — new reusable sitio pill at `components/ui/SitioPill.jsx`; maps sitio keys to display labels and color styles
- **`Error` component updated** — now accepts optional `text`, `subtext`, `buttonLabel`, and `buttonClassName` props for flexible reuse across pages
- **Sidebar leaderboard link added** — barangay sidebar now includes a Leaderboard navigation entry
- **Bug fixes** — skeleton alignment fixed; collection request module minor bugs resolved; rejection reason now shown on the request detail page; table items hidden while loading; column layout fixed on the pickup details page; card bug under approved tab resolved; "View Details" text button added for approved items on mobile

- **`GET /pickup-requests/my-requests/:id` backend endpoint** — `getMyRequestsById` controller; query is scoped to the authenticated resident's own `userId` (ownership check); returns `photoUrl`, `materialType`, `status`, `notes`, estimated weight, timeline fields (`createdAt`, `approvedAt`, `collectedAt`, `rejectedAt`, `isScheduled`), and `collectionItems` relation; mounted at `GET /pickup-requests/my-requests/:id`, protected by `authenticateResident`
- **Resident requests list page wired end-to-end** — `/requests` fetches from `GET /pickup-requests/my-requests`; Ongoing tab filters `REQUESTED / APPROVED / IN_PROGRESS`; History tab filters `COLLECTED / REJECTED`; skeleton loading, `Error` and `Empty` states; each card shows photo thumbnail, material type, notes, date, estimated weight, and status pill; tapping a card navigates to `/requests/:id`
- **Resident request detail page fully built** — `/requests/[id]` fetches from `GET /pickup-requests/my-requests/:id`; shows photo banner, Request Information section (material pill, estimated weight, notes textarea, submitted date), Status Timeline section (conditional entries per status with connecting line), and Collection Details section (breakdown table of `collectionItems` when `COLLECTED`, placeholder text otherwise); skeleton loading and error states implemented
- **Home page request cards navigate to detail** — "Recent Requests" cards on `/home` are now tappable and push to `/requests/:id`

- **`PATCH /resident/me` backend endpoint** — `updateResidentProfile` controller; accepts partial updates for `firstName`, `lastName`, `phoneNumber`, `address`; ignores undefined fields; protected by `authenticateResident`
- **`PATCH /redemption/programs/:id` backend endpoint** — `updateProgram` controller; updates `name`, `allotedBudget`, `description`, `maxPoints`, `isActive`; upserts per-material `pointValue` entries when a `materials` map is included; enables program deactivate/reactivate and in-place editing; protected by `authenticateBarangay` + `requireRoles(["CAPTAIN", "SECRETARY", "SK"])`
- **Resident profile page wired to live data** — `/profile` fetches from `GET /api/resident/me`; displays live first/last name and barangay name; skeleton loading and inline error state with retry button; logout flow clears cookie and session storage
- **Personal Information page fully built** — `/profile/personal-information` has an edit mode toggle (`PencilSquareIcon` in header); editable fields for `firstName`, `lastName`, `phoneNumber`, `address`; `sitio` and `barangay` shown as read-only with explanatory note; "Save Changes" button wired to `PATCH /api/resident/me` via `useMutation`; discard-changes confirmation modal (rendered via `createPortal`) when navigating back with unsaved edits; skeleton loading and `Error` states throughout
- **Profile sub-pages (UI shells)** — Notification Settings (`/profile/notifications`): toggle UI for request-status and barangay-update notifications (local state only, not yet wired to backend); Settings (`/profile/settings`): toggle UI for Language and Dark Mode (local state only, not yet wired); Help & Support (`/profile/help-support`): FAQ accordion with 8 static questions about app usage
- **`ResidentHeader` enhancements** — added `handleClick` prop (defaults to `history.back()`); `edit` action type renders `PencilSquareIcon` and toggles edit mode via `setIsEditing`; back arrow now fires `handleClick` instead of always calling `history.back()` directly
- **`Modal` component** — added `cancelLabel` prop for customizable cancel button text (defaults to `"Cancel"`)
- **Resident layout** — profile sub-pages (`/profile/notifications`, `/profile/settings`, `/profile/help-support`) and `/requests/` paths now correctly hide the bottom navigation bar

- **`isVerified Boolean` field on `User` model** — migration `20260426061732_add_is_verified` adds `isVerified @default(false)` to the `User` table; used by the dashboard unverified-residents stat
- **Dashboard stats endpoint `GET /dashboard/`** — `getDashboardStats` controller returns `requestedCount` (pickups in REQUESTED status), `totalRecords` (COLLECTED pickups), and `unverified` (unverified RESIDENT users) from real DB queries; protected by `authenticateBarangay + requireRoles(["CAPTAIN"])`
- **Dashboard recent transactions endpoint `GET /dashboard/recent-transactions`** — `getRecentTransactions` controller returns the last 3 `CollectionItem` records ordered by `request.createdAt desc`, including related user `firstName`/`lastName`; protected by `authenticateBarangay + requireRoles(["CAPTAIN"])`
- **`RecentTransactionTable` component** — `frontend/src/components/dashboard/RecentTransactionTable.jsx`; desktop table showing date created, household name, material pill, actual weight, source, and a "View Details" link to `/collection-requests/:id`; loading/error/empty states
- **`RecentTransactionCard` component** — `frontend/src/components/dashboard/RecentTransactionCard.jsx`; mobile card equivalent of `RecentTransactionTable`; tappable, navigates to `/collection-requests/:id`
- **Dashboard page wired with real data** — `useFetch` drives both stats (`GET /api/dashboard/`) and recent transactions (`GET /api/dashboard/recent-transactions`); skeleton loading and `Error` states on both; "Pending Collection Requests", "Total Intake Transactions", and "Unverified Residents" cards show live DB data; "Total Recyclables Collected", "Total Program Expenses", and "Current Fund Balance" remain hardcoded pending MRF and Program Funds modules

- **Schema overhaul** — `MaterialType` enum replaced by a `Material` DB model; `Category` model added for organizing materials by type; `Unit` enum (`KG`/`GRAMS`/`LBS`/`PIECE`) replaces `WeightUnit`; all FK references updated in `PickupRequests` (`materialId`, `estimatedValue`, `estimatedUnit`, `isAssorted`), `CollectionItem` (`materialId`, `actualValue`, `actualUnit`), and `ProgramMaterial` (`materialId`); migrations applied
- **`Barangay` model extended** — `municipality`, `province`, `zipCode`, `logoUrl` fields added; `redemptionMode RedemptionMode` enum (`POINTS`/`CASH`/`BOTH`) added; feature flags: `hasCollectionRequests`, `hasRedemptionManagement`, `hasRewardInventory`, `hasLeaderboard`
- **`Program` model updated** — `barangayId` FK added (programs scoped per barangay); `isCashMode Boolean @default(false)` added; `maxPoints` field removed
- **`ProgramMaterial` model updated** — `materialType` enum replaced by `materialId` FK; both `pointValue Float?` and `cashValue Float?` present to support dual reward modes
- **`RedemptionTransactionItem` model added** — stores line items per transaction (`transactionId`, `programMaterialId`, `amount`, `currentValue`); `RedemptionTransaction` now uses this instead of a single `programMaterialId`/`quantity`/`currentPointValue` row
- **Material endpoints** — `backend/src/controllers/material.controller.js` and `backend/src/routes/material.route.js`; `GET /materials/` (resident), `GET /materials/barangay` (barangay staff), `GET /materials/categories` (resident)
- **Pickup request module overhauled** — `InProgressActions`, `RequestCard`, `RequestTable`, and `MateriaPill` updated for `Material` DB records; capture page material selector fetches real materials from `GET /materials/`; assorted checkbox clears material input
- **`DesktopGuard` component** — `frontend/src/components/ui/DesktopGuard.jsx`; blocks resident pages on desktop viewports
- **Onboarding page overhauled** — onboarding flow content and structure restructured
- **Redemption module restructured** — route moved from `/redemption-programs` to `/redemption`; sidebar and proxy updated; programs at `/redemption/programs/[id]`; transactions at `/redemption/transactions/[id]`
- **`GET /redemption/transactions/:id` backend endpoint** — `getTransaction` controller; returns full transaction with nested `redemptionTransactionItem[]`; registered in `redemption.route.js`
- **Transaction detail page** — `/redemption/transactions/[id]` built and wired; shows beneficiary, collector, program name, educational level, and per-item breakdown with amounts and computed values in ₱ or pts depending on program mode
- **Redemption cash mode support** — `AddProgramModal` has `isCashMode` toggle; `RecordTransactionModal` handles multiple line items and sends `items[]` to backend; `TransactionCard`/`TransactionTable` display ₱ or pts totals based on program mode
- **Resident side fixes** — home, community, profile, and request pages fixed for new material data shape; dashboard components updated; camera button fixed on capture page; responsivity fixes across all auth and resident pages

- **InProgress modal max width** — `Modal.jsx` given a max-width constraint so the collection modal doesn't stretch on wider screens
- **`PageTransition` component** — `frontend/src/components/ui/PageTransition.jsx`; wraps children in a `motion.div` with opacity + y-offset fade-in/out (duration 0.5s); used by onboarding and auth pages for smooth transitions
- **`haptics.js` utility** — `frontend/src/lib/haptics.js`; wraps the `bzzz` library with named presets: `light` (casual nav), `medium` (form submit), `success`, `error`, `warning` (destructive confirm); `bzzz` and `motion` added as frontend dependencies
- **Onboarding screens 2.0** — onboarding page fully redesigned; new illustrations at `public/onboarding-2.0/onb{1,2,3}.png`; horizontal slide animation between steps; 4-segment progress bar indicator; animated headline/body/button per step with staggered delays; new copy for all 3 steps; haptic feedback on Next via `haptic.light()`; entry animation via `PageTransition`
- **Auth pages visual redesign** — login, signup, OTP, forgot-password, and reset-password pages redesigned; login uses a bottom-sheet card layout with `motion/react` animations; splash screen updated to show white EcoAid wordmark on brand green background with fade-out; Android devices skip the splash screen; new logo SVG assets added (`logo-wordmark.svg`, `white-logo-wordmark.svg`)

---

## In Progress

- Nothing actively in progress

---

## Next Steps (priority order)

1. Build Manual Collection Intake module (Sunday EcoAid manual entry flow with resident search)
2. Build Leaderboard (resident ranking by total contribution)
3. Build Reward Inventory module
4. Build Program Funds module (expenses, junkshop income, profits)
5. Build Material Stock read-only view
6. Reports module

---

## Notes

- Auth frontend bugs are no longer an active work area
- Login is now username-based (not phone number) for both residents and barangay staff
- Avoid unnecessary refactoring of stable auth pages unless required by a new feature
- Barangay options must come only from registered barangays in the system
- No third-party or external address API should be used for signup address selection
- Sitio must stay dependent on the selected barangay to prevent invalid combinations
- Sorting is done during collection or intake
- Sunday EcoAid is household collection
- Override pickups use request lifecycle
- Batch collection moves approved requests into IN_PROGRESS
- Redemption is separate from intake
- Material Stock is read-only and derived from intake transactions
