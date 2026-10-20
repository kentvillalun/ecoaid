# Project Overview

## Title
EcoAid: A Web Recycling Waste Management System with Image Recognition

---

## Description

EcoAid is a system designed to automate the process of collecting, managing, and utilizing recyclable materials in a barangay.

The system supports:
- community participation in waste contribution
- household collection of recyclables
- event-based and barangay-based intake
- material tracking and utilization
- redemption programs (waste-to-goods/services/medicine)
- financial tracking of expenses, income/proceeds, and profits
- reporting and transparency

---

## Current Development Status

Full resident and barangay authentication flows are complete and stable (username-based login, OTP, forgot password, split `authenticateResident`/`authenticateBarangay` middleware). The login page has a splash screen with session-aware redirect logic. The app ships a PWA-ready web manifest for mobile installation.

**Schema overhaul complete.** The `MaterialType` enum is replaced by a `Material` DB model with a `Category` model for grouping. `WeightUnit` is replaced by a `Unit` enum (KG/GRAMS/LBS/PIECE). All FK references in `PickupRequests`, `CollectionItem`, and `ProgramMaterial` now point to `Material`. Field names also changed: `estimatedWeight` → `estimatedValue`, `weightUnit` → `estimatedUnit`, `actualWeight` → `actualValue`. A `Material` endpoints group was added (`GET /materials/`, `GET /materials/barangay`, `GET /materials/categories`). The `Barangay` model now has `redemptionMode`, feature flags (`hasCollectionRequests`, etc.), and extended address fields.

The full collection request lifecycle is wired end-to-end: REQUESTED → APPROVED → IN_PROGRESS → COLLECTED (or REJECTED), including batch collection and decline modal. Material selection in the capture page and collection flow uses real `Material` DB records. A `DesktopGuard` component restricts resident pages to mobile viewports.

The Redemption Management module is complete end-to-end and restructured. The route moved from `/redemption-programs` to `/redemption`. Programs now support both points and cash reward modes (`isCashMode`). `ProgramMaterial` stores both `pointValue` and `cashValue`. `RedemptionTransaction` uses a `RedemptionTransactionItem` line-item model. The transaction detail page (`/redemption/transactions/[id]`) is built and wired. The program detail page is at `/redemption/programs/[id]`.

All resident data-driven pages work end-to-end (home, community, requests list, request detail, profile with edit mode). The barangay dashboard is partially wired; three stat cards remain hardcoded until the Program Funds module is built and the dashboard is rewired.

**Manual Collection Intake is built end-to-end.** Barangay staff record Sunday EcoAid (or any direct) intake by searching for a resident or falling back to a household name, then adding material/quantity/unit rows. Each submission creates a `ManualIntakeTransaction` + `ManualIntakeItems` and writes `IN` rows to a new `StockTransactionLog` ledger.

**MRF Inventory is built end-to-end** (renamed from Material Stock; mounted at `/mrf-inventory`). It nets `StockTransactionLog` rows per material into a live balance, lists the full transaction log with a running balance, and supports manual stock-out adjustments via a modal. The ledger is now written by all five sources: manual intake, pickup-request collection, redemption transactions, manual adjustments and junkshop sales.

**Junkshop Sales, Announcements, Leaderboard, Program Funds, and Reward Inventory modules are all built end-to-end**, alongside Settings (theme picker, add material/junkshop), Notifications, the barangay-side Residents module, and Resident Standings. The barangay dashboard's stat cards are now fully wired to real data (previously three were hardcoded pending Program Funds).

**Reports module is complete end-to-end, including Excel export.** `/reports` has four independently-filterable sections (Material Stock/MRF Inventory, Collection & Intake, Redemption & Rewards, Program Funds), each with its own date-range picker. A single "Export all" button generates a 4-sheet Excel workbook (`exceljs`) covering all sections at their currently-selected date ranges. Query logic is shared between the live filter and the export endpoint via `backend/src/utils/reportHelpers.js`.

**Role-based authorization with automatic role-scoped interfaces is in place.** A single `ROLE_MATRIX` (`frontend/src/lib/roles.js`) maps every barangay route to the staff roles allowed to access it. The Next.js middleware (`proxy.js`) verifies the `barangay_token` JWT at the edge and redirects to `/403` when the logged-in role can't access the requested route; the Sidebar filters navigation items against the same matrix so a role only ever sees the modules it's permitted to use; barangay login redirects each role to the first route it can access rather than a hardcoded `/dashboard`. Dev seed data now includes one staff account per role (CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR) for testing.

**Super Admin module is built end-to-end**, as a separate platform-level portal from barangay staff (its own `SUPER_ADMIN` role, `admin_token` cookie, `authenticateSuperAdmin` middleware, `(admin)` frontend route group, mounted at `/admin` on the backend). Super Admin can register/edit barangays (name, address, contact, theme preset, and the four `has___` feature flags), manage each barangay's sitios and staff accounts, and see a dashboard of which barangays are missing a required staff role (CAPTAIN/SECRETARY/TREASURER) or have zero sitios. The `has___` feature flags this module manages are now actually consumed on the barangay-facing side (`frontend/src/lib/getBarangayModules.js`), filtering Sidebar navigation (combined with `ROLE_MATRIX`) and gating a few pages directly — though this enforcement hasn't yet been audited across every module for direct-URL access the way `ROLE_MATRIX` is.

**AI-assisted recyclable classification is live on the resident capture flow.** After taking a photo, a resident can tap "Analyze Photo" to have Claude (`claude-sonnet-5`) identify the material against a fixed, hand-maintained catalog (`CORE_MATERIALS`) and estimate its quantity; the result auto-fills the material, category, estimated value/unit, and notes fields, with a manual fallback if classification fails or is skipped. The image is compressed client-side before both classification and the Cloudinary upload. The classification endpoint is rate-limited (5 requests/min per caller) since each call is a paid API request — the only endpoint in the system with rate limiting so far.

A real cross-tenant IDOR was found and fixed in this period: pickup-request and redemption-program lookups by id alone let a barangay admin view/mutate another barangay's records; queries are now scoped to the caller's own `barangayId`.

The system is deployed. Backend runs on Render (moved off Railway). Frontend proxies via next.config.mjs rewrites.

**October 2026: redemption made visible to residents, then overhauled around the resident.** In response to adviser feedback, residents now have a Programs page (`/programs`, also previewed on the Barangay tab) showing active programs, their accepted materials and available rewards. Staff can tick "Announce this program" when creating a program to post an announcement automatically. Field feedback from the barangay then changed the model: the separate `Beneficiary` table was removed and the **resident is now the beneficiary** of redemption transactions and reward releases (`residentId`). Points are no longer stored anywhere; the balance is computed per resident per program from their own history (`backend/src/utils/residentPoints.js`). The unused educational-level field was removed, the redemption mode is locked once a program has transactions, and a material that already has transactions can no longer be removed from its program. Reports, the reward release flow and the program filters on the Reward Inventory page follow the new model, and staff can now be recorded in manual intake so their attendance contributions are traceable.

The core material list changed to match what the pilot barangay collects: `Alak Bottles` and `Beer Bottles` were replaced by `Gin Bottle (2x2)`, `Round Bottle (Bilog)`, `Ketchup Bottle` and `Liquor Bottle (Long Neck)`, and `Cans (Lata)` and `Scrap Metal (Landok)` were added; `Tin Cans` is now counted by kilogram. Because the AI classification only recognizes the core list, this is also a documented delimitation of the study.

Several robustness fixes landed in the same period: sessions of deleted users are rejected, dashboard queries are scoped to the staff's barangay, error boundaries (`error.jsx`, `global-error.jsx`) and shared unauthorized-session handling were added after an intermittent white screen, and the seed file was refactored (separate functions for super admin, barangay test accounts, core materials and a sample resident).

The resident home screen now shows each resident their own points in a program they can switch between, using the same two-stat card layout as the barangay dashboard. The same points are shown on every card of the Programs page. Active development focus: the field evaluation in a real barangay (planned for Nov 8, 2026) using real operations plus scripted scenarios for the modules the barangay does not use daily. After that, the technical-debt backlog (feature-flag enforcement beyond the Sidebar, rate limiting/hardening on the rest of the API, pagination) — see `docs/current-progress.md` for the current priority order.

---

## Core Idea

Residents contribute recyclable materials through a unified intake model.

The barangay:
- collects and records materials
- sorts them immediately during collection or intake
- tracks materials in the MRF
- uses materials for:
  - sale (future junkshop partnership)
  - barangay projects
  - shredding/hollow blocks
  - beautification
  - redemption and community programs

---

## Key Principle

> Identification and sorting happen during collection or intake.

This ensures:
- clean data
- immediate reward eligibility
- no delayed processing

---

## Collection Context

There are different ways materials enter the system:

- Sunday EcoAid household collection
- Override / on-demand pickup requests
- Event-based collection
- Barangay hall exchange or direct submission

All materials are recorded as Contribution / Intake transactions using one of these source types:

- SUNDAY_ECOAID
- PICKUP_REQUEST
- EVENT_COLLECTION
- BARANGAY_EXCHANGE

Pickup requests follow this lifecycle:

REQUESTED -> APPROVED -> IN_PROGRESS -> COLLECTED
           ->
            REJECTED

Batch collection moves approved requests into IN_PROGRESS before materials are collected, sorted, and recorded.
