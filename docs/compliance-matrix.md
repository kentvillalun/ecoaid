# Compliance Matrix Tracker

Post-defense panel revisions. This file is the single place to see what is done and what is next, so a new chat can pick up from here without the old conversations.

> Last updated: 2026-11-21. Goal: 100% of the panel's recommendations, ideally before the December Christmas break, because the finished system is needed for the internship paperwork. No exact deadline has been given. Ask the adviser for the revision deadline and what "100%" means for the paperwork.

**Working style:** the maintainer writes the code. The AI assistant acts as a senior developer (review, risks, explanations, plans) and writes code only for repetitive work when the maintainer asks. Nothing is committed unless asked. One item at a time, planned only as deep as needed right before building it.

Legend: `[x]` done, `[~]` partly done, `[ ]` not started, `[?]` waiting on a decision or an outside party.

---

## 1. At a glance

**7 done, 3 partly done, 4 not started, 1 waiting** (15 items).

| # | Item | Status | Next step |
|---|------|--------|-----------|
| 1 | Uniform text inputs, asterisks on required fields | `[x]` | Click-through in the browser |
| 2 | Remove sitio from resident registration | `[x]` | None |
| 3 | Real-time form validation | `[~]` | Scoped: real-time only on the high-stakes forms (signup, barangay onboarding, login, staff). Other forms keep simple submit validation |
| 4 | OTP message masks the number | `[x]` | Include in the push test |
| 5 | Activate and ban resident accounts | `[~]` | Phase A: deactivate/reactivate UI (section 3) |
| 6 | Parents as primary users, children as beneficiaries | `[~]` | Brainstorm: framing only or a "released to" name |
| 7 | SMS for points and announcements (panel: optional) | `[?]` | Waiting on the SMS provider (email in section 8) |
| 8 | Prices always 2 decimals, right-aligned | `[x]` | Done Nov 21: peso amounts use `formatCurrency` and are right-aligned; pieces show as whole numbers and other units with 2 decimals (`formatQty`). Left as they are: reward counts, input fields, the Excel sheets other than MRF inventory, and the redemption tables that mix points and pesos |
| 9 | Reward for the monthly leaderboard winner | `[ ]` | Brainstorm |
| 10 | Expand "MRF" to "Material Recycling Facility" | `[x]` | Done Nov 21: sidebar says "Inventory", the page title says "Material Recycling Facility Inventory". The backend Excel sheet name still says "MRF Inventory Report" |
| 11 | System-wide warning before critical actions | `[ ]` | Brainstorm |
| 12 | Per-user light and dark theme | `[ ]` | Largest item; start early |
| 13 | Enhance the app logo | `[ ]` | Design decision |
| 14 | Group the sidebar items into categories | `[x]` | Done Nov 21: collapsible groups Materials, Finance and Community; check the drawer on a phone and with the Collector, SK and Treasurer roles |
| 15 | Reports as sidebar subitems (one section = one page) | `[x]` | Done Nov 21: four pages under Reports; each has Export and Export all (see section 3) |

Items 14 and 15 were raised verbally by the panel (panelist not recorded) and are not in the written sheet. They are treated as required, because the panel can raise them again at the next check.

### Where each panel recommendation went

| Panel # | Recommendation | Location | By | Tracker item |
|---|---|---|---|---|
| 1 | Standardize text input design, asterisks | Admin | Chair, M1 | 1 |
| 2 | Remove Sitio from address; Barangay is the primary indicator | Admin | M1 | 2 |
| 3 | Real-time validation; OTP message with masked number | Admin | Chair | 3, 4 |
| 4 | Deactivation and banning of accounts | Client | Chair | 5 |
| 5 | Parents primary users, children beneficiaries | Client | All | 6 |
| 6 | Optional: SMS for points and announcements | Admin | Chair | 7 |
| 7 | Pricing two decimals (e.g. Php. 10.00) | All that applies | All | 8 |
| 8 | Reward system for active participation | Leaderboard | All | 9 |
| 9 | Expand MRF to "Materials Recycling Facility" | Admin | Chair | 10 |
| 10 | System-wide warning before critical actions | Admin | All | 11 |
| 11 | Dynamic light/dark themes | Admin | Chair | 12 |
| 12 | Enhance the logo | All that applies | Chair | 13 |
| verbal | Sidebar categories; Reports subitems | Sidebar | not recorded | 14, 15 |

---

## 2. Decisions

### Made

**Item 5, account ban (decided 2026-11-19).**

*Phase A: deactivate and lift*
- Captain and Secretary can deactivate a resident with a required reason. A ban is just a deactivation with a reason.
- No expiry. Staff can lift it at any time (for example after an appeal).
- A deactivated resident is signed out on their next request (the auth middleware already rejects inactive users). At login they see the reason plus the helper text "Contact your barangay staff to appeal."
- Store who, when and why on the user record. There is no audit table, so a second ban overwrites the first.
- Show it in the Edit Resident modal (read-only block with a "Lift ban" button) and a "Banned" status on the Residents list. `getResidents` must also return `isActive`. No new detail page.

*Phase B: three mismatches flag a resident*
- A "photo doesn't match" toggle in the Finalize modal, saved with Finalize. A confirmation modal shows only when the toggle is on (reuse the existing `Modal`).
- Mismatches are counted in total, never reset by good pickups.
- At 3, a flag card appears on the Residents page for Captain and Secretary. Staff decide; there is no automatic ban. The card also covers the case where a collector cancels the modal by accident.
- After a ban is lifted, only mismatches after the lift count, and the limit drops to 1 (probation). Old flags are never deleted.
- Keep the numbers 3 and 1 as constants in one file.
- Needs a migration, tested on a local database first.

**Decided 2026-11-19 (closing the open questions)**
- **Item 5 storage:** one `photoMismatch` flag on each pickup request plus one nullable `reactivatedAt` on the user. The count is computed, never stored (project rule).
- **Item 8:** keep the `₱10.00` format. All numbers (prices, kg and other floats) show 2 decimals. Anything that shows currency or money is right-aligned, not only table columns (cards, summaries and modals too). Number columns in tables are right-aligned as well.
- **Item 14:** a mixed sidebar like the earlier version. Important modules stand alone (dashboard, collections, residents, settings, and redemption, which should stay one tap away on mobile). Other modules sit under group headings such as Communication or Management. Not every module belongs to a group.
- **Item 15:** Reports is either standalone or inside a group (flexible). When opened it shows its four sections as subitems. Each page shows one section and keeps its own export button (export per section). Decision changed on Nov 21: each page has Export (this section only) and Export all (all four sheets, using the filters last set on each page).

- **Item 3 scope:** real-time validation is not needed on every field or form. Use it where a typo costs something: registration, barangay onboarding, login, staff. Elsewhere, simple validation on submit is enough. This is a design principle, not a shortcut: for each form ask "does it actually need real-time feedback?" The panel asked for real-time validation, so the scoped forms must really have it, and this reasoning is the answer if the panel asks why the rest don't.

**Validation display rules (decided 2026-11-20)**
- `useState` forms stay as they are (no migration to `react-hook-form`). They get inline errors on submit: each invalid field shows its own message under it, replacing vague toasts such as "all fields are required". A field's message clears when the user edits that field. This is not real-time validation.
- Real-time validation (on leaving a field) applies only to the four high-stakes forms in item 3.
- Toasts stay for outcomes and server failures.
- First case: the Edit Resident modal (found in the push test). Add the same to the other `useState` modals as they are touched.

**Other**
- Middle name is required in the frontend forms (signup, resident profile, Edit Resident). The backend keeps it optional for older residents.
- `useUpdate` stays for the pickup request lifecycle; `useMutation` everywhere else.
- `searchResident` uses `$queryRaw` on purpose (staff are included in the search).
- The pickup-request status guard (a COLLECTED request could be rejected through a direct API call) is accepted risk for now.

### Still open

- **Item 5:** can staff clear a mismatch flag after Finalize? (Leaning no, for now. Decide when building Phase B.)

---

## 3. Plans per open item

Keep these short. Go deeper right before building each one.

**3. Real-time validation**
- Scoped to signup, barangay onboarding, login and staff forms: add `mode: "onTouched"` (gentler) or `"onChange"` to those `react-hook-form` forms and check each field shows its error as the user leaves it.
- All other forms and `useState` modals keep simple submit validation. No new machinery.

**5. Activate and ban accounts**
- Build Phase A first (no migration beyond the ban fields), then Phase B. Design is in section 2.

**6. Parents and children**
- Choose between (a) framing only, such as "household account" wording in the UI and docs, or (b) an optional "released to" name on a reward release.

**7. SMS**
- Blocked on the provider. Also decide the triggers (points milestone, new announcement) and whether residents can opt out.

**8. Decimal formatting**
- Find the 15 files that bypass `formatCurrency` (search for `toFixed`, `toLocaleString`, `₱`). Add a plain-number helper (kg and other floats, 2 decimals). Right-align everything that shows money, not only table columns. Where a card or summary makes right-alignment look wrong, decide when building.

**9. Leaderboard reward**
- Brainstorm: who sets the prize, title or prize or both, per month, who gets notified.

**10. MRF rename**
- Done Nov 21. Visible text only. The sidebar label is "Inventory" and the page title is "Material Recycling Facility Inventory" (singular, as the maintainer chose). The Reports section, the delete modal text, routes and DB names are unchanged apart from that. Left for polish: the Excel sheet name "MRF Inventory Report".

**11. Warnings**
- Brainstorm: which actions are critical, exact triggers (negative fund balance, large unsold stock), warn or block, where the message shows. Example: negative program fund balance, so tell staff to sell stock before collecting more.

**12. Dark mode**
- Move hard-coded colors to variables first, then add the dark values. Separate from the barangay accent theme. Decide: save on the account (new column and migration) or on the device only.

**13. Logo**
- Decide on the design. Then swap it in the login pages, sidebar, favicon and app icon.

**14. Sidebar categories**
- Done Nov 21. Standalone: Dashboard, Residents, Collection Requests, Redemption, Reports. Collapsible groups (closed by default, the group with the active page opens automatically): Materials (Manual Intake, Inventory), Finance, Community. Groups with no visible items for a role are hidden. Reports is a heading-style parent with four subitems. Not yet tested: the mobile drawer for Reports, and the Collector, SK and Treasurer roles.

**15. Reports as subitems**
- Done Nov 21. Pages: `/reports/material-inventory`, `/reports/collection-intake`, `/reports/redemption-rewards`, `/reports/program-funds`; `/reports` redirects to the first. Each page has **Export** (its own section) and **Export all**. Filters live in a shared context in `reports/layout.jsx`, so they persist when switching report pages (a page refresh resets them). The Material Inventory page also got a material filter (`GET /reports/materials`). Known gap: the backend groups days in UTC, so records between 00:00 and 08:00 Manila time count on the previous day.

---

## 4. Polish backlog (after the required items)

Not from the panel. Do these only after items 1 to 15, and build once on the Residents list first.

- Reusable search bar for every module (names and any detail of that module). The current search bars are hidden.
- Pagination on desktop and infinite scroll on mobile. Search and pagination are one backend problem, so design them together.
- Rate limits, starting with login and OTP.
- Barangay logo. A logo upload on the Settings page, then show the logo with the barangay name somewhere in the app (where to show it is still open, for example the sidebar header and the resident header). The `Barangay.logoUrl` column already exists, but nothing reads or writes it yet. It still needs an update endpoint, the logo in the barangay data the app already fetches, and a decision on where the image file is stored.

---

## 5. Order of work

**Next session (evening, 2026-11-19):**
1. [ ] Push-test `3e2893e` on local `ecoaid_demo` (checklist below).
2. [x] Item 10: rename the visible "MRF" text (done Nov 21, see section 3).
3. [ ] Item 3: add `mode: "onTouched"` to the signup, barangay onboarding, login and staff forms, then check each shows its errors on leaving a field.

Item 8 was finished on Nov 21.

The earlier day-by-day schedule predates items 14 and 15. Kent is drafting a new week-by-week order. Fixed points until then:

1. Push-test `3e2893e` on `ecoaid_demo` (`DATABASE_URL` was checked on 2026-11-19 and points to local `ecoaid_demo`; never Neon; for phone testing, run both servers locally and expose only the frontend through a tunnel; use the blank-SMS-key guard when testing signup). Test list: middle name on every screen, Edit Resident (no change, sitio only, no middle name, no sitio), resident profile edit, decline modal, approve and schedule, name search, OTP screen.
2. [x] Item 8 and the quick wins (10).
3. Dark mode (12) starts early because it is the largest risk.
4. Send the SMS provider email (section 8); item 7 depends on the reply.

---

## 6. What was done (2026-11-15 to 2026-11-17)

All of it is committed and on `origin/main` (checked 2026-11-18).

| Commit | What |
|---|---|
| `0abe381` | Remove sitio from registration, polish the OTP screens |
| `b7b8e5e` | Hide sitio fields when residents have no sitio |
| `8e06058` | Middle name field in the Edit Resident modal |
| `81e8de2` | Required-field asterisks on the remaining forms |
| `9d40215` | Tighter admin and barangay login cards |
| `8b31155` | Asterisks on the barangay form |
| `cc3614c` | Middle name column (migration `20261115043552_add_middle_name_in_user_table`), staff form field, Deactivate/Reactivate for staff (`PATCH /admin/barangays/:id/staff/:staffId`) |
| `3e2893e` | 31 files, the batch below. Its message only mentions the rejection fix, the asterisks and this tracker |

**Batch `3e2893e` in detail**
- **Middle name shown everywhere** as "First Middle Last": `formatFullName` helpers in `frontend/src/lib/` and `backend/src/utils/`. Backend queries that build a name also select `middleName`. About 11 frontend screens use the helper. The home greeting stays first-name-only. Name searches also match the middle name.
- **Resident profile page:** middle name field added. Asterisks only in edit mode. Save blocks blank required fields. The backend returns and saves `middleName`, rejects blank first name, last name or phone number, and trims.
- **Edit Resident modal:** fixed the sitio comparison bug (it compared a name to an id, so "no changes" was never detected and Save showed "Edit failed"). Values are trimmed. `editResident` scopes the sitio lookup to the caller's barangay.
- **Decline modal:** asterisk on the reason, blocks an empty reason, controlled textarea cleared on close, shows the server's error, typo fixes.
- **`useUpdate` hook:** returns `false` on failure, resets `isLoading`, exposes `errorMessageRef`.

---

## 7. Known leftovers

- Old records keep first-and-last-name text in stored `performedBy` and `collectorName` columns.
- A `react-hooks/set-state-in-effect` lint error on the resident personal information page (existed before).
- No build, browser click-through or end-to-end test has been run on `3e2893e` yet (the push test covers it).
- **Production:** before the deployed backend runs this code (it now selects `middleName`), check that the production database has the middle name migration applied (`prisma migrate deploy`).
- **Line endings:** working files are CRLF but the repo stores LF, so `git status` lists about 31 files as modified while `git diff --ignore-space-at-eol` shows nothing. Settle `.gitattributes` or `core.autocrlf` before the next commit.

---

## 8. SMS provider email (draft)

**To:** Semaphore support
**Subject:** Using our approved sender name for non-OTP notifications (EcoAid)

Hello Semaphore team,

We use Semaphore for one-time passwords in EcoAid, a waste management and recycling system for barangays in the Philippines. Our sender name is currently approved and working for OTP messages through the OTP endpoint.

We would like to start sending informational messages to our residents, for example:
1. A short update on their recycling points balance.
2. A notice when their barangay posts an announcement.

Could you please advise on the following:
1. Can our existing approved sender name be used for these messages through the regular messages endpoint, or do we need to register a separate sender name? If so, what are the requirements and how long does approval usually take?
2. Are there content rules or template approvals for informational or notification messages?
3. How are these messages priced compared with OTP messages, and how are credits counted for messages longer than one SMS?
4. Do you require opt-out or consent handling for messages like these?
5. Are there rate limits or sending-time restrictions we should plan for? We expect a few hundred recipients per barangay during our pilot.

Thank you for your help.

Best regards,
[Your name]
[Account email registered with Semaphore]
[Current sender name]
