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

- **Manual Collection Intake module built end-to-end** — `ManualIntakeTransaction` and `ManualIntakeItems` Prisma models added; `recordIntake` controller creates a transaction with nested per-material items and writes matching `IN` rows to a new `StockTransactionLog` ledger (quantity normalized to KG via `convertToKg`); `getIntakeTransactions` lists intake history with resident/sitio and material/category detail; routes mounted at `/manual-intake`, protected by `authenticateBarangay + requireRoles(["CAPTAIN","SECRETARY","SK","COLLECTOR"])`. Frontend `/manual-intake` page: debounced resident search (`GET /api/resident/search?name=`), household-name input shown when no resident match is found, add/remove material rows, wired via `useFetch`/`useMutation`
- **Material Stock (MRF) module built end-to-end** — `getStockSummary` nets `StockTransactionLog` `IN`/`OUT` rows per material into a running balance enriched with material name + category; `getTransactionLogs` lists the full ledger; `recordStockOut` validates the deduction against current balance before writing an `OUT` row (`source: MANUAL_ADJUSTMENT`); routes mounted at `/material-stock`. Frontend `/material-stock` page: live balance table, transaction log, and a stock-out modal wired via `useFetch`/`useMutation`
- **Stock ledger schema** — `StockTransactionLog` model added with `TransactionType` (`IN`/`OUT`) and `Source` (`MANUAL_INTAKE`/`COLLECTION_REQUEST`/`MANUAL_ADJUSTMENT`/`REDEMPTION`/`JUNKSHOP_SALES`) enums; migrations `20260619032326_add_userid_fk` and `20260619032730_add_performed_by_field` applied. Only `MANUAL_INTAKE` and `MANUAL_ADJUSTMENT` sources are wired up so far — pickup-request collections and redemption transactions don't write to the ledger yet

---

## Completed (continued — modules built after the last full update above)

- **Junkshop Sales module built end-to-end** — `recordSale`, `getJunkshopSales`, `getJunkshopsWithPrices`, `getJunkshopDetails`, `addJunkshop`, `getJunkshops` controllers; frontend page fully wired with price comparison table, `HoverPortal`, `RecordSaleModal`
- **Announcements module built end-to-end** — `AnnouncementCategory` enum; all four controllers; admin page with category filter tabs; resident page with read-more and `localStorage` read-tracking
- **Leaderboard module built end-to-end** — two-leaderboard approach (by Kilogram, by Piece); `getRankedLeaderboard` helper using `Promise.all`
- **Program Funds module built end-to-end** — `addExpense`, `getExpenses`, `getProgramFundSummary` controllers and frontend wiring complete
- **Reward Inventory module built end-to-end** — `Beneficiary`, `RewardItem`, `RewardRelease` schema + migrations; `addRewardItem`, `getRewardItems`, `releaseReward`, `getRewardReleases`, `getRewardSummary`, `getBeneficiaries`, `searchBeneficiary` controllers; `RecordTransactionModal` (debounced beneficiary search, existing/new beneficiary modes); Reward Inventory page fully wired (summary cards, tables, mobile cards, `AddRewardItemModal`, `ReleaseRewardModal`)
- **Settings — Add Junkshop modal** complete

---

## Completed (continued — Aug 19, 2026 update)

- **Settings — Theme Picker shipped, then extended** — `Theme` enum grew from 5 to 7 presets (`EARTH_BROWN`, `SUNFLOWER_GOLD` added on top of Forest Green/Ocean Teal/Sunrise Orange/Royal Purple/Deep Maroon); `settings.controller.js` validation and `frontend/src/lib/themes.js` updated to match
- **Settings — Add Material** shipped (add-only, category dropdown fetched live, unit dropdown hardcoded against the fixed `Unit` enum); `settings/page.jsx` split into `JunkshopsSection.jsx`/`MaterialsSection.jsx`/`AppearanceSection.jsx`
- **Material Stock renamed to MRF Inventory** — `material-stock` controller/route/page deleted, replaced 1:1 by `mrf-inventory.controller.js`/`route.js`/`app/(barangay)/mrf-inventory/`; `getStockSummary`/`recordStockOut` logic unchanged, but `getTransactionLogs` now computes a running per-material balance (`currentTotal`) chronologically instead of just returning a flat log list; mounted at `/mrf-inventory`; Sidebar and `proxy.js` updated
- **Notifications module built end-to-end** — new `Notifications` model (`userId`, optional `pickupRequestId`, `type` reusing the `Status` enum, `isRead`, `createdAt`); `User.lastSeenAnnouncementAt` added; `notification.controller.js` — `getNotifications` (lists + auto-marks-read + prunes read notifications older than 30 days + computes `hasUnreadAnnouncements`) and `getUnreadStatus` (badge check); mounted at `/notifications` (resident-only, no POST — notifications are a side effect of pickup-request status transitions, written by `pickup-request.controller.js`'s `listRequests`/`updateStatus` on APPROVED/IN_PROGRESS/COLLECTED/REJECTED/EXPIRED). Frontend: `NotificationBell.jsx` (polls unread-status, badge dot) replaces the old dead bell in `ResidentHeader`; new `/notifications` page; `getNotificationMessage()` helper added to `statusStyles.js`
- **Residents module (barangay-side) built** — new `barangay.controller.js`/`route.js` (`GET /barangay/sitio`); `EditResidentModal.jsx` lets staff edit a resident's name/phone/sitio/verified status from `/residents`; `resident.controller.js` gained `editResident` (`PATCH /resident/:id`); `GET /resident/me` now also returns `isVerified`
- **Resident Standings page built** (`/standings`) — top-3 podium + rank list, By Kilogram/By Piece type filter, gated behind `isVerified`. This session added a timeframe filter (mirrors the barangay Leaderboard page's All Time/This Week/This Month pattern), corrected the podium grid to 1/2/3 columns depending on how many residents are actually ranked (was hardcoded to 3), and added a helper message card ("Climb the standings...")
- **Barangay Leaderboard timeframe filter** — `getRankedLeaderboard` gained `timeFrame` support (`weekly`/`monthly` cutoffs, else all-time); `leaderboard/page.jsx` got a desktop-pill + mobile-dropdown period filter UI; `getResidentLeaderboardStats` (used by the resident Standings page above) updated this session to forward `timeFrame` the same way
- **Collection Request overhaul ("from adviser suggestion")** — `PickupRequests` gained `barangayId` (direct FK, requests now barangay-scoped) and `closedAt`; `Status` enum gained `CANCELLED`/`EXPIRED`; `listRequests` lazily auto-expires `REQUESTED` requests older than 2 days on every fetch (pull-based, no cron job) and writes matching `Notifications` rows; `RequestCard`/`RequestTable`/`HoverReveal` overhauled to render the new statuses; `StatusChip` gained its first-ever counts feature in this commit
- **Resident request cancellation** — `PATCH /pickup-requests/:id/cancel` (ownership + `REQUESTED`-only guard via `updateMany`, rejects otherwise); `CancelRequestAction.jsx` confirmation modal wired into `/requests/[id]`
- **`ResidentRequestCard` shared component** — new `components/requests/ResidentRequestCard.jsx` with `compact` (Home "Recent Requests") and `list` (`/requests`) variants, replacing near-duplicate inline card JSX that previously lived separately in each page
- **Redemption transaction breakdown UI** — `TransactionTable.jsx` now shows up to 2 material tags + "+N more" with a `HoverPortal` popover breaking down every line item (material/amount/value/total in ₱ or pts); `getTransactions` selects `material.defaultUnit`
- **`StatusChip` generalized + bug fixes** (this session) — replaced the hardcoded `from="collection-requests"|"program-funds"` branching (added in the collection-request-overhaul commit above) with a generic `getItemValue={(item) => item.field}` prop, so any page can wire it up without editing StatusChip's own source; fixed the Announcements page's category filter tabs always showing empty counts (`data` prop was never passed to `StatusChip`, and `CATEGORY_TABS` used bare-string keys instead of the array-key convention used elsewhere); fixed `collection-requests/page.jsx`'s `STATUS_TABS` being recreated every render (moved to module scope) and its initial tab state being a hardcoded string instead of `STATUS_TABS[0].key`
- **`DropdownFilter` shared component** (this session) — new `components/ui/DropdownFilter.jsx`, extracted from the Redemption Management page's existing program filter; Junkshop Sales' Sales History table gained a junkshop filter dropdown (lists every junkshop on file with a correct sales count, including 0, plus a junkshop-specific empty state) built on the same component; fixed a backend bug where `getJunkshopSales` never selected `junkshop.id`, which silently broke the new filter's per-junkshop grouping

---

## Completed (continued — Aug 23, 2026 update)

- **Reports module backend complete** — `filterReports` (`reports.controller.js`) now implements all four report types end-to-end (previously only `mrf-inventory` existed, and it never sent a response). `mrf-inventory` uses `.reduce()` to aggregate `StockTransactionLog` by material+day into `quantityIn`/`quantityOut`/`net` (also now selecting `category`, which was fetched but dropped from the grouped result). `collection-intake` `.map()`s two independent sources (`PickupRequests` COLLECTED records, `ManualIntakeTransaction` records) into a common shape and merges them via array spread — no aggregation needed since they're parallel, non-overlapping sources. `redemption` uses `.map()` + `.find()` — `RedemptionTransaction` as the base record, matched against `RewardRelease` by `beneficiaryName` — with explicit null-handling (`dateReleased`/`rewardReceived` null, `pointsSpent` 0) for beneficiaries who haven't received a reward yet. `program-funds` normalizes `JunkshopSale` and `ProgramExpense` into one common ledger shape (`mergedRows`) plus separately-computed `totalIncome`/`totalExpense`/`net` summary numbers. Date-range filtering uses `gte`/`lt` with a next-day-midnight boundary (not `lte` at the same day, which would silently drop the end date itself); each `switch` case wrapped in `{ }` to avoid same-named `const` declarations colliding across cases.
- **Reports page (`/reports`) UI scaffolded** — old hardcoded-mock placeholder (fake stat cards, bar chart, "Recent Activity" table) removed rather than moved, since it duplicated content already real and working on the Dashboard page. New structure: page header with a single page-level "Export all" button (stub for now — shows a toast, not yet wired to real export logic) sitting in its own row below the header, not inline in the header row; four independent sections (Material Stock, Collection & Intake, Redemption & Rewards, Program Funds), each owning its own date-range state and its own `useFetch` call against `GET /reports?type=...&startDate=...&endDate=...`, no shared state across sections. Program Funds section additionally shows three summary cards (Total Income/Total Expense/Net) and reuses the existing `HoverPortal` component (same one Junkshop Sales already uses) to show a materials breakdown on hover for income rows, instead of adding a new column.
- **`DateRangePicker` component** (`components/reports/DateRangePicker.jsx`) — icon + dropdown-select control matching Leaderboard's period filter and `StatusChip`'s `FunnelIcon` + "Filter:" convention. Four options: This week / This month (computed internally, no date inputs shown) / Custom range (two date inputs) / Custom date (one date input, mirrored into both `startDate` and `endDate` on change). Defaults to "This month" on mount, independently per section.
- **Leaderboard period filter — real bug fixed** — `period` state was initialized to the literal `"All Time"` (a label, not a valid `PERIODS` key), so the initial highlighted state never matched, and the mobile dropdown button rendered the raw `period` value instead of its label (e.g. showed `"weekly"` instead of "This Week"). Fixed: initialized to `"all"`, button now renders `PERIODS.find(p => p.key === period)?.label`. Desktop pill row + mobile-only dropdown consolidated into a single dropdown shown at every breakpoint; `FunnelIcon` + "Filter:" prefix added to match `StatusChip`. Separately confirmed via a direct DB check that "This week"/"This month" showing empty under the default "By Kilogram" toggle is correct behavior, not a bug — the barangay's recent stock-in activity is all PIECE-unit, all KG-unit transactions are ~2 months old; "By Piece" shows the recent data correctly.
- **`JunkshopSale.performedByRole String?`** added (migration applied, nullable, no backfill needed) — brings `JunkshopSale` in line with `ProgramExpense`/`RewardRelease`, which already snapshot both `performedBy` and `performedByRole` at write time. `recordSale` now captures `role` from `req.user` the same way `addExpense`/`releaseReward` already do; both Junkshop Sales and the Program Funds transaction log display it (name + role subtext, matching the existing expense-row pattern).
- **"N/a" replaced with em dash (`—`)** across the Junkshop Sales price comparison table (desktop + mobile) — consistent "intentionally not applicable" convention, matching how the Program Funds ledger already shows `—` for income rows' Program column.
- **Program Funds Transaction Log "Name" column added** — `ProgramExpense.name` was already being fetched but never rendered; Description now correctly holds only the description/"Sold to" text, separate from Name.
- **Non-functional search bar removed from `BarangayHeaderCard`** (shared by every barangay page, so this took effect site-wide) — was decorative only, never wired to anything, flagged by the adviser as misleading.

---

## Completed (continued — Aug 24, 2026 update)

- **Reports module — Excel export shipped end-to-end.** `POST /reports/export` (`exportReports` in `reports.controller.js`) accepts a nested JSON body — `mrfInventory`, `collectionIntake`, `redemption`, `programFunds`, each with their own `startDate`/`endDate` (redemption also optionally takes `programId`) — mirroring the fact that each section on the live Reports page owns an independent date range. Reuses the exact same query logic as `filterReports` via shared helper functions extracted to `backend/src/utils/reportHelpers.js` (`getMrfInventoryReport`, `getCollectionIntakeReports`, `getRedemptionReports`, `getProgramFundsReport`), run concurrently via `Promise.all` rather than sequentially.
- **Workbook generation via `exceljs`** — one workbook, four sheets (MRF Inventory, Collection & Intake, Redemption & Rewards, Program Funds). Each sheet gets a merged title row (report name + the date range actually used), header rows set manually rather than via `sheet.columns` (Program Funds needs two differently-shaped tables — a summary block, then a ledger — in one sheet, which `sheet.columns` can't express), explicit per-column widths, wrap-text alignment on line-broken/multi-value cells, thin borders on every data cell, and landscape + fit-to-width page setup on the wider sheets for printing.
- **Multi-value cells use `.map().join("\n")`, not merged cells** — material/quantity/category (Collection & Intake) and material/quantity/category/reward-received/date-released (Redemption & Rewards) are separate parallel columns, line-broken and positionally aligned rather than using Excel cell merging. Deliberate simplicity trade-off — Reports isn't a print-critical visual deliverable, and `.join("\n")` avoids the extra bookkeeping merged cells need to stay aligned across variable-length arrays.
- **Frontend export trigger** — `handleExportAll` on `/reports` fetches `POST /api/reports/export` with all four sections' current date ranges, reads the response as a `Blob`, and triggers a download via a programmatically created, clicked, and removed anchor element with a revoked object URL. No visible intermediate UI — single click from the user's perspective.
- **Real bug fixed: Redemption & Rewards was dropping reward releases.** `getRedemptionReports` previously used `.find()` to match a beneficiary's redemption to their reward release, silently keeping only the first release when a beneficiary had multiple in the same period. Now uses `.filter()` — `rewardReceived` is an array (each entry carrying its own `date`) instead of a single nullable object; the old separate `dateReleased` field is gone in favor of per-entry dates on each release.
- **Cash-mode vs. points-mode labeling fixed** — `RedemptionTransaction`'s report row now carries `isCashMode` (joined from `program.isCashMode`); both the live Redemption & Rewards report UI and the Excel export format Earned/Spent as ₱ currency vs. points accordingly. Cash-mode rows show `—` for Reward Received/Date Released/Spent (cash payouts have no separate release step); points-mode rows with no release yet show "Not yet released" (not `—`) and "0 pts" for Spent.
- **`Material.unit` added to the Redemption report's `materialsCollected`** — was previously missing since `RedemptionTransactionItem` never stored its own unit. Confirmed real-world materials have a fixed, physically-determined unit, so reading `Material.defaultUnit` at query time is correct without a schema change.
- **Program filter added to the live Redemption & Rewards report section** — dropdown alongside the existing date filter, defaults to "All Programs"; matches backend `programId` support that already existed on `filterReports` and now also on `exportReports`.

**Known technical debt / flagged limitations, not yet fixed:**
- **Redemption-to-release matching is still by `beneficiaryName` only** — no direct schema link between `RedemptionTransaction` and `RewardRelease`. Correctly handles the standard one-visit-per-event flow (SK's one-day program model), but if a beneficiary has multiple redemption transactions *and* multiple reward releases within the same report period, all of that beneficiary's releases in the period appear duplicated across every one of their redemption rows. Confirmed as a testing artifact, not an expected real-world scenario — revisit only if stakeholders confirm multi-visit scenarios actually occur in real operations.
- Points-scoping bug (`Beneficiary.points` as a global balance, not per-program) — carried over, still open, see Next Steps.
- `JunkshopSale.performedByRole` display, UI polish ("N/a" → em dash), non-functional global search bar — all carried over from prior sessions, still open where not already covered above.

---

## In Progress

- **Super Admin module configuration** — scope confirmed (full UI required, not a seed-file shortcut) but not started; barangay `has___` feature flags exist on the schema but nothing manages or reads them yet.

---

## Next Steps (priority order)

1. Super Admin module configuration — full UI to toggle `has___` feature flags per barangay, plus conditional rendering on the barangay-facing side (Sidebar, dashboard, etc.) so a barangay without a flag doesn't see that module at all
2. Technical debt batch:
   - Points-scoping bug — `Beneficiary.points` is a single global running balance, not scoped per-program, so a beneficiary can earn points under one program and spend them under an unrelated one, undermining each program's own collection incentive. Planned fix: compute points per-program on the fly (`sum(RedemptionTransactionItem.amount * currentValue)` minus `sum(RewardRelease.quantity * RewardItem.pointCost)`, both scoped to the same `programId`) instead of trusting the stored global field. Affects the Redemption "Record Transaction" modal and the Reward Release modal.
   - Redemption-to-release matching by `beneficiaryName` only (no schema-level link) — revisit if stakeholders confirm multi-visit-per-period scenarios occur in real operations
   - Archive pattern (soft delete) — panel forbids hard deletion
   - Rate limiting and other backend security/hardening (explicitly deprioritized until core features are complete)
   - Pagination / load more pattern
   - Backend hardening (input validation, consistent error format)
   - Dashboard rewiring (3 hardcoded stat cards — should now be unblocked since Program Funds is done)
   - `StockTransactionLog` not written by pickup-request `COLLECTED` transitions or redemption transactions
   - `performedBy` not set in Manual Intake, Redemption, or Collection Request
3. Super Admin UI, image recognition integration (Teachable Machine, per earlier roadmap notes — see `PROGRESS.md` for full remaining roadmap)

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
- MRF Inventory (renamed from Material Stock) is read-only and derived from intake transactions
- MRF Inventory currently nets only Manual Intake (`IN`) and manual stock-out adjustments (`OUT`); it does not yet include pickup-request collections or redemption transactions
- Notifications are created server-side only, as a side effect of pickup-request status transitions (APPROVED/IN_PROGRESS/COLLECTED/REJECTED/EXPIRED) — there is no endpoint for a client to create one directly
- Redemption report rows carry `rewardReceived` as an array (one entry per release, each with its own date), not a single nullable object — both the live report UI and the Excel export must handle multiple releases per beneficiary per period
- Reports export (`POST /reports/export`) and the live filter (`GET /reports`) share the same query logic via `backend/src/utils/reportHelpers.js` — any future report-shape change should go in the helper, not be duplicated in both places