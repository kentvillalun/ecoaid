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

**Material Stock (MRF) is built end-to-end.** `/material-stock` nets `StockTransactionLog` rows per material into a live balance, lists the full transaction log, and supports manual stock-out adjustments via a modal. The ledger currently only receives entries from Manual Intake and manual adjustments — pickup-request collections and redemption transactions don't write to it yet, even though the `Source` enum already reserves values for both.

**Junkshop Sales, Announcements, Leaderboard, Program Funds, and Reward Inventory modules are all built end-to-end**, alongside Settings (theme picker, add material/junkshop), Notifications, the barangay-side Residents module, and Resident Standings. The barangay dashboard's stat cards are now fully wired to real data (previously three were hardcoded pending Program Funds).

**Reports module is complete end-to-end, including Excel export.** `/reports` has four independently-filterable sections (Material Stock/MRF Inventory, Collection & Intake, Redemption & Rewards, Program Funds), each with its own date-range picker. A single "Export all" button generates a 4-sheet Excel workbook (`exceljs`) covering all sections at their currently-selected date ranges. Query logic is shared between the live filter and the export endpoint via `backend/src/utils/reportHelpers.js`.

**Role-based authorization with automatic role-scoped interfaces is in place.** A single `ROLE_MATRIX` (`frontend/src/lib/roles.js`) maps every barangay route to the staff roles allowed to access it. The Next.js middleware (`proxy.js`) verifies the `barangay_token` JWT at the edge and redirects to `/403` when the logged-in role can't access the requested route; the Sidebar filters navigation items against the same matrix so a role only ever sees the modules it's permitted to use; barangay login redirects each role to the first route it can access rather than a hardcoded `/dashboard`. Dev seed data now includes one staff account per role (CAPTAIN, SECRETARY, TREASURER, SK, COLLECTOR) for testing.

The system is deployed. Backend runs on Railway. Frontend proxies via next.config.mjs rewrites.

Active development focus: Super Admin module — a full UI (not yet started) for toggling each barangay's `has___` feature flags, plus conditional rendering on the barangay-facing side so a barangay without a given flag doesn't see that module.

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
