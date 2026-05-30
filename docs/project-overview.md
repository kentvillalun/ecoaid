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

All resident data-driven pages work end-to-end (home, community, requests list, request detail, profile with edit mode). The barangay dashboard is partially wired; three stat cards remain hardcoded until MRF and Program Funds modules are built.

The system is deployed. Backend runs on Railway. Frontend proxies via next.config.mjs rewrites.

Active development focus: Manual Collection Intake module (Sunday EcoAid manual entry flow with resident search).

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
