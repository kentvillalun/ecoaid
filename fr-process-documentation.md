# EcoAid — Functional Requirement Verification & Process Documentation

Verified against the running app (barangay dashboard at `/dashboard` logged in as the seeded Captain account, resident PWA) and the backend source (`backend/src/controllers/*`, `backend/src/routes/*`, `backend/prisma/schema.prisma`) on 2026-08-24.

> **Update 2026-10-20:** FR3, FR4, FR10, FR13–FR17, FR26, FR28 and FR30 were revised, and FR31 added, **from the code and commit history, not re-verified in the running app**, after the redemption overhaul (the resident is now the beneficiary, educational level removed, `Beneficiary` table removed) and the core-material change. All other sections still describe the 2026-08-24 verification. Re-verify the revised sections live before using them as evidence.

**Roles** (`Role` enum): `RESIDENT`, `CAPTAIN`, `SECRETARY`, `TREASURER`, `SK`, `COLLECTOR`, `SUPER_ADMIN`. The dev seed now creates a barangay with one account per staff role plus a Super Admin and a sample resident (see `backend/prisma/seed.js`), so every role can be logged into locally. The role-gates below were originally verified from route-file code (`requireRoles([...])`) rather than from a live login as each role.

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

> *Revised 2026-10-20 from the code (not re-verified live). On 2026-08-24 this was recorded as "not implemented anywhere"; the Super Admin module was built 2026-09-05 to 2026-09-12.*

**Roles allowed:** `SUPER_ADMIN` — `POST /admin/barangay/register`, `PATCH /admin/barangay/:id`, `GET /admin/barangays`, `GET /admin/barangays/:id` (`authenticateSuperAdmin`; Super Admin has its own login page, its own `admin_token` cookie and the `(admin)` route group).

**Process steps:**
1. Super Admin logs in at the Super Admin portal and opens `/barangay-accounts` (list), then **Register** (`/barangay-accounts/register`).
2. The form collects name, municipality, province, zip code, contact number, a theme preset and the four module flags (`hasCollectionRequests`, `hasRedemptionManagement`, `hasRewardInventory`, `hasLeaderboard`).
3. The server rejects a duplicate zip code or contact number, creates the `Barangay` and gives it the **core material list** (`createCoreMaterials`).
4. A detail page (`/barangay-accounts/[id]`) and an edit page (partial update, the same uniqueness checks excluding itself) complete the module. `/admin-dashboard` lists barangays that still lack a required staff role (CAPTAIN, SECRETARY, TREASURER) or have no sitios.

**Fields involved:** name, municipality, province, zip code (unique), contact number (unique), theme, four module flags.

**Discrepancies found:**
- The module flags are now read by the barangay side (`lib/getBarangayModules.js` hides sidebar items and gates a few pages), but only **client-side**: `proxy.js` enforces the staff *role* per route, not the barangay's flags, so a role allowed into a route can still reach a disabled module by typing its URL.
- `Barangay.redemptionMode` remains an unused column.

**Open questions:** Should module flags also be enforced at the edge middleware or on the backend routes?

---

### 4. Set Up Staff Accounts and Roles

> *Revised 2026-10-20 from the code (not re-verified live). Previously recorded as "not implemented anywhere".*

**Roles allowed:** `SUPER_ADMIN` — `POST /admin/barangays/:id/staff`, `GET /admin/barangays/:id/staff`.

**Process steps:**
1. On a barangay's detail page, the staff table lists every account (each as its own row) and shows placeholders for any missing required role. **Add staff** opens a modal.
2. The server creates a `User` scoped to that barangay with a role from `CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR`, after checking that the username and the phone number are unused.
3. Sitios are managed on the same page (`POST/GET /admin/barangays/:id/sitios`, `PATCH /admin/sitios/:id`), unique per barangay.
4. A staff member then logs in at the barangay login and lands on the first page their role may open (`ROLE_MATRIX`).

**Fields involved:** username, password, first name, last name, phone number, role.

**Discrepancies found:** Because accounts of every role can now be created, every role-gate in this document can be tested by logging in as that role (the dev seed also creates one account per role).

**Open questions:** None.

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
   - Branch — no match: "No residents or staff found. You may enter a household name below." plus an **Input resident name** free-text fallback field appears. Confirmed live (typed "Nonexistent Resident XYZ") with the earlier wording "No residents found".
   - Branch — match found: selecting a suggestion links the intake to that person's account (their `isVerified` gets set to `true` server-side as a side effect). *(Updated 2026-10-20)* The search now also returns **barangay staff**, shown with a small role label, because staff bring recyclables as their attendance and that has to be recorded against their own account; before, a staff member could only be entered as a free-text household name.
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

**Roles allowed:** `CAPTAIN, SECRETARY, SK, TREASURER` for create, update, list and get-one. *(FR draft says "Captain, Secretary, or SK Staff"; the code also allows `TREASURER`. Updated 2026-10-20; it was `CAPTAIN, SECRETARY, SK` with `TREASURER` only on the list endpoint.)*

**Process steps:**
1. Staff opens `/redemption`. Program cards show Budget, Redemption Mode (Points/Cash), and a chip list of materials with their point/cash values.
2. **Add Program** opens a modal: **Program name**, **Program description**, **Redemption mode** (two selectable cards: "Points — Earn points to redeem rewards" / "Cash — Receive cash for materials"), **Allotted budget**, and **Materials and point values** — a grid of material chips grouped by category (Metals, Papers, Plastics, Glass...), each a "+" button.
   - Branch: clicking a material chip expands it in place into a per-material value input, unit-aware (e.g. "pts/piece" for a piece-tracked material, "pts/kg" for a weight-tracked one), with an "×" to remove it. Confirmed live. Note under the grid: "Materials left unselected won't be included in your program."
3. Submitting calls `POST /redemption/programs` — required: name, allotedBudget, programMaterial (array), description (all falsy-checked, so a budget of literally `0` would incorrectly be rejected as "missing"). `isCashMode` is optional (defaults false).
4. Existing programs can be edited (same modal, pre-filled) via `PATCH /redemption/programs/:id`, including a Deactivate/Reactivate toggle (`isActive`).
5. *(Added 2026-10-20)* When **creating** a program, CAPTAIN, SECRETARY and SK see an **Announce this program** toggle. With it on, the server creates an `EVENT` announcement (title = program name; content = description plus the accepted materials and their values) in the same transaction as the program. A TREASURER can create programs but the announcement is skipped. The announcement is a snapshot and does not follow later edits.

**Fields involved:**
- Program name — text — required
- Program description — text — required
- Redemption mode — Points/Cash toggle — optional (defaults Points)
- Allotted budget — number — required (falsy-check bug: `0` incorrectly rejected)
- Materials and point/cash values — one or more `{ materialId, pointValue or cashValue }` — optional to select any, but each selected material needs its value typed in

**Discrepancies found (2026-08-24):**
- `updateProgram` still destructures a `maxPoints` field that no longer exists on the `Program` model (removed in an earlier schema pass) — dead code, harmless unless a client actually sends it (would cause a Prisma error).
- Falsy-check bug on `allotedBudget` (and see FR16/FR18 for the same pattern elsewhere) means a legitimately-zero value is rejected as "missing."
- *(Fixed 2026-10-20)* `updateProgram` could not change the Points/Cash mode, only ever wrote `pointValue` (so cash programs could not be edited), and **never removed a material the staff deselected**: the request reported success but nothing changed.

**Behavior after the 2026-10-20 fix (from code):**
- Deselected materials are deleted, unless the material already appears in a transaction; then the request is rejected with a message naming it and nothing changes.
- An empty material list is rejected.
- Values are written to `cashValue` or `pointValue` according to the program's mode.
- The mode can be changed only while the program has **no transactions** (existing records are valued in the old mode); the modal shows a toast and does not send the request, and the server enforces the same rule. Changing the mode requires new material values, and the other mode's value is cleared.
- Every material id (on create and on edit) must belong to the caller's barangay.
- The edit runs in one database transaction, so it either fully applies or not at all.

**Open questions:** None.

---

### 14. Record Redemption Transaction

> *Revised 2026-10-20 from the code (not re-verified live). The 2026-08-24 version described a free-text "Beneficiary" and an "Educational level" field; both are gone.*

**Roles allowed:** `CAPTAIN, SECRETARY, SK, TREASURER` — `POST /redemption/transactions`. *(FR draft says "Captain, Secretary, or SK Staff"; the code also allows `TREASURER`.)*

**Process steps:**
1. From `/redemption` (or from a program's detail page, where the program is pre-selected), staff clicks **Record transaction**. Modal: **Program** (dropdown of active programs), **Resident** (search; disabled with "Select program first" until a program is chosen), **Material items** (repeatable rows: Material select, amount, "pts/unit" or "₱/unit" suffix), a live **Estimated total**, Cancel / **Record Transaction**.
2. Selecting a Program enables **Resident**, a debounced search (`GET /redemption/residents/search?name=&programId=`).
   - Every typed word must match the resident's first or last name (any order); up to 10 registered residents of the staff member's barangay are returned, each with their **balance in that program** (computed, not stored; see FR15).
   - Branch — no match: "No registered resident found". There is no longer an option to create a person: only registered residents can take part.
   - Editing the text after picking a resident clears the pick, so what is shown is what is submitted.
3. Staff adds one or more material rows and submits. Client-side checks come first, with toasts: "Please select a resident" (nothing typed), "Resident not found" (text typed but no resident picked), and the add-at-least-one-material message.
4. `POST /redemption/transactions` with `{ programId, residentId, items: [{ programMaterialId, amount }] }`. The client never sends a name.
5. Server: all three fields required (400). The program must belong to the caller's barangay (404 "Program not found") and be active (400 "Program is inactive"). The resident must be a `RESIDENT` of the same barangay (404 "Resident not found"). Every `programMaterial` must belong to that program and barangay (404 "Program material not found"). Then, in one database transaction: the `RedemptionTransaction` is written with the resident's id and the **collector's and resident's names taken from their accounts** (snapshots), each line item stores a frozen `currentValue` (the program's `cashValue` or `pointValue` at that instant), the resident is marked verified, and one `StockTransactionLog` `IN` row per item is written (`source: REDEMPTION`) **with the resident's `userId`**, so redemption contributions count on the leaderboard.

**Fields involved:**
- Program — dropdown — required, must be active
- Resident — search-select — required (`residentId`)
- Material items — one or more `{ programMaterialId, amount }` — required (the server checks only that `items` exists, so an empty array would pass; the modal blocks it)

**Discrepancies / notes:**
- **No check against the program's `allotedBudget`** (unchanged since 2026-08-24). The budget is informational, not an enforced cap.
- The `Beneficiary` table, its stored `points` total and `educationalLevel` were removed; the resident is the beneficiary. A household without an account cannot earn points until a resident registers (decision taken with the barangay, which wants rewards tied to the household's own effort).
- Recording a transaction marks the resident verified (as intake and a completed pickup already do), so they can see the resident Programs page.

**Open questions:** Should transactions be blocked, or at least warned, once a program's spending would exceed its allotted budget?

---

### 15. Look Up Resident Records for Redemption

> *Renamed and revised 2026-10-20 (was "Look Up Beneficiary Records").*

**Roles allowed:** `CAPTAIN, SECRETARY, SK, TREASURER` — `GET /redemption/residents/search` and `GET /rewards/residents/search`.

**Process steps:**
1. Used inline inside the Record Transaction modal (FR14) and the Release Reward modal (FR17); typing a name triggers a debounced search.
2. Both endpoints take `name` and `programId` and return `{ id, name, points }` per resident, where `points` is the resident's **live-computed balance in that one program** (points earned from that program's transactions minus points spent on that program's rewards, `getResidentProgramBalance`). Words are matched against first and last name in any order; at most 10 results.
3. One difference: the Release Reward search lists **every registered resident, including those with 0 points**, so staff can see why a release is not possible. (Before 2026-10-20 it listed only beneficiaries with a transaction in the program.)

**Fields involved:** Search input — text; results are read-only rows.

**Discrepancies / notes:**
- The three different lookups described on 2026-08-24 (a stored global `points` field, a program-scoped balance, and a stricter reward variant) no longer exist. `GET /redemption/beneficiaries` and the stored `points` field were removed, so there is now one meaning of "points": the balance in one program.
- Points earned in one program cannot be spent in another.

**Open questions:** None.

---

### 16. Record Reward Inventory

**Roles allowed:** `CAPTAIN, SECRETARY, TREASURER, SK` — `GET/POST /rewards` (the route is mounted at `/rewards`; the page is `/reward-inventory`). *(Matches the FR draft's role list exactly.)*

**Process steps:**
1. Staff opens `/reward-inventory`. Header stats: Total Items, Total Available, Total Released, Total Residents (distinct residents who received a reward; releases from before the resident link have none and are not counted). *(Label updated 2026-10-20; was "Total Beneficiaries".)*
2. "Reward Items" table: Program, Category, Name, Available, Added On. *(2026-10-20)* A **program filter** (All Programs plus each program, with counts) sits above both this table and the Release History table, each filtering independently.
3. **Add Item** opens a modal: **Program** (dropdown), **Reward Item Name** (text), **Category** (dropdown — `MEDICINE`/`GOODS`/`SCHOOL_SUPPLIES`/`SERVICES`/`OTHERS`), **Quantity** (number), **Point Cost** (number). Cancel / **Add Item**.
4. `POST /reward-inventory` requires name, category, programId, quantity, pointCost (all falsy-checked).

**Fields involved:** Program — required. Name — required. Category — required, one of the 5 enum values. Quantity — required (falsy-check bug: `0` incorrectly rejected). Point Cost — required (same bug: `0` incorrectly rejected).

**Discrepancies found:**
- Falsy-check validation bug: a genuinely-zero Quantity or Point Cost is rejected as "missing" rather than accepted as a valid (if unusual) zero value.
- No check that the chosen `programId` actually belongs to the caller's barangay before insert — an invalid/foreign id would surface as a raw Prisma FK error (500) rather than a clean validation message.

**Open questions:** None beyond the validation gaps above.

---

### 17. Release Reward to Resident

> *Revised 2026-10-20 from the code (not re-verified live).*

**Roles allowed:** `CAPTAIN, SECRETARY, TREASURER, SK` — `POST /rewards/release`.

**Process steps:**
1. From `/reward-inventory`, staff clicks **Release Reward**. Modal: **Program** (active programs), **Resident** (search; shows the resident's balance in the program), **Reward items** (repeatable rows: item select, quantity, "pts/item"), a live **Total Point Cost**, **Add row**, Cancel / **Release Reward**.
2. Choosing a program loads that program's reward items (`GET /rewards?programId=`), each labelled with how many are available; an item with none left is shown disabled as "out of stock".
3. On submit the modal checks, in this order, and shows a short message for the first problem: "Select a program"; "Select a resident" or "Resident not found"; "Add at least one item"; "{item} is out of stock" or "Only N {item} left"; "Not enough points. Needs X, has Y".
4. `POST /rewards/release` with `{ residentId, programId, items: [{ rewardItemId, quantity }] }`. The server rejects non-positive quantities (400), merges rows that list the same item, requires every item to belong to the program and barangay (404), requires the resident to be a registered `RESIDENT` of the barangay (404), checks stock (400 "Not enough stock") and the resident's balance in that program (400 "Not enough points"), then writes one `RewardRelease` row per item with the resident's id, the resident's name as a snapshot, and the releasing staff member's name and role.

**Fields involved:** Program — required. Resident — search-select — required. Reward items — one or more `{ rewardItemId, quantity }` — required, validated against stock and balance.

**Discrepancies / notes:**
- The 2026-08-24 finding that a beneficiary had no link to a registered account is resolved: the beneficiary is now a registered resident. Release does not read `isVerified` directly, but a resident can only hold a balance after a redemption transaction, and recording one marks them verified.
- Fixed 2026-10-20: a reward item from another program used to crash the request with a 500, and a negative quantity could add points. Both are rejected with clean messages.
- Release is not blocked for an inactive program, so residents can still spend points after a program ends.

**Open questions:** Should reward release be blocked for an inactive program, or is spending leftover points after a program ends intended?

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

> *Note added 2026-10-20 (from the code): redemption transactions now write their stock rows with the resident's `userId`, and manual intake can be recorded against staff accounts, so both now count on the leaderboard (staff included). The statements below about `REDEMPTION` rows having no `userId` describe the 2026-08-24 behavior.*

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
1. Staff opens `/reports`. Four independent report sections are shown simultaneously, each with its **own** Filter control (This week / This month / Custom range / Custom date — confirmed live via the dropdown): **MRF Inventory** (material movement in/out), **Collection & Intake** (merges `PickupRequests` rows tagged "App Request" with `ManualIntakeTransaction` rows tagged "Manual Intake" into one feed — this is the reporting module's own version of the FR9/FR10 disambiguation, treating them as two channels of one list), **Redemption & Rewards** (with its own program filter; since 2026-10-20 each row shows the **Resident**, date, materials, earned, rewards received, date released and spent — the Educational Level column was removed — and a transaction's rewards are matched by resident id, falling back to the saved name only for rows from before residents were linked; the Excel sheet has the same 9 columns), and **Program Funds** (Total Income/Expense/Net for the selected range).
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

**Update 2026-10-20 (from the code):**
- Every barangay is created with the same **core material list** (`backend/src/utils/coreMaterials.js`); Settings only adds to it. Barangays cannot remove or deactivate a material; an unused one is ignored.
- The core list now matches the pilot barangay's collection: glass is `Gin Bottle (2x2)`, `Round Bottle (Bilog)`, `Ketchup Bottle`, `Liquor Bottle (Long Neck)` (replacing `Alak Bottles` and `Beer Bottles`); metals gained `Cans (Lata)` and `Scrap Metal (Landok)`; `Tin Cans` is counted by kilogram.
- The AI photo classification only recognizes the core list. A material added in Settings works everywhere else but is never suggested by the AI. This is a stated delimitation of the study.
- Changing the core list needs a backfill for existing barangays (`seedCoreMaterials()` adds rows only; renames, unit changes and hiding old rows are done by hand).

**Open questions:** None.

---

### 31. View Redemption Programs (Resident)

> *Added 2026-10-20 after adviser feedback that residents could only learn about programs through announcements. Written from the code, not verified live. It is not in the original FR table, so the numbering here is new.*

**Roles allowed:** `RESIDENT` — `GET /redemption/programs/residents`.

**Process steps:**
1. On the Barangay (community) tab, a "Redemption Programs" section previews up to two active programs with a **View more** link. It appears only when the barangay has redemption management enabled (`hasRedemptionManagement`, returned by `GET /resident/barangay-info`).
2. `/programs` lists every active program of the resident's barangay: name, a Points/Cash badge, description, the accepted materials with their value per unit, and (points programs only) the available reward items with their point cost. Rewards with no stock left are not listed.
3. As with announcements, the section is **locked until the resident is verified** ("Redemption programs are locked — complete your first pickup..."). A resident becomes verified through a completed pickup, a manual intake recorded for them, or a redemption transaction recorded for them.
4. If the barangay has redemption disabled, the endpoint answers `enabled: false` and nothing is shown.
5. Staff can make a new program known immediately by ticking **Announce this program** when creating it (FR13).

**Fields involved:** Read-only; no inputs.

**Resident points on the home screen:** the home "Your Contribution" card shows the resident's points in one program on its right side (`GET /redemption/residents/me/points`, same verified lock). Tapping it opens a bottom sheet listing every program with its points, and the choice is remembered on the device; the default is the program used most recently. With one program the tap opens `/programs`. Points are never added together across programs; cash programs show pesos earned.

**Points on each program card:** every card on `/programs` (and in the Barangay-tab preview) shows a "Your points" strip with the resident's balance in that program (`myPoints`, computed; "You've earned" in pesos for cash programs).

**Redemption history:** a "My redemption history" link on `/programs` opens `/programs/history` (`GET /redemption/residents/me/history`). It lists, newest first and filterable by program, each time the resident **brought** materials to a program (materials and amounts, points or pesos earned) and each reward they **claimed** (quantity, points spent). It shows the latest 100 of each and has no pagination.

**Discrepancies / notes:** Not in the FR table.

**Open questions:** None.

---

## Summary — role-gate corrections needed in the finalized FR wording

| Feature | FR draft wording | Actual `requireRoles()` |
|---|---|---|
| Dashboard stats | (n/a, not in FR list) | `CAPTAIN` only |
| Manage Pickup Request Lifecycle | "authorized barangay staff" | `CAPTAIN, SECRETARY, COLLECTOR` |
| Record Scheduled Recyclable Collection | "barangay staff" | `CAPTAIN, SECRETARY, SK, COLLECTOR` |
| View MRF Inventory / Record Manual Stock Adjustment | "authorized barangay staff" | `CAPTAIN, SK, COLLECTOR, SECRETARY` (no `TREASURER`) |
| Manage Redemption Programs (create/edit) | "Captain, Secretary, or SK Staff" | `CAPTAIN, SECRETARY, SK, TREASURER` on every endpoint (the code also allows `TREASURER`) |
| Record Redemption Transaction | "Captain, Secretary, or SK Staff" | `CAPTAIN, SECRETARY, SK, TREASURER` (the code also allows `TREASURER`) |
| Look Up Resident Records for Redemption (was "Look Up Beneficiary Records") | "Captain, Secretary, SK Staff, or Treasurer" | matches exactly |
| View Redemption Programs (Resident), new | (not in the FR table) | `RESIDENT` |
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
