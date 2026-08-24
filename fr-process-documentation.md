# EcoAid — Functional Requirement Verification & Process Documentation

Verified against the running app (barangay dashboard at `/dashboard` login `barangayadmin`/`barangay123`, resident PWA) and the backend source (`backend/src/controllers/*`, `backend/src/routes/*`, `backend/prisma/schema.prisma`) on 2026-08-24.

**Roles** (`Role` enum): `RESIDENT`, `CAPTAIN`, `SECRETARY`, `TREASURER`, `SK`, `COLLECTOR`, `SUPER_ADMIN`. The dev seed only creates one `CAPTAIN` account — no `SECRETARY`/`TREASURER`/`SK`/`COLLECTOR`/`SUPER_ADMIN` account exists anywhere in the system today (see FR4), so role-gates below for those roles are verified from route-file code (`requireRoles([...])`), not from a live login as that role.

**Pickup request `Status` enum** (also reused, oddly, by `Notifications.type`): `REQUESTED, APPROVED, IN_PROGRESS, COLLECTED, REJECTED, CANCELLED, EXPIRED`. `docs/request-lifecycle.md` and `docs/business-rules.md` only document `REQUESTED → APPROVED → IN_PROGRESS → COLLECTED` and `REQUESTED → REJECTED` — `CANCELLED` and `EXPIRED` exist in code and in the live UI but are undocumented in `/docs`.

---

### 1. Register User Account

**Roles allowed:** Public (no auth) — `POST /auth/register`, `POST /auth/verify-otp`.

**Process steps:**
1. Resident opens `/signup`. Fields: First name, Last name, Username, Phone number, Barangay (free-text autocomplete), Sitio (dropdown), Password, Confirm password, "I accept Terms & conditions and Privacy policy" checkbox.
2. Resident types into **Barangay** — a debounced suggestion list appears (backend-driven, `GET /auth/barangays?search=`, no third-party address API, per `CLAUDE.md`).
   - Branch: if the typed text isn't selected from the suggestion list, inline error "Please select a barangay from the suggestions" — a barangayId must come from a real selection, not free text.
3. Selecting a barangay populates **Sitio** as a dependent dropdown (`GET /auth/barangays/:barangayId/sitios`).
4. Resident fills Password/Confirm password and checks the Terms checkbox, then taps **Create Account**.
   - Branch (client-side, empty submit): every field shows its own inline error — "First name is required", "Last name is required", "Username is required", "Phone number is required", "Barangay is required", "Sitio or Purok is required", "Password is required", "Please confirm password", "You must accept the Terms and Conditions to continue". Confirmed live.
5. On submit, frontend calls `POST /auth/register`. Backend re-validates everything server-side (all fields required via `!field` checks; `barangayId`/`sitioId` format-checked as UUID; sitio re-verified to belong to that barangay; `password === confirmPassword`; `termsAccepted !== true` rejected), checks phoneNumber and username are not already taken, then sends an OTP and stores it in `OtpVerification` (expires in 10 minutes). **The `User` row is NOT created at this step.**
6. Frontend stores pending registration data in `sessionStorage` and redirects to `/otp`.
7. Resident enters the 6-digit code and taps **Verify Code**, which calls `POST /auth/verify-otp`.
   - Branch: wrong/expired code → 400 "Invalid or expired verification code"; address data is **re-validated a second time** here (defense against tampering with `sessionStorage` between steps).
8. On success, the backend creates the `User` row (`role: RESIDENT`, `isVerified: false` by default), deletes the used OTP, and returns 201. **The backend does not set a session cookie here.**
9. Frontend clears its `sessionStorage`, sets a "Account created! You can now log in." toast flag, and redirects to `/login`.
10. Resident must type their new username/password on `/login` and sign in manually to actually start a session (see FR2).

**Fields involved:**
- First name — text — required (server + client)
- Last name — text — required (server + client)
- Username — text — required, must be unique (server 400 "Username is already taken")
- Phone number — text — required, must be unique (server 400 "This phone number is already registered")
- Barangay — selected from autocomplete → `barangayId` UUID — required, must resolve to a registered barangay
- Sitio — dependent dropdown → `sitioId` UUID — required, must belong to the selected barangay
- Password / Confirm password — required, must match exactly
- Terms & Conditions checkbox — required, must be boolean `true`

**Discrepancies found:**
- The FR draft description matches the live form field-for-field (first/last name, username, phone, barangay, sitio, password, terms). No missing/extra fields.
- **Registration does not auto-log the new resident in.** Verified live: after creating a brand-new account ("FRTest Walkthrough") and completing OTP, the app redirected to `/login`, not `/home`, and no session cookie was set for the new user (confirmed via `GET /api/resident/me` still returning the previously logged-in resident's data). The user must sign in with their new username/password afterward.
- **Confirmed live bug, worth flagging strongly:** if a *different* resident's session is still active in the same browser when a new account finishes signup, the post-OTP `router.push("/login")` gets intercepted by `/login`'s own "already logged in → skip straight to `/home`" guard (`frontend/src/app/(auth)/login/page.jsx`). The brand-new user is silently dropped into the **previous** resident's home dashboard instead of ever seeing a login form for their own account. Reproduced directly: after registering "FRTest Walkthrough" while Kent Villalun's session was still cached, the OTP screen redirected straight into Kent's `/home` (Kent's contribution stats, Kent's requests) with zero indication anything was wrong. This is a real risk on a shared/household device where a second family member registers their own account after the first is already logged in.

**Open questions:**
- Should `verify-otp` set a session cookie directly (auto-login) instead of bouncing to `/login`? If the answer is "no, always require a fresh manual login," the `/login` page's already-logged-in redirect guard should special-case "just finished signup" so it doesn't route into a stale session.

---

### 2. Log In User Account

**Roles allowed:** Public (no auth) — `POST /auth/login` (resident), `POST /auth/barangay/login` (barangay staff).

**Process steps:**
1. **Resident:** `/login` — fields "Username", "Password" (with Show/Hide toggle) — submit calls `POST /auth/login`.
2. **Barangay staff:** `/barangay/login` — fields "Username", "Password" (Show/Hide) — submit calls `POST /auth/barangay/login`.
   - Branch (client-side, empty submit, confirmed live on `/barangay/login`): "Username is required", "Password is required".
3. Backend looks up the user by `username`, verifies `bcrypt.compare(password, passwordHash)`, checks `user.isActive` (403 if inactive), and on success sets an httpOnly session cookie (`resident_token` or `barangay_token`) plus returns role/barangay info used to route the user to the correct interface (resident → `/home`, barangay → `/dashboard`).
4. `authenticateResident` and `authenticateBarangay` are two separate middleware functions, each only accepting its own cookie name — a resident token cannot be used against a barangay-only route and vice versa.

**Fields involved:** Username — text — required. Password — text (masked) — required.

**Discrepancies found:** None against the FR draft ("log in using their credentials to access features based on their role" — confirmed: resident vs. barangay-staff role is read from the JWT and drives which set of routes/pages the session can reach).

**Open questions:** None.

---

### 3. Register Barangay Account

**Roles allowed:** N/A — **not implemented anywhere in the codebase.**

**Process steps:** None to document. A repo-wide search for `registerBarangay`, `createStaff`/`addStaff`, and any route gated with `requireRoles(["SUPER_ADMIN"])` returns zero hits. `SUPER_ADMIN` exists only as a schema enum value and in old migration SQL; no controller, route, or UI screen references it. The only place a `Barangay` row is created is `backend/prisma/seed.js`, a one-off dev seed script (`node prisma/seed.js`) that hardcodes a single barangay ("Beddeng Laud") and its `CAPTAIN` admin account — it is not an API endpoint and is not reachable from the app.

**Fields involved:** None (nothing to input against).

**Discrepancies found:** Matches the FR table's own footnote — "Register Barangay Account" is explicitly listed as "committed scope pending implementation ahead of final defense." Confirmed accurate: 0% built, not even a stub route or an unlinked UI page.

**Open questions:** What module enables per-barangay feature flags at registration time (the FR description mentions "configure which system modules are enabled for that barangay")? The `Barangay` model does have boolean feature-flag columns (`hasCollectionRequests`, `hasRedemptionManagement`, `hasRewardInventory`, `hasLeaderboard`) already in the schema, but nothing reads or writes them anywhere in the current controllers — they're unused columns today.

---

### 4. Set Up Staff Accounts and Roles

**Roles allowed:** N/A — **not implemented anywhere in the codebase.**

**Process steps:** None to document. Same search as FR3 turns up no staff-account-creation endpoint or UI. The only way any `User` row gets a barangay staff `Role` (`CAPTAIN`/`SECRETARY`/`TREASURER`/`SK`/`COLLECTOR`) today is a direct database write — the seed script hardcodes one `CAPTAIN`. There is no "Add Staff" button, modal, or route anywhere in `frontend/src/app/(barangay)/`.

**Fields involved:** None.

**Discrepancies found:** Matches the FR table's footnote (also listed as "committed scope pending implementation"). Confirmed accurate — genuinely 0% built. Every role-gate documented in this file below (e.g. "CAPTAIN, SECRETARY, SK") is therefore currently un-testable for any role except CAPTAIN, since no other role's account can be created through the product.

**Open questions:** Until this exists, every "authorized barangay staff" access-control decision in the other 29 FRs is unverifiable end-to-end by an actual person logging in as that role — only code-level `requireRoles()` review (done throughout this document) is possible right now.

---

### 5. Create Pickup Request

**Roles allowed:** `RESIDENT` — `POST /pickup-requests` (`authenticateResident + requireRoles(["RESIDENT"])`).

**Process steps:**
1. Resident opens `/capture` ("Capture Recyclables"). Only a photo capture control is shown initially: dashed camera placeholder, "Capture your recyclables / Use your camera to take a photo for verification", and an **Open Camera** button.
2. Tapping **Open Camera** opens the device's native camera/file picker (`<input type="file" accept="image/*" capture="environment">`).
3. Once a photo is chosen, the placeholder is replaced by a preview and two buttons appear: **Retake** and **Next**.
4. Tapping **Next** uploads the photo directly to Cloudinary (unsigned upload preset) and shows a loading toast ("Uploading photo...") then a success toast ("Photo uploaded!"). Only after a successful Cloudinary upload does the rest of the form appear.
   - Branch: Cloudinary upload failure → error toast, form does not reveal.
5. Form fields reveal: **Mixed/ Assorted materials** checkbox, **Material category** dropdown, **Material** dropdown (dependent on category), **Estimated value** (number) + unit dropdown (kg / grams / lbs / piece/s), **Purok / Sitio** (read-only, auto-filled from the resident's own profile via `GET /auth/me`), **Notes (Optional)**.
   - Branch: checking **Mixed/ Assorted materials** hides both the Material category and Material dropdowns and shows an italic note, "Collector will identify materials during pickup." Confirmed live.
6. Resident taps **Submit Request**.
   - Branch (client-side yup validation): Estimated value required, must be a positive number; Estimated unit required (one of KG/GRAMS/LBS/PIECE); Material is required **unless** Assorted is checked.
7. `POST /pickup-requests` is called with `{ materialId (null if assorted), estimatedValue, estimatedUnit, isAssorted, photoUrl, notes }`. `userId`/`barangayId` come from the JWT, not the request body.
   - Branch (server-side): rejects with 400 if `estimatedValue`, `estimatedUnit`, or `photoUrl` is missing, or if `!isAssorted && !materialId`.
8. On success (201), a confirmation modal appears: "Request Sent! / Your barangay will review your collection soon." Tapping anywhere closes it and returns to `/home`. The new request is created with `status: REQUESTED`.

**Fields involved:**
- Photo — file upload → Cloudinary URL — required (Next button flow blocks the rest of the form until upload succeeds)
- Mixed/Assorted materials — checkbox — optional, changes downstream requirements
- Material category / Material — dropdowns — required unless Assorted is checked
- Estimated value — number — required, must be positive
- Estimated unit — select (KG/GRAMS/LBS/PIECE) — required
- Purok/Sitio — read-only, system-filled, not user-editable
- Notes — text — optional

**Discrepancies found:** None against the FR draft's description of the flow itself. See FR7 for the separate "image recognition" claim, which does not apply to this screen (this screen is a plain photo attachment with no material suggestion).

**Open questions:** None.

---

### 6. Cancel Pickup Request

**Roles allowed:** `RESIDENT` — `PATCH /pickup-requests/:id/cancel` (`authenticateResident + requireRoles(["RESIDENT"])`).

**Process steps:**
1. Resident opens a request's detail page (`/requests/:id`) while it is still `REQUESTED` ("pending review").
2. A **Cancel Request** button is shown at the bottom of the detail page.
3. Tapping it opens a confirmation modal: "Cancel Request — This action cannot be undone — Are you sure you want to cancel this request? Once cancelled, this cannot be undone and you will need to submit a new request if you change your mind." with **Go Back** / **Cancel Request** buttons. Confirmed live.
4. Confirming calls `PATCH /pickup-requests/:id/cancel`. Backend does an atomic `updateMany({ where: { id, userId, status: "REQUESTED" }, data: { status: "CANCELLED", closedAt } })` — both ownership (`userId`) and current status (`REQUESTED`) are enforced in the same query.
   - Branch: if the request no longer matches (already approved/collected/rejected, or belongs to someone else), `count === 0` → 400 "This request can no longer be cancelled."
5. On success, the resident is returned to the list (`/requests`), where the item now appears under **History** with a "Cancelled" status pill.

**Fields involved:** None — no form fields, a pure confirm-only action.

**Discrepancies found:**
- **Confirmed live UI bug:** the request detail page's Status Timeline for a cancelled (and, separately, an expired) request shows the second timeline entry's date as literally **"Invalid Date"** (e.g. "Cancelled / Invalid Date", "Expired / Invalid Date") instead of a real timestamp — verified on both the resident-side detail view and the barangay-side `/collection-requests/:id` detail view. This points to `closedAt` (or a similarly-named field) either not being selected/returned by the relevant `GET` endpoint, or the frontend's `formatDate` helper being fed the wrong field name for these two statuses specifically (Submitted/Approved/Collected/Rejected timestamps all render correctly).

**Open questions:** None beyond fixing the date-formatting bug above.

---

### 7. Capture Recyclables via Image Recognition

**Roles allowed:** N/A — **not implemented.**

**Process steps:** None to document as "image recognition." The `/capture` screen (see FR5) is a plain photo-attachment step: `<input type="file" accept="image/*" capture="environment">` → Cloudinary upload → manual material dropdown selection by the resident. There is no ML/vision call anywhere in `frontend/src/app/(resident)/capture/page.jsx`, no material-suggestion API, and nothing in the backend that inspects the uploaded image. The photo is stored purely as evidence attached to the request (`photoUrl`), viewed later by staff as "Photo Evidence" on the request detail page.

**Fields involved:** N/A.

**Discrepancies found:** Matches the FR table's own footnote — "Capture Recyclables via Image Recognition" is explicitly listed as "committed scope pending implementation." Confirmed accurate: photo capture exists, the recognition/suggestion half does not.

**Open questions:** Is the intended UX "suggest, then let resident/staff confirm or correct" (per the FR wording) meant to run client-side, or as a backend call at submit time? Not yet decided in code.

---

### 8. View Contribution History

**Roles allowed:** `RESIDENT` (any authenticated resident — no `requireRoles` array, `authenticateResident` alone) — `GET /pickup-requests/my-requests`, `GET /pickup-requests/my-requests/:id`.

**Process steps:**
1. Resident opens `/requests` ("Requests & History"). Two tabs: **Ongoing** (`REQUESTED`/`APPROVED`/`IN_PROGRESS`) and **History** (`COLLECTED`/`REJECTED`/`CANCELLED`/`EXPIRED`).
   - Branch: empty tab shows "No request yet — Tap the camera button to submit your first request."
2. Each card shows a photo thumbnail, material name/"Assorted", notes, submitted date, estimated value, and a status pill.
3. Tapping a card opens `/requests/:id`, fetched via `GET /pickup-requests/my-requests/:id` — scoped to `where: { id, userId }` (Prisma composite where), so a resident cannot view another resident's request by guessing an id (returns not-found rather than leaking data).
4. Detail page shows: photo banner, Request Information (material pill, estimated value, notes, submitted date), Status Timeline (entries shown conditionally based on which lifecycle steps have happened), and Collection Details — a breakdown table of the finalized `collectionItems` once `status === COLLECTED`, or a placeholder ("Shown when request is collected...") before that.
5. `/home` also surfaces a "Recent Requests" widget (latest 3, `GET /pickup-requests/my-requests?limit=3`) with the same card design, each tappable through to the same detail page.

**Fields involved:** Read-only — no inputs.

**Discrepancies found:** Same "Invalid Date" timeline rendering bug noted in FR6 applies here too for Cancelled/Expired items viewed through this same detail page.

**Open questions:** None.

---

### 9. Manage Pickup Request Lifecycle

**Roles allowed:** `CAPTAIN, SECRETARY, COLLECTOR` — `GET /pickup-requests/collection-requests` (list), `GET /pickup-requests/collection-requests/:id` (detail), `PATCH /pickup-requests/collection-requests/:id` (status transitions). *(FR draft says "authorized barangay staff" generically — actual gate excludes `TREASURER` and `SK`.)*

> This FR is scoped strictly to the pickup-request workflow (resident already submitted a request through `/capture`). It is a **different module** from FR10 "Record Scheduled Recyclable Collection" (Manual Collection Intake), which handles direct/no-prior-request intake — see the explicit disambiguation at the end of this section.

**Process steps:**
1. Staff opens `/collection-requests`. Tabs: **All**, **Pending**, **Approved**, **In Progress**, **Collected**, **Rejected**, **Closed** (Closed = Expired + Cancelled merged into one tab, titled "Expired and Cancelled Requests" with a "Date Closed" column instead of "Date Requested" — confirmed live; not called out as a separate filter option anywhere in the FR draft or `/docs`).
2. A banner appears on the All tab when there's pending work: "There is N request(s) pending. Go to the Pending tab to manage it."
3. **Pending tab → detail page:** shows Resident Information, Request Information (For Assorted requests: "Materials — See finalized collection below" instead of a material name), Photo Evidence, Timeline (Submitted only), and an Actions card with **Decline** / **Approve** buttons.
   - Branch — **Decline**: opens a modal, "Decline Request — Please state the rejection reason", a required **Rejection Reason** textarea, Cancel/Decline buttons. Submitting calls `PATCH .../:id` with `{ status: "REJECTED", rejectionReason }`. The backend requires `rejectionReason` (400 if missing) — this is the **only** transition with real server-side field validation. **Confirmed live bug:** the frontend does not check the textarea is non-empty before submitting — clicking Decline with an empty reason produces a generic error toast reading **"Someting went wrong"** (typo) instead of a clear "Rejection reason is required" message.
   - Branch — **Approve**: single click, no extra fields, calls `PATCH .../:id` with `{ status: "APPROVED" }`. Sets `approvedAt`, creates a Notification (`type: APPROVED`) for the resident, and returns to the list.
4. **Approved tab:** table columns Select (checkbox), Household, Sitio, Materials, Estimated Value, Pickup Schedule ("Not Scheduled" pill), Date Approved, Action ("View" | "Schedule").
   - Branch — checking one or more rows' Select checkboxes reveals a floating **Create Batch Collection (N)** button (bottom-right). Clicking it PATCHes every selected id to `{ status: "IN_PROGRESS" }` in one action; toast "Batch collection created." This is the FR draft's "scheduling one or more approved requests into a batch." Sets `isScheduled: true` and a Notification (`type: IN_PROGRESS`) per request.
   - A single row also has an inline "Schedule" link that does the same PATCH for just that one row.
5. **In Progress tab:** Pickup Schedule column shows a "Scheduled" pill; Action is "View" | **Complete**.
   - Branch — **Complete** opens "Finalize Record — Please input the actual weight of the recyclable." For a normal (non-Assorted) request this is a single actual-value + unit input; for an **Assorted** request it is a repeatable list of rows, each with Category → Material (dependent dropdowns), an actual-value number input, and a Unit dropdown (defaults `kg`), with an **Add new row** button to record a multi-material breakdown. Submitting calls `PATCH .../:id` with `{ status: "COLLECTED", items: [{ materialId, actualValue, actualUnit }, ...] }`.
   - Confirmed live end-to-end (created a test resident request, Approved it, Batch-Scheduled it, then Finalized it as a 2-row Assorted breakdown — Plastic Bottles (PET) 4.5 kg + Steel/Iron Scraps 1.2 kg): toast "Record finalize! Request collected!", the request moves to the Collected tab, `CollectionItem` rows are created, and matching `StockTransactionLog` rows (`source: COLLECTION_REQUEST`, `IN`) appear in MRF Inventory (see FR11).
   - Server-side: on `COLLECTED`, the requesting resident's `isVerified` is unconditionally set to `true` (every completed pickup re-sets it, not just the first).
   - **Removing a row via its "×" button in the Finalize Record modal did not visibly remove the row** in testing (clicked twice, row persisted) — worked around by filling it in instead of relying on removal. Worth a focused re-test since it may be a rendering/state bug in `InProgressActions`.
6. **Collected / Rejected / Closed tabs:** read-only lists, each row's "View Details" opens the same detail page pattern, with a "Finalized Collection" breakdown table (material/value/unit) shown for Collected items instead of Actions.

**Fields involved:**
- Rejection Reason — textarea — **required** (server-enforced, not client-enforced)
- Finalize Record items — Category, Material, Actual value (number), Unit — one or more rows; **not required by the server at all** in the sense that an `items` array with zero entries would still be accepted (no length check in the controller), though the UI always starts with at least one row

**Discrepancies found:**
- **Role wording:** FR draft says "authorized barangay staff" — actual gate is `CAPTAIN, SECRETARY, COLLECTOR` only (excludes `TREASURER` and `SK`).
- **No server-side state-machine guard.** `updateStatus` branches purely on the *requested* target status string and writes it unconditionally — it never checks the row's *current* status before transitioning. In practice this means a `COLLECTED` or `REJECTED` request could be PATCHed again (e.g., re-running the `COLLECTED` branch a second time would re-create `CollectionItem` rows and re-write `StockTransactionLog` entries, double-counting stock) if a client ever sent that request — the UI happens not to expose the buttons for it today, but nothing on the server prevents it. This is the single most important fact for an accurate activity diagram: the lifecycle is **UI-enforced, not server-enforced.**
- **`getRequest` (single-request detail) is not scoped by `barangayId`**, unlike `listRequests`. Any authenticated CAPTAIN/SECRETARY/COLLECTOR (from *any* barangay) who knows or guesses a request UUID can view that request's full detail, including resident info and photo. `listRequests` correctly filters by the caller's barangay; the single-record fetch does not.
- **`EXPIRED` is not a scheduled/cron process.** It is applied lazily, as a side-effect, every time `GET /pickup-requests/collection-requests` (the list endpoint) runs: any `REQUESTED` row older than 2 days is bulk-flipped to `EXPIRED` (with a Notification) inside that same request. So a request can sit well past its 2-day window showing as "Requested" in the database until the next time a staff member happens to open the Collection Requests page — "expiry" is not real-time.
- Timeline "Invalid Date" bug (see FR6) also reproduces on Expired/Cancelled requests viewed from this staff-side detail page.
- Decline-modal missing client-side validation + mistyped generic error toast ("Someting went wrong") — see step 3 above.

**Disambiguation — this module vs. the Manual Collection Intake module (FR10):**
| | This FR (Manage Pickup Request Lifecycle) | FR10 (Manual Collection Intake) |
|---|---|---|
| Trigger | Resident already submitted a request via `/capture` | No prior request exists |
| Screen | `/collection-requests` (list + tabbed detail) | `/manual-intake` |
| Backend | `pickup-request.controller.js` → `updateStatus` (the `COLLECTED` branch) | `manual-intake.controller.js` → `recordIntake` |
| Resident identification | Already known (the request's `userId`) | Staff searches for the resident by name, or falls back to a free-text household name if no match |
| Stock ledger write | `StockTransactionLog` `source: COLLECTION_REQUEST` | `StockTransactionLog` `source: MANUAL_INTAKE` |
| Typical use case | Override / on-demand pickup a resident asked for | Sunday EcoAid door-to-door collection, or any other direct intake with no app request |

**Open questions:**
- Is the missing status-transition guard intentional ("trust the UI") or an oversight that should be hardened before production, given this directly affects `StockTransactionLog` (financially/operationally meaningful data)?
- Should `getRequest` be barangay-scoped like `listRequests`?

---

### 10. Record Scheduled Recyclable Collection ("Manual Collection Intake" module)

**Roles allowed:** `CAPTAIN, SECRETARY, SK, COLLECTOR` — `POST /manual-intake`, `GET /manual-intake` (`authenticateBarangay`). *(FR draft says "barangay staff" generically — confirmed this specific set; note it includes `SK`, unlike FR9's pickup-request lifecycle roles.)*

> See the disambiguation table under FR9 — this is the module used for Sunday EcoAid / any direct intake where **no prior pickup request exists.**

**Process steps:**
1. Staff opens `/manual-intake`. A history table lists past entries: Resident Name (or "No Account" for household-fallback rows with Sitio shown as "—"), Sitio, Materials (chips), Intake Date.
2. Tapping **Record Intake** opens a modal: **Resident** search field, **Materials** section (repeatable rows: Material dropdown, Amount number input, Unit dropdown), **Add material** button, Cancel / **Record Intake** buttons.
3. Typing into **Resident** debounce-searches (`GET /resident/search?name=`) and shows matching residents by name.
   - Branch — no match: "No residents found. You may enter a household name below." plus an **Input resident name** free-text fallback field appears. Confirmed live (typed "Nonexistent Resident XYZ").
   - Branch — match found: selecting a suggestion links the intake to that resident's account (their `isVerified` gets set to `true` server-side as a side effect).
4. Staff fills one or more material rows (Material, Amount, Unit) and submits.
5. `POST /manual-intake` with `{ items, userId (nullable), householdName (nullable) }`. For each item, one `ManualIntakeItems` row and one matching `StockTransactionLog` row (`source: MANUAL_INTAKE`, `transactionType: IN`, quantity normalized to KG via `convertToKg` except for PIECE-unit materials) are written.

**Fields involved:**
- Resident — search-select OR household-name free text — **not actually mutually-exclusive-required server-side**: the controller only checks `if (!items)`, so a submission with both `userId` and `householdName` empty is technically accepted by the backend (the UI's own flow makes this unlikely in practice, but it's not enforced)
- Materials — one or more `{ materialId, quantity, unit }` rows — the server only checks the `items` array is truthy, **not that it's non-empty**, so a zero-row submission is technically possible

**Discrepancies found:**
- FR draft doesn't mention `SK` explicitly, but the live role gate includes it (matches the code, no wording problem — flagged only because it differs from FR9's role set for the "similar-sounding" pickup lifecycle module, which is exactly the kind of role confusion item #2 in this task's "specific items needing resolution" asked to check).
- Minor validation gaps (empty `items` array, `userId`+`householdName` both absent) are accepted server-side with no error — worth a defensive fix, low real-world risk given the UI always drives one of the two paths.

**Open questions:** None beyond the validation gaps above.

---

### 11. View MRF Inventory

**Roles allowed:** `CAPTAIN, SK, COLLECTOR, SECRETARY` — `GET /mrf-inventory`, `GET /mrf-inventory/transaction-logs`. *(Note: excludes `TREASURER`.)*

**Process steps:**
1. Staff opens `/mrf-inventory`. Header stats: **Total Weight** (kg, "All categories") and **Total Pieces** ("Piece-based materials").
2. Two tabs: **Stock Movements** and **Category Overview**.
   - **Category Overview**: materials grouped by Category (Glass, Papers, Plastics, Metals seen live), each showing a per-material current balance (e.g. "Glass Bottles — 0pcs").
   - **Stock Movements**: a UNIT toggle (kg/lbs, labeled "weight materials only"), a filter by material, and a full log table — Material, Quantity, **Current Total**, Source (Collection Request / Manual Intake / Redemption / Junkshop Sales / Manual Adjustment), Stock In/Stock Out, Date.
3. A **Stock Out** button opens the manual-adjustment modal (see FR12).

**Fields involved:** Read-only view; filters only (Unit toggle, material filter) — no data-entry fields.

**Discrepancies found:**
- **Confirmed live data-integrity bug.** The Stock Movements log's **"Current Total" column goes negative for at least one real material** — observed directly: "Glass Bottles 5pcs **-10pcs**" and "Glass Bottles 10pcs **-15pcs**" as running totals, even though the Category Overview tab (a separate, correctly-computed view of the *same* data) shows Glass Bottles' actual balance as **0pcs**. Root cause (confirmed in code): `getStockSummary` (powers Category Overview) buckets balances by `(materialId, transactionType, unit)` — i.e., separately per unit — while `getTransactionLogs` (powers the Stock Movements running-total column) computes one running total per *material only*, ignoring unit, so KG and PIECE movements for the same material get summed together into one nonsensical number. This is a real, user-visible discrepancy between two screens of the same module showing different numbers for the same material.

**Open questions:** Should `getTransactionLogs`'s running total be recomputed per-`(material, unit)` to match `getStockSummary`, or is the "Current Total" column meant to be dropped/redesigned?

---

### 12. Record Manual Stock Adjustment

**Roles allowed:** `CAPTAIN, SK, COLLECTOR, SECRETARY` — `POST /mrf-inventory/transaction-logs/out`.

**Process steps:**
1. From `/mrf-inventory` (Stock Movements tab), staff clicks **Stock Out**.
2. Modal: "Record stock out — Please input details for your stock out transaction." Fields: **Material** (dropdown), **Amount** (number), **Unit** (read-only, auto-filled from the selected material's default unit). Cancel / **Record stock out**.
3. On submit, backend requires `materialId`, `unit`, `quantity` (422 if any missing — the one endpoint in the codebase using status 422 rather than 400/400 for a validation failure). It converts the requested quantity to KG and compares it against the material's current balance.
   - Branch: if the converted quantity exceeds the current balance → 400 "Current balance is not enough for deduction," write rejected.
   - Branch: sufficient balance → writes a `StockTransactionLog` row (`source: MANUAL_ADJUSTMENT`, `transactionType: OUT`).

**Fields involved:** Material — dropdown — required. Amount — number — required, validated against current balance. Unit — read-only, system-derived.

**Discrepancies found:**
- **Same unit-bucketing inconsistency as FR11.** The balance check in `recordStockOut` groups the material's existing log rows by `transactionType` only (not by unit), while `getStockSummary` (the number actually shown to the user as "the balance") buckets per-unit. For a material tracked in more than one unit, a stock-out could validate against the *combined* cross-unit total rather than the specific unit's real balance shown on screen — meaning the UI could show "enough stock" (or reject a stock-out) based on a number that doesn't match what's displayed elsewhere.
- Status code inconsistency (422 here vs. 400 used everywhere else in the codebase for similar "missing required field" errors) — cosmetic, but worth normalizing.

**Open questions:** Same as FR11 — should the balance check be unified to `(material, unit)` buckets everywhere?

---

### 13. Manage Redemption Programs

**Roles allowed:** `CAPTAIN, SECRETARY, SK` for create/update/get-one; adds `TREASURER` for list (`GET /redemption/programs`). *(FR draft says "Captain, Secretary, or SK Staff" — matches for create/edit; the list endpoint is actually broader.)*

**Process steps:**
1. Staff opens `/redemption`. Program cards show Budget, Redemption Mode (Points/Cash), and a chip list of materials with their point/cash values.
2. **Add Program** opens a modal: **Program name**, **Program description**, **Redemption mode** (two selectable cards: "Points — Earn points to redeem rewards" / "Cash — Receive cash for materials"), **Allotted budget**, and **Materials and point values** — a grid of material chips grouped by category (Metals, Papers, Plastics, Glass...), each a "+" button.
   - Branch: clicking a material chip expands it in place into a per-material value input, unit-aware (e.g. "pts/piece" for a piece-tracked material, "pts/kg" for a weight-tracked one), with an "×" to remove it. Confirmed live. Note under the grid: "Materials left unselected won't be included in your program."
3. Submitting calls `POST /redemption/programs` — required: name, allotedBudget, programMaterial (array), description (all falsy-checked, so a budget of literally `0` would incorrectly be rejected as "missing"). `isCashMode` is optional (defaults false).
4. Existing programs can be edited (same modal, pre-filled) via `PATCH /redemption/programs/:id`, including a Deactivate/Reactivate toggle (`isActive`).

**Fields involved:**
- Program name — text — required
- Program description — text — required
- Redemption mode — Points/Cash toggle — optional (defaults Points)
- Allotted budget — number — required (falsy-check bug: `0` incorrectly rejected)
- Materials and point/cash values — one or more `{ materialId, pointValue or cashValue }` — optional to select any, but each selected material needs its value typed in

**Discrepancies found:**
- `updateProgram` still destructures a `maxPoints` field that no longer exists on the `Program` model (removed in an earlier schema pass) — dead code, harmless unless a client actually sends it (would cause a Prisma error → 400).
- **`updateProgram` cannot change the Points/Cash mode after creation** — `isCashMode` is only settable at `createProgram` time; the edit endpoint never writes it. Similarly the edit path's material-value upsert only ever writes `pointValue` (never `cashValue`), so editing material values on an existing cash-mode program's materials looks unsupported via this endpoint — worth a focused re-test of the Edit modal specifically on a Cash program.
- Falsy-check bug on `allotedBudget` (and see FR16/FR18 for the same pattern elsewhere) means a legitimately-zero value is rejected as "missing."

**Open questions:** Is editing a cash-mode program's per-material cash values expected to work today, or is that genuinely out of scope until a later pass?

---

### 14. Record Redemption Transaction

**Roles allowed:** `CAPTAIN, SECRETARY, SK` — `POST /redemption/transactions`.

**Process steps:**
1. From `/redemption`, staff clicks **Record transaction**. Modal: **Program** (dropdown), **Beneficiary** (disabled, "Select program first" until a program is chosen), **Educational level** (dropdown), **Material items** (repeatable rows: Material select, value input, "pts/unit" suffix), Cancel / **Record Transaction**.
2. Selecting a Program enables **Beneficiary**, a live search field.
   - Branch — match found: shows the beneficiary's name plus their **current program-scoped point/cash balance** live in the dropdown (confirmed live: "Kent Villalun — 60 pts" appeared when searching within the "Tulong Iskwelahan" program). This is a computed, per-program balance — not the beneficiary's stored global `points` total (see FR15).
   - Branch — no match: "No beneficiaries found" + "**+ Create new beneficiary**" inline option. Confirmed live. Beneficiary is a free-text name at this point, not tied to any registered resident account.
3. Staff adds one or more material rows and submits. `POST /redemption/transactions` with `{ programId, beneficiaryId or beneficiaryName, educationalLevel, items: [{ programMaterialId, amount }] }`.
4. Server looks up each `programMaterial` (404 "Program material not found" if any id doesn't resolve), snapshots `currentValue` from the program's `cashValue` or `pointValue` at that instant (frozen historical record, unaffected by later edits to the program), writes `RedemptionTransactionItem` rows, and (only in Points mode) increments the beneficiary's stored global `points`. Also writes a `StockTransactionLog` IN row per item (`source: REDEMPTION`) — with no `userId`, since a Beneficiary isn't a `User`.

**Fields involved:**
- Program — dropdown — required
- Beneficiary — search-select or new-name entry — required (`beneficiaryId` or `beneficiaryName`)
- Educational level — dropdown (`PRIMARY`/`SECONDARY`/`TERTIARY`) — required per schema, not blocked from empty in the modal visually but the model field is non-nullable
- Material items — one or more `{ programMaterialId, amount }` — required (`!items` check only — an empty array would still pass)

**Discrepancies found:**
- **No check against the program's `allotedBudget`.** A transaction can be recorded for any point/cash amount regardless of how much budget remains on the program — the budget figure shown on Program Funds and the program cards is purely informational, not an enforced spending cap.
- `Beneficiary` has **no relationship to the `User`/resident model at all** — confirmed both in code and live (the "+ Create new beneficiary" flow takes a free-text name, no link to a registered account). This matters for FR17's discrepancy below.

**Open questions:** Should redemption transactions be blocked (or at least warned) once a program's spending would exceed its allotted budget?

---

### 15. Look Up Beneficiary Records

**Roles allowed:** `CAPTAIN, SECRETARY, SK, TREASURER` — `GET /redemption/beneficiaries`, `GET /redemption/beneficiaries/search`. *(Matches the FR draft's role list exactly.)*

**Process steps:**
1. Used inline inside the Record Transaction modal (FR14) and the Release Reward modal (FR22/FR17) — typing a name triggers a debounced search.
2. There are, in code, **three different beneficiary-lookup behaviors reachable through what looks like "the same" search box** across different screens:
   - `GET /redemption/beneficiaries` — returns each beneficiary's **stored global `points` field**, summed across every program they've ever redeemed in.
   - `GET /redemption/beneficiaries/search?programId=` (used by Record Transaction, FR14) — returns a **live-computed balance scoped to that one program** (earnings in that program minus reward releases against that program) — confirmed live, the search dropdown showed "Kent Villalun — 60 pts" specific to the selected program, not his lifetime total.
   - `reward-inventory.controller.js`'s own separate `searchBeneficiary` (used by Release Reward, FR17) additionally filters to only beneficiaries who have **actually earned in that specific program** (`redemptionTransaction: { some: { programId } }`) — a third, stricter variant.

**Fields involved:** Search input — text — free-typed name; results are read-only cards/rows.

**Discrepancies found:**
- The FR draft's single line item ("search and retrieve existing beneficiary records") undersells that there are effectively three different lookup semantics living behind similarly-named endpoints in two different controllers, each returning a different number for "how many points does this beneficiary have." This is worth calling out explicitly in any activity diagram, since which screen a diagram is modeling determines which balance number is actually shown.

**Open questions:** Should the stored global `points` field (`getBeneficiaries`) and the live program-scoped computed balance (`searchBeneficiary`) ever meaningfully diverge in practice, or should one of the two be treated as the source of truth and the other deprecated?

---

### 16. Record Reward Inventory

**Roles allowed:** `CAPTAIN, SECRETARY, TREASURER, SK` — `GET/POST /reward-inventory`. *(Matches the FR draft's role list exactly.)*

**Process steps:**
1. Staff opens `/reward-inventory`. Header stats: Total Items, Total Available, Total Released, Total Beneficiaries.
2. "Reward Items" table: Program, Category, Name, Available, Added On.
3. **Add Item** opens a modal: **Program** (dropdown), **Reward Item Name** (text), **Category** (dropdown — `MEDICINE`/`GOODS`/`SCHOOL_SUPPLIES`/`SERVICES`/`OTHERS`), **Quantity** (number), **Point Cost** (number). Cancel / **Add Item**.
4. `POST /reward-inventory` requires name, category, programId, quantity, pointCost (all falsy-checked).

**Fields involved:** Program — required. Name — required. Category — required, one of the 5 enum values. Quantity — required (falsy-check bug: `0` incorrectly rejected). Point Cost — required (same bug: `0` incorrectly rejected).

**Discrepancies found:**
- Falsy-check validation bug: a genuinely-zero Quantity or Point Cost is rejected as "missing" rather than accepted as a valid (if unusual) zero value.
- No check that the chosen `programId` actually belongs to the caller's barangay before insert — an invalid/foreign id would surface as a raw Prisma FK error (500) rather than a clean validation message.

**Open questions:** None beyond the validation gaps above.

---

### 17. Release Reward to Resident

**Roles allowed:** `CAPTAIN, SECRETARY, TREASURER, SK` — `POST /reward-inventory/release`.

**Process steps:**
1. From `/reward-inventory`, staff clicks **Release Reward**. Modal: "Release Reward — Search for a beneficiary and release reward items." Fields: **Program**, **Beneficiary** (search, same free-text/no-User-link pattern as FR14/15), **Reward items** (repeatable rows: item select, quantity, "pts/item" shown), a live **Total Point Cost** total, **Add row**, Cancel / **Release Reward**.
2. On submit, backend checks (a) requested quantity per item ≤ that item's current available stock (`quantity - sum(prior releases)`), and (b) the beneficiary's program-scoped point balance ≥ the transaction's total point cost.
3. On success: writes `RewardRelease` rows and effectively decrements available inventory (computed from releases, same "derived balance" pattern as material stock).

**Fields involved:** Program — required. Beneficiary — search-select or free-text — required. Reward items — one or more `{ rewardItemId, quantity }` — required (validated against stock and point balance).

**Discrepancies found:**
- **Direct contradiction of the FR draft's wording.** The FR description says rewards are released "to a resident with verified recyclable contributions." **Confirmed in both code and the live modal: there is no reference anywhere to `User.isVerified`, and no link at all between a `Beneficiary` and a registered `User`/resident account.** Eligibility is purely: (a) does the reward item have enough remaining stock, and (b) does the beneficiary's computed point balance in that program cover the cost. A resident's app-verification status plays no role in whether they (or a household member entered under a free-text name) can receive a reward. Confirmed visually — the Release Reward modal's Beneficiary field behaves identically to Record Transaction's, with the same "+ Create new beneficiary" free-text fallback, not a picker restricted to verified residents.
- If a submitted `rewardItemId` doesn't match any item returned by the program's own reward-item list (e.g., stale client-side data, wrong program), the lookup falls through to `undefined` and the next line throws — surfaced as a generic 500 rather than a clean validation error.

**Open questions:** Should reward release actually require the beneficiary to correspond to a verified `User`/resident, per the FR wording — or is "beneficiary" intentionally a broader, unlinked concept (covering e.g. household members without their own EcoAid account) and the FR description should be corrected instead?

---

### 18. Record Program Expenses

**Roles allowed:** `CAPTAIN, SECRETARY, TREASURER, SK` — `POST /program-funds/expenses`. *(FR draft says "authorized staff" generically — confirmed this specific set.)*

**Process steps:**
1. From `/program-funds`, staff clicks **Add Expense**. Modal: **Program** (dropdown), **Expense Name** (text), **Amount** (number), **Description** (text). Cancel / **Add Expense**.
2. `POST /program-funds/expenses` requires programId, amount, description, name (all falsy-checked).

**Fields involved:** Program — required. Expense Name — required. Amount — required (falsy-check bug: `0` incorrectly rejected). Description — required.

**Discrepancies found:** Same falsy-check pattern as FR13/FR16 — a legitimately-zero Amount is rejected as "missing."

**Open questions:** None.

---

### 19. Record Junkshop Sale

**Roles allowed:** `CAPTAIN, SECRETARY, SK, TREASURER` — `POST /junkshop-sales`. *(FR draft says "authorized barangay staff" generically — confirmed this specific set.)*

**Process steps:**
1. From `/junkshop-sales`, staff clicks **Record Sale** on the Price Comparison table.
2. Staff selects a junkshop and one or more materials with quantities to sell.
3. Server validates every requested material has a current `JunkshopPriceItem` for that junkshop (400 "Items are missing" listing which ones don't) and that current MRF stock (IN − OUT across `StockTransactionLog`, combined-unit — same bucketing caveat as FR11/12) covers the requested quantity (else 400).
4. On success: creates `JunkshopSale` + `JunkshopSaleItem` rows (cost/unit snapshotted from the junkshop's price list at sale time) and writes `StockTransactionLog` OUT rows (`source: JUNKSHOP_SALES`).

**Fields involved:** Junkshop — required. Material line items `{ materialId, quantity }` — required, each validated against that junkshop's price list and against current stock.

**Discrepancies found:**
- No presence check at all on `junkshopId`/`items` before use — an empty/malformed submission throws inside the handler and returns a generic 500 rather than a clean 400.
- **"Reflected as income in the barangay's program funds" (per the FR wording) is not a stored transaction row** — there is no `ProgramIncome`-style table. Every "income" figure shown anywhere in the app (Program Funds summary, Reports, Dashboard) is computed on the fly by summing `JunkshopSaleItem.cost * quantity`. Functionally equivalent to "recorded as income," but worth knowing for anyone modeling the data flow — the sale record *is* the income record, there's no second write.
- Same combined-unit stock-balance check inconsistency as FR11/12.

**Open questions:** None beyond the shared stock-balance bucketing question already raised under FR11/12.

---

### 20. Manage Junkshop Partners

**Roles allowed:** Split across two different endpoints powering two different screens — **this is a confirmed, practically-impactful role mismatch:**
- **Add a junkshop** (`POST /junkshop-sales/junkshop`): `CAPTAIN, SECRETARY, SK, TREASURER`
- **List junkshops for management** (`GET /junkshop-sales/junkshop`, powers the Settings screen described below): `CAPTAIN, SECRETARY` **only**
- **List junkshops with prices** (`GET /junkshop-sales/prices`, powers FR21's comparison table): `CAPTAIN, SECRETARY, SK, TREASURER`

**Process steps:**
1. "Manage Junkshop Partners" lives under **`/settings`**, not `/junkshop-sales` (confirmed live) — a "Junkshops" section with a table (Junkshop, Location, Status) and an **Add Junkshop** button, plus the note "To view junkshop details, go to the Junkshop Sales page and press the junkshop name."
2. **Add Junkshop** modal: **Name**, **Description** (optional notes), **Location** (optional address/landmark), **Price Items** (repeatable material + price rows). Cancel / **Add Junkshop**.
3. Submitting calls `POST /junkshop-sales/junkshop`.
4. The table itself (the list of existing partners shown in Settings) is fetched via `GET /junkshop-sales/junkshop` — the endpoint restricted to `CAPTAIN, SECRETARY` only.

**Fields involved:** Name — no server-side required check (Prisma would 500 on a genuinely missing name). Description — optional. Location — optional. Price Items — repeatable `{ materialId, price }` rows, also unchecked server-side (`.map()` on `undefined` would 500 if omitted).

**Discrepancies found:**
- **Confirmed, concrete access-control bug.** An `SK` or `TREASURER` staff member is allowed to *add* a junkshop (`POST` gate includes them) but would receive a 403 loading the exact Settings screen (`GET /junkshop-sales/junkshop`) that displays the resulting partner list, since that read endpoint is `CAPTAIN`/`SECRETARY` only. In practice they aren't fully locked out of seeing junkshop data at all — `GET /junkshop-sales/prices` (used by the separate Compare Prices screen, FR21) is open to all four roles and returns equivalent junkshop info plus price items — but the dedicated "Manage Junkshop Partners" management table under Settings specifically would be inaccessible to them.
- No server-side required-field validation on Name/Price Items (a missing Name or Price Items array would surface as a raw 500, not a clean validation error).

**Open questions:** Should `GET /junkshop-sales/junkshop`'s role list be widened to match the `POST` (add) endpoint's four roles, for consistency?

---

### 21. Compare Junkshop Prices

**Roles allowed:** `CAPTAIN, SECRETARY, SK, TREASURER` — `GET /junkshop-sales/prices`. *(Matches the FR draft exactly.)*

**Process steps:**
1. Staff opens `/junkshop-sales`. Header stats: "Junkshops Tracked," "Best Overall" (top performer by name).
2. A **Price Comparison** table: rows = material, columns = one per active junkshop, plus a **Best Price** column that highlights the highest offer and names the winning junkshop (e.g. "₱25 Reyes" for Steel/Iron Scraps). Materials with no listed price for a junkshop show "—". "Best price" computation is done client-side/at read time on the frontend — the backend just returns each junkshop's full price list, no server-computed "winner" field.
3. Below that, a **Sales History** table with a filter by junkshop.

**Fields involved:** Read-only comparison view; no data-entry fields on this screen (Record Sale, FR19, is a separate action on the same page).

**Discrepancies found:**
- **Confirmed live UI bug:** the header stats row includes a card literally labeled **"Stat TBD"** with value **"₱25.00"** and subtext **"Placeholder"** — an unfinished/leftover placeholder stat card shipped in the live UI, sitting right next to the real "Junkshops Tracked" and "Best Overall" cards.

**Open questions:** What was "Stat TBD" meant to become (e.g. total sales this month, average best price)? Needs a product decision before removing/replacing it.

---

### 22. View Program Funds Summary

**Roles allowed:** `CAPTAIN, SECRETARY, TREASURER, SK` — `GET /program-funds/summary`, `GET /program-funds/transactions`. *(FR draft says "authorized barangay staff" generically — confirmed this specific set.)*

**Process steps:**
1. Staff opens `/program-funds`. Header stats: **Total Income** ("From junkshop sales"), **Total Expenses** ("Program expenses"), **Net Balance** ("Current balance").
2. **Program Budgets** table: Program, Allocated Budget, Total Spent, Remaining, Status ("Under Budget" pill — purely informational, not an enforced cap, see FR14).
3. **Transaction Log**: filterable (All / Income / Expenses), each row shows Type, Name, Description, Program, Amount (+/− colored), Recorded By, Date. Income rows are junkshop sales ("Sold to: X"); expense rows are `ProgramExpense` records.

**Fields involved:** Read-only; **Add Expense** action on this page is documented under FR18.

**Discrepancies found:**
- `totalIncome` on this summary endpoint sums **all-time** `JunkshopSaleItem` records with no date filter, in contrast to the Reports module's equivalent (`getProgramFundsReport`), which is date-range-scoped. The two "income" figures in the app (this page vs. a date-filtered Reports export) are not directly comparable numbers unless the Reports date range happens to be "all time."

**Open questions:** None beyond the date-scoping note above.

---

### 23. Create Announcement

**Roles allowed:** `CAPTAIN, SECRETARY, SK` — `POST /announcements`, `GET /announcements` (staff list), `DELETE /announcements/:id`.

**Process steps:**
1. Staff opens `/announcements`. Filter tabs: All, General, Event, Reminder, Notice, Alert (the 5 `AnnouncementCategory` enum values).
2. **Create Announcement** opens a modal: **Title** (text), **Category** (dropdown, the 5 values above), **Content** (textarea). Cancel / **Publish**. Confirmed live — **no image/media field of any kind exists in this modal.**
3. `POST /announcements` — no server-side required-field validation exists at all; a missing Title or Content would hit the database's NOT NULL constraint and surface as a raw 500 rather than a clean 400.
4. Each row has a "View Details" action and (implied by the route) a delete action.

**Fields involved:** Title — text — effectively required (DB-enforced, not app-validated). Category — dropdown — one of `EVENT/REMINDER/GENERAL/NOTICE/ALERT`. Content — textarea — effectively required (DB-enforced).

**Discrepancies found:**
- **Direct contradiction of the FR draft.** The FR description says announcements can include "text and optional media." **Confirmed both in the `Announcement` Prisma model (no media/image column exists at all) and live in the Create Announcement modal (Title/Category/Content only, no upload control anywhere).** Media support is entirely unimplemented, not just optional-and-unused.
- No app-level required-field validation for Title/Content — relies entirely on the database rejecting nulls, which produces an unfriendly 500 rather than a clean error message.
- `deleteAnnouncement` is not scoped by `barangayId` — only checks the announcement exists by id, so in principle a staff member from one barangay who knew/guessed another barangay's announcement id could delete it.

**Open questions:** Is "optional media" still planned, or should the FR description be trimmed to match the current text-only implementation?

---

### 24. View Announcements

**Roles allowed:** `RESIDENT` (`authenticateResident`, but — unusually — **no `requireRoles(["RESIDENT"])` array** on these two routes, unlike most other resident-only endpoints in the codebase, e.g. `leaderboard.route.js`'s resident route or `material.route.js`) — `GET /announcements/residents`, `GET /announcements/residents/latest`.

**Process steps:**
1. Resident opens the "Announcements" screen — this lives at **`/updates`** in the frontend, *not* `/announcements` (that path is the barangay staff management screen from FR23; there is no separate `(resident)/announcements` route in the codebase — `/updates` is the actual resident-facing page).
2. **Confirmed live, undocumented gate:** for an unverified resident, the page shows a locked state instead of the list: "Announcements are locked / Complete your first pickup to view barangay announcements." This exact rule does not appear anywhere in `docs/business-rules.md` or the FR draft.
3. Once unlocked (verified resident), each announcement shows its category pill, date, title, and content — confirmed live with the same two announcements created on the staff side ("test 2" / General, "Community Cleanup Drive" / Event).
4. `/home` and the notification bell also read `GET /announcements/residents/latest` (capped at 2) for a lightweight "new announcement" indicator.

**Fields involved:** Read-only.

**Discrepancies found:**
- `PROGRESS.md`'s route notes (`proxy Layer 1 guards resident routes: /home, /capture, /requests, /profile, /announcements, /community`) list `/announcements` as a resident route — that's stale; the actual resident path today is `/updates`. Navigating a resident session to `/announcements` does not 404 or redirect — because there's only one `/announcements` page in the whole app (the barangay one) and Next.js route groups don't affect URLs, hitting that path while any `barangay_token` cookie also happens to be present in the same browser will render the full staff management UI. This is a routing-namespace collision risk worth flagging even though it isn't reachable through any in-app link.
- The "locked until first pickup" gate is a real, live, undocumented business rule not present in `docs/business-rules.md` or the FR draft description.
- Missing `requireRoles(["RESIDENT"])` on both GET routes is inconsistent with the rest of the codebase's pattern, though low-risk since `authenticateResident` alone already requires a valid resident cookie.

**Open questions:** Is "unverified residents can't see announcements" an intentional product decision (should be documented in `business-rules.md`), or an accidental side effect of reusing the same locked-state pattern as the Standings page?

---

### 25. View Notifications

*(Numbered per the FR table's actual order — this is item "View Notifications," listed 30th in the source table; grouped here near Announcements since both are resident communication features.)*

**Roles allowed:** `RESIDENT` (`authenticateResident`, no `requireRoles` array) — `GET /notifications`, `GET /notifications/unread-status`.

**Process steps:**
1. Resident opens `/notifications` (also reachable via a bell icon). Empty state confirmed live: "No notifications / Updates about your pickup requests will show up here."
2. Notifications are created **exclusively** from the pickup-request lifecycle (FR9): `APPROVED`, `IN_PROGRESS`, `COLLECTED`, `REJECTED` transitions, plus the lazy `EXPIRED` sweep. No other module (manual intake, redemption, reward inventory, junkshop sales, announcements) creates a Notification row anywhere in the codebase.
3. Opening the notification list has two side effects beyond just reading: (a) it lazily deletes read notifications older than 30 days, and (b) it marks **every currently-unread notification as read** as a side effect of the `GET` itself — there is no separate "mark as read" action. The same call also refreshes `hasUnreadAnnouncements` (comparing the barangay's latest announcement timestamp against the resident's `lastSeenAnnouncementAt`) and updates that timestamp to now — so opening the notification bell simultaneously clears both the notification badge and the "new announcement" badge in one request.

**Fields involved:** Read-only.

**Discrepancies found:** None against the FR draft's wording ("view system-generated notifications reflecting updates to their pickup request status") — confirmed accurate and exhaustive; there genuinely is no notification type for anything other than pickup-request status changes today.

**Open questions:** Is "viewing the list marks everything read" (rather than an explicit tap-to-dismiss per notification) the intended UX, or should individual notifications be dismissible independently?

---

### 26. View Leaderboard Rankings

**Roles allowed:** Staff view `CAPTAIN, SECRETARY, SK, TREASURER` (`GET /leaderboard`); resident view `RESIDENT` (`GET /leaderboard/residents`).

**Process steps:**
1. **Staff (`/leaderboard`):** header stats "Total Participants," "Top Contribution" (name + total). Filters: **By Kilogram** / **By Piece**, and a period selector (All Time seen live). A podium for the top 3, plus a "Rank 4 and beyond" list ("No more rankings" empty state when fewer than 4 residents have contributions).
2. **Resident (`/standings`):** same underlying data source, different presentation — a locked state for unverified residents ("Standings are locked / Complete your first pickup to appear on the standings"), then Type filter (By Kilogram/By Piece) and Period filter (All Time/This Week/This Month) pills, a 🥇🥈🥉 podium, and a numbered list beyond rank 3. The current resident's own row is highlighted with a ring and shown as "You."
3. Both are powered by `getRankedLeaderboard(barangayId, unit, timeFrame)`: groups `StockTransactionLog` by `userId` where `transactionType: "IN"` and the requested `unit` (KG or PIECE, queried separately to build the two leaderboards), and **`userId: { not: null }`**.

**Fields involved:** Read-only; Type and Period are client-side filters, not form inputs.

**Discrepancies found:**
- **Confirmed live display bug on the staff-side page:** the "Top Contribution" stat shows a raw, unrounded floating-point value — **`7.9699618500501765 kg`** — rather than a rounded figure. The resident-side Standings page pulls from the same underlying total but correctly rounds it (`7.9700 kg`, `.toFixed(4)`), so the two "leaderboard" screens visibly disagree in formatting for the exact same number.
- The FR draft says the leaderboard recognizes "both app-based and manually recorded entries." **This outcome is correct but achieved incidentally, not by an explicit source filter:** `getRankedLeaderboard` doesn't filter by `Source` at all — it just sums every `IN` row that happens to have a non-null `userId`. In practice that includes `COLLECTION_REQUEST` (FR9, always has a `userId`) and `MANUAL_INTAKE` (FR10) *only when a resident match was found* — a manual-intake entry recorded under a free-text household name (no matched resident, `userId: null`) is **silently excluded from the leaderboard**, even though it is a real, recorded contribution. `REDEMPTION` rows (FR14) also never carry a `userId` and are excluded, and `JUNKSHOP_SALES` rows are `OUT`-type so they're excluded by the transaction-type filter regardless. This is a real edge case worth flagging: "manually recorded entries" only count toward the leaderboard when the collector successfully matched them to a registered resident account.

**Open questions:** Should household-name-fallback manual intake entries count toward the leaderboard under a display name (even without a linked account), to fully satisfy the FR's "recognizing... manually recorded entries" wording?

---

### 27. Manage Barangay Residents

**Roles allowed:** split across three different endpoints:
- **List** (`GET /resident/`): `CAPTAIN, SECRETARY, TREASURER, SK` — **no `COLLECTOR`**
- **Search** (`GET /resident/search`): `CAPTAIN, SECRETARY, COLLECTOR, SK` — **no `TREASURER`**
- **Edit** (`PATCH /resident/:id`): `CAPTAIN, SECRETARY` **only**

*(FR draft says "authorized barangay staff" generically — the three actions under this one FR actually have three different role sets.)*

**Process steps:**
1. Staff opens `/residents`. Header stats: Total Residents, Verified, Unverified.
2. Table: Name, Location, Contact, Status (Verified/Unverified pill), Registered date, **Edit** action.
3. **Edit** opens a modal: **First name**, **Last name**, **Phone number**, **Sitio** (dropdown), and a **Verified** toggle switch labeled "Mark this resident as verified for your barangay" — confirmed live, sitting inline with the other editable fields, not a separate dedicated "Verify" button/action anywhere in the UI.
4. `PATCH /resident/:id` accepts any subset of `{ firstName, lastName, phoneNumber, sitioId, isVerified }`; if `sitioId` is provided it's re-validated to exist and the resident's denormalized `purok` field is overwritten to match.

**Fields involved:** First name, Last name, Phone number, Sitio, Verified toggle — all optional per-request (partial update pattern; whichever fields are present get written).

**Discrepancies found:**
- **No dedicated "verify" endpoint or action exists.** "Verify" is simply the `isVerified` boolean, one of several fields in the general-purpose Edit modal — confirmed live. There's also no guard against un-verifying someone by flipping it back off through the same control.
- **This is one of three independent ways a resident becomes verified**, and only one of the three is a deliberate staff action:
  1. Automatically, whenever any of their pickup requests is transitioned to `COLLECTED` (FR9) — re-set on *every* collection, not just the first.
  2. Automatically, whenever a Manual Collection Intake (FR10) entry is matched to their resident account.
  3. Manually here, via the Edit modal's Verified toggle (`CAPTAIN`/`SECRETARY` only).
- The three role sets above (list/search/edit) don't line up with each other — a `TREASURER` can see the full resident list but can't use the search box; a `COLLECTOR` can search but can't see the full list; neither can edit/verify anyone.
- `searchResident` is the one place in the entire backend that uses raw SQL (`prisma.$queryRaw`, tagged-template so it's auto-parameterized and not an injection risk) rather than the Prisma query builder — inconsistent with `CLAUDE.md`'s "Prisma for all DB access — no raw SQL" rule, worth a note even though it isn't unsafe as written.

**Open questions:** Are the three different role sets across List/Search/Edit intentional, or should they be unified to one consistent set (matching the FR draft's single "authorized barangay staff" phrasing)?

---

### 28. Generate Operational Reports

**Roles allowed:** `CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR` — `GET /reports` (filter/preview), `POST /reports/export`. *(This is the broadest role set of any barangay-staff feature in the app — all five staff roles.)*

**Process steps:**
1. Staff opens `/reports`. Four independent report sections are shown simultaneously, each with its **own** Filter control (This week / This month / Custom range / Custom date — confirmed live via the dropdown): **MRF Inventory** (material movement in/out), **Collection & Intake** (merges `PickupRequests` rows tagged "App Request" with `ManualIntakeTransaction` rows tagged "Manual Intake" into one feed — this is the reporting module's own version of the FR9/FR10 disambiguation, treating them as two channels of one list), **Redemption & Rewards** (with its own program filter), and **Program Funds** (Total Income/Expense/Net for the selected range).
2. A single **Export all** button sits at the top of the page (not exercised in this walkthrough — downloading a file requires explicit user permission per this session's operating rules, so its output wasn't inspected directly; behavior below is from code).
3. `POST /reports/export` does **not** take a "which report type" selector — it always builds all four sheets into one workbook in a single call, requiring four separate `{startDate, endDate}` pairs in the request body (one per section, plus an optional `programId` for the redemption sheet) — matching the four independently-filterable sections seen live. Uses `exceljs`, streams a real `.xlsx` file (`reports-export.xlsx`).

**Fields involved:** Per-section date range (via the Filter dropdown: This week / This month / Custom range / Custom date) — four independent selections, one per report section, all feeding into the one Export action.

**Discrepancies found:**
- The FR draft's "filter and generate reports... for **a selected period**" (singular) undersells the real design: because each of the four sections keeps its own independent date filter, "Export all" can legitimately bundle **four different date ranges** in one export (e.g., MRF Inventory for "This month" alongside Program Funds for a different custom range), not one single period applied uniformly across the whole report. Confirmed live: each section's Filter control is fully independent of the others.

**Open questions:** Is exporting one combined workbook using each section's own currently-selected filter the intended design, or should "Export" instead export just the section currently being viewed (with one shared date range)?

---

### 29. Customize Barangay Appearance

**Roles allowed:** view (`GET /settings/theme/staff`): `CAPTAIN, SK, SECRETARY, TREASURER, COLLECTOR` (all five staff roles); resident view (`GET /settings/theme/resident`): `RESIDENT`; **update** (`PATCH /settings/theme`): `CAPTAIN, SECRETARY` **only**.

**Process steps:**
1. Staff opens `/settings` → **Appearance** section: "Choose a color theme for yoour barangay" [sic]. A grid of preset cards, each a mini live preview (colored header bar + skeleton lines + a sample button in that theme's accent color).
2. **Confirmed live: 7 presets** — Forest Green, Ocean Teal, Sunrise Orange, Royal Purple, Deep Maroon, Earth Brown, Sunflower Gold.
3. Clicking a preset card is a **local-only preview** — confirmed live: clicking "Ocean Teal" instantly re-colored the whole sidebar/nav (no network request), and a warning banner appeared: "This theme will apply to **all accounts** belonging to your barangay, including staff and residents. Changes take **affect** [sic] next time each person opens the app." **Cancel** / **Save changes** buttons then appear at the bottom of the grid (only shown once the preview differs from the currently-saved theme).
4. **Save changes** commits via `PATCH /settings/theme`, validated server-side against the 7-value enum (400 on anything else) and updates every subsequent session (staff and resident) the next time they open the app — it does not push a live update to already-open sessions.
5. **Cancel** discards the preview and reverts to the saved theme (verified live).

**Fields involved:** Theme selection — one of the 7 presets — required to save (no "custom color" input, curated presets only, per design).

**Discrepancies found:**
- `PROGRESS.md`'s design-token log documents only **5** presets (Forest Green, Ocean Teal, Sunrise Orange, Royal Purple, Deep Maroon) as the finalized set — the live app and the backend enum both actually have **7** (Earth Brown and Sunflower Gold were added later without that doc being updated).
- Two copy typos confirmed live: "Choose a color theme for **yoour** barangay" and "Changes take **affect** next time..." (should be "your" / "effect").
- Role wording: FR draft says "authorized barangay staff" generically for the whole feature — viewing the current theme is open to all five staff roles, but *changing* it is restricted to `CAPTAIN`/`SECRETARY` only.

**Open questions:** None beyond fixing the two typos and reconciling the preset count with `PROGRESS.md`.

---

### 30. Manage Recyclable Materials

*(Listed as the final row in the source FR table, under the heading "Manage Recyclable Materials.")*

**Roles allowed:** `CAPTAIN, SECRETARY` **only** — `POST /settings/materials`.

**Process steps:**
1. Staff opens `/settings` → **Materials** section: a table (Category, Material Name, Unit) of every material currently accepted by the barangay, grouped/listed by category (Metals, Papers, Plastics, Glass, plus a "Bottles" category observed live that isn't one of the 4 seeded default categories — meaning categories themselves can grow beyond the seed data, though this endpoint only lets a material be added *under an existing* category, it doesn't create new categories).
2. **Add Material** opens a modal: **Category** (dropdown), **Material name** (text), **Default unit** (dropdown — KG/GRAMS/LBS/PIECE). Cancel / **Add Material**.
3. `POST /settings/materials` requires name, categoryId, defaultUnit (falsy-checked); validates the category exists (400 "Invalid category" if not); relies on the database's `@@unique([name, barangayId])` constraint for duplicate-name protection, caught specifically as a 409 "A material with this name already exists" (not a raw Prisma error — this one is handled cleanly).

**Fields involved:** Category — dropdown — required, must reference an existing category. Material name — text — required, unique per barangay (server-enforced, clean error message). Default unit — dropdown — required; not cross-checked against the `Unit` enum's actual 4 values before hitting the database (a client bypassing the UI dropdown could send an invalid string and get a raw 500 instead of a clean 400 — low risk in practice since the UI only offers the 4 valid options).

**Discrepancies found:** None significant against the FR draft — "add new recyclable material types... organized under existing material categories" matches the implementation exactly (materials require an existing category; the feature does not create new categories).

**Open questions:** None.

---

## Summary — role-gate corrections needed in the finalized FR wording

| Feature | FR draft wording | Actual `requireRoles()` |
|---|---|---|
| Dashboard stats | (n/a, not in FR list) | `CAPTAIN` only |
| Manage Pickup Request Lifecycle | "authorized barangay staff" | `CAPTAIN, SECRETARY, COLLECTOR` |
| Record Scheduled Recyclable Collection | "barangay staff" | `CAPTAIN, SECRETARY, SK, COLLECTOR` |
| View MRF Inventory / Record Manual Stock Adjustment | "authorized barangay staff" | `CAPTAIN, SK, COLLECTOR, SECRETARY` (no `TREASURER`) |
| Manage Redemption Programs (create/edit) | "Captain, Secretary, or SK Staff" | matches; **list** endpoint additionally allows `TREASURER` |
| Record Redemption Transaction | "Captain, Secretary, or SK Staff" | matches exactly |
| Look Up Beneficiary Records | "Captain, Secretary, SK Staff, or Treasurer" | matches exactly |
| Record/Release Reward Inventory | "Captain, Secretary, Treasurer, or SK Staff" | matches exactly |
| Record Program Expenses | "authorized staff" | `CAPTAIN, SECRETARY, TREASURER, SK` |
| Record Junkshop Sale / Compare Prices | "authorized barangay staff" | `CAPTAIN, SECRETARY, SK, TREASURER` |
| Manage Junkshop Partners — add | "authorized barangay staff" | `CAPTAIN, SECRETARY, SK, TREASURER` |
| Manage Junkshop Partners — list/view (Settings table) | "authorized barangay staff" | `CAPTAIN, SECRETARY` **only** — mismatched with "add" above |
| View Program Funds Summary | "authorized barangay staff" | `CAPTAIN, SECRETARY, TREASURER, SK` |
| Create Announcement | "authorized barangay staff" | `CAPTAIN, SECRETARY, SK` (no `TREASURER`, no `COLLECTOR`) |
| Generate Operational Reports | "authorized barangay staff" | `CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR` (all five) |
| Customize Barangay Appearance — view | "authorized barangay staff" | all five roles |
| Customize Barangay Appearance — change | "authorized barangay staff" | `CAPTAIN, SECRETARY` **only** |
| Manage Recyclable Materials | "authorized barangay staff" | `CAPTAIN, SECRETARY` **only** |
| Manage Barangay Residents — list | "authorized barangay staff" | `CAPTAIN, SECRETARY, TREASURER, SK` (no `COLLECTOR`) |
| Manage Barangay Residents — search | "authorized barangay staff" | `CAPTAIN, SECRETARY, COLLECTOR, SK` (no `TREASURER`) |
| Manage Barangay Residents — edit/verify | "authorized barangay staff" | `CAPTAIN, SECRETARY` **only** |
| View Leaderboard Rankings (staff) | "residents and barangay staff" | `CAPTAIN, SECRETARY, SK, TREASURER` (no `COLLECTOR`) |

## Summary — Register User Account required fields (per this task's item 3)

All of first name, last name, username, phone number, barangay, sitio, password, confirm password, and Terms & Privacy acceptance are **enforced as required, both client-side (inline yup validation, confirmed live) and server-side** (`register` and `verify-otp` both re-check every field). None are optional; none are missing from the live form. The only nuance is that **Barangay** must be selected from the backend-driven autocomplete suggestion list — free-typed text that doesn't match a suggestion is rejected with "Please select a barangay from the suggestions," since there is no raw `barangayName` field, only a `barangayId` resolved from a real selection.
