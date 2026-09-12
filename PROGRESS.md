# EcoProfit — Progress Log

This file tracks completed work, known technical debt, and open items across sessions. Newest entry on top.

> Note: this file didn't exist before 2026-09-06. `CLAUDE.md` also references `docs/project-overview.md`, `docs/business-rules.md`, `docs/module-boundaries.md`, `docs/current-progress.md`, and `AGENTS.md` — none of those exist in the repo either. Worth reconciling at some point, but out of scope for this entry.

---

## 2026-09-12

### Context

This entry is a docs-sync audit, not a coding session: `docs/current-progress.md` and `docs/project-overview.md` hadn't been updated since an "Aug 27, 2026" entry, and a large stretch of real commits (2026-09-05 through 2026-09-12) had landed with no corresponding doc update. Both files have now been brought current — see them for full detail. This entry reconciles this file's own "Still open" / "known technical debt" lists against what actually shipped in that window.

### Completed since the last entry (superseding items below)

- **Super Admin Dashboard is no longer a placeholder.** `GET /admin/onboarding-status` (`admin-dashboard.controller.js`) now returns every barangay with a computed `isIncomplete` flag (missing CAPTAIN/SECRETARY/TREASURER staff, or zero sitios); `/admin-dashboard` shows onboarded-vs-needs-attention counts plus an `IncompleteSetupTable`/`IncompleteSetupCard`. The "Coming soon" placeholder mentioned in the 2026-09-06 entry below is gone.
- **Claude-powered recyclable image classification shipped** on the resident capture flow — this resolves the "Image recognition approach" item parked below. Landed as a general-purpose vision LLM call (`claude-sonnet-5` via `@anthropic-ai/sdk`), not Teachable Machine: `POST /pickup-requests/classify` (`image-recognition.controller.js`), constrained to a fixed material catalog (`backend/src/utils/coreMaterials.js`'s `CORE_MATERIALS`), rate-limited (5 req/min, `express-rate-limit`). Frontend compresses the photo client-side (`browser-image-compression`) before sending it, then auto-fills the capture form from the response, with a manual-entry fallback. No formal accuracy evaluation against the 5 target material classes was recorded anywhere in the commits — if the adviser wants that number, it still doesn't exist.
- **A real cross-tenant IDOR was found and fixed** (not in the 2026-09-06 list, found later): `updateStatus`/`getRequest` (pickup requests) and `updateProgram` (redemption) resolved records by `id` alone, so a barangay admin could view/mutate another barangay's rows by id. Fixed by scoping every `where` to the caller's own `barangayId`.
- **Deployment moved off the stale-Neon-schema path**: backend now runs on Render (`ecoaid-ydrs.onrender.com`), not the Railway URL referenced in older docs; `@prisma/adapter-pg` moved to real `dependencies` since it's required at runtime there. The Hostinger VPS/PM2/Nginx plan mentioned under "Parked" below does not appear to have been used — Render was the path actually taken.

### Re-checked: items below, current status

- **`BarangayTable.jsx` row-click TODO — still not fixed.** The commented-out `onClick` is still there; the row itself is still not clickable. (The "View details" button in the same row does work, so it's a UX gap, not a broken feature.)
- **Stray `console.log`s — partially cleaned up.** The one in `barangay-accounts/[id]/page.jsx` (`staffData`) is gone. The ones in resident `home/page.jsx` (`requestData`) and `program-funds/page.jsx` (`modules`) are both still present.
- **Duplicate `paga.jsx` file — deleted.** Only `page.jsx` exists under `admin-dashboard/` now.
- **Schema debt (`Barangay.redemptionMode` dead field, `hasCollectionRequests` default-`true`) — both still present, unchanged.**
- **Super Admin's own Settings page — still doesn't exist.** Still open.

### New gap found during this audit (not previously flagged anywhere)

- **Barangay `has___` feature flags are enforced client-side only, not at the `proxy.js` middleware level.** Role-based access (`ROLE_MATRIX`) *is* enforced server-side in `proxy.js` — a role without access to a route is redirected to `/403` even on direct URL access. But `proxy.js` never fetches a barangay's `has___` flags at all; that check only happens in `Sidebar.jsx` (hides the nav link) and in the handful of pages that call `getBarangayModules` themselves (`program-funds`, resident `home`/`standings`). A staff member whose *role* is allowed into a route but whose *barangay* has that module disabled can still reach the page directly by URL. Tracked as the top item in `docs/current-progress.md`'s Next Steps.

---

## 2026-09-06

### Completed this session

**Barangay Accounts module** — list page (`BarangayTable`/`BarangayCard`), register form, detail page, edit page. Backend controllers (`getBarangays`, `registerBarangay`, `editBarangay`, `getBarangayDetails`) all have uniqueness checks on zip code and contact number, correctly scoped to exclude self on edit (`id: { not: id }`). Verified: all routes registered under `authenticateSuperAdmin` at `/admin`, all frontend pages/components exist and are actually rendered (not just present in isolation).

**Staff Accounts feature** — `registerStaffAccount` and `getStaffAccountsByBarangay` controllers, nested under the barangay detail page (`StaffTable` + `AddStaffModal`, both confirmed rendered there). Includes a fix for a real duplicate-role bug: a barangay had two Treasurer accounts, and the table was silently hiding the second one via `.find()`. Resolved by rendering every account as its own row, with missing-role placeholders detected separately via a `Set` lookup against `STAFF_ROLES` rather than one row per fixed role slot.

**Sitio Management** — `createSitio`, `getSitios`, `editSitios` controllers, uniqueness scoped to `barangayId + name` matching the schema's `@@unique` constraint. Frontend uses a tag-input pattern (not a table, not a batch form): a single shared input toggles between "Add" and "Save" mode depending on whether a pill is selected, with inline error handling and a discard (X) affordance. The Add/Save button is a text link on mobile and a `gradient-button-admin` pill (with icon) on `md:`+, matching the rest of the page's action buttons.

- Bug found and fixed during this work: `createSitio`'s duplicate check used an invalid `findUnique` shape (`{ name, barangayId }` instead of the compound key) *and* inverted logic — it rejected brand-new names as duplicates and let real duplicates through. Fixed to `findUnique({ where: { barangayId_name: { barangayId: id, name } } })` with correct polarity (`if (existingSitio) → 400`).

**Module-flag gating** — extended the existing `getTheme` controller (shared between the barangay-staff and resident theme endpoints, `/settings/theme/staff` and `/settings/theme/resident`) to also return a `modules` object alongside `theme`, without breaking the existing response shape. Wired into:
- Barangay sidebar filtering (`MODULE_FLAG_MAP` + `passesModuleCheck` in `Sidebar.jsx`, layered on top of the existing `ROLE_MATRIX` role filtering, fed from `DrawerContext` in `(barangay)/layout.jsx`).
- Program Funds page — the Program Budgets section and the Add Expense button are both hidden unless `hasRedemptionManagement && hasRewardInventory` are true.

**Resident-side leaderboard gating** — Home page's "Rank #1" pill / "View standings" link (and the click-through to `/standings`) hidden when `hasLeaderboard` is false. Standings page redirects to `/home` if accessed directly without the flag enabled.

**Resident Settings page cleanup** — removed the non-functional Language/Dark Mode toggles, replaced with a single "Terms & Privacy" row linking to a new dedicated page (`/profile/settings/terms`), which pulls its content from the same `@/lib/termsContent` module that `TermsModal` already used — genuine reuse, not a duplicated copy.

All of the above was independently re-verified against the actual code (routes, controllers, and rendered JSX — not just component files existing in isolation) before writing this entry.

### Known schema-level technical debt (not yet addressed)

- `Barangay.redemptionMode` confirmed fully dead via codebase audit — zero references in any controller, route, or frontend file (only shows up in `schema.prisma` and one old migration). Superseded by per-Program redemption fields (`isCashMode`/`pointValue`/`cashValue`). Safe to remove in a future schema cleanup pass, not urgent.
- `hasCollectionRequests` schema default of `true` reconsidered as incorrect — not every barangay runs collection requests on a fixed schedule; should probably default to `false` like the other three module flags. Not yet changed.

### Still open for Super Admin

- Dashboard page — still a placeholder (`AdminHeaderCard title="Admin Dashboard" subtitle="Coming soon"`), content/design not yet decided.
- Settings page (Super Admin's own, distinct from the resident-side Settings just cleaned up) — doesn't exist yet, not yet designed.

### Parked, cross-cutting concerns

- **Image recognition approach**: adviser confirmed (per direct conversation) the constraint is "check what is suitable, as long as accurate and reliable" — not a strict ban on LLM-based approaches specifically. A general-purpose vision-capable LLM API (e.g. Claude) is being considered as a viable alternative to Teachable Machine, based on prior positive experience using it for a receipt-scanning feature in an unrelated project. Still needs an actual accuracy evaluation against the 5 target material classes (Aluminum Cans, Plastic Bottles/PET, Cardboard, Alak Bottles, Beer Bottles) before finalizing — not yet started.
- **Deployment**: Neon PostgreSQL schema still stale relative to local development (`prisma migrate deploy` not yet run against production). Hostinger VPS/PM2/Nginx setup not yet started.

### Found during this session's audit — not yet fixed, flagging so it isn't lost

- **`BarangayTable.jsx` (desktop table) rows are not actually clickable.** Each row has `hover:cursor-pointer` styling but the navigation handler is commented out behind a stale `// TODO: onClick={() => router.push(...)} once wired`. The mobile `BarangayCard` equivalent already has this wired for real (`handleClick={() => router.push(\`/barangay-accounts/${b.id}\`)}`), and the destination page (`[id]/page.jsx`) is fully built — so this is a straightforward one-line fix, not blocked on anything.
- Stray debug `console.log(...)` left in: `barangay-accounts/[id]/page.jsx` (`staffData`), resident `home/page.jsx` (`requestData`), `program-funds/page.jsx` (`modules`). Harmless but should be cleaned up before shipping.
- Duplicate/typo file `frontend/src/app/(admin)/admin-dashboard/paga.jsx` — not matched by Next.js routing (real file is `page.jsx`), holds an old "This is a temporary admin page" placeholder. Dead, safe to delete.
