# Color Token Migration Log

Tracks the rollout of the 16-token `@theme` system in `src/app/globals.css` across the codebase. Each entry lists the batch, files touched, and any color values that didn't cleanly map to a token.

## Pre-batch fix — dashboard/page.jsx regression

Note: this file was never part of Batch 1's scope (Card.jsx, Modal.jsx, Badge.jsx, StatusChip/StatusBadge, LabelValue, Empty, Error, Spinner, plus 18 form-field files). The `bg-primary`/`stroke-primary`/`text-primary` classes found here were pre-existing, referencing the old `--color-primary` token removed from the new `@theme` block — not a regression introduced during Batch 1.

**Files touched:** `src/app/(barangay)/dashboard/page.jsx`

- `bg-primary/20` → `bg-accent/20` (4x)
- `bg-primary/10` → `bg-accent/10` (8x)
- `stroke-primary` → `stroke-accent` (4x)
- `text-primary` (bare, on "All time total" / "Available funds" pills) → `text-accent` (4x)
- inline `style={{ border: "0.5px solid #49b02d" }}` → `style={{ border: "0.5px solid var(--color-accent)" }}` (4x)

No unmapped colors in this fix.

## Batch 2 — Navigation & layout

**Files touched:** `components/navigation/Sidebar.jsx`, `components/navigation/ResidentHeader.jsx`, `components/navigation/BarangayTopBar.jsx`, `components/navigation/ResidentBottomNav.jsx`, `components/layout/Page.jsx`, `components/ui/DesktopGuard.jsx`

- Sidebar.jsx: `hover:bg-cta-color/10` → `hover:bg-accent/10` (2x)
- ResidentHeader.jsx: `bg-white` → `bg-surface` (notification bell); inline `border: "0.5px solid #e5e7eb"` → `var(--color-border)` (2x, notification bell + header bottom border); `bg-new-bg` → `bg-bg` (this class was silently broken — `--color-new-bg` no longer exists in the new theme, renamed to `--color-bg`)
- BarangayTopBar.jsx: fixed missing-space bug (`${inter.className}text-text-primary` → `${inter.className} text-text-primary`, per your instruction — `text-text-primary` was never actually applying); `bg-new-bg` → `bg-bg` (same broken-class issue as ResidentHeader); inline border hex → `var(--color-border)`
- ResidentBottomNav.jsx: `bg-white` → `bg-surface`; `text-[#9DB2CE]` → `text-muted-accent`; `fill-cta-color` → `fill-accent` (4x); `text-cta-color` → `text-accent` (4x)
- layout/Page.jsx: gradient `from-[#FFFFFF] to-[#89D957]` → `from-surface to-accent-light`
- DesktopGuard.jsx: `bg-new-primary` → `bg-dark` (this class was also silently broken — `--color-new-primary` no longer exists, renamed to `--color-dark`)

**Unmapped / ambiguous colors found (left untouched):**
- `text-[#727272]` — ResidentHeader.jsx edit-pencil icon. Not in your mapping table; closest candidate is `text-text-secondary` but the hex doesn't match any listed value exactly.
- `fill-white` — ResidentBottomNav.jsx camera icon (floating capture button). Could arguably be `fill-surface` since both resolve to `#FFFFFF`, but "white" here may be intentionally literal against the accent gradient button rather than a themeable surface — flagging rather than guessing.
- `shadow-gray-400 shadow-md` — ResidentBottomNav.jsx floating capture button. Not a color-token migration case (shadow utility, not in your hex/class mapping table) and not named in your batch's "Fix:" list, so left as-is.

## Batch 3 — Auth + onboarding

**Files touched:** `app/(auth)/login/page.jsx`, `app/(auth)/signup/page.jsx`, `app/(auth)/otp/page.jsx`, `app/(auth)/forgot-password/page.jsx`, `app/(auth)/reset-password/page.jsx`, `app/(auth)/barangay/login/page.jsx`, `app/(intro)/onboarding/page.jsx`

- All 6 logo-badge circles (`bg-new-primary`, login/signup/otp/forgot-password/reset-password) → `bg-dark` (this class was silently broken — same `--color-new-primary` removal as DesktopGuard in Batch 2); login.jsx's full-page splash background also `bg-new-primary` → `bg-dark`
- All 6 "bottom sheet" form panels (`bg-white p-8 rounded-t-4xl`, one per auth page) + barangay/login's card panel → `bg-surface`
- `bg-cta-color` (redundant with `.gradient-button`, on every primary CTA button across all 7 files) → `bg-accent`
- `text-cta-color` / `stroke-cta-color` (links, back-arrow icons) → `text-accent` / `stroke-accent` throughout
- signup.jsx: barangay-suggestion dropdown `border-[#E7E3E0] bg-white` → `border-border bg-surface`
- otp.jsx: digit-box `outline-[#E7E3E0]` → `outline-border`; `focus:outline-cta-color` → `focus:outline-accent`
- onboarding.jsx: `text-new-primary` (Skip link) → `text-dark`; decorative blob `bg-[#74C85740]` (×3) → `bg-success/25` (25% alpha preserved from the original `40` hex-alpha suffix); active progress-dot `bg-cta-color` (×3) → `bg-accent`; all 3 Next/Get Started buttons `bg-cta-color` → `bg-accent`

**Unmapped / ambiguous colors found (left untouched):**
- `text-[#4C5F66]`, `text-[#1E1E1E]`, `hover:bg-[#F4F2F0]`, `text-[#A3A3A3]` — signup.jsx barangay-suggestion dropdown list (loading/empty state text, list item text, hover bg, city sub-label). None of these four hex values appear in your mapping table; closest conceptual match is text-secondary/border but I didn't want to guess given four distinct one-off values in a single small UI block.
- `text-green-600` — login.jsx (resend success message) and otp.jsx (resend success message). Semantically reads as "success," but your table only maps specific hex values (`#74C857`, `#89D95720`, `#dcfce7`/`#15803d`) to `text-success`/`bg-success`, not the Tailwind-named `green-600`. Flagging rather than assuming it should become `text-success`.
- `bg-[#D1D5DB]` — onboarding.jsx inactive progress dots (6 occurrences across all 3 steps). Not in your mapping table; no clear token candidate (it's a neutral gray distinct from `--color-border`'s `#e5e7eb`).

## Batch 4 — Resident-facing pages

**Files touched:** `app/(resident)/home/page.jsx`, `community/page.jsx`, `updates/page.jsx`, `capture/page.jsx`, `requests/page.jsx`, `requests/[id]/page.jsx`, `profile/page.jsx`, `profile/personal-information/page.jsx`, `profile/settings/page.jsx`, `profile/notifications/page.jsx`, `profile/help-support/page.jsx`

- `bg-new-bg` / `bg-new-bg!` → `bg-bg` / `bg-bg!` across every page's `<Page>` wrapper and `ResidentHeader` className prop (this class was silently broken everywhere — `--color-new-bg` no longer exists, renamed to `--color-bg` — same issue as Batch 2's nav components)
- `text-new-primary` (home.jsx FAQ banner) → `text-dark`
- `bg-cta-color`/`50`/`60`/`20`/`10`, `text-cta-color`, `stroke-cta-color`, `fill-cta-color`, `border-cta-color` → `-accent` equivalents throughout (home hero card decorative circles, rank pill, icon-chip icons, "View all"/"View more" links, capture success checkmark, updates read-more link, profile avatar ring, personal-information Save button)
- `bg-primary/20`, `stroke-primary`, `text-primary` (home.jsx rank pill — same old-token regression pattern as the dashboard fix) → `bg-accent/20`, `stroke-accent`, `text-accent`
- inline `style={{ border: "...#e5e7eb" }}` / `customBorder="...#e5e7eb"` (home.jsx ×3, personal-information.jsx) → `var(--color-border)`
- inline `style={{ border: "...#49b02d" }}` (home.jsx rank pill) → `var(--color-accent)`
- `bg-[#EAF7E3]` (home.jsx ×2, community.jsx ×2 icon chips) → `bg-accent-light`
- `border-[#E7E3E0]` (settings.jsx, notifications.jsx, personal-information.jsx ×6) → `border-border`
- `text-[#1F2937]` (home.jsx, requests/page.jsx) → `text-text-primary`
- `text-[#74C857]` (profile.jsx "try again" link) → `text-success`
- `bg-[#9DB2CE26]` (profile.jsx icon chips ×5) → `bg-muted-accent/15` (converted the `26` hex-alpha suffix to an equivalent `/15` opacity modifier, consistent with the Batch 1 approach for `statusStyles.js`)
- community.jsx registration-status badge: `bg-[#dcfce7] text-[#15803d]` / `bg-[#fee2e2] text-[#b91c1c]` → `bg-success/10 text-success` / `bg-error/10 text-error`
- requests/[id]/page.jsx: `bg-cta-color` (timeline dot fallback) → `bg-accent`

**Unmapped / ambiguous colors found (left untouched):**
- `bg-green-500/70` (toggle ON) and `bg-[#EFEFEF]` (toggle OFF) — duplicated identically in `profile/notifications/page.jsx` and `profile/settings/page.jsx`. Reads as "success" semantically but neither value is in your mapping table (Tailwind-named `green-500`, and `#EFEFEF` isn't one of the listed grays) — flagging rather than guessing, same as the Batch 3 `text-green-600` case.
- Two commented-out (dead) code blocks in `home/page.jsx` (lines 66, 115) still reference the old `#e5e7eb` / `text-new-primary` — left untouched since they're inactive JSX comments, not rendered UI.

## Batch 5 — Barangay modules pt.1

**Files touched:** `app/(barangay)/collection-requests/page.jsx`, `collection-requests/[id]/page.jsx`, `manual-intake/page.jsx`, `material-stock/page.jsx`

- `bg-new-bg` / `bg-new-bg!` → `bg-bg` / `bg-bg!` (broken-class issue, same as Batches 2 and 4)
- `bg-primary` (collection-requests/[id] timeline dot, material-stock stat pills ×2) → `bg-accent`
- `stroke-new-primary` (manual-intake, material-stock stat-card icons) → `stroke-dark`
- `bg-white` → `bg-surface` (manual-intake resident-search dropdown + material-row card; material-stock category-tab pill)
- `stroke-cta-color` / `text-cta-color` → `stroke-accent` / `text-accent` (DetailHeader icons, "All categories"/pieces-count stat pills)
- `border-[#E6EFF5]` (table header dividers, both files) → `border-border`
- `hover:bg-[#f8f8f8]` (table row hover, both files) → `hover:bg-bg`
- material-stock: `text-[#6b7280]` / `stroke-[#6b7280]` (stat labels/icons ×2) → `text-text-secondary` / `stroke-text-secondary`; `containerColor="#f3f4f6"` (×2, `IconContainer` prop) → `containerColor="var(--color-icon-bg)"`

**Unmapped / ambiguous colors found:** none in this batch — every hardcoded value present had a clear match in your table. (Note: material-stock's `CATEGORY_STYLES` map for Plastics/Papers/Metals/Bottles uses Tailwind-named colors — blue/yellow/gray/emerald — not hex codes, so it fell outside your mapping table entirely and wasn't touched; flagging for awareness, not as an unmapped-hex case.)

## Batch 6 — Barangay modules pt.2

**Files touched:** `app/(barangay)/program-funds/page.jsx`, `components/program-funds/AddExpenseModal.jsx`, `app/(barangay)/junkshop-sales/page.jsx`, `components/junkshop-sales/modals/{JunkshopDetailModal,RecordSaleModal,AddJunkshopModal}.jsx`, `app/(barangay)/redemption/page.jsx`, `redemption/transactions/[id]/page.jsx`, `redemption/programs/[id]/page.jsx`, `components/redemption/{TransactionCard,TransactionTable}.jsx`, `components/redemption/modals/{RecordTransactionModal,AddProgramModal}.jsx`, `app/(barangay)/reward-inventory/page.jsx`, `components/reward/{ReleaseRewardModal,AddRewardItemModal}.jsx`, `components/requests/actions/PendingActions.jsx`

I treated each module's own modal components (under `components/program-funds/`, `components/junkshop-sales/`, `components/redemption/`, `components/reward/`) as in-scope for this batch, since they're used exclusively by these pages and leaving them un-migrated would mean a module's table page repaints correctly while its own "Add/Edit" modal stays broken. Flagging this interpretation in case you wanted strictly the four `page.jsx` files.

- `bg-new-bg!` → `bg-bg!` (every page's `<Page>` wrapper)
- `text-[#6b7280]` / `stroke-[#6b7280]` → `text-text-secondary` / `stroke-text-secondary` (stat-card labels/icons, all 3 pages)
- `containerColor="#f3f4f6"` and the `"#f3f4f640"` alpha variant (junkshop-sales best-price rows) → `containerColor="var(--color-icon-bg)"` (the alpha variant was simplified to the flat token — the extra transparency looked like an unintentional one-off, not a deliberate second icon-chip style)
- `bg-primary/10`, `stroke-cta-color`, `text-cta-color` → `bg-accent/10`, `stroke-accent`, `text-accent` (stat pills, DetailHeader icons, links, table "Best price" header) — used throughout all three pages plus every listed modal's header icon
- `stroke-new-primary` → `stroke-dark` (junkshop modal header icons)
- `border-[#E6EFF5]` / `hover:bg-[#f8f8f8]` → `border-border` / `hover:bg-bg` (table headers/row-hover, all three pages plus TransactionTable.jsx)
- `bg-white` → `bg-surface` (dropdown panels, material-row cards, junkshop category-tab-style cards across manual-intake-style modals)
- `text-[#1F2937]` / `text-[#6B7280]` (TransactionCard.jsx) → `text-text-primary` / `text-text-secondary`
- AddProgramModal.jsx: `focus-within:outline-[#74C857]` (Redemption-mode "Cash" radio card) → `focus-within:outline-accent`, **not** `outline-success`. This is the same recurring "wrong hex used for the accent focus ring" bug fixed identically in Batch 1 (capture.jsx, PendingActions.jsx) — treating `#74C857` here as literally "success" per the table would be semantically wrong for a focus outline, so I followed the Batch 1 precedent instead of the literal table entry. Flagging this deviation explicitly.
- PendingActions.jsx: reject button `bg-red-500 hover:bg-red-600` → `gradient-button-red` (per your instruction)

**Unmapped / ambiguous colors found (left untouched):**
- program-funds/page.jsx: `text-green-600`/`text-red-600`, `bg-green-50`/`bg-red-50`, `stroke-green-600/700`/`stroke-red-600/700`, `text-green-700`/`text-red-700` — the entire Income/Expense color scheme (5+ occurrences). Same Tailwind-named-color issue as Batch 3/4's `text-green-600` — semantically success/error but not literal hex-table matches.
- junkshop-sales/page.jsx: `text-green-800` (best-price mobile highlight) — same pattern, different shade than the `green-600` cases elsewhere, compounding the existing shade-inconsistency already noted in the original audit.

## Batch 7 — Barangay modules pt.3 + stragglers

**Files touched:** `app/(barangay)/residents/page.jsx`, `leaderboard/page.jsx`, `announcements/page.jsx`, `reports/page.jsx`, `settings/page.jsx`, `components/announcements/{CreateAnnouncementModal,AnnouncementDetailModal}.jsx`, `app/not-found.jsx`, `app/(barangay)/manifest.json`

- `bg-new-bg` / `bg-new-bg!` → `bg-bg` / `bg-bg!`; `text-[#6b7280]`/`stroke-[#6b7280]` → `text-text-secondary`/`stroke-text-secondary`; `containerColor="#f3f4f6"` → `var(--color-icon-bg)`; `bg-primary/10` → `bg-accent/10`; `stroke-cta-color`/`text-cta-color` → `stroke-accent`/`text-accent`; `border-[#E6EFF5]` → `border-border`; `hover:bg-[#f8f8f8]` → `hover:bg-bg` — same pattern as every prior barangay batch, applied across all 5 pages
- `stroke-new-primary` (announcement modal header icons) → `stroke-dark`
- leaderboard/page.jsx additionally: added the missing `Inter`/`next/font/google` import + applied `${inter.className}` to the desktop table `Card` (per your instruction — this was the one barangay page with no Inter import at all); filter-pill/dropdown `bg-white` → `bg-surface`; `border-[#e5e7eb]` → `border-border`; `bg-[#f3f4f6]` (rank-pill background) → `bg-icon-bg`
- reports/page.jsx: bar-chart non-peak bars and legend swatch `bg-[#e5e7eb]` → `bg-border` (exact value match to `--color-border`, applied as a background rather than a border since Tailwind v4 generates both variants from the same token)
- **not-found.jsx fully rebuilt on tokens** (all 7 original hex values): `bg-[#F8FBF4]`→`bg-bg`, `text-[#74C857]`→`text-accent` **(not `text-success`, see note below)**, `text-[#1F2937]`→`text-text-primary`, `text-[#6B7280]`→`text-text-secondary`, `bg-primary`→`bg-accent`, `border-[#CFE8C7]`→`border-accent-light`, `bg-white`→`bg-surface`, `text-[#2F6F1D]`→`text-accent`, `hover:bg-[#F2FAEE]`→`hover:bg-accent-light`. The page copy ("EcoProfit" eyebrow label) was left unchanged — only the manifest app name was named in your instructions.
- `app/(barangay)/manifest.json`: `theme_color`/`background_color` `#a8e063` → `#092517`; `name`/`short_name` `"EcoProfit"` → `"EcoAid"` (matching the resident-side manifest exactly). I also updated the `description` field's "EcoProfit turns waste..." text to "EcoAid" for consistency — this wasn't explicitly named in your instruction (only "app name"), flagging as a minor scope extension since leaving it would have been visibly self-contradictory right next to the corrected name field.

**Deviation from literal table mapping:** not-found.jsx's `text-[#74C857]` and `text-[#2F6F1D]` were mapped to `text-accent`, not `text-success`, despite `#74C857` being listed as a success-color trigger in your table. Same reasoning as the Batch 6 AddProgramModal case: this is the recurring legacy "brand green" bug (an eyebrow label and a secondary-button text color — both decorative/branding, not status indicators), so treating it as literal "success" would be semantically wrong. Flagging for your review in case you intended a literal mapping regardless of context.

**Unmapped / ambiguous colors found (left untouched):**
- reports/page.jsx: `border-[#f3f4f6]` (chart legend divider, table row divider ×2) — `#f3f4f6` is only mapped to `bg-icon-bg` for backgrounds in your table; no clear border equivalent, so left as-is rather than guessing.
- leaderboard/page.jsx: `hover:border-[#d1d5db]` (filter pill hover state) — `#d1d5db` isn't in your table.

**Critical finding — flagging per your "flag, don't fix" rule, not touched:**
- **`app/(barangay)/dashboard/page.jsx` is still broken beyond the pre-batch fix.** I only fixed the `bg-primary`/`stroke-primary`/`text-primary` regression at the start of this session. This same file still has `bg-new-bg!` (1x), `bg-cta-color/60` and `/50` (4x, hero-card decorative circles), `stroke-cta-color` (6x, stat-pill icons), and `text-cta-color` (6x, stat-pill labels) — all referencing tokens that no longer exist in your `@theme` block. Dashboard was marked "already covered" in your batch list, but it was not fully migrated; these classes are currently rendering with no color at all. Not fixed here since dashboard wasn't named in any batch and I was told not to fix outside named scope — recommend a dedicated pass.
- **`components/requests/RequestCard.jsx`** — `ring-cta-color` (1x, selected-card ring on one of its two variants). Shared component (used by both resident and barangay request lists), not named in any batch.
- **`components/ui/SearchInput.jsx`** — `bg-cta-color/5`, `border-cta-color`, `stroke-cta-color`, `text-cta-color`, `placeholder-cta-color` (5 distinct broken references in one small component). Shared component, not named in any batch, but likely rendering with no visible focus/icon color currently.
- `components/ui/Empty.jsx` has one broken `text-cta-color` reference too, but it's inside a commented-out (dead) code block — no runtime impact.

## Cleanup pass — flagged items fixed + icon-color standardization

**Files touched:** `dashboard/page.jsx`, `components/requests/RequestCard.jsx`, `components/ui/SearchInput.jsx`, plus 8 files with `stroke-dark`/`stroke-black` section-header icons, plus 7 auth/onboarding files with a second missed `bg-new-bg` `<Page>` wrapper.

- **dashboard/page.jsx** (the file flagged as still-broken): `bg-new-bg!`→`bg-bg!`; `bg-cta-color/60`/`/50`→`bg-accent/60`/`/50`; `stroke-cta-color`→`stroke-accent`; `text-cta-color`→`text-accent`; `stroke-[#6b7280]`→`stroke-text-secondary`; `containerColor={"#f3f4f6"}`→`containerColor={"var(--color-icon-bg)"}`. This makes dashboard's stat-card pills match every other page's identical pattern exactly.
- **RequestCard.jsx**: the two "selected card" ring variants were inconsistent with each other (`ring-1 ring-cta-color` vs `ring-2 ring-[#74C857]`) — standardized both to `ring-1 ring-accent`.
- **SearchInput.jsx**: `bg-cta-color/5`, `border-cta-color`, `stroke-cta-color`, `text-cta-color`, `placeholder-cta-color` → `-accent` equivalents (5 broken references in one component, now fixed).
- **Stat-card icon + subtext pill consistency** (user request): confirmed every stat-card pill across dashboard, program-funds, junkshop-sales, material-stock, reward-inventory, reports, residents, redemption, leaderboard, announcements now uses the identical `bg-accent/10` pill + `stroke-accent` icon + `text-accent` label pattern, and every `IconContainer`'s small `ArrowUpRightIcon` uses `stroke-text-secondary` + `containerColor="var(--color-icon-bg)"` consistently. Dashboard was the only holdout; now fixed.
- **Section/modal header icon consistency** (user request): every icon passed to `SectionHeader`, `DetailHeader`, `RequestDetailHeader`, `BarangayHeaderCard`, and `Modal`'s `icon` prop across the entire codebase now uses `stroke-accent`. Converted 7 `stroke-dark` icons (material-stock, manual-intake, both announcement modals, both junkshop-detail/add modals, RecordSaleModal) and 8 `stroke-black` icons (RequestDetailHeader, RecordTransactionModal, AddProgramModal, PendingActions, InProgressActions, personal-information's discard-confirm modal, both redemption programs/transactions DetailHeaders) to match. One `stroke-black` inside a dead comment in `Modal.jsx` was left alone (inactive).
- **Second wave of missed `bg-new-bg`**: found and fixed a second `<Page>` wrapper (the `lg:hidden` mobile-only view) in `login`, `signup`, `otp`, `forgot-password`, `reset-password`, `barangay/login`, and `onboarding` that Batch 3 missed — each page actually renders two `<Page>` trees (mobile + desktop-redirect stub) and only the first was caught during the batch pass.

**Note for your review:** standardizing `personal-information.jsx`'s discard-confirmation modal icon (`ExclamationTriangleIcon`, a destructive-action warning) to the same green `stroke-accent` as every other header icon was applied literally per your "all section headers" instruction — but a warning/destructive icon in brand-accent green may read oddly next to the `gradient-button-red` discard button. Flagging in case you'd rather keep destructive-modal icons on a distinct (e.g. error-token) color as an intentional exception.

Full-project verification after this pass: zero remaining `cta-color`/`new-primary`/`new-bg` references outside two inactive JSX comments (`Empty.jsx`, `home/page.jsx`), and zero `stroke-black` outside one inactive comment (`Modal.jsx`). ESLint run across every touched directory reports no parsing/syntax errors.
